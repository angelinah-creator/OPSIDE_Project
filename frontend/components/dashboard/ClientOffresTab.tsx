'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle, Briefcase, Eye, Users, Clock, Trash2,
  ChevronRight, Calendar, MapPin, DollarSign, AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import SkillSelector from '@/components/ui/SkillSelector';
import { jobOfferApi } from '@/lib/job-offer-service';
import { skillApi, Skill } from '@/lib/skill-service';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:  { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active',    color: 'bg-green-50 text-green-600' },
  paused: { label: 'En pause',  color: 'bg-amber-50 text-amber-600' },
  closed: { label: 'Fermée',    color: 'bg-red-50 text-red-500' },
};

const WORK_TYPE_LABELS: Record<string, string> = {
  full_remote: 'Full Remote',
  hybrid: 'Hybride',
  on_site: 'Sur site',
};

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend',  label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile',   label: 'Mobile' },
  { value: 'devops',   label: 'DevOps' },
  { value: 'data',     label: 'Data / IA' },
  { value: 'design',   label: 'Design' },
  { value: 'other',    label: 'Autre' },
];

interface FormData {
  title: string;
  description: string;
  speciality: string;
  custom_speciality: string;
  selectedSkillIds: string[];
  experience_min: string;
  tjm_client: string;
  contract_duration: string;
  work_type: string;
  start_date: string;
}

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  speciality: 'frontend',
  custom_speciality: '',
  selectedSkillIds: [],
  experience_min: '',
  tjm_client: '',
  contract_duration: '',
  work_type: 'full_remote',
  start_date: '',
};

export default function ClientOffresTab() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const res = await jobOfferApi.getClientJobOffers();
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    skillApi.getSkills().then(setAllSkills).catch(() => {});
  }, []);

  const handleNumericInput = (val: string) => {
    // Strip leading zeros, allow empty
    const stripped = val.replace(/^0+(\d)/, '$1');
    return stripped;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title || !form.description || !form.tjm_client) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Map selected IDs -> skill names for the backend
    const skillNames = allSkills
      .filter(s => form.selectedSkillIds.includes(s.id))
      .map(s => s.name);

    try {
      setSaving(true);
      const payload: any = {
        title: form.title,
        description: form.description,
        speciality: form.speciality === 'other' ? 'other' : form.speciality,
        skills: skillNames,
        experience_min: form.experience_min ? Number(form.experience_min) : undefined,
        tjm_client: Number(form.tjm_client),
        contract_duration: form.contract_duration || undefined,
        work_type: form.work_type,
        start_date: form.start_date || undefined,
        status: 'active',
      };

      await jobOfferApi.createJobOffer(payload);
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchOffers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Erreur lors de la création de l'offre.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (id: string) => {
    if (confirm('Voulez-vous vraiment clôturer cette offre ?')) {
      try {
        await jobOfferApi.closeJobOffer(id);
        fetchOffers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ─── Form View ───
  if (showForm) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Retour
          </button>
          <h2 className="text-xl font-black text-slate-900">Créer une offre d'emploi</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">

          {formError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Section: Poste */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Poste</h3>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Titre du poste <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Développeur React Senior"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Description de la mission <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Décrivez la mission, le contexte, les attentes..."
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Spécialité <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none"
                  value={form.speciality}
                  onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))}
                >
                  {SPECIALITIES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Type de travail <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none"
                  value={form.work_type}
                  onChange={e => setForm(f => ({ ...f, work_type: e.target.value }))}
                >
                  <option value="full_remote">Full Remote</option>
                  <option value="hybrid">Hybride</option>
                  <option value="on_site">Sur site</option>
                </select>
              </div>
            </div>

            {form.speciality === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Précisez la spécialité <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Blockchain, Cybersécurité, AR/VR..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  value={form.custom_speciality}
                  onChange={e => setForm(f => ({ ...f, custom_speciality: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Section: Compétences */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Compétences requises</h3>
            <SkillSelector
              label="Sélectionnez les compétences"
              selectedIds={form.selectedSkillIds}
              onChange={ids => setForm(f => ({ ...f, selectedSkillIds: ids }))}
            />
          </div>

          {/* Section: Conditions */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Conditions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  TJM proposé (EUR) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ex: 550"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all pr-14"
                    value={form.tjm_client}
                    onChange={e => setForm(f => ({ ...f, tjm_client: handleNumericInput(e.target.value.replace(/\D/g, '')) }))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">€/j</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Expérience minimum (années)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  value={form.experience_min}
                  onChange={e => setForm(f => ({ ...f, experience_min: handleNumericInput(e.target.value.replace(/\D/g, '')) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Durée du contrat</label>
                <input
                  type="text"
                  placeholder="Ex: 6 mois, 12 mois, Long terme"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  value={form.contract_duration}
                  onChange={e => setForm(f => ({ ...f, contract_duration: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Date de début souhaitée</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Annuler
            </button>
            <Button type="submit" loading={saving} className="flex-1 py-3 rounded-2xl">
              Publier l'offre
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {isLoading ? 'Chargement...' : `${offers.filter(o => o.status === 'active').length} offre(s) active(s)`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Nouvelle offre
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Aucune offre publiée</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">Créez votre première offre pour trouver les meilleurs talents.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Créer une offre
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => {
            const status = STATUS_LABELS[offer.status] || STATUS_LABELS.draft;
            return (
              <div key={offer.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">{offer.title}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(offer.created_at).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {WORK_TYPE_LABELS[offer.work_type] || offer.work_type}</span>
                      {offer.contract_duration && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {offer.contract_duration}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleClose(offer.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Clôturer l'offre"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{offer.description}</p>

                {offer.skills && offer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {offer.skills.slice(0, 6).map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">{skill}</span>
                    ))}
                    {offer.skills.length > 6 && (
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold">+{offer.skills.length - 6}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {offer.views_count} vue(s)</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {offer.applications_count} candidature(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    {offer.tjm_client}€ <span className="text-xs text-slate-400 font-normal">/jour</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
