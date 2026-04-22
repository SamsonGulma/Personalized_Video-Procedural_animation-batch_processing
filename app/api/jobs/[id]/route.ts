import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const db = getDatabase()

    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?')
    const job = stmt.get(id) as any

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: job.id,
      name: job.name,
      message: job.message,
      templateId: job.template_id,
      personalization: job.personalization ? JSON.parse(job.personalization) : {},
      status: job.status,
      priority: job.priority,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      errorMessage: job.error_message,
      retryCount: job.retry_count,
    })
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const db = getDatabase()

    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?')
    stmt.run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
