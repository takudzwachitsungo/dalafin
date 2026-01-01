import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { api } from '../lib/api';

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
  recent_incomes: Income[];
}

const INCOME_SOURCES = [
  'Gift',
  'Freelance',
  'Side Job',
  'Bonus',
  'Refund',
  'Investment',
  'Cashback',
  'Sold Item',
  'Other'
];

const SOURCE_ICONS: Record<string, string> = {
  'Gift': '🎁',
  'Freelance': '💼',
  'Side Job': '🛠️',
  'Bonus': '🎉',
  'Refund': '↩️',
  'Investment': '📈',
  'Cashback': '💰',
  'Sold Item': '🏷️',
  'Other': '💵'
};

export function IncomeScreen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Gift');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, incomesData] = await Promise.all([
        api.income.getSummary(),
        api.income.getAll()
      ]);
      setSummary(summaryData);
      setIncomes(incomesData.incomes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
        date
      });
      
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add income');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income record?')) return;
    
    try {
      await api.income.delete(id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Income</h1>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {showAddForm ? 'Cancel' : '+ Add Income'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400">✕</button>
        </div>
      )}

      {/* Add Income Form */}
      {showAddForm && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {INCOME_SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      source === s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {SOURCE_ICONS[s]} {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Birthday gift from grandma"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !amount}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {submitting ? 'Adding...' : 'Add Income'}
            </Button>
          </form>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <p className="text-emerald-100 text-sm">This Month</p>
            <MoneyDisplay 
              amount={summary.total_this_month} 
              className="text-2xl font-bold text-white"
              showSign={false}
            />
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <p className="text-blue-100 text-sm">This Year</p>
            <MoneyDisplay 
              amount={summary.total_this_year} 
              className="text-2xl font-bold text-white"
              showSign={false}
            />
          </Card>
        </div>
      )}

      {/* Income by Source */}
      {summary && Object.keys(summary.by_source).length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">By Source (This Year)</h3>
          <div className="space-y-2">
            {Object.entries(summary.by_source)
              .sort(([,a], [,b]) => b - a)
              .map(([source, amount]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {SOURCE_ICONS[source] || '💵'} {source}
                  </span>
                  <MoneyDisplay amount={amount} className="font-medium text-emerald-600" showSign={false} />
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Recent Income List */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Recent Income</h3>
        {incomes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No income recorded yet. Add your first income!
          </p>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div 
                key={income.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SOURCE_ICONS[income.source] || '💵'}</span>
                  <div>
                    <p className="font-medium text-gray-800">{income.source}</p>
                    {income.description && (
                      <p className="text-sm text-gray-500">{income.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(income.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MoneyDisplay 
                    amount={income.amount} 
                    className="font-semibold text-emerald-600"
                    showSign={false}
                  />
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
