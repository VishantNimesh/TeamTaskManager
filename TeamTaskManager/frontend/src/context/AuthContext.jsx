import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ttm_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.data.user);
        } catch {
          localStorage.removeItem('ttm_token');
          localStorage.removeItem('ttm_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const register = async (data) => {
    try {
      setError(null);
      const res = await authAPI.register(data);
      const { user: userData, token } = res.data.data;
      localStorage.setItem('ttm_token', token);
      localStorage.setItem('ttm_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const login = async (data) => {
    try {
      setError(null);
      const res = await authAPI.login(data);
      const { user: userData, token } = res.data.data;
      localStorage.setItem('ttm_token', token);
      localStorage.setItem('ttm_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
