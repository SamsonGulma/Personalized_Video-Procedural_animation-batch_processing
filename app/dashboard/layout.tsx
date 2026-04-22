'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  FileText,
  Upload,
  History,
  LayoutTemplate,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/jobs', label: 'Jobs', icon: FileText },
  { href: '/dashboard/batch', label: 'Batch Upload', icon: Upload },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/templates', label: 'Templates', icon: LayoutTemplate },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background p-6 transition-transform md:relative md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between md:justify-start">
          <h1 className="text-xl font-bold">OverFlow</h1>
          <button
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {sidebarLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                  pathname === href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 md:justify-end">
      <button onClick={onMenuClick} className="md:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Admin Dashboard</span>
      </div>
    </header>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
