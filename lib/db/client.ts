// Simple in-memory database wrapper for API routes
interface JobRecord {
  id: string
  name: string
  message: string
  template_id: string
  personalization: string | null
  status: string
  priority: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  retry_count: number
}

interface TemplateRecord {
  id: string
  name: string
  description: string | null
  config: string | null
  active: number
  created_at: string
}

interface OutputAssetRecord {
  id: string
  job_id: string
  variant_id: string | null
  asset_type: string
  file_path: string
  file_size_bytes: number | null
  duration_seconds: number | null
  created_at: string
}

class SimpleDB {
  private jobs: Map<string, JobRecord> = new Map()
  private templates: Map<string, TemplateRecord> = new Map()
  private outputs: Map<string, OutputAssetRecord> = new Map()

  constructor() {
    // Initialize with default template
    const defaultTemplate: TemplateRecord = {
      id: 'template-1',
      name: 'Handwriting Basic',
      description: 'Basic handwriting animation template',
      config: JSON.stringify({
        animationStyle: 'handwriting',
        colors: ['#000000'],
        fonts: ['Arial'],
        layout: 'centered'
      }),
      active: 1,
      created_at: new Date().toISOString()
    }
    this.templates.set(defaultTemplate.id, defaultTemplate)
  }

  prepare(sql: string) {
    return {
      all: (...params: any[]) => this.executeAll(sql, params),
      get: (...params: any[]) => this.executeOne(sql, params),
      run: (...params: any[]) => this.executeRun(sql, params),
    }
  }

  private executeOne(sql: string, params: any[]): any {
    if (sql.includes('SELECT * FROM jobs WHERE id = ?')) {
      return this.jobs.get(params[0])
    }
    if (sql.includes('SELECT * FROM templates WHERE')) {
      return Array.from(this.templates.values()).find(t => t.active === 1)
    }
    if (sql.includes('SELECT COUNT(*) as count FROM jobs')) {
      return { count: this.jobs.size }
    }
    if (sql.includes("COUNT(*) as count FROM jobs WHERE status = 'completed'")) {
      return { count: Array.from(this.jobs.values()).filter(j => j.status === 'completed').length }
    }
    if (sql.includes("COUNT(*) as count FROM jobs WHERE status IN ('queued', 'rendering')")) {
      return { count: Array.from(this.jobs.values()).filter(j => ['queued', 'rendering'].includes(j.status)).length }
    }
    if (sql.includes("COUNT(*) as count FROM jobs WHERE status = 'failed'")) {
      return { count: Array.from(this.jobs.values()).filter(j => j.status === 'failed').length }
    }
    return null
  }

  private executeAll(sql: string, params: any[]): any[] {
    if (sql.includes('SELECT * FROM jobs')) {
      let results = Array.from(this.jobs.values())
      if (sql.includes('ORDER BY')) {
        results.sort((a, b) => {
          const aTime = new Date(a.created_at).getTime()
          const bTime = new Date(b.created_at).getTime()
          return sql.includes('desc') ? bTime - aTime : aTime - bTime
        })
      }
      return results
    }
    if (sql.includes('SELECT * FROM templates')) {
      return Array.from(this.templates.values()).filter(t => t.active === 1)
    }
    if (sql.includes('SELECT * FROM output_assets')) {
      return Array.from(this.outputs.values()).filter(o => o.job_id === params[0])
    }
    return []
  }

  private executeRun(sql: string, params: any[]): any {
    if (sql.includes('INSERT INTO jobs')) {
      const job: JobRecord = {
        id: params[0],
        name: params[1],
        message: params[2],
        template_id: params[3],
        personalization: params[4],
        status: params[5] || 'queued',
        priority: 0,
        created_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
        error_message: null,
        retry_count: 0,
      }
      this.jobs.set(job.id, job)
      return { lastID: job.id }
    }
    if (sql.includes('UPDATE jobs SET status = ? WHERE id = ?')) {
      const job = this.jobs.get(params[1])
      if (job) {
        job.status = params[0]
      }
    }
    if (sql.includes('UPDATE jobs SET status')) {
      const job = this.jobs.get(params[2])
      if (job) {
        job.status = 'queued'
        job.retry_count += 1
        job.error_message = null
      }
    }
    return {}
  }
}

let db: SimpleDB | null = null

export function getDatabase(): any {
  if (!db) {
    db = new SimpleDB()
  }
  return db
}

export function closeDatabase() {
  db = null
}
