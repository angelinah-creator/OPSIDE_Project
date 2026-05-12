import { useState, useMemo, useEffect } from 'react';
import { jobOfferApi } from '@/lib/job-offer-service';
import { candidateApi } from '@/lib/candidate-service';
import { candidatureService } from '@/lib/candidature-service';
import { toast } from 'sonner';
import clsx from 'clsx';
import { 
  ChevronRight, 
  DollarSign, 
  Search, 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  TrendingUp,
  RotateCcw,
  Send,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';

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

interface Offer {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  skills: string[];
  tjm: string;
  tjmValue: number; 
  duration: string;
  durationValue: number; 
  workType: 'Remote' | 'Hybride' | 'On-site';
  timezone: string;
  minExperience: string;
  experienceValue: number; 
  publishedAt: string;
  createdAt: number; // Timestamp for sorting
}

const ITEMS_PER_PAGE = 6;

export default function OffresTab() {
  const [offersData, setOffersData] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Filter States
  const [filters, setFilters] = useState({
    minExperience: 'all',
    minTjm: 'all',
    minDuration: 'all',
    workType: 'all'
  });

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const res = await jobOfferApi.getJobOffers();
      const mapped = res.data.map((offer: any) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        fullDescription: offer.description,
        skills: offer.skills_required?.map((s: any) => s.skill.name) || [],
        tjm: `${offer.tjm_client}€`,
        tjmValue: Number(offer.tjm_client),
        duration: offer.contract_duration || 'Non précisé',
        durationValue: parseInt(offer.contract_duration) || 0,
        workType: offer.work_type === 'full_remote' ? 'Remote' : (offer.work_type === 'on_site' ? 'On-site' : 'Hybride'),
        timezone: offer.timezone_preference || 'Non précisé',
        minExperience: `${offer.experience_min} ans`,
        experienceValue: offer.experience_min || 0,
        publishedAt: formatPublicationDate(offer.created_at),
        createdAt: new Date(offer.created_at).getTime()
      }));
      setOffersData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const ids = await candidateApi.getAppliedJobs();
      setAppliedJobIds(ids);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchAppliedJobs();
  }, []);

  const filteredOffers = useMemo(() => {
    return offersData
      .filter(offer => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = offer.title.toLowerCase().includes(q) || 
                             offer.skills.some(s => s.toLowerCase().includes(q)) ||
                             offer.description.toLowerCase().includes(q);
        
        const matchesExp = filters.minExperience === 'all' || offer.experienceValue >= parseInt(filters.minExperience);
        const matchesTjm = filters.minTjm === 'all' || offer.tjmValue >= parseInt(filters.minTjm);
        const matchesDuration = filters.minDuration === 'all' || offer.durationValue >= parseInt(filters.minDuration);
        const matchesWorkType = filters.workType === 'all' || offer.workType === filters.workType;

        return matchesSearch && matchesExp && matchesTjm && matchesDuration && matchesWorkType;
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
  }, [searchQuery, filters, offersData]);

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const paginatedOffers = filteredOffers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setFilters({
      minExperience: 'all',
      minTjm: 'all',
      minDuration: 'all',
      workType: 'all'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDirectApply = async (offer: Offer) => {
    try {
      setIsSubmitting(offer.id);
      await candidatureService.apply({
        job_offer_id: offer.id,
        message: `Candidature spontanée pour le poste de ${offer.title}`
      });
      toast.success(`Candidature envoyée pour le poste : ${offer.title}`);
      setAppliedJobIds([...appliedJobIds, offer.id]);
    } catch (error: any) {
      console.error('Error applying:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(null);
    }
  };

  const hasActiveFilters = searchQuery !== '' || Object.values(filters).some(v => v !== 'all');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Permanent Search and Filters Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher une mission (titre, techno...)" 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center border border-slate-200 shadow-sm"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Row - Always Visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl">
          <select 
            value={filters.workType}
            onChange={(e) => { setFilters(f => ({ ...f, workType: e.target.value })); setCurrentPage(1); }}
            className={clsx(
              "border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm appearance-none cursor-pointer transition-all",
              filters.workType !== 'all' ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <option value="all">Type: Tous</option>
            <option value="Remote">Remote</option>
            <option value="Hybride">Hybride</option>
            <option value="On-site">Sur site</option>
          </select>

          <select 
            value={filters.minExperience}
            onChange={(e) => { setFilters(f => ({ ...f, minExperience: e.target.value })); setCurrentPage(1); }}
            className={clsx(
              "border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm appearance-none cursor-pointer transition-all",
              filters.minExperience !== 'all' ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <option value="all">Exp: Tous</option>
            <option value="1">1 an +</option>
            <option value="3">3 ans +</option>
            <option value="5">5 ans +</option>
            <option value="8">8 ans +</option>
          </select>

          <select 
            value={filters.minTjm}
            onChange={(e) => { setFilters(f => ({ ...f, minTjm: e.target.value })); setCurrentPage(1); }}
            className={clsx(
              "border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm appearance-none cursor-pointer transition-all",
              filters.minTjm !== 'all' ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <option value="all">TJM: Tous</option>
            <option value="300">300€ +</option>
            <option value="500">500€ +</option>
            <option value="700">700€ +</option>
            <option value="900">900€ +</option>
          </select>

          <select 
            value={filters.minDuration}
            onChange={(e) => { setFilters(f => ({ ...f, minDuration: e.target.value })); setCurrentPage(1); }}
            className={clsx(
              "border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm appearance-none cursor-pointer transition-all",
              filters.minDuration !== 'all' ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            <option value="all">Durée: Tous</option>
            <option value="3">3 mois +</option>
            <option value="6">6 mois +</option>
            <option value="12">12 mois +</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center gap-2 px-2 mb-4">
        {isLoading ? (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Chargement des missions...
          </p>
        ) : (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredOffers.length} missions disponibles
          </p>
        )}
      </div>

      {/* Offers List */}
      {paginatedOffers.length > 0 ? (
        <div className="space-y-6">
          {paginatedOffers.map(offer => (
            <div 
              key={offer.id} 
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-8"
            >
              {/* Left Side: Header & Description */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    {offer.publishedAt}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-xl transition-colors leading-tight">
                  {offer.title}
                </h3>
                
                <ExpandableDescription text={offer.description} />
                
                {/* Skills Section */}
                {offer.skills && offer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {offer.skills.map(skill => (
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
                    <span className="text-slate-400">TJM estimé</span>
                    <span className="text-slate-900 font-bold">{offer.tjm}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">Durée de contrat</span>
                    <span className="text-slate-900 font-bold">{offer.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">Type de travail</span>
                    <span className="text-slate-900 font-bold">{offer.workType}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">Expérience min.</span>
                    <span className="text-slate-900 font-bold">{offer.minExperience}</span>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  {appliedJobIds.includes(offer.id) ? (
                    <button 
                      disabled
                      className="px-12 rounded-2xl h-12 text-sm font-black bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    >
                      Déjà postulé
                    </button>
                  ) : (
                    <Button 
                      variant="gradient" 
                      className="px-12 rounded-2xl h-12 text-sm font-black shadow-lg shadow-accent/20 group/btn"
                      disabled={isSubmitting === offer.id}
                      onClick={() => handleDirectApply(offer)}
                    >
                      {isSubmitting === offer.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Postuler'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm">
          <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Aucune mission trouvée</h3>
          <p className="text-slate-500 text-sm mt-1">Essayez d'autres filtres ou effacez votre recherche.</p>
          <Button 
            variant="ghost" 
            className="mt-8 px-8 bg-slate-50 rounded-xl"
            onClick={resetFilters}
          >
            Réinitialiser tout
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 pt-6">
          <button 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 md:gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={clsx(
                  "w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm border",
                  currentPage === i + 1 
                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" 
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
    </div>
  );
}
