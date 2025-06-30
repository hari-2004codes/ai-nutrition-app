import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import authService from '../services/authService';
import { X } from 'lucide-react';
import googleIcon from '../assets/google-icon-logo-svgrepo-com (1).svg';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email/Password submit - Now uses Firebase Auth
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      let userCredential;
      
      if (isLogin) {
        // Firebase login
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        // Firebase signup
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      
      // Sync with backend for both login and signup
      const idToken = await userCredential.user.getIdToken();
      await authService.syncWithBackend(idToken, !isLogin, name.trim());
      
      // Don't call onClose() here - let the App.jsx useEffect handle the state change
      // The onAuthStateChanged listener will detect the Firebase auth change
      
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'Authentication failed';
      
      // Handle Firebase-specific errors
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          default:
            errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In via Firebase + backend
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // 1) Trigger Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2) Get Firebase ID token and send to backend
      const idToken = await result.user.getIdToken();
      await authService.syncWithBackend(idToken, result._tokenResponse?.isNewUser || false);
      
      // Don't call onClose() here - let the App.jsx useEffect handle the state change
      // The onAuthStateChanged listener will detect the Firebase auth change
      
    } catch (err) {
      console.error('Google sign-in error:', err);
      let errorMessage = 'Google sign-in failed';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up was blocked by your browser';
            break;
          default:
            errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl shadow-xl border border-card-border w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark-300/70 text-text-muted hover:text-text-base transition-colors"
          disabled={loading}
        >
          <X size={20} />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-text-base">
            {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
            className="w-full mb-4 flex items-center justify-center border border-card-border rounded-xl py-3 px-4 bg-dark-100 hover:bg-dark-300 text-text-base disabled:bg-dark-300/50 disabled:cursor-not-allowed transition-colors duration-200"
        >
            <img src={googleIcon} alt="Google" className="h-5 w-5 mr-2" />
          {loading ? 'Processing...' : 'Continue with Google'}
        </button>

          <div className="text-center text-text-muted mb-4">or</div>

          <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
              <div>
                <label htmlFor="name" className="block mb-2 font-medium text-text-base">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:outline-none focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 disabled:bg-dark-300/50"
                placeholder="Enter your full name"
              />
            </div>
          )}
          
            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-text-base">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:outline-none focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 disabled:bg-dark-300/50"
              placeholder="Enter your email"
            />
          </div>
          
            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-text-base">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
                className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:outline-none focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 disabled:bg-dark-300/50"
              placeholder="Enter your password"
              minLength="6"
                disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
              className="w-full bg-primary-DEFAULT hover:bg-primary-600 disabled:bg-primary-DEFAULT/50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>
        
          <p className="text-center text-sm mt-6 text-text-muted">
          {isLogin ? "Don't have an account?" : 'Already have one?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setName('');
              setEmail('');
              setPassword('');
            }}
            disabled={loading}
              className="text-primary-DEFAULT hover:text-primary-400 underline disabled:text-primary-DEFAULT/50 transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;