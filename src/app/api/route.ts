import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const tweetFromPostPrompt = `
You are a social media expert and ghost writer.

You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post.

Since you are a ghost writer, you need to make sure that you follow the style, tone, and voice of the blog post as closely as possible.

Remember: Tweets cannot be longer than 280 characters.

Please return at least five tweets. Each tweet must be on its own line and must start with "TWEET:" (this prefix will be removed later).

Do not use any hashtags or emojis.

Here's the blog post:

`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: `${tweetFromPostPrompt} ${body.message}`}]
    })

    const text = response.content[0].text as string;
    // Split the response by lines, filter for lines starting with "TWEET:", and remove the prefix
    const tweets = text
      .split('\n')
      .filter((line: string) => line.trim().startsWith('TWEET:'))
      .map((tweet: string) => tweet.replace('TWEET:', '').trim());

    return NextResponse.json({ tweets })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}