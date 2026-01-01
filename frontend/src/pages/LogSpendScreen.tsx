import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calculator } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CategorySelector, CategoryId } from '../components/finance/CategorySelector';
import { BeforeYouBuyCalculator } from '../components/finance/BeforeYouBuyCalculator';
import { EmergencyPause } from '../components/finance/EmergencyPause';
import { ImpulseCheckModal } from '../components/modals/ImpulseCheckModal';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function LogSpendScreen() {
  const navigate = useNavigate();
  const { addTransaction, dailyLimit, getTodaySpent, goals, monthlyIncome, updateCategorySpent, incrementImpulsesAvoided } = useApp();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [note, setNote] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showEmergencyPause, setShowEmergencyPause] = useState(false);
  const [showImpulseCheck, setShowImpulseCheck] = useState(false);

  const handleNumberClick = (num: string) => {
    if (amount.includes('.') && num === '.') return;
    if (amount.length > 6) return;
    setAmount(prev => prev + num);
  };

  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = (emergencyReason?: string, isImpulse: boolean = false) => {
    if (!amount || !category) return;
    
    const finalNote = emergencyReason 
      ? `${note.trim() || 'Emergency purchase'} - Reason: ${emergencyReason}`
      : note.trim() || undefined;
    
    addTransaction({
      amount: parseFloat(amount),
      category,
      isImpulse,
      note: finalNote
    });

    // Update category spent
    if (category) {
      updateCategorySpent(category, parseFloat(amount));
    }
    
    setShowEmergencyPause(false);
    setShowImpulseCheck(false);
    navigate('/today');
  };

  const handleSaveClick = () => {
    const numericAmount = parseFloat(amount) || 0;
    
    // Trigger Emergency Pause for purchases over $100
    if (numericAmount >= 100) {
      setShowEmergencyPause(true);
    } 
    // Trigger Impulse Check for purchases $20-$99
    else if (numericAmount >= 20) {
      setShowImpulseCheck(true);
    } 
    // Small purchases under $20 go through directly
    else {
      handleSave(undefined, false);
    }
  };

  const numericAmount = parseFloat(amount) || 0;
  const currentSpent = getTodaySpent();

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: 20
  }} className="pb-24 pt-4 px-4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <span className="font-medium text-neutral-500">Log Expense</span>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Amount Display */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex items-baseline text-neutral-900">
          <span className="text-3xl font-medium mr-1">$</span>
          <span className={cn('text-6xl font-bold tracking-tighter', !amount && 'text-neutral-300')}>
            {amount || '0'}
          </span>
        </div>

        {/* Calculator Toggle */}
        {numericAmount > 0 && !showCalculator && (
          <button
            onClick={() => setShowCalculator(true)}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Calculator size={16} />
            Show Purchase Analysis
          </button>
        )}
      </div>
      
      {/* Before You Buy Calculator */}
      {showCalculator && numericAmount > 0 && (
        <div className="mb-4 max-h-64 overflow-y-auto">
          <button
            onClick={() => setShowCalculator(false)}
            className="mb-2 text-sm text-neutral-500 hover:text-neutral-700"
          >
            Hide Analysis
          </button>
          <BeforeYouBuyCalculator
            amount={numericAmount}
            monthlyIncome={monthlyIncome}
            dailyLimit={dailyLimit}
          />
        </div>
      )}

      {/* Optional Note */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-neutral-500">
          What's this for? (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Coffee, Lunch, Groceries"
          className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="text-sm font-medium text-neutral-500 mb-2 block">
          Category
        </label>
        <CategorySelector selected={category} onSelect={setCategory} />
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => <button key={num} onClick={() => handleNumberClick(num.toString())} className="h-12 rounded-xl text-xl font-medium text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
            {num}
          </button>)}
        <button onClick={handleDelete} className="h-12 rounded-xl flex items-center justify-center text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Submit */}
      <Button className="w-full h-12 text-base mt-auto" disabled={!amount || !category} onClick={handleSaveClick}>
        Save Expense
      </Button>

      {/* Emergency Pause Modal */}
      <EmergencyPause
        amount={numericAmount}
        isOpen={showEmergencyPause}
        onConfirm={(reason) => handleSave(reason, false)}
        onCancel={() => {
          setShowEmergencyPause(false);
          navigate('/today');
        }}
      />

      {/* Impulse Check Modal */}
      <ImpulseCheckModal
        amount={numericAmount}
        category={category || 'Unknown'}
        isOpen={showImpulseCheck}
        onProceed={() => handleSave(undefined, true)}
        onAddToWishlist={async () => {
          try {
            await api.post('/api/v1/avoided-impulses/', {
              amount: numericAmount,
              category: category || 'Unknown',
              description: note.trim() || null
            });
            incrementImpulsesAvoided();
            setShowImpulseCheck(false);
            navigate('/impulses');
          } catch (error) {
            console.error('Failed to save avoided impulse:', error);
            alert('Failed to save avoided impulse');
          }
        }}
        onClose={() => {
          setShowImpulseCheck(false);
          navigate('/today');
        }}
      />
    </motion.div>;
}