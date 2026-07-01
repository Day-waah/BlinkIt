export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount: number;
  stockQuantity: number;
  unit: string;
  rating: number;
  brand?: string;
  imageUrl?: string;
  category?: Category;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface Budget {
  id: number;
  userId: number;
  amount: number;
  duration: 'SESSION' | 'WEEKLY' | 'MONTHLY';
  remainingAmount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: number;
  address: Address;
  totalAmount: number;
  budgetId?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BudgetAlternativeResponse {
  originalProduct: Product;
  alternatives: Product[];
}

export interface BudgetOverflowResponse {
  exceededAmount: number;
  cartTotal: number;
  budgetLimit: number;
  remainingBudget: number;
  overflowingProducts: Product[];
  suggestedSwaps: BudgetAlternativeResponse[];
}
