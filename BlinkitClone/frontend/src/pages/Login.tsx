import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { loadBudget } from '../store/slices/budgetSlice';
import api from '../services/api';
import { RootState } from '../store';
import { ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(loginStart());
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, id, name, email: userEmail, roles } = response.data;
      
      const userPayload = { id, name, email: userEmail, roles };
      dispatch(loginSuccess({ token, user: userPayload }));

      // Immediately fetch active budget for the logged-in user
      try {
        const budgetRes = await api.get('/budgets/active');
        if (budgetRes.status === 200 && budgetRes.data) {
          dispatch(loadBudget(budgetRes.data));
        }
      } catch (budgetErr) {
        console.log('No active budget found for user upon login');
      }

      navigate(redirect ? `/${redirect}` : '/');
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Glowing top line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blinkit-green to-blinkit-yellow" />

        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50">Welcome Back</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to manage shopping budgets and order history</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs font-semibold text-red-500 mb-4 dark:bg-red-950/20 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="e.g. customer@blinkit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-850 bg-transparent text-sm focus:ring-1 focus:ring-blinkit-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-850 bg-transparent text-sm focus:ring-1 focus:ring-blinkit-green focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blinkit-green hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blinkit-green/20 transition-all text-xs disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <>
                Login
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          New to Blinkit?{' '}
          <Link to="/register" className="font-extrabold text-blinkit-green hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
