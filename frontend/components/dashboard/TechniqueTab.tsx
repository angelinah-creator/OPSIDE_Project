'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Award, Check, Code2, Star } from 'lucide-react';

interface TechniqueTabProps {
  score: number | null;
  profile: any;
}

export default function TechniqueTab({ score, profile }: TechniqueTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-accent">
            <Award className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Votre dernier résultat</h2>
            <div className="flex items-end gap-6 mb-8">
              <div className="text-6xl font-black text-accent">{score || '--'}<span className="text-2xl text-slate-300 font-bold">/100</span></div>
              <div className="pb-2">
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  Excellent
                </div>
                <p className="text-sm text-slate-500">Test réalisé le 20 Avril 2026</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Précision</p>
                <p className="text-xl font-black text-slate-900">92%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Rapidité</p>
                <p className="text-xl font-black text-slate-900">8.5/10</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Niveau</p>
                <p className="text-xl font-black text-slate-900">Senior</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/candidat/test/start" className="flex-1">
                <Button className="w-full rounded-2xl py-6 text-base font-bold shadow-lg shadow-accent/20">
                  {score ? 'Repasser le test' : 'Passer le test'}
                </Button>
              </Link>
              <Button variant="outline" className="flex-1 rounded-2xl py-6 text-base font-bold text-slate-700">
                Partager le badge
              </Button>
            </div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Détail par compétences</h2>
          <div className="space-y-6">
            {(profile?.candidate_skills || [
              { skill: { name: 'React.js' }, score: 95 },
              { skill: { name: 'TypeScript' }, score: 88 },
              { skill: { name: 'Architecture' }, score: 72 }
            ]).map((cs: any, i: number) => {
              const s = cs.score || Math.floor(Math.random() * 30) + 70;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">{cs.skill.name}</span>
                    <span className="font-black text-slate-900">{s}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-accent rounded-full`} style={{ width: `${s}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-[#1E293B] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-3xl rounded-full" />
          <h3 className="text-lg font-bold mb-4 relative z-10">Prochaine étape</h3>
          <p className="text-slate-400 text-sm mb-6 relative z-10">Optimisez votre profil pour attirer les meilleurs recruteurs en tech.</p>
          <ul className="space-y-4 mb-8 relative z-10">
            <li className="flex items-center gap-3 text-sm text-slate-200">
              <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center border border-green-500/20">
                <Check className="w-3 h-3" />
              </div>
              Test technique validé
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200 opacity-60">
              <div className="w-5 h-5 rounded-full bg-slate-500/20 border border-slate-500 text-slate-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              </div>
              Compléter l'historique pro
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-200 opacity-60">
              <div className="w-5 h-5 rounded-full bg-slate-500/20 border border-slate-500 text-slate-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              </div>
              Ajouter Portfolio
            </li>
          </ul>
          <button className="w-full bg-white text-[#1E293B] py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
            Mettre à jour le profil
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Statistiques vues</h3>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Apparitions</p>
              <p className="text-lg font-black text-slate-900">24 fois</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">Votre profil a été vu par 8 entreprises cette semaine.</p>
        </div>
      </div>
    </div>
  );
}
