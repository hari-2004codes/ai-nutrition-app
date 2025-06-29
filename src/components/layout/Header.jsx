import React from 'react';
import { Menu, Bell, User, ChevronLeft, ChevronRight, HeartPulse} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick, onSidebarToggle, sidebarCollapsed }) {
  const userData = JSON.parse(localStorage.getItem('nutritionUser') || '{}');
  const navigate = useNavigate();
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-dark-100   backdrop-blur-lg border-b border-dark-300/50"
    >
      <div className="flex items-center justify-between px-4 lg:px-4 h-16">
        <div className="flex items-center gap-4">
          
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-dark-200 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-6 h-6 text-text-muted" />
          </button>
          
          
          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex p-2 rounded-xl hover:bg-dark-200 transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            )}
          </button>
          
          
          <div className="flex items-center gap-2 ml-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-DEFAULT to-primary-600 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-DEFAULT to-primary-600 bg-clip-text text-transparent">
              NutriTracker
            </h1>
          </div>
        </div>

        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 bg-dark-200 rounded-xl px-3 py-2 cursor-pointer">
            <div className="w-8 h-8 bg-primary-DEFAULT rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-text-base hidden sm:block">
              {userData.name || 'User'}
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}