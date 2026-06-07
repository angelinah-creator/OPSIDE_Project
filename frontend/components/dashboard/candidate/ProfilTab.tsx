'use client';

import { useEffect, useState, useRef } from 'react';
import { ExternalLink, Mail, Phone, MapPin, Calendar, DollarSign, Briefcase, Pencil, Save, X, Plus, Trash2, Camera, ImagePlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { candidateApi } from '@/lib/candidate-service';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import CountrySelect from '@/components/ui/CountrySelect';
import SkillSelector from '@/components/ui/SkillSelector';
import Button from '@/components/ui/Button';

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' }, { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' }, { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' }, { value: 'design', label: 'Design UX/UI' },
  { value: 'data', label: 'Data / IA' }, { value: 'other', label: 'Autre' },
];
const AVAILABILITY = [
  { value: 'immediate', label: 'Immédiat' }, { value: 'two_weeks', label: 'Sous 2 semaines' },
  { value: 'one_month', label: 'Sous 1 mois' }, { value: 'three_months', label: 'Sous 3 mois' },
];
const COUNTRIES = [
  { value: 'madagascar', label: 'Madagascar', flag: 'mg' },
  { value: 'senegal', label: 'Sénégal', flag: 'sn' },
  { value: 'maurice', label: 'Maurice', flag: 'mu' },
  { value: 'kenya', label: 'Kenya', flag: 'ke' },
  { value: 'nigeria', label: 'Nigeria', flag: 'ng' },
  { value: 'egypte', label: 'Égypte', flag: 'eg' },
  { value: 'maroc', label: 'Maroc', flag: 'ma' },
  { value: 'tunisie', label: 'Tunisie', flag: 'tn' },
];

const COUNTRY_LABELS: Record<string, { label: string; flag: string }> = {
  madagascar: { label: 'Madagascar', flag: 'mg' },
  senegal: { label: 'Sénégal', flag: 'sn' },
  maurice: { label: 'Maurice', flag: 'mu' },
  kenya: { label: 'Kenya', flag: 'ke' },
  nigeria: { label: 'Nigeria', flag: 'ng' },
  egypte: { label: 'Égypte', flag: 'eg' },
  maroc: { label: 'Maroc', flag: 'ma' },
  tunisie: { label: 'Tunisie', flag: 'tn' },
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  madagascar: 'MGA', senegal: 'XOF', maurice: 'MUR', kenya: 'KES',
  nigeria: 'NGN', egypte: 'EGP', maroc: 'MAD', tunisie: 'TND',
};
const EMP_TYPES = [
  { value: 'temps_plein', label: 'Temps plein' }, { value: 'temps_partiel', label: 'Temps partiel' },
  { value: 'freelance', label: 'Freelance' }, { value: 'stage', label: 'Stage' }, { value: 'alternance', label: 'Alternance' },
];
const LEVELS = [
  { value: 'bac', label: 'Bac' }, { value: 'bac_plus_2', label: 'Bac +2' },
  { value: 'bac_plus_3', label: 'Bac +3' }, { value: 'bac_plus_5', label: 'Bac +5' },
  { value: 'bac_plus_8', label: 'Doctorat' }, { value: 'autre', label: 'Autre' },
];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i],
}));
// Years
const years = () => {
  const now = new Date().getFullYear();
  return Array.from({ length: 30 }, (_, i) => ({ value: String(now - i), label: String(now - i) }));
};
const AVAIL_LABEL: Record<string, string> = {
  immediate: 'Immédiat', two_weeks: 'Sous 2 semaines', one_month: 'Sous 1 mois', three_months: 'Sous 3 mois',
};
const SPEC_LABEL: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', fullstack: 'Fullstack', mobile: 'Mobile',
  devops: 'DevOps', design: 'Design UX/UI', data: 'Data / IA', other: 'Autre',
};

interface MediaPreview { file: File; previewUrl: string }

