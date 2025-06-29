import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import authService from '../services/authService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-xl hover:text-gray-700"
          disabled={loading}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 flex items-center justify-center border rounded py-2 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
        >
          <img src="/google-logo.svg" alt="Google" className="h-5 w-5 mr-2" />
          {loading ? 'Processing...' : 'Continue with Google'}
        </button>

        <div className="text-center text-gray-500 mb-4">or</div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1 font-medium">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your password"
              minLength="6"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2 rounded transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>
        
        <p className="text-center text-sm mt-4">
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
            className="text-blue-500 hover:underline disabled:text-blue-300"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;