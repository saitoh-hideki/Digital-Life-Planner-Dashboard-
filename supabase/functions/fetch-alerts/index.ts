import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
}

interface AlertData {
  source: '警察庁' | '消費者庁'
  title_original: string
  summary_original?: string
  published_at: string
  url: string
  severity: 'critical' | 'high' | 'info'
  category: 'phishing' | 'scam' | 'recall' | 'gov_notice'
  title_ja?: string
  summary_ja?: string
  url_hash: string
}

// RSSフィードの設定
const RSS_FEEDS = [
  {
    url: 'https://www.caa.go.jp/news.rss',
    source: '消費者庁' as const,
    category: 'gov_notice' as const
  },
  {
    url: 'https://www.kportal.caa.go.jp/rss.xml',
    source: '消費者庁' as const,
    category: 'gov_notice' as const
  }
  // 警察庁のRSSは後で追加予定
]

// 重要度判定の簡易ロジック
function determineSeverity(title: string, description: string): 'critical' | 'high' | 'info' {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('詐欺') || text.includes('フィッシング') || text.includes('不正') || text.includes('緊急')) {
    return 'critical'
  }
  if (text.includes('注意') || text.includes('リコール') || text.includes('悪質')) {
    return 'high'
  }
  return 'info'
}

// カテゴリ判定
function determineCategory(title: string, description: string): 'phishing' | 'scam' | 'recall' | 'gov_notice' {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('フィッシング') || text.includes('偽サイト')) {
    return 'phishing'
  }
  if (text.includes('詐欺') || text.includes('悪質商法')) {
    return 'scam'
  }
  if (text.includes('リコール') || text.includes('返品') || text.includes('交換')) {
    return 'recall'
  }
  return 'gov_notice'
}

// URLハッシュ生成（簡易版）
function generateUrlHash(url: string): string {
  return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const allItems: RSSItem[] = []

    console.log(`Processing ${RSS_FEEDS.length} RSS feeds for alerts`)

    // RSSフィードを取得
    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Fetching RSS from: ${feed.url}`)
        const response = await fetch(feed.url)
        
        if (!response.ok) {
          console.error(`Failed to fetch ${feed.url}: ${response.status}`)
          continue
        }
        
        const text = await response.text()
        
        // 簡易XMLパース
        const items = text.match(/<item>(.*?)<\/item>/gs) || []
        
        console.log(`Found ${items.length} items in ${feed.url}`)
        
        for (const item of items.slice(0, 10)) { // 最大10件
          const title = item.match(/<title>(.*?)<\/title>/s)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || ''
          const description = item.match(/<description>(.*?)<\/description>/s)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || ''
          const link = item.match(/<link>(.*?)<\/link>/s)?.[1] || ''
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || new Date().toISOString()
          
          if (title && link) {
            allItems.push({
              title: title.trim(),
              description: description.trim(),
              link: link.trim(),
              pubDate: pubDate.trim()
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching ${feed.url}:`, error)
      }
    }

    console.log(`Total items found: ${allItems.length}`)

    // アイテムを処理してデータベースに保存
    let processedCount = 0
    let duplicateCount = 0
    
    for (const item of allItems) {
      try {
        const publishedAt = new Date(item.pubDate)
        const urlHash = generateUrlHash(item.link)
        
        // 重複チェック
        const { data: existing } = await supabase
          .from('alerts')
          .select('id')
          .eq('url_hash', urlHash)
          .single()
        
        if (existing) {
          duplicateCount++
          continue
        }

        // 重要度とカテゴリを判定
        const severity = determineSeverity(item.title, item.description)
        const category = determineCategory(item.title, item.description)
        
        // 発信元を判定（URLから）
        let source: '警察庁' | '消費者庁' = '消費者庁'
        if (item.link.includes('npa.go.jp')) {
          source = '警察庁'
        }

        // アラートデータを作成
        const alertData: AlertData = {
          source,
          title_original: item.title,
          summary_original: item.description,
          published_at: publishedAt.toISOString(),
          url: item.link,
          severity,
          category,
          title_ja: item.title, // 日本語RSSなのでそのまま
          summary_ja: item.description,
          url_hash: urlHash
        }

        // データベースに挿入
        const { error: insertError } = await supabase
          .from('alerts')
          .insert(alertData)
        
        if (insertError) {
          console.error(`Failed to insert alert: ${item.title}`, insertError)
        } else {
          processedCount++
          console.log(`Inserted new alert: ${item.title}`)
        }
      } catch (error) {
        console.error(`Error processing item: ${item.title}`, error)
      }
    }

    // 古いアラートをアーカイブ（30日以上前）
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { error: deleteError } = await supabase
        .from('alerts')
        .delete()
        .lt('published_at', thirtyDaysAgo.toISOString())
      
      if (deleteError) {
        console.error('Error deleting old alerts:', deleteError)
      } else {
        console.log('Cleaned up old alerts')
      }
    } catch (error) {
      console.error('Error cleaning up old alerts:', error)
    }

    console.log(`Processing complete. Processed: ${processedCount}, Duplicates: ${duplicateCount}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        duplicates: duplicateCount,
        total: allItems.length,
        message: `Processed ${processedCount} new alerts, ${duplicateCount} duplicates found`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
