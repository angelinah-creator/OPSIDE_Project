import { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Briefcase, Eye, Users, Trash2,
  ChevronRight, AlertCircle, DollarSign, ChevronLeft,
  ChevronRight as ChevronRightIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import Button from '@/components/ui/Button';
import SkillSelector from '@/components/ui/SkillSelector';
import Modal from '@/components/ui/Modal';
import clsx from 'clsx';
import { jobOfferApi } from '@/lib/job-offer-service';
import { skillApi, Skill } from '@/lib/skill-service';

const ITEMS_PER_PAGE = 6;

/**
 * Composant pour gérer l'affichage raccourci ou complet de la description
 */
function ExpandableDescription({ text, limit = 250 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = text.length > limit;
  
  if (!shouldCollapse) return <p className="text-sm text-slate-500 leading-relaxed grow">{text}</p>;

  return (
    <div className="grow">
      <p className={clsx(
        "text-sm text-slate-500 leading-relaxed transition-all",
        !isExpanded && "line-clamp-3"
      )}>
        {text}
      </p>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className="mt-2 text-xs font-bold text-accent hover:underline flex items-center gap-1"
      >
        {isExpanded ? (
          <>Voir moins <ChevronUp className="w-3 h-3" /></>
        ) : (
          <>Voir plus <ChevronDown className="w-3 h-3" /></>
        )}
      </button>
    </div>
  );
}

/**
 * Formate une date de publication de manière relative ou absolue
 */
function formatPublicationDate(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 24) {
    if (diffInHours <= 0) return "publié à l'instant";
    return `publié il y a ${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `publié il y a ${diffInDays}j`;
  } else {
    return `publié le ${date.toLocaleDateString('fr-FR')}`;
  }
}

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

export default function ClientOffresTab() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [offers]);

  const paginatedOffers = useMemo(() => {
    return sortedOffers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [sortedOffers, currentPage]);

  const totalPages = Math.ceil(sortedOffers.length / ITEMS_PER_PAGE);

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
      
      setShowForm(false);
      setEditingOffer(null);
      setForm(EMPTY_FORM);
      fetchOffers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement de l'offre.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer: any) => {
    // Map existing offer to form data
    const offerSkillsIds = allSkills
      .filter(s => offer.skills.includes(s.name))
      .map(s => s.id);

    setForm({
      title: offer.title,
      description: offer.description,
      speciality: offer.speciality,
      custom_speciality: offer.custom_speciality || '',
      selectedSkillIds: offerSkillsIds,
      experience_min: String(offer.experience_min || ''),
      tjm_client: String(offer.tjm_client),
      contract_duration: offer.contract_duration || '',
      work_type: offer.work_type,
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().split('T')[0] : '',
      status: offer.status
    });
    setEditingOffer(offer);
    setShowForm(true);
  };

  const confirmClose = async () => {
    if (!offerToDelete) return;
    try {
      await jobOfferApi.closeJobOffer(offerToDelete);
      setOfferToDelete(null);
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Form View ───
  if (showForm) {
    return (
      <Modal 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); setEditingOffer(null); setForm(EMPTY_FORM); setFormError(''); }}
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
              onClick={() => { setShowForm(false); setEditingOffer(null); setForm(EMPTY_FORM); setFormError(''); }}
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

      {/* Confirmation Modal for Closing */}
      <Modal 
        isOpen={!!offerToDelete} 
        onClose={() => setOfferToDelete(null)}
        title="Clôturer l'offre"
        size="sm"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Voulez-vous vraiment clôturer cette offre ?</h3>
            <p className="text-sm text-slate-500 mt-2">Cette action est irréversible et l'offre ne sera plus visible par les candidats.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setOfferToDelete(null)}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={confirmClose}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
            >
              Clôturer
            </button>
          </div>
        </div>
      </Modal>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
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
        <>
          <div className="space-y-6">
            {paginatedOffers.map(offer => {
              const status = STATUS_LABELS[offer.status] || STATUS_LABELS.draft;
              return (
                <div 
                  key={offer.id} 
                  onClick={() => handleEdit(offer)}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
                >
                  {/* Left Side: Header & Description */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                        {formatPublicationDate(offer.created_at)}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-accent transition-colors">{offer.title}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOfferToDelete(offer.id); }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:hidden"
                        title="Clôturer l'offre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <ExpandableDescription text={offer.description} />

                    {/* Skills Section */}
                    {offer.skills && offer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {offer.skills.map((skill: string) => (
                          <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-tight">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Meta & Actions */}
                  <div className="w-full md:w-80 space-y-6 flex flex-col justify-between pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8">
                    <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400">Type de travail</span>
                        <span className="text-slate-900 font-bold">{WORK_TYPE_LABELS[offer.work_type] || offer.work_type}</span>
                      </div>
                      {offer.contract_duration && (
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-400">Durée de contrat</span>
                          <span className="text-slate-900 font-bold">{offer.contract_duration}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400">TJM</span>
                        <span className="text-slate-900 font-bold text-accent">{offer.tjm_client}€/j</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-tight">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {offer.applications_count} Candidatures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOfferToDelete(offer.id); }}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hidden md:block"
                          title="Clôturer l'offre"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Modifier <ChevronRightIcon className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 pt-8">
              <button 
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={clsx(
                      "w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm border",
                      currentPage === i + 1 
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
