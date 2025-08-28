import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ADMIN_SECRET = Deno.env.get('LOCAL_NEWS_ADMIN_SECRET')

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_SECRET) {
      throw new Error('Missing required environment variables')
    }

    const { passphrase, newsData } = await req.json()

    console.log('Received news post request')

    // Verify admin passphrase
    if (passphrase !== ADMIN_SECRET) {
      console.error('Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Validate required fields
    if (!newsData.prefecture || !newsData.name) {
      console.error('Missing required fields:', { prefecture: newsData.prefecture, name: newsData.name })
      return new Response(
        JSON.stringify({ error: 'Prefecture and name are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Processing news post:', {
      prefecture: newsData.prefecture,
      municipality: newsData.municipality,
      name: newsData.name,
      status: newsData.status
    })

    // Insert news to database using Service Role key
    const supabaseHeaders = {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/local_news`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify({
        ...newsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: newsData.published_at || new Date().toISOString()
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Database error:', error)
      throw new Error(`Database error: ${error}`)
    }

    const result = await response.json()
    console.log('News posted successfully:', result)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'News posted successfully',
        id: result[0]?.id
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