// Media gallery
function MediaGallery({ medias, onDelete, editMode, onOpen }: {
  medias: any[]
  onDelete?: (id: string) => void
  editMode?: boolean
  onOpen?: (index: number) => void
}) {
  const visible = medias.filter(m => m.media_type === 'image' || m.media_type === 'video');
  if (!visible.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 mt-3">
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
              onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Media preview row
function MediaPreviewRow({ previews, onRemove }: { previews: MediaPreview[]; onRemove: (i: number) => void }) {
  if (!previews.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 mt-3">
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
  );
}

// Auto textarea
function AutoTextarea({ value, onChange, placeholder, className = '', readOnly = false }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; className?: string; readOnly?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
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
  );
}

interface ProfilTabProps {
  user: any;
  profile: any;
}

// Profil tab
export default function ProfilTab({ user: initialUser, profile: initialProfile }: ProfilTabProps) {
  const [profile, setProfile] = useState<any>(initialProfile);
  const [user, setUser] = useState<any>(initialUser);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoDropdown, setPhotoDropdown] = useState(false);
  const [gallery, setGallery] = useState<{ items: { url: string, type: string }[], index: number } | null>(null);

  const [editHero, setEditHero] = useState(false);
  const [heroForm, setHeroForm] = useState({ first_name: '', last_name: '', title: '' });

  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<any>({});

  const [editSkills, setEditSkills] = useState(false);
  const [skillIds, setSkillIds] = useState<string[]>([]);

  const [editBio, setEditBio] = useState(false);
  const [bioForm, setBioForm] = useState('');

  const [editSocial, setEditSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({ linkedin_url: '', portfolio_url: '', github_url: '' });

  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<any>({});
  const [expNewMedia, setExpNewMedia] = useState<MediaPreview[]>([]);
  const [addingExp, setAddingExp] = useState(false);
  const [newExpForm, setNewExpForm] = useState<any>({});
  const [newExpMedia, setNewExpMedia] = useState<MediaPreview[]>([]);

  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState<any>({});
  const [eduNewMedia, setEduNewMedia] = useState<MediaPreview[]>([]);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEduForm, setNewEduForm] = useState<any>({});
  const [newEduMedia, setNewEduMedia] = useState<MediaPreview[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const photoUrl = profile?.photo_url 
    ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${API_URL}${profile.photo_url}`)
    : null;

  // Formate date
  const formatDate = (m?: number, y?: number) => {
    if (!y) return '';
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${m ? months[m - 1] + ' ' : ''}${y}`;
  };

  // Flash
  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  // Refresh
  const refresh = () => candidateApi.getMyProfile().then((p: any) => { setProfile(p); setUser(p.user); }).catch(() => { });

  // Gère photo change
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      await candidateApi.uploadPhoto(f);
      flash('Photo mise à jour !');
      refresh();
    } catch { setError('Erreur upload photo.'); }
    e.target.value = '';
  };

  // Gère delete photo
  const handleDeletePhoto = async () => {
    setPhotoDropdown(false);
    try {
      await candidateApi.deletePhoto();
      flash('Photo supprimée.');
      refresh();
    } catch { setError('Erreur suppression photo.'); }
  };

  // Start edit hero
  const startEditHero = () => {
    setEditHero(true);
    setHeroForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      title: profile?.title || '',
    });
  };

  // Save hero
  const saveHero = async () => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateUserNames({ first_name: heroForm.first_name, last_name: heroForm.last_name });
      await candidateApi.updateProfile({ title: heroForm.title });
      await refresh();
      setEditHero(false);
      flash('Profil mis à jour !');
    } catch { setError('Erreur mise à jour profil.'); } finally { setSaving(false); }
  };

  // Start edit info
  const startEditInfo = () => {
    setEditInfo(true);
    setInfoForm({
      country: profile?.country || '', city: profile?.city || '', speciality: profile?.speciality || '',
      experience_years: profile?.experience_years || '', daily_rate: profile?.daily_rate || '',
      currency: profile?.currency || 'EUR', availability: profile?.availability || 'immediate',
      phone: profile?.phone || ''
    });
  };

  // Save info
  const saveInfo = async () => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateProfile({
        ...infoForm,
        experience_years: Number(infoForm.experience_years),
        daily_rate: Number(infoForm.daily_rate)
      });
      await refresh();
      setEditInfo(false);
      flash('Informations mises à jour !');
    } catch { setError('Erreur mise à jour infos.'); } finally { setSaving(false); }
  };

  // Save skills
  const saveSkills = async () => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateProfile({ skill_ids: skillIds });
      await refresh();
      setEditSkills(false);
      flash('Compétences mises à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // Save bio
  const saveBio = async () => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateProfile({ bio: bioForm });
      await refresh();
      setEditBio(false);
      flash('Bio mise à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // Save social
  const saveSocial = async () => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateProfile({ 
        linkedin_url: socialForm.linkedin_url || undefined, 
        portfolio_url: socialForm.portfolio_url || undefined,
        github_url: socialForm.github_url || undefined 
      });
      await refresh();
      setEditSocial(false);
      flash('Liens mis à jour !');
    } catch { setError('Erreur de mise à jour des liens.'); } finally { setSaving(false); }
  };

  // Start edit exp
  const startEditExp = (exp: any) => {
    setEditingExpId(exp.id); setExpNewMedia([]);
    setExpForm({
      title: exp.title, company: exp.company, employment_type: exp.employment_type,
      location: exp.location || '', description: exp.description || '',
      start_month: String(exp.start_month || ''), start_year: String(exp.start_year || ''),
      end_month: exp.end_month ? String(exp.end_month) : '', end_year: exp.end_year ? String(exp.end_year) : '',
      is_current: exp.is_current || false, skill_ids: exp.experience_skills?.map((es: any) => es.skill.id) || [],
    });
  };

  // Save exp
  const saveExp = async (id: string) => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateExperience(id, {
        ...expForm, start_month: Number(expForm.start_month), start_year: Number(expForm.start_year),
        end_month: expForm.end_month ? Number(expForm.end_month) : undefined, end_year: expForm.end_year ? Number(expForm.end_year) : undefined,
      });
      for (const m of expNewMedia) await candidateApi.uploadExperienceMedia(id, m.file).catch(() => {});
      await refresh(); setEditingExpId(null); setExpNewMedia([]); flash('Expérience mise à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // Delete exp
  const deleteExp = async (id: string) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    try { await candidateApi.deleteExperience(id); await refresh(); } catch {}
  };

  // Add new exp
  const addNewExp = async () => {
    if (!newExpForm.title || !newExpForm.company || !newExpForm.start_year) return;
    setSaving(true); setError('');
    try {
      const res = await candidateApi.createExperience({
        ...newExpForm, start_month: Number(newExpForm.start_month), start_year: Number(newExpForm.start_year),
        end_month: newExpForm.end_month ? Number(newExpForm.end_month) : undefined, end_year: newExpForm.end_year ? Number(newExpForm.end_year) : undefined,
        skill_ids: newExpForm.skill_ids || [],
      });
      if (res?.experience?.id) {
        for (const m of newExpMedia) await candidateApi.uploadExperienceMedia(res.experience.id, m.file).catch(() => {});
      }
      await refresh(); setAddingExp(false); setNewExpForm({}); setNewExpMedia([]); flash('Expérience ajoutée !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // Start edit edu
  const startEditEdu = (edu: any) => {
    setEditingEduId(edu.id); setEduNewMedia([]);
    
    let formLevel = edu.level;
    let customLevel = '';
    if (edu.level && edu.level !== 'bac' && edu.level !== 'bac_plus_2' && edu.level !== 'bac_plus_3' && edu.level !== 'bac_plus_5' && edu.level !== 'bac_plus_8') {
      if (!LEVELS.find(l => l.value === edu.level)) {
        formLevel = 'autre';
        customLevel = edu.level;
      }
    }
    
    if (edu.level === 'autre' && edu.custom_level) {
      customLevel = edu.custom_level;
    }

    setEduForm({
      school: edu.school, degree: edu.degree, field: edu.field || '', level: formLevel || 'bac_plus_3',
      custom_level: customLevel,
      description: edu.description || '', start_month: String(edu.start_month || ''), start_year: String(edu.start_year || ''),
      end_month: edu.end_month ? String(edu.end_month) : '', end_year: edu.end_year ? String(edu.end_year) : '',
      is_current: edu.is_current || false, skill_ids: edu.education_skills?.map((es: any) => es.skill.id) || [],
      is_self_taught: edu.degree === 'Autodidacte' // Simple heuristique si le backend n'a pas de bool is_self_taught
    });
  };

  // Save edu
  const saveEdu = async (id: string) => {
    setSaving(true); setError('');
    try {
      await candidateApi.updateEducation(id, {
        ...eduForm, 
        start_month: Number(eduForm.start_month), start_year: Number(eduForm.start_year),
        end_month: eduForm.end_month ? Number(eduForm.end_month) : undefined, end_year: eduForm.end_year ? Number(eduForm.end_year) : undefined,
      });
      for (const m of eduNewMedia) await candidateApi.uploadEducationMedia(id, m.file).catch(() => {});
      await refresh(); setEditingEduId(null); setEduNewMedia([]); flash('Formation mise à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // Delete edu
  const deleteEdu = async (id: string) => {
    if (!confirm('Supprimer cette formation ?')) return;
    try { await candidateApi.deleteEducation(id); await refresh(); } catch {}
  };

  // Add new edu
  const addNewEdu = async () => {
    if (!newEduForm.school || !newEduForm.degree || !newEduForm.start_year) return;
    setSaving(true); setError('');
    try {
      const res = await candidateApi.createEducation({
        ...newEduForm, 
        start_month: Number(newEduForm.start_month), start_year: Number(newEduForm.start_year),
        end_month: newEduForm.end_month ? Number(newEduForm.end_month) : undefined, end_year: newEduForm.end_year ? Number(newEduForm.end_year) : undefined,
        skill_ids: newEduForm.skill_ids || [],
      });
      if (res?.education?.id) {
        for (const m of newEduMedia) await candidateApi.uploadEducationMedia(res.education.id, m.file).catch(() => {});
      }
      await refresh(); setAddingEdu(false); setNewEduForm({}); setNewEduMedia([]); flash('Formation ajoutée !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  const profileSkills = profile?.candidate_skills?.map((cs: any) => cs.skill) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left relative">
      
      {/* Lightbox Gallery */}
      {gallery && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setGallery(null)}>
          <button onClick={() => setGallery(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[110]">
            <X className="w-6 h-6" />
          </button>
          {gallery.items.length > 1 && (
            <>
              <button className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[110]" onClick={(e) => { e.stopPropagation(); setGallery(prev => prev ? { ...prev, index: (prev.index - 1 + prev.items.length) % prev.items.length } : null); }}>
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[110]" onClick={(e) => { e.stopPropagation(); setGallery(prev => prev ? { ...prev, index: (prev.index + 1) % prev.items.length } : null); }}>
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          <div className="w-full h-full flex items-center justify-center p-4 sm:p-12" onClick={e => e.stopPropagation()}>
            {gallery.items[gallery.index].type === 'image' || gallery.items[gallery.index].type === 'photo' ? (
              <img src={gallery.items[gallery.index].url} alt="" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
            ) : (
              <video src={gallery.items[gallery.index].url} controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl" />
            )}
          </div>
          {gallery.items.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md">
              {gallery.index + 1} / {gallery.items.length}
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {success && <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 shadow-lg"><Check className="w-4 h-4 shrink-0" />{success}</div>}
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm shadow-lg">{error}</div>}
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        
        {/* Header Card (Simplifié : Photo, Nom, Titre) */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-visible group">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-accent/5 rounded-full -mr-16 -mt-16 md:-mr-20 md:-mt-20 blur-3xl pointer-events-none" />
          
          {!editHero && (
            <button onClick={startEditHero} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {editHero ? (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Éditer le profil</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" value={heroForm.first_name} onChange={e => setHeroForm(f => ({ ...f, first_name: e.target.value }))} />
                <Input label="Nom" value={heroForm.last_name} onChange={e => setHeroForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <Input label="Titre professionnel" placeholder="ex: Développeur React.js | Next.js | Vue.js..." value={heroForm.title} onChange={e => setHeroForm(f => ({ ...f, title: e.target.value }))} />

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditHero(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveHero} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10">
              <div className="relative shrink-0">
                <div 
                  onClick={() => photoUrl && setGallery({ items: [{ url: photoUrl, type: 'photo' }], index: 0 })}
                  className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-accent text-white flex items-center justify-center text-4xl md:text-5xl font-black overflow-hidden shadow-2xl shadow-accent/20 ${photoUrl ? 'cursor-pointer' : ''}`}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.first_name?.[0] || 'U'
                  )}
                </div>
                
                {/* Camera button */}
                <div className="absolute -bottom-2 -left-2 z-30">
                  <button onClick={(e) => { e.stopPropagation(); setPhotoDropdown(d => !d); }} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  {photoDropdown && (
                    <div className="absolute top-10 left-0 bg-white rounded-xl border border-border shadow-xl overflow-hidden w-44">
                      <button onClick={() => { photoInputRef.current?.click(); setPhotoDropdown(false); }} className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Camera className="w-4 h-4 text-black" /> Modifier
                      </button>
                      {photoUrl && (
                        <button onClick={handleDeletePhoto} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-border">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              
              <div className="text-center sm:text-left flex-1 min-w-0 w-full">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 md:mb-2 truncate">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-accent font-bold text-sm md:text-lg truncate uppercase tracking-wide">
                  {profile?.title || profile?.speciality || 'Développeur Tech'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          {!editBio && (
            <button onClick={() => { setEditBio(true); setBioForm(profile?.bio || ''); }} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2">À propos</h2>
          
          {editBio ? (
            <div className="space-y-4">
              <AutoTextarea value={bioForm} onChange={setBioForm} placeholder="Décrivez votre parcours..." className="border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] focus:border-accent bg-slate-50" />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditBio(false)}>Annuler</Button>
                <Button size="sm" onClick={saveBio} loading={saving}><Save className="w-3.5 h-3.5 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 leading-relaxed text-sm md:text-base italic whitespace-pre-wrap">
              {profile?.bio || `Passionné par le développement tech, je mets mes ${profile?.experience_years || 0} ans d'expérience au service de projets innovants et scalables.`}
            </p>
          )}
        </div>

        {/* Informations Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          {!editInfo && (
            <button onClick={startEditInfo} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           Informations
          </h2>

          {editInfo ? (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <CountrySelect label="Pays" options={COUNTRIES} value={infoForm.country} onChange={v => setInfoForm((p: any) => ({ ...p, country: v }))} />
                <Input label="Ville" value={infoForm.city} onChange={e => setInfoForm((p: any) => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Spécialité" options={SPECIALITIES} value={infoForm.speciality} onChange={e => setInfoForm((p: any) => ({ ...p, speciality: e.target.value }))} />
                <Input label="Années d'expérience" type="number" value={infoForm.experience_years} onChange={e => setInfoForm((p: any) => ({ ...p, experience_years: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Disponibilité" options={AVAILABILITY} value={infoForm.availability} onChange={e => setInfoForm((p: any) => ({ ...p, availability: e.target.value }))} />
                <Input label="Taux journalier" type="number" value={infoForm.daily_rate} onChange={e => setInfoForm((p: any) => ({ ...p, daily_rate: e.target.value }))} suffix={infoForm.country ? COUNTRY_TO_CURRENCY[infoForm.country] : undefined} />
              </div>
              <Input label="Téléphone" value={infoForm.phone} onChange={e => setInfoForm((p: any) => ({ ...p, phone: e.target.value }))} />
              
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditInfo(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveInfo} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Téléphone</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    {profile?.country && COUNTRY_LABELS[profile.country] ? (
                      <img src={`https://flagcdn.com/w40/${COUNTRY_LABELS[profile.country].flag}.png`} alt="" className="w-5 object-cover rounded-sm" />
                    ) : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Localisation</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.city ? `${profile.city}, ` : ''}{profile?.country ? COUNTRY_LABELS[profile.country]?.label || profile.country : 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Expérience</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.experience_years || 0} ans</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><DollarSign className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Taux Journalier</p>
                    <p className="text-sm font-bold text-slate-900">
                      {profile?.daily_rate ? `${profile.daily_rate} ${profile.currency || '€'}` : 'Non défini'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Disponibilité</p>
                    <p className="text-sm font-bold text-green-600">
                      {AVAIL_LABEL[profile?.availability] || profile?.availability || 'Immédiate'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compétences Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          {!editSkills && (
            <button onClick={() => { setEditSkills(true); setSkillIds(profile?.candidate_skills?.map((cs:any)=>cs.skill.id)||[]); }} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Compétences</h2>

          {editSkills ? (
            <div className="space-y-4">
              <SkillSelector selectedIds={skillIds} onChange={setSkillIds} />
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditSkills(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveSkills} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
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
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: any) => (
                      <span key={s.id} className="px-3 py-1.5 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold border border-slate-200">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">Aucune compétence renseignée.</p>
          )}
        </div>

        {/* Experiences Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          <button onClick={() => { setAddingExp(true); setNewExpForm({}); setNewExpMedia([]); }} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-accent transition-all hover:bg-accent hover:text-white shadow-sm flex items-center gap-2 pr-4 font-bold text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-8 md:mb-10 flex items-center gap-2 md:gap-3">
            Expériences
          </h2>
          
          <div className="space-y-8 md:space-y-10 relative before:absolute before:left-[15px] md:before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {addingExp && (
              <div className="relative pl-10 md:pl-12">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Nouvelle expérience</h3>
                  <Input label="Intitulé *" placeholder="Ex: Développeur Backend" value={newExpForm.title || ''} onChange={e => setNewExpForm((f: any) => ({ ...f, title: e.target.value }))} />
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
                    <input type="checkbox" checked={newExpForm.is_current || false} onChange={e => setNewExpForm((f: any) => ({ ...f, is_current: e.target.checked }))} className="rounded text-accent focus:ring-accent" />
                    <span className="text-sm font-medium">Poste actuel</span>
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
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 cursor-pointer hover:border-accent hover:text-accent transition-colors shadow-sm">
                      <ImagePlus className="w-4 h-4" /> Ajouter
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files||[]); setNewExpMedia(p => [...p, ...f.map(x => ({file:x, previewUrl:URL.createObjectURL(x)}))]); e.target.value=''; }} />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => { setAddingExp(false); setNewExpForm({}); setNewExpMedia([]); }}>Annuler</Button>
                    <Button size="sm" onClick={addNewExp} loading={saving}><Plus className="w-3.5 h-3.5 mr-2" /> Ajouter</Button>
                  </div>
                </div>
              </div>
            )}

            {profile?.experiences?.length > 0 ? (
              profile.experiences.map((exp: any, i: number) => (
                <div key={exp.id} className="relative pl-10 md:pl-12 flex flex-col md:flex-row gap-3 md:gap-8 group/item">
                  <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center z-10 group-hover/item:border-accent transition-colors">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200 group-hover/item:bg-accent transition-colors" />
                  </div>
                  
                  <div className="flex-1">
                    {editingExpId === exp.id ? (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
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
                          <input type="checkbox" checked={expForm.is_current || false} onChange={e => setExpForm((f: any) => ({ ...f, is_current: e.target.checked }))} className="rounded text-accent focus:ring-accent" />
                          <span className="text-sm font-medium">Poste actuel</span>
                        </label>
                        {!expForm.is_current && (
                          <div className="grid grid-cols-2 gap-4">
                            <Select label="Mois fin" options={MONTHS} placeholder="Mois" value={expForm.end_month || ''} onChange={e => setExpForm((f: any) => ({ ...f, end_month: e.target.value }))} />
                            <Select label="Année fin" options={years()} placeholder="Année" value={expForm.end_year || ''} onChange={e => setExpForm((f: any) => ({ ...f, end_year: e.target.value }))} />
                          </div>
                        )}
                        <Textarea label="Description" value={expForm.description || ''} onChange={e => setExpForm((f: any) => ({ ...f, description: e.target.value }))} />
                        <SkillSelector label="Compétences" selectedIds={expForm.skill_ids || []} onChange={ids => setExpForm((f: any) => ({ ...f, skill_ids: ids }))} />
                        
                        {exp.experience_medias?.filter((m: any) => m.media_type === 'image' || m.media_type === 'video').length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Médias actuels</p>
                            <MediaGallery medias={exp.experience_medias} onDelete={(mid) => candidateApi.deleteExperienceMedia(exp.id, mid).then(()=>refresh())} editMode onOpen={(idx) => setGallery({ items: exp.experience_medias.filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video').map((mx: any) => ({ url: mx.url, type: mx.media_type })), index: idx })} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Ajouter des médias</p>
                          <MediaPreviewRow previews={expNewMedia} onRemove={idx => setExpNewMedia(prev => prev.filter((_, idx2) => idx2 !== idx))} />
                          <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 cursor-pointer hover:border-accent hover:text-accent transition-colors shadow-sm">
                            <ImagePlus className="w-4 h-4" /> Ajouter
                            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files||[]); setExpNewMedia(p => [...p, ...f.map(x => ({file:x, previewUrl:URL.createObjectURL(x)}))]); e.target.value=''; }} />
                          </label>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button variant="secondary" size="sm" onClick={() => setEditingExpId(null)}>Annuler</Button>
                          <Button size="sm" onClick={() => saveExp(exp.id)} loading={saving}><Save className="w-3.5 h-3.5 mr-2" /> Sauvegarder</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              {exp.title}
                              <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                                {EMP_TYPES.find(t => t.value === exp.employment_type)?.label || exp.employment_type}
                              </span>
                              <div className="flex gap-1 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button onClick={() => startEditExp(exp)} className="p-1 text-slate-400 hover:text-accent bg-slate-50 rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteExp(exp.id)} className="p-1 text-slate-400 hover:text-red-500 bg-slate-50 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </h3>
                            <p className="text-accent font-semibold flex items-center gap-2">
                              {exp.company}
                              {exp.location && (
                                <span className="text-slate-400 font-normal text-sm flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {exp.location}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                            {formatDate(exp.start_month, exp.start_year)} — {exp.is_current ? 'Aujourd\'hui' : formatDate(exp.end_month, exp.end_year)}
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{exp.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exp.experience_skills?.map((es: any, si: number) => (
                            <span key={si} className="px-2 py-1 bg-slate-100 text-slate-900 rounded-md text-[10px] font-bold border border-slate-200">
                              {es.skill.name}
                            </span>
                          ))}
                        </div>
                        <MediaGallery medias={exp.experience_medias || []} onOpen={(idx) => setGallery({ items: exp.experience_medias.filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video').map((mx: any) => ({ url: mx.url, type: mx.media_type })), index: idx })} />
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : !addingExp && (
              <p className="text-slate-400 text-sm italic pl-12">Aucune expérience renseignée.</p>
            )}
          </div>
        </div>

        {/* Educations Section */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">  
          <button onClick={() => { setAddingEdu(true); setNewEduForm({}); setNewEduMedia([]); }} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-accent transition-all hover:bg-accent hover:text-white shadow-sm flex items-center gap-2 pr-4 font-bold text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
            Formations
          </h2>
          
          <div className="space-y-8 md:space-y-10 relative before:absolute before:left-[15px] md:before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {addingEdu && (
              <div className="relative pl-10 md:pl-12">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Nouvelle formation</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="École *" placeholder="Ex: EMIT" value={newEduForm.school || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, school: e.target.value }))} />
                    <Input label="Diplôme *" value={newEduForm.degree || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, degree: e.target.value }))} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Niveau" options={LEVELS} value={newEduForm.level || 'bac_plus_3'} onChange={e => setNewEduForm((f: any) => ({ ...f, level: e.target.value }))} />
                    {newEduForm.level === 'autre' && (
                      <Input label="Précisez le niveau" value={newEduForm.custom_level || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, custom_level: e.target.value }))} />
                    )}
                  </div>

                  <Input label="Domaine" value={newEduForm.field || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, field: e.target.value }))} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Mois début *" options={MONTHS} placeholder="Mois" value={newEduForm.start_month || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                    <Select label="Année début *" options={years()} placeholder="Année" value={newEduForm.start_year || ''} onChange={e => setNewEduForm((f: any) => ({ ...f, start_year: e.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newEduForm.is_current || false} onChange={e => setNewEduForm((f: any) => ({ ...f, is_current: e.target.checked }))} className="rounded text-accent focus:ring-accent" />
                    <span className="text-sm font-medium">En cours</span>
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
                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 cursor-pointer hover:border-accent hover:text-accent transition-colors shadow-sm">
                      <ImagePlus className="w-4 h-4" /> Ajouter des médias
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files||[]); setNewEduMedia(p => [...p, ...f.map(x => ({file:x, previewUrl:URL.createObjectURL(x)}))]); e.target.value=''; }} />
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => { setAddingEdu(false); setNewEduForm({}); setNewEduMedia([]); }}>Annuler</Button>
                    <Button size="sm" onClick={addNewEdu} loading={saving}><Plus className="w-3.5 h-3.5 mr-2" /> Ajouter</Button>
                  </div>
                </div>
              </div>
            )}

            {profile?.educations?.length > 0 ? (
              profile.educations.map((edu: any, i: number) => (
                <div key={edu.id} className="relative pl-10 md:pl-12 flex flex-col md:flex-row gap-3 md:gap-8 group/item">
                  <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center z-10 group-hover/item:border-accent transition-colors">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200 group-hover/item:bg-accent transition-colors" />
                  </div>
                  
                  <div className="flex-1">
                    {editingEduId === edu.id ? (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="École *" value={eduForm.school || ''} onChange={e => setEduForm((f: any) => ({ ...f, school: e.target.value }))} />
                          <Input label="Diplôme *" value={eduForm.degree || ''} onChange={e => setEduForm((f: any) => ({ ...f, degree: e.target.value }))} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Select label="Niveau" options={LEVELS} value={eduForm.level || 'bac_plus_3'} onChange={e => setEduForm((f: any) => ({ ...f, level: e.target.value }))} />
                          {eduForm.level === 'autre' && (
                            <Input label="Précisez le niveau" value={eduForm.custom_level || ''} onChange={e => setEduForm((f: any) => ({ ...f, custom_level: e.target.value }))} />
                          )}
                        </div>

                        <Input label="Domaine" value={eduForm.field || ''} onChange={e => setEduForm((f: any) => ({ ...f, field: e.target.value }))} />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Select label="Mois début" options={MONTHS} placeholder="Mois" value={eduForm.start_month || ''} onChange={e => setEduForm((f: any) => ({ ...f, start_month: e.target.value }))} />
                          <Select label="Année début" options={years()} placeholder="Année" value={eduForm.start_year || ''} onChange={e => setEduForm((f: any) => ({ ...f, start_year: e.target.value }))} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={eduForm.is_current || false} onChange={e => setEduForm((f: any) => ({ ...f, is_current: e.target.checked }))} className="rounded text-accent focus:ring-accent" />
                          <span className="text-sm font-medium">En cours</span>
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
                            <MediaGallery medias={edu.education_medias} onDelete={(mid) => candidateApi.deleteEducationMedia(edu.id, mid).then(()=>refresh())} editMode onOpen={(idx) => setGallery({ items: edu.education_medias.filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video').map((mx: any) => ({ url: mx.url, type: mx.media_type })), index: idx })} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Ajouter des médias</p>
                          <MediaPreviewRow previews={eduNewMedia} onRemove={idx => setEduNewMedia(prev => prev.filter((_, idx2) => idx2 !== idx))} />
                          <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 cursor-pointer hover:border-accent hover:text-accent transition-colors shadow-sm">
                            <ImagePlus className="w-4 h-4" /> Ajouter
                            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => { const f = Array.from(e.target.files||[]); setEduNewMedia(p => [...p, ...f.map(x => ({file:x, previewUrl:URL.createObjectURL(x)}))]); e.target.value=''; }} />
                          </label>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button variant="secondary" size="sm" onClick={() => setEditingEduId(null)}>Annuler</Button>
                          <Button size="sm" onClick={() => saveEdu(edu.id)} loading={saving}><Save className="w-3.5 h-3.5 mr-2" /> Sauvegarder</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              {edu.degree}
                              <div className="flex gap-1 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button onClick={() => startEditEdu(edu)} className="p-1 text-slate-400 hover:text-accent bg-slate-50 rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteEdu(edu.id)} className="p-1 text-slate-400 hover:text-red-500 bg-slate-50 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </h3>
                            <p className="text-accent font-semibold">{edu.school}</p>
                          </div>
                          <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {formatDate(edu.start_month, edu.start_year)} — {edu.is_current ? 'En cours' : formatDate(edu.end_month, edu.end_year)}
                          </div>
                        </div>
                        {edu.field && <p className="text-sm font-bold text-slate-600 mb-2">{edu.field}</p>}
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">{edu.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {edu.education_skills?.map((es: any, si: number) => (
                            <span key={si} className="px-2 py-1 bg-slate-100 text-slate-900 rounded-md text-[10px] font-bold border border-slate-200">
                              {es.skill.name}
                            </span>
                          ))}
                        </div>
                        <MediaGallery medias={edu.education_medias || []} onOpen={(idx) => setGallery({ items: edu.education_medias.filter((mx: any) => mx.media_type === 'image' || mx.media_type === 'video').map((mx: any) => ({ url: mx.url, type: mx.media_type })), index: idx })} />
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : !addingEdu && (
              <p className="text-slate-400 text-sm italic pl-12">Aucune formation renseignée.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Social Links */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          {!editSocial && (
            <button onClick={() => { setEditSocial(true); setSocialForm({ linkedin_url: profile?.linkedin_url || '', portfolio_url: profile?.portfolio_url || '', github_url: profile?.github_url || '' }); }} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Liens Professionnels</h3>
          
          {editSocial ? (
            <div className="space-y-4">
              <Input label="LinkedIn" type="url" value={socialForm.linkedin_url} onChange={e => setSocialForm(f => ({ ...f, linkedin_url: e.target.value }))} />
              <Input label="Portfolio" type="url" value={socialForm.portfolio_url} onChange={e => setSocialForm(f => ({ ...f, portfolio_url: e.target.value }))} />
              <Input label="GitHub" type="url" value={socialForm.github_url} onChange={e => setSocialForm(f => ({ ...f, github_url: e.target.value }))} />
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditSocial(false)}>Annuler</Button>
                <Button size="sm" className="flex-1" onClick={saveSocial} loading={saving}><Save className="w-3.5 h-3.5 mr-2" /> Valider</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/link hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">LinkedIn</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-accent" />
                </a>
              )}
              {profile?.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/link hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">Portfolio</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-accent" />
                </a>
              )}
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/link hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    {/* <Github className="w-4 h-4 text-slate-600" /> */}
                    <span className="text-sm font-bold text-slate-700">GitHub</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-accent" />
                </a>
              )}
              {!profile?.linkedin_url && !profile?.portfolio_url && !profile?.github_url && (
                <p className="text-xs text-slate-400 text-center italic">Aucun lien ajouté</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
