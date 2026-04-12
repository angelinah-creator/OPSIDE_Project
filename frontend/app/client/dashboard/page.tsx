'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { getUser, clearTokens } from '@/lib/auth-service'
import { authApi  } from '@/lib/auth-service'
import { LogOut, Settings, Briefcase, PlusCircle } from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = getUser()
    if (u) setUser(u)
    else authApi.me().then(r => setUser(r.data)).catch(() => router.push('/auth/login'))
  }, [router])

  const handleLogout = async () => {
    try {
      const Cookies = (await import('js-cookie')).default
      const rt = Cookies.get('refresh_token') || ''
      await authApi.logout(rt)
    } catch {}
    clearTokens()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo size={28} />
          <div className="flex items-center gap-3">
            <Link href="/client/profile">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" /> Mon profil
              </Button>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground px-3 py-2 rounded-xl hover:bg-border/40 transition-all">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Poster une offre</h1>
          <p className="text-muted text-base leading-relaxed mb-8">
            Bienvenue {user?.first_name} 👋 Votre entreprise est prête. Créez votre première offre pour commencer à trouver les meilleurs talents.
          </p>
          <div className="bg-white rounded-2xl border border-border p-6 text-left mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm font-medium text-foreground">Profil entreprise créé</span>
            </div>
            <p className="text-sm text-muted">La fonctionnalité de publication d'offres sera disponible très prochainement.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/client/profile">
              <Button variant="secondary">
                <Settings className="w-4 h-4" /> Modifier mon profil
              </Button>
            </Link>
            <Button disabled>
              <PlusCircle className="w-4 h-4" /> Poster une offre
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
