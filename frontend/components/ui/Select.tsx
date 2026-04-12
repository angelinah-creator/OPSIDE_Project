import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#1A1A1A] text-sm transition-all duration-200 outline-none appearance-none
          ${error ? 'border-red-400 focus:border-red-500' : 'border-[#E5E5E5] focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100'}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
