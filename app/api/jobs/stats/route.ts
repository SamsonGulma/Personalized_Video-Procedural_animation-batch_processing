import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/client'

export async function GET() {
  try {
    const db = getDatabase()

    // Get total jobs
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM jobs')
    const { count: totalJobs } = totalStmt.get() as any

    // Get completed jobs
    const completedStmt = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'completed'")
    const { count: completedJobs } = completedStmt.get() as any

    // Get pending jobs (queued + rendering)
    const pendingStmt = db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE status IN ('queued', 'rendering')"
    )
    const { count: pendingJobs } = pendingStmt.get() as any

    // Get failed jobs
    const failedStmt = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'failed'")
    const { count: failedJobs } = failedStmt.get() as any

    // Calculate average render time (simple estimate for demo)
    // In production, you'd calculate this based on actual rendering time
    const completedJobs = db.prepare(`
      SELECT COUNT(*) as count FROM jobs WHERE status = 'completed'
    `).get() as any
    
    // For demo purposes, estimate based on completed jobs
    const averageRenderTime = completedJobs?.count > 0 ? 15.5 : 0

    return NextResponse.json({
      totalJobs,
      completedJobs,
      pendingJobs,
      failedJobs,
      averageRenderTime,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
