'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Calendar, 
  Globe, 
  Search, 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  TrendingUp,
  MapPin,
  RotateCcw,
  Send
} from 'lucide-react';
import Button from '@/components/ui/Button';

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

const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer (React)',
    description: 'Refonte complète d\'une plateforme SaaS avec React 18 et Next.js. Focus sur la performance et l\'expérience utilisateur.',
    fullDescription: 'En tant que développeur frontend senior, vous serez responsable de l\'architecture et du développement des nouvelles fonctionnalités.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    tjm: '550€ - 700€',
    tjmValue: 550,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT+1 / GMT+3',
    minExperience: '5 ans',
    experienceValue: 5,
    publishedAt: 'Il y a 2h',
    createdAt: Date.now() - 2 * 60 * 60 * 1000
  },
  {
    id: '2',
    title: 'Architecte Cloud & Backend Go',
    description: 'Expertise requise en Go et Kubernetes pour le passage à l\'échelle d\'une infrastructure microservices.',
    fullDescription: 'Mise en place d\'une architecture scalable sur AWS avec Go.',
    skills: ['Go', 'Kubernetes', 'AWS', 'Docker'],
    tjm: '600€ - 850€',
    tjmValue: 600,
    duration: '12 mois',
    durationValue: 12,
    workType: 'Remote',
    timezone: 'Anywhere',
    minExperience: '7 ans',
    experienceValue: 7,
    publishedAt: 'Il y a 5h',
    createdAt: Date.now() - 5 * 60 * 60 * 1000
  },
  {
    id: '3',
    title: 'Lead Fullstack Node/React',
    description: 'Piloter le développement d\'une marketplace internationale. Management d\'une équipe de 4 personnes.',
    fullDescription: 'Développement de nouvelles features et maintenance de l\'existant.',
    skills: ['Node.js', 'React', 'Prisma', 'PostgreSQL'],
    tjm: '500€ - 650€',
    tjmValue: 500,
    duration: '3 mois',
    durationValue: 3,
    workType: 'Hybride',
    timezone: 'GMT+1',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 1j',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: '4',
    title: 'Mobile Engineer (Flutter)',
    description: 'Développement d\'une application de Fintech pour le marché africain. Intégration de services de paiement.',
    fullDescription: 'Conception et développement de l\'application Flutter.',
    skills: ['Flutter', 'Dart', 'Firebase', 'State Management'],
    tjm: '450€ - 600€',
    tjmValue: 450,
    duration: '8 mois',
    durationValue: 8,
    workType: 'Remote',
    timezone: 'GMT+0 / GMT+2',
    minExperience: '3 ans',
    experienceValue: 3,
    publishedAt: 'Il y a 3j',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: '5',
    title: 'DevOps Engineer / SRE',
    description: 'Automatisation de l\'infrastructure et mise en place de pipelines CI/CD robustes.',
    fullDescription: 'Amélioration de la fiabilité des systèmes et automatisation.',
    skills: ['Terraform', 'CI/CD', 'Azure', 'Kubernetes'],
    tjm: '550€ - 750€',
    tjmValue: 550,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT-1 / GMT+3',
    minExperience: '5 ans',
    experienceValue: 5,
    publishedAt: 'Il y a 11h',
    createdAt: Date.now() - 11 * 60 * 60 * 1000
  },
  {
    id: '6',
    title: 'Backend Python Developer (FastAPI)',
    description: 'APIs haute performance pour le traitement de données massives en temps réel.',
    fullDescription: 'Implémentation de logiques métier complexes et optimisation SQL.',
    skills: ['Python', 'FastAPI', 'Redis', 'SQL'],
    tjm: '480€ - 620€',
    tjmValue: 480,
    duration: '4 mois',
    durationValue: 4,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '3 ans',
    experienceValue: 3,
    publishedAt: 'Il y a 2j',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: '7',
    title: 'Data Scientist (Machine Learning)',
    description: 'Mise en place de modèles prédictifs pour l\'analyse comportementale des utilisateurs.',
    fullDescription: 'Analyse de données et déploiement de modèles ML.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL'],
    tjm: '500€ - 700€',
    tjmValue: 500,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 14h',
    createdAt: Date.now() - 14 * 60 * 60 * 1000
  },
  {
    id: '8',
    title: 'Cybersecurity Analyst',
    description: 'Audit de sécurité et monitoring des vulnérabilités sur une plateforme critique.',
    fullDescription: 'Protection des infrastructures et gestion des incidents.',
    skills: ['Pentesting', 'Security', 'SIEM', 'Audit'],
    tjm: '650€ - 900€',
    tjmValue: 650,
    duration: '12 mois',
    durationValue: 12,
    workType: 'On-site',
    timezone: 'GMT+0',
    minExperience: '6 ans',
    experienceValue: 6,
    publishedAt: 'Il y a 6h',
    createdAt: Date.now() - 6 * 60 * 60 * 1000
  },
  {
    id: '9',
    title: 'UI/UX Designer Senior',
    description: 'Conception d\'interfaces complexes pour un outil de gestion interne (B2B).',
    fullDescription: 'Recherche utilisateur, wireframing et design haute fidélité.',
    skills: ['Figma', 'UX Research', 'Design System', 'UI'],
    tjm: '450€ - 550€',
    tjmValue: 450,
    duration: '3 mois',
    durationValue: 3,
    workType: 'Hybride',
    timezone: 'GMT+1',
    minExperience: '5 ans',
    experienceValue: 5,
    publishedAt: 'Il y a 1j',
    createdAt: Date.now() - 25 * 60 * 60 * 1000
  },
  {
    id: '10',
    title: 'Lead QA Engineer',
    description: 'Mise en place d\'une stratégie de tests automatisés (E2E) sur une application web complexe.',
    fullDescription: 'Définition de la stratégie QA et automatisation.',
    skills: ['Playwright', 'Cypress', 'Jest', 'Automation'],
    tjm: '480€ - 600€',
    tjmValue: 480,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 22h',
    createdAt: Date.now() - 22 * 60 * 60 * 1000
  },
  {
    id: '11',
    title: 'Backend Node.js Specialist',
    description: 'Migration d\'un monolithe vers des microservices Node.js.',
    fullDescription: 'Refactorisation et développement de nouveaux services.',
    skills: ['NestJS', 'Node.js', 'RabbitMQ', 'MongoDB'],
    tjm: '520€ - 680€',
    tjmValue: 520,
    duration: '9 mois',
    durationValue: 9,
    workType: 'Remote',
    timezone: 'GMT-1 / GMT+2',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 3h',
    createdAt: Date.now() - 3 * 60 * 60 * 1000
  },
  {
    id: '12',
    title: 'Consultant SAP (S/4HANA)',
    description: 'Accompagnement sur l\'implémentation du module FI/CO pour un grand compte.',
    fullDescription: 'Paramétrage et support utilisateur SAP.',
    skills: ['SAP', 'FI/CO', 'S/4HANA', 'Consulting'],
    tjm: '800€ - 1100€',
    tjmValue: 800,
    duration: '18 mois',
    durationValue: 18,
    workType: 'On-site',
    timezone: 'GMT+1',
    minExperience: '8 ans',
    experienceValue: 8,
    publishedAt: 'Il y a 4j',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000
  },
  {
    id: '13',
    title: 'React Native Developer',
    description: 'Refonte d\'une application E-commerce pour iOS et Android.',
    fullDescription: 'Développement de nouvelles features et optimisation mobile.',
    skills: ['React Native', 'TypeScript', 'GraphQL', 'iOS/Android'],
    tjm: '450€ - 580€',
    tjmValue: 450,
    duration: '5 mois',
    durationValue: 5,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '3 ans',
    experienceValue: 3,
    publishedAt: 'Il y a 10h',
    createdAt: Date.now() - 10 * 60 * 60 * 1000
  },
  {
    id: '14',
    title: 'Solution Architect (Cloud/Java)',
    description: 'Conception de solutions cloud natives pour des applications critiques.',
    fullDescription: 'Architecture et guidance technique.',
    skills: ['Java', 'Spring Boot', 'GCP', 'Kafka'],
    tjm: '700€ - 950€',
    tjmValue: 700,
    duration: '12 mois',
    durationValue: 12,
    workType: 'Hybride',
    timezone: 'GMT+1',
    minExperience: '7 ans',
    experienceValue: 7,
    publishedAt: 'Il y a 1j',
    createdAt: Date.now() - 28 * 60 * 60 * 1000
  },
  {
    id: '15',
    title: 'Blockchain Developer (Solidity)',
    description: 'Développement de smart contracts pour une nouvelle plateforme DeFi.',
    fullDescription: 'Audit et déploiement de contrats intelligents.',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Rust'],
    tjm: '750€ - 1200€',
    tjmValue: 750,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'Anywhere',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 8h',
    createdAt: Date.now() - 8 * 60 * 60 * 1000
  },
  {
    id: '16',
    title: 'Embedded Systems Engineer',
    description: 'Développement de firmware pour des objets connectés (IoT).',
    fullDescription: 'Programmation bas niveau et optimisation ressources.',
    skills: ['C/C++', 'IoT', 'Embedded', 'RTOS'],
    tjm: '500€ - 650€',
    tjmValue: 500,
    duration: '6 mois',
    durationValue: 6,
    workType: 'On-site',
    timezone: 'GMT+1',
    minExperience: '5 ans',
    experienceValue: 5,
    publishedAt: 'Il y a 2j',
    createdAt: Date.now() - 48 * 60 * 60 * 1000
  },
  {
    id: '17',
    title: 'Fullstack Laravel/Vue.js',
    description: 'Maintenance et évolution d\'un outil métier interne.',
    fullDescription: 'Développement agile et déploiement continu.',
    skills: ['Laravel', 'Vue.js', 'PHP', 'MySQL'],
    tjm: '350€ - 480€',
    tjmValue: 350,
    duration: '4 mois',
    durationValue: 4,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '3 ans',
    experienceValue: 3,
    publishedAt: 'Il y a 5j',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: '18',
    title: 'Elasticsearch Specialist',
    description: 'Optimisation de moteurs de recherche et analyse de logs à grande échelle.',
    fullDescription: 'Architecture de cluster et optimisation de requêtes.',
    skills: ['Elasticsearch', 'ELK', 'Big Data', 'Lucene'],
    tjm: '600€ - 800€',
    tjmValue: 600,
    duration: '3 mois',
    durationValue: 3,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '5 ans',
    experienceValue: 5,
    publishedAt: 'Il y a 15h',
    createdAt: Date.now() - 15 * 60 * 60 * 1000
  },
  {
    id: '19',
    title: 'Ruby on Rails Senior Dev',
    description: 'Amélioration de la scalabilité d\'une plateforme Web historique.',
    fullDescription: 'Optimisation performances et développement de nouvelles APIs.',
    skills: ['Ruby', 'Rails', 'PostgreSQL', 'Hotwire'],
    tjm: '550€ - 720€',
    tjmValue: 550,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '6 ans',
    experienceValue: 6,
    publishedAt: 'Il y a 3j',
    createdAt: Date.now() - 72 * 60 * 60 * 1000
  },
  {
    id: '20',
    title: 'Vue.js Specialist (Nuxt 3)',
    description: 'Développement d\'une application E-commerce performante en SSR.',
    fullDescription: 'Intégration de maquettes Figma et gestion d\'état complexe.',
    skills: ['Vue.js', 'Nuxt 3', 'Pinia', 'Tailwind'],
    tjm: '450€ - 580€',
    tjmValue: 450,
    duration: '6 mois',
    durationValue: 6,
    workType: 'Remote',
    timezone: 'GMT+1',
    minExperience: '4 ans',
    experienceValue: 4,
    publishedAt: 'Il y a 7h',
    createdAt: Date.now() - 7 * 60 * 60 * 1000
  }
];

