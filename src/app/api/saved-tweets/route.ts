import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a new Supabase client for each request
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    console.log('Starting POST request...')
    const { content } = await request.json()
    console.log('Content received:', content)

    const { data, error } = await supabase
      .from('saved_tweets')
      .insert([{ content }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Tweet saved successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save tweet'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch saved tweets'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const { error } = await supabase
      .from('saved_tweets')
      .delete()
      .match({ id })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ message: 'Tweet deleted successfully' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete tweet'
    }, { status: 500 })
  }
} 