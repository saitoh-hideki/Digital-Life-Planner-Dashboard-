import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const NEWS_FEED_URLS = Deno.env.get('NEWS_FEED_URLS') || 'https://newsonjapan.com/rss/top.xml'

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables')
    }

    const feedUrls = NEWS_FEED_URLS.split(',').map(url => url.trim())
    const allItems: RSSItem[] = []

    console.log(`Processing ${feedUrls.length} RSS feeds`)

    // Fetch RSS feeds
    for (const feedUrl of feedUrls) {
      try {
        console.log(`Fetching RSS from: ${feedUrl}`)
        const response = await fetch(feedUrl)
        
        if (!response.ok) {
          console.error(`Failed to fetch ${feedUrl}: ${response.status}`)
          continue
        }
        
        const text = await response.text()
        
        // Simple XML parsing for RSS
        const items = text.match(/<item>(.*?)<\/item>/gs) || []
        
        console.log(`Found ${items.length} items in ${feedUrl}`)
        
        for (const item of items.slice(0, 5)) { // Get max 5 items per feed
          const title = item.match(/<title>(.*?)<\/title>/s)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || ''
          const description = item.match(/<description>(.*?)<\/description>/s)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || ''
          const link = item.match(/<link>(.*?)<\/link>/s)?.[1] || ''
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || new Date().toISOString()
          
          if (title) {
            allItems.push({
              title: title.trim(),
              description: description.trim(),
              link: link.trim(),
              pubDate: pubDate.trim()
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching ${feedUrl}:`, error)
      }
    }

    console.log(`Total items found: ${allItems.length}`)

    // Process items and save to database
    const supabaseHeaders = {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let processedCount = 0
    let duplicateCount = 0
    
    for (const item of allItems) {
      try {
        const publishedAt = new Date(item.pubDate)
        const isToday = publishedAt >= today
        
        // Generate AI summary if OpenAI key is available
        let aiSummary = null
        if (OPENAI_API_KEY) {
          try {
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'あなたは生活者に寄り添うデジタルライフプランナーです。英語のニュースを日本語で以下の形式で回答してください：\n\n【要約】\nニュースの内容を2-3行で正確に日本語で要約\n\n【DLP学習ポイント】\n生活者支援のために知っておくべきポイントを1-2行で日本語で'
                  },
                  {
                    role: 'user',
                    content: `タイトル: ${item.title}\n内容: ${item.description}`
                  }
                ],
                max_tokens: 400,
                temperature: 0.7
              })
            })
            
            if (openaiResponse.ok) {
              const aiResult = await openaiResponse.json()
              aiSummary = aiResult.choices?.[0]?.message?.content
            }
          } catch (error) {
            console.error('OpenAI API error:', error)
          }
        }
        
        // Check for duplicates
        const checkResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/topics?source_url=eq.${encodeURIComponent(item.link)}`,
          {
            headers: supabaseHeaders
          }
        )
        
        if (checkResponse.ok) {
          const existing = await checkResponse.json()
          
          if (!existing || existing.length === 0) {
            // Insert new topic
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/topics`, {
              method: 'POST',
              headers: supabaseHeaders,
              body: JSON.stringify({
                headline: item.title,
                summary: item.description.substring(0, 500),
                source_url: item.link,
                published_at: publishedAt.toISOString(),
                is_today: isToday,
                ai_summary: aiSummary,
                source_name: new URL(item.link).hostname.replace('www.', '')
              })
            })
            
            if (insertResponse.ok) {
              processedCount++
              console.log(`Inserted new topic: ${item.title}`)
            } else {
              console.error(`Failed to insert topic: ${item.title}`)
            }
          } else {
            duplicateCount++
          }
        }
      } catch (error) {
        console.error(`Error processing item: ${item.title}`, error)
      }
    }

    // Update yesterday's topics to not be "today"
    try {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/topics?is_today=eq.true&published_at=lt.${today.toISOString()}`,
        {
          method: 'PATCH',
          headers: supabaseHeaders,
          body: JSON.stringify({ is_today: false })
        }
      )
      
      if (updateResponse.ok) {
        console.log('Updated yesterday topics')
      }
    } catch (error) {
      console.error('Error updating yesterday topics:', error)
    }

    console.log(`Processing complete. Processed: ${processedCount}, Duplicates: ${duplicateCount}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        duplicates: duplicateCount,
        total: allItems.length,
        message: `Processed ${processedCount} new items, ${duplicateCount} duplicates found`
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