'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { customTestService, CustomTest } from '@/lib/custom-test-service'
import { toast } from 'sonner'
import { FlaskConical, Clock, CheckCircle, XCircle, AlertTriangle, Code, ChevronRight } from 'lucide-react';
import clsx from 'clsx'



type TestPhase = 'list' | 'instructions' | 'submitted'

// Custom test tab
export default function CustomTestTab() {
  const router = useRouter()
  const [tests, setTests] = useState<CustomTest[]>([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<TestPhase>('list')
  const [activeTest, setActiveTest] = useState<CustomTest | null>(null)

  const fetchTests = useCallback(async () => {
    try {
      const data = await customTestService.getCandidateTests()
      setTests(data)
    } catch {
      toast.error('Impossible de charger les tests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTests() }, [fetchTests])





  // Gère start test
  const handleStartTest = async (test: CustomTest) => {
    setActiveTest(test)
    setPhase('instructions')
  }

  // Gère begin test
  const handleBeginTest = () => {
    if (activeTest) {
      router.push(`/candidat/custom-test/${activeTest.id}`)
    }
  }



  // Récupère status badge
  const getStatusBadge = (status: string, score?: number, threshold?: number) => {
    const cfgMap: Record<string, { label: string; cls: string }> = {
      sent: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
      in_progress: { label: 'En cours', cls: 'bg-blue-100 text-blue-700' },
      scored: {
        label: score !== undefined && threshold !== undefined
          ? score >= threshold ? `  ${score}%` : ` ${score}%`
          : 'Évalué',
        cls: score !== undefined && threshold !== undefined && score >= threshold
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700',
      },
      expired: { label: 'Expiré', cls: 'bg-slate-100 text-slate-500' },
    }
    const c = cfgMap[status] || { label: status, cls: 'bg-slate-100 text-slate-500' }
    return <span className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider', c.cls)}>{c.label}</span>
  }

  if (phase === 'list') {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Chargement de vos tests...</p>
      </div>
    )

    if (tests.length === 0) return (
      <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 max-w-sm">Aucun test reçu</p>
      </div>
    )

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tests.map(test => {
            const companyName = test.match?.client?.client?.company_name || 'Un client'
            const projectName = test.match?.job_offer?.title || 'un projet'
            const canStart = test.status === 'sent'
            const canView = test.status === 'in_progress'

            return (
              <div key={test.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{companyName}</h3>
                      <p className="text-accent text-xs font-bold uppercase tracking-wider">{projectName}</p>
                    </div>
                    {getStatusBadge(test.status, test.score ?? undefined, test.threshold)}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase mb-1">Durée</p>
                      <p className="text-sm font-black text-slate-900">{test.duration_minutes} min</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase mb-1">Seuil</p>
                      <p className="text-sm font-black text-slate-900">{test.threshold}%</p>
                    </div>
                  </div>

                  {test.custom_instructions && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4">
                      <p className="text-xs font-black text-slate-900 uppercase mb-1">Instructions</p>
                      <p className="text-slate-800 text-sm">{test.custom_instructions}</p>
                    </div>
                  )}

                  {/* Score result */}
                  {test.status === 'scored' && test.score !== null && (
                    <div className={clsx(
                      'rounded-2xl p-4 mb-4 flex items-center gap-4',
                      (test.score ?? 0) >= test.threshold ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                    )}>
                      {(test.score ?? 0) >= test.threshold
                        ? <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                        : <XCircle className="w-8 h-8 text-red-600 shrink-0" />}
                      <div className="flex-1">
                        <p className={clsx('font-black', (test.score ?? 0) >= test.threshold ? 'text-green-800' : 'text-red-800')}>
                          {(test.score ?? 0) >= test.threshold ? 'Test réussi ! Vous allez recevoir un lien d\'entretien.' : 'Test non validé. Le client peut proposer un retest.'}
                        </p>
                      </div>
                      <div className={clsx('text-4xl font-black', (test.score ?? 0) >= test.threshold ? 'text-green-600' : 'text-red-600')}>
                        {test.score}%
                      </div>
                    </div>
                  )}

                  {canStart && (
                    <button
                      onClick={() => handleStartTest(test)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-slate-900/10"
                    >
                      Démarrer le test
                    </button>
                  )}
                  {canView && (
                    <button
                      onClick={() => router.push(`/candidat/custom-test/${test.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                      Continuer le test
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (phase === 'instructions' && activeTest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Avant de commencer</h2>
            <p className="text-slate-500 mt-2">Lisez attentivement les règles</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Clock, text: `Vous avez ${activeTest.duration_minutes} minutes pour compléter le test.` },
              { icon: AlertTriangle, text: 'Toute tentative de quitter la page, changer d\'onglet ou copier-coller sera détectée.' },
              { icon: Code, text: `Compétences évaluées : ${activeTest.skills_tested?.join(', ')}` },
              { icon: FlaskConical, text: `Niveau : ${activeTest.difficulty || 'Mid'} • Seuil de réussite : ${activeTest.threshold}%` },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Icon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 font-medium">{text}</p>
              </div>
            ))}
            {activeTest.custom_instructions && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-accent uppercase mb-1">Instructions spéciales du client</p>
                  <p className="text-sm text-accent">{activeTest.custom_instructions}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBeginTest}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-slate-900/20"
          >
            Je suis prêt — Commencer
          </button>
        </div>
      </div>
    )
  }





  return null
}
