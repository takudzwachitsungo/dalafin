import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PlusCircle, Heart, BarChart2, User, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
export function BottomNavigation() {
  const location = useLocation();
  const tabs = [{
    id: 'today',
    label: 'Today',
    icon: Home,
    path: '/today'
  }, {
    id: 'spend',
    label: 'Spend',
    icon: PlusCircle,
    path: '/spend'
  }, {
    id: 'income',
    label: 'Income',
    icon: Wallet,
    path: '/income'
  }, {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
    path: '/wishlist'
  }, {
    id: 'reports',
    label: 'Reports',
    icon: BarChart2,
    path: '/reports'
  }, {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile'
  }];
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-neutral-100 pb-safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return <Link key={tab.id} to={tab.path} className="relative flex flex-col items-center justify-center w-full h-full">
              {isActive && <motion.div layoutId="nav-indicator" className="absolute top-0 w-8 h-1 bg-neutral-900 rounded-b-full" transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }} />}

              <div className={cn('flex flex-col items-center justify-center gap-1 transition-colors duration-200', isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600')}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            </Link>;
      })}
      </div>
    </nav>;
}