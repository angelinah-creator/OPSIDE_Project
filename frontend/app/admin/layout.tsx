'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getUser, clearTokens } from '@/lib/auth-service'
import { authApi } from '@/lib/auth-service'
import { Users, LayoutDashboard, LogOut, Menu, X, Video } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/videos', label: 'Aide Entretiens', icon: Video },
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
    try { const Cookies = (await import('js-cookie')).default; await authApi.logout(Cookies.get('refresh_token') || '') } catch { }
    clearTokens(); router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:sticky top-0 h-[100dvh] z-50 transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <img src="/logo.webp" alt="OPSIDE" className="w-32" />
          <button 
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group text-left",
                  pathname === href 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={clsx(
                  "w-5 h-5",
                  pathname === href ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 lg:border-none">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 h-[100dvh] overflow-y-auto">
        <div className="p-4 md:p-10 w-full">
          <header className="flex items-center gap-4 mb-8 md:mb-10 lg:hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 truncate">
              {NAV.find(n => n.href === pathname)?.label || 'Admin'}
            </h1>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
