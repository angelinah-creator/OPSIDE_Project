import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Timesheet } from '@/lib/timesheet-service';

interface TaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Partial<Timesheet> | null;
  onSave: (data: Partial<Timesheet>) => void;
  onDelete?: () => void;
  mode: 'create' | 'edit';
  isEditable?: boolean;
}

export function TaskPopup({
  isOpen,
  onClose,
  entry,
  onSave,
  onDelete,
  mode,
  isEditable = true,
}: TaskPopupProps) {
  const [formData, setFormData] = useState<Partial<Timesheet>>({});
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('00:00:00');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (entry) {
      setFormData(entry);
      if (entry.description) setDescription(entry.description);
      
      if (entry.start_time) {
        const start = new Date(entry.start_time);
        setStartTime(start.toTimeString().slice(0, 5));
        
        if (entry.end_time) {
          const end = new Date(entry.end_time);
          setEndTime(end.toTimeString().slice(0, 5));
          
          const durationMs = end.getTime() - start.getTime();
          const hours = Math.floor(durationMs / 3600000);
          const minutes = Math.floor((durationMs % 3600000) / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000);
          setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else if (entry.duration) {
          const hours = Math.floor(entry.duration / 3600);
          const minutes = Math.floor((entry.duration % 3600) / 60);
          const seconds = entry.duration % 60;
          setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          
          const endDate = new Date(start.getTime() + entry.duration * 1000);
          setEndTime(endDate.toTimeString().slice(0, 5));
        }
      }
    }
  }, [entry]);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '00:00:00';
    
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

  const handleStartChange = (value: string) => {
    setStartTime(value);
    const newDuration = calculateDuration(value, endTime);
    setDuration(newDuration);
    
    if (entry?.start_time) {
      const date = new Date(entry.start_time);
      const [hours, minutes] = value.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      
      const [dH, dM] = newDuration.split(':').map(Number);
      const newEndTime = new Date(date.getTime() + (dH * 3600 + dM * 60) * 1000);
      
      setFormData({ 
        ...formData, 
        start_time: date.toISOString(),
        end_time: newEndTime.toISOString(),
        duration: dH * 3600 + dM * 60
      });
    }
  };

  const handleEndChange = (value: string) => {
    setEndTime(value);
    const newDuration = calculateDuration(startTime, value);
    setDuration(newDuration);
    
    if (entry?.start_time) {
      const startDate = new Date(entry.start_time);
      const [hours, minutes] = value.split(':').map(Number);
      const endDate = new Date(startDate);
      endDate.setHours(hours, minutes, 0, 0);
      
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
      
      setFormData({ 
        ...formData, 
        end_time: endDate.toISOString(),
        duration: durationSeconds
      });
    }
  };

  const handleSave = () => {
    // Si c'est une création via la grille, s'assurer qu'on a bien initialisé les dates
    let finalData = { ...formData, description };

    if (mode === 'create' && (!finalData.start_time || !finalData.end_time)) {
       const today = new Date();
       const [startH, startM] = startTime.split(':').map(Number);
       const [endH, endM] = endTime.split(':').map(Number);
       
       const startDate = new Date(today);
       startDate.setHours(startH || 0, startM || 0, 0, 0);
       
       const endDate = new Date(startDate);
       endDate.setHours(endH || 0, endM || 0, 0, 0);
       if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

       const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

       finalData.start_time = startDate.toISOString();
       finalData.end_time = endDate.toISOString();
       finalData.duration = durationSeconds;
    }

    onSave(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-slate-900 font-bold text-sm">
            {mode === 'create' ? 'Nouvelle entrée' : 'Modifier l\'entrée'}
            {!isEditable && ' (Lecture seule)'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Tâche / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Que faites-vous ?"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mode === 'edit' && !isEditable}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mode === 'edit' && !isEditable}
              />
            </div>

            <div>
              <label className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleEndChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={mode === 'edit' && !isEditable}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Durée</label>
              <input
                type="text"
                value={duration}
                disabled
                className="w-full bg-slate-50 border border-slate-200 text-slate-400 px-3 py-2 rounded-xl text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={!isEditable}
                className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Supprimer
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={mode === 'edit' && !isEditable}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-light transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
