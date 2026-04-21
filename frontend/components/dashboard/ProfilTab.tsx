'use client';

import { 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Pencil, 
  Globe, 
  FileText
} from 'lucide-react';

interface ProfilTabProps {
  user: any;
  profile: any;
}

export default function ProfilTab({ user, profile }: ProfilTabProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const photoUrl = profile?.photo_url 
    ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${API_URL}${profile.photo_url}`)
    : null;

  const formatDate = (m?: number, y?: number) => {
    if (!y) return '';
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${m ? months[m - 1] + ' ' : ''}${y}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      <div className="lg:col-span-2 space-y-8">
        
        {/* Header Card / Basic Info */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm z-20">
            <Pencil className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50 relative z-10">
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-accent text-white flex items-center justify-center text-5xl font-black overflow-hidden shadow-2xl shadow-accent/20">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.first_name?.[0] || 'U'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
            </div>
            
            <div className="text-center md:text-left flex-1 min-w-0">
              <h2 className="text-3xl font-black text-slate-900 mb-2 truncate">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-accent font-bold text-lg mb-4 truncate text-uppercase tracking-wide">
                {profile?.title || profile?.speciality || 'Développeur Tech'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {profile?.skills?.slice(0, 5).map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Téléphone</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.phone || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Localisation</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.city ? `${profile.city}, ${profile.country}` : profile?.country || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Expérience</p>
                  <p className="text-sm font-bold text-slate-900">{profile?.experience_years || 0} ans</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Taux Journalier</p>
                  <p className="text-sm font-bold text-slate-900">
                    {profile?.daily_rate ? `${profile.daily_rate} ${profile.currency || '€'}` : 'Non défini'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Disponibilité</p>
                  <p className="text-sm font-bold text-green-600">
                    {profile?.availability === 'immediate' ? 'Immédiate' : 'Sous conditions'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative group">
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            À propos
          </h2>
          <p className="text-slate-600 leading-relaxed text-base italic">
            {profile?.bio || `Passionné par le développement tech, je mets mes ${profile?.experience_years || 0} ans d'expérience au service de projets innovants et scalables.`}
          </p>
        </div>

        {/* Experiences Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative group">
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-accent" /> Expériences professionnelles
          </h2>
          
          <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {profile?.experiences?.length > 0 ? (
              profile.experiences.map((exp: any, i: number) => (
                <div key={i} className="relative pl-12 flex flex-col md:flex-row gap-4 md:gap-8 group/item">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center z-10 group-hover/item:border-accent transition-colors">
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover/item:bg-accent transition-colors" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                        <p className="text-accent font-semibold">{exp.company}</p>
                      </div>
                      <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {formatDate(exp.start_month, exp.start_year)} — {exp.is_current ? 'Aujourd\'hui' : formatDate(exp.end_month, exp.end_year)}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills?.map((s: any, si: number) => (
                        <span key={si} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[10px] font-medium border border-slate-100">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic pl-12">Aucune expérience renseignée.</p>
            )}
          </div>
        </div>

        {/* Educations Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative group">
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-accent" /> Formations académiques
          </h2>
          
          <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {profile?.educations?.length > 0 ? (
              profile.educations.map((edu: any, i: number) => (
                <div key={i} className="relative pl-12 flex flex-col md:flex-row gap-4 md:gap-8 group/item">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center z-10 group-hover/item:border-accent transition-colors">
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover/item:bg-accent transition-colors" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-accent font-semibold">{edu.school}</p>
                      </div>
                      <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {formatDate(edu.start_month, edu.start_year)} — {edu.is_current ? 'En cours' : formatDate(edu.end_month, edu.end_year)}
                      </div>
                    </div>
                    {edu.field && <p className="text-sm font-bold text-slate-600 mb-2">{edu.field}</p>}
                    <p className="text-slate-500 text-sm leading-relaxed">{edu.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic pl-12">Aucune formation renseignée.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Social Links */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Liens Professionnels</h3>
          <div className="space-y-4">
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/link hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  {/* <Linkedin className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600" /> */}
                  <span className="text-sm font-bold text-slate-700">LinkedIn</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-accent" />
              </a>
            )}
            {profile?.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group/link hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  {/* <Github className="w-4 h-4 text-slate-400 group-hover/link:text-black" /> */}
                  <span className="text-sm font-bold text-slate-700">Portfolio / GitHub</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-accent" />
              </a>
            )}
            {!profile?.linkedin_url && !profile?.portfolio_url && (
              <p className="text-xs text-slate-400 text-center italic">Aucun lien ajouté</p>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group">
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Documents</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-accent transition-colors cursor-pointer group/doc">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 font-black text-xs shrink-0">PDF</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">CV_{user?.last_name || 'Candidat'}.pdf</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Mis à jour récemment</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover/doc:text-accent" />
            </div>
          </div>
        </div>

        {/* Languages or Other (Small visual card) */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full -mr-12 -mt-12 blur-2xl" />
          <button className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 text-white/40 opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white shadow-sm">
            <Pencil className="w-4 h-4" />
          </button>
          <h3 className="font-bold mb-6 uppercase text-[10px] tracking-[0.2em] text-white/50">Langues</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Français</span>
              <span className="text-accent">Natif</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Anglais</span>
              <span className="text-white/60">B2 - Avancé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
