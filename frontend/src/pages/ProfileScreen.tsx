import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Wallet,
  Target,
  TrendingUp,
  Heart,
  Zap,
  Award,
  ChevronRight,
  Edit2,
  Save,
  X,
  Flame,
  PiggyBank,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn, formatCurrency } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function ProfileScreen() {
  const { dailyLimit, streakDays, impulsesAvoided, getWeekSpent, monthlyIncome: contextMonthlyIncome, fixedExpenses: contextFixedExpenses, goals } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [editingBudget, setEditingBudget] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Load user data on mount
  useEffect(() => {
    if (contextMonthlyIncome !== undefined) {
      setMonthlyIncome(contextMonthlyIncome.toString());
    }
    if (contextFixedExpenses !== undefined) {
      setFixedExpenses(contextFixedExpenses.toString());
    }
  }, [contextMonthlyIncome, contextFixedExpenses]);
  
  // Calculate total saved from goals
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  
  const calculateDailyLimit = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const fixed = parseFloat(fixedExpenses) || 0;
    const disposable = income - fixed;
    const avgDaysInMonth = 30;
    return (disposable / avgDaysInMonth).toFixed(2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateCurrentUser({
        monthly_income: parseFloat(monthlyIncome) || 0,
        fixed_expenses: parseFloat(fixedExpenses) || 0
      });
      // Refresh user data
      await api.getCurrentUser();
      setEditingBudget(false);
      // Reload the page to update context
      window.location.reload();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const behaviorBreakdown = [
    { label: 'Impulse Control', score: 90, color: 'bg-emerald-500' },
    { label: 'Daily Discipline', score: 85, color: 'bg-blue-500' },
    { label: 'Goal Progress', score: 78, color: 'bg-purple-500' },
    { label: 'Reflection Consistency', score: 88, color: 'bg-amber-500' }
  ];

  const achievements = [
    { icon: Zap, label: '12-Day Streak', description: 'Stayed under budget' },
    { icon: Heart, label: 'Impulse Master', description: '15 impulses avoided' },
    { icon: Award, label: 'Goal Achiever', description: '2 goals completed' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 pt-8 px-4 space-y-6"
    >
      {/* Header with Avatar */}
      <header className="flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {getUserInitials()}
          </div>
          <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full border-2 border-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-50">
            <Edit2 size={14} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{user?.name || 'User'}</h1>
          <p className="text-neutral-500 text-sm">{user?.email}</p>
        </div>
      </header>

      {/* Settings Menu */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900 px-1">Settings</h2>
        
        <Card 
          className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors active:scale-[0.98]"
          onClick={() => {/* Navigate to notifications */}}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Bell size={20} />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Notifications</div>
              <div className="text-xs text-neutral-500">Daily reminders & alerts</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </Card>

        <Card 
          className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors active:scale-[0.98]"
          onClick={() => {/* Navigate to goals */}}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Target size={20} />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Financial Goals</div>
              <div className="text-xs text-neutral-500">Manage savings targets</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </Card>

        <Card 
          className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors active:scale-[0.98]"
          onClick={() => navigate('/impulses')}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Avoided Impulses</div>
              <div className="text-xs text-neutral-500">{impulsesAvoided} impulses resisted</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </Card>

        <Card 
          className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors active:scale-[0.98]"
          onClick={() => {/* Navigate to privacy */}}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-medium text-neutral-900">Privacy & Security</div>
              <div className="text-xs text-neutral-500">Data & app lock</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </Card>

        <Card 
          className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors active:scale-[0.98]"
          onClick={() => {/* Navigate to preferences */}}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Settings size={20} />
            </div>
            <div>
              <div className="font-medium text-neutral-900">App Preferences</div>
              <div className="text-xs text-neutral-500">Theme, language & more</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
        </Card>
      </section>

      {/* Danger Zone */}
      <Card className="p-4 border-red-100 bg-red-50/30">
        <Button 
          variant="ghost" 
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>
      </Card>
    </motion.div>
  );
}