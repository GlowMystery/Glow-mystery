import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './features/authSlice';
import { fetchWishlist } from './features/wishlistSlice';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Success from './pages/Success';

// Auth Pages
import LoginRegister from './pages/LoginRegister';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';

// User Pages
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import OrderDetails from './pages/OrderDetails';

// Admin Pages
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import AdminDiscounts from './pages/AdminDiscounts';
import Wishlist from './pages/Wishlist';

// Layout for user-facing pages that require Navbar/Footer
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Basic auth hydration from localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      dispatch(loginSuccess({ user: JSON.parse(savedUser), token: savedToken }));
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-container">
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
      <Routes>
        {/* Main User Facing App */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* Auth */}
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* User Protected */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/order/:id" element={<OrderDetails />} />
          <Route path="/success" element={<Success />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* Admin Dashboard - Has its own Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
