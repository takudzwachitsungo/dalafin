import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Target, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CelebrationMomentsProps {
  streakDays: number;
  totalSaved: number;
  impulsesAvoided: number;
  onDismiss: () => void;
}

type Milestone = {
  id: string;
  title: string;
  message: string;
  icon: typeof Trophy;
  gradient: string;
};

export function CelebrationMoments({ 
  streakDays, 
  totalSaved, 
  impulsesAvoided,
  onDismiss 
}: CelebrationMomentsProps) {
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    // Check for milestones
    let detectedMilestone: Milestone | null = null;

    if (streakDays === 7) {
      detectedMilestone = {
        id: 'streak-7',
        title: 'First Week Streak!',
        message: '7 days of mindful spending. You\'re building great habits!',
        icon: Flame,
        gradient: 'from-orange-500 to-red-500'
      };
    } else if (streakDays === 30) {
      detectedMilestone = {
        id: 'streak-30',
        title: '30-Day Champion!',
        message: 'A full month of consistent progress. You\'re unstoppable!',
        icon: Flame,
        gradient: 'from-red-500 to-pink-500'
      };
    } else if (totalSaved >= 100 && totalSaved < 101) {
      detectedMilestone = {
        id: 'saved-100',
        title: '$100 Saved!',
        message: 'Your first hundred dollars saved. Keep the momentum going!',
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-green-500'
      };
    } else if (totalSaved >= 500 && totalSaved < 501) {
      detectedMilestone = {
        id: 'saved-500',
        title: '$500 Milestone!',
        message: 'Halfway to $1,000. Your goals are within reach!',
        icon: TrendingUp,
        gradient: 'from-green-500 to-emerald-600'
      };
    } else if (impulsesAvoided === 5) {
      detectedMilestone = {
        id: 'impulses-5',
        title: '5 Impulses Resisted!',
        message: 'You\'re gaining control over impulse spending. Well done!',
        icon: Target,
        gradient: 'from-blue-500 to-indigo-500'
      };
    } else if (impulsesAvoided === 20) {
      detectedMilestone = {
        id: 'impulses-20',
        title: '20 Impulses Avoided!',
        message: 'Your self-control is impressive. Keep it up!',
        icon: Target,
        gradient: 'from-indigo-500 to-purple-500'
      };
    }

    if (detectedMilestone) {
      setMilestone(detectedMilestone);
      
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
      }));
      setConfettiPieces(pieces);
    }
  }, [streakDays, totalSaved, impulsesAvoided]);

  if (!milestone) return null;

  const Icon = milestone.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onDismiss}
      >
        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ 
                y: -20, 
                x: `${piece.x}vw`,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                y: '100vh',
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: 2,
                delay: piece.delay,
                ease: 'easeOut'
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}
        </div>

        {/* Milestone Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${milestone.gradient} p-8 text-white text-center`}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            >
              <Icon className="w-20 h-20 mx-auto mb-4" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              {milestone.title}
            </motion.h2>
          </div>

          {/* Message Body */}
          <div className="p-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 text-lg mb-6"
            >
              {milestone.message}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
