import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/SideBar';
import Dashboard from './pages/DashBoard';
import Profile from './pages/Profile';
import MealLog from './pages/MealLogging';
import MealPlans from './pages/MealPlans';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import LoadingSpinner from './components/general_comp/LoadingSpinner';
import ErrorBoundary from './components/general_comp/ErrorBoundary';

import AuthModal from './components/AuthModal';
import {auth} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper function to safely check localStorage
  const hasValidUserData = () => {
    try {
      const nutritionUser = localStorage.getItem('nutritionUser');
      const user = localStorage.getItem('user');
      
      // Check if either exists and is valid JSON (not "undefined" or "null" strings)
      if (nutritionUser && nutritionUser !== "undefined" && nutritionUser !== "null" && nutritionUser !== "{}") {
        const parsed = JSON.parse(nutritionUser);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return true;
        }
      }
      
      if (user && user !== "undefined" && user !== "null" && user !== "{}") {
        const parsed = JSON.parse(user);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('nutritionUser');
      localStorage.removeItem('user');
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('User logged in:', firebaseUser);
            setIsLoggedIn(true);
            setUser(firebaseUser);

            // Check if user has completed onboarding
            if (hasValidUserData()) {
              setIsOnboarded(true);
            } else {
              setIsOnboarded(false);
            }
            
          } else {
            console.log('User logged out');
            setIsLoggedIn(false);
            setUser(null);
            setIsOnboarded(false);
            
            // Clear user data from localStorage
            localStorage.removeItem('nutritionUser');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          setIsLoading(false);
        });

        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState !== null) {
          setSidebarCollapsed(JSON.parse(savedSidebarState));
        }
        
        const handleResize = () => {
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
          }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          unsubscribe(); // Clean up the auth listener
        };
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSidebarToggle = () => {
    try {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save sidebar state:', error);
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMobileSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleOnboardingComplete = (userData) => {
    // Save user data to localStorage to mark as onboarded
    if (userData && typeof userData === 'object') {
      localStorage.setItem('nutritionUser', JSON.stringify(userData));
      setIsOnboarded(true);
    } else {
      console.error('Invalid user data provided to onboarding complete');
    }
  };

  const handleAuthModalClose = () => {
    // The onAuthStateChanged listener handles the state updates
    // This is just for manual modal closing if needed
  };

  // Custom error boundary handlers
  const handleAppError = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleRouteError = () => {
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <ErrorBoundary onGoHome={handleAppError}>
        <LoadingSpinner />
      </ErrorBoundary>
    );
  }

  if (!isLoggedIn) {
    return (
      <ErrorBoundary onGoHome={handleAppError}>
        <AuthModal onClose={handleAuthModalClose} />
      </ErrorBoundary>
    );
  }

  if (!isOnboarded) {
    return (
      <ErrorBoundary onGoHome={handleAppError}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onGoHome={handleAppError}>
      <div className="min-h-screen bg-dark-100">
        {/* Header */}
        <ErrorBoundary onGoHome={handleAppError}>
          <Header 
            onMenuClick={handleMobileSidebarToggle}
            onSidebarToggle={handleSidebarToggle}
            sidebarCollapsed={sidebarCollapsed}
          />
        </ErrorBoundary>
        
        <div className="flex relative">
          {/* Sidebar */}
          <ErrorBoundary onGoHome={handleAppError}>
            <Sidebar 
              isOpen={sidebarOpen}
              isCollapsed={sidebarCollapsed}
              onClose={() => setSidebarOpen(false)}
              onToggle={handleSidebarToggle}
            />
          </ErrorBoundary>
          
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Main Content Area */}
          <main 
            className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${
              sidebarCollapsed 
                ? 'lg:ml-16' 
                : 'lg:ml-64'
            }`}
          >
            <div className="p-4 lg:p-8 max-w-7xl mx-auto">
              <ErrorBoundary onGoHome={handleRouteError}>
                <div>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ErrorBoundary onGoHome={handleRouteError}>
                          <Dashboard />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/meals" 
                      element={
                        <ErrorBoundary onGoHome={handleRouteError}>
                          <MealLog />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/meal-plans" 
                      element={
                        <ErrorBoundary onGoHome={handleRouteError}>
                          <MealPlans />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ErrorBoundary onGoHome={handleRouteError}>
                          <Profile />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ErrorBoundary onGoHome={handleRouteError}>
                          <Settings />
                        </ErrorBoundary>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;