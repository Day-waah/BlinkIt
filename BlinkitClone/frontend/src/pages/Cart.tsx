import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import BudgetOverflowAssistant from '../components/BudgetOverflowAssistant';
import CheaperAlternativeAlert from '../components/CheaperAlternativeAlert';
import { ShoppingBasket, Trash2, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleQuantityChange = (productId: number, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const getPrice = (item: any) => item.product.price * (1 - item.product.discount / 100.0);

  const deliveryFee = cart.totalAmount > 500 ? 0 : 29;
  const handlingFee = 15;
  const grandTotal = cart.totalAmount + deliveryFee + handlingFee;

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-24 h-24 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-zinc-800">
          <ShoppingBasket className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-200">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400 mt-2 mb-6">
          Add items to your cart to see them here. Let's fill it with fresh groceries!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 py-3 px-6 bg-blinkit-green hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blinkit-green/20 transition-all text-xs"
        >
          Start Shopping
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 text-left">
      <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 mb-6">My Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns - Cart Items list */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Budget Overflow Warning */}
          <BudgetOverflowAssistant />

          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            {cart.items.map((item) => {
              const itemPrice = getPrice(item);
              const totalItemPrice = itemPrice * item.quantity;

              return (
                <div 
                  key={item.product.id} 
                  className="border-b border-gray-100 dark:border-zinc-850 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="object-contain w-full h-full p-1" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Item</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">{item.product.brand || 'Fresh'}</span>
                      <h3 className="text-xs font-bold text-gray-800 dark:text-zinc-200 line-clamp-1">{item.product.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.product.unit}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center bg-blinkit-green text-white rounded-xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-green-700 font-black text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-extrabold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-green-700 font-black text-xs"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right w-20">
                        <p className="text-xs font-black text-gray-900 dark:text-zinc-50">₹{totalItemPrice.toFixed(0)}</p>
                        {item.product.discount > 0 && (
                          <p className="text-[10px] text-gray-400 line-through">₹{(item.product.price * item.quantity).toFixed(0)}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 dark:hover:bg-red-950/20 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cheaper Alternative Swapping Tip */}
                  <CheaperAlternativeAlert 
                    productId={item.product.id} 
                    quantity={item.quantity} 
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 dark:text-zinc-200">Bill Details</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Items total</span>
                <span>₹{cart.totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Delivery partner fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Handling charge</span>
                <span>₹{handlingFee}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-zinc-850 pt-2.5 flex justify-between font-black text-sm text-gray-900 dark:text-zinc-50">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-between py-3.5 px-5 bg-blinkit-green hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blinkit-green/20 transition-all text-xs"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1">
                <span>₹{grandTotal.toFixed(0)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex gap-3 text-[11px] leading-relaxed text-emerald-800 dark:text-zinc-400">
            <ShieldCheck className="w-5 h-5 text-blinkit-green shrink-0 mt-0.5" />
            <p>
              Ordering via secure gateway. 100% genuine products directly sourced from regional distribution hubs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default CartPage;
