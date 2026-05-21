'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, clearTokens, authApi } from '@/lib/auth-service'
import { candidateApi } from '@/lib/candidate-service'
import { matchService } from '@/lib/match-service'
import {
  LogOut,
  Home,
  Timer,
  FileText,
  ScrollText,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

import WorkspaceHome from '@/components/workspace/candidate/WorkspaceHome'
import WorkspaceTimeTracking from '@/components/workspace/candidate/WorkspaceTimeTracking'
import WorkspaceFactures from '@/components/workspace/candidate/WorkspaceFactures'
import WorkspaceContrats from '@/components/workspace/candidate/WorkspaceContrats'

type TabType = 'workspace_home' | 'workspace_time' | 'workspace_factures' | 'workspace_contrats'

export default function CandidatWorkspace() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('workspace_home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = getUser()
        if (u) setUser(u)
        else {
          const me = await authApi.me()
          setUser(me.data)
        }
        const p = await candidateApi.getMyProfile()
        setProfile(p)

        if (params.matchId) {
          const matchData = await matchService.getMatchById(params.matchId as string)
          setMatchDetails(matchData)
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/candidat/onboarding')
        } else {
          router.push('/auth/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
          <p className="text-slate-400 font-medium">Chargement du workspace...</p>
        </div>
      </div>
    )
  }

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'workspace_home', label: 'Vue d\'ensemble', icon: Home },
    { id: 'workspace_time', label: 'Time Tracking', icon: Timer },
    { id: 'workspace_factures', label: 'Mes Factures', icon: FileText },
    { id: 'workspace_contrats', label: 'Mes Contrats', icon: ScrollText },
  ]

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const photoUrl = profile?.photo_url
    ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${API_URL}${profile.photo_url}`)
    : null

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
        "w-72 bg-slate-900 flex flex-col fixed lg:sticky top-0 h-[100dvh] z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <img src="/logo-white.png" alt="OPSIDE" className="w-32 brightness-0 invert" onError={(e) => { e.currentTarget.src = '/logo.webp'; e.currentTarget.style.filter = 'brightness(0) invert(1)'; }} />
          <button
            className="lg:hidden p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 mb-6">
           <Link
             href="/candidat/dashboard"
             className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all text-sm"
           >
             <ArrowLeft className="w-4 h-4" />
             Retour au Dashboard
           </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">
            Workspace {matchDetails?.client?.client?.company_name ? `- ${matchDetails.client.client.company_name}` : ''}
          </p>
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
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={clsx(
                  "w-5 h-5",
                  activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.first_name?.[0]
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate flex items-center gap-3">
              {navItems.find(n => n.id === activeTab)?.label}
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-200">
                Workspace {matchDetails?.client?.client?.company_name ? `- ${matchDetails.client.client.company_name}` : ''}
              </span>
            </h1>
          </header>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'workspace_home' && <WorkspaceHome />}
            {activeTab === 'workspace_time' && <WorkspaceTimeTracking />}
            {activeTab === 'workspace_factures' && <WorkspaceFactures />}
            {activeTab === 'workspace_contrats' && <WorkspaceContrats />}
          </div>
        </div>
      </main>
    </div>
  )
}
