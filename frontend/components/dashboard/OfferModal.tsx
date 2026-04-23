'use client';

import { 
  X, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Globe, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  ChevronRight 
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
}

interface OfferModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{offer.title}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-bold mt-1">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" /> Publiée {offer.publishedAt}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-8 h-8 text-slate-400" />
          </button>
        </div>

        {/* Modal Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Description (takes more space) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 border-l-8 border-accent pl-5">Description de la mission</h3>
                <div className="text-slate-600 leading-relaxed space-y-5 text-base font-medium">
                  {offer.fullDescription.split('\n').map((line, i) => {
                    if (line.startsWith('###')) {
                      return <h4 key={i} className="text-slate-900 font-black text-lg mt-8 mb-4">{line.replace('###', '').trim()}</h4>;
                    }
                    if (line.startsWith('-')) {
                      return <li key={i} className="ml-6 list-disc text-slate-600 mb-2 pl-2">{line.replace('-', '').trim()}</li>;
                    }
                    return line.trim() ? <p key={i}>{line.trim()}</p> : <br key={i} />;
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Key Info & Skills (Sticky-like) */}
            <div className="lg:col-span-5 space-y-8">
              {/* Info Grid Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">TJM Estimé</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{offer.tjm}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Durée</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{offer.duration}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Type</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{offer.workType}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Expérience</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{offer.minExperience}</p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-lg font-black text-slate-900">Compétences clés</h3>
                <div className="flex flex-wrap gap-2">
                  {offer.skills.map(skill => (
                    <div key={skill} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timezone Highlight */}
              <div className="p-8 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden shadow-xl">
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Localisation</h3>
                    <p className="text-slate-400 text-sm">
                      Fuseau horaire : <span className="text-white font-black">{offer.timezone}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <div className="hidden sm:block">
            <p className="text-base font-black text-slate-900">Mission ouverte aux candidatures</p>
            <p className="text-slate-500 text-sm font-bold">Réponse moyenne en 48 heures.</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto px-10 rounded-2xl h-14 text-base font-bold" onClick={onClose}>
              Retour
            </Button>
            <Button variant="gradient" className="w-full sm:w-auto px-12 rounded-2xl h-14 text-base font-black shadow-xl shadow-accent/20 group">
              Postuler maintenant
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
