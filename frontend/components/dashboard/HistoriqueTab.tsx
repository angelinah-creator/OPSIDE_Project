'use client';

import { Code2, Briefcase, User, ChevronRight } from 'lucide-react';

export default function HistoriqueTab() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Activités récentes</h2>
        <button className="text-sm text-accent font-bold">Tout exporter</button>
      </div>
      <div className="divide-y divide-slate-50">
        {[
          { type: 'test', title: 'Candidature envoyée - Microsoft', date: 'Hier, 14:30', result: 'Rejeté', icon: Briefcase, color: 'bg-red-500'},
          { type: 'apply', title: 'Candidature envoyée - Google', date: '20 Avril', result: 'En attente', icon: Briefcase, color: 'bg-blue-500' },
          { type: 'profile', title: 'Mise à jour des compétences', date: '19 Avril', result: 'Complété', icon: User, color: 'bg-emerald-500' },
          { type: 'test', title: 'Candidature envoyée - Meta', date: '15 Mars', result: 'En attente', icon: Briefcase, color: 'bg-blue-500' },
          { type: 'profile', title: 'Mise à jour des compétences', date: '19 Avril', result: 'Complété', icon: User, color: 'bg-emerald-500' },
        ].map((item, i) => (
          <div key={i} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center shrink-0`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.date}</p>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="font-black text-slate-900 text-sm">{item.result}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Statut</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
}
