'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/admin-service'
import { Users, UserCheck, Building2, Handshake, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm transition-all duration-200">
        {label && <p className="font-semibold text-slate-800 mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: <span className="font-bold text-slate-900">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const STATUS_COLORS: Record<string, string> = {
  pending_candidate: '#f59e0b', // Amber
  pending_client:    '#3b82f6', // Blue
  confirmed:         '#10b981', // Emerald
  in_workspace:      '#8b5cf6', // Purple
  rejected:          '#f43f5e', // Rose
}

const STATUS_LABELS: Record<string, string> = {
  pending_candidate: 'Att. Candidat',
  pending_client:    'Att. Entreprise',
  confirmed:         'Confirmé',
  in_workspace:      'Workspace',
  rejected:          'Refusé',
}

const CANDIDATE_COLOR = '#6366f1' // Indigo
const CLIENT_COLOR = '#06b6d4'    // Cyan

// K p i card skeleton
const KPICardSkeleton = () => (
  <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-5 shadow-xs flex flex-col gap-3 animate-pulse">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100" />
    <div className="h-6 md:h-7 w-12 md:w-20 bg-slate-100 rounded-lg" />
    <div className="h-3 md:h-4 w-20 md:w-28 bg-slate-100 rounded-md" />
  </div>
)

// Chart skeleton
const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs animate-pulse h-[300px] flex flex-col justify-between">
    <div className="space-y-2">
      <div className="h-5 w-48 bg-slate-100 rounded-md" />
      <div className="h-3 w-32 bg-slate-100 rounded-md" />
    </div>
    <div className="flex items-center justify-around gap-4 my-auto">
      <div className="w-36 h-36 rounded-full border-12 border-slate-100 flex items-center justify-center" />
      <div className="space-y-3 w-1/2">
        <div className="h-4 w-full bg-slate-100 rounded-md" />
        <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
        <div className="h-4 w-4/6 bg-slate-100 rounded-md" />
      </div>
    </div>
  </div>
)

// Admin dashboard
export default function AdminDashboard() {
  const [users, setUsers]     = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getUsers(),
      adminApi.getMatches(),
    ]).then(([usersRes, matchesRes]) => {
      setUsers(usersRes.data || [])
      setMatches(matchesRes.data || [])
    }).catch((err) => console.error("Error fetching dashboard data", err))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const candidats  = users.filter(u => u.role === 'candidat')
    const clients    = users.filter(u => u.role === 'client')
    const suspended  = users.filter(u => u.status === 'suspended')
    return {
      total:     users.length,
      candidats: candidats.length,
      clients:   clients.length,
      suspended: suspended.length,
      matches:   matches.length,
    }
  }, [users, matches])

  const userPieData = useMemo(() => [
    { name: 'Candidats',   value: stats.candidats, color: CANDIDATE_COLOR },
    { name: 'Entreprises', value: stats.clients,   color: CLIENT_COLOR },
    { name: 'Suspendus',   value: stats.suspended, color: '#f43f5e' },
  ].filter(d => d.value > 0), [stats])

  const matchStatusData = useMemo(() => Object.entries(STATUS_LABELS).map(([key, name]) => ({
    name,
    value: matches.filter(m => m.status === key).length,
    color: STATUS_COLORS[key],
  })).filter(d => d.value > 0), [matches])

  const cards = [
    { label: 'Total utilisateurs', value: stats.total,     icon: Users,        color: 'from-purple-500 to-purple-600',       textColor: 'text-purple-600' },
    { label: 'Candidats inscrits', value: stats.candidats, icon: UserCheck,    color: 'from-purple-500 to-purple-600',       textColor: 'text-purple-600' },
    { label: 'Entreprises actives',value: stats.clients,   icon: Building2,    color: 'from-purple-500 to-purple-600',       textColor: 'text-purple-600' },
    { label: 'Matches créés',      value: stats.matches,   icon: Handshake,    color: 'from-purple-500 to-purple-600',       textColor: 'text-purple-600' },
  ]

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">Vue d'ensemble en temps réel de la plateforme OPSIDE.</p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
          : cards.map((c, i) => {
              const Icon = c.icon
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-5 shadow-xs hover:shadow-md hover:border-slate-200/60 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-linear-to-br ${c.color} shadow-sm text-white`}>
                      <Icon className="w-4 md:w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 md:mt-4 space-y-0.5">
                    <h3 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                      {c.value}
                    </h3>
                    <p className="text-[10px] md:text-xs font-medium text-slate-400 line-clamp-1">
                      {c.label}
                    </p>
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Répartition Utilisateurs */}
        {loading ? <ChartSkeleton /> : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-slate-800 text-lg">Répartition des utilisateurs</h2>
              </div>
              <p className="text-xs text-slate-400">Segmentation globale des comptes créés</p>
            </div>

            {userPieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm gap-2"><AlertTriangle className="w-4 h-4"/> Aucune donnée disponible</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <div className="w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {userPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col gap-2.5 flex-1 w-full">
                  {userPieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 last:border-none">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600 font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-400">Total</span>
                    <span className="text-slate-900 font-bold">{stats.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Statuts des Matches */}
        {loading ? <ChartSkeleton /> : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-slate-800 text-lg">Statut des matches</h2>
              </div>
              <p className="text-xs text-slate-400">État d'avancement des mises en relation</p>
            </div>

            {matchStatusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm gap-2"><AlertTriangle className="w-4 h-4"/> Aucun match enregistré</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <div className="w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={matchStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {matchStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col gap-2.5 flex-1 w-full">
                  {matchStatusData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 last:border-none">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600 font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-400">Total Matches</span>
                    <span className="text-slate-900 font-bold">{stats.matches}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Actions rapides ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <h2 className="font-semibold text-slate-900 mb-4 text-base">Actions rapides de gestion</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/users?role=candidat" className="group inline-flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 text-sm font-medium text-slate-700 hover:text-purple-600 transition-all duration-200">
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-500" /> Gérer les utilisateurs
            </span>
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
          
          <Link href="/admin/users?role=candidat" className="group inline-flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 text-sm font-medium text-slate-700 hover:text-purple-600 transition-all duration-200">
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-purple-500" /> Voir les candidats
            </span>
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>

          <Link href="/admin/users?role=candidat" className="group inline-flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 text-sm font-medium text-slate-700 hover:text-purple-600 transition-all duration-200">
            <span className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-purple-500" /> Voir les entreprises
            </span>
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>

          <Link href="/admin/users?role=candidat" className="group inline-flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 text-sm font-medium text-slate-700 hover:text-purple-600 transition-all duration-200">
            <span className="flex items-center gap-2.5">
              <Handshake className="w-4 h-4 text-purple-500" /> Voir tous les matches
            </span>
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  )
}