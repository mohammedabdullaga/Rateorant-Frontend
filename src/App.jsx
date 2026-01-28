import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router';

import NavBar from './components/NavBar/NavBar';
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import RestaurantDetail from './components/RestaurantDetail/RestaurantDetail';
import RestaurantForm from './components/RestaurantForm/RestaurantForm';

import { UserContext } from './contexts/UserContext';

const App = () => {

  const { user } = useContext(UserContext);

  const OwnerRoute = ({ element }) => {
    if (!user) return <Navigate to='/sign-in' />;
    if (user.role !== 'restaurant_owner') return <Navigate to='/' />;
    return element;
  };

  const UserRoute = ({ element }) => {
    if (!user) return <Navigate to='/sign-in' />;
    if (user.role === 'restaurant_owner') return <Navigate to='/' />;
    return element;
  };

  const AuthRoute = ({ element }) => {
    if (!user) return <Navigate to='/sign-in' />;
    return element;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <NavBar/>
      <Routes>
        {/* Landing & Auth Routes */}
        <Route path='/' element={!user ? <Landing /> : user.role === 'restaurant_owner' ? <Dashboard role="owner" /> : <Dashboard role="user" />} />
        <Route path='/sign-up' element={<SignUpForm role="user" />} />
        <Route path='/sign-in' element={<SignInForm />} />
        <Route path='/owner-sign-up' element={<SignUpForm role="restaurant_owner" />} />

        {/* User Routes */}
        <Route path='/restaurant/:restaurantId' element={<AuthRoute element={<RestaurantDetail />} />} />

        {/* Owner Routes */}
        <Route path='/add-restaurant' element={<OwnerRoute element={<RestaurantForm />} />} />
        <Route path='/edit-restaurant/:restaurantId' element={<OwnerRoute element={<RestaurantForm />} />} />
      </Routes>
    </div>
  );
};

export default App;
