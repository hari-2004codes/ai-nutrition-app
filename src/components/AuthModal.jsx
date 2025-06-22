
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose(); // Close modal on successful sign-in
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      console.error("Authentication error:", error.message);
      if (error.code === 'auth/email-already-in-use') {
        setError("Email already in use. Please log in or use a different email.");
      } else if (error.code === 'auth/invalid-credential') {
          setError("Invalid credentials. Please check your email and password.");
      } else if (error.code === 'auth/weak-password') {
          setError("Password should be at least 6 characters.");
      }
      else {
        setError("Authentication failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611 20.083H42V20H24v8h11.341c-1.684 2.924-4.505 5.34-7.859 6.879l.666 1.343a22.956 22.956 0 007.135 2.146l.659 1.35C35.08 38.65 39.563 36 42 32.228V20.083z" fill="#FFC107"/>
            <path d="M6.39 14.593l-.689-1.349C3.765 15.65 2 18.571 2 22.001c0 3.197.94 6.136 2.531 8.608l1.326-1.312C4.195 27.534 3.25 24.898 3.25 22.001c0-2.395.748-4.636 2.062-6.408z" fill="#4CAF50"/>
            <path d="M24 6c3.218 0 6.276 1.258 8.531 3.322l5.067-4.996C34.254 2.188 29.387 0 24 0 14.153 0 5.253 5.483 1.096 13.064l1.358.682C5.006 7.625 13.785 2.5 24 2.5V6z" fill="#E53935"/>
            <path d="M42 20.083V20H24v8h11.341c-1.684 2.924-4.505 5.34-7.859 6.879l.666 1.343a22.956 22.956 0 007.135 2.146l.659 1.35C35.08 38.65 39.563 36 42 32.228V20.083z" fill="#4285F4"/>
            <path d="M24 25.5c-3.13 0-5.875-1.57-7.531-3.953l-1.326 1.312C16.14 24.966 19.86 27.5 24 27.5c4.14 0 7.86-2.534 9.857-6.074L32.53 20.7c-1.656 2.383-4.39 3.93-7.53 3.93z" fill="#FBBC04"/>
          </svg>
          Sign {isLogin ? 'In' : 'Up'} with Google
        </button>

        <p className="text-center text-sm mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null); // Clear error when switching
            }}
            className="text-blue-500 hover:text-blue-800 font-bold focus:outline-none"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;