'use client'

import { useEffect, useState } from 'react'
import { candidateApi, CandidateProfile } from '@/lib/candidate-service'
import { matchService } from '@/lib/match-service'
import { jobOfferApi } from '@/lib/job-offer-service'
import { Search, User, Filter, Send, MapPin, Star, Clock } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function ClientSourcingTab() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [jobOffers, setJobOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOfferId, setSelectedOfferId] = useState<string>('')
  const [invitingId, setInvitingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [candData, offerData] = await Promise.all([
        candidateApi.getAll(),
        jobOfferApi.getClientJobOffers()
      ])
      setCandidates(candData)
      setJobOffers(offerData.data.filter((o: any) => o.status === 'active'))
    } catch (error) {
      console.error('Error fetching sourcing data:', error)
      toast.error('Impossible de charger les candidats')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (candidateId: string) => {
    try {
      setInvitingId(candidateId)
      await matchService.source({
        candidate_id: candidateId,
        job_offer_id: selectedOfferId || undefined
      })
      toast.success('Invitation envoyée !')
    } catch (error: any) {
      console.error('Error inviting candidate:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setInvitingId(null)
    }
  }

  const filteredCandidates = candidates.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Recherche de talents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par compétence, métier, titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
            >
              <option value="">Sourcing direct (pas d'offre)</option>
              {jobOffers.map(o => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">Aucun candidat ne correspond à votre recherche.</p>
          </div>
        ) : (
          filteredCandidates.map((cand) => (
            <div key={cand.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Part: Profile Header */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight capitalize">
                        {cand.title || cand.speciality}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {cand.experience_years} ans d'exp.
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-accent bg-accent/5 px-2.5 py-1 rounded-lg">
                          <Star className="w-4 h-4" />
                          {cand.daily_rate} {cand.currency}/jour
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {cand.bio || "Ce candidat n'a pas encore rédigé de biographie."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {cand.skills.map((skill) => (
                      <span key={skill.id} className="text-[11px] font-bold px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Part: Stats & Action */}
                <div className="w-full md:w-64 flex flex-col justify-between gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Disponibilité</span>
                      <span className="font-bold text-slate-900">{cand.availability}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Statut</span>
                      <span className="text-green-600 font-bold">Actif</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInvite(cand.user_id)}
                    disabled={invitingId === cand.user_id}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-black transition-all disabled:opacity-50 disabled:scale-100 group"
                  >
                    {invitingId === cand.user_id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Inviter le candidat
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