const ITEMS_PER_PAGE = 6;

export default function OffresTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter States
  const [filters, setFilters] = useState({
    minExperience: 'all',
    minTjm: 'all',
    minDuration: 'all',
    workType: 'all'
  });

  const filteredOffers = useMemo(() => {
    return MOCK_OFFERS
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
  }, [searchQuery, filters]);

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
      <div className="flex items-center gap-2 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {filteredOffers.length} missions disponibles
        </p>
      </div>

      {/* Offers Grid */}
      {paginatedOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedOffers.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-white rounded-[2rem] p-5 md:p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {offer.publishedAt}
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-accent transition-colors leading-tight">
                {offer.title}
              </h3>
              
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-grow">
                {offer.description}
              </p>
              
              {/* Detailed Meta Grid */}
              <div className="grid grid-cols-1 gap-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">TJM estimé</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{offer.tjm}</span>
                </div>
                
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">Durée</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{offer.duration}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">Type de travail</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{offer.workType}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">Expérience min.</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{offer.minExperience}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {offer.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{offer.timezone}</span>
                </div>
                <Button 
                  variant="gradient" 
                  className="rounded-xl h-10 px-4 text-xs font-black shadow-lg shadow-accent/20 group/btn"
                >
                  Postuler
                </Button>
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
