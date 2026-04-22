const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'OverFlow.db')

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    template_id TEXT NOT NULL,
    personalization JSON,
    status TEXT CHECK(status IN ('queued', 'rendering', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS render_variants (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    variant_name TEXT,
    audio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS output_assets (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    variant_id TEXT REFERENCES render_variants(id),
    asset_type TEXT CHECK(asset_type IN ('mp4', 'gif', 'preview')),
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    duration_seconds REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    config JSON,
    active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
  CREATE INDEX IF NOT EXISTS idx_render_variants_job_id ON render_variants(job_id);
  CREATE INDEX IF NOT EXISTS idx_output_assets_job_id ON output_assets(job_id);
`)

// Seed templates
const templateId = 'template-1'
const stmt = db.prepare(`
  INSERT OR IGNORE INTO templates (id, name, description, config, active)
  VALUES (?, ?, ?, ?, ?)
`)

stmt.run(
  templateId,
  'Handwriting Basic',
  'Basic handwriting animation template',
  JSON.stringify({
    animationStyle: 'handwriting',
    colors: ['#000000'],
    fonts: ['Arial'],
    layout: 'centered'
  }),
  true
)

console.log(`Database initialized at ${dbPath}`)
db.close()
