import { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, getDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskBlock } from './task-block';
import { Timesheet, TimerStatus } from '@/lib/timesheet-service';

interface TimeGridProps {
  currentWeek: Date;
  entries: Timesheet[];
  activeTimer: Timesheet | null;
  currentTimerDuration?: number;
  onBlockClick: (entry: Timesheet) => void;
  onBlockUpdate: (entry: Timesheet, newStartHour: number, newDurationHours: number) => void;
  onGridClick: (date: Date, startHour: number) => void;
}

// Time grid
export function TimeGrid({
  currentWeek,
  entries,
  activeTimer,
  currentTimerDuration,
  onBlockClick,
  onBlockUpdate,
  onGridClick,
}: TimeGridProps) {
  const PIXELS_PER_HOUR = 50;
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const DAYS = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const containerRef = useRef<HTMLDivElement>(null);
  const [nowDate, setNowDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNowDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Récupère day index
  const getDayIndex = (dateString: string) => {
    let day = getDay(new Date(dateString)) - 1;
    if (day === -1) day = 6;
    return day;
  };

  // Récupère start hour
  const getStartHour = (dateString: string) => {
    const date = new Date(dateString);
    return date.getHours() + date.getMinutes() / 60;
  };

  // Récupère duration hours
  const getDurationHours = (durationSeconds: number) => durationSeconds / 3600;

  // Vérifie si editable
  const isEditable = (dateString: string) => {
    const entryDate = new Date(dateString);
    entryDate.setHours(0, 0, 0, 0);
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 7);
    limitDate.setHours(0, 0, 0, 0);
    return entryDate >= limitDate;
  };

  // Gère grid click
  const handleGridClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    if ((e.target as HTMLElement).closest('.absolute.rounded-lg')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // 60px est la largeur de la colonne des heures
    const y = e.clientY - rect.top;

    if (x < 0) return; // Clic sur la colonne des heures

    const dayWidth = (rect.width - 60) / 7;
    const dayIndex = Math.floor(x / dayWidth);
    
    if (dayIndex >= 0 && dayIndex < 7) {
      const clickedDate = addDays(weekStart, dayIndex);
      const clickedHour = Math.floor(y / PIXELS_PER_HOUR);
      
      onGridClick(clickedDate, clickedHour);
    }
  };

  // Récupère entry chunks
  const getEntryChunks = (entry: Timesheet, isActive: boolean, durationSeconds: number) => {
    const chunks: Array<{
      key: string;
      entry: Timesheet & { isActive: boolean };
      dayIndex: number;
      startHour: number;
      durationHours: number;
      isEditable: boolean;
      isDraggable: boolean;
    }> = [];

    const entryStart = new Date(entry.start_time).getTime();
    const entryEnd = entryStart + durationSeconds * 1000;
    
    const startDateStr = format(new Date(entryStart), 'yyyy-MM-dd');
    const endDateStr = format(new Date(entryEnd), 'yyyy-MM-dd');
    const isMultiDay = startDateStr !== endDateStr;

    DAYS.forEach((day, index) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayStartMs = dayStart.getTime();
      const dayEndMs = dayStartMs + 24 * 3600 * 1000;

      const overlapStart = Math.max(entryStart, dayStartMs);
      const overlapEnd = Math.min(entryEnd, dayEndMs);

      if (overlapStart < overlapEnd) {
        const startHour = (overlapStart - dayStartMs) / (3600 * 1000);
        const durationHours = (overlapEnd - overlapStart) / (3600 * 1000);

        chunks.push({
          key: `${entry.id}-${index}-${isActive ? 'active' : 'stopped'}`,
          entry: { ...entry, isActive },
          dayIndex: index,
          startHour,
          durationHours,
          isEditable: !isActive && isEditable(entry.start_time),
          isDraggable: !isActive && !isMultiDay,
        });
      }
    });

    return chunks;
  };

  // Récupère day total duration
  const getDayTotalDuration = (day: Date) => {
    let totalSeconds = 0;
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayStartMs + 24 * 3600 * 1000;

    entries.forEach((entry) => {
      if (activeTimer?.id === entry.id) return;
      const entryStart = new Date(entry.start_time).getTime();
      const durationSeconds = entry.duration;
      const entryEnd = entryStart + durationSeconds * 1000;

      const overlapStart = Math.max(entryStart, dayStartMs);
      const overlapEnd = Math.min(entryEnd, dayEndMs);

      if (overlapStart < overlapEnd) {
        totalSeconds += Math.round((overlapEnd - overlapStart) / 1000);
      }
    });

    if (activeTimer) {
      const entryStart = new Date(activeTimer.start_time).getTime();
      const durationSeconds = currentTimerDuration ?? activeTimer.duration;
      const entryEnd = entryStart + durationSeconds * 1000;

      const overlapStart = Math.max(entryStart, dayStartMs);
      const overlapEnd = Math.min(entryEnd, dayEndMs);

      if (overlapStart < overlapEnd) {
        totalSeconds += Math.round((overlapEnd - overlapStart) / 1000);
      }
    }

    return totalSeconds;
  };

  // Formate total time
  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Formate total time short
  const formatTotalTimeShort = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* En-tête des jours */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20">
        <div className="w-[60px] shrink-0 border-r border-slate-100" />
        {DAYS.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const totalDuration = getDayTotalDuration(day);
          return (
            <div
              key={i}
              className={`flex-1 py-3 text-center border-r border-slate-100 last:border-r-0 ${
                isToday ? 'bg-accent/5' : ''
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-accent' : 'text-slate-400'}`}>
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className={`text-xl font-black ${isToday ? 'text-accent' : 'text-slate-900'}`}>
                {format(day, 'd')}
              </div>
              <div className={`text-[9px] sm:text-[11px] md:text-[12px] font-mono font-bold mt-1 ${totalDuration > 0 ? 'text-accent/80' : 'text-slate-400'} truncate px-0.5`}>
                <span className="hidden sm:inline">{formatTotalTime(totalDuration)}</span>
                <span className="inline sm:hidden">{formatTotalTimeShort(totalDuration)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grille des heures */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide" ref={containerRef} onClick={handleGridClick}>
        <div className="relative" style={{ height: 24 * PIXELS_PER_HOUR }}>
          {/* Lignes horizontales pour chaque heure */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex border-b border-slate-200"
              style={{ top: hour * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}
            >
              <div className="w-[60px] shrink-0 text-right pr-3 -mt-2.5 text-xs font-bold text-slate-400 border-r border-slate-100 bg-white z-10">
                {hour === 0 ? '' : `${hour}:00`}
              </div>
              {DAYS.map((day, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r border-slate-200 border-dashed last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-accent/[0.02]' : ''}`}
                />
              ))}
            </div>
          ))}

          {/* Ligne pointillée de l'heure actuelle (si c'est la semaine courante) */}
          {isSameDay(weekStart, startOfWeek(nowDate, { weekStartsOn: 1 })) && (() => {
            const dayIndex = getDayIndex(nowDate.toISOString());
            return (
              <div
                className="absolute border-b-2 border-accent/50 border-dashed z-20 pointer-events-none"
                style={{
                  top: (nowDate.getHours() + nowDate.getMinutes() / 60) * PIXELS_PER_HOUR,
                  left: `calc(60px + (${dayIndex} / 7) * (100% - 60px))`,
                  width: `calc((100% - 60px) / 7)`,
                }}
              >
                <div 
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-accent" 
                />
              </div>
            );
          })()}

          {/* Blocs de tâches (entrées historiques) */}
          {entries
            .filter((e) => e.status === TimerStatus.STOPPED || activeTimer?.id !== e.id)
            .flatMap((entry) => getEntryChunks(entry, false, entry.duration))
            .map((chunk) => (
              <TaskBlock
                key={chunk.key}
                entry={chunk.entry}
                pixelsPerHour={PIXELS_PER_HOUR}
                dayIndex={chunk.dayIndex}
                startHour={chunk.startHour}
                durationHours={chunk.durationHours}
                onClick={() => onBlockClick(chunk.entry)}
                onUpdate={(newStart, newDuration) => onBlockUpdate(chunk.entry, newStart, newDuration)}
                isEditable={chunk.isEditable}
                isDraggable={chunk.isDraggable}
              />
            ))}

          {/* Bloc de la tâche active */}
          {activeTimer && getEntryChunks(activeTimer, true, currentTimerDuration ?? activeTimer.duration).map((chunk) => (
            <TaskBlock
              key={chunk.key}
              entry={chunk.entry}
              pixelsPerHour={PIXELS_PER_HOUR}
              dayIndex={chunk.dayIndex}
              startHour={chunk.startHour}
              durationHours={chunk.durationHours}
              onClick={() => {}}
              isEditable={false}
              isDraggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
