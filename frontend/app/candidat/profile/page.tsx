'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import SkillSelector from '@/components/ui/SkillSelector'
import { candidateApi } from '@/lib/candidate-service'
import { clearTokens } from '@/lib/auth-service'
import {
  ArrowLeft, LogOut, Pencil, Save, X, Plus, Trash2,
  Camera, User, ExternalLink, Check, ImagePlus, ChevronDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────
const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' }, { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' }, { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' }, { value: 'design', label: 'Design UX/UI' },
  { value: 'data', label: 'Data / IA' }, { value: 'other', label: 'Autre' },
]
const AVAILABILITY = [
  { value: 'immediate', label: 'Immédiat' }, { value: 'two_weeks', label: 'Sous 2 semaines' },
  { value: 'one_month', label: 'Sous 1 mois' }, { value: 'three_months', label: 'Sous 3 mois' },
]
const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' }, { value: 'USD', label: 'USD ($)' }, { value: 'MGA', label: 'MGA (Ar)' },
]
const EMP_TYPES = [
  { value: 'temps_plein', label: 'Temps plein' }, { value: 'temps_partiel', label: 'Temps partiel' },
  { value: 'freelance', label: 'Freelance' }, { value: 'stage', label: 'Stage' }, { value: 'alternance', label: 'Alternance' },
]
const LEVELS = [
  { value: 'bac', label: 'Bac' }, { value: 'bac_plus_2', label: 'Bac +2' },
  { value: 'bac_plus_3', label: 'Bac +3' }, { value: 'bac_plus_5', label: 'Bac +5' },
  { value: 'bac_plus_8', label: 'Doctorat' }, { value: 'autre', label: 'Autre' },
]
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i],
}))
const years = () => {
  const now = new Date().getFullYear()
  return Array.from({ length: 30 }, (_, i) => ({ value: String(now - i), label: String(now - i) }))
}
const AVAIL_LABEL: Record<string, string> = {
  immediate: 'Immédiat', two_weeks: 'Sous 2 semaines', one_month: 'Sous 1 mois', three_months: 'Sous 3 mois',
}
const SPEC_LABEL: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', fullstack: 'Fullstack', mobile: 'Mobile',
  devops: 'DevOps', design: 'Design UX/UI', data: 'Data / IA', other: 'Autre',
}

// ─── Media helpers ────────────────────────────────────────────────
interface MediaPreview { file: File; previewUrl: string }

