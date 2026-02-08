
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck, Home, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../App';
import { useUI } from '../../App';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const WardenLogin: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
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
    
    // Validate required fields for signup
    if (isSignup && (!name.trim() || !email.trim() || !password.trim())) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    // Validate required fields for login
    if (!isSignup && (!email.trim() || !password.trim())) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignup) {
        // Warden signup
        const response = await authAPI.wardenSignup(name.trim(), email.trim(), password);
        
        if (!response.success) {
          const msg = response.message || 'Signup failed. Please try again.';
          setErrorMessage(msg);
          showToast(msg, 'error');
          setIsLoading(false);
          return;
        }

        if (!response.token) {
          const msg = 'Signup failed. No authentication token received.';
          setErrorMessage(msg);
          showToast(msg, 'error');
          setIsLoading(false);
          return;
        }

        showToast('Warden account created successfully!', 'success');
        // Auto-login after successful signup
        login(response.token);
      } else {
        // Login
        const response = await authAPI.login(email.trim(), password);
        
        if (!response.success) {
          // Handle case where backend returns success: false
          const msg = response.message || 'Login failed. Please check your credentials.';
          setPassword('');
          setErrorMessage(msg);
          showToast(msg, 'error');
          setIsLoading(false);
          return;
        }

        if (!response.token) {
          const msg = 'Login failed. No authentication token received.';
          setPassword('');
          setErrorMessage(msg);
          showToast(msg, 'error');
          setIsLoading(false);
          return;
        }

        // Verify it's a warden
        if (response.user?.role !== 'warden') {
          const msg = 'Access denied. This portal is for wardens only.';
          setPassword('');
          setErrorMessage(msg);
          showToast(msg, 'error');
          setIsLoading(false);
          return;
        }

        login(response.token);
        showToast('Login successful!', 'success');
      }
    } catch (error: any) {
      setPassword('');
      let msg: string = error.message || 'An error occurred';
      if (error.status === 401) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (error.status === 403) {
        msg = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 400) {
        msg = error.message || 'Invalid request. Please check your input.';
      } else if (isSignup) {
        msg = error.message || 'Signup failed. Please try again.';
      } else {
        msg = error.message || 'Login failed. Please check your credentials.';
      }
      setErrorMessage(msg);
      showToast(msg, 'error');
      console.error(`${isSignup ? 'Signup' : 'Login'} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button 
          onClick={() => navigate('/select-role')}
          className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Selection
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-900 rounded-[28px] mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Warden Portal</h1>
            <p className="text-slate-500 mt-2">{isSignup ? 'Create your warden account' : 'Manage your hostel efficiency'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <UserPlus size={18} />
                  </div>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="Warden Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="warden@hostel.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Secret Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (isSignup && (!name.trim() || !email.trim() || !password.trim())) || (!isSignup && (!email.trim() || !password.trim()))}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
                  <span>{isSignup ? 'Create Account' : 'Secure Login'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-slate-600 hover:text-slate-900 font-bold transition-colors"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WardenLogin;
