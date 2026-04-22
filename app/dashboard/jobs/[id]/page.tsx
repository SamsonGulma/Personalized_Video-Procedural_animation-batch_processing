'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Clock, Play, Download, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  name: string
  message: string
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  retryCount: number
}

interface Output {
  id: string
  assetType: string
  filePath: string
  fileSize: number
  durationSeconds: number
}

const statusConfig = {
  queued: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Queued' },
  rendering: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Rendering' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
  cancelled: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Cancelled' },
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data)
          
          if (data.status === 'completed') {
            const outputResponse = await fetch(`/api/jobs/${jobId}/output`)
            if (outputResponse.ok) {
              const outputData = await outputResponse.json()
              setOutputs(outputData)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch job:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
    
    // Refresh job status if not completed
    const interval = setInterval(() => {
      if (job?.status !== 'completed' && job?.status !== 'failed') {
        fetchJob()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [jobId, job?.status])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
      })
      if (response.ok) {
        // Refresh job
        const refreshResponse = await fetch(`/api/jobs/${jobId}`)
        if (refreshResponse.ok) {
          setJob(await refreshResponse.json())
        }
      }
    } catch (error) {
      console.error('Failed to retry job:', error)
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Not Found</h1>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[job.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{job.name}</h1>
          <p className="text-muted-foreground mt-1">Job ID: {job.id}</p>
        </div>
        <Badge className={statusInfo.bg}>
          <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
          {statusInfo.label}
        </Badge>
      </div>

      {job.status === 'failed' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {job.errorMessage || 'This job failed to render.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="font-medium mt-1">{job.message}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium mt-1">
                {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
            {job.startedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium mt-1">
                  {new Date(job.startedAt).toLocaleString()}
                </p>
              </div>
            )}
            {job.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-medium mt-1">
                  {new Date(job.completedAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Retry Count</p>
              <p className="font-medium mt-1">{job.retryCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/jobs">
              <Button variant="outline" className="w-full">
                Back to Jobs
              </Button>
            </Link>
            {job.status === 'failed' && (
              <Button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {retrying ? 'Retrying...' : 'Retry Job'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {outputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Output Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outputs.map((output) => (
                <div
                  key={output.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium capitalize">{output.assetType}</p>
                    <p className="text-sm text-muted-foreground">
                      {(output.fileSize / 1024 / 1024).toFixed(2)} MB • {output.durationSeconds.toFixed(1)}s
                    </p>
                  </div>
                  <a href={output.filePath} download>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
