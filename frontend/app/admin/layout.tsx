'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getUser, clearTokens } from '@/lib/auth'
import { authApi } from '@/lib/api'
import { Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (u?.role === 'admin') setUser(u)
    else authApi.me().then(r => {
      if (r.data.role !== 'admin') router.push('/')
      else setUser(r.data)
    }).catch(() => router.push('/auth/login'))
  }, [router])

  const handleLogout = async () => {
    try { const Cookies = (await import('js-cookie')).default; await authApi.logout(Cookies.get('refresh_token') || '') } catch {}
    clearTokens(); router.push('/')
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border fixed inset-y-0 left-0">
        <div className="p-6 border-b border-border">
          <Logo size={28} />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-foreground hover:bg-background'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-background transition-all">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <Logo size={24} />
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-border p-4 pt-16 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', pathname === href ? 'bg-accent text-white' : 'text-muted hover:text-foreground hover:bg-background')}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-background transition-all mt-4">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 pt-0 lg:pt-0">
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  )
}
