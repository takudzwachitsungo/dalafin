import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakBadgeProps {
  icon: LucideIcon;
  value: number;
  label: string;
  gradient?: string;
  iconColor?: string;
  textColor?: string;
  borderColor?: string;
}

export function StreakBadge({
  icon: Icon,
  value,
  label,
  gradient = 'from-orange-50 to-red-50',
  iconColor = 'text-orange-500',
  textColor = 'text-orange-900',
  borderColor = 'border-orange-100'
}: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full border',
        `bg-gradient-to-r ${gradient}`,
        borderColor
      )}
    >
      <Icon className={iconColor} size={20} />
      <div className="flex items-baseline gap-1">
        <span className={cn('text-lg font-bold', textColor)}>
          {value}
        </span>
        <span className={cn('text-xs font-semibold', textColor)}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}
