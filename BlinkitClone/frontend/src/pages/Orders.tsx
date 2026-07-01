import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Order } from '../types';
import { ShoppingBag, ChevronRight, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (e) {
      console.error('Failed to load orders list', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      alert('Order cancelled. Any active session budget limits have been restored.');
      loadOrderHistory(); // Reload state
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-blinkit-green dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'CANCELLED':
        return 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400';
      case 'PENDING':
        return 'bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400';
      default:
        return 'bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-md animate-pulse">
        <div className="h-6 w-32 bg-gray-150 rounded mx-auto mb-6 dark:bg-zinc-800" />
        {[1, 2].map((i) => (
          <div key={i} className="h-44 bg-gray-100 rounded-3xl mb-4 dark:bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 text-left max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blinkit-green" />
          My Orders
        </h1>
        <button
          onClick={loadOrderHistory}
          className="p-2 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
          title="Refresh orders"
        >
          <RefreshCcw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-zinc-900/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">No orders found.</p>
          <p className="text-xs text-gray-300 dark:text-zinc-500 mt-1">Place an order from checkout page to see details here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const deliveryFee = order.totalAmount > 500 ? 0 : 29;
            const handlingFee = 15;
            const billTotal = order.totalAmount + deliveryFee + handlingFee;
            const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                
                {/* Order Meta Header */}
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-850 pb-3">
                  <div className="text-xs">
                    <p className="font-extrabold text-gray-800 dark:text-zinc-200">Order #{order.id}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { 
                        dateStyle: 'medium' 
                      })} at {new Date(order.createdAt).toLocaleTimeString(undefined, {
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600 dark:text-zinc-400">
                      <span>
                        {item.product.name} <span className="font-bold text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-300">
                        ₹{(item.priceAtPurchase * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary details */}
                <div className="border-t border-gray-100 dark:border-zinc-850 pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400">Method: </span>
                    <span className="font-extrabold text-gray-800 dark:text-zinc-300 uppercase">{order.paymentMethod}</span>
                    {order.budgetId && (
                      <span className="ml-2 py-0.5 px-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-blinkit-green dark:text-emerald-400 font-extrabold rounded text-[9px] uppercase tracking-wide">
                        Budget Logged
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-medium">Paid: </span>
                    <span className="font-black text-gray-900 dark:text-zinc-50 text-sm">₹{billTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* Cancel button */}
                {canCancel && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="flex items-center gap-1 py-1.5 px-3.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[11px] font-bold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Order
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Orders;
