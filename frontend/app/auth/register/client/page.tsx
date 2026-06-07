'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authApi } from '@/lib/auth-service'
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'

// Client register page
export default function ClientRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: ''
  })

  // Définit 
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  // Gère submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas.')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')

    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
    if (!passwordRegex.test(form.password)) {
      return setError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.')
    }

    setLoading(true)
    try {
      await authApi.register({
        email: form.email,
        password: form.password,
        role: 'client'
      })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('registered_email', form.email)
      }
      router.push(`/auth/verify-email-notice?email=${encodeURIComponent(form.email)}`)
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (err.response?.status === 409) setError('Cet email est déjà utilisé.')
      else setError(typeof msg === 'string' ? msg : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.webp" alt="OPSIDE" className='w-28' />
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-1">Créer mon compte entreprise</h1>
          <p className="text-sm text-muted text-center mb-8">Étape 1 : Création de votre compte</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email de l'entreprise *"
              type="email"
              placeholder="marie@entreprise.com"
              value={form.email}
              onChange={set('email')}
              required
            />
            <div className="relative">
              <Input
                label="Mot de passe *"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 caractères"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-8 text-muted hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Confirmer le mot de passe *"
              type="password"
              placeholder="Répétez le mot de passe"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              disabled={!form.email || !form.password || !form.confirm}
            >
              S'inscrire <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
