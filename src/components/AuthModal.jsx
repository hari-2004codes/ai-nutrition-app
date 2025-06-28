import React, { useState } from 'react';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Email/Password submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin
        ? { email, password }
        : { name, email, password };
      const { data } = await axios.post(url, payload);
      // Save your JWT
      localStorage.setItem('token', data.token);
      // Optionally save user info: data.user
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.msg || 'Authentication failed');
    }
  };

  // Google Sign-In via Firebase + backend
  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      // 1) Trigger Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      // 2) Get Firebase ID token
      const idToken = await result.user.getIdToken();
      // 3) Send to backend route
      const { data } = await axios.post('/api/auth/firebase', { idToken });
      // 4) Save your JWT
      localStorage.setItem('token', data.token);
      // Optionally save user info: data.user
      onClose();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.response?.data?.msg || 'Google sign-in failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full mb-4 flex items-center justify-center border rounded py-2 hover:bg-gray-100"
        >
          <img src="/google-logo.svg" alt="Google" className="h-5 w-5 mr-2" />
          Continue with Google
        </button>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          {isLogin ? "Don't have an account?" : 'Already have one?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-blue-500"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
