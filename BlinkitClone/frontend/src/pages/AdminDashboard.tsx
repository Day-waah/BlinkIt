import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product, Category } from '../types';
import { Settings, Plus, Edit, Trash, Check, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [loading, setLoading] = useState<boolean>(false);

  // Form states for new product
  const [pName, setPName] = useState<string>('');
  const [pPrice, setPPrice] = useState<string>('');
  const [pDiscount, setPDiscount] = useState<string>('0');
  const [pStock, setPStock] = useState<string>('100');
  const [pUnit, setPUnit] = useState<string>('1 unit');
  const [pCategory, setPCategory] = useState<string>('');
  const [pBrand, setPBrand] = useState<string>('');
  const [pDesc, setPDesc] = useState<string>('');
  const [pImg, setPImg] = useState<string>('');

  // Form states for new category
  const [cName, setCName] = useState<string>('');
  const [cSlug, setCSlug] = useState<string>('');
  const [cDesc, setCDesc] = useState<string>('');
  const [cImg, setCImg] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setPCategory(catRes.data[0].id.toString());
      }
      const prodRes = await api.get('/products?size=100');
      setProducts(prodRes.data.content);
    } catch (e) {
      console.error('Failed to load admin panel data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pStock || !pCategory) return;
    try {
      const payload = {
        name: pName,
        price: parseFloat(pPrice),
        discount: parseFloat(pDiscount),
        stockQuantity: parseInt(pStock),
        unit: pUnit,
        categoryId: parseInt(pCategory),
        brand: pBrand,
        description: pDesc,
        imageUrl: pImg,
      };

      const response = await api.post('/admin/products', payload);
      setProducts([...products, response.data]);
      alert('Product created successfully!');
      
      // Reset form
      setPName('');
      setPPrice('');
      setPDiscount('0');
      setPStock('100');
      setPUnit('1 unit');
      setPBrand('');
      setPDesc('');
      setPImg('');
    } catch (err) {
      alert('Failed to create product.');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cSlug) return;
    try {
      const payload = {
        name: cName,
        slug: cSlug.toLowerCase().replace(/\s+/g, '-'),
        description: cDesc,
        imageUrl: cImg,
      };

      const response = await api.post('/admin/categories', payload);
      setCategories([...categories, response.data]);
      alert('Category created successfully!');
      
      // Reset form
      setCName('');
      setCSlug('');
      setCDesc('');
      setCImg('');
    } catch (err) {
      alert('Failed to create category.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-left max-w-5xl space-y-6">
      
      <div className="flex items-center gap-2 border-b border-gray-150 dark:border-zinc-800 pb-4">
        <div className="p-2 bg-zinc-950 text-white rounded-xl dark:bg-white dark:text-zinc-950">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-zinc-50">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage platform products, category settings, and stock</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 text-xs font-black rounded-xl border transition-all ${
            activeTab === 'products'
              ? 'bg-blinkit-green border-blinkit-green text-white dark:bg-emerald-500 dark:border-emerald-500'
              : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-500'
          }`}
        >
          Product Management
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2 px-4 text-xs font-black rounded-xl border transition-all ${
            activeTab === 'categories'
              ? 'bg-blinkit-green border-blinkit-green text-white dark:bg-emerald-500 dark:border-emerald-500'
              : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-500'
          }`}
        >
          Category Settings
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blinkit-green" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TAB 1: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <>
              {/* Product List Grid */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Inventory List ({products.length})</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div 
                      key={p.id} 
                      className="p-3 bg-gray-50 dark:bg-zinc-850/30 border border-gray-150 dark:border-zinc-850 rounded-2xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-extrabold text-gray-800 dark:text-zinc-200">{p.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Price: ₹{p.price} • Stock: <span className={p.stockQuantity <= 10 ? 'text-red-500 font-bold animate-pulse' : 'text-gray-500'}>{p.stockQuantity}</span> • Unit: {p.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete product"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Product Form */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
                <h2 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Product
                </h2>
                <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Basmati Rice"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 199"
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Discount (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={pDiscount}
                        onChange={(e) => setPDiscount(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Stock Qty</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={pStock}
                        onChange={(e) => setPStock(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Unit Weight</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 kg, 500 ml"
                        value={pUnit}
                        onChange={(e) => setPUnit(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent dark:text-zinc-300"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Farms"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={pImg}
                      onChange={(e) => setPImg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Description</label>
                    <textarea
                      placeholder="Product details..."
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent h-20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-blinkit-green hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
                  >
                    Save Product
                  </button>
                </form>
              </div>
            </>
          )}

          {/* TAB 2: CATEGORY SETTINGS */}
          {activeTab === 'categories' && (
            <>
              {/* Category list */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">All Categories ({categories.length})</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-3 bg-gray-50 dark:bg-zinc-850/30 border border-gray-150 dark:border-zinc-850 rounded-2xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-extrabold text-gray-800 dark:text-zinc-200">{c.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Slug: {c.slug}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Category Form */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
                <h2 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add New Category
                </h2>
                <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dairy & Eggs"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Slug (URL identifier)</label>
                    <input
                      type="text"
                      placeholder="e.g. dairy-eggs"
                      value={cSlug}
                      onChange={(e) => setCSlug(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={cImg}
                      onChange={(e) => setCImg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Description</label>
                    <textarea
                      placeholder="Category highlights..."
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-transparent h-20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-blinkit-green hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
                  >
                    Save Category
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
