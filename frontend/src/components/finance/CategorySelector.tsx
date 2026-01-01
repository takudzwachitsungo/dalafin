import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShoppingBag, Car, Zap, Heart, Film, Smartphone, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
export type CategoryId = 'food' | 'transport' | 'shopping' | 'entertainment' | 'bills' | 'health' | 'tech' | 'gifts';
interface CategorySelectorProps {
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}
const categories = [{
  id: 'food',
  label: 'Food',
  icon: Coffee
}, {
  id: 'transport',
  label: 'Transport',
  icon: Car
}, {
  id: 'shopping',
  label: 'Shopping',
  icon: ShoppingBag
}, {
  id: 'entertainment',
  label: 'Fun',
  icon: Film
}, {
  id: 'bills',
  label: 'Bills',
  icon: Zap
}, {
  id: 'health',
  label: 'Health',
  icon: Heart
}, {
  id: 'tech',
  label: 'Tech',
  icon: Smartphone
}, {
  id: 'gifts',
  label: 'Gifts',
  icon: Gift
}] as const;
export function CategorySelector({
  selected,
  onSelect
}: CategorySelectorProps) {
  return <div className="grid grid-cols-4 gap-3">
      {categories.map((cat, index) => {
      const isSelected = selected === cat.id;
      const Icon = cat.icon;
      return <motion.button key={cat.id} initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: index * 0.03
      }} onClick={() => onSelect(cat.id)} className={cn('flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all', isSelected ? 'bg-neutral-900 text-white shadow-md scale-105' : 'bg-white border border-neutral-100 text-neutral-500 hover:bg-neutral-50')} whileTap={{
        scale: 0.95
      }}>
            <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{cat.label}</span>
          </motion.button>;
    })}
    </div>;
}