import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface BeforeYouBuyCalculatorProps {
  amount: number;
  monthlyIncome: number;
  dailyLimit: number;
}

export function BeforeYouBuyCalculator({
  amount,
  monthlyIncome,
  dailyLimit
}: BeforeYouBuyCalculatorProps) {
  // Calculate hours of work (assuming 160 hours per month)
  const hourlyWage = monthlyIncome / 160;
  const hoursOfWork = Math.round(amount / hourlyWage * 10) / 10;

  // Calculate days saved by waiting
  const daysToWait = Math.ceil(amount / dailyLimit);

  // Calculate what else you could buy
  const alternatives = [
    { name: 'Coffee runs', count: Math.floor(amount / 5) },
    { name: 'Movie tickets', count: Math.floor(amount / 15) },
    { name: 'Meals out', count: Math.floor(amount / 25) },
    { name: 'Books', count: Math.floor(amount / 20) }
  ].filter(alt => alt.count > 0);

  // Calculate investment opportunity cost (7% annual return)
  const fiveYearValue = Math.round(amount * Math.pow(1.07, 5));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Hours of Work */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Hours of Work</p>
            <p className="text-2xl font-bold text-blue-700">{hoursOfWork}h</p>
            <p className="text-sm text-blue-600 mt-1">
              At ${hourlyWage.toFixed(0)}/hour, this costs {hoursOfWork} hours of your life
            </p>
          </div>
        </div>
      </div>

      {/* Days by Waiting */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Save Gradually</p>
            <p className="text-2xl font-bold text-amber-700">{daysToWait} days</p>
            <p className="text-sm text-amber-600 mt-1">
              By waiting and saving your daily budget, you could buy this guilt-free
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Uses */}
      {alternatives.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-purple-900 mb-2">Or You Could Get</p>
              <div className="grid grid-cols-2 gap-2">
                {alternatives.slice(0, 4).map((alt, idx) => (
                  <div key={idx} className="text-sm text-purple-700">
                    {alt.count} {alt.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Opportunity */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-900">If You Invested Instead</p>
            <p className="text-2xl font-bold text-emerald-700">${fiveYearValue}</p>
            <p className="text-sm text-emerald-600 mt-1">
              In 5 years at 7% return • That's +${fiveYearValue - amount} more
            </p>
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700 font-medium">
          Still worth {hoursOfWork} hours of your life?
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Take a moment to reflect on this decision
        </p>
      </div>
    </motion.div>
  );
}
