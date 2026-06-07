'use client'

import { useEffect, useState, useCallback } from 'react'
import { matchService } from '@/lib/match-service'
import { toast } from 'sonner'
import { Users, User, Briefcase, MapPin, DollarSign, Globe, LinkIcon, Target, XCircle, AlertTriangle } from 'lucide-react';

import Modal from '@/components/ui/Modal'
import { getMockScore } from '@/components/dashboard/client/SourcingTab'

const AVAIL_LABEL: Record<string, string> = {
  immediate: 'Immédiat', two_weeks: 'Sous 2 semaines',
  one_month: 'Sous 1 mois', three_months: 'Sous 3 mois', unavailable: 'Indisponible'
}

// Formate date
const formatDate = (m?: number, y?: number) => {
  if (!y) return ''
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${m ? months[m - 1] + ' ' : ''}${y}`
}

type Collaborateur = {
  id: string
  candidate_id: string
  matched_at?: string
  job_offer?: { title: string }
  custom_test?: { score?: number; status: string; threshold: number }
  candidate: {
    id: string
    first_name?: string
    last_name?: string
    email: string
    candidate?: {
      title?: string
      speciality?: string
      experience_years?: number
      photo_url?: string
      availability?: string
      daily_rate?: number | string
      currency?: string
      country?: string
      city?: string
      bio?: string
      linkedin_url?: string
      github_url?: string
      portfolio_url?: string
      candidate_skills?: { skill: { id: string; name: string } }[]
      experiences?: any[]
      educations?: any[]
    }
  }
}

// Workspace collaborateurs
export default function WorkspaceCollaborateurs() {
  const [collabs, setCollabs] = useState<Collaborateur[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCollab, setSelectedCollab] = useState<Collaborateur | null>(null)
  const [showEndModal, setShowEndModal] = useState(false)
  const [endingId, setEndingId] = useState<string | null>(null)

  const fetchCollabs = useCallback(async () => {
    try {
      const data = await matchService.getClientMatches()
      setCollabs(data.filter((m: any) => m.status === 'in_workspace'))
    } catch {
      toast.error('Impossible de charger les collaborateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCollabs() }, [fetchCollabs])

  // Gère end contract
  const handleEndContract = async () => {
    if (!selectedCollab) return
    try {
      setEndingId(selectedCollab.id)
      await matchService.endContract(selectedCollab.id)
      toast.success('Contrat terminé. Le candidat a été notifié.')
      setShowEndModal(false)
      setSelectedCollab(null)
      await fetchCollabs()
    } catch {
      toast.error('Erreur lors de la fin de contrat')
    } finally {
      setEndingId(null)
    }
  }

  // Récupère a p i
  const getAPI = (url?: string) => {
    if (!url) return null
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Chargement des collaborateurs...</p>
    </div>
  )

  if (collabs.length === 0) return (
    <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        <Users className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun collaborateur</h3>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Stats header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{collabs.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collaborateurs</p>
          </div>
        </div>
      </div>

      {/* Collaborateurs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {collabs.map((collab) => {
          const dev = collab.candidate
          const profile = dev.candidate
          const score = getMockScore(profile?.speciality ? dev.id : dev.id)
          const photoUrl = getAPI(profile?.photo_url)
          const name = `${dev.first_name || ''} ${dev.last_name || ''}`.trim() || 'Développeur'

          return (
            <div
              key={collab.id}
              onClick={() => setSelectedCollab(collab)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-base truncate group-hover:text-accent transition-colors">{name}</h3>
                  <p className="text-accent text-[10px] font-black uppercase tracking-wider truncate">
                    {profile?.title || profile?.speciality || 'Développeur'}
                  </p>
                  {collab.job_offer && (
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1 truncate">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      {collab.job_offer.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Expérience</p>
                  <p className="text-xs font-black text-slate-900">{profile?.experience_years || 0} ans</p>
                </div>
                <div className="bg-accent/5 rounded-xl p-2.5 border border-accent/10">
                  <p className="text-[9px] text-accent font-bold uppercase mb-0.5">Score</p>
                  <p className="text-xs font-black text-accent">{score}%</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {profile?.candidate_skills?.slice(0, 5).map((cs: any) => (
                  <span key={cs.skill.id} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg border border-slate-100 uppercase">
                    {cs.skill.name}
                  </span>
                ))}
                {(profile?.candidate_skills?.length || 0) > 5 && (
                  <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-lg border border-slate-100">
                    +{(profile?.candidate_skills?.length || 0) - 5}
                  </span>
                )}
              </div>

              {/* Matched date */}
              {collab.matched_at && (
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-medium">
                    En mission depuis le {new Date(collab.matched_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Profile Modal — identique à CandidaturesTab */}
      {selectedCollab && !showEndModal && (
        <Modal
          isOpen={!!selectedCollab}
          onClose={() => setSelectedCollab(null)}
          title="Profil du collaborateur"
          size="xl"
        >
          <div className="space-y-12 pb-10">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-50">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0 shadow-inner">
                {getAPI(selectedCollab.candidate.candidate?.photo_url) ? (
                  <img src={getAPI(selectedCollab.candidate.candidate?.photo_url)!} alt="" className="w-full h-full object-cover" />
                ) : <User className="w-12 h-12 text-slate-300" />}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">
                  {selectedCollab.candidate.first_name} {selectedCollab.candidate.last_name}
                </h2>
                <p className="text-accent font-black text-xl uppercase tracking-widest">
                  {selectedCollab.candidate.candidate?.title || selectedCollab.candidate.candidate?.speciality || 'Talent'}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {selectedCollab.candidate.candidate?.city}, {selectedCollab.candidate.candidate?.country}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {selectedCollab.candidate.candidate?.experience_years} ans d'expérience
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100 text-green-700 font-bold text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    En mission
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-xl border border-accent/10 text-accent font-black text-sm">
                    <Target className="w-4 h-4" />
                    Score: {getMockScore(selectedCollab.candidate.id)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: Bio + Experience + Education */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-slate-100" /> Biographie
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                    {selectedCollab.candidate.candidate?.bio || 'Aucune biographie renseignée.'}
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-slate-100" /> Expériences professionnelles
                  </h3>
                  <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                    {selectedCollab.candidate.candidate?.experiences?.map((exp: any) => (
                      <div key={exp.id} className="relative pl-12">
                        <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{exp.title}</h4>
                          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">
                            {formatDate(exp.start_month, exp.start_year)} — {exp.is_current ? 'Présent' : formatDate(exp.end_month, exp.end_year)}
                          </span>
                        </div>
                        <p className="text-accent font-bold uppercase tracking-widest text-xs mb-4">{exp.company} • {exp.location}</p>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                    {!selectedCollab.candidate.candidate?.experiences?.length && (
                      <p className="text-slate-400 text-sm pl-12">Aucune expérience renseignée.</p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-slate-100" /> Formation
                  </h3>
                  <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                    {selectedCollab.candidate.candidate?.educations?.map((edu: any) => (
                      <div key={edu.id} className="relative pl-12">
                        <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{edu.degree}</h4>
                          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">
                            {edu.start_year} — {edu.is_current ? 'Présent' : edu.end_year}
                          </span>
                        </div>
                        <p className="text-accent font-bold uppercase tracking-widest text-xs mb-4">{edu.school}</p>
                        {edu.description && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right: Info + Skills + Action */}
              <div className="space-y-8">
                <section className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Informations clés</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">TJM</p>
                        <p className="text-sm font-black text-slate-900">
                          {selectedCollab.candidate.candidate?.daily_rate} {selectedCollab.candidate.candidate?.currency || '€'}/j
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Email</p>
                        <p className="text-sm font-black text-slate-900 truncate">{selectedCollab.candidate.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                      {selectedCollab.candidate.candidate?.linkedin_url && (
                        <a href={selectedCollab.candidate.candidate.linkedin_url} target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#0077B5] hover:text-white rounded-xl border border-slate-100 text-slate-600 font-bold text-xs transition-all shadow-sm group">
                          <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-white" /> LinkedIn
                        </a>
                      )}
                      {selectedCollab.candidate.candidate?.github_url && (
                        <a href={selectedCollab.candidate.candidate.github_url} target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-black hover:text-white rounded-xl border border-slate-100 text-slate-600 font-bold text-xs transition-all shadow-sm group">
                          <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-white" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollab.candidate.candidate?.candidate_skills?.map((cs: any) => (
                      <span key={cs.skill.id} className="px-3 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-100 shadow-sm">
                        {cs.skill.name}
                      </span>
                    ))}
                  </div>
                </section>

                {/* End contract */}
                <button
                  onClick={() => setShowEndModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-2xl font-bold text-sm transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Mettre fin au contrat
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* End contract confirmation modal */}
      {showEndModal && selectedCollab && (
        <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)} title="Fin de contrat" size="sm">
          <div className="space-y-6 pb-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 text-sm mb-1">Confirmer la fin de contrat</p>
                <p className="text-red-700 text-sm">
                  Vous êtes sur le point de mettre fin à la collaboration avec{' '}
                  <strong>{selectedCollab.candidate.first_name} {selectedCollab.candidate.last_name}</strong>.
                  Le candidat sera notifié par email. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleEndContract}
                disabled={endingId === selectedCollab.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {endingId === selectedCollab.id
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <XCircle className="w-4 h-4" />}
                Confirmer la fin
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
