
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ShieldCheck, Home, ArrowLeft, UserPlus } from 'lucide-react';
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
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields for signup
    if (isSignup && (!name.trim() || !email.trim() || !password.trim())) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignup) {
        // Warden signup
        const response = await authAPI.wardenSignup(name.trim(), email.trim(), password);
        
        if (response.success && response.token) {
          showToast('Warden account created successfully!', 'success');
          // Auto-login after successful signup
          login(response.token);
          // Optionally redirect to dashboard (already handled by login function)
        } else {
          showToast(response.message || 'Signup failed. Please try again.', 'error');
        }
      } else {
        // Login
        const response = await authAPI.login(email.trim(), password);
        
        if (response.success && response.token) {
          // Verify it's a warden
          if (response.user?.role !== 'warden') {
            showToast('Access denied. This portal is for wardens only.', 'error');
            setIsLoading(false);
            return;
          }
          login(response.token);
          showToast('Login successful!', 'success');
        } else {
          showToast(response.message || 'Login failed. Please check your credentials.', 'error');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || error.toString() || (isSignup ? 'Signup failed. Please try again.' : 'Login failed. Please check your credentials.');
      showToast(errorMessage, 'error');
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
