'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SkillSelector from '@/components/ui/SkillSelector';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { testApi } from '@/lib/test-service';
import { candidateApi } from '@/lib/candidate-service';
import { ArrowLeft, Code2 } from 'lucide-react';
import Link from 'next/link';

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data / IA' },
];

export default function StartTestPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [speciality, setSpeciality] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileSpeciality, setProfileSpeciality] = useState('');

  useEffect(() => {
    candidateApi.getMyProfile().then((p) => {
      setProfileSpeciality(p.speciality);
      setSpeciality(p.speciality);
    }).catch(() => {});
  }, []);

  const handleStart = async () => {
    if (skills.length === 0) {
      setError('Veuillez sélectionner au moins une compétence.');
      return;
    }
    if (skills.length > 3) {
      setError('Maximum 3 compétences.');
      return;
    }
    if (!speciality) {
      setError('Veuillez choisir une spécialité.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await testApi.startTest(skills, speciality);
      router.push(`/candidat/test/${res.data.testId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/candidat/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center">
              <Code2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Test technique</h1>
              <p className="text-sm text-muted">
                Sélectionnez les technologies sur lesquelles vous souhaitez être évalué.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Spécialité *
              </label>
              <Select
                options={SPECIALITIES}
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                placeholder="Choisir..."
              />
              {profileSpeciality && speciality !== profileSpeciality && (
                <p className="text-xs text-muted mt-1">
                  Votre spécialité de profil est "{SPECIALITIES.find(s => s.value === profileSpeciality)?.label}".
                </p>
              )}
            </div>

            <div>
              <SkillSelector
                label="Compétences à tester * (max 3)"
                selectedIds={skills}
                onChange={setSkills}
              />
              <p className="text-xs text-muted mt-1">
                {skills.length}/3 compétences sélectionnées
              </p>
            </div>

            <div className="bg-background rounded-xl p-4 border border-border">
              <h3 className="font-medium text-foreground mb-2">Informations</h3>
              <ul className="text-sm text-muted space-y-1 list-disc list-inside">
                <li>Durée : 45 minutes</li>
                <li>10 questions générées par IA</li>
                <li>Score affiché sur votre profil</li>
                <li>Vous pouvez repasser le test une fois par mois</li>
              </ul>
            </div>

            <Button
              onClick={handleStart}
              loading={loading}
              disabled={skills.length === 0 || skills.length > 3 || !speciality}
              className="w-full"
              size="lg"
            >
              Commencer le test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}