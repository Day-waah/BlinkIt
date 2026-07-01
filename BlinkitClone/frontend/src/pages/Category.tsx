import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product, Category } from '../types';
import { Sparkles, ArrowRight, Wallet } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);
  const categoriesList = useSelector((state: RootState) => state.product.categories);

  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [budgetSorted, setBudgetSorted] = useState<boolean>(true);

  // Fetch products & category metadata
  useEffect(() => {
    if (!slug) return;
    
    const loadCategoryData = async () => {
      setLoading(true);
      try {
        // Find category
        const catResponse = await api.get(`/categories/slug/${slug}`);
        const categoryObj = catResponse.data as Category;
        setCurrentCategory(categoryObj);

        // Fetch products: if budget is active and toggle is ON, fetch recommended
        if (activeBudget && budgetSorted) {
          const prodResponse = await api.get(`/products/recommendations/${categoryObj.id}`);
          setProducts(prodResponse.data);
        } else {
          const prodResponse = await api.get(`/products/category/${slug}?size=50`);
          setProducts(prodResponse.data.content);
        }
      } catch (err) {
        console.error('Error loading category page', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, activeBudget, budgetSorted]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        
        {/* Left Sidebar - Categories List */}
        <aside className="w-64 shrink-0 hidden md:block border-r border-gray-150 dark:border-zinc-800 pr-4">
          <h2 className="text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Categories</h2>
          <div className="space-y-1">
            {categoriesList.map((cat) => {
              const isActive = cat.slug === slug;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blinkit-green/10 text-blinkit-green dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-base">📦</span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 space-y-6 text-left">
          
          {/* Category Header with Smart Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-zinc-850 pb-4 gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50">
                {currentCategory?.name || 'Browse Items'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {products.length} {products.length === 1 ? 'item' : 'items'} available
              </p>
            </div>

            {/* Smart Budget filter toggle */}
            {activeBudget && (
              <button
                onClick={() => setBudgetSorted(!budgetSorted)}
                className={`inline-flex items-center gap-2 py-2 px-4 rounded-full border text-xs font-extrabold shadow-sm transition-all ${
                  budgetSorted
                    ? 'bg-blinkit-green/10 border-blinkit-green text-blinkit-green dark:bg-emerald-500/10 dark:border-emerald-400 dark:text-emerald-400'
                    : 'bg-white border-gray-250 dark:bg-zinc-900 dark:border-zinc-800 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blinkit-yellow fill-current" />
                <span>Smart Budget Recommendations</span>
              </button>
            )}
          </div>

          {/* Smart Budget helper tip */}
          {activeBudget && budgetSorted && products.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-2.5 dark:bg-emerald-950/20 dark:border-emerald-900/50">
              <Wallet className="w-5 h-5 text-blinkit-green dark:text-emerald-400" />
              <p className="text-xs text-emerald-800 dark:text-zinc-300">
                <span className="font-bold">Prioritized matches:</span> Products that fit within your remaining budget (₹{activeBudget.remainingAmount.toFixed(0)}) are sorted first to help you make decisions.
              </p>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
              <p className="text-sm font-bold text-gray-400">No products found in this category.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
export default CategoryPage;
