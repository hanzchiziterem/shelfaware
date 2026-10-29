import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../../store/productStore';
import { useCustomerStore } from '../../../store/customerStore';
import { usePosStore } from '../../../store/posStore';
import { ProductGrid } from '../components/ProductGrid';
import { CartSidebar } from '../components/CartSidebar';
import { CheckoutModal } from '../components/CheckoutModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { SearchInput } from '../../../components/ui/SearchInput';
import { LoadingState } from '../../../components/ui/LoadingState';
import { cn } from '../../../utils/cn';

export const PosPage: React.FC = () => {
  const { products, categories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { fetchCustomers } = useCustomerStore();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = usePosStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, [fetchProducts, fetchCategories, fetchCustomers]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5.5rem)] min-h-[580px]">
      {/* Left side: Product catalog search and grid */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[var(--radius-card)] shadow-subtle p-4 overflow-hidden">
        {/* Top Controls: Search and Categories */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products by name, SKU or barcode..."
              className="max-w-md"
            />
            <span className="text-xs text-slate-500 hidden sm:inline">
              <strong className="text-slate-800">{products.filter((p) => p.isActive).length}</strong> Active Items
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors border select-none',
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors border select-none',
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1">
          {isLoading && products.length === 0 ? (
            <LoadingState message="Loading catalog inventory..." />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>

      {/* Right side: Active Register Cart */}
      <div className="w-full lg:w-96 shrink-0 h-full">
        <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Modals */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <ReceiptModal />
    </div>
  );
};

