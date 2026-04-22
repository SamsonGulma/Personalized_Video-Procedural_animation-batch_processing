'use client'

import { useEffect, useState } from 'react'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface DashboardStats {
  totalJobs: number
  completedJobs: number
  pendingJobs: number
  failedJobs: number
  averageRenderTime: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    failedJobs: 0,
    averageRenderTime: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/jobs/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to OverFlow - Personalized Video Generation Platform
        </p>
      </div>

      {!loading && <StatsOverview stats={stats} />}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new video generation job with personalized content.
            </p>
            <Link href="/dashboard/jobs">
              <Button className="w-full">
                Create Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload multiple jobs at once using a CSV file.
            </p>
            <Link href="/dashboard/batch">
              <Button className="w-full">
                Upload Batch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check the status and history of all your render jobs.
            </p>
            <Link href="/dashboard/history">
              <Button className="w-full">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage video templates and customize your content.
            </p>
            <Link href="/dashboard/templates">
              <Button className="w-full">
                Manage Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
