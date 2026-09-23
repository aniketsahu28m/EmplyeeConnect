import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell';

const MIN_PASSWORD_LENGTH = 6;

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'Employee'
  });

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/signup', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast.success('Account created. You can sign in now.');
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = 'mb-1 block text-[13px] font-medium text-gray-800';

  return (
    <AuthShell
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create an account</h1>
      <p className="mt-1.5 text-[13px] text-gray-500">
        For managers and employees. Administrator accounts can’t be created here.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClass}>First name</label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              required
              className="w-full"
              value={formData.first_name}
              onChange={update('first_name')}
            />
          </div>
          <div>
            <label htmlFor="last_name" className={labelClass}>Last name</label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              required
              className="w-full"
              value={formData.last_name}
              onChange={update('last_name')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="w-full"
            value={formData.email}
            onChange={update('email')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full"
              value={formData.password}
              onChange={update('password')}
            />
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>Confirm password</label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full"
              value={formData.confirm_password}
              onChange={update('confirm_password')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>Role</label>
          <select id="role" required className="w-full" value={formData.role} onChange={update('role')}>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary h-9 w-full">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignUp;
