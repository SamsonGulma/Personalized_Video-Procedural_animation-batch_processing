import { getQueue } from './queue'
import { getDatabase } from '@/lib/db/client'
import { renderVideo } from '@/lib/rendering/remotion-renderer'

class JobWorker {
  private isRunning = false
  private pollInterval = 5000 // 5 seconds

  async start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('[Worker] Starting job worker...')

    while (this.isRunning) {
      try {
        const queue = getQueue()
        const jobId = queue.dequeue()

        if (jobId) {
          console.log(`[Worker] Processing job: ${jobId}`)
          await this.processJob(jobId)
        } else {
          // No jobs available, wait before checking again
          await new Promise((resolve) => setTimeout(resolve, this.pollInterval))
        }
      } catch (error) {
        console.error('[Worker] Error in job loop:', error)
        await new Promise((resolve) => setTimeout(resolve, this.pollInterval))
      }
    }
  }

  stop() {
    console.log('[Worker] Stopping job worker...')
    this.isRunning = false
  }

  private async processJob(jobId: string) {
    const db = getDatabase()
    const queue = getQueue()

    try {
      // Get job details
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any
      if (!job) {
        console.error(`[Worker] Job not found: ${jobId}`)
        return
      }

      // Update job status to rendering
      db.prepare(`
        UPDATE jobs SET status = ?, started_at = ? WHERE id = ?
      `).run('rendering', new Date().toISOString(), jobId)

      // Simulate video rendering
      console.log(`[Worker] Rendering video for job: ${job.name}`)

      // In production, this would call the actual Remotion renderer
      // For now, simulate a successful render
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mark job as completed
      queue.complete(jobId)
      console.log(`[Worker] Job completed: ${jobId}`)
    } catch (error) {
      console.error(`[Worker] Error processing job ${jobId}:`, error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      queue.fail(jobId, message)
    }
  }
}

let worker: JobWorker | null = null

export function getWorker(): JobWorker {
  if (!worker) {
    worker = new JobWorker()
  }
  return worker
}

// For running as a standalone process
if (require.main === module) {
  const worker = getWorker()
  worker.start()

  // Graceful shutdown
  process.on('SIGINT', () => {
    worker.stop()
    process.exit(0)
  })
}
