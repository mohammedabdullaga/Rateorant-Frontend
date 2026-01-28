import { Link } from 'react-router';
import './Landing.css';

// This page is displayed when a visitor is not signed in
// It allows normal users to sign up/sign in and has a footer for restaurant owners
const Landing = () => {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-emoji">🍽️</div>
          <h1 className="landing-hero-title">
            Discover & Rate<br/>Amazing Restaurants
          </h1>
          <p className="landing-hero-subtitle">
            Find your next favorite spot, share your dining experience, and help others discover great food
          </p>

          {/* CTA Buttons */}
          <div className="landing-cta-buttons">
            <Link to="/sign-up" className="landing-cta-button landing-cta-button-primary">
              👤 Get Started as a User
            </Link>
            <Link to="/sign-in" className="landing-cta-button landing-cta-button-secondary">
              🔐 Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="landing-features">
          <div className="landing-feature-card">
            <div className="landing-feature-emoji">🔍</div>
            <h3 className="landing-feature-title">Discover</h3>
            <p className="landing-feature-description">Browse thousands of restaurants with detailed information and photos</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-emoji">⭐</div>
            <h3 className="landing-feature-title">Review</h3>
            <p className="landing-feature-description">Share your dining experience with ratings and detailed comments</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-emoji">❤️</div>
            <h3 className="landing-feature-title">Save</h3>
            <p className="landing-feature-description">Build your personal collection of favorite restaurants</p>
          </div>
        </div>
      </div>

      {/* Restaurant Owner Section */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-header">
            <div className="landing-footer-emoji">🏪</div>
            <h2 className="landing-footer-title">
              Own a Restaurant?
            </h2>
            <p className="landing-footer-subtitle">
              Join Rateorant to showcase your restaurant, manage customer reviews, and grow your business online
            </p>
          </div>

          {/* Features for Owners */}
          <div className="landing-owner-features">
            <div className="landing-owner-feature-card">
              <div className="landing-owner-feature-emoji">📊</div>
              <h3 className="landing-owner-feature-title">Track Reviews</h3>
              <p className="landing-owner-feature-description">Monitor all customer feedback and ratings in real-time</p>
            </div>
            <div className="landing-owner-feature-card">
              <div className="landing-owner-feature-emoji">📈</div>
              <h3 className="landing-owner-feature-title">Build Reputation</h3>
              <p className="landing-owner-feature-description">Increase visibility and attract more customers</p>
            </div>
            <div className="landing-owner-feature-card">
              <div className="landing-owner-feature-emoji">🎯</div>
              <h3 className="landing-owner-feature-title">Manage Profile</h3>
              <p className="landing-owner-feature-description">Update restaurant info, hours, and details anytime</p>
            </div>
          </div>

          <div className="landing-owner-cta">
            <Link to="/owner-sign-up" className="landing-owner-button">
              🚀 Start Your Restaurant Profile
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;