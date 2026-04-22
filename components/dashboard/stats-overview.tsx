import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Stats {
  totalJobs: number
  completedJobs: number
  pendingJobs: number
  failedJobs: number
  averageRenderTime: number
}

export function StatsOverview({ stats }: { stats: Stats }) {
  const successRate = stats.totalJobs > 0 
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100) 
    : 0

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: stats.completedJobs,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: stats.pendingJobs,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Failed',
      value: stats.failedJobs,
      icon: AlertCircle,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Completed' && stats.totalJobs > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {successRate}% success rate
                </p>
              )}
              {stat.title === 'Pending' && stats.pendingJobs > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg render: {stats.averageRenderTime.toFixed(1)}s
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
