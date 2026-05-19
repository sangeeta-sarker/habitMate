// This file uses Apache 2.0 license 
import { useMemo } from 'react';
import { format, addDays, startOfYear, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';
import { useTime } from '../lib/timeContext';

interface HeatmapProps {
  data: { date: string; percentage: number }[];
}

export function Heatmap({ data }: HeatmapProps) {
  const { now } = useTime();


  const days = useMemo(() => {
    const start = startOfYear(now);
    return Array.from({ length: 365 }, (_, i) => addDays(start, i));
  }, [now]);

  const getColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 25) return 'bg-emerald-100';
    if (percentage < 50) return 'bg-emerald-300';
    if (percentage < 75) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="flex flex-col gap-4 overflow-x-auto p-8 bg-white rounded-[32px] shadow-sm border border-gray-100">
      <div className="flex gap-[2px]" style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: '3px' }}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const entry = data.find((d) => d.date === dateStr);
          const percentage = entry?.percentage || 0;
          const isToday = isSameDay(day, now);

          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${percentage}%`}
              className={cn(
                "heatmap-cell transition-all duration-300",
                getColor(percentage),
                isToday && "ring-2 ring-indigo-500 ring-offset-1 z-10 scale-125 shadow-lg"
              )}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-400 border-t pt-4">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="heatmap-cell bg-gray-200" />
            <div className="heatmap-cell bg-emerald-100" />
            <div className="heatmap-cell bg-emerald-300" />
            <div className="heatmap-cell bg-emerald-500" />
            <div className="heatmap-cell bg-emerald-600" />
          </div>
          <span>More</span>
        </div>
         <div className="flex gap-6 uppercase font-bold tracking-widest">
           <span>Total Habits: <strong>{data.length}</strong></span>
           <span>Today: <strong>{format(now, 'MMM d')}</strong></span>
        </div>
      </div>
    </div>
  );
}