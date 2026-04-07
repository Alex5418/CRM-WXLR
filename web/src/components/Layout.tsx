import { Link, useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, FolderKanban, FileText, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', label: '首页看板', icon: LayoutDashboard },
  { to: '/customers', label: '客户管理', icon: Users },
  { to: '/projects', label: '项目管理', icon: FolderKanban },
  { to: '/contracts', label: '合同管理', icon: FileText },
]

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 lg:hidden">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="mr-3">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-semibold text-lg">Disney CRM</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-60 border-r bg-card transition-transform lg:translate-x-0 lg:static lg:z-auto',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-bold text-lg">Disney CRM</span>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map(item => {
              const isActive =
                item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
