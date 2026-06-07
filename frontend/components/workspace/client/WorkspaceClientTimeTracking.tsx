'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, addWeeks, addMonths, addYears,
  isSameDay, eachDayOfInterval, isWithinInterval,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Users, ChevronDown, Calendar, CircleX } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { timesheetService, ReportData } from '@/lib/timesheet-service';
import { matchService } from '@/lib/match-service';
import { toast } from 'sonner';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
  '#06b6d4', '#a855f7', '#d946ef', '#0ea5e9', '#22c55e',
];

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'custom';

// Formate hours
function formatHours(hours: number): string {
  const h = Math.floor(Math.abs(hours));
  const m = Math.floor((Math.abs(hours) - h) * 60);
  const s = Math.round(((Math.abs(hours) - h) * 60 - m) * 60);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Add days
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Period selector
function PeriodSelector({
  isOpen, onClose, onSelectPeriod, currentPeriodType, buttonRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (type: PeriodType, start?: Date, end?: Date) => void;
  currentPeriodType: PeriodType;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Gère click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        if (customStart && customEnd) onSelectPeriod('custom', customStart, customEnd);
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, buttonRef, customStart, customEnd, onSelectPeriod]);

  if (!isOpen) return null;

  const shortcuts = [
    { label: "Aujourd'hui", value: 'day' },
    { label: 'Cette semaine', value: 'week' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Cette année', value: 'year' },
    { label: 'Semaine dernière', value: 'last_week' },
    { label: 'Mois dernier', value: 'last_month' },
  ];

  // Gère shortcut click
  const handleShortcutClick = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'day':     onSelectPeriod('day', now, now); break;
      case 'week':    onSelectPeriod('week'); break;
      case 'month':   onSelectPeriod('month'); break;
      case 'year':    onSelectPeriod('year'); break;
      case 'last_week': {
        const s = startOfWeek(addWeeks(now, -1), { weekStartsOn: 1 });
        const e = endOfWeek(addWeeks(now, -1), { weekStartsOn: 1 });
        onSelectPeriod('custom', s, e); break;
      }
      case 'last_month': {
        const s = startOfMonth(addMonths(now, -1));
        const e = endOfMonth(addMonths(now, -1));
        onSelectPeriod('custom', s, e); break;
      }
    }
    onClose();
  };

  // Render calendar
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    // Gère day click
    const handleDayClick = (day: Date) => {
      if (!customStart || (customStart && customEnd)) {
        setCustomStart(day); setCustomEnd(null);
      } else {
        if (day < customStart) { setCustomEnd(customStart); setCustomStart(day); }
        else { setCustomEnd(day); }
      }
    };

    // Vérifie si in range
    const isInRange = (day: Date) => {
      if (!customStart) return false;
      if (!customEnd) return isSameDay(day, customStart);
      return isWithinInterval(day, { start: customStart, end: customEnd });
    };

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft size={14} className="text-slate-600" />
          </button>
          <span className="text-slate-900 font-bold text-xs">
            {format(currentMonth, 'MMM yyyy', { locale: fr })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1.5 px-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-slate-400 font-bold py-1">{d}</div>
          ))}
        </div>

        <div className="space-y-0.5 px-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-0.5">
              {week.map((day, di) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const inRange = isInRange(day);
                const isStart = customStart && isSameDay(day, customStart);
                const isEnd = customEnd && isSameDay(day, customEnd);
                return (
                  <button
                    key={di}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square flex items-center justify-center text-[10px] rounded-lg transition font-medium
                      ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                      ${inRange && !isStart && !isEnd ? 'bg-accent/10' : 'hover:bg-slate-100'}
                      ${isStart ? 'bg-accent text-white hover:bg-accent' : ''}
                      ${isEnd ? 'bg-accent text-white hover:bg-accent' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {customStart && customEnd && (
          <div className="mt-3 px-1">
            <button
              onClick={() => { onSelectPeriod('custom', customStart, customEnd); onClose(); }}
              className="w-full py-2 bg-accent hover:bg-accent/90 rounded-xl text-white text-[10px] font-bold transition shadow-sm"
            >
              {format(customStart, 'dd MMM')} – {format(customEnd, 'dd MMM')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden w-[280px] sm:w-[420px] max-w-[calc(100vw-2rem)]"
    >
      <div className="flex flex-col sm:flex-row h-[380px] sm:h-[290px]">
        {/* Raccourcis */}
        <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-100 p-2 overflow-x-auto sm:overflow-y-auto">
          <div className="flex flex-row sm:flex-col gap-1 min-w-max sm:min-w-0">
            {shortcuts.map((s) => (
              <button
                key={s.value}
                onClick={() => handleShortcutClick(s.value)}
                className={`whitespace-nowrap sm:whitespace-normal w-auto sm:w-full text-left px-3 py-2 rounded-xl transition text-xs font-medium ${
                  s.value === currentPeriodType
                    ? 'bg-accent/10 text-accent'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {/* Calendrier */}
        <div className="flex-1 p-3 flex flex-col">{renderCalendar()}</div>
      </div>
    </div>
  );
}

// Workspace client time tracking
export default function WorkspaceClientTimeTracking() {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [offset, setOffset] = useState(0);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const periodSelectorButtonRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [selectedCollabId, setSelectedCollabId] = useState<string>('');
  const [isCollabDropdownOpen, setIsCollabDropdownOpen] = useState(false);
  const collabDropdownRef = useRef<HTMLDivElement>(null);

  const { periodStart, periodEnd, displayText } = useMemo(() => {
    const now = new Date();

    if (periodType === 'custom' && customStart && customEnd) {
      return {
        periodStart: customStart,
        periodEnd: customEnd,
        displayText: `${format(customStart, 'dd MMM')} – ${format(customEnd, 'dd MMM')}`,
      };
    }

    switch (periodType) {
      case 'day': {
        const day = addDays(now, offset);
        return { periodStart: day, periodEnd: day, displayText: format(day, 'dd MMM yyyy', { locale: fr }) };
      }
      case 'week': {
        const ws = startOfWeek(addWeeks(now, offset), { weekStartsOn: 1 });
        const we = endOfWeek(ws, { weekStartsOn: 1 });
        return {
          periodStart: ws, periodEnd: we,
          displayText: `${format(ws, 'dd MMM')} – ${format(we, 'dd MMM')} • S${format(ws, 'w')}`,
        };
      }
      case 'month': {
        const month = addMonths(now, offset);
        return { periodStart: startOfMonth(month), periodEnd: endOfMonth(month), displayText: format(month, 'MMM yyyy', { locale: fr }) };
      }
      case 'year': {
        const year = addYears(now, offset);
        return { periodStart: startOfYear(year), periodEnd: endOfYear(year), displayText: format(year, 'yyyy') };
      }
      default: {
        const ws = startOfWeek(now, { weekStartsOn: 1 });
        const we = endOfWeek(now, { weekStartsOn: 1 });
        return { periodStart: ws, periodEnd: we, displayText: 'Cette semaine' };
      }
    }
  }, [periodType, offset, customStart, customEnd]);

  // Gère select period
  const handleSelectPeriod = (type: PeriodType, start?: Date, end?: Date) => {
    setPeriodType(type);
    setOffset(0);
    if (type === 'custom' && start && end) { setCustomStart(start); setCustomEnd(end); }
    setIsPeriodSelectorOpen(false);
  };

  useEffect(() => { fetchCollaborators(); }, []);

  useEffect(() => {
    if (selectedCollabId) fetchReport(periodStart, periodEnd, selectedCollabId);
    else setReportData(null);
  }, [periodStart, periodEnd, selectedCollabId]);

  // Fetch collaborators
  const fetchCollaborators = async () => {
    try {
      const data = await matchService.getClientMatches();
      const inWorkspace = data.filter((m: any) => m.status === 'in_workspace');
      setCollaborators(inWorkspace);
      if (inWorkspace.length > 0) setSelectedCollabId(inWorkspace[0].candidate_id);
    } catch { toast.error('Erreur lors du chargement des collaborateurs'); }
  };

  // Fetch report
  const fetchReport = async (start: Date, end: Date, collabId: string) => {
    setLoading(true);
    try {
      const data = await timesheetService.getReport({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        user_id: collabId,
      });
      setReportData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement du rapport');
    } finally { setLoading(false); }
  };

  const dailyData = useMemo(() => {
    if (!reportData) return [];

    if (periodType === 'day' || periodType === 'week' || periodType === 'custom') {
      const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
      return days.map((day) => {
        const dayString = format(day, 'yyyy-MM-dd');
        const dayData = reportData.byDay.find((d) => d.day === dayString);
        const hours = dayData?.hours || 0;
        return {
          day: format(day, 'EEE', { locale: fr }),
          date: format(day, 'dd/MM'),
          hours,
          formattedTime: formatHours(hours),
          isToday: isSameDay(day, new Date()),
        };
      });
    }

    if (periodType === 'month') {
      const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
      const weekMap = new Map<string, { hours: number; days: Date[] }>();
      days.forEach((day) => {
        const ws = startOfWeek(day, { weekStartsOn: 1 });
        const key = format(ws, 'yyyy-MM-dd');
        const existing = weekMap.get(key) || { hours: 0, days: [] };
        const dayData = reportData.byDay.find((d) => d.day === format(day, 'yyyy-MM-dd'));
        existing.hours += dayData?.hours || 0;
        existing.days.push(day);
        weekMap.set(key, existing);
      });
      return Array.from(weekMap.entries()).map(([key, val]) => ({
        day: `S${format(new Date(key), 'w')}`,
        date: format(new Date(key), 'dd/MM'),
        hours: val.hours,
        formattedTime: formatHours(val.hours),
        isToday: val.days.some((d) => isSameDay(d, new Date())),
      }));
    }

    const monthMap = new Map<string, number>();
    reportData.byDay.forEach((d) => {
      const monthKey = d.day.slice(0, 7); // 'yyyy-MM'
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + d.hours);
    });
    return Array.from(monthMap.entries())
      .sort()
      .map(([key, hours]) => {
        const date = new Date(key + '-01');
        return {
          day: format(date, 'MMM', { locale: fr }),
          date: format(date, 'MM/yyyy'),
          hours,
          formattedTime: formatHours(hours),
          isToday: format(new Date(), 'yyyy-MM') === key,
        };
      });
  }, [reportData, periodStart, periodEnd, periodType]);

  const pieData = useMemo(() => {
    if (!reportData?.byDescription) return [];
    return reportData.byDescription.map((item) => ({
      name: item.description || 'Sans description',
      value: item.hours,
      percentage: item.percentage,
    }));
  }, [reportData]);

  const averageDailyHours = useMemo(() => {
    const daysWithData = dailyData.filter((d) => d.hours > 0).length;
    const total = dailyData.reduce((sum, d) => sum + d.hours, 0);
    return daysWithData > 0 ? total / daysWithData : 0;
  }, [dailyData]);

  // Custom bar tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
          <p className="text-slate-900 text-xs font-bold">{payload[0].payload.day} {payload[0].payload.date}</p>
          <p className="text-accent font-mono text-xs mt-1">{payload[0].payload.formattedTime}</p>
        </div>
      );
    }
    return null;
  };

  // Custom pie tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
          <p className="text-slate-900 text-xs font-bold">{payload[0].payload.name}</p>
          <p className="text-accent font-mono text-xs mt-1">{formatHours(payload[0].value)}</p>
          <p className="text-slate-400 text-[10px] mt-0.5">{payload[0].payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const selectedCollab = collaborators.find((c) => c.candidate_id === selectedCollabId);
  const selectedPhotoUrl = selectedCollab?.candidate?.candidate?.photo_url;
  const selectedName = selectedCollab
    ? `${selectedCollab.candidate.first_name} ${selectedCollab.candidate.last_name}`
    : null;

  useEffect(() => {
    if (!isCollabDropdownOpen) return;
    // Gère click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (collabDropdownRef.current && !collabDropdownRef.current.contains(e.target as Node)) {
        setIsCollabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollabDropdownOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end mb-6">

          {/* Collaborateur — dropdown custom avec photos */}
          <div className="w-full md:w-auto min-w-[260px]" ref={collabDropdownRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Collaborateur
            </label>
            <div className="relative">
              {/* Bouton déclencheur */}
              <button
                type="button"
                onClick={() => setIsCollabDropdownOpen((o) => !o)}
                className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-accent px-3 py-2.5 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              >
                {selectedPhotoUrl ? (
                  <img src={selectedPhotoUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
                <span className="flex-1 text-left truncate">
                  {selectedName ?? 'Choisir un collaborateur...'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCollabDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Liste déroulante */}
              {isCollabDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-52 overflow-y-auto py-1">
                    {collaborators.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center">Aucun collaborateur</div>
                    ) : (
                      collaborators.map((c) => {
                        const photo = c.candidate?.candidate?.photo_url;
                        const name = `${c.candidate.first_name} ${c.candidate.last_name}`;
                        const isSelected = c.candidate_id === selectedCollabId;
                        return (
                          <button
                            key={c.candidate_id}
                            type="button"
                            onClick={() => { setSelectedCollabId(c.candidate_id); setIsCollabDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                              isSelected
                                ? 'bg-accent/8 text-accent font-bold'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            {photo ? (
                              <img src={photo} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent/20 to-accent/10 flex items-center justify-center shrink-0 ring-2 ring-slate-100">
                                <span className="text-accent font-black text-[11px]">
                                  {c.candidate.first_name?.[0]}{c.candidate.last_name?.[0]}
                                </span>
                              </div>
                            )}
                            <span className="truncate">{name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation de période */}
          <div className="flex flex-wrap items-center gap-2 relative">
            {/* Flèche précédente */}
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Bouton période cliquable */}
            <div
              ref={periodSelectorButtonRef}
              onClick={() => setIsPeriodSelectorOpen(!isPeriodSelectorOpen)}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-all"
            >
              <Calendar className="text-accent shrink-0" size={14} />
              <span className="text-slate-900 text-xs font-bold truncate max-w-[160px] sm:max-w-none">
                {displayText}
              </span>
            </div>

            {/* PeriodSelector popup */}
            <PeriodSelector
              isOpen={isPeriodSelectorOpen}
              onClose={() => setIsPeriodSelectorOpen(false)}
              onSelectPeriod={handleSelectPeriod}
              currentPeriodType={periodType}
              buttonRef={periodSelectorButtonRef}
            />

            {/* Flèche suivante */}
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-100 transition-all"
            >
              <ChevronRight size={16} />
            </button>

            {/* Sélecteur de type de période */}
            <select
              value={periodType}
              onChange={(e) => { setPeriodType(e.target.value as PeriodType); setOffset(0); }}
              className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all appearance-none"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
              <option value="year">Année</option>
            </select>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Heures totales</p>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatHours(reportData?.totalHours || 0)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Moyenne / jour</p>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatHours(averageDailyHours)}
            </p>
          </div>
        </div>
      </div>

      {/* États vides / chargement */}
      {!selectedCollabId ? (
        <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun collaborateur sélectionné</h3>
          <p className="text-slate-500">Veuillez sélectionner un collaborateur pour voir son rapport d'heures.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !reportData || reportData.totalDuration === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
            <CircleX className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500">Ce collaborateur n'a pas enregistré de temps sur cette période.</p>
        </div>
      ) : (
        <>
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphe à barres */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] p-6 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Durée par jour</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(v) => `${v}h`}
                    width={32}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 8 }} />
                  <Bar dataKey="hours" radius={[8, 8, 4, 4]} maxBarSize={48}>
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isToday ? '#4f46e5' : (entry.hours > 0 ? '#6366f1' : '#e2e8f0')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Camembert */}
            <div className="col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] p-6 flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Temps par tâche</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 overflow-y-auto max-h-[140px] pr-1">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-600 truncate text-[11px]">{item.name}</span>
                    </div>
                    <span className="text-slate-900 font-bold text-[11px] ml-2 shrink-0">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900">Détail des sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tâche</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Horaires</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 border-b border-slate-50">
                        <div className="font-bold text-sm text-slate-900">
                          {format(new Date(entry.date), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-slate-50">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {entry.description || <span className="italic opacity-40">Sans description</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-slate-50">
                        <div className="text-xs font-mono text-slate-500 bg-slate-100 inline-flex px-2.5 py-1 rounded-lg">
                          {format(new Date(entry.startTime), 'HH:mm')} – {entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'En cours'}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-slate-50 text-right">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          {entry.hours.toFixed(2)}h
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80">
                    <td className="py-4 px-6 font-black text-sm text-slate-900">TOTAL</td>
                    <td className="py-4 px-6" />
                    <td className="py-4 px-6" />
                    <td className="py-4 px-6 text-right font-black font-mono text-slate-900">
                      {formatHours(reportData.totalHours)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
