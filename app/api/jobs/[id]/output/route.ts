import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const db = getDatabase()

    const stmt = db.prepare('SELECT * FROM output_assets WHERE job_id = ?')
    const outputs = stmt.all(id) as any[]

    return NextResponse.json(
      outputs.map((output) => ({
        id: output.id,
        jobId: output.job_id,
        variantId: output.variant_id,
        assetType: output.asset_type,
        filePath: output.file_path,
        fileSize: output.file_size_bytes,
        durationSeconds: output.duration_seconds,
        createdAt: output.created_at,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch output assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch output assets' },
      { status: 500 }
    )
  }
}
