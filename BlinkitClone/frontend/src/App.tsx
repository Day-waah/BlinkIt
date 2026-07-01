import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { logout } from './store/slices/authSlice';
import { loadBudget } from './store/slices/budgetSlice';
import api from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import BudgetPopup from './components/BudgetPopup';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/Category';
import SearchPage from './pages/Search';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    // Listen for global unauthorized triggers from Axios API responses
    const handleUnauthorized = () => {
      dispatch(logout());
      navigate('/login');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    // If authenticated, load active budget limit info
    if (isAuthenticated) {
      const fetchActiveBudget = async () => {
        try {
          const response = await api.get('/budgets/active');
          if (response.status === 200 && response.data) {
            dispatch(loadBudget(response.data));
          }
        } catch (e) {
          console.log('No active budget retrieved on App load');
        }
      };

      fetchActiveBudget();
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 transition-colors duration-200">
      
      {/* Global Header */}
      <Header />

      {/* Main Pages Content */}
      <main className="flex-grow container mx-auto py-2">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* Smart Budget Config popup */}
      <BudgetPopup />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default App;
