import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EmergencyPauseProps {
  amount: number;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function EmergencyPause({ 
  amount, 
  onConfirm, 
  onCancel, 
  isOpen 
}: EmergencyPauseProps) {
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds
  const [reason, setReason] = useState('');
  const [canOverride, setCanOverride] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const handleOverride = () => {
    if (reason.trim().length < 20) {
      alert('Please provide a detailed reason (at least 20 characters)');
      return;
    }
    onConfirm(reason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Warning Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Emergency Pause</h2>
                </div>
                <button
                  onClick={onCancel}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/90">
                This is a large purchase of <span className="font-bold">${amount}</span>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Countdown Timer */}
              <div className="text-center bg-gray-50 rounded-lg p-6">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">Required Wait Time</p>
                <div className="text-4xl font-bold text-gray-900 font-mono">
                  {String(hours).padStart(2, '0')}:
                  {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {timeRemaining === 0 ? 'Wait complete!' : 'Time remaining'}
                </p>
              </div>

              {/* Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Take a breath.</strong> Big purchases deserve reflection. 
                  Come back in 24 hours when emotions have settled.
                </p>
              </div>

              {/* Override Option */}
              <div className="space-y-3">
                <button
                  onClick={() => setCanOverride(!canOverride)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline w-full text-left"
                >
                  {canOverride ? 'Hide override option' : 'I really need to buy this now'}
                </button>

                {canOverride && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3"
                  >
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">
                        Why is this purchase urgent? (Required)
                      </span>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Write a detailed explanation of why you need to buy this right now..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                      <span className="text-xs text-gray-500">
                        {reason.length}/20 characters minimum
                      </span>
                    </label>

                    <button
                      onClick={handleOverride}
                      disabled={reason.trim().length < 20}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Override & Purchase Now
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      This reason will be saved with your transaction
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              {timeRemaining === 0 && (
                <button
                  onClick={() => onConfirm('')}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Continue with Purchase
                </button>
              )}

              <button
                onClick={onCancel}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel Purchase
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
