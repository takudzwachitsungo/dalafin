import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { motion } from 'framer-motion';
interface MoneyDisplayProps {
  amount: number;
  label?: string;
  subtext?: string;
  status?: 'safe' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
export function MoneyDisplay({
  amount,
  label,
  subtext,
  status = 'neutral',
  size = 'lg',
  className
}: MoneyDisplayProps) {
  const statusColors = {
    safe: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    neutral: 'text-neutral-900'
  };
  
  const statusBackgrounds = {
    safe: 'bg-emerald-50',
    warning: 'bg-amber-50',
    danger: 'bg-red-50',
    neutral: 'bg-transparent'
  };
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };
  return <div className={cn('flex flex-col items-center text-center', className)}>
      {label && <motion.span initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2">
          {label}
        </motion.span>}
      <motion.div 
        initial={{
          scale: 0.9,
          opacity: 0
        }} 
        animate={{
          scale: 1,
          opacity: 1
        }} 
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20
        }} 
        className={cn(
          'font-bold tracking-tight px-6 py-3 rounded-2xl transition-all duration-300',
          statusColors[status],
          statusBackgrounds[status],
          sizes[size]
        )}
      >
        {formatCurrency(amount)}
      </motion.div>
      {subtext && <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.1
    }} className="mt-2 text-sm text-neutral-400">
          {subtext}
        </motion.p>}
    </div>;
}