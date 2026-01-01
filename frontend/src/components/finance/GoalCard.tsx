import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
interface GoalCardProps {
  name: string;
  current: number;
  target: number;
  color?: string;
}
export function GoalCard({
  name,
  current,
  target,
  color = 'bg-blue-500'
}: GoalCardProps) {
  const progress = Math.min(current / target * 100, 100);
  return <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-neutral-50 rounded-lg text-neutral-600">
          <Target size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-neutral-900 text-sm">{name}</h4>
          <p className="text-xs text-neutral-500">
            {formatCurrency(current)} of {formatCurrency(target)}
          </p>
        </div>
        <span className="text-xs font-bold text-neutral-900">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{
        width: 0
      }} animate={{
        width: `${progress}%`
      }} transition={{
        duration: 1.5,
        ease: 'easeOut'
      }} />
      </div>
    </div>;
}