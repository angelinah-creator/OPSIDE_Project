'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import CountrySelect from '@/components/ui/CountrySelect'
import { authApi, clearTokens } from '@/lib/auth-service'
import { clientApi } from '@/lib/client-service'
import { ArrowLeft, LogOut, Pencil, Save, Camera, Building2, BriefcaseBusiness, MapPin, ExternalLink, Check, Globe, Mail, Phone, Calendar } from 'lucide-react';

const SIZES = [
  { value: 'size_1_10', label: '1–10 employés' },
  { value: 'size_11_50', label: '11–50 employés' },
  { value: 'size_51_200', label: '51–200 employés' },
  { value: 'size_200_plus', label: '200+ employés' },
]

const SIZE_LABELS: Record<string, string> = {
  size_1_10: '1–10 employés',
  size_11_50: '11–50 employés',
  size_51_200: '51–200 employés',
  size_200_plus: '200+ employés',
}

const COUNTRIES = [
  { value: 'madagascar', label: 'Madagascar', flag: 'mg' },
  { value: 'senegal', label: 'Sénégal', flag: 'sn' },
  { value: 'maurice', label: 'Maurice', flag: 'mu' },
  { value: 'kenya', label: 'Kenya', flag: 'ke' },
  { value: 'nigeria', label: 'Nigeria', flag: 'ng' },
  { value: 'egypte', label: 'Égypte', flag: 'eg' },
  { value: 'maroc', label: 'Maroc', flag: 'ma' },
  { value: 'tunisie', label: 'Tunisie', flag: 'tn' },
]

const COUNTRY_LABELS: Record<string, { label: string; flag: string }> = {
  madagascar: { label: 'Madagascar', flag: 'mg' },
  senegal: { label: 'Sénégal', flag: 'sn' },
  maurice: { label: 'Maurice', flag: 'mu' },
  kenya: { label: 'Kenya', flag: 'ke' },
  nigeria: { label: 'Nigeria', flag: 'ng' },
  egypte: { label: 'Égypte', flag: 'eg' },
  maroc: { label: 'Maroc', flag: 'ma' },
  tunisie: { label: 'Tunisie', flag: 'tn' },
}

