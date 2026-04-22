import { RenderHistoryTable } from '@/components/dashboard/render-history-table'

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Render History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your render jobs
        </p>
      </div>

      <RenderHistoryTable />
    </div>
  )
}
