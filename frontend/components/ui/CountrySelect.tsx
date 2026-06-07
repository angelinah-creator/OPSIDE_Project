'use client'

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react'

export interface CountryOption {
  value: string
  label: string
  flag: string // ISO code like 'mg', 'sn', etc.
}

interface CountrySelectProps {
  label?: string
  options: CountryOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

// Country select
export default function CountrySelect({ label, options, value, onChange, placeholder = 'Choisir...', error }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    // Gère click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border bg-white text-sm transition-all duration-200 outline-none
          ${error ? 'border-red-400' : isOpen ? 'border-accent ring-2 ring-purple-100' : 'border-[#E5E5E5] hover:border-gray-300'}
        `}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              <img 
                src={`https://flagcdn.com/w40/${selectedOption.flag}.png`} 
                alt="" 
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
              />
              <span className="text-[#1A1A1A] font-medium">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-[#AEAEAE]">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-border rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-sm
                ${value === opt.value ? 'bg-purple-50/50 text-accent' : 'text-[#1A1A1A]'}
              `}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={`https://flagcdn.com/w40/${opt.flag}.png`} 
                  alt="" 
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                />
                <span className={value === opt.value ? 'font-semibold' : ''}>{opt.label}</span>
              </div>
              {value === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
