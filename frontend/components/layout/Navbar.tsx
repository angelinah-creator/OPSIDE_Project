'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string>('#');

  useEffect(() => {
    import('@/lib/auth-service').then((auth) => {
      const u = auth.getUser();
      if (u) {
        setUser(u);
        setDashboardUrl(auth.getDashboardByRole(u.role));
      }
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <img src="/logo.webp" alt="OPSIDE" className="w-24 lg:w-28" />
            </Link>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm font-medium text-[#1A1A1A] hover:text-[#7C3AED] transition-colors">
              Comment ça marche
            </Link>
            <Link href="/#stats" className="text-sm font-medium text-[#1A1A1A] hover:text-[#7C3AED] transition-colors">
              Chiffres
            </Link>
            {user && (
              <Link href={dashboardUrl} className="text-sm font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
                Mon Dashboard
              </Link>
            )}
          </nav>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center gap-4">
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-medium">Se connecter</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gradient" size="sm" className="text-[#1A1A1A] border-none shadow-none font-medium">S'inscrire</Button>
                </Link>
              </>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-[#1A1A1A]" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#F0F0F0] px-4 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <Link href="/#how-it-works" onClick={() => setOpen(false)} className="text-base font-medium text-[#1A1A1A]">Comment ça marche</Link>
          <Link href="/#stats" onClick={() => setOpen(false)} className="text-base font-medium text-[#1A1A1A]">Chiffres</Link>
          {user && (
            <Link href={dashboardUrl} onClick={() => setOpen(false)} className="text-base font-medium text-[#7C3AED]">Mon Dashboard</Link>
          )}
          <hr className="border-[#F0F0F0]" />
          <div className="flex flex-col gap-3">
            {!user ? (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">Se connecter</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">S'inscrire</Button>
                </Link>
              </>
            ) : (
              <Link href={dashboardUrl} onClick={() => setOpen(false)}>
                <Button variant="gradient" className="w-full justify-center">Accéder au Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

