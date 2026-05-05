'use client';

import { useState } from 'react';
import {
  Pencil, Save, Mail, Phone, MapPin, Globe, Building2,
  Users, Check, X, Camera
} from 'lucide-react';
import { clientApi, ClientProfile } from '@/lib/client-service';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ClientProfilTabProps {
  profile: ClientProfile | null;
  user: any;
  onProfileUpdate?: (p: ClientProfile) => void;
}

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

const COMPANY_SIZE_LABELS: Record<string, string> = {
  size_1_10: '1 – 10 employés',
  size_11_50: '11 – 50 employés',
  size_51_200: '51 – 200 employés',
  size_200_plus: '200+ employés',
};

export default function ClientProfilTab({ profile: initialProfile, user, onProfileUpdate }: ClientProfilTabProps) {
  const [profile, setProfile] = useState<ClientProfile | null>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Edit states
  const [editHero, setEditHero] = useState(false);
  const [heroForm, setHeroForm] = useState({ first_name: '', last_name: '' });

  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<any>({});

  const [editCompany, setEditCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState<any>({});

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const refresh = async () => {
    const p = await clientApi.getMyProfile();
    setProfile(p);
    onProfileUpdate?.(p);
  };

  const initials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : (user?.first_name?.[0] || 'C');

  // ── Hero ──
  const startEditHero = () => {
    setEditHero(true);
    setHeroForm({ first_name: user?.first_name || '', last_name: user?.last_name || '' });
  };
  const saveHero = async () => {
    setSaving(true); setError('');
    try {
      await clientApi.updateUserNames(heroForm);
      await refresh();
      setEditHero(false);
      flash('Profil mis à jour !');
    } catch { setError('Erreur mise à jour.'); } finally { setSaving(false); }
  };

  // ── Company info ──
  const startEditCompany = () => {
    setEditCompany(true);
    setCompanyForm({
      company_name: profile?.company_name || '',
      company_size: profile?.company_size || '',
      industry: profile?.industry || '',
      website: profile?.website || '',
      interview_availability: profile?.interview_availability || '',
    });
  };
  const saveCompany = async () => {
    setSaving(true); setError('');
    try {
      await clientApi.updateProfile(companyForm);
      await refresh();
      setEditCompany(false);
      flash('Informations entreprise mises à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  // ── Contact info ──
  const startEditInfo = () => {
    setEditInfo(true);
    setInfoForm({
      contact_name: profile?.contact_name || '',
      contact_email: profile?.contact_email || '',
      contact_phone: profile?.contact_phone || '',
      city: profile?.city || '',
    });
  };
  const saveInfo = async () => {
    setSaving(true); setError('');
    try {
      await clientApi.updateProfile(infoForm);
      await refresh();
      setEditInfo(false);
      flash('Informations de contact mises à jour !');
    } catch { setError('Erreur.'); } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">

      {/* Toast */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {success && <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 shadow-lg"><Check className="w-4 h-4 shrink-0" />{success}</div>}
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm shadow-lg">{error}</div>}
        </div>
      )}

      {/* Left col: company card + contact */}
      <div className="space-y-6 lg:col-span-2">

        {/* Hero / Identité */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          {!editHero && (
            <button onClick={startEditHero} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {editHero ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Modifier les informations</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" value={heroForm.first_name} onChange={e => setHeroForm(f => ({ ...f, first_name: e.target.value }))} />
                <Input label="Nom" value={heroForm.last_name} onChange={e => setHeroForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditHero(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveHero} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-lg shadow-accent/20">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{user?.first_name} {user?.last_name}</h2>
                <p className="text-slate-500 mt-1 font-medium">{profile?.company_name || 'Entreprise non renseignée'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Company details */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          {!editCompany && (
            <button onClick={startEditCompany} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" /> Entreprise
          </h2>

          {editCompany ? (
            <div className="space-y-4">
              <Input label="Nom de l'entreprise" value={companyForm.company_name} onChange={e => setCompanyForm((f: any) => ({ ...f, company_name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Taille</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm" value={companyForm.company_size} onChange={e => setCompanyForm((f: any) => ({ ...f, company_size: e.target.value }))}>
                    <option value="">Non précisé</option>
                    <option value="size_1_10">1 – 10</option>
                    <option value="size_11_50">11 – 50</option>
                    <option value="size_51_200">51 – 200</option>
                    <option value="size_200_plus">200+</option>
                  </select>
                </div>
                <Input label="Secteur d'activité" value={companyForm.industry} onChange={e => setCompanyForm((f: any) => ({ ...f, industry: e.target.value }))} />
              </div>
              <Input label="Site web" placeholder="https://..." value={companyForm.website} onChange={e => setCompanyForm((f: any) => ({ ...f, website: e.target.value }))} />
              <Input label="Disponibilité pour entretiens" placeholder="Ex: lun-ven 9h-18h" value={companyForm.interview_availability} onChange={e => setCompanyForm((f: any) => ({ ...f, interview_availability: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditCompany(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveCompany} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Entreprise</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.company_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Taille</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.company_size ? COMPANY_SIZE_LABELS[profile.company_size] : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Secteur</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.industry || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Globe className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Site web</p>
                  {profile?.website
                    ? <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-accent hover:underline truncate">{profile.website}</a>
                    : <p className="text-sm font-bold text-slate-900">—</p>
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          {!editInfo && (
            <button onClick={startEditInfo} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" /> Contact
          </h2>

          {editInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nom du contact" value={infoForm.contact_name} onChange={e => setInfoForm((f: any) => ({ ...f, contact_name: e.target.value }))} />
                <Input label="Email de contact" value={infoForm.contact_email} onChange={e => setInfoForm((f: any) => ({ ...f, contact_email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Téléphone" value={infoForm.contact_phone} onChange={e => setInfoForm((f: any) => ({ ...f, contact_phone: e.target.value }))} />
                <Input label="Ville" value={infoForm.city} onChange={e => setInfoForm((f: any) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditInfo(false)}>Annuler</Button>
                <Button className="flex-1" onClick={saveInfo} loading={saving}><Save className="w-4 h-4 mr-2" /> Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Mail className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{profile?.contact_email || user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Phone className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Téléphone</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.contact_phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  {profile?.country && COUNTRY_LABELS[profile.country]
                    ? <img src={`https://flagcdn.com/w40/${COUNTRY_LABELS[profile.country].flag}.png`} alt="" className="w-5 rounded-sm" />
                    : <MapPin className="w-5 h-5 text-slate-400" />
                  }
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Localisation</p>
                  <p className="text-sm font-bold text-slate-900">
                    {profile?.city ? `${profile.city}, ` : ''}
                    {profile?.country ? COUNTRY_LABELS[profile.country]?.label || profile.country : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Contact principal</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.contact_name || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right col: summary card */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Récapitulatif</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Profil</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${profile ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {profile ? 'Actif' : 'Incomplet'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Entreprise</span>
              <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{profile?.company_name || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Pays</span>
              <span className="text-sm font-bold text-slate-900">
                {profile?.country ? COUNTRY_LABELS[profile.country]?.label || profile.country : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Taille</span>
              <span className="text-sm font-bold text-slate-900">
                {profile?.company_size ? COMPANY_SIZE_LABELS[profile.company_size] : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-accent/5 rounded-[2rem] p-6 border border-accent/10">
          <h3 className="text-sm font-bold text-accent mb-2">💡 Conseil</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Les offres publiées sont anonymes. Les candidats ne voient pas le nom de votre entreprise tant qu'ils ne sont pas sélectionnés.
          </p>
        </div>
      </div>
    </div>
  );
}
