'use client';

import clsx from 'clsx';
import { Bell } from 'lucide-react';

export default function NotificationsTab() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[
        { title: 'Nouvelle Offre Matchée', desc: 'Google a posté une offre qui correspond à 95% à votre profil.', time: 'Il y a 2h', isNew: true },
        { title: 'Test technique réussi', desc: 'Félicitations ! Votre score de Validé vous place dans le top 5% des candidats.', time: 'Hier', isNew: true },
        { title: 'Nouvelle vue de profil', desc: 'L\'entreprise Vercel a consulté votre profil technique.', time: 'Il y a 2 jours', isNew: false },
        { title: 'Mise à jour plateforme', desc: 'Découvrez les nouvelles fonctionnalités de votre workspace OPSIDE.', time: 'Il y a 1 semaine', isNew: false },
      ].map((n, i) => (
        <div key={i} className={clsx(
          "p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all cursor-pointer relative text-left",
          n.isNew ? "bg-white border-accent shadow-lg shadow-accent/5" : "bg-white border-slate-100 opacity-70"
        )}>
          {n.isNew && <div className="absolute top-4 right-4 md:top-6 md:right-6 w-2 h-2 bg-accent rounded-full" />}
          <div className="flex items-start gap-3 md:gap-4">
            <div className={clsx(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0",
              n.isNew ? "bg-accent/10 text-accent" : "bg-slate-100 text-slate-400"
            )}>
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{n.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{n.desc}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
