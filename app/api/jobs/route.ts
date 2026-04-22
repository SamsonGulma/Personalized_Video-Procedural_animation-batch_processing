import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'
import { createJobSchema, jobStatusSchema } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'asc'
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const db = getDatabase()

    let query = 'SELECT * FROM jobs WHERE 1=1'
    const params: any[] = []

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ` ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const stmt = db.prepare(query)
    const jobs = stmt.all(...params) as any[]

    return NextResponse.json(
      jobs.map((job) => ({
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
      }))
    )
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createJobSchema.parse(body)

    const jobId = uuidv4()
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO jobs (
        id, name, message, template_id, personalization, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      jobId,
      validated.name,
      validated.message,
      validated.templateId,
      validated.personalization ? JSON.stringify(validated.personalization) : null,
      'queued'
    )

    return NextResponse.json({ id: jobId }, { status: 201 })
  } catch (error) {
    console.error('Failed to create job:', error)
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
