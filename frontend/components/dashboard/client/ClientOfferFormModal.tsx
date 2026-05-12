import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import SkillSelector from '@/components/ui/SkillSelector';
import Modal from '@/components/ui/Modal';
import { jobOfferApi } from '@/lib/job-offer-service';
import { Skill } from '@/lib/skill-service';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:  { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active',    color: 'bg-green-50 text-green-600' },
  paused: { label: 'En pause',  color: 'bg-amber-50 text-amber-600' },
  closed: { label: 'Fermée',    color: 'bg-red-50 text-red-500' },
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
  status?: string;
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
  status: 'active'
};

interface ClientOfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOffer: any | null;
  allSkills: Skill[];
  onSuccess: () => void;
}

export default function ClientOfferFormModal({ 
  isOpen, 
  onClose, 
  editingOffer, 
  allSkills, 
  onSuccess 
}: ClientOfferFormModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingOffer) {
      const offerSkillsIds = allSkills
        .filter(s => editingOffer.skills.includes(s.name))
        .map(s => s.id);

      setForm({
        title: editingOffer.title,
        description: editingOffer.description,
        speciality: editingOffer.speciality,
        custom_speciality: editingOffer.custom_speciality || '',
        selectedSkillIds: offerSkillsIds,
        experience_min: String(editingOffer.experience_min || ''),
        tjm_client: String(editingOffer.tjm_client),
        contract_duration: editingOffer.contract_duration || '',
        work_type: editingOffer.work_type,
        start_date: editingOffer.start_date ? new Date(editingOffer.start_date).toISOString().split('T')[0] : '',
        status: editingOffer.status
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFormError('');
  }, [editingOffer, isOpen, allSkills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title || !form.description || !form.tjm_client) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

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
        status: form.status || 'active',
      };

      if (editingOffer) {
        await jobOfferApi.updateJobOffer(editingOffer.id, payload);
      } else {
        await jobOfferApi.createJobOffer(payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement de l'offre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingOffer ? "Modifier l'offre" : "Créer une offre d'emploi"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 w-full">

        {formError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {/* Section: Poste */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Poste & Statut</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Titre du poste <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Développeur React Senior"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Statut de l'offre <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
              >
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Type de travail <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none"
                value={form.work_type}
                onChange={e => setForm(f => ({ ...f, work_type: e.target.value }))}
              >
                <option value="full_remote">Full Remote</option>
                <option value="hybrid">Hybride</option>
                <option value="on_site">Sur site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Description de la mission <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Décrivez la mission, le contexte, les attentes..."
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Spécialité <span className="text-red-400">*</span>
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none"
              value={form.speciality}
              onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))}
            >
              {SPECIALITIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
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
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.custom_speciality}
                onChange={e => setForm(f => ({ ...f, custom_speciality: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* Section: Compétences */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Compétences requises</h3>
          <SkillSelector
            label="Sélectionnez les compétences"
            selectedIds={form.selectedSkillIds}
            onChange={ids => setForm(f => ({ ...f, selectedSkillIds: ids }))}
          />
        </div>

        {/* Section: Conditions */}
        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 space-y-5">
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all pr-14"
                  value={form.tjm_client}
                  onChange={e => setForm(f => ({ ...f, tjm_client: e.target.value.replace(/\D/g, '') }))}
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
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.experience_min}
                onChange={e => setForm(f => ({ ...f, experience_min: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Durée du contrat</label>
              <input
                type="text"
                placeholder="Ex: 6 mois, 12 mois, Long terme"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                value={form.contract_duration}
                onChange={e => setForm(f => ({ ...f, contract_duration: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Date de début souhaitée</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Annuler
          </button>
          <Button type="submit" loading={saving} className="flex-1 py-3 rounded-2xl">
            {editingOffer ? "Enregistrer les modifications" : "Publier l'offre"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
