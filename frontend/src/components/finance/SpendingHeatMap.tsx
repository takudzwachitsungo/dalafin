import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SpendingHeatMapProps {
  dailySpending: Array<{
    date: Date;
    amount: number;
    limit: number;
  }>;
  daysToShow?: number;
}

export function SpendingHeatMap({ dailySpending, daysToShow = 30 }: SpendingHeatMapProps) {
  const getColorClass = (amount: number, limit: number) => {
    const ratio = amount / limit;
    if (ratio >= 1) return 'bg-red-500 border-red-600';
    if (ratio >= 0.8) return 'bg-amber-500 border-amber-600';
    if (ratio >= 0.5) return 'bg-yellow-400 border-yellow-500';
    return 'bg-emerald-500 border-emerald-600';
  };

  const getIntensity = (amount: number, limit: number) => {
    const ratio = amount / limit;
    if (ratio >= 1) return 'opacity-100';
    if (ratio >= 0.8) return 'opacity-90';
    if (ratio >= 0.5) return 'opacity-70';
    if (ratio > 0) return 'opacity-50';
    return 'opacity-20';
  };

  const weeks = [];
  for (let i = 0; i < Math.ceil(daysToShow / 7); i++) {
    weeks.push(dailySpending.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Last {daysToShow} Days</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span>Under</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
            <span>Close</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500"></div>
            <span>Over</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-400">
            {day[0]}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-2">
          {week.map((day, dayIndex) => {
            const date = new Date(day.date);
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <motion.div
                key={dayIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                className="group relative"
              >
                <div
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all cursor-pointer hover:scale-110',
                    getColorClass(day.amount, day.limit),
                    getIntensity(day.amount, day.limit),
                    isToday && 'ring-2 ring-blue-500 ring-offset-2'
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    {date.getDate()}
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div>Spent: ${day.amount.toFixed(2)}</div>
                    <div>Limit: ${day.limit.toFixed(2)}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {/* Fill empty cells */}
          {Array.from({ length: 7 - week.length }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
