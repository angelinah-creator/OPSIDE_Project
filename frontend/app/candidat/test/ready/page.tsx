'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getUser } from '@/lib/auth-service';
import { candidateApi } from '@/lib/candidate-service';
import { Code2, ArrowRight, CheckCircle2, ShieldCheck, Zap, Laptop } from 'lucide-react';

export default function TestReadyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUser(u);
      setLoading(false);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header / Logo */}
        <div className="flex justify-center mb-12">
          <img src="/logo.webp" alt="OPSIDE" className="w-40" />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 md:p-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                Bonjour {user?.first_name}, <br />
                prêt pour le <span className="text-accent italic">challenge ?</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Votre profil est complet. Maintenant, prouvez vos compétences techniques en passant un test technique
              </p>

              <Link href="/candidat/test/start">
              {/* <Link href="#"> */}
                <Button size="lg" className="w-full md:w-auto rounded-2xl text-lg font-bold shadow-xl shadow-accent/20 group">
                  Commencer le test technique
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                {/* Code UI Mockup */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex gap-4">
                    <span className="text-slate-600">01</span>
                    <span className="text-blue-400">function</span>
                    <span className="text-emerald-400">testYourSkills</span>
                    <span className="text-slate-300">() {"{"}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">02</span>
                    <span className="text-slate-500 ml-4">// Analyse de votre profil...</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">03</span>
                    <span className="text-slate-400 ml-4 italic px-2 bg-slate-800 rounded">Génération des questions IA</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">04</span>
                    <span className="text-pink-400 ml-4">const</span>
                    <span className="text-slate-300">duration =</span>
                    <span className="text-amber-400">'45min'</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">05</span>
                    <span className="text-pink-400 ml-4">const</span>
                    <span className="text-slate-300">questions =</span>
                    <span className="text-amber-400">10</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">06</span>
                    <span className="text-blue-400 ml-4">return</span>
                    <span className="text-slate-300 ">ready_for_success;</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-600">07</span>
                    <span className="text-slate-300">{"}"}</span>
                  </div>
                </div>
              </div>

              {/* Float cards */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">92%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Score moyen <br /><span className="text-slate-900">Tech Lead</span></div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Vous n'êtes pas prêt ? <Link href="/candidat/dashboard" className="text-slate-600 hover:text-accent font-semibold underline underline-offset-4">Plus tard</Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
