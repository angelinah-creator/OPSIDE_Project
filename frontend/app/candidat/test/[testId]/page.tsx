'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { testApi, Question } from '@/lib/test-service';
import QuestionCard from '@/components/test/QuestionCard';
import Timer from '@/components/test/Timer';
import TestStepper from '@/components/test/TestStepper';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    testApi
      .startTestById(testId)
      .then((res) => {
        setQuestions(res.data.questions);
        setDuration(res.data.durationMinutes);
        setAnswers(new Array(res.data.questions.length).fill(''));
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Impossible de charger le test.');
      })
      .finally(() => setLoading(false));
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
      const res = await testApi.submitTest(testId, answers);
      router.push(`/candidat/test-result/${testId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setSubmitting(false);
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
            <Button>Retour au dashboard</Button>
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
      <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="OPSIDE" className="w-24" />
            <span className="text-sm font-medium text-muted hidden sm:inline">
              Question {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <Timer durationMinutes={duration} onExpire={handleTimerExpire} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
              </Button>

              {!isLast ? (
                <Button onClick={() => setCurrentIndex((i) => i + 1)}>
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
          <div className="lg:col-span-1">
            <TestStepper
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              onSelect={setCurrentIndex}
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
    </div>
  );
}