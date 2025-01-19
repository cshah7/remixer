'use client'
import { useState, useEffect } from 'react'

interface SavedTweet {
  id: number
  content: string
  created_at: string
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [editingTweet, setEditingTweet] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTweetId, setEditingTweetId] = useState<number | null>(null)

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
      console.log('Attempting to save tweet:', tweet)
      const response = await fetch('/api/saved-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: tweet }),
      })
      
      const data = await response.json()
      console.log('Response from server:', data)
      
      if (data.error) {
        console.error('Error details:', {
          message: data.error,
          details: data.details,
          url: data.url,
          hasKey: data.hasKey
        })
        return
      }
      
      await fetchSavedTweets()
      setIsSidebarOpen(true)
    } catch (error) {
      console.error('Error saving tweet:', error)
    }
  }

  const deleteTweet = async (id: number) => {
    try {
      const response = await fetch('/api/saved-tweets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) throw new Error('Failed to delete tweet')
      await fetchSavedTweets() // Refresh the saved tweets list
    } catch (error) {
      console.error('Error deleting tweet:', error)
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

  const handleEdit = (tweet: string, id?: number) => {
    setEditingTweet(tweet)
    setEditingTweetId(id || null)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      if (editingTweetId) {
        // Update existing tweet
        const response = await fetch('/api/saved-tweets', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingTweetId, content: editingTweet }),
        })
        
        if (!response.ok) throw new Error('Failed to update tweet')
      } else {
        // Create new tweet
        await saveTweet(editingTweet)
      }
      
      await fetchSavedTweets()
      setIsEditModalOpen(false)
      setEditingTweet('')
      setEditingTweetId(null)
      setIsSidebarOpen(true)
    } catch (error) {
      console.error('Error saving edit:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 relative">
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Edit Tweet</h3>
            <textarea
              value={editingTweet}
              onChange={(e) => setEditingTweet(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {280 - editingTweet.length} characters remaining
            </div>
          </div>
        </div>
      )}

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
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(tweet)}
                        className="text-gray-700 hover:text-gray-800 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => saveTweet(tweet)}
                        className="text-green-700 hover:text-green-800 transition-colors"
                        title="Save"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => shareOnTwitter(tweet)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Tweet"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Tweets Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 z-50 bg-white p-2 rounded-l-lg border border-r-0 border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-300 ${
            isSidebarOpen ? 'right-80' : 'right-0'
          }`}
          aria-label="Toggle saved tweets"
        >
          <svg
            className={`w-6 h-6 text-gray-600 transform transition-transform ${
              isSidebarOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Saved Tweets Sidebar */}
        <div
          className={`fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto shadow-lg transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Tweets</h2>
          <div className="space-y-4">
            {savedTweets.map((tweet) => (
              <div key={tweet.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-900 mb-2">{tweet.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(tweet.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(tweet.content, tweet.id)}
                      className="text-gray-700 hover:text-gray-800 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => shareOnTwitter(tweet.content)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Tweet"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTweet(tweet.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}