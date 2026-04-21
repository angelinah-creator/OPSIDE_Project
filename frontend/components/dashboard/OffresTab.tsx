'use client';

import clsx from 'clsx';
import { Star, ChevronRight } from 'lucide-react';

export default function OffresTab() {
  const categories = ["Tous", "Remote", "Hybride", "Frontend", "Backend", "Fullstack"];
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            className={clsx(
              "whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold border transition-all",
              i === 0 ? "bg-accent border-accent text-white shadow-md shadow-accent/20" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          { company: 'Google', logo: 'G', role: 'Senior React Developer', location: 'Paris (Remote)', salary: '65k - 80k €', tags: ['React', 'TypeScript', 'Tailwind'] },
          { company: 'Stripe', logo: 'S', role: 'Fullstack Engineer', location: 'Dublin (Hybride)', salary: '75k - 90k €', tags: ['Node.js', 'Go', 'React'] },
          { company: 'Vercel', logo: 'V', role: 'Frontend Platform Engineer', location: 'Remote Global', salary: '110k - 140k $', tags: ['Next.js', 'Rust', 'Wasm'] },
          { company: 'Airbnb', logo: 'A', role: 'Lead Frontend Developer', location: 'Lyon (Remote)', salary: '70k - 85k €', tags: ['React Native', 'TypeScript'] },
          { company: 'Datadog', logo: 'D', role: 'Software Engineer - UI', location: 'Paris', salary: '60k - 75k €', tags: ['D3.js', 'React', 'TS'] },
        ].map((job, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-accent group-hover:text-white transition-colors">
                {job.logo}
              </div>
              <button className="p-2 text-slate-300 hover:text-orange-500 transition-colors">
                <Star className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-accent transition-colors">{job.role}</h3>
            <p className="text-sm text-slate-500 mb-4">{job.company} • {job.location}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {job.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-tight">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-sm font-black text-slate-900">{job.salary}</span>
              <button className="text-accent text-sm font-bold flex items-center gap-1">
                Détails <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
