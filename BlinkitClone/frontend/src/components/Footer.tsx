import React from 'react';
import { ShieldCheck, Truck, RotateCcw, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-150 py-10 mt-20 dark:bg-zinc-950 dark:border-zinc-900 transition-colors">
      <div className="container mx-auto px-4">
        
        {/* Value Prop Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-gray-250/20 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-blinkit-green">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-300">Superfast Delivery</h4>
              <p className="text-gray-400 dark:text-zinc-500 mt-0.5">Get your order in minutes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-blinkit-green">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-300">Best Prices & Offers</h4>
              <p className="text-gray-400 dark:text-zinc-500 mt-0.5">Direct deals from vendors</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-blinkit-green">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-300">Easy Returns</h4>
              <p className="text-gray-400 dark:text-zinc-500 mt-0.5">No questions asked refund</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl text-blinkit-green">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-300">Help & Support</h4>
              <p className="text-gray-400 dark:text-zinc-500 mt-0.5">24/7 dedicated support desk</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 dark:text-zinc-500 gap-4">
          <p>© 2026 Blinkit Clone. All rights reserved. Built with Smart Budget Shopping System.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline font-medium">Privacy Policy</a>
            <a href="#" className="hover:underline font-medium">Terms of Service</a>
            <a href="#" className="hover:underline font-medium">Fulfillment Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
