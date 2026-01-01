import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
interface WishlistItemProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  daysWaiting: number;
  cooldownDays: number;
  status: 'waiting' | 'purchased';
  purchasedDate?: string;
  onRemove: (id: string) => void;
  onBuy: (id: string) => void;
}
export function WishlistItem({
  id,
  name,
  price,
  imageUrl,
  daysWaiting,
  cooldownDays,
  status,
  purchasedDate,
  onRemove,
  onBuy
}: WishlistItemProps) {
  const progress = Math.min(daysWaiting / cooldownDays * 100, 100);
  const isReady = daysWaiting >= cooldownDays;
  const daysRemaining = cooldownDays - daysWaiting;
  const isPurchased = status === 'purchased';
  
  return <motion.div layout initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.9
  }} className={cn('relative p-5 rounded-2xl border transition-all', isPurchased ? 'bg-neutral-50 border-neutral-200 opacity-75' : isReady ? 'bg-white border-emerald-200 shadow-sm shadow-emerald-100/50' : 'bg-white border-neutral-100 shadow-sm')}>
      {imageUrl && (
        <div className="mb-4 -mx-5 -mt-5">
          <img 
            src={imageUrl} 
            alt={name} 
            className={cn("w-full h-40 object-cover rounded-t-2xl", isPurchased && "opacity-60")}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      {isPurchased && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
          <CheckCircle size={14} />
          Purchased
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={cn("font-semibold text-lg", isPurchased ? "text-neutral-500 line-through" : "text-neutral-900")}>{name}</h3>
          <p className={cn("font-medium", isPurchased ? "text-neutral-400" : "text-neutral-500")}>
            {formatCurrency(price)}
          </p>
          {isPurchased && purchasedDate && (
            <p className="text-xs text-neutral-400 mt-1">
              Bought on {new Date(purchasedDate).toLocaleDateString()}
            </p>
          )}
        </div>
        {!isPurchased && (isReady ? (
          <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full animate-pulse">
            Ready to buy
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            <Clock size={12} />
            {daysRemaining}d left
          </div>
        ))}
      </div>

      {!isPurchased && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
              <span>Cooldown Period</span>
              <span>
                {daysWaiting}/{cooldownDays} days
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <motion.div className={cn('h-full rounded-full', isReady ? 'bg-emerald-500' : 'bg-blue-500')} initial={{
              width: 0
            }} animate={{
              width: `${progress}%`
            }} transition={{
              duration: 1,
              ease: 'easeOut'
            }} />
            </div>
            {!isReady && (
              <p className="text-xs text-neutral-400 mt-1.5">
                Still want it? Check back in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant={isReady ? 'primary' : 'secondary'} size="sm" className="flex-1" disabled={!isReady} onClick={() => onBuy(id)}>
              {isReady ? 'Buy Now' : `${daysRemaining}d remaining`}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-red-500" onClick={() => onRemove(id)}>
              <Trash2 size={18} />
            </Button>
          </div>
        </>
      )}
      
      {isPurchased && (
        <div className="text-center py-2 text-sm text-neutral-400">
          Kept for record keeping
        </div>
      )}
    </motion.div>;
}