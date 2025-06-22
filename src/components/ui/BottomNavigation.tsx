import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ChartBarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  HeartIcon as HeartIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Today',
    icon: HomeIcon,
    activeIcon: HomeIconSolid
  },
  {
    path: '/steps',
    label: 'Move',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid
  },
  {
    path: '/food',
    label: 'Nourish',
    icon: HeartIcon,
    activeIcon: HeartIconSolid
  },
  {
    path: '/groups',
    label: 'Connect',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: UserIcon,
    activeIcon: UserIconSolid
  }
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full group"
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.9 }}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 bg-blue-100 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
              <span 
                className={`text-xs mt-1 transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 font-medium opacity-100' 
                    : 'text-gray-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};