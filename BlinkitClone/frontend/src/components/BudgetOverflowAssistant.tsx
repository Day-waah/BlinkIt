import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, addToCart } from '../store/slices/cartSlice';
import api from '../services/api';
import { BudgetOverflowResponse } from '../types';
import { AlertCircle, ArrowLeftRight, Trash2, ShieldAlert } from 'lucide-react';

export const BudgetOverflowAssistant: React.FC = () => {
  const dispatch = useDispatch();
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [overflowData, setOverflowData] = useState<BudgetOverflowResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!activeBudget || cartItems.length === 0) {
      setOverflowData(null);
      return;
    }

    const checkOverflow = async () => {
      setLoading(true);
      try {
        const payload = cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));
        const response = await api.post('/budgets/overflow', payload);
        if (response.data && response.data.exceededAmount > 0) {
          setOverflowData(response.data);
        } else {
          setOverflowData(null);
        }
      } catch (err) {
        console.error('Error fetching budget overflow details', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce/Trigger on cart modifications
    const handler = setTimeout(() => {
      checkOverflow();
    }, 300);

    return () => clearTimeout(handler);
  }, [cartItems, activeBudget]);

  if (!activeBudget || !overflowData || overflowData.exceededAmount <= 0 || loading) {
    return null;
  }

  const handleSwap = (originalId: number, alternativeProduct: any, quantity: number) => {
    dispatch(removeFromCart(originalId));
    dispatch(addToCart({ product: alternativeProduct, quantity }));
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  return (
    <div className="bg-red-50 border border-red-100 rounded-3xl p-5 mb-6 dark:bg-red-950/20 dark:border-red-900/50 animate-in zoom-in-95 duration-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 bg-red-100 dark:bg-red-900/50 rounded-2xl text-red-600 dark:text-red-400 mt-0.5">
          <AlertCircle className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Budget Exceeded by ₹{overflowData.exceededAmount.toFixed(0)}</h3>
          <p className="text-xs text-red-700/80 dark:text-zinc-400 mt-0.5">
            Your cart total is <span className="font-bold">₹{overflowData.cartTotal.toFixed(0)}</span> but your budget limit is{' '}
            <span className="font-bold">₹{overflowData.budgetLimit.toFixed(0)}</span>. Here are suggestions to bring it back in range:
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Suggested Swaps */}
        {overflowData.suggestedSwaps.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Recommended Swaps</span>
            <div className="grid gap-2">
              {overflowData.suggestedSwaps.map((swap) => {
                const alt = swap.alternatives[0];
                const item = cartItems.find((i) => i.product.id === swap.originalProduct.id);
                if (!item) return null;
                
                const savings = (swap.originalProduct.price - alt.price) * item.quantity;

                return (
                  <div key={swap.originalProduct.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-zinc-200">
                        Swap <span className="font-bold">{swap.originalProduct.name}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                        for <span className="font-semibold text-blinkit-green">{alt.name}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleSwap(swap.originalProduct.id, alt, item.quantity)}
                      className="flex items-center gap-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-blinkit-green dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 rounded-xl font-bold transition-colors"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      Save ₹{savings.toFixed(0)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Highest Costing items */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Budget Heavier Items</span>
          <div className="grid gap-2">
            {overflowData.overflowingProducts.slice(0, 2).map((prod) => {
              const item = cartItems.find((i) => i.product.id === prod.id);
              if (!item) return null;
              const cost = prod.price * (1 - prod.discount / 100.0) * item.quantity;

              return (
                <div key={prod.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-zinc-200">{prod.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">Qty: {item.quantity} • Cost: ₹{cost.toFixed(0)}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(prod.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BudgetOverflowAssistant;
