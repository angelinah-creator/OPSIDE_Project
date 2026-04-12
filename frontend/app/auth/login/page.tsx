'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authApi } from '@/lib/api'
import { setTokens, setUser, getDashboardByRole } from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form.email, form.password)
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      router.push(getDashboardByRole(data.user.role))
    } catch (err: any) {
      if (err.response?.status === 401) setError('Email ou mot de passe incorrect.')
      else setError('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          <div className="flex justify-center mb-6"><Logo size={36} /></div>
          <h1 className="text-xl font-bold text-foreground text-center mb-1">Bon retour 👋</h1>
          <p className="text-sm text-muted text-center mb-8">Connectez-vous à votre compte OPSIDE</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="votre@email.com" value={form.email} onChange={set('email')} required />
            <div className="relative">
              <Input label="Mot de passe" type={showPw ? 'text' : 'password'} placeholder="Votre mot de passe" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-muted hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" loading={loading}>Se connecter</Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-accent font-medium hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
