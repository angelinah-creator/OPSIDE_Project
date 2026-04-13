'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authApi  } from '@/lib/auth-service'
import { setTokens, setUser } from '@/lib/auth-service'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function CandidatRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas.')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    setLoading(true)
    try {
      const { data } = await authApi.register({
        email: form.email,
        password: form.password,
        role: 'candidat',
        first_name: form.first_name,
        last_name: form.last_name,
      })
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      router.push('/candidat/onboarding')
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
        {/* Back */}
        <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-6">
            <div>
            <img src="/logo.png" alt="OPSIDE" className='w-28'/>
          </div>
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-1">Créer mon compte candidat</h1>
          <p className="text-sm text-muted text-center mb-8">Rejoignez des centaines de talents tech</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" placeholder="Jean" value={form.first_name} onChange={set('first_name')} required />
              <Input label="Nom" placeholder="Rakoto" value={form.last_name} onChange={set('last_name')} required />
            </div>
            <Input label="Email" type="email" placeholder="jean@mail.com" value={form.email} onChange={set('email')} required />
            <div className="relative">
              <Input
                label="Mot de passe"
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
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Répétez le mot de passe"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />

            <Button type="submit" className="w-full mt-2" loading={loading}>
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
