import React, { useMemo } from 'react';
import { Plus, AlertCircle, Package } from 'lucide-react';
import { Product } from '../../../types/domain';
import { usePosStore } from '../../../store/posStore';
import { formatNaira } from '../../../utils/currency';
import { cn } from '../../../utils/cn';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { searchQuery, selectedCategory, addToCart, cart } = usePosStore();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Must be active
      if (!product.isActive) return false;

      // Category filter
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesBarcode = product.barcode?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      {filteredProducts.map((product) => {
        const isOutOfStock = product.currentStock <= 0;
        const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStockThreshold;

        // Check how many are already in the cart
        const inCartItem = cart.find((i) => i.product.id === product.id);
        const inCartQty = inCartItem?.quantity || 0;
        const remainingStock = Math.max(0, product.currentStock - inCartQty);

        return (
          <div
            key={product.id}
            onClick={() => !isOutOfStock && remainingStock > 0 && addToCart(product, 1)}
            className={cn(
              'group relative flex flex-col justify-between p-3 rounded-[var(--radius-card)] bg-white border border-slate-200 transition-all select-none',
              isOutOfStock || remainingStock <= 0
                ? 'opacity-60 bg-slate-50 cursor-not-allowed'
                : 'hover:border-slate-400 hover:shadow-card cursor-pointer active:scale-[0.99]'
            )}
          >
            <div>
              {/* Header: Unit & Stock status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {product.unit}
                </span>

                <div className="flex items-center gap-1 text-[11px]">
                  {isOutOfStock || remainingStock <= 0 ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Out
                    </span>
                  ) : isLowStock ? (
                    <span className="text-amber-600 font-medium">
                      {remainingStock} left
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      {remainingStock} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-2 min-h-[32px] transition-colors">
                {product.name}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                {product.sku}
              </p>
            </div>

            {/* Footer: Price & Add Icon */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">
                  {formatNaira(product.sellingPrice)}
                </span>
              </div>

              <button
                disabled={isOutOfStock || remainingStock <= 0}
                className={cn(
                  'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
                  isOutOfStock || remainingStock <= 0
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white'
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Active cart count badge */}
            {inCartQty > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {inCartQty}
              </div>
            )}
          </div>
        );
      })}

      {filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center text-slate-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No matching retail products found.</p>
        </div>
      )}
    </div>
  );
};

