'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FileUpload from '@/components/ui/FileUpload'
import { authApi, clearTokens } from '@/lib/auth-service'
import { clientApi } from '@/lib/client-service'
import { ArrowLeft, Save, Check, LogOut } from 'lucide-react'

const SIZES = [
  { value: 'size_1_10', label: '1–10 employés' },
  { value: 'size_11_50', label: '11–50 employés' },
  { value: 'size_51_200', label: '51–200 employés' },
  { value: 'size_201_500', label: '201–500 employés' },
  { value: 'size_500_plus', label: '500+ employés' },
]

export default function ClientProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    company_name: '', company_size: '', industry: '', country: '', city: '',
    contact_name: '', contact_email: '', contact_phone: '', website: '', interview_availability: '',
  })
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    clientApi.getProfile()
      .then((r: any) => {
        const p = r;
        setLogoUrl(p.logo_url || '')
        setForm({
          company_name: p.company_name || '', company_size: p.company_size || '',
          industry: p.industry || '', country: p.country || '', city: p.city || '',
          contact_name: p.contact_name || '', contact_email: p.contact_email || '',
          contact_phone: p.contact_phone || '', website: p.website || '',
          interview_availability: p.interview_availability || '',
        })
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false))
  }, [router])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await clientApi.updateProfile(form)
      if (logoFile) await clientApi.uploadLogo(logoFile).catch(() => {})
      setSuccess('Profil mis à jour !')
      setTimeout(() => setSuccess(''), 3000)
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    try { const Cookies = (await import('js-cookie')).default; await authApi.logout(Cookies.get('refresh_token') || '') } catch {}
    clearTokens(); router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/client/dashboard" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo size={26} />
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Profil entreprise</h1>
          <p className="text-muted text-sm">Ces informations sont visibles par les candidats.</p>
        </div>

        {success && <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}
        {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {/* Company */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informations entreprise</h2>
          <FileUpload label="Logo de l'entreprise" accept="image/*" onUpload={async (f) => { setLogoFile(f); }} currentUrl={logoUrl} />
          <Input label="Nom de l'entreprise *" value={form.company_name} onChange={set('company_name')} />
          <Select label="Taille de l'entreprise" options={SIZES} placeholder="Sélectionner..." value={form.company_size} onChange={set('company_size')} />
          <Input label="Secteur d'activité" placeholder="Technologies de l'information" value={form.industry} onChange={set('industry')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pays *" value={form.country} onChange={set('country')} />
            <Input label="Ville" value={form.city} onChange={set('city')} />
          </div>
          <Input label="Site web" type="url" placeholder="https://entreprise.com" value={form.website} onChange={set('website')} />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Contact</h2>
          <Input label="Nom du contact" value={form.contact_name} onChange={set('contact_name')} />
          <Input label="Email de contact" type="email" value={form.contact_email} onChange={set('contact_email')} />
          <Input label="Téléphone" value={form.contact_phone} onChange={set('contact_phone')} />
          <Input label="Disponibilités pour les entretiens" placeholder="Lundi-Vendredi, 9h-18h" value={form.interview_availability} onChange={set('interview_availability')} />
        </div>

        <Button className="w-full" size="lg" onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" /> Sauvegarder
        </Button>
      </div>
    </div>
  )
}
