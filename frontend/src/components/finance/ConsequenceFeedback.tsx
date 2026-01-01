import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface Goal {
  name: string;
  current: number;
  target: number;
}

interface ConsequenceFeedbackProps {
  amount: number;
  dailyLimit: number;
  currentSpent: number;
  goals?: Goal[];
}

export function ConsequenceFeedback({
  amount,
  dailyLimit,
  currentSpent,
  goals = []
}: ConsequenceFeedbackProps) {
  const remaining = dailyLimit - currentSpent - amount;
  const isOverBudget = remaining < 0;

  // Calculate goal delays (assuming $50/day savings rate for simplicity)
  const dailySavingsRate = 50;
  const daysDelayed = Math.round(amount / dailySavingsRate);

  if (amount <= 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={amount}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-6 space-y-3"
      >
        {/* Daily Impact */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
          <p className="text-sm text-neutral-500 mb-1">Impact on today</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-neutral-400">Remaining:</span>
            <span className={`font-bold text-lg ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>

          {isOverBudget && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-red-500 font-medium"
            >
              This will exceed your daily limit by{' '}
              {formatCurrency(Math.abs(remaining))}
            </motion.p>
          )}

          {!isOverBudget && amount > 50 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-amber-600 font-medium"
            >
              That's a significant chunk of your daily budget.
            </motion.p>
          )}
        </div>

        {/* Goal Impact */}
        {amount > 20 && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-blue-50 border border-blue-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Impact on Goals</p>
            </div>
            <div className="space-y-1">
              {goals.slice(0, 2).map((goal, i) => {
                const progress = (goal.current / goal.target) * 100;
                const newProgress = ((goal.current + amount) / goal.target) * 100;
                const percentDelay = Math.round(newProgress - progress);
                
                return (
                  <div key={i} className="flex items-center gap-2 text-xs text-blue-700">
                    <Clock size={12} />
                    <span>
                      <strong>{goal.name}</strong> delayed by ~{daysDelayed} days
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              💡 Skip this purchase to stay on track
            </p>
          </motion.div>
        )}

        {/* Alternative Suggestion */}
        {amount > 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-amber-50 border border-amber-100"
          >
            <p className="text-xs text-amber-900">
              <strong>Alternative:</strong> If you save this {formatCurrency(amount)} instead, 
              in 6 months you'll have {formatCurrency(amount * 1.02)} with minimal interest.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}