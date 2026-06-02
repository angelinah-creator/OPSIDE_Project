'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { customTestService, CustomTest } from '@/lib/custom-test-service';
import QuestionCard from '@/components/test/QuestionCard';
import Timer from '@/components/test/Timer';
import TestStepper from '@/components/test/TestStepper';
import Button from '@/components/ui/Button';
import { ChevronRight, Send, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TakeCustomTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState<CustomTest | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [duration, setDuration] = useState(45);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);

  useEffect(() => {
    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setCheatWarning("L'utilisation du copier, couper et coller est interdite pendant l'évaluation.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarning("Vous avez quitté l'onglet du test. Les changements d'onglet ne sont pas autorisés et sont enregistrés.");
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.relatedTarget === null) {
        setCheatWarning("Veuillez rester sur cette page. Il est interdit de quitter la zone de test.");
      }
    };

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
    const loadTest = async () => {
      try {
        const tests = await customTestService.getCandidateTests();
        let currentTest = tests.find(t => t.id === testId);
        
        if (!currentTest) {
          throw new Error("Test introuvable.");
        }

        if (currentTest.status === 'sent') {
          // Démarrer le test s'il n'est pas encore démarré
          await customTestService.startTest(testId);
          // Re-fetch to get questions
          const updatedTests = await customTestService.getCandidateTests();
          currentTest = updatedTests.find(t => t.id === testId);
        }

        if (!currentTest || !currentTest.questions) {
          throw new Error("Questions introuvables.");
        }

        // Map questions from custom test format to QuestionCard format if needed
        // custom test format: { id, type, question, options?, points }
        // QuestionCard expects: { id, type, question_text, options?, points, code_snippet? }
        const mappedQuestions = (currentTest.questions as any[]).map(q => ({
          ...q,
          question_text: q.question,
          type: q.type === 'qcm' ? 'mcq' : q.type,
        }));

        setTest(currentTest);
        setQuestions(mappedQuestions);
        setDuration(currentTest.duration_minutes || 45);
        setAnswers(new Array(mappedQuestions.length).fill(''));
        setLoading(false);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Impossible de charger le test.');
        setLoading(false);
      }
    };
    loadTest();
  }, [testId]);

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
      // Build the answers object mapping 'q{id}' to answer
      const answersObj: Record<string, string> = {};
      questions.forEach((q, idx) => {
        if (answers[idx]) {
          answersObj[`q${q.id}`] = answers[idx];
        }
      });

      await customTestService.submitTest(testId, answersObj);
      toast.success('Test soumis avec succès !');
      router.push(`/candidat/dashboard?tab=tests`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission.');
      setSubmitting(false);
    } finally {
      setShowConfirmSubmit(false);
    }
  }, [testId, answers, questions, router]);

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
                  Soumettre le test
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
