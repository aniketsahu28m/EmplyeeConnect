import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Animation on mount
    setFadeIn(true);
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid email or password');
    }
  };

  const toggleMode = () => {
    setFadeIn(false);
    setTimeout(() => {
      setIsAdminMode(!isAdminMode);
      setFadeIn(true);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Logo size="large" className="w-96 h-96" />
      </div>

      <div 
        className={`w-full max-w-md px-4 sm:px-0 transition-opacity duration-500 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'} relative z-10`}
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Logo size="medium" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">EmployeeConnect</h1>
            <p className="mt-2 text-gray-600 font-light">
              Sign in to your {isAdminMode ? 'admin' : 'user'} workspace
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => !isAdminMode || toggleMode()}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${!isAdminMode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => isAdminMode || toggleMode()}
                className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isAdminMode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Admin
              </button>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="transform transition-all duration-300 ease-out hover:translate-y-[-2px]">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  placeholder={isAdminMode ? "admin@company.com" : "your@email.com"}
                />
              </div>
              
              <div className="transform transition-all duration-300 ease-out hover:translate-y-[-2px]">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 ease-out hover:scale-[1.01]">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
              >
                {isAdminMode ? 'Sign in as Admin' : 'Sign in'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Need help? <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">Contact support</a></p>
            </div>
          </form>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500 transition-opacity duration-500 ease-in-out">
          <p>© 2025 EmployeeConnect. All rights reserved.</p>
          <p>Made by Aniket, Aryan and Varun</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;