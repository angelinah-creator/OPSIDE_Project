'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearTokens, authApi } from '@/lib/auth-service'
import { clientApi, ClientProfile } from '@/lib/client-service'
import {
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Bell,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import ClientOffresTab from '@/components/dashboard/client/ClientOffresTab'
import ClientProfilTab from '@/components/dashboard/client/ClientProfilTab'
import ClientCandidaturesTab from '@/components/dashboard/client/CandidaturesTab'
import ClientSourcingTab from '@/components/dashboard/client/SourcingTab'
import ClientMatchesTab from '@/components/dashboard/client/MatchesTab'
import NotificationsTab from '@/components/dashboard/NotificationsTab'
import { notificationService } from '@/lib/notification-service'

type TabType = 'dashboard' | 'candidatures' | 'sourcing' | 'matches' | 'notifications' | 'offres' | 'profil'

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('offres')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = getUser()
        if (u) setUser(u)
        else {
          const me = await authApi.me()
          setUser(me.data)
        }
        const p = await clientApi.getMyProfile()
        setProfile(p)
        
        // Fetch unread count
        const count = await notificationService.getUnreadCount()
        setUnreadNotifications(count)
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/client/onboarding')
        } else {
          router.push('/auth/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Set up polling for notifications
    const interval = setInterval(async () => {
      try {
        const count = await notificationService.getUnreadCount()
        setUnreadNotifications(count)
      } catch (err) {
        console.error('Error polling notifications:', err)
      }
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = async () => {
    try {
      const rt = (await import('js-cookie')).default.get('refresh_token') || ''
      await authApi.logout(rt)
    } catch { }
    clearTokens()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'offres', label: "Offres d'emploi", icon: Briefcase },
    { id: 'candidatures', label: 'Candidatures', icon: FileText },
    { id: 'sourcing', label: 'Sourcing', icon: User },
    { id: 'matches', icon: Briefcase, label: 'Matches' }, 
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profil', label: 'Profil', icon: User },
  ]

  const initials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : (user?.first_name?.[0] || 'C')

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:sticky top-0 h-[100dvh] z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <img src="/logo.webp" alt="OPSIDE" className="w-32" />
          <button
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group text-left",
                  activeTab === item.id
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={clsx(
                  "w-5 h-5",
                  activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
                {item.id === 'notifications' && unreadNotifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 lg:border-none">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt={profile.company_name} className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {profile?.company_name || `${user?.first_name} ${user?.last_name}`}
                </p>
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
          <header className="flex items-center gap-4 mb-8 md:mb-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </header>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
                <p className="text-slate-400 font-medium">Dashboard — À venir</p>
              </div>
            )}
            {activeTab === 'dashboard' && (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
                <p className="text-slate-400 font-medium">Dashboard — À venir</p>
              </div>
            )}
            {activeTab === 'candidatures' && <ClientCandidaturesTab />}
            {activeTab === 'sourcing' && <ClientSourcingTab />}
            {activeTab === 'matches' && <ClientMatchesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'offres' && <ClientOffresTab />}
            {activeTab === 'profil' && <ClientProfilTab profile={profile} user={user} onProfileUpdate={setProfile} />}
          </div>
        </div>
      </main>
    </div>
  )
}
