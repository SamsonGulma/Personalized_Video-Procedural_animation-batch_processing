'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Job {
  id: string
  name: string
  message: string
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  completedAt?: string
}

const statusConfig = {
  queued: { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  rendering: { icon: Clock, color: 'bg-blue-100 text-blue-800' },
  completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  failed: { icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  cancelled: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800' },
}

export function RenderHistoryTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs?sort=createdAt&order=desc')
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
    // Refresh jobs every 30 seconds
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredJobs(jobs)
    } else {
      setFilteredJobs(jobs.filter((job) => job.status === statusFilter))
    }
    setPage(1)
  }, [jobs, statusFilter])

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  const totalPages = Math.ceil(filteredJobs.length / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {paginatedJobs.length} of {filteredJobs.length} jobs
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="rendering">Rendering</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedJobs.map((job) => {
                const config = statusConfig[job.status]
                const Icon = config.icon
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {job.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/jobs/${job.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
