'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Comment ça marche</Link>
            <Link href="#features" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Fonctionnalités</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" size="sm">Se connecter</Button></Link>
            <Link href="/auth/register"><Button size="sm">Commencer</Button></Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-[#F0F0F0] px-4 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-sm text-[#6B6B6B] font-medium">Comment ça marche</Link>
          <Link href="#features" className="text-sm text-[#6B6B6B] font-medium">Fonctionnalités</Link>
          <Link href="/auth/login"><Button variant="outline" size="sm" className="w-full">Se connecter</Button></Link>
          <Link href="/auth/register"><Button size="sm" className="w-full">Commencer</Button></Link>
        </div>
      )}
    </header>
  );
}