function MediaGallery({ medias, onDelete, editMode, onOpen }: {
  medias: any[]
  onDelete?: (id: string) => void
  editMode?: boolean
  onOpen?: (index: number) => void
}) {
  const visible = medias.filter(m => m.media_type === 'image' || m.media_type === 'video')
  if (!visible.length) return null
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {visible.map((m: any, idx: number) => (
        <div
          key={m.id}
          className="relative shrink-0 w-44 h-32 rounded-xl overflow-hidden bg-background border border-border group cursor-pointer"
          onClick={() => onOpen?.(idx)}
        >
          {m.media_type === 'image'
            ? <img src={m.url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full relative">
              <video src={m.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-10 border-l-white border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          }
          {editMode && onDelete && (
            <button
              onClick={() => onDelete(m.id)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function MediaPreviewRow({ previews, onRemove }: { previews: MediaPreview[]; onRemove: (i: number) => void }) {
  if (!previews.length) return null
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {previews.map((m, i) => (
        <div key={i} className="relative shrink-0 w-44 h-32 rounded-xl overflow-hidden bg-background border border-border group">
          {m.file.type.startsWith('image/')
            ? <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
            : <video src={m.previewUrl} className="w-full h-full object-cover" />
          }
          <button
            onClick={() => onRemove(i)}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Auto-resize textarea ─────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, className = '', readOnly = false }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; className?: string; readOnly?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none text-foreground placeholder:text-muted ${className}`}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function CandidatProfilePage() {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement>(null)

  // ── State ──
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Hero section
  const [editHero, setEditHero] = useState(false)
  const [editBio, setEditBio] = useState(false)
  const [heroForm, setHeroForm] = useState({ first_name: '', last_name: '', bio: '', title: '' })
  const [photoDropdown, setPhotoDropdown] = useState(false)
  const [gallery, setGallery] = useState<{ items: { url: string, type: string }[], index: number } | null>(null)

  // Main info section
  const [editMain, setEditMain] = useState(false)
  const [pf, setPf] = useState<any>({})
  const [skillIds, setSkillIds] = useState<string[]>([])
  const [editSkills, setEditSkills] = useState(false)

  // Experience editing
  const [editingExpId, setEditingExpId] = useState<string | null>(null)
  const [expForm, setExpForm] = useState<any>({})
  const [expNewMedia, setExpNewMedia] = useState<MediaPreview[]>([])
  const [addingExp, setAddingExp] = useState(false)
  const [newExpForm, setNewExpForm] = useState<any>({})
  const [newExpMedia, setNewExpMedia] = useState<MediaPreview[]>([])

  // Education editing
  const [editingEduId, setEditingEduId] = useState<string | null>(null)
  const [eduForm, setEduForm] = useState<any>({})
  const [eduNewMedia, setEduNewMedia] = useState<MediaPreview[]>([])
  const [addingEdu, setAddingEdu] = useState(false)
  const [newEduForm, setNewEduForm] = useState<any>({})
  const [newEduMedia, setNewEduMedia] = useState<MediaPreview[]>([])

  // ── Load ──
  useEffect(() => {
    candidateApi.getProfile().then((p: any) => {
      setProfile(p)
      setPf({
        country: p.country || '', city: p.city || '', speciality: p.speciality || '',
        experience_years: p.experience_years || '', daily_rate: p.daily_rate || '',
        currency: p.currency || 'EUR', availability: p.availability || 'immediate',
        bio: p.bio || '', phone: p.phone || '',
        linkedin_url: p.linkedin_url || '', portfolio_url: p.portfolio_url || '',
        title: p.title || '',
      })
      setSkillIds(p.candidate_skills?.map((cs: any) => cs.skill.id) || [])
      setHeroForm({
        first_name: p.user?.first_name || '',
        last_name: p.user?.last_name || '',
        bio: p.bio || '',
        title: p.title || '',
      })
    }).catch((err: any) => {
      if (err.response?.status === 401) router.push('/auth/login')
      else if (err.response?.status === 404) router.replace('/candidat/onboarding')
      else setError('Erreur lors du chargement des données.')
    }).finally(() => setLoading(false))
  }, [router])

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  const refresh = () => candidateApi.getProfile().then((p: any) => setProfile(p)).catch(() => { })

  // ── Photo handlers ──
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    try {
      await candidateApi.uploadPhoto(f)
      flash('Photo mise à jour !')
      refresh()
    } catch { setError('Erreur lors de l\'upload de la photo.') }
    e.target.value = ''
  }

  const handleDeletePhoto = async () => {
    setPhotoDropdown(false)
    try {
      await candidateApi.deletePhoto()
      flash('Photo supprimée.')
      refresh()
    } catch { setError('Erreur lors de la suppression.') }
  }

  // ── Hero save ──
  const saveHero = async () => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateUserNames({ first_name: heroForm.first_name, last_name: heroForm.last_name })
      await candidateApi.updateProfile({ title: heroForm.title })
      await refresh()
      setEditHero(false)
      flash('Profil mis à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  const saveBio = async () => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateProfile({ bio: heroForm.bio })
      await refresh()
      setEditBio(false)
      flash('Bio mise à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  // ── Main info save ──
  const saveMain = async () => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateProfile({
        ...pf,
        experience_years: Number(pf.experience_years),
        daily_rate: Number(pf.daily_rate),
      })
      await refresh()
      setEditMain(false)
      flash('Profil mis à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  // ── Skills save ──
  const saveSkills = async () => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateProfile({ skill_ids: skillIds })
      await refresh()
      setEditSkills(false)
      flash('Compétences mises à jour !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  // ── Experience handlers ──
  const startEditExp = (exp: any) => {
    setEditingExpId(exp.id)
    setExpNewMedia([])
    setExpForm({
      title: exp.title, company: exp.company, employment_type: exp.employment_type,
      location: exp.location || '', description: exp.description || '',
      start_month: String(exp.start_month || ''), start_year: String(exp.start_year || ''),
      end_month: exp.end_month ? String(exp.end_month) : '',
      end_year: exp.end_year ? String(exp.end_year) : '',
      is_current: exp.is_current || false,
      skill_ids: exp.experience_skills?.map((es: any) => es.skill.id) || [],
    })
  }

  const saveExp = async (id: string) => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateExperience(id, {
        ...expForm,
        start_month: Number(expForm.start_month), start_year: Number(expForm.start_year),
        end_month: expForm.end_month ? Number(expForm.end_month) : undefined,
        end_year: expForm.end_year ? Number(expForm.end_year) : undefined,
      })
      for (const m of expNewMedia) {
        await candidateApi.uploadExperienceMedia(id, m.file).catch(() => { })
      }
      await refresh()
      setEditingExpId(null); setExpNewMedia([])
      flash('Expérience mise à jour !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const deleteExp = async (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return
    try { await candidateApi.deleteExperience(id); await refresh() } catch { }
  }

  const deleteExpMedia = async (expId: string, mediaId: string) => {
    try { await candidateApi.deleteExperienceMedia(expId, mediaId); await refresh() } catch { }
  }

  const addExpMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setExpNewMedia(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const addNewExp = async () => {
    if (!newExpForm.title || !newExpForm.company || !newExpForm.start_year) return
    setSaving(true); setError('')
    try {
      const res = await candidateApi.createExperience({
        ...newExpForm,
        start_month: Number(newExpForm.start_month), start_year: Number(newExpForm.start_year),
        end_month: newExpForm.end_month ? Number(newExpForm.end_month) : undefined,
        end_year: newExpForm.end_year ? Number(newExpForm.end_year) : undefined,
        skill_ids: newExpForm.skill_ids || [],
      })
      const expId = res?.experience?.id
      if (expId) {
        for (const m of newExpMedia) {
          await candidateApi.uploadExperienceMedia(expId, m.file).catch(() => { })
        }
      }
      await refresh()
      setAddingExp(false); setNewExpForm({}); setNewExpMedia([])
      flash('Expérience ajoutée !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const addNewExpMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setNewExpMedia(prev => [...prev, ...previews])
    e.target.value = ''
  }

  // ── Education handlers ──
  const startEditEdu = (edu: any) => {
    setEditingEduId(edu.id)
    setEduNewMedia([])
    setEduForm({
      school: edu.school, degree: edu.degree, field: edu.field || '', level: edu.level || 'bac_plus_3',
      description: edu.description || '',
      start_month: String(edu.start_month || ''), start_year: String(edu.start_year || ''),
      end_month: edu.end_month ? String(edu.end_month) : '',
      end_year: edu.end_year ? String(edu.end_year) : '',
      is_current: edu.is_current || false,
      skill_ids: edu.education_skills?.map((es: any) => es.skill.id) || [],
    })
  }

  const saveEdu = async (id: string) => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateEducation(id, {
        ...eduForm,
        start_month: Number(eduForm.start_month), start_year: Number(eduForm.start_year),
        end_month: eduForm.end_month ? Number(eduForm.end_month) : undefined,
        end_year: eduForm.end_year ? Number(eduForm.end_year) : undefined,
      })
      for (const m of eduNewMedia) {
        await candidateApi.uploadEducationMedia(id, m.file).catch(() => { })
      }
      await refresh()
      setEditingEduId(null); setEduNewMedia([])
      flash('Formation mise à jour !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const deleteEdu = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return
    try { await candidateApi.deleteEducation(id); await refresh() } catch { }
  }

  const deleteEduMedia = async (eduId: string, mediaId: string) => {
    try { await candidateApi.deleteEducationMedia(eduId, mediaId); await refresh() } catch { }
  }

  const addEduMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setEduNewMedia(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const addNewEdu = async () => {
    if (!newEduForm.school || !newEduForm.degree || !newEduForm.start_year) return
    setSaving(true); setError('')
    try {
      const res = await candidateApi.createEducation({
        ...newEduForm,
        start_month: Number(newEduForm.start_month), start_year: Number(newEduForm.start_year),
        end_month: newEduForm.end_month ? Number(newEduForm.end_month) : undefined,
        end_year: newEduForm.end_year ? Number(newEduForm.end_year) : undefined,
        skill_ids: newEduForm.skill_ids || [],
      })
      const eduId = res?.education?.id
      if (eduId) {
        for (const m of newEduMedia) {
          await candidateApi.uploadEducationMedia(eduId, m.file).catch(() => { })
        }
      }
      await refresh()
      setAddingEdu(false); setNewEduForm({}); setNewEduMedia([])
      flash('Formation ajoutée !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const addNewEduMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setNewEduMedia(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const handleLogout = async () => {
    try { const Cookies = (await import('js-cookie')).default; await import('@/lib/auth-service').then(m => m.authApi.logout(Cookies.get('refresh_token') || '')) } catch { }
    clearTokens(); router.push('/')
  }

  // ── Loading / Error ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  )

  const experiences = profile?.experiences || []
  const educations = profile?.educations || []
  const profileSkills = profile?.candidate_skills?.map((cs: any) => cs.skill) || []
  const photoUrl = profile?.photo_url
  const userName = `${profile?.user?.first_name || ''} ${profile?.user?.last_name || ''}`.trim()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Lightbox Gallery ── */}
      {gallery && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setGallery(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setGallery(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-60"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {gallery.items.length > 1 && (
            <>
              <button
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-60"
                onClick={(e) => {
                  e.stopPropagation()
                  setGallery(prev => prev ? { ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length } : null)
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-60"
                onClick={(e) => {
                  e.stopPropagation()
                  setGallery(prev => prev ? { ...prev, index: (prev.index + 1) % prev.items.length } : null)
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Media Content */}
          <div className="w-full h-full flex items-center justify-center p-4 sm:p-12" onClick={e => e.stopPropagation()}>
            {gallery.items[gallery.index].type === 'image' || gallery.items[gallery.index].type === 'photo' ? (
              <img
                src={gallery.items[gallery.index].url}
                alt=""
                className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-300"
              />
            ) : (
              <video
                src={gallery.items[gallery.index].url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
              />
            )}
          </div>

          {/* Counter */}
          {gallery.items.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md">
              {gallery.index + 1} / {gallery.items.length}
            </div>
          )}
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/candidat/dashboard" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <img src="/logo.png" alt="OPSIDE" className='w-28'/>
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

        {/* ── IDENTITY: Photo + Nom + Titre ── */}
        <div className="bg-white rounded-3xl border border-border p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="relative shrink-0">
              <div
                onClick={() => photoUrl && setGallery({ items: [{ url: photoUrl, type: 'photo' }], index: 0 })}
                className={`w-36 h-36 rounded-xl overflow-hidden bg-background border-4 border-white shadow-lg flex items-center justify-center ${photoUrl ? 'cursor-pointer' : ''}`}
              >
                {photoUrl
                  ? <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
                  : <User className="w-16 h-16 text-muted" />
                }
              </div>

              {/* Camera button */}
              <div className="absolute bottom-1 right-1">
                <button
                  onClick={() => setPhotoDropdown(d => !d)}
                  className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {photoDropdown && (
                  <div className="absolute bottom-11 right-0 bg-white rounded-xl border border-border shadow-lg overflow-hidden w-44 z-10">
                    <button
                      onClick={() => { photoInputRef.current?.click(); setPhotoDropdown(false) }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-background transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-accent" /> Modifier la photo
                    </button>
                    {photoUrl && (
                      <button
                        onClick={handleDeletePhoto}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-border"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer la photo
                      </button>
                    )}
                  </div>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Name + Title */}
            <div className="flex-1 w-full">
              {editHero ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Titre professionnel</label>
                    <Input
                      placeholder="ex: Développeur React.js | Next.js | Vue.js..."
                      value={heroForm.title}
                      onChange={e => setHeroForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditHero(false)}>Annuler</Button>
                    <Button size="sm" onClick={saveHero} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center md:items-start pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{userName || 'Votre nom'}</h1>
                    <button onClick={() => setEditHero(true)} className="text-muted hover:text-accent transition-colors">
                      <Pencil className="w-5 h-5" />
                    </button>
                  </div>
                  {profile?.title ? (
                    <p className="text-xl text-accent font-medium">{profile.title}</p>
                  ) : (
                    <button onClick={() => setEditHero(true)} className="text-sm text-muted hover:text-accent transition-colors italic">
                      + Ajouter un titre professionnel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BIO ── */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-lg">À propos</h2>
            {!editBio && (
              <button onClick={() => setEditBio(true)} className="text-muted hover:text-accent transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {editBio ? (
            <div className="space-y-4">
              <AutoTextarea
                value={heroForm.bio}
                onChange={v => setHeroForm(f => ({ ...f, bio: v }))}
                placeholder="Décrivez votre parcours, vos aspirations..."
                className="border border-border rounded-xl px-4 py-3 text-sm min-h-[120px] focus:border-accent transition-colors"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditBio(false)}>Annuler</Button>
                <Button size="sm" onClick={saveBio} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="text-muted text-sm leading-relaxed">
              {profile?.bio ? (
                <p className="whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <button onClick={() => setEditBio(true)} className="italic hover:text-accent transition-colors">
                  + Ajouter une présentation bio...
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Informations principales ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-lg">Infos</h2>
            {!editMain && (
              <button onClick={() => setEditMain(true)} className="text-muted hover:text-accent transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {editMain ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Pays *" value={pf.country} onChange={e => setPf((p: any) => ({ ...p, country: e.target.value }))} />
                <Input label="Ville" value={pf.city} onChange={e => setPf((p: any) => ({ ...p, city: e.target.value }))} />
              </div>
              <Select label="Spécialité" options={SPECIALITIES} value={pf.speciality} onChange={e => setPf((p: any) => ({ ...p, speciality: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Années d'expérience" type="number" value={pf.experience_years} onChange={e => setPf((p: any) => ({ ...p, experience_years: e.target.value }))} />
                <Select label="Disponibilité" options={AVAILABILITY} value={pf.availability} onChange={e => setPf((p: any) => ({ ...p, availability: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Taux journalier" type="number" value={pf.daily_rate} onChange={e => setPf((p: any) => ({ ...p, daily_rate: e.target.value }))} />
                <Select label="Devise" options={CURRENCIES} value={pf.currency} onChange={e => setPf((p: any) => ({ ...p, currency: e.target.value }))} />
              </div>
              <Input label="Téléphone" value={pf.phone} onChange={e => setPf((p: any) => ({ ...p, phone: e.target.value }))} />
              <Input label="LinkedIn" type="url" value={pf.linkedin_url} onChange={e => setPf((p: any) => ({ ...p, linkedin_url: e.target.value }))} />
              <Input label="Portfolio / GitHub" type="url" value={pf.portfolio_url} onChange={e => setPf((p: any) => ({ ...p, portfolio_url: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditMain(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveMain} loading={saving}><Save className="w-4 h-4" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Pays', value: profile?.country },
                { label: 'Ville', value: profile?.city },
                { label: 'Spécialité', value: SPEC_LABEL[profile?.speciality] || profile?.speciality },
                { label: 'Expérience', value: profile?.experience_years ? `${profile.experience_years} an(s)` : undefined },
                { label: 'Disponibilité', value: AVAIL_LABEL[profile?.availability] || profile?.availability },
                { label: 'Taux journalier', value: profile?.daily_rate ? `${profile.daily_rate} ${profile.currency}` : undefined },
                { label: 'Téléphone', value: profile?.phone },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-2">
                  <dt className="text-muted w-36 shrink-0">{row.label}</dt>
                  <dd className="text-foreground font-medium">{row.value}</dd>
                </div>
              ))}

              {profile?.linkedin_url && (
                <div className="flex items-start gap-2">
                  <dt className="text-muted w-36 shrink-0">LinkedIn</dt>
                  <dd>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700 transition-colors flex items-center gap-1 text-sm break-all">
                      {profile.linkedin_url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </dd>
                </div>
              )}
              {profile?.portfolio_url && (
                <div className="flex items-start gap-2">
                  <dt className="text-muted w-36 shrink-0">Portfolio</dt>
                  <dd>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700 transition-colors flex items-center gap-1 text-sm break-all">
                      {profile.portfolio_url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </dd>
                </div>
              )}

            </dl>
          )}
        </div>

        {/* ── Compétences ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground text-lg">Compétences</h2>
            {!editSkills && (
              <button onClick={() => setEditSkills(true)} className="text-muted hover:text-accent transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {editSkills ? (
            <div className="space-y-4">
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditSkills(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveSkills} loading={saving}><Save className="w-4 h-4" /> Sauvegarder</Button>
              </div>
            </div>
          ) : profileSkills.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(
                profileSkills.reduce((acc: any, skill: any) => {
                  const cat = skill.category || 'other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(skill);
                  return acc;
                }, {})
              ).map(([category, skills]: [string, any]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: any) => (
                      <span
                        key={s.id}
                        className="px-3 py-1.5 rounded-xl bg-background border border-border text-foreground text-sm font-medium hover:border-accent hover:text-accent transition-all cursor-default"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
              <p className="text-sm text-muted mb-3">Aucune compétence renseignée.</p>
              <Button size="sm" variant="secondary" onClick={() => setEditSkills(true)}>
                <Plus className="w-3.5 h-3.5" /> Ajouter des compétences
              </Button>
            </div>
          )}
        </div>

        {/* ── Expériences ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Expériences</h2>

          {experiences.map((exp: any) => (
            <div key={exp.id} className="bg-white rounded-2xl border border-border p-6">
              {editingExpId === exp.id ? (
                <div className="space-y-4">
                  <Input label="Intitulé *" value={expForm.title || ''} onChange={e => setExpForm((f: any) => ({ ...f, title: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Entreprise *" value={expForm.company || ''} onChange={e => setExpForm((f: any) => ({ ...f, company: e.target.value }))} />
                    <Select label="Type" options={EMP_TYPES} value={expForm.employment_type || 'temps_plein'} onChange={e => setExpForm((f: any) => ({ ...f, employment_type: e.target.value }))} />
                  </div>
                  <Input label="Lieu" value={expForm.location || ''} onChange={e => setExpForm((f: any) => ({ ...f, location: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois début" options={MONTHS} placeholder="Mois" value={expForm.start_month || ''} onChange={e => setExpForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                    <Select label="Année début" options={years()} placeholder="Année" value={expForm.start_year || ''} onChange={e => setExpForm((f: any) => ({ ...f, start_year: e.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={expForm.is_current || false} onChange={e => setExpForm((f: any) => ({ ...f, is_current: e.target.checked }))} />
                    <span className="text-sm">Poste actuel</span>
                  </label>
                  {!expForm.is_current && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={expForm.end_month || ''} onChange={e => setExpForm((f: any) => ({ ...f, end_month: e.target.value }))} />
                      <Select label="Année fin" options={years()} placeholder="Année" value={expForm.end_year || ''} onChange={e => setExpForm((f: any) => ({ ...f, end_year: e.target.value }))} />
                    </div>
                  )}
                  <Textarea label="Description" value={expForm.description || ''} onChange={e => setExpForm((f: any) => ({ ...f, description: e.target.value }))} />
                  <SkillSelector label="Compétences" selectedIds={expForm.skill_ids || []} onChange={ids => setExpForm((f: any) => ({ ...f, skill_ids: ids }))} />

                  {/* Medias existants */}
                  {exp.experience_medias?.filter((m: any) => m.media_type === 'image' || m.media_type === 'video').length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Médias actuels</p>
                      <MediaGallery
                        medias={exp.experience_medias}
                        onDelete={(mid) => deleteExpMedia(exp.id, mid)}
                        editMode
                        onOpen={(idx) => {
                          const items = exp.experience_medias
                            .filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video')
                            .map((mx: any) => ({ url: mx.url, type: mx.media_type }))
                          setGallery({ items, index: idx })
                        }}
                      />
                    </div>
                  )}

                  {/* Nouveaux médias */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Ajouter des médias</p>
                    <MediaPreviewRow previews={expNewMedia} onRemove={i => setExpNewMedia(prev => prev.filter((_, idx) => idx !== i))} />
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                      <ImagePlus className="w-4 h-4" /> Ajouter
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={addExpMediaFiles} />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => setEditingExpId(null)}>Annuler</Button>
                    <Button size="sm" onClick={() => saveExp(exp.id)} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{exp.title}</p>
                      <p className="text-sm text-muted">{exp.company} · {exp.employment_type}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {exp.start_month}/{exp.start_year} — {exp.is_current ? 'Présent' : `${exp.end_month || '?'}/${exp.end_year || '?'}`}
                      </p>
                      {exp.location && <p className="text-xs text-muted mt-0.5">{exp.location}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => startEditExp(exp)} className="text-muted hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteExp(exp.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {exp.description && <p className="text-sm text-muted mb-3 leading-relaxed">{exp.description}</p>}
                  {exp.experience_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {exp.experience_skills.map((es: any) => (
                        <span key={es.skill.id} className="px-2 py-0.5 rounded-md bg-background border border-border text-xs text-muted">{es.skill.name}</span>
                      ))}
                    </div>
                  )}
                  {/* Media gallery */}
                  {exp.experience_medias?.filter((m: any) => m.media_type === 'image' || m.media_type === 'video').length > 0 && (
                    <div className="mt-3">
                      <MediaGallery
                        medias={exp.experience_medias}
                        onOpen={(idx) => {
                          const items = exp.experience_medias
                            .filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video')
                            .map((mx: any) => ({ url: mx.url, type: mx.media_type }))
                          setGallery({ items, index: idx })
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Ajout nouvelle expérience */}
          {addingExp && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Nouvelle expérience</h3>
              <Input label="Intitulé *" placeholder="Développeur Backend" value={newExpForm.title || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entreprise *" value={newExpForm.company || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, company: e.target.value }))} />
                <Select label="Type" options={EMP_TYPES} value={newExpForm.employment_type || 'temps_plein'} onChange={e => setNewExpForm((f: any) => ({ ...f, employment_type: e.target.value }))} />
              </div>
              <Input label="Lieu" value={newExpForm.location || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, location: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={newExpForm.start_month || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                <Select label="Année début *" options={years()} placeholder="Année" value={newExpForm.start_year || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, start_year: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newExpForm.is_current || false} onChange={e => setNewExpForm((f: any) => ({ ...f, is_current: e.target.checked }))} />
                <span className="text-sm">Poste actuel</span>
              </label>
              {!newExpForm.is_current && (
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={newExpForm.end_month || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, end_month: e.target.value }))} />
                  <Select label="Année fin" options={years()} placeholder="Année" value={newExpForm.end_year || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, end_year: e.target.value }))} />
                </div>
              )}
              <Textarea label="Description" value={newExpForm.description || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, description: e.target.value }))} />
              <SkillSelector label="Compétences" selectedIds={newExpForm.skill_ids || []} onChange={ids => setNewExpForm((f: any) => ({ ...f, skill_ids: ids }))} />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Médias</p>
                <MediaPreviewRow previews={newExpMedia} onRemove={i => setNewExpMedia(prev => prev.filter((_, idx) => idx !== i))} />
                <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                  <ImagePlus className="w-4 h-4" /> Ajouter des médias
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={addNewExpMedia} />
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setAddingExp(false); setNewExpForm({}); setNewExpMedia([]) }}>Annuler</Button>
                <Button size="sm" onClick={addNewExp} loading={saving}><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
              </div>
            </div>
          )}

          <button
            onClick={() => setAddingExp(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Ajouter une expérience
          </button>
        </div>

        {/* ── Formations ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Formations</h2>

          {educations.map((edu: any) => (
            <div key={edu.id} className="bg-white rounded-2xl border border-border p-6">
              {editingEduId === edu.id ? (
                <div className="space-y-4">
                  <Input label="École *" value={eduForm.school || ''} onChange={e => setEduForm((f: any) => ({ ...f, school: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Diplôme *" value={eduForm.degree || ''} onChange={e => setEduForm((f: any) => ({ ...f, degree: e.target.value }))} />
                    <Select label="Niveau" options={LEVELS} value={eduForm.level || 'bac_plus_3'} onChange={e => setEduForm((f: any) => ({ ...f, level: e.target.value }))} />
                  </div>
                  <Input label="Domaine" value={eduForm.field || ''} onChange={e => setEduForm((f: any) => ({ ...f, field: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois début" options={MONTHS} placeholder="Mois" value={eduForm.start_month || ''} onChange={e => setEduForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                    <Select label="Année début" options={years()} placeholder="Année" value={eduForm.start_year || ''} onChange={e => setEduForm((f: any) => ({ ...f, start_year: e.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={eduForm.is_current || false} onChange={e => setEduForm((f: any) => ({ ...f, is_current: e.target.checked }))} />
                    <span className="text-sm">En cours</span>
                  </label>
                  {!eduForm.is_current && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={eduForm.end_month || ''} onChange={e => setEduForm((f: any) => ({ ...f, end_month: e.target.value }))} />
                      <Select label="Année fin" options={years()} placeholder="Année" value={eduForm.end_year || ''} onChange={e => setEduForm((f: any) => ({ ...f, end_year: e.target.value }))} />
                    </div>
                  )}
                  <Textarea label="Description" value={eduForm.description || ''} onChange={e => setEduForm((f: any) => ({ ...f, description: e.target.value }))} />
                  <SkillSelector label="Compétences" selectedIds={eduForm.skill_ids || []} onChange={ids => setEduForm((f: any) => ({ ...f, skill_ids: ids }))} />

                  {edu.education_medias?.filter((m: any) => m.media_type === 'image' || m.media_type === 'video').length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Médias actuels</p>
                      <MediaGallery
                        medias={edu.education_medias}
                        onDelete={(mid) => deleteEduMedia(edu.id, mid)}
                        editMode
                        onOpen={(idx) => {
                          const items = edu.education_medias
                            .filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video')
                            .map((mx: any) => ({ url: mx.url, type: mx.media_type }))
                          setGallery({ items, index: idx })
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Ajouter des médias</p>
                    <MediaPreviewRow previews={eduNewMedia} onRemove={i => setEduNewMedia(prev => prev.filter((_, idx) => idx !== i))} />
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                      <ImagePlus className="w-4 h-4" /> Ajouter
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={addEduMediaFiles} />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => setEditingEduId(null)}>Annuler</Button>
                    <Button size="sm" onClick={() => saveEdu(edu.id)} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{edu.degree}</p>
                      <p className="text-sm text-muted">{edu.school}{edu.field ? ` · ${edu.field}` : ''}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {edu.start_month}/{edu.start_year} — {edu.is_current ? 'En cours' : `${edu.end_month || '?'}/${edu.end_year || '?'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => startEditEdu(edu)} className="text-muted hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteEdu(edu.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {edu.description && <p className="text-sm text-muted mb-3 leading-relaxed">{edu.description}</p>}
                  {edu.education_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {edu.education_skills.map((es: any) => (
                        <span key={es.skill.id} className="px-2 py-0.5 rounded-md bg-background border border-border text-xs text-muted">{es.skill.name}</span>
                      ))}
                    </div>
                  )}
                  {edu.education_medias?.filter((m: any) => m.media_type === 'image' || m.media_type === 'video').length > 0 && (
                    <div className="mt-3">
                      <MediaGallery
                        medias={edu.education_medias}
                        onOpen={(idx) => {
                          const items = edu.education_medias
                            .filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video')
                            .map((mx: any) => ({ url: mx.url, type: mx.media_type }))
                          setGallery({ items, index: idx })
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {addingEdu && (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Nouvelle formation</h3>
              <Input label="École *" placeholder="EMIT Antananarivo" value={newEduForm.school || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, school: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Diplôme *" placeholder="Licence" value={newEduForm.degree || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, degree: e.target.value }))} />
                <Select label="Niveau" options={LEVELS} value={newEduForm.level || 'bac_plus_3'} onChange={e => setNewEduForm((f: any) => ({ ...f, level: e.target.value }))} />
              </div>
              <Input label="Domaine" value={newEduForm.field || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, field: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={newEduForm.start_month || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                <Select label="Année début *" options={years()} placeholder="Année" value={newEduForm.start_year || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, start_year: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newEduForm.is_current || false} onChange={e => setNewEduForm((f: any) => ({ ...f, is_current: e.target.checked }))} />
                <span className="text-sm">En cours</span>
              </label>
              {!newEduForm.is_current && (
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={newEduForm.end_month || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, end_month: e.target.value }))} />
                  <Select label="Année fin" options={years()} placeholder="Année" value={newEduForm.end_year || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, end_year: e.target.value }))} />
                </div>
              )}
              <Textarea label="Description" value={newEduForm.description || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, description: e.target.value }))} />
              <SkillSelector label="Compétences" selectedIds={newEduForm.skill_ids || []} onChange={ids => setNewEduForm((f: any) => ({ ...f, skill_ids: ids }))} />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Médias</p>
                <MediaPreviewRow previews={newEduMedia} onRemove={i => setNewEduMedia(prev => prev.filter((_, idx) => idx !== i))} />
                <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                  <ImagePlus className="w-4 h-4" /> Ajouter des médias
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={addNewEduMedia} />
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setAddingEdu(false); setNewEduForm({}); setNewEduMedia([]) }}>Annuler</Button>
                <Button size="sm" onClick={addNewEdu} loading={saving}><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
              </div>
            </div>
          )}

          <button
            onClick={() => setAddingEdu(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Ajouter une formation
          </button>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}
