import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const db = getDatabase()

    // Check if job exists and is failed
    const jobStmt = db.prepare('SELECT * FROM jobs WHERE id = ?')
    const job = jobStmt.get(id) as any

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      )
    }

    // Update job status
    const updateStmt = db.prepare(`
      UPDATE jobs
      SET status = 'queued', retry_count = retry_count + 1, error_message = NULL
      WHERE id = ?
    `)
    updateStmt.run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to retry job:', error)
    return NextResponse.json({ error: 'Failed to retry job' }, { status: 500 })
  }
}
