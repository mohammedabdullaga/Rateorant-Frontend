// SignUpForm.jsx

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import * as authService from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';

const SignUpForm = ({ role = 'user' }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConf: '',
  });
  const { setUser } = useContext(UserContext);

  const { username, email, password, passwordConf } = formData;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try {
      const payload = { username, email, password, role };
      const user = await authService.signUp(payload)

      setUser(user);
      navigate('/')
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Sign up failed. Please try again.');
    }
  };

  const isFormInvalid = () => {
    return !(username && email && password && password === passwordConf);
  };

  const formTitle = role === 'restaurant_owner' ? 'Restaurant Owner Sign Up' : 'Create Your Account';
  const formSubtitle = role === 'restaurant_owner' 
    ? 'Register your restaurant and start managing reviews' 
    : 'Join thousands of food enthusiasts';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card bg-white rounded-lg shadow-lg border border-slate-200">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{formTitle}</h1>
            <p className="text-slate-600">{formSubtitle}</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                name="username"
                onChange={handleChange}
                required
                placeholder="Choose a username"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                name="email"
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                name="password"
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label htmlFor="confirm" className="input-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm"
                value={passwordConf}
                name="passwordConf"
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                disabled={isFormInvalid()}
                className={`btn-primary flex-1 py-2 font-semibold ${isFormInvalid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create Account
              </button>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1 py-2 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Sign in
              </Link>
            </p>
            {role !== 'restaurant_owner' && (
              <p className="text-slate-600 mt-2">
                Restaurant owner?{' '}
                <Link to="/owner-sign-up" className="text-indigo-600 font-semibold hover:text-indigo-700">
                  Sign up here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUpForm;
