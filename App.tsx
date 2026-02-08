
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

// Student Components
import StudentLogin from './pages/Login';
import StudentDashboard from './pages/Dashboard';
import StudentComplaints from './pages/Complaints';
import StudentLeave from './pages/LeaveRequest';
import StudentFees from './pages/Fees';
import StudentProfile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import StudentSidebar from './components/Sidebar';
import StudentNavbar from './components/Navbar';

// Parent Components
import ParentLogin from './pages/parent/Login';
import ParentChangePassword from './pages/parent/ChangePassword';
import ParentDashboard from './pages/parent/Dashboard';
import ParentRoom from './pages/parent/Room';
import ParentFees from './pages/parent/Fees';
import ParentEntryExit from './pages/parent/EntryExit';
import ParentLeaves from './pages/parent/Leaves';
import ParentLocation from './pages/parent/Location';
import ParentChat from './pages/parent/Chat';
import ParentSidebar from './components/parent/Sidebar';
import ParentNavbar from './components/parent/Navbar';

// Warden Components
import WardenLogin from './pages/warden/Login';
import WardenDashboard from './pages/warden/Dashboard';
import WardenStudents from './pages/warden/Students';
import WardenComplaints from './pages/warden/Complaints';
import WardenLeaves from './pages/warden/Leaves';
import WardenPayments from './pages/warden/Payments';
import WardenSidebar from './components/warden/Sidebar';
import WardenNavbar from './components/warden/Navbar';
import WardenQRScanner from './pages/warden/QRScanner';
import EntryExitLogs from './pages/warden/EntryExitLogs';
import WardenChat from './pages/warden/Chat';

// Common
import SelectRole from './pages/SelectRole';
import { UserRole } from './types';
import { decodeToken } from './utils/api';

