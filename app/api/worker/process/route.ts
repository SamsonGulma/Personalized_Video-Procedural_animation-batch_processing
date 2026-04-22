import { NextResponse } from 'next/server'
import { getWorker } from '@/lib/queue/worker'

// This endpoint processes pending jobs
// In production, this would be triggered by a cron job or external service
export async function POST() {
  try {
    const worker = getWorker()

    // Process jobs in the background
    worker.start().catch((error) => {
      console.error('Worker error:', error)
    })

    return NextResponse.json({ message: 'Worker started' })
  } catch (error) {
    console.error('Failed to start worker:', error)
    return NextResponse.json({ error: 'Failed to start worker' }, { status: 500 })
  }
}

// Optional: GET endpoint to check worker status
export async function GET() {
  try {
    const worker = getWorker()
    return NextResponse.json({ status: 'Worker available' })
  } catch (error) {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}
