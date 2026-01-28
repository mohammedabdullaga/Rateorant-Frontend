import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';

import { signIn } from '../../services/authService';

import { UserContext } from '../../contexts/UserContext';
import './SignInForm.css';

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
    <main className="auth-main">
      <div className="auth-container">
        {/* Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your Rateorant account</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="auth-error">
              <p className="auth-error-message">{message}</p>
            </div>
          )}

          {/* Form */}
          <form autoComplete="off" onSubmit={handleSubmit} className="auth-form">
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
                className="auth-input"
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
                className="auth-input"
              />
            </div>

            {/* Buttons */}
            <div className="auth-buttons">
              <button 
                type="submit"
                className="btn-primary auth-button"
              >
                Sign In
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
              New to Rateorant?{' '}
              <Link to="/sign-up">Sign up as a user</Link>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Or{' '}
              <Link to="/owner-sign-up">sign up for restaurant owners</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignInForm;
