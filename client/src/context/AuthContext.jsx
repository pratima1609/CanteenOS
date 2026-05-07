import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stallProfile, setStallProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedStall = localStorage.getItem('stallProfile');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedStall && storedStall !== 'undefined') {
        setStallProfile(JSON.parse(storedStall));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    if (res.data.stallProfile) {
      localStorage.setItem('stallProfile', JSON.stringify(res.data.stallProfile));
      setStallProfile(res.data.stallProfile);
    }
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('stallProfile');
    setUser(null);
    setStallProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, stallProfile, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
