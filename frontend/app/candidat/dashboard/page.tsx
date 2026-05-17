'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearTokens, authApi } from '@/lib/auth-service';
import { candidateApi } from '@/lib/candidate-service';
import { testApi } from '@/lib/test-service';
import { matchService } from '@/lib/match-service';
import { 
  User, 
  LogOut, 
  Code2, 
  Briefcase, 
  History, 
  Bell, 
  BookOpen, 
  Search,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

// Tab Components
import TechniqueTab from '@/components/dashboard/candidate/TechniqueTab';
import OffresTab from '@/components/dashboard/candidate/OffresTab';
import HistoriqueTab from '@/components/dashboard/candidate/HistoriqueTab';
import ProfilTab from '@/components/dashboard/candidate/ProfilTab';
import NotificationsTab from '@/components/dashboard/NotificationsTab';
import AideTab from '@/components/dashboard/candidate/AideTab';
import CustomTestTab from '@/components/dashboard/candidate/CustomTestTab';
import MatchesTab from '@/components/dashboard/candidate/MatchesTab';
import { useNotifications } from '@/hooks/useNotifications';
import { CheckSquare, Home, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

type TabType = 'technique' | 'offres' | 'historique' | 'profil' | 'matches' | 'notifications' | 'aide';

export default function CandidatDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('technique');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasWorkspaceAccess, setHasWorkspaceAccess] = useState(false);
  const { unreadCount: unreadNotifications } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = getUser();
        if (u) {
          setUser(u);
        } else {
          const me = await authApi.me();
          setUser(me.data);
        }

        const p = await candidateApi.getMyProfile();
        setProfile(p);

        const scoreRes = await testApi.getLatestScore();
        // Forced mock score for UI testing if null
        setLatestScore(scoreRes.score || 85);
        
        const matchesData = await matchService.getCandidateMatches();
        const hasAccess = matchesData.some((m: any) => m.status === 'in_workspace');
        setHasWorkspaceAccess(hasAccess);
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/candidat/onboarding');
        } else {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const Cookies = (await import('js-cookie')).default;
      const rt = Cookies.get('refresh_token') || '';
      await authApi.logout(rt);
    } catch { }
    clearTokens();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-medium">Chargement de votre workspace...</p>
        </div>
      </div>
    );
  }

  const navItems: { id: TabType; label: string; icon?: any; }[] = [
    { id: 'technique', label: 'Test technique', icon: Code2 },
    { id: 'offres', label: 'Offres d\'emploi', icon: Briefcase },
    { id: 'matches', label: 'Matches', icon: Bell },
    { id: 'historique', label: 'Historique', icon: History },
    { id: 'profil', label: 'Mon Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'aide', label: 'Aide entretien', icon: BookOpen },
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const photoUrl = profile?.photo_url 
    ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${API_URL}${profile.photo_url}`)
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "w-72 bg-white border-r border-slate-200 flex flex-col fixed lg:sticky top-0 h-dvh z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <img src="/logo.webp" alt="OPSIDE" className="w-32" />
          <button 
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false); // Close sidebar on mobile when tab changes
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group text-left",
                  activeTab === item.id 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
            >
              {item.icon && <item.icon className={clsx(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              )} />}
              {item.label}
              {item.id === 'notifications' && unreadNotifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          ))}
          {hasWorkspaceAccess && (
            <div className="pt-4 pb-2 px-4">
               <div className="h-px bg-slate-100 mb-4" />
               <Link
                 href="/candidat/workspace"
                 className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] text-sm text-left"
               >
                 <Home className="w-5 h-5 text-amber-400" />
                 Mon Workspace
                 <ArrowRightLeft className="w-4 h-4 ml-auto text-slate-400" />
               </Link>
            </div>
          )}
        </nav>
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 lg:border-none">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.first_name?.[0]
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 h-dvh overflow-y-auto">
        <div className="p-4 md:p-10 w-full">
          <header className="flex items-center gap-4 mb-8 md:mb-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </header>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'technique' && <TechniqueTab score={latestScore} profile={profile} />}
          {activeTab === 'offres' && <OffresTab />}
          {activeTab === 'matches' && <MatchesTab />}
          {activeTab === 'historique' && <HistoriqueTab />}
          {activeTab === 'profil' && <ProfilTab profile={profile} user={user} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'aide' && <AideTab />}
        </div>
        </div>
      </main>
    </div>
  );
}