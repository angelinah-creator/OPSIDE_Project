'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getUser, clearTokens } from '@/lib/auth-service';
import { authApi } from '@/lib/auth-service';
import { candidateApi } from '@/lib/candidate-service';
import { testApi } from '@/lib/test-service';
import { User, LogOut, Code2, Award } from 'lucide-react';

export default function CandidatDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
    else
      authApi
        .me()
        .then((r) => setUser(r.data))
        .catch(() => router.push('/auth/login'));

    candidateApi
      .getMyProfile()
      .catch((err: any) => {
        if (err.response?.status === 404) {
          setHasProfile(false);
        }
      });

    testApi.getLatestScore().then((res) => setLatestScore(res.data.score)).catch(() => { });
  }, [router]);

  const handleLogout = async () => {
    try {
      const Cookies = (await import('js-cookie')).default;
      const rt = Cookies.get('refresh_token') || '';
      await authApi.logout(rt);
    } catch { }
    clearTokens();
    router.push('/');
  };

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Vous devez d'abord compléter votre profil.</p>
          <Link href="/candidat/onboarding">
            <Button>Compléter mon profil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src="/logo.webp" alt="OPSIDE" className="w-28" />
          <div className="flex items-center gap-3">
            <Link href="/candidat/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" /> Mon profil
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground px-3 py-2"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-accent-soft flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10 text-accent" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Bonjour {user?.first_name || ''} !
          </h1>
          <p className="text-muted text-base mb-8">
            Prouvez vos compétences avec notre test technique généré par IA.
          </p>

          {latestScore !== null && (
            <div className="bg-white rounded-2xl border border-border p-6 mb-8 inline-block mx-auto">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-muted uppercase tracking-wider">Dernier score</p>
                  <p className="text-3xl font-bold text-foreground">{latestScore}%</p>
                </div>
              </div>
            </div>
          )}

          <Link href="/candidat/test/start">
            <Button size="lg" className="px-8">
              {latestScore ? 'Repasser le test' : 'Commencer le test'}
            </Button>
          </Link>

          <p className="text-xs text-muted mt-4">
            Durée : 45 min • 10 questions • Score visible sur votre profil
          </p>
        </div>
      </main>
    </div>
  );
}