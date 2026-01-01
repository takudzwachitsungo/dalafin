import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}
// Combine Framer Motion props with HTML Button props
type MotionButtonProps = ButtonProps & HTMLMotionProps<'button'>;
export const Button = forwardRef<HTMLButtonElement, MotionButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-95',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
    outline: 'bg-transparent border border-neutral-200 text-neutral-900 hover:bg-neutral-50 active:scale-95'
  };
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg font-medium',
    icon: 'h-12 w-12 p-0 flex items-center justify-center'
  };
  return <motion.button ref={ref} className={cn('inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)} whileTap={{
    scale: 0.96
  }} {...props}>
        {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : children}
      </motion.button>;
});
Button.displayName = 'Button';