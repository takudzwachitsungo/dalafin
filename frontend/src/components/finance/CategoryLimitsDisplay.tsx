import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CategoryLimit } from '../../context/AppContext';

interface CategoryLimitsDisplayProps {
  categoryLimits: CategoryLimit[];
}

export function CategoryLimitsDisplay({ categoryLimits }: CategoryLimitsDisplayProps) {
  if (!categoryLimits || categoryLimits.length === 0) {
    return null;
  }

  const getCategoryStatus = (limit: CategoryLimit) => {
    const percentage = (limit.spent / limit.monthlyLimit) * 100;
    
    if (percentage >= 100) {
      return {
        color: 'red',
        icon: AlertCircle,
        message: 'Limit reached',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        barColor: 'bg-red-500'
      };
    } else if (percentage >= 80) {
      return {
        color: 'amber',
        icon: AlertTriangle,
        message: 'Close to limit',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        barColor: 'bg-amber-500'
      };
    } else {
      return {
        color: 'emerald',
        icon: CheckCircle,
        message: 'On track',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        barColor: 'bg-emerald-500'
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Category Limits
      </h3>

      {categoryLimits.map((limit, idx) => {
        const status = getCategoryStatus(limit);
        const Icon = status.icon;
        const percentage = Math.min(100, (limit.spent / limit.monthlyLimit) * 100);
        const remaining = Math.max(0, limit.monthlyLimit - limit.spent);

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${status.bgColor} border ${status.borderColor} rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${status.textColor}`} />
                <span className="font-medium text-gray-900">{limit.category}</span>
              </div>
              <span className={`text-xs font-medium ${status.textColor}`}>
                {status.message}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/70 rounded-full mb-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                className={`absolute inset-y-0 left-0 ${status.barColor} rounded-full`}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                ${limit.spent.toFixed(0)} / ${limit.monthlyLimit}
              </span>
              <span className={status.textColor}>
                ${remaining.toFixed(0)} left
              </span>
            </div>

            {/* Warning Message */}
            {percentage >= 80 && (
              <p className="text-xs text-gray-600 mt-2">
                {percentage >= 100 
                  ? 'You\'ve exceeded your monthly budget for this category'
                  : 'You\'re approaching your monthly limit for this category'}
              </p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
