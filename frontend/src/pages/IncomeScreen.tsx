import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, X, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

interface Income {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
  created_at: string;
}

interface IncomeSummary {
  total_this_month: number;
  total_this_year: number;
  by_source: Record<string, number>;
}

const INCOME_SOURCES = [
  'Gift', 'Freelance', 'Side Job', 'Bonus', 'Refund',
  'Investment', 'Cashback', 'Sold Item', 'Other'
];



export function IncomeScreen() {
  const { transactions } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Gift');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Calculate balance: total income - total spending
  const totalIncome = typeof summary?.total_this_month === 'number' 
    ? summary.total_this_month 
    : Number(summary?.total_this_month) || 0;
  const totalSpending = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      const now = new Date();
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalSpending;

  const fetchData = async () => {
    try {
      const [summaryData, incomesData] = await Promise.all([
        api.income.getSummary(),
        api.income.getAll()
      ]);
      setSummary(summaryData);
      setIncomes(incomesData.incomes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      await api.income.create({
        amount: parseFloat(amount),
        source,
        description: description || null,
        date: new Date(date).toISOString()
      });
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to create income:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.income.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete income:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 pt-8 px-4 space-y-8"
    >
      {/* Header / Status */}
      <header className="flex flex-col items-center justify-center pt-8 pb-4">
        <MoneyDisplay 
          amount={balance} 
          label="Current Balance" 
          subtext="This month" 
          status={balance < 0 ? 'danger' : balance < 50 ? 'warning' : 'safe'} 
          size="xl" 
        />
        
        <Button
          className="mt-6"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} className={showAddForm ? 'rotate-45 transition-transform' : ''} />
          Add Income
        </Button>
      </header>

      {/* Income vs Spending Stats */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="bg-emerald-100 p-3 rounded-full mb-3">
              <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs text-neutral-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-neutral-900">
              ${totalIncome.toFixed(0)}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-3">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-xs text-neutral-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-neutral-900">
              ${totalSpending.toFixed(0)}
            </p>
          </div>
        </Card>
      </section>

      {/* Add Income Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INCOME_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Birthday gift from aunt"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Adding...' : 'Add Income'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Income List */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-900">Recent Income</h3>
        {incomes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-12 h-12 text-neutral-300" />
              <p className="text-neutral-400 font-medium">No income recorded yet</p>
              <p className="text-sm text-neutral-400">Tap Add Income to get started</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <motion.div
                key={income.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{income.source}</p>
                        {income.description && (
                          <p className="text-sm text-neutral-500 line-clamp-1">{income.description}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(income.date).toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-emerald-600">
                        +${Number(income.amount).toFixed(0)}
                      </span>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
