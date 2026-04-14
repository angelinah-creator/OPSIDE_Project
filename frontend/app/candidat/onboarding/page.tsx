'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import SkillSelector from '@/components/ui/SkillSelector'
import { candidateApi } from '@/lib/candidate-service'
import { User, Plus, Trash2, X, ImagePlus, Video } from 'lucide-react'

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: 'Design UX/UI' },
  { value: 'data', label: 'Data / IA' },
  { value: 'other', label: 'Autre' },
]
const AVAILABILITY = [
  { value: 'immediate', label: 'Immédiat' },
  { value: 'one_week', label: 'Sous une semaine' },
  { value: 'two_weeks', label: 'Sous deux semaines' },
  { value: 'one_month', label: 'Sous un mois' },
]
const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'MGA', label: 'MGA (Ar)' },
]
const EMP_TYPES = [
  { value: 'temps_plein', label: 'Temps plein' },
  { value: 'temps_partiel', label: 'Temps partiel' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
]
const LEVELS = [
  { value: 'bac', label: 'Bac' },
  { value: 'bac_plus_2', label: 'Bac +2' },
  { value: 'bac_plus_3', label: 'Bac +3 (Licence)' },
  { value: 'bac_plus_5', label: 'Bac +5 (Master)' },
  { value: 'bac_plus_8', label: 'Bac +8 (Doctorat)' },
  { value: 'autre', label: 'Autre / Certification' },
]
const MONTHS = [
  { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' },
  { value: '3', label: 'Mars' }, { value: '4', label: 'Avril' },
  { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' },
  { value: '9', label: 'Septembre' }, { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
]
const years = () => {
  const now = new Date().getFullYear()
  return Array.from({ length: 30 }, (_, i) => ({ value: String(now - i), label: String(now - i) }))
}

interface MediaPreview { file: File; previewUrl: string }

interface ExpForm {
  title: string; employment_type: string; company: string
  start_month: string; start_year: string; end_month: string; end_year: string
  is_current: boolean; location: string; description: string; skill_ids: string[]
  mediaFiles: MediaPreview[]
}
interface EduForm {
  school: string; degree: string; field: string; level: string
  start_month: string; start_year: string; end_month: string; end_year: string
  is_current: boolean; description: string; skill_ids: string[]
  mediaFiles: MediaPreview[]
}

const emptyExp = (): ExpForm => ({
  title: '', employment_type: 'temps_plein', company: '',
  start_month: '', start_year: '', end_month: '', end_year: '',
  is_current: false, location: '', description: '', skill_ids: [], mediaFiles: [],
})
const emptyEdu = (): EduForm => ({
  school: '', degree: '', field: '', level: 'bac_plus_3',
  start_month: '', start_year: '', end_month: '', end_year: '',
  is_current: false, description: '', skill_ids: [], mediaFiles: [],
})

// ─── Auto-resize textarea ─────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, className = '', label }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; className?: string; label?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <textarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        rows={1}
        className={`w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted text-sm transition-all outline-none resize-none overflow-hidden focus:border-accent focus:ring-2 focus:ring-accent/10 ${className}`}
      />
    </div>
  )
}

export default function CandidatOnboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    country: '', city: '', speciality: '', experience_years: '',
    daily_rate: '', currency: 'EUR', availability: 'immediate',
    bio: '', phone: '', linkedin_url: '', portfolio_url: '', skill_ids: [] as string[],
  })

  const [experiences, setExperiences] = useState<ExpForm[]>([])
  const [educations, setEducations] = useState<EduForm[]>([])

  const setP = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }))

  const setExp = (i: number, k: string, v: any) =>
    setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e))

  const setEdu = (i: number, k: string, v: any) =>
    setEducations(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const addExpMedia = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews: MediaPreview[] = files
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setExperiences(prev => prev.map((exp, idx) =>
      idx === i ? { ...exp, mediaFiles: [...exp.mediaFiles, ...previews] } : exp
    ))
    e.target.value = ''
  }

  const removeExpMedia = (expIdx: number, mediaIdx: number) => {
    setExperiences(prev => prev.map((exp, idx) =>
      idx === expIdx ? { ...exp, mediaFiles: exp.mediaFiles.filter((_, mi) => mi !== mediaIdx) } : exp
    ))
  }

  const addEduMedia = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews: MediaPreview[] = files
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }))
    setEducations(prev => prev.map((edu, idx) =>
      idx === i ? { ...edu, mediaFiles: [...edu.mediaFiles, ...previews] } : edu
    ))
    e.target.value = ''
  }

  const removeEduMedia = (eduIdx: number, mediaIdx: number) => {
    setEducations(prev => prev.map((edu, idx) =>
      idx === eduIdx ? { ...edu, mediaFiles: edu.mediaFiles.filter((_, mi) => mi !== mediaIdx) } : edu
    ))
  }

  const handleSubmit = async () => {
    setError('')
    if (!profile.country || !profile.speciality || !profile.experience_years || !profile.daily_rate) {
      setError('Les champs Pays, Spécialité, Années d\'expérience et Taux journalier sont obligatoires.')
      return
    }
    setLoading(true)
    try {
      // 1. Create profile
      await candidateApi.createProfile({
        country: profile.country,
        city: profile.city || undefined,
        speciality: profile.speciality,
        experience_years: Number(profile.experience_years),
        daily_rate: Number(profile.daily_rate),
        currency: profile.currency,
        availability: profile.availability,
        bio: profile.bio || undefined,
        phone: profile.phone || undefined,
        linkedin_url: profile.linkedin_url || undefined,
        portfolio_url: profile.portfolio_url || undefined,
        skill_ids: profile.skill_ids,
      })

      // 2. Upload photo
      if (photoFile) await candidateApi.uploadPhoto(photoFile).catch(() => {})

      // 3. Create experiences
      for (const exp of experiences) {
        if (!exp.title || !exp.company || !exp.start_year) continue
        const res = await candidateApi.createExperience({
          title: exp.title, employment_type: exp.employment_type, company: exp.company,
          start_month: Number(exp.start_month), start_year: Number(exp.start_year),
          end_month: exp.is_current ? undefined : (exp.end_month ? Number(exp.end_month) : undefined),
          end_year: exp.is_current ? undefined : (exp.end_year ? Number(exp.end_year) : undefined),
          is_current: exp.is_current, location: exp.location || undefined,
          description: exp.description || undefined, skill_ids: exp.skill_ids,
        })
        const expId = res?.experience?.id
        if (expId) {
          for (const m of exp.mediaFiles) {
            await candidateApi.uploadExperienceMedia(expId, m.file).catch(() => {})
          }
        }
      }

      // 4. Create educations
      for (const edu of educations) {
        if (!edu.school || !edu.degree || !edu.start_year) continue
        const res = await candidateApi.createEducation({
          school: edu.school, degree: edu.degree, field: edu.field, level: edu.level,
          start_month: Number(edu.start_month), start_year: Number(edu.start_year),
          end_month: edu.is_current ? undefined : (edu.end_month ? Number(edu.end_month) : undefined),
          end_year: edu.is_current ? undefined : (edu.end_year ? Number(edu.end_year) : undefined),
          is_current: edu.is_current, description: edu.description || undefined, skill_ids: edu.skill_ids,
        })
        const eduId = res?.education?.id
        if (eduId) {
          for (const m of edu.mediaFiles) {
            await candidateApi.uploadEducationMedia(eduId, m.file).catch(() => {})
          }
        }
      }

      router.push('/candidat/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="" className="w-24" />
          <span className="text-sm text-muted">Créez votre profil pour continuer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mon profil candidat</h1>
          <p className="text-muted text-sm">Remplissez votre profil. Les expériences et formations sont facultatives.</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {/* ── Photo ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Photo de profil</h2>
          <div className="flex items-center gap-5">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors overflow-hidden shrink-0"
            >
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-muted" />
              }
            </div>
            <div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-sm text-accent font-medium hover:underline"
              >
                {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
              </button>
              <p className="text-xs text-muted mt-1">JPG, PNG — recommandé 400×400px</p>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>

        {/* ── Infos principales ── */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informations principales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pays *" placeholder="Madagascar" value={profile.country} onChange={setP('country')} required />
            <Input label="Ville" placeholder="Antananarivo" value={profile.city} onChange={setP('city')} />
          </div>
          <Select label="Spécialité *" options={SPECIALITIES} placeholder="Choisir..." value={profile.speciality} onChange={setP('speciality') as any} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Années d'expérience *" type="number" min="0" max="50" placeholder="4" value={profile.experience_years} onChange={setP('experience_years')} />
            <Select label="Disponibilité *" options={AVAILABILITY} value={profile.availability} onChange={setP('availability') as any} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Taux journalier *" type="number" placeholder="80" value={profile.daily_rate} onChange={setP('daily_rate')} />
            <Select label="Devise" options={CURRENCIES} value={profile.currency} onChange={setP('currency') as any} />
          </div>
          <AutoTextarea label="Bio" placeholder="Décrivez-vous en quelques lignes..." value={profile.bio} onChange={v => setProfile(p => ({ ...p, bio: v }))} />
        </div>

        {/* ── Liens ── */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Liens & contact</h2>
          <Input label="Téléphone" placeholder="+261 34 12 34 567" value={profile.phone} onChange={setP('phone')} />
          <Input label="LinkedIn" type="url" placeholder="https://linkedin.com/in/..." value={profile.linkedin_url} onChange={setP('linkedin_url')} />
          <Input label="Portfolio / GitHub" type="url" placeholder="https://github.com/..." value={profile.portfolio_url} onChange={setP('portfolio_url')} />
        </div>

        {/* ── Compétences ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Compétences</h2>
          <SkillSelector selectedIds={profile.skill_ids} onChange={(ids) => setProfile(p => ({ ...p, skill_ids: ids }))} />
        </div>

        {/* ── Expériences ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-lg">Expériences <span className="text-muted font-normal text-sm">(facultatif)</span></h2>
          </div>

          {experiences.map((exp, i) => {
            const expMediaInputRef = { current: null } as React.MutableRefObject<HTMLInputElement | null>
            return (
              <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Expérience {i + 1}</h3>
                  <button type="button" onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input label="Intitulé du poste *" placeholder="Développeur Backend NestJS" value={exp.title} onChange={e => setExp(i, 'title', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Entreprise *" placeholder="Tech Madagascar SARL" value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} />
                  <Select label="Type d'emploi" options={EMP_TYPES} value={exp.employment_type} onChange={e => setExp(i, 'employment_type', e.target.value)} />
                </div>
                <Input label="Lieu" placeholder="Antananarivo, Madagascar" value={exp.location} onChange={e => setExp(i, 'location', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={exp.start_month} onChange={e => setExp(i, 'start_month', e.target.value)} />
                  <Select label="Année début *" options={years()} placeholder="Année" value={exp.start_year} onChange={e => setExp(i, 'start_year', e.target.value)} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={exp.is_current} onChange={e => setExp(i, 'is_current', e.target.checked)} className="rounded border-border text-accent" />
                  <span className="text-sm text-foreground">Poste actuel</span>
                </label>
                {!exp.is_current && (
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={exp.end_month} onChange={e => setExp(i, 'end_month', e.target.value)} />
                    <Select label="Année fin" options={years()} placeholder="Année" value={exp.end_year} onChange={e => setExp(i, 'end_year', e.target.value)} />
                  </div>
                )}
                <AutoTextarea label="Description" placeholder="Décrivez vos responsabilités..." value={exp.description} onChange={v => setExp(i, 'description', v)} />
                <SkillSelector label="Compétences utilisées" selectedIds={exp.skill_ids} onChange={ids => setExp(i, 'skill_ids', ids)} />

                {/* Multi-media upload */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Médias (photos / vidéos)</p>
                  {exp.mediaFiles.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 mb-3">
                      {exp.mediaFiles.map((m, mi) => (
                        <div key={mi} className="relative shrink-0 w-32 h-24 rounded-xl overflow-hidden bg-background border border-border">
                          {m.file.type.startsWith('image/') ? (
                            <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={m.previewUrl} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeExpMedia(i, mi)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    Ajouter des médias
                    <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => addExpMedia(i, e)} />
                  </label>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setExperiences(prev => [...prev, emptyExp()])}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Ajouter une expérience
          </button>
        </div>

        {/* ── Formations ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Formations <span className="text-muted font-normal text-sm">(facultatif)</span></h2>

          {educations.map((edu, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Formation {i + 1}</h3>
                <button type="button" onClick={() => setEducations(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Input label="École / Organisme *" placeholder="EMIT Antananarivo" value={edu.school} onChange={e => setEdu(i, 'school', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Diplôme *" placeholder="Licence en Informatique" value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} />
                <Select label="Niveau" options={LEVELS} value={edu.level} onChange={e => setEdu(i, 'level', e.target.value)} />
              </div>
              <Input label="Domaine" placeholder="Génie Logiciel" value={edu.field} onChange={e => setEdu(i, 'field', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={edu.start_month} onChange={e => setEdu(i, 'start_month', e.target.value)} />
                <Select label="Année début *" options={years()} placeholder="Année" value={edu.start_year} onChange={e => setEdu(i, 'start_year', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={edu.is_current} onChange={e => setEdu(i, 'is_current', e.target.checked)} className="rounded border-border text-accent" />
                <span className="text-sm text-foreground">En cours</span>
              </label>
              {!edu.is_current && (
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={edu.end_month} onChange={e => setEdu(i, 'end_month', e.target.value)} />
                  <Select label="Année fin" options={years()} placeholder="Année" value={edu.end_year} onChange={e => setEdu(i, 'end_year', e.target.value)} />
                </div>
              )}
              <AutoTextarea label="Description" placeholder="Matières, projets, distinctions..." value={edu.description} onChange={v => setEdu(i, 'description', v)} />
              <SkillSelector label="Compétences acquises" selectedIds={edu.skill_ids} onChange={ids => setEdu(i, 'skill_ids', ids)} />

              {/* Multi-media upload */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Médias (photos / vidéos)</p>
                {edu.mediaFiles.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-3">
                    {edu.mediaFiles.map((m, mi) => (
                      <div key={mi} className="relative shrink-0 w-32 h-24 rounded-xl overflow-hidden bg-background border border-border">
                        {m.file.type.startsWith('image/') ? (
                          <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={m.previewUrl} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeEduMedia(i, mi)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  Ajouter des médias
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => addEduMedia(i, e)} />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setEducations(prev => [...prev, emptyEdu()])}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Ajouter une formation
          </button>
        </div>

        {/* ── Submit ── */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          loading={loading}
          disabled={!profile.country || !profile.speciality || !profile.experience_years || !profile.daily_rate}
        >
          Créer mon profil et accéder au tableau de bord
        </Button>
        <div className="h-6" />
      </div>
    </div>
  )
}
