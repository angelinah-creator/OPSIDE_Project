import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}

export default function Input({ label, error, hint, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      )}
      <div className="relative w-full">
        <input
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#1A1A1A] placeholder-[#AEAEAE] text-sm transition-all duration-200 outline-none
            ${error ? 'border-red-400 focus:border-red-500' : 'border-[#E5E5E5] focus:border-accent focus:ring-2 focus:ring-purple-100'}
            ${suffix ? 'pr-12' : ''}
            ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <span className="text-sm font-medium text-muted">{suffix}</span>
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#6B6B6B]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
