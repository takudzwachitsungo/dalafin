import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';

interface WeeklyWinsSummaryProps {
  weekSpent: number;
  lastWeekSpent: number;
  impulsesAvoided: number;
  safeDays: number;
  totalSaved: number;
  streakDays: number;
}

export function WeeklyWinsSummary({
  weekSpent,
  lastWeekSpent,
  impulsesAvoided,
  safeDays,
  streakDays
}: WeeklyWinsSummaryProps) {
  const savingsVsLastWeek = lastWeekSpent - weekSpent;
  const percentChange = lastWeekSpent > 0 
    ? Math.round(((lastWeekSpent - weekSpent) / lastWeekSpent) * 100)
    : 0;

  const safeDaysPercent = Math.round((safeDays / 7) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Weekly Wins</h2>
        <span className="text-sm text-neutral-500">Last 7 days</span>
      </div>

      {/* Saved This Week */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Saved This Week</h3>
              <p className="text-sm text-neutral-500">
                {formatCurrency(Math.max(0, savingsVsLastWeek))}
                {percentChange > 0 && (
                  <span className="text-emerald-600 ml-2">↓{percentChange}% vs last week</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Impulses Resisted */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Impulses Resisted</h3>
              <p className="text-sm text-neutral-500">
                {impulsesAvoided} impulses • ~{formatCurrency(impulsesAvoided * 35)} saved
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Days Under Budget */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Days Under Budget</h3>
              <p className="text-sm text-neutral-500">{safeDays} of 7 days</p>
            </div>
          </div>
          <span className="text-xl font-bold text-neutral-900">{safeDaysPercent}%</span>
        </div>
        <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safeDaysPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>
      </Card>

      {/* Current Streak */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Current Streak</h3>
              <p className="text-sm text-neutral-500">{streakDays} days strong</p>
            </div>
          </div>
        </div>
      </Card>

      {safeDays >= 5 && (
        <Card variant="flat" className="bg-emerald-50/50 border-emerald-100 p-4">
          <p className="text-sm font-medium text-emerald-900 text-center">
            🌟 Outstanding! {safeDays} days under budget this week!
          </p>
        </Card>
      )}
    </div>
  );
}
