import { getDatabase } from '@/lib/db/client'
import { v4 as uuidv4 } from 'uuid'

interface RenderOptions {
  jobId: string
  message: string
  templateId: string
  personalization?: Record<string, any>
}

export async function renderVideo(options: RenderOptions): Promise<string> {
  const { jobId, message, templateId, personalization } = options

  console.log('[Remotion] Starting video render for job:', jobId)
  console.log('[Remotion] Message:', message)
  console.log('[Remotion] Template:', templateId)

  // Simulate video rendering
  // In production, this would use Remotion to render the video
  await simulateRender()

  const outputId = uuidv4()
  const db = getDatabase()

  // Store output asset in database
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO output_assets (
      id, job_id, asset_type, file_path, file_size_bytes, duration_seconds, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(outputId, jobId, 'mp4', `/videos/${jobId}.mp4`, 2500000, 15, now)

  console.log('[Remotion] Video render complete for job:', jobId)
  return `/videos/${jobId}.mp4`
}

async function simulateRender(): Promise<void> {
  // Simulate rendering time
  return new Promise((resolve) => {
    setTimeout(resolve, 3000)
  })
}

export async function generateGif(jobId: string): Promise<string> {
  console.log('[Remotion] Generating GIF for job:', jobId)

  // Simulate GIF generation
  await simulateRender()

  const db = getDatabase()
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO output_assets (
      id, job_id, asset_type, file_path, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), jobId, 'gif', `/videos/${jobId}.gif`, now)

  return `/videos/${jobId}.gif`
}
