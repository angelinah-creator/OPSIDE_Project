'use client'

import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function VerifyEmailNoticePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center animate-pulse">
            <Mail className="w-10 h-10 text-accent" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">Vérifiez votre boîte mail</h1>
        <p className="text-muted mb-8 leading-relaxed">
          Nous vous avons envoyé un lien de confirmation par e-mail. 
          Veuillez cliquer sur ce lien pour activer votre compte et accéder à OPSIDE.
        </p>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-card mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            Prochaines étapes :
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent font-bold">1.</span>
              Ouvrez l'e-mail envoyé par OPSIDE.
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">2.</span>
              Cliquez sur le bouton de confirmation.
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">3.</span>
              Vous serez automatiquement redirigé vers votre espace.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button variant="secondary" className="w-full" onClick={() => window.location.reload()}>
            Je n'ai rien reçu, renvoyer l'e-mail
          </Button>
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour à la connexion
          </Link>
        </div>
        
        <p className="mt-12 text-xs text-muted">
          Pensez à regarder dans votre dossier "Indésirables" ou "Spam".
        </p>
      </div>
    </div>
  )
}
