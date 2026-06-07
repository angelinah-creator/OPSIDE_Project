import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

// Textarea
export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#1A1A1A] placeholder-[#AEAEAE] text-sm transition-all duration-200 outline-none resize-none
          ${error ? 'border-red-400 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100'}
          ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
