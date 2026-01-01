import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TransactionCard } from '../components/finance/TransactionCard';
import { ReflectionModal } from '../components/modals/ReflectionModal';
import { CelebrationMoments } from '../components/finance/CelebrationMoments';
import { useApp } from '../context/AppContext';

export function TodayScreen() {
  const { 
    getTodaySpent, 
    streakDays, 
    impulsesAvoided,
    transactions,
    addReflection,
    hasReflectedToday,
    goals,
    monthlyIncome,
    fixedExpenses
  } = useApp();
  
  const [showReflection, setShowReflection] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState<{ [key: string]: boolean }>({});
  
  const spentToday = getTodaySpent();
  
  // Calculate daily budget for color thresholds
  const dailyBudget = ((monthlyIncome || 0) - (fixedExpenses || 0)) / 30;
  
  // Determine spending status color
  const getSpendingStatus = (): 'safe' | 'warning' | 'danger' | 'neutral' => {
    if (dailyBudget <= 0) return 'neutral';
    if (spentToday === 0) return 'neutral';
    if (spentToday < dailyBudget * 0.7) return 'safe'; // Under 70% = safe
    if (spentToday < dailyBudget) return 'warning'; // 70-100% = warning
    return 'danger'; // Over budget = danger
  };
  
  const spendingStatus = getSpendingStatus();
  
  // Calculate total saved towards goals
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);

  // Show reflection modal at 9 PM if not reflected today
  useEffect(() => {
    const checkReflectionTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Show at 9 PM if not reflected
      if (hour >= 21 && !hasReflectedToday()) {
        setShowReflection(true);
      }
    };
    
    checkReflectionTime();
    const interval = setInterval(checkReflectionTime, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [hasReflectedToday]);

  // Check for celebration milestones
  useEffect(() => {
    const milestoneKey = `${streakDays}-${impulsesAvoided}-${Math.floor(totalSaved / 100)}`;
    
    // Only show once per milestone
    if (!celebrationShown[milestoneKey]) {
      if (
        streakDays === 7 || 
        streakDays === 30 || 
        impulsesAvoided === 5 || 
        impulsesAvoided === 20 ||
        (totalSaved >= 100 && totalSaved < 101) ||
        (totalSaved >= 500 && totalSaved < 501)
      ) {
        setShowCelebration(true);
        setCelebrationShown(prev => ({ ...prev, [milestoneKey]: true }));
      }
    }
  }, [streakDays, impulsesAvoided, totalSaved, celebrationShown]);

  const todayTransactions = transactions
    .filter(t => {
      const today = new Date();
      const tDate = new Date(t.date);
      return tDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="pb-24 pt-8 px-4 space-y-8">
      {/* Header / Status */}
      <header className="flex flex-col items-center justify-center pt-8 pb-4">
        <MoneyDisplay 
          amount={spentToday} 
          label="Spent Today" 
          subtext="Resets at midnight" 
          status={spendingStatus} 
          size="xl" 
        />
        
        {/* Spending Progress Bar */}
        {dailyBudget > 0 && spentToday > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 w-full max-w-xs"
          >
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((spentToday / dailyBudget) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  spendingStatus === 'safe' ? 'bg-emerald-500' :
                  spendingStatus === 'warning' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>{spendingStatus === 'danger' ? 'Over budget' : `${Math.round((spentToday / dailyBudget) * 100)}% of daily budget`}</span>
              <span className="font-medium">${dailyBudget.toFixed(0)}</span>
            </div>
          </motion.div>
        )}
        
        {/* Streak Display */}
        {(streakDays > 0 || impulsesAvoided > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center gap-6"
          >
            {streakDays > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-full border border-orange-100">
                <Flame className="text-orange-500" size={20} />
                <span className="text-sm font-semibold text-orange-900">
                  {streakDays} day streak
                </span>
              </div>
            )}
            {impulsesAvoided > 0 && (
              <Link to="/impulses">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-100 hover:shadow-md transition-shadow cursor-pointer">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-sm font-semibold text-emerald-900">
                    {impulsesAvoided} impulses avoided
                  </span>
                </div>
              </Link>
            )}
          </motion.div>
        )}
      </header>

      {/* Primary Actions */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/spend" className="col-span-1">
          <Button className="w-full h-32 flex flex-col gap-2 text-lg" variant="primary">
            <Plus size={28} />
            Log Spend
          </Button>
        </Link>
        <Link to="/income" className="col-span-1">
          <Button className="w-full h-32 flex flex-col gap-2 text-lg" variant="secondary">
            <Plus size={28} />
            Log Income
          </Button>
        </Link>
      </section>

      {/* Awareness / Context */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-neutral-900">
            Today's Activity
          </h2>
          <span className={cn(
            "text-sm font-semibold transition-colors duration-300",
            spendingStatus === 'safe' ? 'text-emerald-600' :
            spendingStatus === 'warning' ? 'text-amber-600' :
            spendingStatus === 'danger' ? 'text-red-600' :
            'text-neutral-500'
          )}>
            -${spentToday.toFixed(2)}
          </span>
        </div>

        {todayTransactions.length > 0 ? (
          <div className="space-y-3">
            {todayTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                title={transaction.note || 'Purchase'}
                amount={transaction.amount}
                category={transaction.category}
                date={new Date(transaction.date).toLocaleString('en-US', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric', 
                  minute: '2-digit'
                })}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card variant="flat" className="bg-neutral-50 text-center py-8">
            <p className="text-neutral-500 text-sm">No transactions yet today</p>
            <p className="text-neutral-400 text-xs mt-1">Great start! Keep it up 🎯</p>
          </Card>
        )}
      </section>

      {/* Modals */}
      <ReflectionModal
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        onSubmit={(reflection) => {
          addReflection(reflection);
          setShowReflection(false);
        }}
      />

      {/* Celebration Moments */}
      {showCelebration && (
        <CelebrationMoments
          streakDays={streakDays}
          totalSaved={totalSaved}
          impulsesAvoided={impulsesAvoided}
          onDismiss={() => setShowCelebration(false)}
        />
      )}
    </motion.div>;
}