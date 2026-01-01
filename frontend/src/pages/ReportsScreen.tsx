import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { WeeklyWinsSummary } from '../components/finance/WeeklyWinsSummary';
import { SpendingHeatMap } from '../components/finance/SpendingHeatMap';
import { CategoryLimitsDisplay } from '../components/finance/CategoryLimitsDisplay';
import { TrendingDown, TrendingUp, Calendar, AlertTriangle, Coffee, ShoppingBag, Target, Lightbulb, Zap, Clock, Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';

export function ReportsScreen() {
  const { 
    getWeekSpent, 
    transactions, 
    impulsesAvoided, 
    streakDays, 
    categoryLimits,
    dailyLimit
  } = useApp();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  const weekSpent = getWeekSpent();
  
  // Calculate previous week spending
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const lastWeekSpent = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date >= twoWeeksAgo && date < weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate safe days (days under budget)
  const daySpending = new Map<string, number>();
  transactions
    .filter(t => new Date(t.date) >= weekAgo)
    .forEach(t => {
      const day = new Date(t.date).toDateString();
      daySpending.set(day, (daySpending.get(day) || 0) + t.amount);
    });
  
  const safeDays = Array.from(daySpending.values()).filter(spent => spent <= dailyLimit).length;
  
  // Calculate weekly spending target (daily limit * 7)
  const weeklyTarget = dailyLimit * 7;
  
  // Prepare heat map data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailySpendingData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toDateString();
    
    return {
      date: date.toISOString().split('T')[0],
      amount: daySpending.get(dateStr) || 0,
      limit: dailyLimit
    };
  });
  
  // Advanced Analytics for AI-generated insights
  const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
  const impulseTransactions = weekTransactions.filter(t => t.isImpulse);
  
  // Category analysis
  const categorySpending = weekTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];
  
  const categoryPercentage = topCategory ? (topCategory[1] / weekSpent) * 100 : 0;
  
  // Impulse spending analysis
  const impulseTotal = impulseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const impulseRate = weekSpent > 0 ? (impulseTotal / weekSpent) * 100 : 0;
  
  const impulseCategories = impulseTransactions.map(t => t.category);
  const impulseCategoryCount = impulseCategories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topImpulseCategory = Object.entries(impulseCategoryCount)
    .sort(([,a], [,b]) => b - a)[0];
  
  // Time-based patterns
  const weekendSpending = weekTransactions
    .filter(t => {
      const day = new Date(t.date).getDay();
      return day === 0 || day === 6;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const weekdaySpending = weekSpent - weekendSpending;
  const avgWeekendDaily = weekendSpending / 2;
  const avgWeekdayDaily = weekdaySpending / 5;
  
  // Spending velocity (comparing to previous week)
  const spendingChange = lastWeekSpent > 0 
    ? ((weekSpent - lastWeekSpent) / lastWeekSpent) * 100 
    : 0;
  
  // Category limit violations
  const categoryViolations = Object.entries(categoryLimits)
    .map(([category, limit]) => ({
      category,
      limit,
      spent: categorySpending[category] || 0,
      overage: (categorySpending[category] || 0) - limit
    }))
    .filter(c => c.overage > 0)
    .sort((a, b) => b.overage - a.overage);

  // Daily trend analysis (last 3 days vs first 3 days of week)
  const recentDays = weekTransactions
    .filter(t => {
      const daysAgo = Math.floor((new Date().getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 2;
    })
    .reduce((sum, t) => sum + t.amount, 0) / 3;
  
  const earlierDays = weekTransactions
    .filter(t => {
      const daysAgo = Math.floor((new Date().getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo >= 4 && daysAgo <= 6;
    })
    .reduce((sum, t) => sum + t.amount, 0) / 3;
  
  const weekTrend = earlierDays > 0 ? ((recentDays - earlierDays) / earlierDays) * 100 : 0;

  // Transaction frequency analysis
  const avgTransactionsPerDay = weekTransactions.length / 7;
  const recentTransactionCount = weekTransactions
    .filter(t => {
      const daysAgo = Math.floor((new Date().getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 2;
    }).length / 3;

  // Generate dynamic priority insights (max 3 most relevant)
  const insights: Array<{
    priority: number;
    component: React.ReactNode;
  }> = [];

  // Critical: Spending velocity significantly up
  if (spendingChange > 30) {
    insights.push({
      priority: 10,
      component: (
        <Card key="velocity-critical" variant="flat" className="bg-red-50/50 border-red-100">
          <div className="flex gap-3">
            <TrendingUp className="text-red-500 shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Sharp Spending Increase</h4>
              <p className="text-sm text-red-700 mt-1">
                Spending jumped {spendingChange.toFixed(0)}% from last week ({formatCurrency(lastWeekSpent)} → {formatCurrency(weekSpent)}). 
                This is a significant change. Review what triggered the increase and adjust if needed.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  } else if (spendingChange > 15) {
    insights.push({
      priority: 7,
      component: (
        <Card key="velocity-warning" variant="flat" className="bg-amber-50/50 border-amber-100">
          <div className="flex gap-3">
            <TrendingUp className="text-amber-500 shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900">Spending Trending Up</h4>
              <p className="text-sm text-amber-700 mt-1">
                Up {spendingChange.toFixed(0)}% from last week. Early intervention can help maintain your budget goals.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Positive: Spending decreasing
  if (spendingChange < -15 && lastWeekSpent > 0) {
    insights.push({
      priority: 8,
      component: (
        <Card key="velocity-positive" variant="flat" className="bg-green-50/50 border-green-100">
          <div className="flex gap-3">
            <TrendingDown className="text-green-500 shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Excellent Progress</h4>
              <p className="text-sm text-green-700 mt-1">
                Spending down {Math.abs(spendingChange).toFixed(0)}% from last week. You've saved {formatCurrency(lastWeekSpent - weekSpent)} compared to last week!
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Week trend acceleration
  if (weekTrend > 25 && earlierDays > 0) {
    insights.push({
      priority: 9,
      component: (
        <Card key="week-acceleration" variant="flat" className="bg-orange-50/50 border-orange-100">
          <div className="flex gap-3">
            <Zap className="text-orange-500 shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900">End-of-Week Acceleration</h4>
              <p className="text-sm text-orange-700 mt-1">
                Daily spending increased {weekTrend.toFixed(0)}% in the last 3 days vs earlier this week. 
                Consider slowing down to finish the week strong.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Category concentration
  if (topCategory && categoryPercentage > 50) {
    insights.push({
      priority: 8,
      component: (
        <Card key="category-critical" variant="flat" className="bg-red-50/50 border-red-100">
          <div className="flex gap-3">
            <Target className="text-red-500 shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Heavy Category Concentration</h4>
              <p className="text-sm text-red-700 mt-1">
                Over half your spending ({categoryPercentage.toFixed(0)}%) is in <strong>{topCategory[0]}</strong>. 
                This lack of diversification might indicate an area to monitor closely.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  } else if (topCategory && categoryPercentage > 35) {
    insights.push({
      priority: 5,
      component: (
        <Card key="category-warning" variant="flat" className="bg-amber-50/50 border-amber-100">
          <div className="flex gap-3">
            <Target className="text-amber-500 shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900">Category Concentration</h4>
              <p className="text-sm text-amber-700 mt-1">
                {categoryPercentage.toFixed(0)}% of spending is in <strong>{topCategory[0]}</strong> ({formatCurrency(topCategory[1])}). 
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Impulse spending analysis (dynamic thresholds)
  if (impulseRate > 40) {
    insights.push({
      priority: 9,
      component: (
        <Card key="impulse-critical" variant="flat" className="bg-purple-50/50 border-purple-100">
          <div className="flex gap-3">
            <Zap className="text-purple-500 shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">Critical: High Impulse Rate</h4>
              <p className="text-sm text-purple-700 mt-1">
                {impulseRate.toFixed(0)}% ({formatCurrency(impulseTotal)}) was impulse spending. 
                {topImpulseCategory && ` ${topImpulseCategory[1]} impulses in ${topImpulseCategory[0]}.`} 
                Use the wishlist feature before every non-essential purchase.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  } else if (impulseRate > 20) {
    insights.push({
      priority: 6,
      component: (
        <Card key="impulse-warning" variant="flat" className="bg-purple-50/50 border-purple-100">
          <div className="flex gap-3">
            <Zap className="text-purple-500 shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">Impulse Spending Pattern</h4>
              <p className="text-sm text-purple-700 mt-1">
                {impulseRate.toFixed(0)}% of spending was impulse purchases ({formatCurrency(impulseTotal)}). 
                {topImpulseCategory && ` Most in ${topImpulseCategory[0]}.`}
              </p>
            </div>
          </div>
        </Card>
      )
    });
  } else if (impulseRate < 10 && weekSpent > 50) {
    insights.push({
      priority: 7,
      component: (
        <Card key="impulse-excellent" variant="flat" className="bg-green-50/50 border-green-100">
          <div className="flex gap-3">
            <Lightbulb className="text-green-500 shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Exceptional Impulse Control</h4>
              <p className="text-sm text-green-700 mt-1">
                Only {impulseRate.toFixed(1)}% impulse spending this week. Your mindful approach is paying off!
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Category limit violations (dynamic severity)
  if (categoryViolations.length > 0) {
    const totalOverage = categoryViolations.reduce((sum, v) => sum + v.overage, 0);
    const severity = totalOverage / weekSpent;
    
    insights.push({
      priority: severity > 0.3 ? 10 : severity > 0.15 ? 8 : 6,
      component: (
        <Card key="violations" variant="flat" className="bg-red-50/50 border-red-100">
          <div className="flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">
                {categoryViolations.length === 1 ? 'Budget Limit Exceeded' : `${categoryViolations.length} Budgets Exceeded`}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                <strong>{categoryViolations[0].category}</strong>: {formatCurrency(categoryViolations[0].overage)} over limit.
                {categoryViolations.length > 1 && ` Total overage: ${formatCurrency(totalOverage)}.`}
                {' '}{severity > 0.3 ? 'This requires immediate attention.' : 'Adjust spending or update limits.'}
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Weekend pattern (only show if significant)
  if (avgWeekendDaily > avgWeekdayDaily * 2 && weekendSpending > 100) {
    insights.push({
      priority: 6,
      component: (
        <Card key="weekend-pattern" variant="flat" className="bg-blue-50/50 border-blue-100">
          <div className="flex gap-3">
            <Calendar className="text-blue-500 shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Strong Weekend Pattern</h4>
              <p className="text-sm text-blue-700 mt-1">
                Spending doubles on weekends ({formatCurrency(avgWeekendDaily)}/day vs {formatCurrency(avgWeekdayDaily)}/day). 
                Plan budget-friendly weekend activities.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Transaction frequency pattern
  if (recentTransactionCount > avgTransactionsPerDay * 1.5 && weekTransactions.length > 10) {
    insights.push({
      priority: 5,
      component: (
        <Card key="frequency" variant="flat" className="bg-indigo-50/50 border-indigo-100">
          <div className="flex gap-3">
            <Clock className="text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-medium text-indigo-900">Increased Transaction Frequency</h4>
              <p className="text-sm text-indigo-700 mt-1">
                More frequent purchases recently ({recentTransactionCount.toFixed(1)} vs {avgTransactionsPerDay.toFixed(1)}/day average). 
                Batch purchases to reduce impulse opportunities.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Momentum recognition
  if (streakDays >= 7 && safeDays >= 5 && impulseRate < 15) {
    insights.push({
      priority: 7,
      component: (
        <Card key="momentum" variant="flat" className="bg-emerald-50/50 border-emerald-100">
          <div className="flex gap-3">
            <Lightbulb className="text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-medium text-emerald-900">Strong Financial Momentum</h4>
              <p className="text-sm text-emerald-700 mt-1">
                {streakDays}-day streak, {safeDays} safe days, low impulse rate. You're building powerful habits that compound over time!
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Budget discipline needs work
  if (safeDays <= 2 && weekSpent > weeklyTarget * 1.1) {
    insights.push({
      priority: 8,
      component: (
        <Card key="discipline" variant="flat" className="bg-orange-50/50 border-orange-100">
          <div className="flex gap-3">
            <ShoppingBag className="text-orange-500 shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900">Budget Discipline Needed</h4>
              <p className="text-sm text-orange-700 mt-1">
                Only {safeDays} safe days and {formatCurrency(weekSpent - weeklyTarget)} over weekly target. 
                Try daily check-ins or spending alerts.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Positive pattern when improving
  if (impulsesAvoided > 3 && impulseRate < 20 && spendingChange < 0) {
    insights.push({
      priority: 6,
      component: (
        <Card key="improving" variant="flat" className="bg-green-50/50 border-green-100">
          <div className="flex gap-3">
            <TrendingDown className="text-green-500 shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">Multiple Positive Signals</h4>
              <p className="text-sm text-green-700 mt-1">
                Spending down, {impulsesAvoided} impulses avoided, controlled impulse rate. 
                These patterns indicate strong financial decision-making.
              </p>
            </div>
          </div>
        </Card>
      )
    });
  }

  // Sort by priority and take top 3-4
  const displayedInsights = insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
    .map(i => i.component);

  const handleExportReport = async () => {
    setIsDownloading(true);
    try {
      const token = api.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/export?period=${selectedPeriod}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to download report' }));
        throw new Error(error.detail || 'Failed to download report');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Financial_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Failed to download report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="pb-24 pt-8 px-4 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Weekly Report</h1>
        <p className="text-neutral-500 text-sm">Last 7 days</p>
      </header>

      {/* Weekly Wins Summary */}
      <section>
        <WeeklyWinsSummary
          weekSpent={weekSpent}
          lastWeekSpent={lastWeekSpent}
          impulsesAvoided={impulsesAvoided}
          safeDays={safeDays}
          streakDays={streakDays}
        />
      </section>

      {/* Spending Heat Map */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">30-Day Spending Pattern</h2>
        <SpendingHeatMap dailySpending={dailySpendingData} />
      </section>

      {/* Category Limits */}
      <section>
        <CategoryLimitsDisplay categoryLimits={categoryLimits} />
      </section>

      {/* AI Insights - Dynamic based on current data */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">AI Insights</h2>
          <span className="text-xs text-neutral-500">{displayedInsights.length} active</span>
        </div>
        
        {displayedInsights.length > 0 ? (
          <div className="space-y-3">
            {displayedInsights}
          </div>
        ) : (
          <Card variant="flat" className="bg-neutral-50/50 border-neutral-100">
            <div className="flex gap-3">
              <Lightbulb className="text-neutral-400 shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-700">Building Your Profile</h4>
                <p className="text-sm text-neutral-600 mt-1">
                  Keep logging expenses. AI insights will appear as patterns emerge from your spending data.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Excel Report Export */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="text-neutral-600" size={20} />
          <h2 className="text-lg font-semibold text-neutral-900">Export Reports</h2>
        </div>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Download className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">Download Excel Report</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Get a professionally formatted spreadsheet with your income, expenses, and insights
                </p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Report Period</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === 'weekly'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === 'monthly'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPeriod('quarterly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === 'quarterly'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Quarterly
                </button>
                <button
                  onClick={() => setSelectedPeriod('yearly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === 'yearly'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Yearly
                </button>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleExportReport}
              disabled={isDownloading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
                </>
              )}
            </button>

            {/* Report Features */}
            <div className="pt-2 border-t border-emerald-200">
              <p className="text-xs text-neutral-600 mb-2">Report includes:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Financial summary
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Category breakdown
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  All transactions
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Income records
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </motion.div>;
}