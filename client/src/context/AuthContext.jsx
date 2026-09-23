import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing auth state on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // portal is the login tab used: 'admin' or 'user'. The backend rejects
  // accounts whose role doesn't belong on that tab.
  const login = async (email, password, portal) => {
    try {
      const response = await axios.post('/api/login', {
        email,
        password,
        portal
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Remove user data from localStorage
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 