'use client'
import { useState } from 'react'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    setIsLoading(true)
    try {
      console.log('Sending request with:', inputText)
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
      
      // console.log('Raw API Response:', data)
      // console.log('Raw API Content:', data.content[0])
      // console.log('Data type:', typeof data)
      // console.log('Available properties:', Object.keys(data))

      const data = await response.json()
      setOutputText(data.content[0].text)

    } catch (error) {
      console.error('Error:', error)
      setOutputText('Failed to remix content. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Content Remixer</h1>
      
      <div className="space-y-4">
        <textarea
          className="w-full h-40 p-2 border rounded"
          placeholder="Paste your content here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button
          onClick={handleRemix}
          disabled={isLoading || !inputText}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Remixing...' : 'Remix Content'}
        </button>

        <textarea
          className="w-full h-40 p-2 border rounded"
          placeholder="Remixed content will appear here..."
          value={outputText}
          readOnly
        />
      </div>
    </main>
  )
} 