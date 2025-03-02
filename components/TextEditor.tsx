'use client'

import { useEffect, useState, useRef } from 'react'
import MarkdownIt from 'markdown-it'

interface Message {
  content: string
  role: 'user' | 'assistant'
}

interface TextEditorProps {
  content: string
  onChange?: (content: string) => void
}

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

export function TextEditor({ content, onChange }: TextEditorProps) {
  const [htmlContent, setHtmlContent] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialContentRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatHistory')
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages))
        } catch (error) {
          console.error('Error parsing saved messages:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Only add initial content as a message if:
    // 1. We have content
    // 2. We haven't processed it before
    // 3. We don't have any saved messages
    if (content && !initialContentRef.current && messages.length === 0) {
      const initialMessage: Message = { role: 'assistant', content }
      setMessages([initialMessage])
      initialContentRef.current = true
    }
    
    // Save messages to localStorage whenever they change
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    }

    // Update HTML content and scroll
    const html = md.render(messages[messages.length - 1]?.content || '')
    setHtmlContent(html)
    scrollToBottom()
  }, [content, messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const messageToSend = newMessage
    setIsLoading(true)
    const userMessage: Message = { role: 'user', content: messageToSend }
    
    try {
      // Add user message to chat
      setMessages(prev => [...prev, userMessage])

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          history: messages,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMessage])
      
      // Only clear the input if the request was successful
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1))
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to clear the chat history?')
      if (confirmed) {
        setMessages([])
        try {
          localStorage.removeItem('chatHistory')
        } catch (error) {
          console.error('Error clearing chat history:', error)
        }
        initialContentRef.current = false
      }
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-end p-2">
        <button
          onClick={handleClearChat}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-16">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === 'user' ? 'pl-4 border-l-4 border-blue-500' : ''
              }`}
            >
              {message.role === 'user' && (
                <div className="text-sm text-gray-500 mb-1">You:</div>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
                className="prose prose-sm max-w-none text-sm leading-relaxed"
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-2 max-w-[95%] mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isLoading ? 'Waiting for response...' : 'Type your message...'}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
