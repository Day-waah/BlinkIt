import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { fetchCategoriesSuccess, fetchProductsSuccess } from '../store/slices/productSlice';
import { triggerBudgetPopup } from '../store/slices/budgetSlice';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product, Category } from '../types';
import { Sparkles, PiggyBank, ArrowRight, ShoppingBag } from 'lucide-react';

export const Home: React.FC = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.product.categories);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { activeBudget, skippedPopup } = useSelector((state: RootState) => state.budget);

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if we should trigger budget popup
    if (isAuthenticated && !activeBudget && !skippedPopup) {
      // Small timeout so popup feels natural
      const timer = setTimeout(() => {
        dispatch(triggerBudgetPopup(true));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, activeBudget, skippedPopup, dispatch]);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catRes = await api.get('/categories');
        dispatch(fetchCategoriesSuccess(catRes.data));

        // Fetch products for home (first page)
        const prodRes = await api.get('/products?size=8');
        setTrendingProducts(prodRes.data.content);
        dispatch(fetchProductsSuccess(prodRes.data.content));
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [dispatch]);

  // Fallback Categories if db is clean/empty (gives beautiful initial aesthetic)
  const defaultCategories = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥦' },
    { name: 'Dairy, Bread & Eggs', slug: 'dairy-bread-eggs', icon: '🥛' },
    { name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', icon: '🥤' },
    { name: 'Snacks & Munchies', slug: 'snacks-munchies', icon: '🍿' },
    { name: 'Bakery & Sweet', slug: 'bakery-sweet', icon: '🍰' },
    { name: 'Instant & Frozen Food', slug: 'instant-frozen-food', icon: '🍜' },
    { name: 'Tea, Coffee & Health Drinks', slug: 'tea-coffee-health', icon: '☕' },
    { name: 'Personal Care', slug: 'personal-care', icon: '🧴' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-12">
      
      {/* Premium Hero Promo Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl text-white">
        <div className="space-y-4 max-w-lg z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blinkit-yellow" />
            Budget Aware Delivery
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Grocery Delivery with a Smart Wallet
          </h1>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Get groceries delivered to your doorstep in minutes. Set a shopping budget and our smart assistant will help you stay within your limits with alternative suggestions.
          </p>
          {!activeBudget && (
            <button
              onClick={() => dispatch(triggerBudgetPopup(true))}
              className="mt-2 flex items-center gap-2 py-3 px-6 bg-blinkit-yellow text-zinc-950 font-black rounded-2xl hover:scale-105 transition-all shadow-lg text-sm"
            >
              <PiggyBank className="w-5 h-5" />
              Set Shopping Budget
            </button>
          )}
        </div>
        
        {/* Abstract Graphic Shape */}
        <div className="hidden md:block w-72 h-72 bg-white/10 rounded-full blur-3xl absolute right-10 top-0 -z-0" />
        <div className="hidden md:flex flex-col items-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl z-10 shadow-lg text-xs font-bold max-w-xs">
          <ShoppingBag className="w-12 h-12 text-blinkit-yellow mb-2 animate-bounce" />
          <p className="text-blinkit-yellow text-sm">10-Minute Dispatch</p>
          <p className="text-emerald-100 text-center font-normal mt-1 leading-relaxed">
            Stocked nearby hubs guarantee rapid shipping straight to you.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">Shop by Category</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {(categories.length > 0 ? categories : defaultCategories).map((cat: any) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center p-4 bg-gray-50 hover:bg-white dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-center transition-all hover:shadow-md"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 object-contain" />
                ) : (
                  cat.icon || '📦'
                )}
              </span>
              <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-300 line-clamp-1 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending / Recommended Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">Trending Items</h2>
          <Link
            to="/category/fruits-vegetables"
            className="flex items-center gap-1 text-xs font-bold text-blinkit-green hover:text-green-700 dark:text-emerald-400"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-zinc-900/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-xs font-bold text-gray-400">No products uploaded yet. Please use Admin Panel to seed items.</p>
          </div>
        )}
      </section>

    </div>
  );
};
export default Home;
