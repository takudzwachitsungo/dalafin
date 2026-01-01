import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShoppingBag, Car, Zap, Heart, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
export type TransactionCategory = 'food' | 'shopping' | 'transport' | 'bills' | 'health' | 'impulse';
interface TransactionCardProps {
  title: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  isImpulse?: boolean;
  index?: number;
}
const categoryIcons = {
  food: Coffee,
  shopping: ShoppingBag,
  transport: Car,
  bills: Zap,
  health: Heart,
  impulse: AlertCircle
};
const categoryColors = {
  food: 'bg-orange-100 text-orange-600',
  shopping: 'bg-blue-100 text-blue-600',
  transport: 'bg-indigo-100 text-indigo-600',
  bills: 'bg-yellow-100 text-yellow-600',
  health: 'bg-emerald-100 text-emerald-600',
  impulse: 'bg-red-100 text-red-600'
};
export function TransactionCard({
  title,
  amount,
  category,
  date,
  isImpulse,
  index = 0
}: TransactionCardProps) {
  const Icon = categoryIcons[category] || ShoppingBag;
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.05
  }} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn('p-2.5 rounded-full', categoryColors[category])}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-medium text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn('font-semibold', isImpulse ? 'text-red-500' : 'text-neutral-900')}>
          -{formatCurrency(amount)}
        </p>
        {isImpulse && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            Impulse
          </span>}
      </div>
    </motion.div>;
}