import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // subsidies_sheetからデータ取得
    const { data: sheetData, error: sheetError } = await supabase
      .from('subsidies_sheet')
      .select('*')
      .order('created_at', { ascending: true })

    if (sheetError) {
      throw new Error(`Failed to fetch subsidies_sheet: ${sheetError.message}`)
    }

    if (!sheetData || sheetData.length === 0) {
      return NextResponse.json({ 
        message: 'No data in subsidies_sheet', 
        processed: 0 
      })
    }

    let processed = 0
    let skipped = 0
    let periodParseSuccess = 0
    let amountParseSuccess = 0

    // 各レコードを処理
    for (const record of sheetData) {
      try {
        // 期間解析
        const { start: apply_start, end: apply_end } = parsePeriod(record.period || '')
        if (apply_start && apply_end) periodParseSuccess++
        
        // 金額抽出
        const { min: amount_min, max: amount_max } = extractAmount(record.amount || '')
        if (amount_min || amount_max) amountParseSuccess++
        
        // 正規化データ作成
        const normalized = {
          source_row_id: record.row_id,
          name: record.name,
          summary: record.summary || '',
          issuer: record.organization || '',
          audience: record.target_audience || '',
          url: record.url || '',
          apply_start,
          apply_end,
          status: normalizeStatus(record.status || ''),
          prefecture: null, // 現状は空
          municipality: null, // 現状は空
          amount_text: record.amount || '',
          amount_min,
          amount_max
        }

        // UPSERT実行
        const { error: upsertError } = await supabase
          .from('subsidies_normalized')
          .upsert(normalized, {
            onConflict: 'source_row_id',
            ignoreDuplicates: false
          })

        if (upsertError) {
          console.error(`Failed to upsert record ${record.row_id}:`, upsertError)
          skipped++
        } else {
          processed++
        }
      } catch (error) {
        console.error(`Error processing record ${record.row_id}:`, error)
        skipped++
      }
    }

    const result = {
      message: 'ETL completed successfully',
      total: sheetData.length,
      processed,
      skipped,
      periodParseSuccess,
      amountParseSuccess,
      periodParseRate: Math.round((periodParseSuccess / sheetData.length) * 100),
      amountParseRate: Math.round((amountParseSuccess / sheetData.length) * 100)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('ETL error:', error)
    
    return NextResponse.json(
      { 
        error: 'ETL failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ステータス正規化
function normalizeStatus(status: string): string {
  if (!status) return 'open'
  
  const normalized = status.toLowerCase().trim()
  
  if (normalized.includes('募集中') || normalized.includes('受付中') || 
      normalized.includes('open') || normalized.includes('active')) {
    return 'open'
  }
  
  if (normalized.includes('募集終了') || normalized.includes('受付終了') || 
      normalized.includes('締切') || normalized.includes('closed') || 
      normalized.includes('終了')) {
    return 'closed'
  }
  
  if (normalized.includes('予定') || normalized.includes('準備中') || 
      normalized.includes('近日') || normalized.includes('coming') || 
      normalized.includes('soon')) {
    return 'coming_soon'
  }
  
  return 'open' // デフォルト
}

// 期間解析
function parsePeriod(period: string): { start: string | null, end: string | null } {
  if (!period) return { start: null, end: null }
  
  const trimmed = period.trim()
  
  // パターン: YYYY/MM/DD〜YYYY/MM/DD
  const tildePattern = /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\s*[〜～~]\s*(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
  const tildeMatch = trimmed.match(tildePattern)
  if (tildeMatch) {
    return {
      start: normalizeDate(tildeMatch[1]),
      end: normalizeDate(tildeMatch[2])
    }
  }
  
  // パターン: YYYY-MM-DD - YYYY-MM-DD
  const dashPattern = /(\d{4}-\d{1,2}-\d{1,2})\s*[-]\s*(\d{4}-\d{1,2}-\d{1,2})/
  const dashMatch = trimmed.match(dashPattern)
  if (dashMatch) {
    return {
      start: normalizeDate(dashMatch[1]),
      end: normalizeDate(dashMatch[2])
    }
  }
  
  // パターン: YYYY.MM.DD to YYYY.MM.DD
  const toPattern = /(\d{4}\.\d{1,2}\.\d{1,2})\s*to\s*(\d{4}\.\d{1,2}\.\d{1,2})/
  const toMatch = trimmed.match(toPattern)
  if (toMatch) {
    return {
      start: normalizeDate(toMatch[1]),
      end: normalizeDate(toMatch[2])
    }
  }
  
  return { start: null, end: null }
}

// 日付正規化
function normalizeDate(dateStr: string): string | null {
  try {
    // YYYY/MM/DD → YYYY-MM-DD
    const normalized = dateStr.replace(/[\/\.]/g, '-')
    
    // 日付として有効かチェック
    const date = new Date(normalized)
    if (isNaN(date.getTime())) return null
    
    return normalized
  } catch {
    return null
  }
}

// 金額抽出
function extractAmount(amount: string): { min: number | null, max: number | null } {
  if (!amount) return { min: null, max: null }
  
  const trimmed = amount.trim()
  
  // パターン: 最大300万円
  const maxPattern = /最大\s*(\d+(?:\.\d+)?)\s*万円/
  const maxMatch = trimmed.match(maxPattern)
  if (maxMatch) {
    const max = parseFloat(maxMatch[1]) * 10000
    return { min: null, max: Math.round(max) }
  }
  
  // パターン: 300万円
  const singlePattern = /(\d+(?:\.\d+)?)\s*万円/
  const singleMatch = trimmed.match(singlePattern)
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]) * 10000
    return { min: Math.round(value), max: Math.round(value) }
  }
  
  // パターン: 100万円〜300万円
  const rangePattern = /(\d+(?:\.\d+)?)\s*万円\s*[〜～~]\s*(\d+(?:\.\d+)?)\s*万円/
  const rangeMatch = trimmed.match(rangePattern)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]) * 10000
    const max = parseFloat(rangeMatch[2]) * 10000
    return { min: Math.round(min), max: Math.round(max) }
  }
  
  return { min: null, max: null }
}
