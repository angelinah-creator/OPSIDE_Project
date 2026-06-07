'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/lib/test-service';
import QuestionCard from '@/components/test/QuestionCard';
import Timer from '@/components/test/Timer';
import TestStepper from '@/components/test/TestStepper';
import Button from '@/components/ui/Button';
import { ChevronRight, Send, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Take test page
export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState(45);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  useEffect(() => {
    // Gère copy paste
    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setCheatWarning("L'utilisation du copier, couper et coller est interdite pendant l'évaluation.");
    };

    // Gère visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarning("Vous avez quitté l'onglet du test. Les changements d'onglet ne sont pas autorisés et sont enregistrés.");
      }
    };

    // Gère mouse leave
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.relatedTarget === null) {
        setCheatWarning("Veuillez rester sur cette page. Il est interdit de quitter la zone de test.");
      }
    };

    // Gère before unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Vous avez un test en cours. Êtes-vous sûr de vouloir quitter ?";
      return e.returnValue;
    };

    window.addEventListener('copy', handleCopyPaste, { capture: true });
    window.addEventListener('cut', handleCopyPaste, { capture: true });
    window.addEventListener('paste', handleCopyPaste, { capture: true });
    window.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('copy', handleCopyPaste, { capture: true });
      window.removeEventListener('cut', handleCopyPaste, { capture: true });
      window.removeEventListener('paste', handleCopyPaste, { capture: true });
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {

    const mockQuestions: Question[] = [
      { id: 1, type: 'mcq', skill: 'React', difficulty: 'medium', question_text: 'Quelle est l\'utilité du hook useEffect ?', options: ['Gérer les cycles de vie', 'Créer des styles', 'Déclarer un état', 'Faire du routage'], points: 10 },
      { id: 2, type: 'mcq', skill: 'TypeScript', difficulty: 'medium', question_text: 'Comment définir une interface pour un objet avec une clé dynamique ?', options: ['{ [key: string]: any }', '{ key: string }', 'any[]', 'Object.keys()'], points: 10 },
      { id: 3, type: 'mcq', skill: 'React', difficulty: 'hard', question_text: 'Dans quel cas useMemo est-il préférable à useCallback ?', options: ['Pour mémoïser une valeur calculée', 'Pour mémoïser une fonction', 'Pour déclencher un effet', 'Pour gérer un cycle de vie'], points: 10 },
      { id: 4, type: 'mcq', skill: 'CSS', difficulty: 'easy', question_text: 'Quelle propriété permet de créer de l\'espace à l\'intérieur d\'un élément ?', options: ['margin', 'padding', 'border', 'gap'], points: 10 },
      
      { id: 5, type: 'code', skill: 'JavaScript', difficulty: 'medium', question_text: 'Écrivez une fonction "reverseString(str)" qui inverse une chaîne de caractères.', code_snippet: 'function reverseString(str) {\n  // Votre code ici\n}', points: 20 },
      { id: 6, type: 'code', skill: 'React', difficulty: 'medium', question_text: 'Créez un composant Counter simple qui incrémente une valeur au clic.', code_snippet: 'export default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    // ...\n  );\n}', points: 20 },
      { id: 7, type: 'code', skill: 'JavaScript', difficulty: 'hard', question_text: 'Implémentez une fonction de debounce.', code_snippet: 'function debounce(fn, delay) {\n  // ...\n}', points: 20 },

      { id: 8, type: 'debug', skill: 'React', difficulty: 'medium', question_text: 'Pourquoi ce composant provoque-t-il une boucle infinie ?', code_snippet: 'useEffect(() => {\n  setCount(count + 1);\n}, [count]);', points: 15 },
      { id: 9, type: 'debug', skill: 'JavaScript', difficulty: 'easy', question_text: 'Corrigez l\'erreur dans cette boucle.', code_snippet: 'for (var i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100);\n} // Affiche 5, 5, 5, 5, 5', points: 15 },

      { id: 10, type: 'open', skill: 'Architecture', difficulty: 'medium', question_text: 'Expliquez la différence entre le Virtual DOM et le DOM réel.', points: 10 },
    ];
    setQuestions(mockQuestions);
    setDuration(45);
    setAnswers(new Array(mockQuestions.length).fill(''));
    setLoading(false);
  }, [testId]);

  // Gère answer change
  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = value;
      return updated;
    });
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('opside_mock_score', '85');
        }
        router.push(`/candidat/test/test-result/${testId}`);
        setSubmitting(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.');
      setSubmitting(false);
    } finally {
      setShowConfirmSubmit(false);
    }
  }, [testId, answers, router]);

  const handleTimerExpire = useCallback(() => {
    alert('Temps écoulé ! Le test va être soumis automatiquement.');
    handleSubmit();
  }, [handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="bg-white rounded-2xl border border-border p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Erreur</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link href="/candidat/dashboard">
            <Button>Allez au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.every((a) => a !== undefined && a !== '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec timer */}
      <header className="bg-white border-b border-border px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="OPSIDE" className="w-24" />
            <span className="text-sm font-medium text-muted hidden sm:inline">
              Question {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <Timer durationMinutes={duration} onExpire={handleTimerExpire} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Colonne principale : question */}
          <div className="lg:col-span-3 space-y-6">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              answer={answers[currentIndex]}
              onAnswerChange={handleAnswerChange}
            />

            {/* Navigation */}
            <div className="flex items-center justify-end">
              {!isLast ? (
                <Button 
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  disabled={!answers[currentIndex]}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={!allAnswered}
                >
                  <Send className="w-4 h-4 mr-1" /> Soumettre le test
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar : stepper */}
          <div className="lg:col-span-1 max-w-sm w-full mx-auto lg:mx-0 lg:max-w-none">
            <TestStepper
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
            />
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowConfirmSubmit(true)}
                disabled={!allAnswered}
              >
                Soumettre maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Confirmer la soumission</h2>
            <p className="text-muted mb-2">
              Vous avez répondu à {answers.filter((a) => a !== '').length} / {questions.length}{' '}
              questions.
            </p>
            {!allAnswered && (
              <p className="text-amber-600 text-sm mb-4">
                Attention : certaines questions n'ont pas été répondues.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Annuler
              </Button>
              <Button className="flex-1" onClick={handleSubmit} loading={submitting}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal anti-triche */}
      {cheatWarning && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-red-200">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Action non autorisée</h2>
            <p className="text-muted mb-6">{cheatWarning}</p>
            <Button onClick={() => setCheatWarning(null)} className="w-full bg-red-500 hover:bg-red-600 border-none text-white">
              J'ai compris
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}