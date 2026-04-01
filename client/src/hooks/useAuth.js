import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    getUserFromStorage();

    // Listen for storage changes
    const handleStorageChange = () => {
      getUserFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isOrganizer
  };
};
