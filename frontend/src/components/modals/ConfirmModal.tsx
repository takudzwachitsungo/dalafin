import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      icon: 'text-amber-500',
      bg: 'bg-amber-50',
      button: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-50',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const style = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </button>

            {/* Icon */}
            <div className={`h-14 w-14 rounded-full ${style.bg} flex items-center justify-center mb-4`}>
              <AlertCircle className={`${style.icon}`} size={28} />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button
                className={`flex-1 ${style.button}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
