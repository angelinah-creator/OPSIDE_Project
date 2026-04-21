'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { getUser, clearTokens, authApi } from '@/lib/auth-service'
import { clientApi } from '@/lib/client-service'
import { LogOut, Settings, Briefcase, PlusCircle, User } from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const u = getUser()
        if (u) setUser(u)
        else {
          const res = await authApi.me()
          setUser(res.data)
        }
        await clientApi.getMyProfile()
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/client/onboarding')
        } else {
          router.push('/auth/login')
        }
      }
    }

    checkProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      const Cookies = (await import('js-cookie')).default
      const rt = Cookies.get('refresh_token') || ''
      await authApi.logout(rt)
    } catch { }
    clearTokens()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src="/logo.webp" alt="OPSIDE" className='w-28' />
          <div className="flex items-center gap-3">
            <Link href="/client/profile">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" /> Mon profil
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
        </div>
      </main>
    </div>
  )
}
