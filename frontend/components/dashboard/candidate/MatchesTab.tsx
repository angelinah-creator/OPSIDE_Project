'use client'

import { useEffect, useState } from 'react'
import { matchService } from '@/lib/match-service'
import { Bell, User, Check, X, Calendar, MessageSquare, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function CandidateMatchesTab() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const data = await matchService.getCandidateMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Impossible de charger les matchs')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id: string, action: 'confirm' | 'reject') => {
    try {
      setRespondingId(id)
      await matchService.respond(id, action)
      toast.success(action === 'confirm' ? 'Match confirmé !' : 'Match décliné')
      fetchMatches()
    } catch (error) {
      console.error('Error responding to match:', error)
      toast.error('Erreur lors de la réponse')
    } finally {
      setRespondingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Chargement de vos opportunités...</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun match actif</h3>
        <p className="text-slate-500 max-w-sm">
          Postulez à des offres ou attendez d'être sourcé par des clients pour voir vos matchs ici.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                  match.status === 'confirmed' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                )}>
                  <Briefcase className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Invitation de {match.client.client?.company_name || 'Client Anonyme'}
                    {match.status === 'confirmed' && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Matché
                      </span>
                    )}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {match.job_offer?.title || 'Sourcing Direct'}
                  </p>
                  
                  {match.status === 'confirmed' && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Confirmé le {new Date(match.matched_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                {match.status === 'pending_candidate' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(match.id, 'reject')}
                      disabled={respondingId === match.id}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 group"
                      title="Décliner"
                    >
                      {respondingId === match.id ? (
                        <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin group-hover:border-white/30 group-hover:border-t-white" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      Pas Match
                    </button>
                    <button
                      onClick={() => handleRespond(match.id, 'confirm')}
                      disabled={respondingId === match.id}
                      className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {respondingId === match.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Match
                    </button>
                  </div>
                ) : match.status === 'confirmed' ? (
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Calendar className="w-4 h-4" />
                      Voir l'invitation
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all border border-transparent hover:border-accent/10">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      Refusé
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
