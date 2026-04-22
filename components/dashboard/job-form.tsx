'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const jobSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  message: z.string().min(1, 'Message is required'),
  templateId: z.string().min(1, 'Template is required'),
  recipientName: z.string().optional(),
  audioUrl: z.string().url().optional().or(z.literal('')),
})

type JobFormData = z.infer<typeof jobSchema>

interface JobFormProps {
  onSuccess?: (jobId: string) => void
  templates?: Array<{ id: string; name: string }>
}

export function JobForm({ onSuccess, templates = [] }: JobFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  })

  const templateId = watch('templateId')

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          message: data.message,
          templateId: data.templateId,
          personalization: {
            recipientName: data.recipientName,
            audioUrl: data.audioUrl,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      const { id } = await response.json()
      setSuccess(true)
      reset()
      
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.(id)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Job created successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Job Name</Label>
            <Input
              id="name"
              placeholder="e.g., Birthday Video for John"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter the message to display in the video"
              rows={4}
              {...register('message')}
              disabled={isLoading}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Controller
              name="templateId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.templateId && (
              <p className="text-sm text-red-500">{errors.templateId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
            <Input
              id="recipientName"
              placeholder="e.g., John"
              {...register('recipientName')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL (Optional)</Label>
            <Input
              id="audioUrl"
              type="url"
              placeholder="https://example.com/audio.mp3"
              {...register('audioUrl')}
              disabled={isLoading}
            />
            {errors.audioUrl && (
              <p className="text-sm text-red-500">{errors.audioUrl.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Job...' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
