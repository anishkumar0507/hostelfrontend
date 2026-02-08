import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

/**
 * Hook to detect if user has been logged out due to session expiration
 * and redirect to appropriate login page
 */
export const useSessionCheck = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    // Check if token was cleared (happens on 403 errors)
    const token = localStorage.getItem('user_token');
    
    if (!token && isAuthenticated) {
      // Token was cleared but app still thinks we're authenticated
      // This can happen after a 403 error clears the token
      // Redirect to appropriate login page based on role
      const loginPaths: Record<string, string> = {
        student: '/student/login',
        parent: '/parent/login',
        warden: '/warden/login',
      };
      
      const loginPath = loginPaths[role] || '/select-role';
      navigate(loginPath);
    }
  }, [isAuthenticated, role, navigate]);
};

export default useSessionCheck;
