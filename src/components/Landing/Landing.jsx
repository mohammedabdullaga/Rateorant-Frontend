import { Link } from 'react-router';

// This page is displayed when a visitor is not signed in
// It allows normal users to sign up/sign in and has a footer for restaurant owners
const Landing = () => {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex flex-col items-center justify-center px-4 py-20 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-10 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="text-center max-w-3xl relative z-10">
          <div className="mb-6">
            <span className="text-6xl md:text-7xl block mb-4">🍽️</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white drop-shadow-lg">
            Discover & Rate<br/>Amazing Restaurants
          </h1>
          <p className="text-lg md:text-2xl text-indigo-100 mb-10 leading-relaxed font-medium">
            Find your next favorite spot, share your dining experience, and help others discover great food
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up" className="block">
              <button className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:bg-indigo-50">
                👤 Get Started as a User
              </button>
            </Link>
            <Link to="/sign-in" className="block">
              <button className="w-full sm:w-auto bg-indigo-500 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:bg-indigo-400 border-2 border-white border-opacity-20">
                🔐 Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-3">Discover</h3>
            <p className="text-indigo-100">Browse thousands of restaurants with detailed information and photos</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold mb-3">Review</h3>
            <p className="text-indigo-100">Share your dining experience with ratings and detailed comments</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-3">Save</h3>
            <p className="text-indigo-100">Build your personal collection of favorite restaurants</p>
          </div>
        </div>
      </div>

      {/* Restaurant Owner Section */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="text-5xl md:text-6xl block">🏪</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Own a Restaurant?
            </h2>
            <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto">
              Join Rateorant to showcase your restaurant, manage customer reviews, and grow your business online
            </p>
          </div>

          {/* Features for Owners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600 hover:border-slate-500 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Track Reviews</h3>
              <p className="text-slate-300">Monitor all customer feedback and ratings in real-time</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600 hover:border-slate-500 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Build Reputation</h3>
              <p className="text-slate-300">Increase visibility and attract more customers</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600 hover:border-slate-500 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Manage Profile</h3>
              <p className="text-slate-300">Update restaurant info, hours, and details anytime</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/owner-sign-up" className="inline-block">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                🚀 Start Your Restaurant Profile
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;