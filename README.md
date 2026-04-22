# OverFlow - Personalized Video Generation Platform

A production-grade web application for creating personalized short-form videos (10-15 seconds, 720x1280) with handwriting-style animations.

## Features

* **Dashboard UI**: Professional admin dashboard with sidebar navigation, statistics overview, and job management
* **Job Management**: Create, track, and manage video generation jobs with real-time status updates
* **Batch Upload**: Upload multiple jobs via CSV for bulk processing
* **Database**: In-memory database with job persistence and status tracking
* **Queue System**: Priority-based job queue with worker processing
* **Remotion Integration**: React-based video composition with animations
* **Media Processing**: FFmpeg integration for video compression and GIF generation
* **API Routes**: RESTful API for all operations (CRUD, batch, stats)

## Tech Stack

* **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
* **Backend**: Node.js, Next.js API Routes
* **Database**: In-memory (with structure for SQLite migration)
* **Video Rendering**: Remotion
* **Video Processing**: FFmpeg
* **Utilities**: react-hook-form, zod validation, uuid, lucide-react, swr

## Project Structure

```
app/
├── api/
│   ├── jobs/
│   │   ├── route.ts           # Create \& list jobs
│   │   ├── \[id]/route.ts      # Get \& delete job
│   │   ├── \[id]/retry/route.ts # Retry failed jobs
│   │   ├── \[id]/output/route.ts # Get output assets
│   │   └── stats/route.ts     # Get statistics
│   ├── batch/
│   │   └── upload/route.ts    # CSV batch upload
│   ├── templates/route.ts     # List templates
│   └── worker/
│       └── process/route.ts   # Trigger job processing
└── dashboard/
    ├── layout.tsx            # Dashboard sidebar \& header
    ├── page.tsx              # Home/stats page
    ├── jobs/
    │   ├── page.tsx          # Job creation form
    │   └── \[id]/page.tsx     # Job detail \& status
    ├── history/page.tsx      # Job history table
    ├── batch/page.tsx        # Batch upload interface
    └── templates/page.tsx    # Template management

components/
└── dashboard/
    ├── sidebar.tsx
    ├── header.tsx
    ├── job-form.tsx          # Job creation form
    ├── job-status-card.tsx
    ├── video-preview.tsx
    ├── render-history-table.tsx
    ├── template-selector.tsx
    └── stats-overview.tsx

lib/
├── db/
│   ├── client.ts            # Database initialization
│   └── schema.ts            # TypeScript types \& zod schemas
├── queue/
│   ├── queue.ts             # Job queue management
│   └── worker.ts            # Job worker/processor
├── rendering/
│   └── remotion-renderer.ts # Video rendering orchestration
├── remotion/
│   └── VideoComposition.tsx # Main video component
└── media/
    ├── video-stitcher.ts    # FFmpeg video stitching
    └── compression-presets.ts # Video compression profiles
```

## Getting Started

### Installation

1. Clone or download the project
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## API Endpoints

### Jobs

* `GET /api/jobs` - List all jobs
* `POST /api/jobs` - Create new job
* `GET /api/jobs/\[id]` - Get job details
* `GET /api/jobs/\[id]/output` - Get output assets
* `POST /api/jobs/\[id]/retry` - Retry failed job
* `DELETE /api/jobs/\[id]` - Delete job
* `GET /api/jobs/stats` - Get dashboard statistics

### Batch

* `POST /api/batch/upload` - Upload CSV with multiple jobs

### Templates

* `GET /api/templates` - List available templates

### Worker

* `POST /api/worker/process` - Trigger job processing

## License

MIT

