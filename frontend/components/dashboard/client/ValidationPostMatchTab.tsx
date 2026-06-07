'use client'

import { useEffect, useState, useCallback } from 'react'
import { matchService } from '@/lib/match-service'
import { customTestService, CreateCustomTestPayload } from '@/lib/custom-test-service'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, RefreshCw, Calendar, FlaskConical, User, Briefcase, Target, Plus, Minus, Home } from 'lucide-react';
import clsx from 'clsx'
import Modal from '@/components/ui/Modal'

const SKILLS_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'Node.js',
  'NestJS', 'Python', 'Django', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'REST API', 'Git', 'CI/CD',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Spring Boot', 'Go', 'Rust',
]

const DIFFICULTY_LABELS: Record<string, string> = {
  junior: 'Junior (< 2 ans)',
  mid: 'Mid (2–5 ans)',
  senior: 'Senior (> 5 ans)',
}

type Match = {
  id: string
  candidate_id: string
  status: string
  matched_at?: string
  calendly_url?: string
  job_offer?: { title: string; id: string }
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
      candidate_skills?: { skill: { id: string; name: string } }[]
    }
  }
  custom_test?: any
}

// Validation post match tab
export default function ValidationPostMatchTab() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showTestModal, setShowTestModal] = useState(false)
  const [sendingCalendly, setSendingCalendly] = useState<string | null>(null)
  const [requestingRetest, setRequestingRetest] = useState<string | null>(null)
  const [addingToWorkspace, setAddingToWorkspace] = useState<string | null>(null)
  const [rejectingMatch, setRejectingMatch] = useState<string | null>(null)

  const [showCalendlyModal, setShowCalendlyModal] = useState(false)
  const [calendlyUrl, setCalendlyUrl] = useState('')
  const [selectedMatchForCalendly, setSelectedMatchForCalendly] = useState<any>(null)

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<'junior' | 'mid' | 'senior'>('mid')
  const [duration, setDuration] = useState(60)
  const [instructions, setInstructions] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const fetchMatches = useCallback(async () => {
    try {
      const data = await matchService.getClientMatches()
      setMatches(data.filter((m: Match) => m.status === 'confirmed'))
    } catch {
      toast.error('Impossible de charger les matches')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  // Open test modal
  const openTestModal = (match: Match) => {
    setSelectedMatch(match)
    setSelectedSkills([])
    setDifficulty('mid')
    setDuration(60)
    setInstructions('')
    setShowTestModal(true)
  }

  // Toggle skill
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  // Gère send test
  const handleSendTest = async () => {
    if (!selectedMatch) return
    if (selectedSkills.length === 0) { toast.error('Sélectionnez au moins une compétence'); return }
    try {
      setIsSendingTest(true)
      await customTestService.createTest({
        candidate_id: selectedMatch.candidate_id,
        match_id: selectedMatch.id,
        skills_tested: selectedSkills,
        difficulty,
        duration_minutes: duration,
        custom_instructions: instructions || undefined,
      } as CreateCustomTestPayload)
      toast.success('Test envoyé au candidat !')
      setShowTestModal(false)
      await fetchMatches()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'envoi du test')
    } finally {
      setIsSendingTest(false)
    }
  }

  // Gère send calendly
  const handleSendCalendly = async (matchId: string) => {
    try {
      setSendingCalendly(matchId)
      await customTestService.sendCalendlyDirectly(matchId)
      toast.success('Lien Calendly envoyé au candidat !')
    } catch {
      toast.error('Erreur lors de l\'envoi du lien')
    } finally {
      setSendingCalendly(null)
    }
  }

  // Gère add to workspace
  const handleAddToWorkspace = async (matchId: string) => {
    try {
      setAddingToWorkspace(matchId)
      await matchService.addToWorkspace(matchId)
      toast.success('Candidat ajouté au Workspace !')
      await fetchMatches()
    } catch {
      toast.error('Erreur lors de l\'ajout au Workspace')
    } finally {
      setAddingToWorkspace(null)
    }
  }

  // Gère retest
  const handleRetest = async (testId: string) => {
    try {
      setRequestingRetest(testId)
      await customTestService.requestRetest(testId)
      toast.success('Retest envoyé au candidat !')
      await fetchMatches()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors du retest')
    } finally {
      setRequestingRetest(null)
    }
  }

  // Gère reject match
  const handleRejectMatch = async (matchId: string) => {
    try {
      setRejectingMatch(matchId)
      await matchService.respond(matchId, 'reject')
      toast.success('Match refusé.')
      await fetchMatches()
    } catch (err: any) {
      toast.error('Erreur lors du refus')
    } finally {
      setRejectingMatch(null)
    }
  }

  // Récupère test status badge
  const getTestStatusBadge = (test: any) => {
    if (!test) return null
    const cfg: Record<string, { label: string; cls: string }> = {
      sent: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
      in_progress: { label: 'En cours', cls: 'bg-blue-100 text-blue-700' },
      scored: { label: test.score >= test.threshold ? `  ${test.score}%` : ` ${test.score}%`, cls: test.score >= test.threshold ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' },
      expired: { label: 'Expiré', cls: 'bg-slate-100 text-slate-500' },
    }
    const c = cfg[test.status] || { label: test.status, cls: 'bg-slate-100 text-slate-500' }
    return <span className={clsx('px-2 py-0.5 rounded-lg text-[10px] font-black uppercase', c.cls)}>{c.label}</span>
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] gap-4 flex-col">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Chargement...</p>
    </div>
  )

  if (matches.length === 0) return (
    <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        <FlaskConical className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun match confirmé</h3>
      <p className="text-slate-500 max-w-sm">Les candidats avec qui vous avez un match confirmé apparaîtront ici pour la validation post-match.</p>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black mb-1">Validation Post-Match</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Pour chaque match confirmé, vous pouvez <strong className="text-white">envoyer un test technique custom</strong> (seuil 75%) ou <strong className="text-white">vous fier au score plateforme</strong> et envoyer directement le lien d'entretien.
            </p>
          </div>
        </div>
      </div>

      {/* Matches grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matches.map((match) => {
          const candidateName = `${match.candidate.first_name || ''} ${match.candidate.last_name || ''}`.trim() || 'Candidat'
          const test = match.custom_test
          const canRetest = test?.status === 'scored' && test?.score < test?.threshold && test?.retest_allowed && !test?.retest_used
          const testPassed = test?.status === 'scored' && test?.score >= test?.threshold

          return (
            <div key={match.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    {match.candidate.candidate?.photo_url ? (
                      <img src={match.candidate.candidate.photo_url.startsWith('http') ? match.candidate.candidate.photo_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${match.candidate.candidate.photo_url}`} alt="" className="w-full h-full object-cover" />
                    ) : <User className="w-7 h-7 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-lg truncate">{candidateName}</h3>
                    <p className="text-accent text-xs font-bold uppercase tracking-wider truncate">
                      {match.candidate.candidate?.title || match.candidate.candidate?.speciality || 'Développeur'}
                    </p>
                    {match.job_offer && (
                      <p className="text-slate-400 text-xs font-medium mt-0.5 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {match.job_offer.title}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg">Match Confirmé</span>
                    {test && getTestStatusBadge(test)}
                  </div>
                </div>
              </div>

              {/* Test result details */}
              {test?.status === 'scored' && (
                <div className={clsx(
                  'px-6 py-4 border-b border-slate-50',
                  testPassed ? 'bg-green-50' : 'bg-red-50'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {testPassed
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <XCircle className="w-5 h-5 text-red-600" />}
                      <div>
                        <p className={clsx('font-black text-sm', testPassed ? 'text-green-800' : 'text-red-800')}>
                          {testPassed ? 'Test validé  ' : 'Test non validé'}
                        </p>
                        <p className="text-xs text-slate-500">Score : {test.score}% / Seuil : {test.threshold}%</p>
                      </div>
                    </div>
                    <div className={clsx('text-3xl font-black', testPassed ? 'text-green-600' : 'text-red-600')}>
                      {test.score}%
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-6 space-y-3">
                {(() => {
                  const calendlySent = !!match.calendly_url
                  const testPassed = test?.status === 'scored' && test?.score >= test?.threshold
                  const canRetest = test?.status === 'scored' && test?.score < test?.threshold && test?.retest_allowed && !test?.retest_used

                  if (calendlySent) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 border border-green-100 rounded-2xl">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                          <div>
                            <p className="font-bold text-green-800 text-sm">Lien Calendly envoyé !</p>
                            <p className="text-green-600 text-xs">Le processus est terminé, vous pouvez l'ajouter à votre Workspace après l'entretien.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToWorkspace(match.id)}
                          disabled={addingToWorkspace === match.id}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:scale-[1.02] rounded-2xl font-black text-sm transition-all shadow-lg shadow-slate-900/20"
                        >
                          {addingToWorkspace === match.id
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <div className="flex items-center gap-2">Ajouter au Workspace</div>}
                        </button>
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* No test yet → show options */}
                      {!test && (
                        <>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choisissez votre approche :</p>
                          <button
                            onClick={() => openTestModal(match)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-slate-900/10"
                          >
                            <FlaskConical className="w-4 h-4 shrink-0" />
                            <div className="text-left">
                              <p>Envoyer un test technique custom</p>
                              <p className="text-slate-400 text-xs font-medium">Seuil 75% • Vous pourrez voir son nom s'il réussit le test</p>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMatchForCalendly(match)
                              setCalendlyUrl('https://calendly.com/opside')
                              setShowCalendlyModal(true)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-accent/20 hover:border-accent hover:bg-accent/5 text-accent rounded-2xl font-bold text-sm transition-all"
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <div className="text-left">
                              <p>Me fier au score plateforme</p>
                              <p className="text-slate-400 text-xs font-medium">Envoyer directement le lien d'entretien au candidat</p>
                            </div>
                          </button>

                          <div className="my-4 border-t border-slate-100 relative">
                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-300 uppercase">OU BIEN</span>
                          </div>

                          <button
                            onClick={() => handleAddToWorkspace(match.id)}
                            disabled={addingToWorkspace === match.id}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:scale-[1.02] rounded-2xl font-black text-sm transition-all shadow-lg shadow-slate-900/20"
                          >
                            {addingToWorkspace === match.id
                              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <Home className="w-4 h-4" />}
                            Ajouter directement au Workspace
                          </button>
                        </>
                      )}

                      {/* Test envoyé */}
                      {test && test.status === 'sent' && (
                        <div className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 border border-blue-100 rounded-2xl">
                          <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                          <div>
                            <p className="font-bold text-blue-800 text-sm">Test envoyé</p>
                            <p className="text-blue-600 text-xs">Le candidat a reçu l'invitation et n'a pas encore commencé.</p>
                          </div>
                        </div>
                      )}

                      {/* Test en cours */}
                      {test && test.status === 'in_progress' && (
                        <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
                          <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="font-bold text-amber-800 text-sm">Test en cours</p>
                            <p className="text-amber-600 text-xs">Le candidat est en train de passer le test technique.</p>
                          </div>
                        </div>
                      )}

                      {/* Test scored display */}
                      {test?.status === 'scored' && (
                        <div className={clsx('flex items-center gap-3 px-4 py-3.5 border rounded-2xl mb-2', testPassed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100')}>
                          {testPassed ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                          <div>
                            <p className={clsx('font-bold text-sm', testPassed ? 'text-green-800' : 'text-red-800')}>
                              Score du test technique : {test.score}%
                            </p>
                            <p className={clsx('text-xs', testPassed ? 'text-green-600' : 'text-red-600')}>
                              {testPassed ? 'Test validé avec succès !' : 'Le candidat n\'a pas validé le test.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Test passed → Show Envoyer Lien Entretien button */}
                      {testPassed && (
                        <button
                          onClick={() => {
                            setSelectedMatchForCalendly(match)
                            setCalendlyUrl('https://calendly.com/opside')
                            setShowCalendlyModal(true)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:scale-[1.02] rounded-2xl font-black text-sm transition-all shadow-lg"
                        >
                          <Calendar className="w-4 h-4" />
                          Envoyer Lien Entretien
                        </button>
                      )}

                      {/* Can retest */}
                      {canRetest && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectMatch(match.id)}
                            disabled={rejectingMatch === match.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-2xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                          >
                            {rejectingMatch === match.id ? (
                              <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Pas Match
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRetest(test.id)}
                            disabled={requestingRetest === test.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                          >
                            {requestingRetest === test.id
                              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <RefreshCw className="w-4 h-4" />}
                            Proposer un retest
                          </button>
                        </div>
                      )}

                      {/* Retest already used + failed */}
                      {test?.status === 'scored' && !testPassed && test?.retest_used && (
                        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl">
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          <div>
                            <p className="font-bold text-red-800 text-sm">Retest déjà utilisé</p>
                            <p className="text-red-600 text-xs">Le candidat n'a pas pu valider le test après retest. Match refusé.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Test Config Modal */}
      {showTestModal && selectedMatch && (
        <Modal isOpen={showTestModal} onClose={() => setShowTestModal(false)} title="Configurer le test technique" size="xl">
          <div className="space-y-8 pb-6">
            {/* Candidat info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-black text-slate-900">{`${selectedMatch.candidate.first_name || ''} ${selectedMatch.candidate.last_name || ''}`.trim()}</p>
                <p className="text-slate-500 text-sm">{selectedMatch.job_offer?.title || 'Pas d\'offre associée'}</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Compétences à tester <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                      selectedSkills.includes(skill)
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-accent hover:text-accent'
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <p className="text-accent text-xs font-bold mt-2">{selectedSkills.length} compétence(s) sélectionnée(s)</p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Niveau de difficulté</label>
              <div className="grid grid-cols-3 gap-3">
                {(['junior', 'mid', 'senior'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={clsx(
                      'py-3 rounded-2xl font-bold text-sm border transition-all',
                      difficulty === lvl
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    )}
                  >
                    {DIFFICULTY_LABELS[lvl]}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Durée : <span className="text-slate-900">{duration} minutes</span>
              </label>
              <div className="flex items-center gap-4">
                <button onClick={() => setDuration(d => Math.max(30, d - 15))} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range" min={30} max={120} step={15} value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="flex-1 accent-black"
                />
                <button onClick={() => setDuration(d => Math.min(120, d + 15))} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                <span>30 min</span><span>120 min</span>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Instructions personnalisées <span className="text-slate-300">(optionnel)</span>
              </label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Ex : Focus sur les hooks React, priorité aux questions de performance..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none transition-all"
              />
            </div>

            {/* Threshold info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
              <Target className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-amber-700 text-xs font-medium">
                <strong>Seuil fixe : 75%</strong> — Si le candidat réussit, le lien Calendly lui sera envoyé automatiquement. En cas d'échec, le match passe en "refusé" et vous pouvez proposer un retest (1 seule fois).
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleSendTest}
              disabled={isSendingTest || selectedSkills.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingTest ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div>
                  Envoyer le test au candidat
                </div>
              )}
            </button>
          </div>
        </Modal>
      )}

      {showCalendlyModal && selectedMatchForCalendly && (
        <Modal isOpen={showCalendlyModal} onClose={() => setShowCalendlyModal(false)} title="Envoyer le lien d'entretien">
          <div className="space-y-6 pt-2 pb-6">
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Saisissez votre lien Calendly personnalisé (ou tout autre lien de planification d'entretien) pour l'envoyer au candidat.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                Lien Calendly / Entretien
              </label>
              <input
                type="url"
                value={calendlyUrl}
                onChange={e => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/votre-nom"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              />
            </div>

            <button
              onClick={async () => {
                if (!calendlyUrl || !calendlyUrl.trim().startsWith('http')) {
                  toast.error('Veuillez saisir un lien valide (commençant par http:// ou https://)')
                  return
                }
                try {
                  setSendingCalendly(selectedMatchForCalendly.id)
                  await customTestService.sendCalendlyDirectly(selectedMatchForCalendly.id, calendlyUrl)
                  toast.success('Lien d\'entretien envoyé au candidat !')
                  setShowCalendlyModal(false)
                  await fetchMatches()
                } catch {
                  toast.error('Erreur lors de l\'envoi du lien')
                } finally {
                  setSendingCalendly(null)
                }
              }}
              disabled={sendingCalendly === selectedMatchForCalendly.id}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
            >
              {sendingCalendly === selectedMatchForCalendly.id ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div >
                  Envoyer l'invitation d'entretien
                </div>
              )}

            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
