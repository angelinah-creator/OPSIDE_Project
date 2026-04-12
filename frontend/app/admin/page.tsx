'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi  } from '@/lib/admin-service'
import { Users, UserCheck, Building2, UserX } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, candidats: 0, clients: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getUsers(),
      adminApi.getUsers('candidat'),
      adminApi.getUsers('client'),
    ]).then(([all, cands, clients]) => {
      const allUsers = all.data || []
      const suspended = allUsers.filter((u: any) => u.status === 'suspended').length
      setStats({
        total: allUsers.length,
        candidats: cands.data?.length || 0,
        clients: clients.data?.length || 0,
        suspended,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total utilisateurs', value: stats.total, icon: Users, color: 'bg-accent-soft text-accent' },
    { label: 'Candidats', value: stats.candidats, icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Entreprises', value: stats.clients, icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Suspendus', value: stats.suspended, icon: UserX, color: 'bg-red-50 text-red-500' },
  ]

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard admin</h1>
        <p className="text-muted text-sm mt-1">Vue d'ensemble de la plateforme OPSIDE.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 shadow-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-background rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              )}
              <p className="text-xs text-muted">{c.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
        <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground hover:border-accent/50 hover:bg-accent-soft transition-all">
            <Users className="w-4 h-4 text-accent" /> Gérer les utilisateurs
          </Link>
          <Link href="/admin/users?role=candidat" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground hover:border-accent/50 hover:bg-accent-soft transition-all">
            <UserCheck className="w-4 h-4 text-green-600" /> Voir les candidats
          </Link>
          <Link href="/admin/users?role=client" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground hover:border-accent/50 hover:bg-accent-soft transition-all">
            <Building2 className="w-4 h-4 text-blue-600" /> Voir les entreprises
          </Link>
        </div>
      </div>
    </div>
  )
}
