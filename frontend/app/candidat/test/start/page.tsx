'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

import { candidateApi } from '@/lib/candidate-service';
import { ArrowLeft, Code2, Check, Info } from 'lucide-react';
import Link from 'next/link';

const SPECIALITIES = [
  { value: 'frontend', label: 'Frontend' }, { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' }, { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' }, { value: 'design', label: 'Design UX/UI' },
  { value: 'data', label: 'Data / IA' }, { value: 'other', label: 'Autre' },
];

// Start test page
export default function StartTestPage() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    candidateApi.getMyProfile()
      .then((p) => {
        setProfile(p);
      })
      .catch(() => {
        setError('Impossible de charger votre profil. Veuillez réessayer.');
      })
      .finally(() => setFetching(false));
  }, []);

  // Récupère difficulty
  const getDifficulty = (years: number) => {
    if (years < 2) return { label: 'Junior', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', condition: '0 à 2 ans d\'expérience' };
    if (years <= 5) return { label: 'Mid-Level', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', condition: '2 à 5 ans d\'expérience' };
    return { label: 'Senior', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', condition: 'Plus de 5 ans d\'expérience' };
  };

  // Gère start
  const handleStart = async () => {
    if (selectedSkills.length === 0) {
      setError('Veuillez sélectionner au moins une compétence.');
      return;
    }
    if (selectedSkills.length > 3) {
      setError('Maximum 3 compétences.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('MOCK: Starting test with skills:', selectedSkills);
      setTimeout(() => {
        router.push(`/candidat/test/mock-test-id`);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du test.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle skill
  const toggleSkill = (id: string) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter(s => s !== id));
    } else {
      if (selectedSkills.length >= 3) return;
      setSelectedSkills([...selectedSkills, id]);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const difficulty = getDifficulty(profile?.experience_years || 0);
  const mySkills = profile?.candidate_skills?.map((cs: any) => cs.skill) || [];

  const groupedSkills = mySkills.reduce((acc: any, skill: any) => {
    const cat = skill.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Test technique</h1>
                <p className="text-sm text-muted">Évaluation basée sur votre profil</p>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl border ${difficulty.bg} ${difficulty.border} flex flex-col items-end`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${difficulty.color}`}>{difficulty.label}</span>
              <span className="text-[10px] text-muted-foreground">{difficulty.condition}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Speciality Info (Read only) */}
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-widest mb-1">Spécialité</p>
                {profile?.speciality ? (
                  <p className="text-lg font-bold text-foreground">
                    {SPECIALITIES.find(s => s.value === profile?.speciality)?.label || profile?.speciality}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-red-500">Non définie</p>
                    <Link href="/candidat/profile" className="text-xs text-accent hover:underline">
                      Définir ma spécialité dans mon profil →
                    </Link>
                  </div>
                )}
              </div>
              <Info className="w-5 h-5 text-muted" />
            </div>

            {/* Skill Selection (Limited to candidate skills) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">
                Sélectionnez vos compétences à tester (max 3)
              </label>
              
              {mySkills.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([category, skills]: [string, any]) => (
                    <div key={category}>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {skills.map((skill: any) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                              selectedSkills.includes(skill.id)
                                ? 'bg-accent border-accent text-white shadow-md'
                                : 'bg-white border-border text-foreground hover:border-accent hover:shadow-sm'
                            }`}
                          >
                            <span className="truncate">{skill.name}</span>
                            {selectedSkills.includes(skill.id) && <Check className="w-4 h-4 ml-2 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border bg-background/50">
                  <p className="text-sm text-muted mb-4">Vous n'avez pas encore ajouté de compétences à votre profil.</p>
                  <Link href="/candidat/profile">
                    <Button variant="outline" size="sm">Modifier mon profil</Button>
                  </Link>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-6 px-1 pt-4 border-t border-border">
                <p className="text-xs text-muted">
                  {selectedSkills.length}/3 compétences sélectionnées
                </p>
                {selectedSkills.length > 0 && (
                  <button 
                    onClick={() => setSelectedSkills([])}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    Effacer la sélection
                  </button>
                )}
              </div>
            </div>

            <div className="bg-background rounded-2xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-accent" /> Règles du test
              </h3>
              <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                <li>Durée : <span className="text-foreground font-medium">45 minutes</span></li>
                <li>Contenu : <span className="text-foreground font-medium">10 questions</span> adaptées au niveau <span className="font-bold">{difficulty.label}</span></li>
                <li>Validité : Le score sera affiché sur votre profil public</li>
                <li>Limite : Vous pouvez repasser le test <span className="text-foreground font-medium">une fois par mois</span></li>
              </ul>
            </div>

            <Button
              onClick={handleStart}
              loading={loading}
              disabled={selectedSkills.length === 0 || selectedSkills.length > 3 || !profile?.speciality}
              className="w-full rounded-2xl"
              size="lg"
            >
              Lancer le test technique
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}