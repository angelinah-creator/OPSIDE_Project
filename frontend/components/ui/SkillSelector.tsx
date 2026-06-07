'use client';
import { useState, useEffect, useMemo } from 'react';
import { Skill, skillApi } from '@/lib/skill-service';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';

import Button from './Button';

interface SkillSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

const SYSTEM_CATEGORIES = ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'design', 'data'];

// Skill selector
export default function SkillSelector({ selectedIds, onChange, label = 'Compétences *' }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>([]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: '', category: '', customCategory: '' });

  // Load skills
  const loadSkills = async () => {
    try {
      const data = await skillApi.getSkills();
      setSkills(data);
    } catch (err) {}
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(SYSTEM_CATEGORIES);
    skills.forEach(s => cats.add(s.category));
    localCategories.forEach(c => cats.add(c));
    return ['all', ...Array.from(cats)];
  }, [skills, localCategories]);

  const filtered = useMemo(() => {
    let res = skills;
    if (activeCategory !== 'all') {
      res = res.filter(s => s.category === activeCategory);
    }
    if (search) {
      res = res.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    }
    return res;
  }, [skills, activeCategory, search]);

  // Toggle
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id));
    else onChange([...selectedIds, id]);
  };

  // Gère create skill
  const handleCreateSkill = async () => {
    if (!form.name || activeCategory === 'all') return;
    setLoading(true);
    try {
      const newSkill = await skillApi.createSkill(form.name, activeCategory);
      await loadSkills();
      toggle(newSkill.id);
      setIsAddingSkill(false);
      setForm({ name: '', category: '', customCategory: '' });
    } catch (err) {} finally { setLoading(false); }
  };

  // Gère create category
  const handleCreateCategory = async () => {
    if (!form.customCategory) return;
    setLocalCategories(prev => [...prev, form.customCategory]);
    setActiveCategory(form.customCategory);
    setIsAddingCategory(false);
    setForm({ name: '', category: '', customCategory: '' });
  };

  // Gère update
  const handleUpdate = async () => {
    if (!editingSkill || !form.name) return;
    setLoading(true);
    try {
      await skillApi.updateSkill(editingSkill.id, form.name, editingSkill.category);
      await loadSkills();
      setEditingSkill(null);
      setForm({ name: '', category: '', customCategory: '' });
    } catch (err) {} finally { setLoading(false); }
  };

  // Gère delete
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await skillApi.deleteSkill(id);
      onChange(selectedIds.filter(x => x !== id));
      await loadSkills();
    } catch (err) {}
  };

  // Start edit
  const startEdit = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      customCategory: ''
    });
  };

  const selectedSkills = skills.filter(s => selectedIds.includes(s.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground">{label}</label>
      </div>

      {/* Edit Form (Simple inline for editing) */}
      {editingSkill && (
        <div className="bg-background rounded-2xl border-2 border-accent/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-foreground">Modifier la compétence</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nom de la compétence"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-accent"
            />
            <Button size="sm" onClick={handleUpdate} loading={loading}>
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditingSkill(null)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Selected */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map(s => (
            <div
              key={s.id}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft text-accent border border-accent/10 transition-all hover:bg-accent hover:text-white"
            >
              <span className="text-xs font-semibold">{s.name}</span>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="p-0.5 rounded-md hover:bg-white/20 transition-colors"
                title="Désélectionner"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search & Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher ou filtrer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-foreground text-white shadow-md'
                    : 'bg-background border border-border text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {cat === 'all' ? 'Toutes' : cat}
              </button>
            ))}
            
            {/* Inline Add Category */}
            {isAddingCategory ? (
              <div className="flex items-center gap-1 animate-in slide-in-from-left-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nom catégorie..."
                  value={form.customCategory}
                  onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                  className="px-3 py-1 rounded-full border border-accent bg-white text-xs outline-none w-32"
                />
                <button onClick={handleCreateCategory} className="text-accent hover:text-accent-hover p-1">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsAddingCategory(false)} className="text-muted hover:text-foreground p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setIsAddingCategory(true); setForm({ ...form, customCategory: '' }); }}
                className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all transform hover:scale-110 shadow-sm flex items-center justify-center shrink-0 border border-accent/20"
                title="Ajouter une catégorie"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-2xl border border-border p-3 bg-background/50">
        {filtered.map(skill => (
          <div
            key={skill.id}
            onClick={() => toggle(skill.id)}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              selectedIds.includes(skill.id)
                ? 'bg-accent border-accent text-white shadow-sm'
                : 'bg-white border-border text-foreground hover:border-accent hover:shadow-sm'
            }`}
          >
            <span className="truncate pr-1">{skill.name}</span>
            
            {skill.is_custom && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => startEdit(e, skill)}
                  className={`p-1 rounded-md transition-colors ${selectedIds.includes(skill.id) ? 'hover:bg-white/20' : 'hover:bg-accent-soft text-accent'}`}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, skill.id)}
                  className={`p-1 rounded-md transition-colors ${selectedIds.includes(skill.id) ? 'hover:bg-red-500' : 'hover:bg-red-50 text-red-500'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline Add Skill */}
        {activeCategory !== 'all' && (
          isAddingSkill ? (
            <div className="col-span-1 flex items-center gap-1 bg-white rounded-xl border border-accent p-1 animate-in zoom-in-95">
              <input
                autoFocus
                type="text"
                placeholder="Nom..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleCreateSkill()}
                className="w-full px-2 py-1.5 text-xs outline-none"
              />
              <button onClick={handleCreateSkill} className="text-accent p-1">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsAddingSkill(false)} className="text-muted p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setIsAddingSkill(true); setForm({ ...form, name: '' }); }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-dashed border-accent/20 text-accent bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
              <span>Ajouter</span>
            </button>
          )
        )}

        {filtered.length === 0 && !search && activeCategory === 'all' && (
          <div className="col-span-full py-8 text-center text-muted text-xs">
            Aucune compétence trouvée
          </div>
        )}
      </div>
    </div>
  );
}
