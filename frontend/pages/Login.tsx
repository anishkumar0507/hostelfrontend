
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';
import { useUI } from '../App';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(email.trim(), password);
      
      // Check if login was successful
      if (!response.success) {
        // Handle case where backend returns success: false
        const msg = response.message || 'Login failed. Please check your credentials.';
        setPassword('');
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }

      // Verify token exists
      if (!response.token) {
        setPassword('');
        setErrorMessage('Login failed. No authentication token received.');
        showToast('Login failed. No authentication token received.', 'error');
        setIsLoading(false);
        return;
      }

      // Login successful - set token and redirect
      login(response.token);

      // Check if password change is required - redirect to change password page
      if (response.requiresPasswordChange || response.forcePasswordChange) {
        navigate('/student/change-password');
        showToast('Please change your temporary password to continue', 'error');
      } else {
        showToast('Login successful!', 'success');
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      // Clear password field on login error
      setPassword('');
      
      // Extract error message
      let msg = 'Login failed. Please check your credentials.';
      
      if (error.message) {
        msg = error.message;
      } else if (error.status === 401) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (error.status === 403) {
        msg = 'Access denied. This portal is for students only.';
      } else if (error.status === 400) {
        msg = error.message || 'Invalid request. Please check your input.';
      }
      
      setErrorMessage(msg);
      showToast(msg, 'error');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button 
          onClick={() => navigate('/select-role')}
          className="text-indigo-100 hover:text-white flex items-center gap-2 mb-8 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Selection
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] mb-6">
              <Home size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Student Portal</h1>
            <p className="text-slate-500 mt-2">Access your hostel dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">University Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 transition-all" />
                <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900">Keep me logged in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Trouble logging in? 
              <a href="#" className="text-indigo-600 ml-1 font-bold hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Login;
