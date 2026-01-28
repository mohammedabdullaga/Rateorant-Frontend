// SignUpForm.jsx

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import * as authService from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import './SignUpForm.css';

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
    <main className="auth-main">
      <div className="auth-container">
        {/* Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">{formTitle}</h1>
            <p className="auth-subtitle">{formSubtitle}</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="auth-error">
              <p className="auth-error-message">{message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
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
                className="auth-input"
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
                className="auth-input"
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
                className="auth-input"
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
                className="auth-input"
              />
            </div>

            {/* Form Actions */}
            <div className="auth-buttons">
              <button 
                type="submit"
                disabled={isFormInvalid()}
                className={`btn-primary auth-button ${isFormInvalid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create Account
              </button>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary auth-button"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="auth-link">
            <p>
              Already have an account?{' '}
              <Link to="/sign-in">Sign in</Link>
            </p>
            {role !== 'restaurant_owner' && (
              <p style={{ marginTop: '0.5rem' }}>
                Restaurant owner?{' '}
                <Link to="/owner-sign-up">Sign up here</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUpForm;
