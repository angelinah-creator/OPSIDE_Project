'use client'

import { useEffect, useState } from 'react'
import { candidateApi, CandidateProfile } from '@/lib/candidate-service'
import { matchService } from '@/lib/match-service'
import { jobOfferApi } from '@/lib/job-offer-service'
import { Search, User, Filter, Send, MapPin, Star, Clock, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'

export default function ClientSourcingTab() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [jobOffers, setJobOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOfferId, setSelectedOfferId] = useState<string>('')
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetCandidateId, setTargetCandidateId] = useState<string | null>(null)

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

  const openInviteModal = (candidateId: string) => {
    setTargetCandidateId(candidateId)
    setIsModalOpen(true)
  }

  const handleInvite = async () => {
    if (!targetCandidateId || !selectedOfferId) {
      toast.error('Veuillez sélectionner une offre')
      return
    }

    try {
      setInvitingId(targetCandidateId)
      setIsModalOpen(false)
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
                    onClick={() => openInviteModal(cand.user_id)}
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

      {/* Invitation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
              onClick={() => setIsModalOpen(false)}
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
    </div>
  )
}
