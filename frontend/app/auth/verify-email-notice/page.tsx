'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { authApi } from '@/lib/auth-service'

function VerifyEmailNoticeContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Retrieve email
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      const stored = sessionStorage.getItem('registered_email')
      if (stored) {
        setEmail(stored)
      }
    }
  }, [searchParams])

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => {
      setCooldown(cooldown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!email) {
      setError("Adresse e-mail introuvable. Veuillez retourner à la page d'inscription.");
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data } = await authApi.resendVerification(email)
      setMessage(data.message || 'Un nouvel e-mail de vérification a été envoyé !')
      setCooldown(60) // 60 seconds cooldown
    } catch (err: any) {
      const msg = err.response?.data?.message || "Une erreur est survenue lors de l'envoi."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-accent" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">Vérifiez votre boîte mail</h1>
        <p className="text-muted mb-8 leading-relaxed">
          Nous vous avons envoyé un lien de confirmation par e-mail.
          {email && (
            <span className="block mt-2 font-medium text-foreground text-sm bg-accent-soft px-3 py-1.5 rounded-full inline-block">
              {email}
            </span>
          )}
        </p>

        {/* Alerts */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-accent-soft border border-accent/20 text-accent text-sm flex items-start gap-2.5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2.5 text-left animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleResend}
            loading={loading}
            disabled={cooldown > 0 || !email}
          >
            {cooldown > 0 ? `Renvoyer l'e-mail (${cooldown}s)` : "Je n'ai rien reçu, renvoyer l'e-mail"}
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

// Verify email notice page wrapper
export default function VerifyEmailNoticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    }>
      <VerifyEmailNoticeContent />
    </Suspense>
  )
}
