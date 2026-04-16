'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi, setTokens, setUser, getDashboardByRole } from '@/lib/auth-service'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Lien de vérification invalide (jeton manquant).')
      return
    }

    if (hasVerified.current) return
    hasVerified.current = true

    const verify = async () => {
      try {
        const { data } = await authApi.verifyEmail(token)
        
        // Auto-login
        setTokens(data.access_token, data.refresh_token)
        setUser(data.user)
        
        setStatus('success')
        setMessage('Votre adresse e-mail a été vérifiée avec succès !')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          const destination = data.user.role === 'candidat' ? '/candidat/onboarding' : '/client/onboarding'
          router.push(destination)
        }, 2000)
      } catch (err: any) {
        setStatus('error')
        const msg = err.response?.data?.message || 'Une erreur est survenue lors de la vérification.'
        setMessage(msg)
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <h1 className="text-xl font-bold text-foreground">Vérification en cours...</h1>
            <p className="text-muted mt-2">Nous validons votre adresse e-mail, veuillez patienter.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">E-mail vérifié !</h1>
            <p className="text-muted mb-8 leading-relaxed">{message}</p>
            <p className="text-sm text-muted animate-pulse">Redirection automatique...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Oups !</h1>
            <p className="text-red-600 mb-8 leading-relaxed font-medium bg-red-50 px-4 py-2 rounded-xl border border-red-100 italic">
              {message}
            </p>
            <div className="space-y-4 w-full">
              <Link href="/auth/login" className="block w-full">
                <Button className="w-full">
                  Aller à la page de connexion
                </Button>
              </Link>
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
