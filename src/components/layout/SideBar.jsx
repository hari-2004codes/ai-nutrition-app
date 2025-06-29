import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Utensils, 
  User, 
  Target,
  TrendingUp,
  X,
  Calendar,
  BarChart3
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/meals', icon: Utensils, label: 'Meal Log' },
  { path: '/meal-plans', icon: Calendar, label: 'Meal Plans' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggle }) {
  const userData = JSON.parse(localStorage.getItem('nutritionUser') || '{}');

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 72 : 240,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:block fixed left-0 top-0 h-full bg-dark-100 backdrop-blur-lg border-r border-dark-300/50 z-30"
      >
        <div className="pt-20 px-2">
          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive}) =>
                  `flex justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-dark-200 text-text-base'
                      : 'text-text-muted hover:bg-dark-200 hover:text-text-base'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Today's Goal Widget */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 p-4 bg-gradient-to-r from-dark-200 to-dark-300 rounded-xl border border-dark-300/50 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-text-base" />
                  <span className="font-semibold text-text-base">Today's Goal</span>
                </div>
                <div className="text-sm text-text-base">
                  <p>Calories: 1,847 / 2,200</p>
                  <div className="w-full bg-dark-200 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed left-0 top-0 h-full w-64 bg-dark-100 backdrop-blur-lg border-r border-dark-300/50 z-40"
      >
        <div className="p-6 pt-20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-dark-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink  
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-dark-200 text-text-base'
                      : 'text-text-muted hover:bg-dark-200 hover:text-text-base'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Today's Goal Widget */}
          <div className="mt-8 p-4 bg-gradient-to-r from-dark-200 to-dark-300 rounded-xl border border-dark-300/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-text-base">Today's Goal</span>
            </div>
            <div className="text-sm text-text-base">
              <p>Calories: 1,847 / 2,200</p>
              <div className="w-full bg-dark-200 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}