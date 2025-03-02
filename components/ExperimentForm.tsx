'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'

interface ExperimentFormProps {
  onSubmit: (data: FormData) => Promise<void>
}

interface FormData {
  hypothesis: string
  researchObjective: string
  researchDomain: string
  dependentVariable: string
  independentVariable: string
  control: string
  budget: string
}

const initialFormData: FormData = {
  hypothesis: '',
  researchObjective: '',
  researchDomain: '',
  dependentVariable: '',
  independentVariable: '',
  control: '',
  budget: '',
}

export function ExperimentForm({ onSubmit }: ExperimentFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load form data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = localStorage.getItem('experimentFormData')
      if (savedFormData) {
        try {
          setFormData(JSON.parse(savedFormData))
        } catch (error) {
          console.error('Error parsing saved form data:', error)
        }
      }
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('experimentFormData', JSON.stringify(formData))
      } catch (error) {
        console.error('Error saving form data:', error)
      }
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while submitting the form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hypothesis</label>
          <textarea
            name="hypothesis"
            value={formData.hypothesis}
            onChange={handleChange}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder="State your research hypothesis..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Research Objective
          </label>
          <textarea
            name="researchObjective"
            value={formData.researchObjective}
            onChange={handleChange}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder="Describe your research question and expected outcome..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Research Domain
          </label>
          <input
            type="text"
            name="researchDomain"
            value={formData.researchDomain}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., Biology, Physics, Chemistry..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Dependent Variable
          </label>
          <textarea
            name="dependentVariable"
            value={formData.dependentVariable}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Factor you will manipulate..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Independent Variable
          </label>
          <textarea
            name="independentVariable"
            value={formData.independentVariable}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Factor you will measure or observe..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Control</label>
          <textarea
            name="control"
            value={formData.control}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Describe your control conditions..."
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rough Budget</label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Estimated budget..."
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Plan...
          </>
        ) : (
          'Experiment Plan'
        )}
      </Button>
    </form>
  )
}
