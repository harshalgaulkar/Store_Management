/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      const merged = { ...JSON.parse(savedUser), ...updatedData };
      sessionStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user, showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center p-4 rounded-xl border shadow-2xl transition-all duration-300 bg-slate-900/95 backdrop-blur-md animate-bounce ${
          toast.type === 'success' 
            ? 'border-emerald-500/30 text-emerald-400 shadow-emerald-950/20' 
            : 'border-rose-500/30 text-rose-400 shadow-rose-950/20'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 text-rose-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-100">{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
