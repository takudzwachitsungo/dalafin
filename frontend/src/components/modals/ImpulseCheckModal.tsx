import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, TrendingDown, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

interface ImpulseCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onAddToWishlist: () => void;
  amount: number;
  category: string;
}

export function ImpulseCheckModal({
  isOpen,
  onClose,
  onProceed,
  onAddToWishlist,
  amount,
  category
}: ImpulseCheckModalProps) {
  const [step, setStep] = useState(1);
  const [isNeed, setIsNeed] = useState<boolean | null>(null);

  const resetAndClose = () => {
    setStep(1);
    setIsNeed(null);
    onClose();
  };

  const handleNeedAnswer = (answer: boolean) => {
    setIsNeed(answer);
    if (!answer) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleRegretAnswer = (answer: boolean) => {
    if (answer) {
      setStep(4); // Suggest waiting
    } else {
      setStep(3); // Final decision
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Impulse Check</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {formatCurrency(amount)} · {category}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={resetAndClose}>
                <X size={20} />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <AlertTriangle className="mx-auto mb-4 text-amber-500" size={48} />
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                      Hold on a second!
                    </h4>
                    <p className="text-sm text-neutral-600 mb-1">
                      You're about to spend <span className="font-bold text-neutral-900">{formatCurrency(amount)}</span>
                    </p>
                    <p className="text-sm text-neutral-500">
                      Do you really need this right now?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleNeedAnswer(false)}
                    >
                      Not Really
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleNeedAnswer(true)}
                    >
                      Yes, I Need It
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <Clock className="mx-auto mb-4 text-blue-500" size={48} />
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                      Can you wait 24 hours?
                    </h4>
                    <p className="text-sm text-neutral-500 mb-3">
                      If you still want it tomorrow, it's probably worth it
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleRegretAnswer(false)}
                    >
                      Buy Now
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleRegretAnswer(true)}
                    >
                      Wait 24 Hours
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <TrendingDown className="mx-auto mb-4 text-neutral-600" size={48} />
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                      Last chance to reconsider
                    </h4>
                    <p className="text-sm text-neutral-500 mb-4">
                      Spending {formatCurrency(amount)} on {category}
                    </p>
                    <Card variant="flat" className="bg-amber-50 text-left mb-4">
                      <p className="text-sm text-amber-900">
                        This will be marked as an <strong>impulse purchase</strong> in your reports
                      </p>
                    </Card>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        onAddToWishlist();
                        resetAndClose();
                      }}
                    >
                      Save to Impulses
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        onProceed();
                        resetAndClose();
                      }}
                    >
                      Buy Anyway
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <Heart className="mx-auto mb-4 text-emerald-500" size={48} />
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                      Smart choice!
                    </h4>
                    <p className="text-sm text-neutral-500 mb-4">
                      Save to your impulses list and revisit later
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        onProceed();
                        resetAndClose();
                      }}
                    >
                      Buy Now Anyway
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        onAddToWishlist();
                        resetAndClose();
                      }}
                    >
                      Save to Impulses
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
