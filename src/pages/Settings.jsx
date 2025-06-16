import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Trash2,
  Moon,
  Sun,
  Globe,
  Smartphone
} from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    goalAchievements: true,
    weeklyReports: false,
    socialUpdates: true
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'en',
    units: 'metric',
    startOfWeek: 'monday'
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          key: 'mealReminders',
          label: 'Meal Reminders',
          description: 'Get notified when it\'s time to log your meals',
          type: 'toggle'
        },
        {
          key: 'goalAchievements',
          label: 'Goal Achievements',
          description: 'Celebrate when you reach your nutrition goals',
          type: 'toggle'
        },
        {
          key: 'weeklyReports',
          label: 'Weekly Reports',
          description: 'Receive weekly nutrition summary reports',
          type: 'toggle'
        },
        {
          key: 'socialUpdates',
          label: 'Social Updates',
          description: 'Get notified about friend activities and challenges',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        {
          key: 'darkMode',
          label: 'Dark Mode',
          description: 'Switch to dark theme for better night viewing',
          type: 'toggle'
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Choose your preferred language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' }
          ]
        },
        {
          key: 'units',
          label: 'Units',
          description: 'Choose between metric and imperial units',
          type: 'select',
          options: [
            { value: 'metric', label: 'Metric (kg, cm)' },
            { value: 'imperial', label: 'Imperial (lbs, ft)' }
          ]
        },
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-base mb-2">Settings</h1>
        <p className="text-text-muted text-lg">Customize your NutriTracker experience</p>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20"
        >
          <h2 className="text-2xl font-bold text-text-base mb-6 flex items-center gap-2">
            <section.icon className="w-6 h-6" />
            {section.title}
          </h2>

          <div className="space-y-6">
            {section.items.map((item, itemIndex) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                className="flex items-center justify-between p-4 bg-dark-300/40 rounded-xl border border-card-border"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-text-base mb-1">{item.label}</h3>
                  <p className="text-sm text-text-muted">{item.description}</p>
                </div>

                <div className="ml-4">
                  {item.type === 'toggle' && (
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notifications[item.key] || preferences[item.key]
                          ? 'bg-primary-DEFAULT'
                          : 'bg-dark-100/70'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          notifications[item.key] || preferences[item.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}

                  {item.type === 'select' && (
                    <select
                      value={preferences[item.key]}
                      onChange={(e) => handlePreferenceChange(item.key, e.target.value)}
                      className="px-3 py-2 bg-dark-300/60 border border-card-border rounded-lg focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base"
                    >
                      {item.options.map((option) => (
                        <option className='bg-primary-DEFAULT hover:bg-dark-200' key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}