'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Pencil, Save, Mail, Phone, MapPin, Globe, Building2,
  Users, Check, X, Camera, ExternalLink, BriefcaseBusiness, Calendar, LogOut
} from 'lucide-react';
import { clientApi, ClientProfile } from '@/lib/client-service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import CountrySelect from '@/components/ui/CountrySelect';

interface ClientProfilTabProps {
  profile: ClientProfile | null;
  user: any;
  onProfileUpdate?: (p: ClientProfile) => void;
}

// ─── Constants ───────────────────────────────────────────────────
const SIZES = [
  { value: 'size_1_10', label: '1–10 employés' },
  { value: 'size_11_50', label: '11–50 employés' },
  { value: 'size_51_200', label: '51–200 employés' },
  { value: 'size_200_plus', label: '200+ employés' },
];

const SIZE_LABELS: Record<string, string> = {
  size_1_10: '1–10 employés',
  size_11_50: '11–50 employés',
  size_51_200: '51–200 employés',
  size_200_plus: '200+ employés',
};

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

export default function ClientProfilTab({ profile: initialProfile, user: initialUser, onProfileUpdate }: ClientProfilTabProps) {
  const [profile, setProfile] = useState<ClientProfile | null>(initialProfile);
  const [user, setUser] = useState<any>(initialUser);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '');

  // ── Edit states ──
  const [editHero, setEditHero] = useState(false);
  const [heroForm, setHeroForm] = useState({
    company_name: '',
    industry: ''
  });

  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    company_size: '', industry: '', country: '', city: '', website: ''
  });

  const [editContact, setEditContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    contact_name: '', contact_email: '', contact_phone: '', interview_availability: ''
  });

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  
  const refresh = async () => {
    try {
      const p = await clientApi.getMyProfile();
      setProfile(p);
      setUser(p.user);
      setLogoUrl(p.logo_url || '');
      onProfileUpdate?.(p);
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  // ── Handlers ──
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      await clientApi.uploadLogo(f);
      flash('Logo mis à jour !');
      refresh();
    } catch { setError('Erreur lors de l\'upload du logo.'); }
    e.target.value = '';
  };

  const startEditHero = () => {
    setHeroForm({
      company_name: profile?.company_name || '',
      industry: profile?.industry || '',
    });
    setEditHero(true);
  };

  const saveHero = async () => {
    setSaving(true); setError('');
    try {
      await clientApi.updateProfile({
        company_name: heroForm.company_name,
        industry: heroForm.industry
      });
      await refresh();
      setEditHero(false);
      flash('Informations mises à jour !');
    } catch { setError('Erreur lors de la mise à jour.'); } finally { setSaving(false); }
  };

  const startEditInfo = () => {
    setInfoForm({
      company_size: profile?.company_size || '',
      industry: profile?.industry || '',
      country: profile?.country || '',
      city: profile?.city || '',
      website: profile?.website || '',
    });
    setEditInfo(true);
  };

  const saveInfo = async () => {
    setSaving(true); setError('');
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(infoForm).filter(([_, v]) => v !== '')
      );
      await clientApi.updateProfile(cleanedData);
      await refresh();
      setEditInfo(false);
      flash('Profil mis à jour !');
    } catch { setError('Erreur lors de la mise à jour.'); } finally { setSaving(false); }
  };

  const startEditContact = () => {
    setContactForm({
      contact_name: profile?.contact_name || '',
      contact_email: profile?.contact_email || '',
      contact_phone: profile?.contact_phone || '',
      interview_availability: profile?.interview_availability || '',
    });
    setEditContact(true);
  };

  const saveContact = async () => {
    setSaving(true); setError('');
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(contactForm).filter(([_, v]) => v !== '')
      );
      await clientApi.updateProfile(cleanedData);
      await refresh();
      setEditContact(false);
      flash('Contact mis à jour !');
    } catch { setError('Erreur lors de la mise à jour.'); } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left relative">

      {/* Notifications */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {success && <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 shadow-lg"><Check className="w-4 h-4 shrink-0" />{success}</div>}
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm shadow-lg">{error}</div>}
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        
        {/* Header Card: Logo + Identité */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
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
              <Input label="Nom de l'entreprise" value={heroForm.company_name} onChange={e => setHeroForm(f => ({ ...f, company_name: e.target.value }))} />
              <Input label="Secteur d'activité" value={heroForm.industry} onChange={e => setHeroForm(f => ({ ...f, industry: e.target.value }))} />

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditHero(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveHero} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10">
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-accent text-white flex items-center justify-center text-4xl md:text-5xl font-black overflow-hidden shadow-2xl shadow-accent/20">
                  {logoUrl ? (
                    <img src={logoUrl} alt={profile?.company_name} className="w-full h-full object-contain p-2 bg-white" />
                  ) : (
                    profile?.company_name?.slice(0, 2).toUpperCase() || user?.first_name?.[0] || 'C'
                  )}
                </div>
                
                {/* Camera button */}
                <div className="absolute -bottom-2 -left-2 z-30">
                  <button onClick={() => logoInputRef.current?.click()} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
              
              <div className="text-center sm:text-left flex-1 min-w-0 w-full">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 md:mb-2 truncate">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-accent font-bold text-sm md:text-lg truncate uppercase tracking-wide">
                  {profile?.company_name || 'Entreprise non renseignée'}
                </p>
                <p className="text-slate-400 font-medium text-xs md:text-sm">{profile?.industry || 'Secteur non défini'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Company Info Section */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          {!editInfo && (
            <button onClick={startEditInfo} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Informations entreprise</h2>

          {editInfo ? (
            <div className="space-y-6 relative z-10">
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
              
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditInfo(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveInfo} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Taille</p>
                    <p className="text-sm font-bold text-slate-900">
                      {profile?.company_size && SIZE_LABELS[profile.company_size as keyof typeof SIZE_LABELS] 
                        ? SIZE_LABELS[profile.company_size as keyof typeof SIZE_LABELS] 
                        : profile?.company_size || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><BriefcaseBusiness className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Secteur</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.industry || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    {profile?.country && COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS] ? (
                      <img src={`https://flagcdn.com/w40/${COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS].flag}.png`} alt="" className="w-5 object-cover rounded-sm" />
                    ) : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Localisation</p>
                    <p className="text-sm font-bold text-slate-900">
                      {profile?.city ? `${profile.city}, ` : ''}
                      {profile?.country && COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS]
                        ? COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS].label
                        : profile?.country || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Globe className="w-5 h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Site web</p>
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent hover:underline flex items-center gap-1 truncate">
                        {profile.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-slate-900">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
          {!editContact && (
            <button onClick={startEditContact} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Contact</h2>

          {editContact ? (
            <div className="space-y-6 relative z-10">
              <Input label="Nom du contact" value={contactForm.contact_name} onChange={e => setContactForm(p => ({ ...p, contact_name: e.target.value }))} />
              <Input label="Email de contact" type="email" value={contactForm.contact_email} onChange={e => setContactForm(p => ({ ...p, contact_email: e.target.value }))} />
              <Input label="Téléphone" value={contactForm.contact_phone} onChange={e => setContactForm(p => ({ ...p, contact_phone: e.target.value }))} />
              <Input label="Disponibilités" placeholder="ex: Lun-Ven, 9h-18h" value={contactForm.interview_availability} onChange={e => setContactForm(p => ({ ...p, interview_availability: e.target.value }))} />
              
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" className="flex-1" onClick={() => setEditContact(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveContact} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Users className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Contact principal</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.contact_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email contact</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{profile?.contact_email || user?.email || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Téléphone</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.contact_phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Disponibilités</p>
                    <p className="text-sm font-bold text-slate-900">{profile?.interview_availability || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right col: summary card */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm sticky top-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Récapitulatif
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <span className="text-sm text-slate-500 font-medium">Statut profil</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${profile ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {profile ? 'Actif' : 'Incomplet'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entreprise</p>
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.company_name || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Localisation</p>
              <p className="text-sm font-bold text-slate-900">
                {profile?.country && COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS]
                  ? COUNTRY_LABELS[profile.country as keyof typeof COUNTRY_LABELS].label
                  : profile?.country || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Taille</p>
              <p className="text-sm font-bold text-slate-900">
                {profile?.company_size && SIZE_LABELS[profile.company_size as keyof typeof SIZE_LABELS]
                  ? SIZE_LABELS[profile.company_size as keyof typeof SIZE_LABELS]
                  : profile?.company_size || '—'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
              Complétez votre profil pour rassurer les candidats et augmenter vos chances de succès.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
