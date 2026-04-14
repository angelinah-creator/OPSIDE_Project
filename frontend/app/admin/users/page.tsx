'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { adminApi  } from '@/lib/admin-service'
import Button from '@/components/ui/Button'
import { User } from '@/lib/auth-service'
import { Search, ChevronDown, ShieldOff, ShieldCheck, RefreshCw, Filter } from 'lucide-react'
import clsx from 'clsx'

const ROLES = [
  { value: '', label: 'Tous les rôles' },
  { value: 'candidat', label: 'Candidats' },
  { value: 'client', label: 'Entreprises' },
]

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  active: { label: 'Actif', class: 'bg-green-50 text-green-600 border-green-200' },
  suspended: { label: 'Suspendu', class: 'bg-red-50 text-red-500 border-red-200' },
  pending: { label: 'En attente', class: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
}

const ROLE_LABELS: Record<string, { label: string; class: string }> = {
  candidat: { label: 'Candidat', class: 'bg-accent-soft text-accent border-accent/20' },
  client: { label: 'Entreprise', class: 'bg-blue-50 text-blue-600 border-blue-200' },
  admin: { label: 'Admin', class: 'bg-foreground text-white border-foreground' },
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState(searchParams.get('role') || '')
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getUsers(role || undefined)
      setUsers(data || [])
    } catch { setError('Erreur lors du chargement des utilisateurs.') }
    finally { setLoading(false) }
  }, [role])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      users.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q)
      )
    )
  }, [search, users])

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
    setActionLoading(user.id)
    try {
      await adminApi.updateUserStatus(user.id, newStatus)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    } catch { setError('Erreur lors de la mise à jour du statut.') }
    finally { setActionLoading(null) }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
        <p className="text-muted text-sm mt-1">{users.length} utilisateur(s) au total.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); router.push(r.value ? `/admin/users?role=${r.value}` : '/admin/users') }}
              className={clsx(
                'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                role === r.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-background text-muted border-border hover:border-accent/50'
              )}
            >
              {r.label}
            </button>
          ))}
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-border bg-background text-muted hover:text-foreground hover:border-accent/50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Inscrit le</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(user => {
                  const roleInfo = ROLE_LABELS[user.role] || { label: user.role, class: 'bg-background text-muted border-border' }
                  const statusInfo = STATUS_LABELS[user.status] || { label: user.status, class: 'bg-background text-muted border-border' }
                  const isSuspended = user.status === 'suspended'
                  return (
                    <tr key={user.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar or Initials */}
                          {user.candidate?.photo_url || user.client?.logo_url ? (
                            <img 
                              src={user.candidate?.photo_url || user.client?.logo_url} 
                              alt="" 
                              className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0 uppercase">
                              {user.first_name?.[0] || user.client?.company_name?.[0] || user.email[0]}
                              {(user.last_name?.[0] || (user.client?.company_name && user.client.company_name.length > 1 ? user.client.company_name[1] : ''))}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user.role === 'client' && user.client?.company_name ? user.client.company_name : `${user.first_name} ${user.last_name}`}
                            </p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${roleInfo.class}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <Button
                            variant={isSuspended ? 'secondary' : 'ghost'}
                            size="sm"
                            loading={actionLoading === user.id}
                            onClick={() => toggleStatus(user)}
                            className={isSuspended ? '' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}
                          >
                            {isSuspended ? (
                              <><ShieldCheck className="w-3.5 h-3.5" /> Réactiver</>
                            ) : (
                              <><ShieldOff className="w-3.5 h-3.5" /> Suspendre</>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
