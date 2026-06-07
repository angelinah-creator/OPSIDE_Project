'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearTokens, authApi } from '@/lib/auth-service';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';


const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg> },
  { href: '/admin/users', label: 'Utilisateurs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: '/admin/matches', label: 'Matches', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
];

// Admin sidebar
export default function AdminSidebar() {
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
