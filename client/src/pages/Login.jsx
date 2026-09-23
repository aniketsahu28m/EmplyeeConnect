import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';

const PORTALS = {
  user: {
    label: 'Staff',
    hint: 'Managers and employees sign in here.',
    submit: 'Sign in',
  },
  admin: {
    label: 'Administrator',
    hint: 'Only administrator accounts can sign in here.',
    submit: 'Sign in as administrator',
  },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portal, setPortal] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const current = PORTALS[portal];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password, portal);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-canvas" />;
  }

  return (
    <AuthShell
      footer={
        portal === 'user' && (
          <>
            New here?{' '}
            <Link to="/signup" className="font-medium text-blue-700 hover:underline">
              Create an account
            </Link>
          </>
        )
      }
    >
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Sign in</h1>

      <div className="mt-6 flex border-b border-gray-200" role="tablist">
        {Object.entries(PORTALS).map(([key, option]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={portal === key}
            onClick={() => setPortal(key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-[13px] font-medium transition-colors [&:not(:first-child)]:ml-5 ${
              portal === key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-gray-500">{current.hint}</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-gray-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-gray-800">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Forgot your password? Ask your administrator.
          </p>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary h-9 w-full">
          {isSubmitting ? 'Signing in…' : current.submit}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
