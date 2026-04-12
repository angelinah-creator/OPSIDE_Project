import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#1A1A1A] placeholder-[#AEAEAE] text-sm transition-all duration-200 outline-none
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-[#E5E5E5] focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100'}
          ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[#6B6B6B]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
