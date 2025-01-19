import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    const savedTweet = await prisma.savedTweet.create({
      data: { content }
    })
    return NextResponse.json(savedTweet)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save tweet' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const savedTweets = await prisma.savedTweet.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(savedTweets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch saved tweets' }, { status: 500 })
  }
} 