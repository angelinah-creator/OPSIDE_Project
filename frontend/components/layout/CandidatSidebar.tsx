'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearTokens, authApi } from '@/lib/auth-service';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';


const navItems = [
  { href: '/candidat/dashboard', label: 'Test technique', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { href: '/candidat/profile', label: 'Mon profil', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

// Candidat sidebar
export default function CandidatSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Logout
  const logout = async () => {
    try { const Cookies = (await import('js-cookie')).default; await authApi.logout(Cookies.get('refresh_token') || '') } catch {}
    clearTokens(); router.push('/')
  };

  
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
