import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../store/slices/cartSlice';
import { RootState } from '../store';
import { Product } from '../types';
import { Star, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    dispatch(addToCart({ product }));
  };

  const handleIncrement = () => {
    dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }));
  };

  const finalPrice = product.price * (1 - product.discount / 100.0);
  const hasDiscount = product.discount > 0;

  // Smart budget highlight: if budget is set, check if this product fits budget
  const fitsBudget = activeBudget ? finalPrice <= activeBudget.remainingAmount : true;

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
      
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-extrabold rounded-md uppercase tracking-wider z-10 shadow-sm">
          {product.discount.toFixed(0)}% OFF
        </span>
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl bg-gray-50 dark:bg-zinc-850/50 mb-3 overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform duration-250"
          />
        ) : (
          <span className="text-xs text-gray-300 dark:text-zinc-650 font-bold uppercase tracking-wider">Blinkit Grocery</span>
        )}
      </div>

      <div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 block mb-0.5">{product.brand || 'Fresh'}</span>
        <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 line-clamp-2 min-h-[2rem] leading-tight">
          {product.name}
        </h3>
        
        {/* Rating and Unit */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">{product.unit}</span>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5 py-0.5 px-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-blinkit-green dark:text-emerald-400 rounded-lg text-[10px] font-bold">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart button */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-gray-900 dark:text-zinc-50">₹{finalPrice.toFixed(0)}</span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 line-through">₹{product.price.toFixed(0)}</span>
            )}
          </div>
          {activeBudget && !fitsBudget && (
            <span className="text-[9px] text-red-500 font-bold block mt-0.5">Exceeds Remaining</span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-blinkit-green text-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={handleDecrement}
              className="p-1.5 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 text-xs font-extrabold">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="p-1.5 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity <= 0}
            className="py-1.5 px-4 border border-blinkit-green hover:bg-blinkit-green/5 text-blinkit-green hover:text-green-700 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500/5 text-xs font-extrabold rounded-xl transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add'}
          </button>
        )}
      </div>
    </div>
  );
};
export default ProductCard;
