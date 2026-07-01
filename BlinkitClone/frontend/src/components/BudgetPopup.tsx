import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { skipBudgetPopup, setBudgetStart, setBudgetSuccess, setBudgetFailure } from '../store/slices/budgetSlice';
import api from '../services/api';
import { X, ShieldAlert, Sparkles } from 'lucide-react';

export const BudgetPopup: React.FC = () => {
  const dispatch = useDispatch();
  const showPopup = useSelector((state: RootState) => state.budget.showPopup);
  const skippedPopup = useSelector((state: RootState) => state.budget.skippedPopup);
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [amount, setAmount] = useState<string>('1000');
  const [duration, setDuration] = useState<'SESSION' | 'WEEKLY' | 'MONTHLY'>('SESSION');
  const [loading, setLoading] = useState<boolean>(false);

  // If already skipped, budget is set, or not logged in, do not show popup
  if (!showPopup && (skippedPopup || activeBudget || !isAuthenticated)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetAmount = parseFloat(amount);
    if (isNaN(budgetAmount) || budgetAmount <= 0) return;

    setLoading(true);
    dispatch(setBudgetStart());
    try {
      const response = await api.post('/budgets', {
        amount: budgetAmount,
        duration: duration,
      });
      dispatch(setBudgetSuccess(response.data));
    } catch (err) {
      dispatch(setBudgetFailure());
      alert('Failed to set budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dispatch(skipBudgetPopup());
  };

  const presetAmounts = ['500', '1000', '2000', '5000'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blinkit-green via-blinkit-yellow to-green-500" />
        
        <button 
          onClick={handleSkip} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <Sparkles className="w-6 h-6 text-blinkit-green" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">Smart Budget Shopper</h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-5 leading-relaxed">
          Stay on track! Set a flexible budget limit. We will suggest cheaper alternatives and guide you to keep cart totals within bounds.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Quick Presets</label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 px-3 text-sm font-semibold rounded-xl border transition-all ${
                    amount === preset
                      ? 'border-blinkit-green bg-blinkit-green/10 text-blinkit-green dark:border-emerald-500 dark:bg-emerald-500/10'
                      : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Custom Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                placeholder="Enter custom budget"
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-900 dark:text-zinc-50 font-medium focus:outline-none focus:ring-2 focus:ring-blinkit-green dark:focus:ring-emerald-500 transition-all text-base"
                required
              />
            </div>
          </div>

          {/* Duration choice */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Budget Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {(['SESSION', 'WEEKLY', 'MONTHLY'] as const).map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`py-2.5 px-1 text-xs font-bold rounded-xl border transition-all ${
                    duration === dur
                      ? 'border-blinkit-green bg-blinkit-green/10 text-blinkit-green dark:border-emerald-500 dark:bg-emerald-500/10'
                      : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  {dur === 'SESSION' ? 'Session' : dur === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 font-semibold text-gray-700 dark:text-zinc-300 transition-colors text-sm"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl bg-blinkit-green hover:bg-green-700 text-white font-semibold shadow-lg shadow-blinkit-green/20 transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BudgetPopup;
