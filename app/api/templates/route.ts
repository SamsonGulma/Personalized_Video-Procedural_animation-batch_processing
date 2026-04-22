import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'

export async function GET() {
  try {
    const db = getDatabase()

    const stmt = db.prepare('SELECT * FROM templates WHERE active = 1 ORDER BY created_at DESC')
    const templates = stmt.all() as any[]

    return NextResponse.json(
      templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        config: template.config ? JSON.parse(template.config) : {},
        active: template.active,
        createdAt: template.created_at,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}
