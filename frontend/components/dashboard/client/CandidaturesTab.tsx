'use client'

import { useEffect, useState } from 'react'
import { candidatureService } from '@/lib/candidature-service'
import { Check, X, FileText, User, Briefcase, MapPin, DollarSign, Calendar, Clock, Globe, Link as LinkIcon, Download } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'

export default function ClientCandidaturesTab() {
  const [candidatures, setCandidatures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  useEffect(() => {
    fetchCandidatures()
  }, [])

  const fetchCandidatures = async () => {
    try {
      const data = await candidatureService.getClientApplications()
      setCandidatures(data)
    } catch (error) {
      console.error('Error fetching candidatures:', error)
      toast.error('Impossible de charger les candidatures')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: 'matched' | 'rejected') => {
    try {
      setIsUpdating(`${id}-${status}`)
      await candidatureService.updateStatus(id, status)
      toast.success(status === 'matched' ? 'Match confirmé !' : 'Candidature refusée')
      await fetchCandidatures()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(null)
    }
  }

  const formatDate = (m?: number, y?: number) => {
    if (!y) return '';
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${m ? months[m - 1] + ' ' : ''}${y}`;
  };

  const AVAIL_LABEL: Record<string, string> = {
    immediate: 'Immédiat', two_weeks: 'Sous 2 semaines', one_month: 'Sous 1 mois', three_months: 'Sous 3 mois',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Chargement des candidatures...</p>
      </div>
    )
  }

  if (candidatures.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune candidature</h3>
        <p className="text-slate-500 max-w-sm">
          Vous n'avez pas encore reçu de candidatures pour vos offres d'emploi.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {candidatures.map((cand) => (
          <div key={cand.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                  {cand.candidate.candidate?.photo_url ? (
                    <img 
                      src={cand.candidate.candidate.photo_url.startsWith('http') ? cand.candidate.candidate.photo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${cand.candidate.candidate.photo_url}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => setSelectedCandidate(cand.candidate)}
                    className="text-xl font-black text-slate-900 hover:text-accent transition-colors text-left leading-tight"
                  >
                    {cand.candidate.first_name} {cand.candidate.last_name}
                  </button>
                  <p className="text-accent font-bold text-xs uppercase tracking-wider mt-0.5">
                    {cand.candidate.candidate?.title || cand.candidate.candidate?.speciality || 'Talent'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs font-bold">{cand.job_offer.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold">{cand.candidate.candidate?.experience_years || 0} ans exp.</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                <div className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  cand.status === 'pending' && "bg-amber-100 text-amber-700",
                  cand.status === 'matched' && "bg-green-100 text-green-700",
                  cand.status === 'rejected' && "bg-red-100 text-red-700",
                )}>
                  {cand.status === 'pending' ? 'En attente' : cand.status === 'matched' ? 'Matché' : 'Pas Match'}
                </div>
                
                {cand.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleStatusUpdate(cand.id, 'rejected')}
                      disabled={!!isUpdating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100 hover:border-red-100 font-bold text-sm disabled:opacity-50"
                    >
                      {isUpdating === `${cand.id}-rejected` ? <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                      Pas Match
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(cand.id, 'matched')}
                      disabled={!!isUpdating}
                      className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isUpdating === `${cand.id}-matched` ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                      Match
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Profile Modal */}
      {selectedCandidate && (
        <Modal 
          isOpen={!!selectedCandidate} 
          onClose={() => setSelectedCandidate(null)}
          title="Profil du candidat"
          size="xl"
        >
          <div className="space-y-12 pb-10">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-50">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0 shadow-inner">
                {selectedCandidate.candidate?.photo_url ? (
                  <img 
                    src={selectedCandidate.candidate.photo_url.startsWith('http') ? selectedCandidate.candidate.photo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${selectedCandidate.candidate.photo_url}`} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">
                  {selectedCandidate.first_name} {selectedCandidate.last_name}
                </h2>
                <p className="text-accent font-black text-xl uppercase tracking-widest">{selectedCandidate.candidate?.title || selectedCandidate.candidate?.speciality || 'Talent'}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {selectedCandidate.candidate?.city}, {selectedCandidate.candidate?.country}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {selectedCandidate.candidate?.experience_years} ans d'expérience
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100 text-green-700 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Dispo: {AVAIL_LABEL[selectedCandidate.candidate?.availability] || selectedCandidate.candidate?.availability}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Bio & Skills */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-slate-100" />
                    Biographie
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                    {selectedCandidate.candidate?.bio || "Aucune biographie renseignée."}
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-slate-100" />
                    Expériences professionnelles
                  </h3>
                  <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                    {selectedCandidate.candidate?.experiences?.map((exp: any) => (
                      <div key={exp.id} className="relative pl-12">
                        <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{exp.title}</h4>
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">
                              {formatDate(exp.start_month, exp.start_year)} — {exp.is_current ? 'Présent' : formatDate(exp.end_month, exp.end_year)}
                            </span>
                          </div>
                          <p className="text-accent font-bold uppercase tracking-widest text-xs mb-4">{exp.company} • {exp.location}</p>
                          <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{exp.description}</p>
                          
                          {/* Media Gallery (Images only for now) */}
                          {exp.medias?.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                              {exp.medias.map((m: any) => (
                                <div key={m.id} className="relative shrink-0 w-48 h-32 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group cursor-pointer">
                                  <img src={m.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Info & Educations */}
              <div className="space-y-12">
                <section className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Informations clés</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><DollarSign className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">TJM</p>
                        <p className="text-sm font-black text-slate-900">{selectedCandidate.candidate?.daily_rate} {selectedCandidate.candidate?.currency || '€'}/j</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Globe className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Contact</p>
                        <p className="text-sm font-black text-slate-900 truncate">{selectedCandidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      {selectedCandidate.candidate?.linkedin_url && (
                        <a href={selectedCandidate.candidate.linkedin_url} target="_blank" className="p-3 bg-white hover:bg-accent hover:text-white rounded-xl border border-slate-100 text-slate-400 transition-all shadow-sm">
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {selectedCandidate.candidate?.portfolio_url && (
                        <a href={selectedCandidate.candidate.portfolio_url} target="_blank" className="p-3 bg-white hover:bg-accent hover:text-white rounded-xl border border-slate-100 text-slate-400 transition-all shadow-sm">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.candidate?.candidate_skills?.map((cs: any) => (
                      <span key={cs.skill.id} className="px-3 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl border border-slate-100 shadow-sm">
                        {cs.skill.name}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Formation</h3>
                  <div className="space-y-4">
                    {selectedCandidate.candidate?.educations?.map((edu: any) => (
                      <div key={edu.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{edu.degree}</h4>
                        <p className="text-accent font-bold text-[10px] uppercase tracking-widest mb-3">{edu.school}</p>
                        <p className="text-slate-500 text-xs">{edu.start_year} — {edu.is_current ? 'Présent' : edu.end_year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
