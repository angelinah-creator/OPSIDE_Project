'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onExpire: () => void;
  className?: string;
}

// Timer
export default function Timer({ durationMinutes, onExpire, className = '' }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  // Formate time
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = secondsLeft < 300; // 5 minutes

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        isWarning ? 'bg-red-50 text-red-600' : 'bg-background border border-border text-foreground'
      } ${className}`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold">{formatTime(secondsLeft)}</span>
    </div>
  );
}