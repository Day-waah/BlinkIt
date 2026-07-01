import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Product } from '../types';
import { Sparkles, ShoppingBag } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeBudget = useSelector((state: RootState) => state.budget.activeBudget);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/search?query=${encodeURIComponent(query)}&size=50`);
        setProducts(response.data.content);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const remaining = activeBudget ? activeBudget.remainingAmount : 0;
  
  // Partitioning by budget compatibility
  const budgetFits = activeBudget 
    ? products.filter((p) => p.price * (1 - p.discount / 100.0) <= remaining)
    : [];
  
  const budgetExceeds = activeBudget
    ? products.filter((p) => p.price * (1 - p.discount / 100.0) > remaining)
    : products;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 text-left">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50">
          Search Results for "{query}"
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Found {products.length} matching products
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          
          {/* BUDGET COMPLIANT SEGMENT */}
          {activeBudget && budgetFits.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-950 pb-2">
                <div className="p-1 bg-emerald-50 dark:bg-emerald-950/20 text-blinkit-green dark:text-emerald-400 rounded-lg">
                  <Sparkles className="w-4 h-4 text-blinkit-yellow fill-current" />
                </div>
                <h2 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400">Recommended For Your Budget</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {budgetFits.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* OTHER OPTIONS SEGMENT */}
          <div className="space-y-4">
            {activeBudget && budgetFits.length > 0 && budgetExceeds.length > 0 && (
              <div className="border-b border-gray-100 dark:border-zinc-850 pb-2">
                <h2 className="text-sm font-extrabold text-gray-500 dark:text-zinc-400">Other Available Options</h2>
              </div>
            )}
            
            {budgetExceeds.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {budgetExceeds.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : activeBudget && budgetFits.length > 0 ? (
              <p className="text-xs text-gray-400 italic">No other items outside remaining budget.</p>
            ) : null}
          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/30 border border-dashed border-gray-250 dark:border-zinc-800 rounded-3xl">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-400">No products found matching your search term.</p>
          <p className="text-xs text-gray-300 dark:text-zinc-500 mt-1">Try searching for other general categories like milk, vegetable, etc.</p>
        </div>
      )}
    </div>
  );
};
export default SearchPage;
