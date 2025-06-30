import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/SideBar';
import Dashboard from './pages/DashBoard';
import Profile from './pages/Profile';
import MealLog from './pages/MealLogging';
import MealPlans from './pages/MealPlans';
import Onboarding from './pages/Onboarding';
import LoadingSpinner from './components/general_comp/LoadingSpinner';
import ErrorBoundary from './components/general_comp/ErrorBoundary';

import AuthModal from './components/AuthModal';
import {auth} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'
import authService from './services/authService';

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setISLoggedIn] = useState(false);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            console.log('🔥 Firebase user authenticated:', user.email);
            setISLoggedIn(true);

            try {
              // Check if we have a backend token, if not sync with backend
              if (!authService.getToken()) {
                console.log('🔄 No backend token found, syncing with backend...');
                const idToken = await user.getIdToken();
                await authService.syncWithBackend(idToken);
                console.log('✅ Backend token synced successfully');
              }

              // Fetch user profile from backend to get accurate onboarding status
              console.log('🔄 Fetching user profile from backend...');
              const profile = await authService.getProfile();
              console.log('✅ Profile fetched:', profile);
              
              // Check onboarding completion from backend profile
              const hasCompletedOnboarding = profile.onboardingCompleted || false;
              console.log('📋 Onboarding completed (from backend):', hasCompletedOnboarding);
              setIsOnboarded(hasCompletedOnboarding);
              
              // Update localStorage with profile data
              const currentUser = authService.getCurrentUser();
              if (currentUser && profile) {
                const updatedUser = { 
                  ...currentUser, 
                  onboardingCompleted: hasCompletedOnboarding,
                  ...profile // Include all profile data
                };
                localStorage.setItem('nutritionUser', JSON.stringify(updatedUser));
              }
              
            } catch (error) {
              console.error('❌ Error fetching profile:', error);
              // Fallback to localStorage check
            const hasCompletedOnboarding = authService.hasCompletedOnboarding();
              console.log('📋 Onboarding completed (fallback to localStorage):', hasCompletedOnboarding);
            setIsOnboarded(hasCompletedOnboarding);
            }
            
          } else {
            console.log('🚪 No Firebase user, clearing state');
            setISLoggedIn(false);
            setIsOnboarded(false);
            // Clear any stale data
            authService.logout();
          }
          setIsLoading(false);
        });

        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState !== null) {
          setSidebarCollapsed(JSON.parse(savedSidebarState));
        }
        
        // Auto-collapse sidebar on mobile
        const handleResize = () => {
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
          }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
        // Don't throw here - let the app continue with default state
      }
    };

    initializeApp();
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    try {
      const newState = !sidebarCollapsed;
      setSidebarCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    } catch (error) {
      // Fallback if localStorage fails
      console.warn('Failed to save sidebar state:', error);
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Handle mobile sidebar toggle
  const handleMobileSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle navigation after onboarding completion
  useEffect(() => {
    if (isLoggedIn && isOnboarded && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, isOnboarded, location.pathname, navigate]);

  const handleOnboardingComplete = async () => {
    console.log('✅ Onboarding completed, updating state');
    setIsOnboarded(true);
    
    try {
      // Fetch the latest profile from backend to ensure we have the most up-to-date data
      const profile = await authService.getProfile();
      console.log('✅ Latest profile fetched after onboarding:', profile);
      
      // Update the user data in localStorage with complete profile data
      const currentUser = authService.getCurrentUser();
      if (currentUser && profile) {
        const updatedUser = { 
          ...currentUser, 
          onboardingCompleted: true,
          ...profile // Include all profile data
        };
        localStorage.setItem('nutritionUser', JSON.stringify(updatedUser));
        console.log('✅ localStorage updated with complete profile data');
      }
    } catch (error) {
      console.error('❌ Error updating profile after onboarding:', error);
      // Fallback: just update localStorage with onboarding completion
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, onboardingCompleted: true };
      localStorage.setItem('nutritionUser', JSON.stringify(updatedUser));
      }
    }
  };

   const handleAuthModalClose = () => {
    // When the modal closes, the onAuthStateChanged listener should have already updated isLoggedIn
    // If you need to explicitly re-check or re-render based on this, you can,
    // but the useEffect with onAuthStateChanged handles it reactively.
  };

  // Custom error boundary handlers
  const handleAppError = () => {
    // Navigate to dashboard on app-level errors
    navigate('/dashboard', { replace: true });
  };

  const handleRouteError = () => {
    // Navigate to dashboard on route-level errors
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <ErrorBoundary onGoHome={handleAppError}>
        <LoadingSpinner />
      </ErrorBoundary>
    );
  }

  // Debug logging
  console.log('🔍 App State Debug:', {
    isLoggedIn,
    isOnboarded,
    isLoading,
    currentPath: location.pathname,
    hasToken: !!authService.getToken(),
    hasUser: !!authService.getCurrentUser()
  });

  if (!isLoggedIn) {
    return (
      <ErrorBoundary onGoHome={handleAppError}>
        {/* Render AuthModal here. It will close itself on successful login. */}
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