interface AuthContextType {
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

interface UIContextType {
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const UIContext = createContext<UIContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};

const Toast: React.FC = () => {
  const { toast, showToast } = useUI();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-2xl border border-slate-100 min-w-[300px]"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="text-emerald-500" size={24} />
          ) : (
            <AlertCircle className="text-red-500" size={24} />
          )}
          <p className="flex-1 text-sm font-semibold text-slate-800">{toast.message}</p>
          <button onClick={() => showToast('', 'success')} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PanelLayout: React.FC<{ children: React.ReactNode; role: UserRole }> = ({ children, role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const bgClass = role === UserRole.WARDEN ? 'bg-slate-900' : role === UserRole.PARENT ? 'bg-emerald-950' : 'bg-slate-50';
  const mainClass = role === UserRole.WARDEN ? 'text-white' : role === UserRole.PARENT ? 'text-white' : 'text-slate-900';

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${bgClass}`}>
      {role === UserRole.STUDENT && <StudentSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
      {role === UserRole.WARDEN && <WardenSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
      {role === UserRole.PARENT && <ParentSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {role === UserRole.STUDENT && <StudentNavbar onMenuClick={() => setSidebarOpen(true)} />}
        {role === UserRole.WARDEN && <WardenNavbar onMenuClick={() => setSidebarOpen(true)} />}
        {role === UserRole.PARENT && <ParentNavbar onMenuClick={() => setSidebarOpen(true)} />}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 ${mainClass}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Toast />
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole: UserRole }> = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to={`/${requiredRole.toLowerCase()}/login`} replace />;
  if (role !== requiredRole) return <Navigate to="/select-role" replace />;
  
  // Check if student or parent needs to change password (mandatory redirect)
  if (requiredRole === UserRole.STUDENT || requiredRole === UserRole.PARENT) {
    const token = localStorage.getItem('user_token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.isTempPassword === true) {
        const changePath = requiredRole === UserRole.PARENT ? '/parent/change-password' : '/student/change-password';
        return <Navigate to={changePath} replace />;
      }
    }
  }
  
  return <PanelLayout role={requiredRole}>{children}</PanelLayout>;
};

const App: React.FC = () => {
  // Get role from token if available
  const getRoleFromToken = (): UserRole | null => {
    const token = localStorage.getItem('user_token');
    if (!token) return null;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.role) return null;
    const r = decoded.role.toUpperCase();
    if (r === 'WARDEN') return UserRole.WARDEN;
    if (r === 'PARENT') return UserRole.PARENT;
    return UserRole.STUDENT;
  };

  const [role, setRole] = useState<UserRole | null>(getRoleFromToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('user_token'));
  const [toast, setToast] = useState<UIContextType['toast']>(null);

  const login = (token: string, userRole?: UserRole) => {
    localStorage.setItem('user_token', token);
    // Extract role from token if not provided
    const decoded = decodeToken(token);
    const r = decoded?.role?.toUpperCase();
    const extractedRole = userRole || (r === 'WARDEN' ? UserRole.WARDEN : r === 'PARENT' ? UserRole.PARENT : UserRole.STUDENT);
    localStorage.setItem('user_role', extractedRole);
    setRole(extractedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');
    setRole(null);
    setIsAuthenticated(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (!message) { setToast(null); return; }
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
      <UIContext.Provider value={{ toast, showToast }}>
        <HashRouter>
          <Routes>
            <Route path="/select-role" element={<SelectRole />} />
            
            {/* Student Routes */}
            <Route path="/student/login" element={isAuthenticated && role === UserRole.STUDENT ? <Navigate to="/student/dashboard" replace /> : <StudentLogin />} />
            <Route path="/student/change-password" element={<ChangePassword />} />
            <Route path="/student/dashboard" element={<ProtectedRoute requiredRole={UserRole.STUDENT}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/complaints" element={<ProtectedRoute requiredRole={UserRole.STUDENT}><StudentComplaints /></ProtectedRoute>} />
            <Route path="/student/leave" element={<ProtectedRoute requiredRole={UserRole.STUDENT}><StudentLeave /></ProtectedRoute>} />
            <Route path="/student/fees" element={<ProtectedRoute requiredRole={UserRole.STUDENT}><StudentFees /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute requiredRole={UserRole.STUDENT}><StudentProfile /></ProtectedRoute>} />

            {/* Warden Routes */}
            {/* Parent Routes */}
            <Route path="/parent/login" element={isAuthenticated && role === UserRole.PARENT ? <Navigate to="/parent/dashboard" replace /> : <ParentLogin />} />
            <Route path="/parent/change-password" element={<ParentChangePassword />} />
            <Route path="/parent/dashboard" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent/room" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentRoom /></ProtectedRoute>} />
            <Route path="/parent/fees" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentFees /></ProtectedRoute>} />
            <Route path="/parent/entry-exit" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentEntryExit /></ProtectedRoute>} />
            <Route path="/parent/leaves" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentLeaves /></ProtectedRoute>} />
            <Route path="/parent/location" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentLocation /></ProtectedRoute>} />
            <Route path="/parent/chat" element={<ProtectedRoute requiredRole={UserRole.PARENT}><ParentChat /></ProtectedRoute>} />

            {/* Warden Routes */}
            <Route path="/warden/login" element={isAuthenticated && role === UserRole.WARDEN ? <Navigate to="/warden/dashboard" replace /> : <WardenLogin />} />
            <Route path="/warden/dashboard" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenDashboard /></ProtectedRoute>} />
            <Route path="/warden/students" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenStudents /></ProtectedRoute>} />
            <Route path="/warden/payments" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenPayments /></ProtectedRoute>} />
            <Route path="/warden/complaints" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenComplaints /></ProtectedRoute>} />
            <Route path="/warden/leaves" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenLeaves /></ProtectedRoute>} />
            <Route path="/warden/scan" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenQRScanner /></ProtectedRoute>} />
            <Route path="/warden/security" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><EntryExitLogs /></ProtectedRoute>} />
            <Route path="/warden/chat" element={<ProtectedRoute requiredRole={UserRole.WARDEN}><WardenChat /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to={isAuthenticated ? (role === UserRole.WARDEN ? "/warden/dashboard" : role === UserRole.PARENT ? "/parent/dashboard" : "/student/dashboard") : "/select-role"} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </UIContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
