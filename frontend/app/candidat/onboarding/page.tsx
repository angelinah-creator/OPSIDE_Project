'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import SkillSelector from '@/components/ui/SkillSelector'
import FileUpload from '@/components/ui/FileUpload'
import { candidateApi } from '@/lib/api'
import {
  Check, ArrowRight, ArrowLeft, Plus, Trash2, Upload, X, Paperclip
} from 'lucide-react'

const STEPS = ['Mon profil', 'Expériences', 'Formations']

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

interface ExpForm {
  title: string; employment_type: string; company: string
  start_month: string; start_year: string; end_month: string; end_year: string
  is_current: boolean; location: string; description: string; skill_ids: string[]
  mediaFile?: File | null; savedId?: string
}

interface EduForm {
  school: string; degree: string; field: string; level: string
  start_month: string; start_year: string; end_month: string; end_year: string
  is_current: boolean; description: string; skill_ids: string[]
  mediaFile?: File | null; savedId?: string
}

const emptyExp = (): ExpForm => ({
  title: '', employment_type: 'temps_plein', company: '',
  start_month: '', start_year: '', end_month: '', end_year: '',
  is_current: false, location: '', description: '', skill_ids: [], mediaFile: null,
})

const emptyEdu = (): EduForm => ({
  school: '', degree: '', field: '', level: 'bac_plus_3',
  start_month: '', start_year: '', end_month: '', end_year: '',
  is_current: false, description: '', skill_ids: [], mediaFile: null,
})

