import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import BudgetTracker from './BudgetTracker';
import { Search, ShoppingCart, User, LogOut, Sun, Moon, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.cart);

  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-150 dark:bg-zinc-950 dark:border-zinc-800 transition-colors">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        
        {/* Logo and Delivery Location */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-extrabold text-blinkit-yellow bg-zinc-950 dark:bg-white dark:text-zinc-950 px-2 py-0.5 rounded-xl uppercase tracking-tighter">
              blink
            </span>
            <span className="text-2xl font-extrabold text-blinkit-green tracking-tighter px-0.5">
              it
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
            <MapPin className="w-4.5 h-4.5 text-blinkit-green" />
            <div className="text-left hidden sm:block">
              <p className="font-extrabold text-gray-800 dark:text-zinc-300">Delivery in 10 mins</p>
              <p className="text-[10px]">Gurugram, Haryana</p>
            </div>
          </div>

          {/* Dark Mode toggle for mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="md:hidden p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1 max-w-xl">
          <input
            type="text"
            placeholder='Search "milk", "bread", "fruits" or "organic"...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-150 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blinkit-green dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
        </form>

        {/* Smart Budget & User Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          
          {/* Budget Widget */}
          <BudgetTracker />

          {/* Desktop Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:block p-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 transition-all"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* User Account Dropdown/Link */}
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-xs font-bold">
                <User className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                <span className="max-w-[70px] truncate">{user?.name}</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 font-semibold"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 font-semibold"
                >
                  Order History
                </Link>
                {user?.roles.includes('ROLE_ADMIN') && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 font-semibold border-t border-gray-100 dark:border-zinc-850"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold border-t border-gray-100 dark:border-zinc-850"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="py-2 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-800 text-xs font-bold rounded-2xl transition-all"
            >
              Login
            </Link>
          )}

          {/* Cart Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 py-2 px-4 bg-blinkit-green hover:bg-green-700 text-white rounded-2xl font-bold shadow-md shadow-blinkit-green/20 transition-all text-xs"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cart.totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blinkit-yellow text-zinc-950 text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {cart.totalQuantity}
                </span>
              )}
            </div>
            <span className="hidden sm:block">
              {cart.totalQuantity > 0 ? `₹${cart.totalAmount.toFixed(0)}` : 'My Cart'}
            </span>
          </Link>

        </div>
      </div>
    </header>
  );
};
export default Header;
