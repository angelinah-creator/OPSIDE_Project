'use client';
import { useState, useEffect } from 'react';
import { Skill } from '@/lib/skill-service';

import Badge from './Badge';
import { skillApi } from '@/lib/skill-service';

interface SkillSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

const CATEGORIES = ['all', 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'design', 'data'];

export default function SkillSelector({ selectedIds, onChange, label = 'Compétences' }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const getSkills = skillApi.getSkills;

  useEffect(() => {
    getSkills(activeCategory === 'all' ? undefined : activeCategory)
      .then(setSkills)
      .catch(() => {});
  }, [activeCategory]);

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id));
    else onChange([...selectedIds, id]);
  };

  const selectedSkills = skills.filter(s => selectedIds.includes(s.id));

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>

      {/* Selected */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSkills.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              {s.name}
              <span className="text-purple-400 ml-0.5">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher une compétence..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-sm outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-[#EFEFEF] text-[#6B6B6B] hover:bg-[#E0E0E0]'
            }`}
          >
            {cat === 'all' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E5E5E5] p-3 bg-[#FAFAFA]">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#AEAEAE] text-center py-4">Aucune compétence trouvée</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filtered.map(skill => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggle(skill.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedIds.includes(skill.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-[#E5E5E5] text-[#4B4B4B] hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
