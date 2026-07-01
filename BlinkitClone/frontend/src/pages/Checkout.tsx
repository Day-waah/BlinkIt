import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import api from '../services/api';
import { Address } from '../types';
import { MapPin, Plus, Check, CreditCard, ShoppingBag, ShieldAlert } from 'lucide-react';

export const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [loading, setLoading] = useState<boolean>(false);

  // Address Form state
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data);
      const defaultAddr = (response.data as Address[]).find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !pinCode) return;
    try {
      const response = await api.post('/addresses', {
        street,
        city,
        state,
        pinCode,
        isDefault: addresses.length === 0,
      });
      setAddresses([...addresses, response.data]);
      setSelectedAddressId(response.data.id);
      setShowAddressForm(false);
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setPinCode('');
    } catch (err) {
      alert('Failed to save address');
    }
  };

  // Mock Gateways Integrations
  const handleStripeCheckout = async (orderItemsPayload: any) => {
    console.log('Using Stripe Template Integration');
    // Env placeholder validation
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!stripePublicKey) {
      console.warn('VITE_STRIPE_PUBLIC_KEY not set. Operating in mock mode.');
    }
    // Simulate API calling Stripe Checkout session:
    // const stripeSession = await api.post('/payments/stripe/session', { items: cart.items });
    // window.location.href = stripeSession.data.url;
    return 'ch_mock_stripe_1298471928471298';
  };

  const handleRazorpayCheckout = async (orderItemsPayload: any, total: number) => {
    console.log('Using Razorpay Template Integration');
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      console.warn('VITE_RAZORPAY_KEY_ID not set. Operating in mock mode.');
    }
    // Simulate Razorpay SDK script load and popup triggers:
    /*
      const options = {
        key: razorpayKeyId || 'rzp_test_mock',
        amount: total * 100, // in paise
        currency: 'INR',
        name: 'Blinkit Clone',
        handler: function(response) {
           submitOrder(response.razorpay_payment_id);
        }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    */
    return 'pay_mock_rzp_98471928472918';
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      let gatewayId = 'COD_MOCK';

      if (paymentMethod === 'STRIPE') {
        gatewayId = await handleStripeCheckout(itemsPayload);
      } else if (paymentMethod === 'RAZORPAY') {
        const total = cart.totalAmount + (cart.totalAmount > 500 ? 0 : 29) + 15;
        gatewayId = await handleRazorpayCheckout(itemsPayload, total);
      }

      const orderRequest = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        paymentGatewayId: gatewayId,
        items: itemsPayload,
      };

      await api.post('/orders', orderRequest);
      dispatch(clearCart());
      alert('Order Placed Successfully! Confirmation email/notification sent.');
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order. Check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-left">
      <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Area - Addresses & Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Delivery Address Section */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blinkit-green" />
                Select Delivery Address
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-1 py-1 px-3 border border-gray-200 dark:border-zinc-800 hover:border-blinkit-green dark:hover:border-emerald-500 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-400"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </button>
            </div>

            {/* Address Creation Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-4 bg-gray-50 dark:bg-zinc-850/30 rounded-2xl border border-gray-150 dark:border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300">New Address</h3>
                <input
                  type="text"
                  placeholder="Flat/House No., Street name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-xs"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent text-xs"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="py-1.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-blinkit-green text-white rounded-xl text-xs font-semibold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List of addresses */}
            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No addresses saved. Please add one to deliver items.</p>
            ) : (
              <div className="grid gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'border-blinkit-green bg-blinkit-green/5 dark:border-emerald-500 dark:bg-emerald-950/15'
                          : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800'
                      }`}
                    >
                      <div className="text-xs">
                        <p className="font-extrabold text-gray-800 dark:text-zinc-200">{addr.street}</p>
                        <p className="text-gray-400 dark:text-zinc-400 mt-0.5">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blinkit-green dark:bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method selection */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blinkit-green" />
              Select Payment Method
            </h2>
            
            <div className="grid gap-3">
              {[
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay when rider arrives' },
                { id: 'RAZORPAY', label: 'Razorpay (Mock Gateway)', desc: 'Templates integrated' },
                { id: 'STRIPE', label: 'Stripe (Mock Gateway)', desc: 'Credit card templates' },
              ].map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'border-blinkit-green bg-blinkit-green/5 dark:border-emerald-500 dark:bg-emerald-950/15'
                        : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800'
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-extrabold text-gray-800 dark:text-zinc-200">{method.label}</p>
                      <p className="text-gray-400 dark:text-zinc-400 mt-0.5">{method.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blinkit-green dark:bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Area - Checkout Billing Summary */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-gray-800 dark:text-zinc-200 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blinkit-green" />
            Order Summary
          </h2>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 border-b border-gray-100 dark:border-zinc-850 pb-3">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-xs text-gray-600 dark:text-zinc-400">
                <span className="truncate max-w-[150px]">{item.product.name} (x{item.quantity})</span>
                <span className="font-semibold text-gray-900 dark:text-zinc-200">
                  ₹{(item.product.price * (1 - item.product.discount / 100.0) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-b border-gray-100 dark:border-zinc-850 pb-3">
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Items Total</span>
              <span>₹{cart.totalAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Delivery Fee</span>
              <span>{cart.totalAmount > 500 ? 'FREE' : '₹29'}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-zinc-400">
              <span>Handling Charge</span>
              <span>₹15</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-zinc-50 font-black text-sm pt-2">
              <span>Payable Amount</span>
              <span>₹{(cart.totalAmount + (cart.totalAmount > 500 ? 0 : 29) + 15).toFixed(0)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-3.5 px-5 bg-blinkit-green hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blinkit-green/20 transition-all text-xs disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>

      </div>
    </div>
  );
};
export default Checkout;
