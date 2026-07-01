import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loadBudget, clearBudget } from '../store/slices/budgetSlice';
import api from '../services/api';
import { Address } from '../types';
import { User, Shield, CreditCard, PiggyBank, Edit3, Trash2, Plus, Sparkles, LogOut } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [budgetDuration, setBudgetDuration] = useState<'SESSION' | 'WEEKLY' | 'MONTHLY'>('SESSION');
  const [updatingBudget, setUpdatingBudget] = useState<boolean>(false);

  useEffect(() => {
    loadAddresses();
    loadActiveBudget();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
    } catch (e) {
      console.error('Failed to load profile addresses', e);
    }
  };

  const loadActiveBudget = async () => {
    try {
      const response = await api.get('/budgets/active');
      if (response.status === 200 && response.data) {
        dispatch(loadBudget(response.data));
        setBudgetAmount(response.data.amount.toString());
        setBudgetDuration(response.data.duration);
      }
    } catch (e) {
      console.error('Failed to load active budget details', e);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) return;

    setUpdatingBudget(true);
    try {
      const response = await api.post('/budgets', {
        amount,
        duration: budgetDuration,
      });
      dispatch(loadBudget(response.data));
      alert('Budget updated successfully!');
    } catch (err) {
      alert('Failed to update budget limits.');
    } finally {
      setUpdatingBudget(false);
    }
  };

  const handleDeactivateBudget = async () => {
    if (!window.confirm('Are you sure you want to deactivate your budget?')) return;
    try {
      await api.delete('/budgets/active');
      dispatch(clearBudget());
      setBudgetAmount('');
      alert('Budget deactivated.');
    } catch (err) {
      alert('Failed to deactivate budget.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete address.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6 text-left max-w-4xl space-y-8">
      
      {/* User Basic Info Header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blinkit-green/10 dark:bg-emerald-500/10 text-blinkit-green dark:text-emerald-400 rounded-full flex items-center justify-center font-black text-2xl">
            {auth.user?.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50">{auth.user?.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{auth.user?.email}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {auth.user?.roles.join(', ').replace('ROLE_', '')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 py-2 px-4 border border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Budget Management Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-gray-800 dark:text-zinc-200 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blinkit-green" />
            Smart Budget Shopper
          </h2>

          <form onSubmit={handleUpdateBudget} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Set Shopping Budget (₹)</label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min="1"
                placeholder="Enter budget limit"
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-xs"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Budget Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SESSION', 'WEEKLY', 'MONTHLY'] as const).map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setBudgetDuration(dur)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                      budgetDuration === dur
                        ? 'border-blinkit-green bg-blinkit-green/10 text-blinkit-green'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-400'
                    }`}
                  >
                    {dur === 'SESSION' ? 'Session' : dur === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {activeBudget && (
                <button
                  type="button"
                  onClick={handleDeactivateBudget}
                  className="flex-1 py-2 px-3 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                  Deactivate
                </button>
              )}
              <button
                type="submit"
                disabled={updatingBudget}
                className="flex-1 py-2.5 px-3 bg-blinkit-green hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                {updatingBudget ? 'Saving...' : activeBudget ? 'Update Budget' : 'Enable Budget'}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Addresses Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-gray-800 dark:text-zinc-200 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blinkit-green" />
            Saved Delivery Addresses
          </h2>

          {addresses.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No addresses saved. Add one on checkout or profile page.</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 bg-gray-50 dark:bg-zinc-850/30 border border-gray-150 dark:border-zinc-850 rounded-2xl flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-extrabold text-gray-800 dark:text-zinc-200">
                      {addr.street} {addr.isDefault && <span className="ml-1.5 px-1 py-0.5 bg-blinkit-green/10 text-blinkit-green dark:text-emerald-400 font-extrabold rounded text-[9px] uppercase">Default</span>}
                    </p>
                    <p className="text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.pinCode}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Profile;
