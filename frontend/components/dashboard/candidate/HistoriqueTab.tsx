'use client';

import { useEffect, useState } from 'react';
import { Code2, Briefcase, ChevronRight, Trash2 } from 'lucide-react';
import { candidateApi } from '@/lib/candidate-service';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: string;
  title: string;
  date: string;
  result: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, any> = {
  Briefcase: Briefcase,
  Code2: Code2,
};

const colorMap: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500',
  'bg-emerald-500': 'bg-emerald-500',
  'bg-red-500': 'bg-red-500',
  'bg-slate-500': 'bg-slate-500',
  'bg-amber-500': 'bg-amber-500',
};

export default function HistoriqueTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await candidateApi.getHistory();
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error("Impossible de charger l'historique d'activités");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await candidateApi.deleteHistoryItem(id);
      setActivities((prev) => prev.filter((item) => item.id !== id));
      toast.success("Activité supprimée de l'historique");
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error("Impossible de supprimer l'activité");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (isNaN(date.getTime())) return '';

    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Chargement de votre historique d'activités...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <Briefcase className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune activité récente</h3>
        <p className="text-slate-500 max-w-sm text-sm">
          Vous n'avez pas encore postulé à des offres ou reçu de tests techniques. Vos futures activités s'afficheront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/50">
        <h2 className="font-bold text-slate-900 text-lg md:text-base">Activités récentes</h2>
      </div>
        <div className="divide-y divide-slate-50">
        {activities.map((item) => {
          const IconComponent = iconMap[item.icon] || Briefcase;
          const bgClass = colorMap[item.color] || 'bg-slate-500';
          return (
            <div key={item.id} className="p-4 md:p-6 flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl ${bgClass} text-white flex items-center justify-center shrink-0`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4 sm:pr-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{item.title}</h3>
                <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
              </div>
              <div className="flex items-center gap-4 ml-auto sm:ml-0 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end pl-14 sm:pl-0">
                <div className="text-left sm:text-right whitespace-nowrap">
                  <p className="font-black text-slate-900 text-sm">{item.result}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Statut</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                  title="Supprimer de l'historique"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ChevronRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
