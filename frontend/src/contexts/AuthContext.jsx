import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast dispatcher helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Check token validity and load current user profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.auth.getCurrentUser();
          setUser(res.data);
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const res = await api.auth.login(normalizedEmail, password);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      showToast('Logged in successfully!');
      return res.user;
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      showToast('Account created successfully! Please login.');
      return res.data;
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully');
  };

  // Simulated Single Sign-On (SSO) Google Workspace / Office 365
  const loginWithSSO = async (provider, selectedEmail = 'alex@school.com') => {
    setLoading(true);
    showToast(`Initiating Single Sign-On via ${provider === 'google' ? 'Google Workspace for Education' : 'Microsoft 365'}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // For demonstration out-of-the-box, we map selected accounts and issue a standard login
      // Seed accounts: admin@school.com, davis@school.com, alex@school.com, emma@school.com, john@school.com
      const res = await api.auth.login(selectedEmail, 'password123');
      localStorage.setItem('token', res.token);
      setUser(res.user);
      showToast(`SSO Auth verified! Welcome, ${res.user.username}.`);
      return res.user;
    } catch (error) {
      showToast('SSO Authentication failed: ' + error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithSSO, showToast, toasts, removeToast }}>
      {children}
      
      {/* Dynamic Floating Glass Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`cursor-pointer px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 flex items-center gap-2 transform translate-y-0 scale-100 ${
              t.type === 'error'
                ? 'bg-red-950/80 border-red-500/50 text-red-200'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
