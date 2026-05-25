'use client';

import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Play, Square, Pause, Calendar, Clock, Plus } from 'lucide-react';
import { TimeGrid } from './timer/time-grid';
import { TaskPopup } from './timer/task-popup';
import { timesheetService, Timesheet, TimerStatus } from '@/lib/timesheet-service';
import { toast } from 'sonner';

export default function WorkspaceTimeTracking({ matchId }: { matchId: string }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [entries, setEntries] = useState<Timesheet[]>([]);
  const [activeTimer, setActiveTimer] = useState<Timesheet | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Partial<Timesheet> | null>(null);
  const [popupMode, setPopupMode] = useState<'create' | 'edit'>('create');
  const [currentTaskInput, setCurrentTaskInput] = useState('');
  const [currentTime, setCurrentTime] = useState<number>(0); // Durée active en secondes
  const [loading, setLoading] = useState(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Charger les données initiales
  useEffect(() => {
    fetchActiveTimer();
    fetchEntries(currentWeek);
  }, [matchId, currentWeek]);

  // Mettre à jour le chronomètre actif chaque seconde
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.status === TimerStatus.RUNNING) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.start_time).getTime();
        const now = new Date().getTime();
        setCurrentTime(activeTimer.duration + Math.floor((now - start) / 1000));
      }, 1000);
    } else if (activeTimer && activeTimer.status === TimerStatus.PAUSED) {
      setCurrentTime(activeTimer.duration);
    } else {
      setCurrentTime(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchActiveTimer = async () => {
    try {
      const active = await timesheetService.getActive();
      setActiveTimer(active);
      if (active.description) setCurrentTaskInput(active.description);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Erreur lors de la récupération du chronomètre');
      } else {
        setActiveTimer(null);
      }
    }
  };

  const fetchEntries = async (week: Date) => {
    try {
      setLoading(true);
      const start = startOfWeek(week, { weekStartsOn: 1 }).toISOString();
      const end = addWeeks(startOfWeek(week, { weekStartsOn: 1 }), 1).toISOString();
      
      const data = await timesheetService.getEntries(matchId, start, end);
      setEntries(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des temps');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async () => {
    if (activeTimer) {
      if (activeTimer.status === TimerStatus.PAUSED) {
        try {
          const updated = await timesheetService.resume();
          setActiveTimer(updated);
          toast.success('Chronomètre repris');
        } catch {
          toast.error('Erreur lors de la reprise');
        }
      }
      return;
    }

    try {
      const newTimer = await timesheetService.start({
        match_id: matchId,
        description: currentTaskInput || undefined,
      });
      setActiveTimer(newTimer);
      toast.success('Chronomètre démarré');
      fetchEntries(currentWeek);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  const handlePauseTimer = async () => {
    if (!activeTimer || activeTimer.status !== TimerStatus.RUNNING) return;
    try {
      const updated = await timesheetService.pause();
      setActiveTimer(updated);
      toast.success('Chronomètre en pause');
    } catch {
      toast.error('Erreur lors de la mise en pause');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      await timesheetService.stop();
      setActiveTimer(null);
      setCurrentTaskInput('');
      toast.success('Temps enregistré');
      fetchEntries(currentWeek);
    } catch {
      toast.error("Erreur lors de l'arrêt du chronomètre");
    }
  };

  const handleCreateManualEntry = () => {
    setSelectedEntry({ match_id: matchId });
    setPopupMode('create');
    setIsPopupOpen(true);
  };

  const handleGridClick = (date: Date, startHour: number) => {
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startHour + 1, 0, 0, 0);

    setSelectedEntry({
      match_id: matchId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 3600,
    });
    setPopupMode('create');
    setIsPopupOpen(true);
  };

  const handleSaveEntry = async (data: Partial<Timesheet>) => {
    try {
      if (popupMode === 'create') {
        await timesheetService.createEntry({ ...data, match_id: matchId });
        toast.success('Entrée créée avec succès');
      } else if (popupMode === 'edit' && selectedEntry?.id) {
        await timesheetService.updateEntry(selectedEntry.id, data);
        toast.success('Entrée mise à jour');
      }
      setIsPopupOpen(false);
      fetchEntries(currentWeek);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry?.id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;
    
    try {
      await timesheetService.deleteEntry(selectedEntry.id);
      toast.success('Entrée supprimée');
      setIsPopupOpen(false);
      fetchEntries(currentWeek);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleBlockUpdate = async (entry: Timesheet, newStartHour: number, newDurationHours: number) => {
    const startDate = new Date(entry.start_time);
    const startH = Math.floor(newStartHour);
    const startM = Math.round((newStartHour - startH) * 60);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(startDate.getTime() + newDurationHours * 3600000);
    
    try {
      await timesheetService.updateEntry(entry.id, {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration: Math.round(newDurationHours * 3600),
      });
      fetchEntries(currentWeek);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      fetchEntries(currentWeek); // Recharger pour annuler le drag visuel
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCurrentWeek = isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 });

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6 pb-6">
      {/* Header : Timer + Semaine */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Contrôles du chronomètre */}
        <div className="bg-white rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-4 border border-slate-100 shadow-sm flex-1 w-full lg:w-auto">
          <div className="flex-1 w-full sm:w-auto relative">
            <input
              type="text"
              placeholder="Sur quoi travaillez-vous ?"
              value={currentTaskInput}
              onChange={(e) => setCurrentTaskInput(e.target.value)}
              disabled={!!activeTimer}
              className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl px-6 py-4 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all font-bold placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
            />
            {activeTimer && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-black text-accent uppercase tracking-widest">En cours</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-start px-2 sm:px-0">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight w-32 text-center">
              {formatTime(currentTime)}
            </div>

            <div className="flex gap-2">
              {!activeTimer || activeTimer.status === TimerStatus.PAUSED ? (
                <button
                  onClick={handleStartTimer}
                  className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center hover:bg-accent-light transition-all shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 active:scale-95"
                >
                  <Pause className="w-6 h-6 fill-current" />
                </button>
              )}

              {activeTimer && (
                <button
                  onClick={handleStopTimer}
                  className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-95"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Semaine */}
        <div className="flex items-center gap-4 bg-white rounded-3xl p-2 border border-slate-100 shadow-sm shrink-0">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div 
            className="flex flex-col items-center min-w-[140px] relative hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch (e) {
                // Fallback pour les anciens navigateurs
                dateInputRef.current?.focus();
              }
            }}
          >
            <div className="flex items-center gap-2 mb-0.5 pointer-events-none">
              <Calendar className="w-3 h-3 text-slate-400 group-hover:text-accent transition-colors" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-accent transition-colors">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMMM', { locale: fr })}
              </span>
            </div>
            <span className="text-sm font-black text-slate-900 group-hover:text-accent transition-colors pointer-events-none">
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd')} - {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'dd')}
            </span>
            <input
              ref={dateInputRef}
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full -z-10"
              value={format(currentWeek, 'yyyy-MM-dd')}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentWeek(new Date(e.target.value));
                }
              }}
            />
          </div>

          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            disabled={isCurrentWeek}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Grille */}
      <div className="relative flex-1 min-h-0">
        {loading && entries.length === 0 && (
          <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <TimeGrid
          currentWeek={currentWeek}
          entries={entries}
          activeTimer={activeTimer}
          currentTimerDuration={currentTime}
          onBlockClick={(entry) => {
            setSelectedEntry(entry);
            setPopupMode('edit');
            setIsPopupOpen(true);
          }}
          onBlockUpdate={handleBlockUpdate}
          onGridClick={handleGridClick}
        />
      </div>

      {/* Popup Edition/Création */}
      <TaskPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        mode={popupMode}
        isEditable={
          popupMode === 'create' || 
          (selectedEntry?.start_time ? new Date(selectedEntry.start_time) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : true)
        }
      />
    </div>
  );
}
