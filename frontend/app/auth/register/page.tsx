'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Logo from '@/components/ui/Logo'
import { User, Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function RegisterChoiceContent() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const role = params.get('role')
    if (role === 'candidat') router.replace('/auth/register/candidat')
    if (role === 'client') router.replace('/auth/register/client')
  }, [params, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-8 transition-colors self-start">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">Rejoindre OPSIDE</h1>
          <p className="text-muted text-sm">Choisissez votre profil pour commencer</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Candidat */}
          <button
            onClick={() => router.push('/auth/register/candidat')}
            className="group relative bg-white border-2 border-border rounded-2xl p-6 text-left hover:border-accent hover:shadow-elevated transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-200">
                <User className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground text-lg">Je suis candidat</h2>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Développeur, designer, data scientist... Créez votre profil et recevez des offres.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Freelance', 'Remote', 'CDI'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-background border border-border text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* Client */}
          <button
            onClick={() => router.push('/auth/register/client')}
            className="group relative bg-white border-2 border-border rounded-2xl p-6 text-left hover:border-accent hover:shadow-elevated transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-200">
                <Building2 className="w-6 h-6 text-accent group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground text-lg">Je suis une entreprise</h2>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Startup, PME, grand groupe... Trouvez les meilleurs talents tech rapidement.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Recrutement', 'Matching', 'Rapide'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-background border border-border text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-8">
          Déjà un compte ?{' '}
          <a href="/auth/login" className="text-accent font-medium hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}

export default function RegisterChoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>}>
      <RegisterChoiceContent />
    </Suspense>
  )
}
