import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const getStoredCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    return [];
  }
};

const initialItems = getStoredCart();
const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      const price = item.product.price * (1 - item.product.discount / 100.0);
      acc.quantity += item.quantity;
      acc.amount += price * item.quantity;
      return acc;
    },
    { quantity: 0, amount: 0 }
  );
};

const totals = calculateTotals(initialItems);

const initialState: CartState = {
  items: initialItems,
  totalQuantity: totals.quantity,
  totalAmount: totals.amount,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      const calculated = calculateTotals(state.items);
      state.totalQuantity = calculated.quantity;
      state.totalAmount = calculated.amount;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart(state, action: PayloadAction<number>) {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);

      const calculated = calculateTotals(state.items);
      state.totalQuantity = calculated.quantity;
      state.totalAmount = calculated.amount;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }

      const calculated = calculateTotals(state.items);
      state.totalQuantity = calculated.quantity;
      state.totalAmount = calculated.amount;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
