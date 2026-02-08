import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { useAuth, useUI } from '../../App';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const ParentLogin: React.FC = () => {
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
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.login(email.trim(), password);
      if (!response.success || !response.token) {
        const msg = response.message || 'Login failed';
        setPassword('');
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }
      if (response.user?.role !== 'parent') {
        const msg = 'Access denied. This portal is for parents/guardians only.';
        setPassword('');
        setErrorMessage(msg);
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }
      login(response.token);
      if (response.requiresPasswordChange || response.forcePasswordChange) {
        navigate('/parent/change-password');
        showToast('Please change your temporary password to continue', 'error');
      } else {
        showToast('Login successful!', 'success');
        navigate('/parent/dashboard');
      }
    } catch (error: any) {
      setPassword('');
      const msg = error.message || 'Login failed';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button
          onClick={() => navigate('/select-role')}
          className="text-emerald-100 hover:text-white flex items-center gap-2 mb-8 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Selection
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[28px] mb-6">
              <Users size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Parent Portal</h1>
            <p className="text-slate-500 mt-2">View your child's hostel information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  placeholder="parent@email.com"
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
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Parent accounts are created by the warden. Contact your hostel for access.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentLogin;
