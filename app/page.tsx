'use client'

import { useState } from 'react'
import { ExperimentForm } from '../components/ExperimentForm'
import { TextEditor } from '../components/TextEditor'

export default function Home() {
  const [editorContent, setEditorContent] = useState<string>('')
  const [isEditorVisible, setIsEditorVisible] = useState(false)

  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('Sending data:', formData)
      const response = await fetch('/api/experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Server response:', errorData)
        throw new Error(`Failed to submit experiment data: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Received response:', data)
      setEditorContent(data.response)
      setIsEditorVisible(true)
    } catch (error) {
      console.error('Error submitting experiment data:', error)
      alert('Failed to submit experiment data. Please try again.')
    }
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Experiment Planner</h2>
          <ExperimentForm onSubmit={handleFormSubmit} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {isEditorVisible ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Generated Plan</h2>
            <TextEditor
              content={editorContent}
              onChange={(content) => setEditorContent(content)}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Submit the form to generate an experiment plan
          </div>
        )}
      </div>
    </main>
  )
}
