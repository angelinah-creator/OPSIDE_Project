'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authApi } from '@/lib/auth-service'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-8 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-2">
            <img src="/logo.webp" alt="OPSIDE" className='w-40' />
          </div>

          {!success ? (
            <>
              <h1 className="text-xl font-semibold text-center mt-4">Mot de passe oublié ?</h1>
              <p className="text-sm text-muted text-center mb-8 mt-2">
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Envoyer le lien
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h1 className="text-xl font-semibold mb-2">E-mail envoyé</h1>
              <p className="text-sm text-muted mb-8">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un e-mail avec les instructions dans quelques instants.
              </p>
              <Link href="/auth/login">
                <Button variant="secondary" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
