import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { triggerBudgetPopup } from '../store/slices/budgetSlice';
import { PiggyBank, Edit2, AlertCircle, AlertTriangle } from 'lucide-react';

export const BudgetTracker: React.FC = () => {
  const dispatch = useDispatch();
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);
  const cartTotal = useSelector((state: RootState) => state.cart.totalAmount);

  if (!activeBudget) {
    return (
      <button
        onClick={() => dispatch(triggerBudgetPopup(true))}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-gray-200 hover:border-blinkit-green dark:border-zinc-800 dark:hover:border-emerald-500 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-blinkit-green dark:hover:text-emerald-500 transition-all"
      >
        <PiggyBank className="w-4 h-4" />
        Set Budget
      </button>
    );
  }

  const { amount, remainingAmount } = activeBudget;
  // Calculate dynamic remaining amount reflecting current cart total
  const currentRemaining = amount - cartTotal;
  const percentageSpent = Math.min((cartTotal / amount) * 100, 100);

  const isExceeded = currentRemaining < 0;
  const isTight = !isExceeded && (currentRemaining / amount) <= 0.2; // 20% or less remaining

  let statusColor = 'bg-blinkit-green';
  let textColor = 'text-blinkit-green dark:text-emerald-500';
  let progressBg = 'bg-emerald-50 dark:bg-emerald-950/20';

  if (isExceeded) {
    statusColor = 'bg-red-500';
    textColor = 'text-red-500';
    progressBg = 'bg-red-50 dark:bg-red-950/20';
  } else if (isTight) {
    statusColor = 'bg-amber-500';
    textColor = 'text-amber-500';
    progressBg = 'bg-amber-50 dark:bg-amber-950/20';
  }

  return (
    <div className="flex items-center gap-4 py-1 px-3 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl max-w-sm md:max-w-md w-full">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-xl ${progressBg}`}>
          {isExceeded ? (
            <AlertCircle className="w-4.5 h-4.5 text-red-500 animate-pulse" />
          ) : isTight ? (
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
          ) : (
            <PiggyBank className="w-4.5 h-4.5 text-blinkit-green dark:text-emerald-500" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Budget Limit</span>
            <button 
              onClick={() => dispatch(triggerBudgetPopup(true))}
              className="text-gray-400 hover:text-blinkit-green transition-colors"
              title="Edit budget"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-zinc-300">₹{amount.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className="text-gray-500 dark:text-zinc-400">Cart: ₹{cartTotal.toFixed(0)}</span>
          <span className={textColor}>
            {isExceeded ? `Exceeded ₹${Math.abs(currentRemaining).toFixed(0)}` : `Left: ₹${currentRemaining.toFixed(0)}`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-850 rounded-full overflow-hidden">
          <div 
            className={`h-full ${statusColor} transition-all duration-300`} 
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
export default BudgetTracker;