export default function CandidatOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 0 - Profile
  const [profile, setProfile] = useState({
    country: '', city: '', speciality: '', experience_years: '',
    daily_rate: '', currency: 'EUR', availability: 'immediate',
    bio: '', phone: '', linkedin_url: '', portfolio_url: '', skill_ids: [] as string[],
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Step 1 - Experiences
  const [experiences, setExperiences] = useState<ExpForm[]>([emptyExp()])

  // Step 2 - Educations
  const [educations, setEducations] = useState<EduForm[]>([emptyEdu()])

  const setP = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }))

  const setExp = (i: number, k: string, v: any) =>
    setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e))

  const setEdu = (i: number, k: string, v: any) =>
    setEducations(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e))

  // Submit profile (step 0 → 1)
  const submitProfile = async () => {
    setError('')
    setLoading(true)
    try {
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
      if (photoFile) await candidateApi.uploadPhoto(photoFile).catch(() => {})
      setStep(1)
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la création du profil.')
    } finally { setLoading(false) }
  }

  // Submit experiences (step 1 → 2)
  const submitExperiences = async () => {
    setError('')
    setLoading(true)
    try {
      for (const exp of experiences) {
        if (!exp.title || !exp.company || !exp.start_year) continue
        const { data } = await candidateApi.createExperience({
          title: exp.title, employment_type: exp.employment_type, company: exp.company,
          start_month: Number(exp.start_month), start_year: Number(exp.start_year),
          end_month: exp.is_current ? undefined : (exp.end_month ? Number(exp.end_month) : undefined),
          end_year: exp.is_current ? undefined : (exp.end_year ? Number(exp.end_year) : undefined),
          is_current: exp.is_current, location: exp.location || undefined,
          description: exp.description || undefined, skill_ids: exp.skill_ids,
        })
        if (exp.mediaFile && data.experience?.id) {
          await candidateApi.uploadExperienceMedia(data.experience.id, exp.mediaFile).catch(() => {})
        }
      }
      setStep(2)
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde des expériences.')
    } finally { setLoading(false) }
  }

  // Submit educations → finish
  const submitEducations = async () => {
    setError('')
    setLoading(true)
    try {
      for (const edu of educations) {
        if (!edu.school || !edu.degree || !edu.start_year) continue
        const { data } = await candidateApi.createEducation({
          school: edu.school, degree: edu.degree, field: edu.field, level: edu.level,
          start_month: Number(edu.start_month), start_year: Number(edu.start_year),
          end_month: edu.is_current ? undefined : (edu.end_month ? Number(edu.end_month) : undefined),
          end_year: edu.is_current ? undefined : (edu.end_year ? Number(edu.end_year) : undefined),
          is_current: edu.is_current, description: edu.description || undefined, skill_ids: edu.skill_ids,
        })
        if (edu.mediaFile && data.education?.id) {
          await candidateApi.uploadEducationMedia(data.education.id, edu.mediaFile).catch(() => {})
        }
      }
      router.push('/candidat/dashboard')
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde des formations.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo size={28} />
          {/* Stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                  i < step ? 'bg-accent text-white' :
                  i === step ? 'bg-foreground text-white' :
                  'bg-background border border-border text-muted'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`ml-1 text-xs hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-6 sm:w-10 h-px mx-2 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted">{step + 1}/{STEPS.length}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        {/* ── STEP 0: PROFILE ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Mon profil candidat</h1>
              <p className="text-muted text-sm">Ces informations seront visibles par les entreprises.</p>
            </div>

            {/* Photo */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Photo de profil</h2>
              <FileUpload label="Photo (optionnel)" accept="image/*" onFile={setPhotoFile} />
            </div>

            {/* Infos principales */}
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
              <Textarea label="Bio" placeholder="Décrivez-vous en quelques lignes..." value={profile.bio} onChange={setP('bio') as any} />
            </div>

            {/* Liens */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Liens & contact</h2>
              <Input label="Téléphone" placeholder="+261 34 12 34 567" value={profile.phone} onChange={setP('phone')} />
              <Input label="LinkedIn" type="url" placeholder="https://linkedin.com/in/..." value={profile.linkedin_url} onChange={setP('linkedin_url')} />
              <Input label="Portfolio / GitHub" type="url" placeholder="https://github.com/..." value={profile.portfolio_url} onChange={setP('portfolio_url')} />
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">Compétences</h2>
              <SkillSelector selected={profile.skill_ids} onChange={(ids) => setProfile(p => ({ ...p, skill_ids: ids }))} />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={submitProfile}
              loading={loading}
              disabled={!profile.country || !profile.speciality || !profile.experience_years || !profile.daily_rate}
            >
              Continuer vers les expériences <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── STEP 1: EXPERIENCES ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Mes expériences</h1>
              <p className="text-muted text-sm">Ajoutez vos expériences professionnelles.</p>
            </div>

            {experiences.map((exp, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Expérience {i + 1}</h2>
                  {experiences.length > 1 && (
                    <button type="button" onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                <Textarea label="Description" placeholder="Décrivez vos responsabilités..." value={exp.description} onChange={e => setExp(i, 'description', e.target.value)} />
                <SkillSelector label="Compétences utilisées" selected={exp.skill_ids} onChange={ids => setExp(i, 'skill_ids', ids)} />
                <FileUpload label="Pièce jointe (optionnel)" accept="image/*,application/pdf" onFile={f => setExp(i, 'mediaFile', f)} />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setExperiences(prev => [...prev, emptyExp()])}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Ajouter une expérience
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
              <Button className="flex-1" size="lg" onClick={submitExperiences} loading={loading}>
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full text-center text-sm text-muted hover:text-foreground transition-colors">
              Passer cette étape →
            </button>
          </div>
        )}

        {/* ── STEP 2: EDUCATIONS ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Mes formations</h1>
              <p className="text-muted text-sm">Diplômes, certifications, formations en ligne...</p>
            </div>

            {educations.map((edu, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Formation {i + 1}</h2>
                  {educations.length > 1 && (
                    <button type="button" onClick={() => setEducations(prev => prev.filter((_, idx) => idx !== i))} className="text-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                <Textarea label="Description" placeholder="Matières, projets, distinctions..." value={edu.description} onChange={e => setEdu(i, 'description', e.target.value)} />
                <SkillSelector label="Compétences acquises" selected={edu.skill_ids} onChange={ids => setEdu(i, 'skill_ids', ids)} />
                <FileUpload label="Justificatif (optionnel)" accept="image/*,application/pdf" onFile={f => setEdu(i, 'mediaFile', f)} />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setEducations(prev => [...prev, emptyEdu()])}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Ajouter une formation
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
              <Button className="flex-1" size="lg" onClick={submitEducations} loading={loading}>
                Terminer mon profil <Check className="w-4 h-4" />
              </Button>
            </div>
            <button type="button" onClick={() => router.push('/candidat/dashboard')} className="w-full text-center text-sm text-muted hover:text-foreground transition-colors">
              Passer cette étape →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
