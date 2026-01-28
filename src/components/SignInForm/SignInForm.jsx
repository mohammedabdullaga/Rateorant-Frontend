import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';

import { signIn } from '../../services/authService';

import { UserContext } from '../../contexts/UserContext';

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const signedInUser = await signIn(formData);
      setUser(signedInUser);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card bg-white rounded-lg shadow-lg border border-slate-200">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your Rateorant account</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Form */}
          <form autoComplete="off" onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <input
                type="text"
                autoComplete="off"
                id="username"
                value={formData.username}
                name="username"
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                type="password"
                autoComplete="off"
                id="password"
                value={formData.password}
                name="password"
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="btn-primary flex-1 py-2 font-semibold"
              >
                Sign In
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
              New to Rateorant?{' '}
              <Link to="/sign-up" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Sign up as a user
              </Link>
            </p>
            <p className="text-slate-600 mt-2">
              Or{' '}
              <Link to="/owner-sign-up" className="text-indigo-600 font-semibold hover:text-indigo-700">
                sign up for restaurant owners
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignInForm;
