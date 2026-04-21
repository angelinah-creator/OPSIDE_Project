'use client';

import { MessageSquare, Search, Code2, ExternalLink, BookOpen, ChevronRight } from 'lucide-react';

export default function AideTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      <div className="space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent" /> Conseils Entretien
          </h2>
          <div className="space-y-6">
            {[
              { q: 'Comment présenter son test ?', d: 'Expliquez vos choix d\'architecture et les compromis faits durant le test technique.' },
              { q: 'Questions soft skills', d: 'Préparez des exemples concrets de collaboration et de résolution de conflits.' },
              { q: 'Négociation salariale', d: 'Connaissez votre valeur marché basée sur vos scores OPSIDE.' }
            ].map((item, i) => (
              <div key={i} className="group">
                <h3 className="font-bold text-slate-800 mb-2 group-hover:text-accent transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" /> {item.q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent rounded-3xl p-8 text-white shadow-xl shadow-accent/20">
          <h3 className="text-lg font-bold mb-4">Besoin d'un coach ?</h3>
          <p className="text-white/80 text-sm mb-6">Prenez rendez-vous avec un expert pour une simulation d'entretien technique.</p>
          <button className="w-full bg-white text-accent py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
            Réserver une séance (Privilège)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-fit">
        <h2 className="text-xl font-bold text-slate-900 mb-6 font-bold">Ressources Utiles</h2>
        <div className="divide-y divide-slate-50">
          {[
            { t: 'Guide React 19 & Next.js', duration: '12 min', icon: Search },
            { t: 'Top 50 Questions Algorithmes', duration: '25 min', icon: Code2 },
            { t: 'Réussir son Live Coding', duration: '15 min', icon: ExternalLink },
            { t: 'Le guide du Clean Code', duration: '10 min', icon: BookOpen },
          ].map((r, i) => (
            <div key={i} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                  <r.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{r.t}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{r.duration} de lecture</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
