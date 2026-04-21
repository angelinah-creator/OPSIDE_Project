'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authApi } from '@/lib/auth-service'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Jeton de réinitialisation manquant ou invalide.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: password })
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue. Le lien a peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  if (!token && !success) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2">Lien invalide</h1>
        <p className="text-sm text-muted mb-8">
          Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
        </p>
        <Link href="/auth/forgot-password">
          <Button className="w-full">Demander un nouveau lien</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {!success ? (
        <>
          <h1 className="text-xl font-semibold text-center mt-4">Nouveau mot de passe</h1>
          <p className="text-sm text-muted text-center mb-8 mt-2">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Nouveau mot de passe"
                type={showPw ? 'text' : 'password'}
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-8 text-muted hover:text-foreground mt-2"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirmer le mot de passe"
              type={showPw ? 'text' : 'password'}
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full mt-6" loading={loading}>
              Réinitialiser le mot de passe
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h1 className="text-xl font-semibold mb-2">Mot de passe mis à jour</h1>
          <p className="text-sm text-muted mb-8">
            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
          </p>
          <Link href="/auth/login">
            <Button variant="secondary" className="w-full">
              Se connecter maintenant
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-center py-8">Chargement...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