// Client profile page
export default function ClientProfilePage() {
  const router = useRouter()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editHero, setEditHero] = useState(false)
  const [heroForm, setHeroForm] = useState({
    company_name: '',
    industry: '',
    first_name: '',
    last_name: ''
  })
  const [logoUrl, setLogoUrl] = useState('')

  const [editInfo, setEditInfo] = useState(false)
  const [infoForm, setInfoForm] = useState({
    company_size: '', industry: '', country: '', city: '', website: ''
  })

  const [editContact, setEditContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    contact_name: '', contact_email: '', contact_phone: '', interview_availability: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  // Load profile
  const loadProfile = async () => {
    try {
      const p = await clientApi.getMyProfile()
      setProfile(p)
      setLogoUrl(p.logo_url || '')

      setHeroForm({
        company_name: p.company_name || '',
        industry: p.industry || '',
        first_name: p.user?.first_name || '',
        last_name: p.user?.last_name || '',
      })

      setInfoForm({
        company_size: p.company_size || '',
        industry: p.industry || '',
        country: p.country || '',
        city: p.city || '',
        website: p.website || '',
      })

      setContactForm({
        contact_name: p.contact_name || '',
        contact_email: p.contact_email || '',
        contact_phone: p.contact_phone || '',
        interview_availability: p.interview_availability || '',
      })
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/auth/login')
      } else if (err.response?.status === 404) {
        console.warn('Profile not found.')
      } else {
        setError('Impossible de charger le profil.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Flash
  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  // Refresh
  const refresh = async () => {
    try {
      const p = await clientApi.getMyProfile()
      setProfile(p)
      setLogoUrl(p.logo_url || '')
    } catch { }
  }

  // Gère logo change
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    try {
      await clientApi.uploadLogo(f)
      flash('Logo mis à jour !')
      refresh()
    } catch { setError('Erreur lors de l\'upload du logo.') }
    e.target.value = ''
  }

  // Save hero
  const saveHero = async () => {
    setSaving(true); setError('')
    try {
      await clientApi.updateUserNames({
        first_name: heroForm.first_name,
        last_name: heroForm.last_name
      })
      await clientApi.updateProfile({
        company_name: heroForm.company_name,
        industry: heroForm.industry
      })
      await refresh()
      setEditHero(false)
      flash('Informations mises à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  // Save info
  const saveInfo = async () => {
    setSaving(true); setError('')
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(infoForm).filter(([_, v]) => v !== '')
      )
      await clientApi.updateProfile(cleanedData)
      await refresh()
      setEditInfo(false)
      flash('Profil mis à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  // Save contact
  const saveContact = async () => {
    setSaving(true); setError('')
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(contactForm).filter(([_, v]) => v !== '')
      )
      await clientApi.updateProfile(cleanedData)
      await refresh()
      setEditContact(false)
      flash('Contact mis à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  // Gère logout
  const handleLogout = async () => {
    try {
      const Cookies = (await import('js-cookie')).default
      await authApi.logout(Cookies.get('refresh_token') || '')
    } catch { }
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/client/dashboard" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <img src="/logo.webp" alt="OPSIDE" className='w-28' />
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Flash messages */}
        {success && (
          <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />{success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {/* ── HERO: Logo + Nom + Secteur ── */}
        <div className="bg-white rounded-3xl border border-border p-8 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="relative mb-5">
            <div className={`w-32 h-32 rounded-2xl overflow-hidden bg-background border-4 border-white shadow-lg flex items-center justify-center`}>
              {logoUrl
                ? <img src={logoUrl} alt={profile?.company_name} className="w-full h-full object-contain p-2" />
                : <Building2 className="w-16 h-16 text-muted" />
              }
            </div>
            {/* Camera button */}
            <div className="absolute -bottom-2 -right-2">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors border-4 border-white"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>

          {/* Name + Industry */}
          {editHero ? (
            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  value={heroForm.first_name}
                  onChange={e => setHeroForm(f => ({ ...f, first_name: e.target.value }))}
                />
                <Input
                  label="Nom"
                  value={heroForm.last_name}
                  onChange={e => setHeroForm(f => ({ ...f, last_name: e.target.value }))}
                />
              </div>
              <Input
                label="Nom de l'entreprise"
                value={heroForm.company_name}
                onChange={e => setHeroForm(f => ({ ...f, company_name: e.target.value }))}
              />
              <Input
                label="Secteur d'activité"
                value={heroForm.industry}
                onChange={e => setHeroForm(f => ({ ...f, industry: e.target.value }))}
              />
              <div className="flex gap-2 justify-center pt-1">
                <Button size="sm" variant="secondary" onClick={() => setEditHero(false)}>Annuler</Button>
                <Button size="sm" onClick={saveHero} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {heroForm.first_name} {heroForm.last_name}
                </h1>
                <button onClick={() => setEditHero(true)} className="text-muted hover:text-accent transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-semibold text-muted-foreground">{profile?.company_name || 'Votre entreprise'}</p>
              <p className="text-accent font-medium">{profile?.industry || 'Secteur non défini'}</p>
            </div>
          )}
        </div>

        {/* ── Informations entreprise ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-lg">Informations entreprise</h2>
            {!editInfo && (
              <button onClick={() => setEditInfo(true)} className="text-muted hover:text-accent transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {editInfo ? (
            <div className="space-y-4">
              <Select
                label="Taille de l'entreprise"
                options={SIZES}
                value={infoForm.company_size}
                onChange={e => setInfoForm(p => ({ ...p, company_size: e.target.value }))}
              />
              <Input
                label="Secteur"
                value={infoForm.industry}
                onChange={e => setInfoForm(p => ({ ...p, industry: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <CountrySelect
                  label="Pays *"
                  options={COUNTRIES}
                  value={infoForm.country}
                  onChange={v => setInfoForm(p => ({ ...p, country: v }))}
                />
                <Input label="Ville" value={infoForm.city} onChange={e => setInfoForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <Input label="Site web" type="url" value={infoForm.website} onChange={e => setInfoForm(p => ({ ...p, website: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditInfo(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveInfo} loading={saving}><Save className="w-4 h-4" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <dl className="space-y-4">
              {[
                { label: 'Taille', value: SIZE_LABELS[profile?.company_size] || profile?.company_size, icon: Building2 },
                { label: 'Secteur', value: profile?.industry, icon: BriefcaseBusiness },
                {
                  label: 'Localisation', value: profile?.country ? (
                    <div className="flex items-center gap-2">
                      {COUNTRY_LABELS[profile.country] && (
                        <img
                          src={`https://flagcdn.com/w40/${COUNTRY_LABELS[profile.country].flag}.png`}
                          alt=""
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <span>{profile.city ? `${profile.city}, ` : ''}{COUNTRY_LABELS[profile.country]?.label || profile.country}</span>
                    </div>
                  ) : profile?.city, icon: MapPin
                },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 text-accent border border-border">
                    <row.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-xs text-muted font-medium uppercase tracking-wider">{row.label}</dt>
                    <dd className="text-foreground font-medium">{row.value}</dd>
                  </div>
                </div>
              ))}

              {profile?.website && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 text-accent border border-border">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <dt className="text-xs text-muted font-medium uppercase tracking-wider">Site web</dt>
                    <dd>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700 transition-colors flex items-center gap-1 font-medium break-all text-sm">
                        {profile.website}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          )}
        </div>

        {/* ── Contact ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-lg">Contact</h2>
            {!editContact && (
              <button onClick={() => setEditContact(true)} className="text-muted hover:text-accent transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {editContact ? (
            <div className="space-y-4">
              <Input label="Nom du contact" value={contactForm.contact_name} onChange={e => setContactForm(p => ({ ...p, contact_name: e.target.value }))} />
              <Input label="Email de contact" type="email" value={contactForm.contact_email} onChange={e => setContactForm(p => ({ ...p, contact_email: e.target.value }))} />
              <Input label="Téléphone" value={contactForm.contact_phone} onChange={e => setContactForm(p => ({ ...p, contact_phone: e.target.value }))} />
              <Input label="Disponibilités" placeholder="ex: Lun-Ven, 9h-18h" value={contactForm.interview_availability} onChange={e => setContactForm(p => ({ ...p, interview_availability: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditContact(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveContact} loading={saving}><Save className="w-4 h-4" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 text-accent border border-border">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <dt className="text-xs text-muted font-medium uppercase tracking-wider">Email du compte</dt>
                  <dd className="text-foreground font-medium">{profile?.user?.email}</dd>
                </div>
              </div>
              {[
                { label: 'Nom du contact', value: profile?.contact_name, icon: Building2 },
                { label: 'Email de contact profile', value: profile?.contact_email, icon: Mail },
                { label: 'Téléphone', value: profile?.contact_phone, icon: Phone },
                { label: 'Disponibilités entretiens', value: profile?.interview_availability, icon: Calendar },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 text-accent border border-border">
                    <row.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <dt className="text-xs text-muted font-medium uppercase tracking-wider">{row.label}</dt>
                    <dd className="text-foreground font-medium">{row.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
