import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reflection: { regretPurchase?: string; goodPurchase?: string; notes?: string }) => void;
}

export function ReflectionModal({ isOpen, onClose, onSubmit }: ReflectionModalProps) {
  const [regretPurchase, setRegretPurchase] = useState('');
  const [goodPurchase, setGoodPurchase] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      regretPurchase: regretPurchase.trim() || undefined,
      goodPurchase: goodPurchase.trim() || undefined,
      notes: notes.trim() || undefined
    });
    setRegretPurchase('');
    setGoodPurchase('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="relative w-full max-w-lg mx-4 sm:mx-auto"
        >
          <Card className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Daily Reflection</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Take a moment to review today's spending
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Regret Question */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <AlertCircle size={16} className="text-amber-500" />
                What's one purchase you regret today?
              </label>
              <textarea
                value={regretPurchase}
                onChange={(e) => setRegretPurchase(e.target.value)}
                placeholder="Be honest with yourself... (optional)"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
                rows={3}
              />
              <p className="text-xs text-neutral-400">
                Recognizing regret helps you avoid it next time
              </p>
            </div>

            {/* Good Purchase Question */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Heart size={16} className="text-emerald-500" />
                What's one purchase you feel good about?
              </label>
              <textarea
                value={goodPurchase}
                onChange={(e) => setGoodPurchase(e.target.value)}
                placeholder="Celebrate the wins... (optional)"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                rows={3}
              />
              <p className="text-xs text-neutral-400">
                Positive reinforcement builds better habits
              </p>
            </div>

            {/* Optional Notes */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">
                Any other thoughts? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What patterns did you notice today?"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Skip Today
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
              >
                Complete Reflection
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
