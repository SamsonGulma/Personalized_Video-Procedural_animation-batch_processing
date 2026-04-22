'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'

export default function BatchUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid CSV file')
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/batch/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError('Failed to upload batch')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Upload</h1>
        <p className="text-muted-foreground mt-1">
          Upload multiple video jobs from a CSV file
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully processed {result.success} jobs
                    {result.failed > 0 && ` (${result.failed} failed)`}
                  </AlertDescription>
                </Alert>
              )}

              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Click to select CSV file</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or drag and drop
                </p>
                {file && (
                  <Badge className="mt-3">
                    Selected: {file.name}
                  </Badge>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">Required columns:</p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>name</li>
                  <li>message</li>
                  <li>templateId</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mt-4">Optional columns:</p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>recipientName</li>
                  <li>audioUrl</li>
                </ul>
              </div>
              <div className="bg-muted p-3 rounded text-xs font-mono mt-4">
                name,message,templateId
                <br />
                Birthday John,Happy
                <br />
                Birthday,template1
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
