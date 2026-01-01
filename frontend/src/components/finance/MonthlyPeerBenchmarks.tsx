import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Users } from 'lucide-react';

interface PeerBenchmark {
  category: string;
  yourValue: number;
  percentile: number; // 0-100, where 100 is best
  median: number;
  top25: number;
  icon: typeof TrendingUp;
  unit: string;
  higherIsBetter: boolean;
}

interface MonthlyPeerBenchmarksProps {
  monthlySpent: number;
  impulsesAvoided: number;
  savingsRate: number; // as percentage
  streakDays: number;
}

export function MonthlyPeerBenchmarks({
  monthlySpent,
  impulsesAvoided,
  savingsRate,
  streakDays
}: MonthlyPeerBenchmarksProps) {
  // Calculate percentiles (simulated - in real app would come from backend)
  const calculatePercentile = (value: number, higherIsBetter: boolean) => {
    // Simulated percentile calculation
    if (higherIsBetter) {
      return Math.min(95, Math.max(5, 50 + (value / 10)));
    } else {
      return Math.min(95, Math.max(5, 50 - (value / 100)));
    }
  };

  const benchmarks: PeerBenchmark[] = [
    {
      category: 'Spending Control',
      yourValue: monthlySpent,
      percentile: calculatePercentile(monthlySpent, false),
      median: 1500,
      top25: 1000,
      icon: TrendingUp,
      unit: '$',
      higherIsBetter: false
    },
    {
      category: 'Impulse Resistance',
      yourValue: impulsesAvoided,
      percentile: calculatePercentile(impulsesAvoided, true),
      median: 8,
      top25: 15,
      icon: Target,
      unit: '',
      higherIsBetter: true
    },
    {
      category: 'Savings Rate',
      yourValue: savingsRate,
      percentile: calculatePercentile(savingsRate, true),
      median: 15,
      top25: 25,
      icon: Award,
      unit: '%',
      higherIsBetter: true
    },
    {
      category: 'Consistency Streak',
      yourValue: streakDays,
      percentile: calculatePercentile(streakDays, true),
      median: 5,
      top25: 14,
      icon: Users,
      unit: ' days',
      higherIsBetter: true
    }
  ];

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentile >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentile >= 25) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPercentileMessage = (percentile: number) => {
    if (percentile >= 75) return 'Top 25%! Outstanding performance';
    if (percentile >= 50) return 'Above average - keep it up';
    if (percentile >= 25) return 'Room for improvement';
    return 'Let\'s work on this together';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Your Monthly Performance
        </h3>
        <p className="text-sm text-gray-600">
          Compared to users with similar income levels
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Anonymous data • Updated monthly
        </p>
      </div>

      {/* Benchmarks */}
      <div className="space-y-4">
        {benchmarks.map((benchmark, idx) => {
          const Icon = benchmark.icon;
          const colorClass = getPercentileColor(benchmark.percentile);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-lg p-4 ${colorClass}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{benchmark.category}</p>
                    <p className="text-2xl font-bold mt-1">
                      {benchmark.unit === '$' && benchmark.unit}
                      {benchmark.yourValue}
                      {benchmark.unit !== '$' && benchmark.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">Percentile</p>
                  <p className="text-xl font-bold">{Math.round(benchmark.percentile)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-white/50 rounded-full mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${benchmark.percentile}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                  className="absolute inset-y-0 left-0 bg-current rounded-full"
                />
              </div>

              <p className="text-xs opacity-80 mb-2">
                {getPercentileMessage(benchmark.percentile)}
              </p>

              {/* Comparison Stats */}
              <div className="flex gap-4 text-xs opacity-70">
                <div>
                  <span className="font-medium">Median: </span>
                  {benchmark.unit === '$' && benchmark.unit}
                  {benchmark.median}
                  {benchmark.unit !== '$' && benchmark.unit}
                </div>
                <div>
                  <span className="font-medium">Top 25%: </span>
                  {benchmark.unit === '$' && benchmark.unit}
                  {benchmark.top25}
                  {benchmark.unit !== '$' && benchmark.unit}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Overall Message */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-700">
          <strong>Remember:</strong> These are just guides, not judgments.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Your financial journey is unique to your circumstances and goals
        </p>
      </div>
    </motion.div>
  );
}
