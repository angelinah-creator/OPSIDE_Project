'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { getUser, clearTokens } from '@/lib/auth-service'
import { authApi  } from '@/lib/auth-service'
import { candidateApi } from '@/lib/candidate-service'
import { User, LogOut, Settings, Code2, Clock } from 'lucide-react'

export default function CandidatDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = getUser()
    if (u) setUser(u)
    else authApi.me().then(r => setUser(r.data)).catch(() => router.push('/auth/login'))

    candidateApi.getProfile().catch((err: any) => {
      if (err.response?.status === 404) {
        router.replace('/candidat/onboarding')
      }
    })
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
      {/* Top nav */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <img src="/logo.png" alt="OPSIDE" className='w-28'/>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/candidat/profile">
              <Button variant="ghost" size="sm" className='gap-2'>
                <User className="w-4 h-4" /> Mon profil
              </Button>
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted hover:text-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
        <div className="text-center max-w-lg">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-accent-soft flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10 text-accent" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">Test technique</h1>
          <p className="text-muted text-base leading-relaxed mb-8">
            Bonjour {user?.first_name} Votre profil a été créé avec succès. La prochaine étape est le test technique pour valider vos compétences.
          </p>
        </div>
      </main>
    </div>
  )
}
