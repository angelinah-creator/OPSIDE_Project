'use client'

import { useEffect, useState } from 'react'
import { candidateApi, CandidateProfile } from '@/lib/candidate-service'
import { matchService } from '@/lib/match-service'
import { jobOfferApi } from '@/lib/job-offer-service'
import { Search, User, Filter, Send, Clock, Briefcase, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'

// Récupère mock score
export const getMockScore = (id: string) => {
  if (!id) return 0;
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 65 + (hash % 31); // Score between 65 and 95
};

// Client sourcing tab
export default function ClientSourcingTab() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [jobOffers, setJobOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOfferId, setSelectedOfferId] = useState<string>('')
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [targetCandidateId, setTargetCandidateId] = useState<string | null>(null)

  const [techFilter, setTechFilter] = useState('')
  const [minScore, setMinScore] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch data
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

  // Open invite modal
  const openInviteModal = (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    setTargetCandidateId(candidateId)
    setIsInviteModalOpen(true)
  }

  // Open detail modal
  const openDetailModal = (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate)
    setIsDetailModalOpen(true)
  }

  // Gère invite
  const handleInvite = async () => {
    if (!targetCandidateId || !selectedOfferId) {
      toast.error('Veuillez sélectionner une offre')
      return
    }

    try {
      setInvitingId(targetCandidateId)
      setIsInviteModalOpen(false)
      await matchService.source({
        candidate_id: targetCandidateId,
        job_offer_id: selectedOfferId
      })
      toast.success('Invitation envoyée !')
      setSelectedOfferId('')
      setTargetCandidateId(null)
    } catch (error: any) {
      console.error('Error inviting candidate:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setInvitingId(null)
    }
  }

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTech = !techFilter || c.skills.some(s => s.name.toLowerCase().includes(techFilter.toLowerCase()))
    const score = getMockScore(c.id)
    const matchesScore = score >= minScore

    return matchesSearch && matchesTech && matchesScore
  })

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, techFilter, minScore])

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
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par métier ou titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par techno..."
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
              <Target className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Score min</span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {[0, 20, 30, 40, 50, 60, 70, 80, 90].map(val => (
                    <option key={val} value={val}>{val === 0 ? 'Tous' : `+${val}%`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCandidates.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Aucun candidat ne correspond à vos critères.</p>
          </div>
        ) : (
          paginatedCandidates.map((cand) => {
            const score = getMockScore(cand.id)
            return (
              <div
                key={cand.id}
                onClick={() => openDetailModal(cand)}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={clsx(
                      "px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5",
                      score >= 80 ? "bg-green-50 text-green-600" : score >= 60 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                    )}>
                      {score}%
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Test Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight capitalize line-clamp-1">
                      {cand.title || cand.speciality}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {cand.experience_years} ans d'expérience
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                        TJM : {cand.daily_rate} {cand.currency}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic">
                    {cand.bio || "Ce candidat n'a pas encore rédigé de biographie."}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.slice(0, 20).map((skill) => (
                      <span key={skill.id} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                        {skill.name}
                      </span>
                    ))}
                    {cand.skills.length > 20 && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                        +{cand.skills.length - 20}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                  <button
                    onClick={(e) => openInviteModal(e, cand.user_id)}
                    disabled={invitingId === cand.user_id}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50 group"
                  >
                    {invitingId === cand.user_id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Inviter
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={clsx(
                  "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                  currentPage === i + 1
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "hover:bg-slate-50 text-slate-400"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Invitation Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Sélectionner une offre"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-slate-500 text-sm">
            Choisissez l'offre pour laquelle vous souhaitez inviter ce candidat.
          </p>

          <div className="space-y-3">
            {jobOffers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">Vous n'avez aucune offre active.</p>
                <a href="/client/dashboard" className="text-xs font-bold text-accent mt-2 inline-block">Créer une offre</a>
              </div>
            ) : (
              jobOffers.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={clsx(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                    selectedOfferId === offer.id
                      ? "bg-accent/5 border-accent shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    selectedOfferId === offer.id ? "bg-accent text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                  )}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "font-bold truncate",
                      selectedOfferId === offer.id ? "text-accent" : "text-slate-900"
                    )}>
                      {offer.title}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">Postée le {new Date(offer.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    selectedOfferId === offer.id ? "border-accent bg-accent" : "border-slate-200"
                  )}>
                    {selectedOfferId === offer.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleInvite}
              disabled={!selectedOfferId}
              className="flex-2 px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
            >
              Envoyer l'invitation
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Détails du candidat"
          size="lg"
        >
          <div className="space-y-8 pb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight capitalize">
                  {selectedCandidate.title || selectedCandidate.speciality}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <Clock className="w-4 h-4" />
                    {selectedCandidate.experience_years} ans d'expérience
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-accent">
                    TJM : {selectedCandidate.daily_rate} {selectedCandidate.currency}/jour
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                    <Target className="w-4 h-4" />
                    Score Technique: {getMockScore(selectedCandidate.id)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-[1px] bg-slate-100" />
                Biographie complète
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap italic bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                {selectedCandidate.bio || "Aucune biographie renseignée."}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-[1px] bg-slate-100" />
                Compétences ({selectedCandidate.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill) => (
                  <span key={skill.id} className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-100 shadow-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={(e) => openInviteModal(e, selectedCandidate.user_id)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-base hover:bg-black transition-all shadow-xl shadow-slate-900/10"
              >
                <Send className="w-5 h-5" />
                Inviter ce candidat maintenant
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
