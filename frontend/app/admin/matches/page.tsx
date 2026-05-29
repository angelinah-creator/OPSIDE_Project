'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { adminApi } from '@/lib/admin-service'
import { 
  Search, 
  RefreshCw, 
  Handshake, 
  ArrowRight, 
  Calendar, 
  Building2, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

interface Match {
  id: string
  candidate_id: string
  client_id: string
  job_offer_id: string | null
  status: 'pending_candidate' | 'pending_client' | 'confirmed' | 'in_workspace' | 'rejected'
  initiated_by: 'candidate' | 'client'
  matched_at: string | null
  rejected_at: string | null
  rejected_by: string | null
  calendly_url: string | null
  candidate: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    candidate: {
      id: string
      photo_url: string | null
      title: string | null
      speciality: string
      custom_speciality: string | null
    } | null
  }
  client: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    client: {
      id: string
      company_name: string
      logo_url: string | null
    } | null
  }
  job_offer: {
    id: string
    title: string
    speciality: string
    contract_duration: string | null
    tjm_client: string | number
  } | null
}

const STATUS_LABELS: Record<Match['status'], { label: string; class: string}> = {
  pending_candidate: { 
    label: 'Attente Candidat', 
    class: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  pending_client: { 
    label: 'Attente Entreprise', 
    class: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
  confirmed: { 
    label: 'Match Confirmé', 
    class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  },
  in_workspace: { 
    label: 'Workspace Actif', 
    class: 'bg-purple-50 text-purple-700 border-purple-200/60',
  },
  rejected: { 
    label: 'Refusé / Clôturé', 
    class: 'bg-rose-50 text-rose-700 border-rose-200/60',
  },
}

const SPECIALITY_LABELS: Record<string, string> = {
  frontend: 'Front-end',
  backend: 'Back-end',
  fullstack: 'Fullstack',
  mobile: 'Mobile',
  devops: 'DevOps / Cloud',
  data: 'Data',
  design: 'Product Design',
  other: 'Autre',
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50]

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtering states
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await adminApi.getMatches()
      setMatches(data || [])
    } catch (err: any) {
      console.error(err)
      setError('Erreur lors de la récupération de la liste des matches.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedClient, selectedStatus])

  // Get list of unique clients present in matches for filter dropdown
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>()
    matches.forEach(m => {
      if (m.client) {
        const id = m.client.id
        const name = m.client.client?.company_name || `${m.client.first_name || ''} ${m.client.last_name || ''}`.trim() || m.client.email
        map.set(id, name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [matches])

  // Filtered matches (exclude 'rejected')
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // Exclude rejected matches from the list
      if (m.status === 'rejected') return false

      // 1. Search Query
      const q = search.toLowerCase()
      const candidateName = `${m.candidate?.first_name || ''} ${m.candidate?.last_name || ''}`.toLowerCase()
      const candidateEmail = (m.candidate?.email || '').toLowerCase()
      const clientCompany = (m.client?.client?.company_name || '').toLowerCase()
      const clientName = `${m.client?.first_name || ''} ${m.client?.last_name || ''}`.toLowerCase()
      const projectTitle = (m.job_offer?.title || '').toLowerCase()
      
      const matchesSearch = !search || 
        candidateName.includes(q) ||
        candidateEmail.includes(q) ||
        clientCompany.includes(q) ||
        clientName.includes(q) ||
        projectTitle.includes(q)

      // 2. Client Filter
      const matchesClient = !selectedClient || m.client_id === selectedClient

      // 3. Status Filter
      const matchesStatus = !selectedStatus || m.status === selectedStatus

      return matchesSearch && matchesClient && matchesStatus
    })
  }, [matches, search, selectedClient, selectedStatus])

  // Pagination calculations
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage)
  const paginatedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredMatches.slice(startIndex, endIndex)
  }, [filteredMatches, currentPage, itemsPerPage])

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Statistics
  const stats = useMemo(() => {
    return {
      total: matches.length,
      confirmed: matches.filter(m => m.status === 'confirmed').length,
      workspace: matches.filter(m => m.status === 'in_workspace').length,
      pending: matches.filter(m => m.status === 'pending_candidate' || m.status === 'pending_client').length,
      rejected: matches.filter(m => m.status === 'rejected').length,
    }
  }, [matches])

  // Initials generator
  const getInitials = (firstName: string | null, lastName: string | null, fallback: string) => {
    if (!firstName && !lastName) return fallback.substring(0, 2).toUpperCase()
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  // Get status options (excluding 'rejected')
  const statusOptions = useMemo(() => {
    return Object.entries(STATUS_LABELS).filter(([key]) => key !== 'rejected')
  }, [])

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            Suivi des Matches
          </h1>
          <p className="text-muted text-sm mt-1">
            Gérez et observez les relations et contrats d'embauche de la plateforme.
          </p>
        </div>
        <button 
          onClick={fetchMatches} 
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-medium"
        >
          <RefreshCw className={clsx("w-4 h-4 text-slate-500", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-accent/10 text-accent">
            <Handshake className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? '...' : stats.total}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Matches</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-accent/10 text-accent">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? '...' : stats.confirmed}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Confirmés</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-accent/10 text-accent">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? '...' : stats.workspace}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Workspaces Actifs</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-accent/10 text-accent">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? '...' : stats.pending}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">En Attente</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-accent/10 text-accent">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{loading ? '...' : stats.rejected}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Refusés</p>
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col lg:flex-row gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par candidat, client ou projet..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFD] text-sm focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all text-slate-800"
          />
        </div>

        {/* Client selector */}
        <div className="w-full lg:w-60 relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFD] text-sm focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all appearance-none text-slate-700 font-medium"
          >
            <option value="">Tous les clients ({clientOptions.length})</option>
            {clientOptions.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-500 w-0 h-0" />
        </div>

        {/* Status selector - sans l'option "Refusé / Clôturé" */}
        <div className="w-full lg:w-56 relative">
          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFD] text-sm focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all appearance-none text-slate-700 font-medium"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-500 w-0 h-0" />
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          // Loading Skeletons
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="relative w-16 h-10 bg-slate-100 rounded-lg shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-16" />
                <div className="h-7 bg-slate-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          // Empty State
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mb-4 border border-slate-100">
              <Handshake className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Aucun match trouvé</h3>
            <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
              Aucune relation ne correspond à vos filtres de recherche pour le moment.
            </p>
            {(search || selectedClient || selectedStatus) && (
              <button
                onClick={() => { setSearch(''); setSelectedClient(''); setSelectedStatus('') }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-sm"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Interactive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAFBFD]/60">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Candidat & Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Projet & Spécialité</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Conditions</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Initiative & Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMatches.map(match => {
                    const statusInfo = STATUS_LABELS[match.status] || {
                      label: match.status,
                      class: 'bg-slate-50 text-slate-600 border-slate-200',
                    }
                    
                    const candidateName = `${match.candidate?.first_name || ''} ${match.candidate?.last_name || ''}`.trim() || 'Inconnu'
                    const clientCompany = match.client?.client?.company_name || `${match.client?.first_name || ''} ${match.client?.last_name || ''}`.trim() || 'Inconnu'
                    const candidateSpec = match.candidate?.candidate?.speciality
                    const clientLogo = match.client?.client?.logo_url
                    const candidatePhoto = match.candidate?.candidate?.photo_url

                    return (
                      <tr key={match.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative flex items-center shrink-0 w-16 h-10 select-none">
                              {candidatePhoto ? (
                                <img
                                  src={candidatePhoto}
                                  alt={candidateName}
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200/80 z-20"
                                />
                              ) : (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-200/80 z-20">
                                  {getInitials(match.candidate?.first_name, match.candidate?.last_name, match.candidate?.email || 'CA')}
                                </div>
                              )}
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-4 h-0.5 bg-slate-300" />
                              {clientLogo ? (
                                <img
                                  src={clientLogo}
                                  alt={clientCompany}
                                  className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200/80 z-20 bg-white"
                                />
                              ) : (
                                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-200/80 z-20">
                                  {clientCompany[0]?.toUpperCase() || 'CL'}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-accent transition-colors">
                                {candidateName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-medium">
                                <span>pour</span>
                                <Building2 className="w-3 h-3 text-slate-350" />
                                <span className="text-slate-500 font-semibold">{clientCompany}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                              {match.job_offer?.title || 'Invitation directe'}
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {SPECIALITY_LABELS[match.job_offer?.speciality || candidateSpec || ''] || 'Spécialité indéterminée'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            {match.job_offer?.tjm_client ? (
                              <>
                                <p className="text-sm font-bold text-slate-800">
                                  {Number(match.job_offer.tjm_client).toLocaleString('fr-FR')} € <span className="text-[10px] text-slate-400 font-normal">/ jour</span>
                                </p>
                                {match.job_offer.contract_duration && (
                                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                    Durée : {match.job_offer.contract_duration}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-slate-400 italic">Non spécifié</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-slate-500">Initié par :</span>
                              <span className={clsx(
                                "text-xs font-bold",
                                match.initiated_by === 'client' ? "text-blue-600" : "text-purple-600"
                              )}>
                                {match.initiated_by === 'client' ? 'Entreprise' : 'Candidat'}
                              </span>
                            </div>
                            {match.matched_at ? (
                              <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span>Matché le {new Date(match.matched_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-450 mt-1 italic">En attente d'acceptation</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={clsx(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm/5 transition-colors",
                            statusInfo.class
                          )}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredMatches.length)} sur {filteredMatches.length} matchs
              </div>
              
              <div className="flex items-center gap-3">
                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={clsx(
                            "min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all",
                            currentPage === pageNum
                              ? "bg-accent text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}