import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, addToCart } from '../store/slices/cartSlice';
import api from '../services/api';
import { Product } from '../types';
import { ArrowLeftRight, Sparkles, TrendingDown } from 'lucide-react';

interface CheaperAlternativeAlertProps {
  productId: number;
  quantity: number;
  onDismiss?: () => void;
}

export const CheaperAlternativeAlert: React.FC<CheaperAlternativeAlertProps> = ({ 
  productId, 
  quantity,
  onDismiss 
}) => {
  const dispatch = useDispatch();
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);
  const [alternative, setAlternative] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only fetch if a budget is active
    if (!activeBudget) return;

    const fetchAlternatives = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/budgets/alternatives/${productId}`);
        const alternativesList = response.data.alternatives as Product[];
        if (alternativesList && alternativesList.length > 0) {
          // Select the cheapest alternative
          setAlternative(alternativesList[0]);
        } else {
          setAlternative(null);
        }
      } catch (err) {
        console.error('Error fetching alternatives', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [productId, activeBudget]);

  if (!activeBudget || !alternative || loading) {
    return null;
  }

  const originalProductPrice = api.defaults.headers // Mock helper
  const originalPrice = alternative.category ? 0 : 0; // fallback calculation: we'll get original from cart
  
  // Alternative price calculation
  const getPrice = (p: Product) => p.price * (1 - p.discount / 100.0);
  
  const handleSwap = () => {
    dispatch(removeFromCart(productId));
    dispatch(addToCart({ product: alternative, quantity }));
    if (onDismiss) onDismiss();
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mt-2 mb-4 dark:bg-emerald-950/20 dark:border-emerald-900/50 animate-in slide-in-from-top duration-250">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 mt-0.5">
          <TrendingDown className="w-4 h-4" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blinkit-green" />
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Budget Saver Alert</h4>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-zinc-300 mt-1">
            Swap for <span className="font-bold">{alternative.name}</span> ({alternative.unit}) at{' '}
            <span className="font-bold text-blinkit-green dark:text-emerald-400">₹{getPrice(alternative).toFixed(0)}</span> and save.
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-blinkit-green hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Swap & Save
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs font-semibold text-emerald-800/60 hover:text-emerald-800 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                No, thanks
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheaperAlternativeAlert;
