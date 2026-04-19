'use client';
import { Question } from '@/lib/test-service';
import CodeEditor from './CodeEditor';
import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  answer: any;
  onAnswerChange: (answer: any) => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          Question {index + 1} / {total} • {question.skill} • {question.difficulty}
        </span>
        <span className="text-sm font-semibold text-accent">{question.points} pts</span>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-foreground font-medium whitespace-pre-wrap">{question.question_text}</p>
        {question.code_snippet && (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
            <code>{question.code_snippet}</code>
          </pre>
        )}
      </div>

      {/* Type de réponse selon le type de question */}
      {question.type === 'mcq' && question.options && (
        <RadioGroup value={answer} onChange={onAnswerChange}>
          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <RadioGroup.Option key={idx} value={opt}>
                {({ checked }) => (
                  <div
                    className={clsx(
                      'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                      checked
                        ? 'border-accent bg-accent-soft'
                        : 'border-border hover:border-accent/50'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        checked ? 'border-accent' : 'border-muted'
                      )}
                    >
                      {checked && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.type === 'code' && (
        <CodeEditor
          value={answer || ''}
          onChange={onAnswerChange}
          language="javascript"
          placeholder="Écrivez votre code ici..."
        />
      )}

      {(question.type === 'debug' || question.type === 'open') && (
        <textarea
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={
            question.type === 'debug'
              ? "Expliquez le bug et proposez une correction..."
              : "Votre réponse..."
          }
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
        />
      )}
    </div>
  );
}