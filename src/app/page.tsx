'use client'
import { useState, useEffect } from 'react'

interface SavedTweet {
  id: number
  content: string
  createdAt: string
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])

  useEffect(() => {
    fetchSavedTweets()
  }, [])

  const fetchSavedTweets = async () => {
    try {
      const response = await fetch('/api/saved-tweets')
      const data = await response.json()
      if (!data.error) {
        setSavedTweets(data)
      }
    } catch (error) {
      console.error('Error fetching saved tweets:', error)
    }
  }

  const saveTweet = async (tweet: string) => {
    try {
      const response = await fetch('/api/saved-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: tweet }),
      })
      const data = await response.json()
      if (!data.error) {
        await fetchSavedTweets()
      }
    } catch (error) {
      console.error('Error saving tweet:', error)
    }
  }

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
      
      const data = await response.json()
      // console.log('Raw API Response:', data)
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

  const shareOnTwitter = (tweet: string) => {
    const tweetText = encodeURIComponent(tweet)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveTweet(tweet)}
                        className="text-sm text-green-500 hover:text-green-600 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={() => shareOnTwitter(tweet)}
                        className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Tweet
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Tweets Sidebar */}
        <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto shadow-lg transform transition-transform">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Tweets</h2>
          <div className="space-y-4">
            {savedTweets.map((tweet) => (
              <div key={tweet.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-900 mb-2">{tweet.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(tweet.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => shareOnTwitter(tweet.content)}
                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Tweet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}