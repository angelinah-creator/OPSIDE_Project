'use client';
import { Question } from '@/lib/test-service';

interface TestStepperProps {
  questions: Question[];
  currentIndex: number;
  answers: any[];
}

export default function TestStepper({
  questions,
  currentIndex,
  answers,
}: TestStepperProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Navigation</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isAnswered = answers[idx] !== undefined && answers[idx] !== '';
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={q.id}
              className={`
                w-full aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                ${isCurrent ? 'bg-accent text-white ring-2 ring-accent/30' : ''}
                ${!isCurrent && isAnswered ? 'bg-green-100 text-green-700 border border-green-300' : ''}
                ${!isCurrent && !isAnswered ? 'bg-background border border-border text-muted' : ''}
              `}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-muted">
        {answers.filter((a) => a !== undefined && a !== '').length} / {questions.length} répondues
      </div>
    </div>
  );
}