'use client'
import { useState } from 'react'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    setIsLoading(true)
    setTweets([]) // Clear previous tweets
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      })
      
      // This was my log to check where the error was coming from
      // console.log('Response status:', response.status)
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }
      
      // console.log('Raw API Content:', data.content[0])
      // console.log('Data type:', typeof data)
      // console.log('Available properties:', Object.keys(data))

      const data = await response.json()
      console.log('Raw API Response:', data)
      if (data.error) {
        throw new Error(data.error)
      }
      setTweets(data.tweets)
    } catch (error) {
      console.error('Error:', error)
      setTweets(['Failed to remix content. Please try again.'])
    }
    setIsLoading(false)
  }

  const copyTweet = async (tweet: string) => {
    try {
      await navigator.clipboard.writeText(tweet)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="container mx-auto max-w-3xl animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center mb-4 text-primary">
          Content Remixer
        </h1>
        <p className="text-foreground/80 text-center mb-12 animate-slide-up">
          Transform your content with AI-powered remixing
        </p>
        
        <div className="space-y-6 bg-background p-6 rounded-lg border border-border shadow-lg">
          <div className="space-y-2">
            <textarea
              id="input"
              className="w-full h-40 p-4 bg-white border border-border rounded-lg 
                       focus:ring-2 focus:ring-primary/30 focus:border-primary 
                       placeholder:text-foreground/50 transition-all"
              placeholder="Paste your content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            onClick={handleRemix}
            disabled={isLoading || !inputText}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                     font-medium transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Tweets'
            )}
          </button>
        </div>

        {tweets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Generated Tweets:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tweets.map((tweet, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <p className="text-gray-900 mb-3">{tweet}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {280 - tweet.length} characters remaining
                    </span>
                    <button
                      onClick={() => copyTweet(tweet)}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 