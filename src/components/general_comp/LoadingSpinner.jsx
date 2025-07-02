import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="fixed inset-0 bg-dark-200 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Background animated circles */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary-DEFAULT"
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              left: '50%',
              top: '50%',
              marginLeft: `-${(i + 1) * 50}px`,
              marginTop: `-${(i + 1) * 50}px`,
            }}
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        ))}
      </motion.div>

      {/* Main content container */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* App Logo/Icon */}
        <motion.div
          className="mb-6 relative"
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotateY: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-DEFAULT to-primary-600 rounded-full flex items-center justify-center shadow-xl">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-white text-2xl"
            >
              🥗
            </motion.div>
          </div>
          {/* Glowing effect */}
          <motion.div
            className="absolute inset-0 bg-primary-DEFAULT/20 rounded-full blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* App Name */}
        <motion.h2
          className="text-2xl font-bold text-text-primary mb-4 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-primary-DEFAULT to-primary-600 bg-clip-text text-transparent">
            Nutri Tracker
          </span>
        </motion.h2>

        {/* Enhanced Loading Spinner */}
        <div className="relative mb-4">
          <motion.div
            className={`${sizeClasses[size]} border-4 border-primary-DEFAULT/30 border-t-primary-DEFAULT rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner spinning circle */}
          <motion.div
            className={`absolute inset-1 border-2 border-primary-600/20 border-b-primary-600 rounded-full`}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Pulsing dot in center */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="w-1 h-1 bg-primary-DEFAULT rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Loading Text with Animation */}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-text-secondary font-medium text-center"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {text}
            </motion.span>
          </motion.p>
        )}

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-DEFAULT/40 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}