import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.trim().split('\n')

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and data rows' }, { status: 400 })
    }

    // Parse CSV
    const headers = lines[0].split(',').map((h) => h.trim())
    const requiredFields = ['name', 'message', 'templateId']

    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO jobs (
        id, name, message, template_id, personalization, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)

    let successCount = 0
    let failureCount = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v) => v.trim())
        const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx]]))

        const jobId = uuidv4()
        const personalization: Record<string, string> = {}

        if (row.recipientName) personalization.recipientName = row.recipientName
        if (row.audioUrl) personalization.audioUrl = row.audioUrl

        stmt.run(
          jobId,
          row.name,
          row.message,
          row.templateId,
          Object.keys(personalization).length > 0 ? JSON.stringify(personalization) : null,
          'queued'
        )

        successCount++
      } catch (error) {
        console.error(`Error processing row ${i}:`, error)
        failureCount++
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failureCount,
    })
  } catch (error) {
    console.error('Failed to process batch upload:', error)
    return NextResponse.json({ error: 'Failed to process batch' }, { status: 500 })
  }
}
