'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/client/dashboard', label: 'Poster offre', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
  { href: '/client/profile', label: 'Mon entreprise', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  return (
    <aside className="w-64 bg-white border-r border-[#F0F0F0] flex flex-col min-h-screen">
      <div className="p-6 border-b border-[#F0F0F0]"><Logo /></div>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#1A1A1A] text-white' : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'}`}>
              {item.icon}{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#F0F0F0]">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B6B6B] hover:bg-red-50 hover:text-red-500 transition-all w-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
