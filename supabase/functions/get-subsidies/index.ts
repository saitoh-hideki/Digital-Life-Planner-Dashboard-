import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryParams {
  prefecture?: string
  municipality?: string
  keyword?: string
  status?: string
  page?: number
  limit?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse query parameters
    const url = new URL(req.url)
    const params: QueryParams = {
      prefecture: url.searchParams.get('prefecture') || undefined,
      municipality: url.searchParams.get('municipality') || undefined,
      keyword: url.searchParams.get('keyword') || undefined,
      status: url.searchParams.get('status') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: Math.min(parseInt(url.searchParams.get('limit') || '20'), 100) // Max 100 items per page
    }

    // Build query
    let query = supabaseClient
      .from('subsidies')
      .select('*')

    // Apply filters
    if (params.prefecture) {
      query = query.eq('prefecture', params.prefecture)
    }

    if (params.municipality) {
      query = query.ilike('municipality', `%${params.municipality}%`)
    }

    if (params.status) {
      query = query.eq('status', params.status)
    }

    // Apply keyword search (full-text search on multiple columns)
    if (params.keyword) {
      query = query.or(`name.ilike.%${params.keyword}%,summary.ilike.%${params.keyword}%,issuer.ilike.%${params.keyword}%,audience.ilike.%${params.keyword}%`)
    }

    // Apply pagination
    const offset = ((params.page || 1) - 1) * (params.limit || 20)
    query = query
      .order('apply_end', { ascending: true, nullsFirst: false })
      .range(offset, offset + (params.limit || 20) - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Database query failed', 
          details: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get total count for pagination (separate query)
    let countQuery = supabaseClient
      .from('subsidies')
      .select('*', { count: 'exact', head: true })

    // Apply same filters to count query
    if (params.prefecture) {
      countQuery = countQuery.eq('prefecture', params.prefecture)
    }

    if (params.municipality) {
      countQuery = countQuery.ilike('municipality', `%${params.municipality}%`)
    }

    if (params.status) {
      countQuery = countQuery.eq('status', params.status)
    }

    if (params.keyword) {
      countQuery = countQuery.or(`name.ilike.%${params.keyword}%,summary.ilike.%${params.keyword}%,issuer.ilike.%${params.keyword}%,audience.ilike.%${params.keyword}%`)
    }

    const { count: totalCount } = await countQuery

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / (params.limit || 20))
    const currentPage = params.page || 1
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    // Prepare response
    const response = {
      data: data || [],
      pagination: {
        currentPage,
        totalPages,
        totalCount: totalCount || 0,
        limit: params.limit || 20,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        prefecture: params.prefecture,
        municipality: params.municipality,
        keyword: params.keyword,
        status: params.status
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})