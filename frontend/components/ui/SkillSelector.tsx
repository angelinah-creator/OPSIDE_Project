'use client';
import { useState, useEffect, useMemo } from 'react';
import { Skill, skillApi } from '@/lib/skill-service';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';

interface SkillSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

const SYSTEM_CATEGORIES = ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'design', 'data'];

export default function SkillSelector({ selectedIds, onChange, label = 'Compétences *' }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add / Edit State
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: '', category: '', customCategory: '' });

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
    return ['all', ...Array.from(cats)];
  }, [skills]);

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

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id));
    else onChange([...selectedIds, id]);
  };

  const handleCreate = async () => {
    if (!form.name || (!form.category && !form.customCategory)) return;
    setLoading(true);
    try {
      const cat = form.category === 'other' ? form.customCategory : form.category;
      const newSkill = await skillApi.createSkill(form.name, cat);
      await loadSkills();
      toggle(newSkill.id);
      setIsAdding(false);
      setForm({ name: '', category: '', customCategory: '' });
    } catch (err) {} finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingSkill || !form.name || (!form.category && !form.customCategory)) return;
    setLoading(true);
    try {
      const cat = form.category === 'other' ? form.customCategory : form.category;
      await skillApi.updateSkill(editingSkill.id, form.name, cat);
      await loadSkills();
      setEditingSkill(null);
      setForm({ name: '', category: '', customCategory: '' });
    } catch (err) {} finally { setLoading(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await skillApi.deleteSkill(id);
      onChange(selectedIds.filter(x => x !== id));
      await loadSkills();
    } catch (err) {}
  };

  const startEdit = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    setEditingSkill(skill);
    const isSystemCat = SYSTEM_CATEGORIES.includes(skill.category);
    setForm({
      name: skill.name,
      category: isSystemCat ? skill.category : 'other',
      customCategory: isSystemCat ? '' : skill.category
    });
  };

  const selectedSkills = skills.filter(s => selectedIds.includes(s.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground">{label}</label>
        <button
          type="button"
          onClick={() => { setIsAdding(!isAdding); setEditingSkill(null); setForm({ name: '', category: '', customCategory: '' }); }}
          className="text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
        >
          {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isAdding ? 'Annuler' : 'Ajouter une compétence'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingSkill) && (
        <div className="bg-background rounded-2xl border-2 border-accent/20 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-foreground">
            {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Nom de la compétence (ex: Redis)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:border-accent"
              >
                <option value="">Choisir une catégorie...</option>
                {SYSTEM_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
                <option value="other">Autre...</option>
              </select>
            </div>
            {form.category === 'other' && (
              <Input
                placeholder="Nom de la nouvelle catégorie"
                value={form.customCategory}
                onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
              />
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={editingSkill ? handleUpdate : handleCreate} loading={loading}>
                <Check className="w-3.5 h-3.5 mr-1" /> {editingSkill ? 'Enregistrer' : 'Créer et ajouter'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setIsAdding(false); setEditingSkill(null); }}>
                Annuler
              </Button>
            </div>
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

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto rounded-2xl border border-border p-3 bg-background/50">
        {filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center space-y-2">
            <p className="text-sm text-muted">Aunuce compétence trouvée</p>
            {search && (
              <button
                type="button"
                onClick={() => { setIsAdding(true); setForm(f => ({ ...f, name: search })); }}
                className="text-xs text-accent font-medium hover:underline"
              >
                Créer "{search}" ?
              </button>
            )}
          </div>
        ) : (
          filtered.map(skill => (
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
          ))
        )}
      </div>
    </div>
  );
}
