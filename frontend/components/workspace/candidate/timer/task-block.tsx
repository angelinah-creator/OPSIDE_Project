import { useState, useRef, useEffect } from 'react';

interface TaskBlockProps {
  entry: any;
  pixelsPerHour: number;
  dayIndex: number;
  startHour: number;
  durationHours: number;
  onClick: () => void;
  onUpdate?: (newStartHour: number, newDurationHours: number) => void;
  isEditable?: boolean;
}

export function TaskBlock({
  entry,
  pixelsPerHour,
  dayIndex,
  startHour,
  durationHours,
  onClick,
  onUpdate,
  isEditable = true,
}: TaskBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [tempStartHour, setTempStartHour] = useState(startHour);
  const [tempDuration, setTempDuration] = useState(durationHours);
  const taskRef = useRef<HTMLDivElement>(null);
  
  const isActive = entry.isActive;

  useEffect(() => {
    if (!isDragging && !isResizing) {
      setTempStartHour(startHour);
      setTempDuration(durationHours);
    }
  }, [startHour, durationHours, isDragging, isResizing]);

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize-top' | 'resize-bottom', initialStart: number, initialDuration: number) => {
    e.stopPropagation();
    if (!isEditable || isActive) return;

    const startY = e.clientY;
    let hasMoved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      if (Math.abs(deltaY) > 5) {
        if (type === 'drag') setIsDragging(true);
        else setIsResizing(true);
        hasMoved = true;
      }

      const deltaHours = deltaY / pixelsPerHour;

      if (type === 'drag') {
        let newStart = Math.max(0, initialStart + deltaHours);
        if (newStart + initialDuration > 24) newStart = 24 - initialDuration;
        setTempStartHour(Math.round(newStart * 4) / 4);
      } else if (type === 'resize-bottom') {
        const newDuration = Math.max(0.25, initialDuration + deltaHours);
        const maxDuration = 24 - initialStart;
        setTempDuration(Math.round(Math.min(newDuration, maxDuration) * 4) / 4);
      } else if (type === 'resize-top') {
        let newStart = Math.max(0, initialStart + deltaHours);
        let newDuration = initialDuration - (newStart - initialStart);

        if (newDuration < 0.25) {
          newDuration = 0.25;
          newStart = initialStart + initialDuration - 0.25;
        }
        
        const roundedStart = Math.round(newStart * 4) / 4;
        const roundedDuration = Math.round(newDuration * 4) / 4;
        
        setTempStartHour(roundedStart);
        setTempDuration(roundedDuration);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      if (!hasMoved) {
        setIsDragging(false);
        setIsResizing(false);
        return; // Ce n'était qu'un clic
      }

      setTempStartHour((currentStart) => {
        setTempDuration((currentDuration) => {
          if ((currentStart !== initialStart || currentDuration !== initialDuration) && onUpdate) {
            onUpdate(currentStart, currentDuration);
          }
          return currentDuration;
        });
        return currentStart;
      });

      // Délai court pour bloquer le onClick juste après le relâchement
      setTimeout(() => {
        setIsDragging(false);
        setIsResizing(false);
      }, 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0
      ? `${hours}h${minutes.toString().padStart(2, "0")}m`
      : `${minutes}m`;
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging || isResizing) return;
    onClick();
  };

  return (
    <div
      ref={taskRef}
      onClick={handleBlockClick}
      onMouseDown={isEditable && !isActive ? (e) => handleMouseDown(e, 'drag', tempStartHour, tempDuration) : undefined}
      className={`absolute rounded-lg px-2 py-1 text-xs transition-all select-none border shadow-sm ${
        isActive
          ? 'bg-accent text-white border-accent cursor-default shadow-accent/20'
          : isEditable
            ? 'bg-accent/10 border-accent/20 text-accent cursor-move hover:bg-accent/20'
            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
      } ${isDragging || isResizing ? 'opacity-90 z-50 shadow-md scale-[1.02]' : 'z-10'}`}
      style={{
        left: `calc(60px + ${dayIndex} * (100% - 60px) / 7 + 4px)`,
        top: tempStartHour * pixelsPerHour,
        height: Math.max(tempDuration * pixelsPerHour, 24),
        width: `calc((100% - 60px) / 7 - 8px)`,
        userSelect: 'none',
      }}
    >
      {isEditable && !isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-accent/30 active:bg-accent/40 transition-colors rounded-t-lg"
          onMouseDown={(e) => handleMouseDown(e, 'resize-top', tempStartHour, tempDuration)}
        />
      )}

      <div 
        className="font-bold truncate h-full flex flex-col justify-start overflow-hidden pointer-events-none"
      >
        <div className="truncate leading-tight mt-0.5">{entry.description || 'Sans description'}</div>
        <div className="text-[10px] mt-0.5 font-mono opacity-80">{formatDuration(entry.duration)}</div>
      </div>

      {isEditable && !isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-accent/30 active:bg-accent/40 transition-colors rounded-b-lg"
          onMouseDown={(e) => handleMouseDown(e, 'resize-bottom', tempStartHour, tempDuration)}
        />
      )}

      {!isEditable && (
        <div className="absolute inset-0 bg-slate-50/30 rounded-lg pointer-events-none" title="Entrée trop ancienne" />
      )}
    </div>
  );
}
