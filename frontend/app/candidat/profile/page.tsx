'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import SkillSelector from '@/components/ui/SkillSelector'
import FileUpload from '@/components/ui/FileUpload'
import { candidateApi } from '@/lib/api'
import { clearTokens } from '@/lib/auth'
import { ArrowLeft, Plus, Trash2, Check, LogOut, Save, Pencil, X } from 'lucide-react'
import { CandidateProfile, Experience, Education } from '@/types'

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' }, { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' }, { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' }, { value: 'design', label: 'Design UX/UI' },
  { value: 'data', label: 'Data / IA' }, { value: 'other', label: 'Autre' },
]
const AVAILABILITY = [
  { value: 'immediate', label: 'Immédiat' }, { value: 'one_week', label: 'Sous une semaine' },
  { value: 'two_weeks', label: 'Sous deux semaines' }, { value: 'one_month', label: 'Sous un mois' },
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
  label: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][i]
}))
const years = () => {
  const now = new Date().getFullYear()
  return Array.from({ length: 30 }, (_, i) => ({ value: String(now - i), label: String(now - i) }))
}

export default function CandidatProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<CandidateProfile | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Profile form state
  const [pf, setPf] = useState<any>({})
  const [skillIds, setSkillIds] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Editing states
  const [editingExpId, setEditingExpId] = useState<string | null>(null)
  const [editingEduId, setEditingEduId] = useState<string | null>(null)
  const [expForms, setExpForms] = useState<Record<string, any>>({})
  const [eduForms, setEduForms] = useState<Record<string, any>>({})
  const [newExp, setNewExp] = useState<any | null>(null)
  const [newEdu, setNewEdu] = useState<any | null>(null)
  const [expMediaFiles, setExpMediaFiles] = useState<Record<string, File>>({})
  const [eduMediaFiles, setEduMediaFiles] = useState<Record<string, File>>({})

  useEffect(() => {
    Promise.all([
      candidateApi.getProfile(),
      candidateApi.getExperiences(),
      candidateApi.getEducations(),
    ]).then(([p, e, ed]) => {
      const prof = p.data
      setProfileData(prof)
      setPf({
        country: prof.country || '', city: prof.city || '',
        speciality: prof.speciality || '', experience_years: prof.experience_years || '',
        daily_rate: prof.daily_rate || '', currency: prof.currency || 'EUR',
        availability: prof.availability || 'immediate', bio: prof.bio || '',
        phone: prof.phone || '', linkedin_url: prof.linkedin_url || '', portfolio_url: prof.portfolio_url || '',
      })
      setSkillIds(prof.skills?.map((s: any) => s.id) || [])
      setExperiences(e.data || [])
      setEducations(ed.data || [])
    }).catch(() => router.push('/auth/login')).finally(() => setLoading(false))
  }, [router])

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const saveProfile = async () => {
    setSaving(true); setError('')
    try {
      await candidateApi.updateProfile({ ...pf, experience_years: Number(pf.experience_years), daily_rate: Number(pf.daily_rate), skill_ids: skillIds })
      if (photoFile) await candidateApi.uploadPhoto(photoFile).catch(() => {})
      showSuccess('Profil mis à jour !')
    } catch { setError('Erreur lors de la mise à jour.') } finally { setSaving(false) }
  }

  const saveExp = async (id: string) => {
    setSaving(true); setError('')
    const f = expForms[id]
    try {
      await candidateApi.updateExperience(id, { ...f, start_month: Number(f.start_month), start_year: Number(f.start_year), end_month: f.end_month ? Number(f.end_month) : undefined, end_year: f.end_year ? Number(f.end_year) : undefined })
      if (expMediaFiles[id]) await candidateApi.uploadExperienceMedia(id, expMediaFiles[id]).catch(() => {})
      const { data } = await candidateApi.getExperiences()
      setExperiences(data); setEditingExpId(null); showSuccess('Expérience mise à jour !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const deleteExp = async (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return
    try { await candidateApi.deleteExperience(id); setExperiences(prev => prev.filter(e => e.id !== id)) } catch {}
  }

  const deleteExpMedia = async (expId: string, mediaId: string) => {
    try {
      await candidateApi.deleteExperienceMedia(expId, mediaId)
      const { data } = await candidateApi.getExperiences()
      setExperiences(data)
    } catch {}
  }

  const saveEdu = async (id: string) => {
    setSaving(true); setError('')
    const f = eduForms[id]
    try {
      await candidateApi.updateEducation(id, { ...f, start_month: Number(f.start_month), start_year: Number(f.start_year), end_month: f.end_month ? Number(f.end_month) : undefined, end_year: f.end_year ? Number(f.end_year) : undefined })
      if (eduMediaFiles[id]) await candidateApi.uploadEducationMedia(id, eduMediaFiles[id]).catch(() => {})
      const { data } = await candidateApi.getEducations()
      setEducations(data); setEditingEduId(null); showSuccess('Formation mise à jour !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const deleteEdu = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return
    try { await candidateApi.deleteEducation(id); setEducations(prev => prev.filter(e => e.id !== id)) } catch {}
  }

  const addExp = async () => {
    if (!newExp?.title || !newExp?.company || !newExp?.start_year) return
    setSaving(true)
    try {
      const { data } = await candidateApi.createExperience({ ...newExp, start_month: Number(newExp.start_month), start_year: Number(newExp.start_year), end_month: newExp.end_month ? Number(newExp.end_month) : undefined, end_year: newExp.end_year ? Number(newExp.end_year) : undefined })
      if (newExp.mediaFile && data.experience?.id) await candidateApi.uploadExperienceMedia(data.experience.id, newExp.mediaFile).catch(() => {})
      const { data: exps } = await candidateApi.getExperiences()
      setExperiences(exps); setNewExp(null); showSuccess('Expérience ajoutée !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const addEdu = async () => {
    if (!newEdu?.school || !newEdu?.degree || !newEdu?.start_year) return
    setSaving(true)
    try {
      const { data } = await candidateApi.createEducation({ ...newEdu, start_month: Number(newEdu.start_month), start_year: Number(newEdu.start_year), end_month: newEdu.end_month ? Number(newEdu.end_month) : undefined, end_year: newEdu.end_year ? Number(newEdu.end_year) : undefined })
      if (newEdu.mediaFile && data.education?.id) await candidateApi.uploadEducationMedia(data.education.id, newEdu.mediaFile).catch(() => {})
      const { data: edus } = await candidateApi.getEducations()
      setEducations(edus); setNewEdu(null); showSuccess('Formation ajoutée !')
    } catch { setError('Erreur.') } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    try { const Cookies = (await import('js-cookie')).default; await import('@/lib/api').then(m => m.authApi.logout(Cookies.get('refresh_token') || '')) } catch {}
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
            <Link href="/candidat/dashboard" className="text-muted hover:text-foreground transition-colors">
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

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mon profil</h1>
          <p className="text-muted text-sm">Gérez toutes vos informations.</p>
        </div>

        {success && <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}
        {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Informations principales</h2>
          <FileUpload label="Photo de profil" accept="image/*" onFile={setPhotoFile} preview={profileData?.photo_url} />
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
          <Textarea label="Bio" value={pf.bio} onChange={e => setPf((p: any) => ({ ...p, bio: e.target.value }))} />
          <Input label="Téléphone" value={pf.phone} onChange={e => setPf((p: any) => ({ ...p, phone: e.target.value }))} />
          <Input label="LinkedIn" value={pf.linkedin_url} onChange={e => setPf((p: any) => ({ ...p, linkedin_url: e.target.value }))} />
          <Input label="Portfolio / GitHub" value={pf.portfolio_url} onChange={e => setPf((p: any) => ({ ...p, portfolio_url: e.target.value }))} />
          <SkillSelector selected={skillIds} onChange={setSkillIds} />
          <Button className="w-full" onClick={saveProfile} loading={saving}>
            <Save className="w-4 h-4" /> Sauvegarder le profil
          </Button>
        </div>

        {/* Experiences */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Expériences</h2>
          {experiences.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl border border-border p-6">
              {editingExpId === exp.id ? (
                <div className="space-y-4">
                  <Input label="Intitulé *" value={expForms[exp.id]?.title || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], title: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Entreprise *" value={expForms[exp.id]?.company || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], company: e.target.value } }))} />
                    <Select label="Type" options={EMP_TYPES} value={expForms[exp.id]?.employment_type || 'temps_plein'} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], employment_type: e.target.value } }))} />
                  </div>
                  <Input label="Lieu" value={expForms[exp.id]?.location || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], location: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois début" options={MONTHS} placeholder="Mois" value={expForms[exp.id]?.start_month || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], start_month: e.target.value } }))} />
                    <Select label="Année début" options={years()} placeholder="Année" value={expForms[exp.id]?.start_year || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], start_year: e.target.value } }))} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={expForms[exp.id]?.is_current || false} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], is_current: e.target.checked } }))} />
                    <span className="text-sm">Poste actuel</span>
                  </label>
                  {!expForms[exp.id]?.is_current && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={expForms[exp.id]?.end_month || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], end_month: e.target.value } }))} />
                      <Select label="Année fin" options={years()} placeholder="Année" value={expForms[exp.id]?.end_year || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], end_year: e.target.value } }))} />
                    </div>
                  )}
                  <Textarea label="Description" value={expForms[exp.id]?.description || ''} onChange={e => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], description: e.target.value } }))} />
                  <SkillSelector label="Compétences" selected={expForms[exp.id]?.skill_ids || []} onChange={ids => setExpForms(p => ({ ...p, [exp.id]: { ...p[exp.id], skill_ids: ids } }))} />
                  {/* Existing medias */}
                  {exp.medias?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Fichiers existants</p>
                      {exp.medias.map(m => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border text-sm">
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate">{m.name || 'Fichier'}</a>
                          <button onClick={() => deleteExpMedia(exp.id, m.id)} className="text-muted hover:text-red-500 ml-2"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUpload label="Ajouter un fichier" accept="image/*,application/pdf" onFile={f => setExpMediaFiles(p => ({ ...p, [exp.id]: f }))} />
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditingExpId(null)}>Annuler</Button>
                    <Button size="sm" onClick={() => saveExp(exp.id)} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{exp.title}</p>
                    <p className="text-sm text-muted">{exp.company} · {exp.employment_type}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {exp.start_month}/{exp.start_year} — {exp.is_current ? 'Présent' : `${exp.end_month || '?'}/${exp.end_year || '?'}`}
                    </p>
                    {exp.medias?.length > 0 && <p className="text-xs text-accent mt-1">{exp.medias.length} fichier(s) joint(s)</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => { setEditingExpId(exp.id); setExpForms(p => ({ ...p, [exp.id]: { title: exp.title, company: exp.company, employment_type: exp.employment_type, start_month: String(exp.start_month), start_year: String(exp.start_year), end_month: exp.end_month ? String(exp.end_month) : '', end_year: exp.end_year ? String(exp.end_year) : '', is_current: exp.is_current, location: exp.location || '', description: exp.description || '', skill_ids: exp.skills?.map((s: any) => s.id) || [] } })) }} className="text-muted hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteExp(exp.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* New experience form */}
          {newExp !== null ? (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Nouvelle expérience</h3>
              <Input label="Intitulé *" placeholder="Développeur Backend" value={newExp.title || ''} onChange={e => setNewExp((p: any) => ({ ...p, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entreprise *" placeholder="Entreprise" value={newExp.company || ''} onChange={e => setNewExp((p: any) => ({ ...p, company: e.target.value }))} />
                <Select label="Type" options={EMP_TYPES} value={newExp.employment_type || 'temps_plein'} onChange={e => setNewExp((p: any) => ({ ...p, employment_type: e.target.value }))} />
              </div>
              <Input label="Lieu" value={newExp.location || ''} onChange={e => setNewExp((p: any) => ({ ...p, location: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={newExp.start_month || ''} onChange={e => setNewExp((p: any) => ({ ...p, start_month: e.target.value }))} />
                <Select label="Année début *" options={years()} placeholder="Année" value={newExp.start_year || ''} onChange={e => setNewExp((p: any) => ({ ...p, start_year: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newExp.is_current || false} onChange={e => setNewExp((p: any) => ({ ...p, is_current: e.target.checked }))} />
                <span className="text-sm">Poste actuel</span>
              </label>
              {!newExp.is_current && (
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={newExp.end_month || ''} onChange={e => setNewExp((p: any) => ({ ...p, end_month: e.target.value }))} />
                  <Select label="Année fin" options={years()} placeholder="Année" value={newExp.end_year || ''} onChange={e => setNewExp((p: any) => ({ ...p, end_year: e.target.value }))} />
                </div>
              )}
              <Textarea label="Description" value={newExp.description || ''} onChange={e => setNewExp((p: any) => ({ ...p, description: e.target.value }))} />
              <SkillSelector label="Compétences" selected={newExp.skill_ids || []} onChange={ids => setNewExp((p: any) => ({ ...p, skill_ids: ids }))} />
              <FileUpload label="Pièce jointe" accept="image/*,application/pdf" onFile={f => setNewExp((p: any) => ({ ...p, mediaFile: f }))} />
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => setNewExp(null)}>Annuler</Button>
                <Button size="sm" onClick={addExp} loading={saving}><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewExp({ title: '', company: '', employment_type: 'temps_plein', start_month: '', start_year: '', end_month: '', end_year: '', is_current: false, location: '', description: '', skill_ids: [] })} className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Ajouter une expérience
            </button>
          )}
        </div>

        {/* Educations */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Formations</h2>
          {educations.map(edu => (
            <div key={edu.id} className="bg-white rounded-2xl border border-border p-6">
              {editingEduId === edu.id ? (
                <div className="space-y-4">
                  <Input label="École *" value={eduForms[edu.id]?.school || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], school: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Diplôme *" value={eduForms[edu.id]?.degree || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], degree: e.target.value } }))} />
                    <Select label="Niveau" options={LEVELS} value={eduForms[edu.id]?.level || 'bac_plus_3'} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], level: e.target.value } }))} />
                  </div>
                  <Input label="Domaine" value={eduForms[edu.id]?.field || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], field: e.target.value } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois début" options={MONTHS} placeholder="Mois" value={eduForms[edu.id]?.start_month || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], start_month: e.target.value } }))} />
                    <Select label="Année début" options={years()} placeholder="Année" value={eduForms[edu.id]?.start_year || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], start_year: e.target.value } }))} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={eduForms[edu.id]?.is_current || false} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], is_current: e.target.checked } }))} />
                    <span className="text-sm">En cours</span>
                  </label>
                  {!eduForms[edu.id]?.is_current && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={eduForms[edu.id]?.end_month || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], end_month: e.target.value } }))} />
                      <Select label="Année fin" options={years()} placeholder="Année" value={eduForms[edu.id]?.end_year || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], end_year: e.target.value } }))} />
                    </div>
                  )}
                  <Textarea label="Description" value={eduForms[edu.id]?.description || ''} onChange={e => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], description: e.target.value } }))} />
                  <SkillSelector label="Compétences" selected={eduForms[edu.id]?.skill_ids || []} onChange={ids => setEduForms(p => ({ ...p, [edu.id]: { ...p[edu.id], skill_ids: ids } }))} />
                  {edu.medias?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Fichiers existants</p>
                      {edu.medias.map(m => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border text-sm">
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate">{m.name || 'Fichier'}</a>
                        </div>
                      ))}
                    </div>
                  )}
                  <FileUpload label="Ajouter un fichier" accept="image/*,application/pdf" onFile={f => setEduMediaFiles(p => ({ ...p, [edu.id]: f }))} />
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setEditingEduId(null)}>Annuler</Button>
                    <Button size="sm" onClick={() => saveEdu(edu.id)} loading={saving}><Save className="w-3.5 h-3.5" /> Sauvegarder</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{edu.degree}</p>
                    <p className="text-sm text-muted">{edu.school} · {edu.field}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {edu.start_month}/{edu.start_year} — {edu.is_current ? 'En cours' : `${edu.end_month || '?'}/${edu.end_year || '?'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => { setEditingEduId(edu.id); setEduForms(p => ({ ...p, [edu.id]: { school: edu.school, degree: edu.degree, field: edu.field, level: edu.level, start_month: String(edu.start_month), start_year: String(edu.start_year), end_month: edu.end_month ? String(edu.end_month) : '', end_year: edu.end_year ? String(edu.end_year) : '', is_current: edu.is_current, description: edu.description || '', skill_ids: edu.skills?.map((s: any) => s.id) || [] } })) }} className="text-muted hover:text-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteEdu(edu.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {newEdu !== null ? (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Nouvelle formation</h3>
              <Input label="École *" placeholder="EMIT Antananarivo" value={newEdu.school || ''} onChange={e => setNewEdu((p: any) => ({ ...p, school: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Diplôme *" placeholder="Licence" value={newEdu.degree || ''} onChange={e => setNewEdu((p: any) => ({ ...p, degree: e.target.value }))} />
                <Select label="Niveau" options={LEVELS} value={newEdu.level || 'bac_plus_3'} onChange={e => setNewEdu((p: any) => ({ ...p, level: e.target.value }))} />
              </div>
              <Input label="Domaine" placeholder="Génie Logiciel" value={newEdu.field || ''} onChange={e => setNewEdu((p: any) => ({ ...p, field: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={newEdu.start_month || ''} onChange={e => setNewEdu((p: any) => ({ ...p, start_month: e.target.value }))} />
                <Select label="Année début *" options={years()} placeholder="Année" value={newEdu.start_year || ''} onChange={e => setNewEdu((p: any) => ({ ...p, start_year: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newEdu.is_current || false} onChange={e => setNewEdu((p: any) => ({ ...p, is_current: e.target.checked }))} />
                <span className="text-sm">En cours</span>
              </label>
              {!newEdu.is_current && (
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={newEdu.end_month || ''} onChange={e => setNewEdu((p: any) => ({ ...p, end_month: e.target.value }))} />
                  <Select label="Année fin" options={years()} placeholder="Année" value={newEdu.end_year || ''} onChange={e => setNewEdu((p: any) => ({ ...p, end_year: e.target.value }))} />
                </div>
              )}
              <Textarea label="Description" value={newEdu.description || ''} onChange={e => setNewEdu((p: any) => ({ ...p, description: e.target.value }))} />
              <SkillSelector label="Compétences" selected={newEdu.skill_ids || []} onChange={ids => setNewEdu((p: any) => ({ ...p, skill_ids: ids }))} />
              <FileUpload label="Justificatif" accept="image/*,application/pdf" onFile={f => setNewEdu((p: any) => ({ ...p, mediaFile: f }))} />
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => setNewEdu(null)}>Annuler</Button>
                <Button size="sm" onClick={addEdu} loading={saving}><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewEdu({ school: '', degree: '', field: '', level: 'bac_plus_3', start_month: '', start_year: '', end_month: '', end_year: '', is_current: false, description: '', skill_ids: [] })} className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted text-sm font-medium hover:border-accent/50 hover:text-accent flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Ajouter une formation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
