'use client'

import { useState, useEffect } from 'react'
import { JobForm } from '@/components/dashboard/job-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
}

export default function JobsPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleJobCreated = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Job</h1>
        <p className="text-muted-foreground mt-1">
          Create a new video generation job
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!loading && (
            <JobForm
              templates={templates}
              onSuccess={handleJobCreated}
            />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Job Name</p>
                <p>Give your job a descriptive name for easy identification.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Message</p>
                <p>This text will be animated with a handwriting effect.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Template</p>
                <p>Choose a template that matches your video style.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
