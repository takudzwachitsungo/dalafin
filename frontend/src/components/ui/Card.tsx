import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'outlined';
}
export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white shadow-sm border border-neutral-100',
    flat: 'bg-neutral-100',
    outlined: 'bg-transparent border border-neutral-200'
  };
  return <motion.div className={cn('rounded-2xl p-6 overflow-hidden', variants[variant], className)} initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    ease: 'easeOut'
  }} {...props}>
      {children}
    </motion.div>;
}