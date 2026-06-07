'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Test result page
export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {

    setTimeout(() => {
      setResult({ score: 85, status: 'completed' });
      setLoading(false);
    }, 1000);
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/candidat/dashboard">
            <Button>Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const score = result?.score ?? 0;
  const isPassed = true; // Pas de seuil pour platform

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <Link
          href="/candidat/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-border p-8 text-center shadow-card">
          <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-6">
            {score >= 50 ? (
              <CheckCircle className="w-10 h-10 text-accent" />
            ) : (
              <XCircle className="w-10 h-10 text-amber-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Test terminé</h1>
          <div className="bg-background rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-accent mb-2">{score}%</div>
            <p className="text-sm text-muted">Score final</p>
          </div>

          <p className="text-sm text-muted mb-8">
            Ce score est maintenant visible sur votre profil. Vous pourrez repasser un test dans un
            mois.
          </p>

          <Link href="/candidat/dashboard">
            <Button className="w-full" size="lg">
              Allez au dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}