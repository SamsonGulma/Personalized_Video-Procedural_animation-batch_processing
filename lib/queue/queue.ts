import { getDatabase } from '@/lib/db/client'

export interface QueueJob {
  id: string
  status: 'queued' | 'rendering' | 'completed' | 'failed'
  priority: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
}

class JobQueue {
  private jobs: Map<string, QueueJob> = new Map()
  private sortedQueue: string[] = []

  enqueue(jobId: string, priority = 0) {
    const now = new Date().toISOString()
    const job: QueueJob = {
      id: jobId,
      status: 'queued',
      priority,
      createdAt: now,
    }

    this.jobs.set(jobId, job)
    this.updateSortedQueue()
  }

  dequeue(): string | null {
    if (this.sortedQueue.length === 0) return null

    const jobId = this.sortedQueue.shift()!
    const job = this.jobs.get(jobId)
    if (job) {
      job.status = 'rendering'
      job.startedAt = new Date().toISOString()
    }

    return jobId
  }

  complete(jobId: string, output?: any) {
    const job = this.jobs.get(jobId)
    if (job) {
      job.status = 'completed'
      job.completedAt = new Date().toISOString()

      // Update database
      const db = getDatabase()
      db.prepare(`
        UPDATE jobs SET status = ?, completed_at = ? WHERE id = ?
      `).run('completed', job.completedAt, jobId)
    }
  }

  fail(jobId: string, error: string) {
    const job = this.jobs.get(jobId)
    if (job) {
      job.status = 'failed'
      job.error = error

      // Update database
      const db = getDatabase()
      db.prepare(`
        UPDATE jobs SET status = ?, error_message = ? WHERE id = ?
      `).run('failed', error, jobId)
    }
  }

  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId)
  }

  getQueueSize(): number {
    return this.sortedQueue.length
  }

  private updateSortedQueue() {
    this.sortedQueue = Array.from(this.jobs.values())
      .filter((job) => job.status === 'queued')
      .sort((a, b) => {
        // Higher priority first, then by creation time
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      .map((job) => job.id)
  }
}

let queue: JobQueue | null = null

export function getQueue(): JobQueue {
  if (!queue) {
    queue = new JobQueue()

    // Initialize queue with queued jobs from database
    const db = getDatabase()
    const queuedJobs = db.prepare(`
      SELECT id, priority FROM jobs WHERE status = 'queued'
    `).all() as any[]

    queuedJobs.forEach((job) => {
      queue!.enqueue(job.id, job.priority)
    })
  }

  return queue
}
