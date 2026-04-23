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
                Voir les détails du test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
