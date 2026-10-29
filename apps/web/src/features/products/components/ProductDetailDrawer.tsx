import React from 'react';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Product } from '../../../types/domain';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { useAuthStore } from '../../../store/authStore';
import { hasPermission } from '../../../config/permissions';

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  const { user } = useAuthStore();
  const canViewCost = hasPermission(user?.role, 'products:view_cost');

  if (!product) return null;

  const isLowStock = product.currentStock <= product.minStockThreshold;
  const isOut = product.currentStock <= 0;
  const grossMargin =
    product.sellingPrice > 0
      ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100)
      : 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku}`}
      width="md"
    >
      <div className="space-y-6">
        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {product.isActive ? (
            <Badge variant="success">Active Product</Badge>
          ) : (
            <Badge variant="danger">Archived / Inactive</Badge>
          )}

          {isOut ? (
            <Badge variant="danger">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge variant="warning">Low Stock ({product.currentStock} left)</Badge>
          ) : (
            <Badge variant="default">{product.currentStock} in stock</Badge>
          )}
        </div>

        {/* Pricing & Margins Card */}
        <div className="bg-slate-50 p-4 rounded-[var(--radius-card)] border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pricing & Margins
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Retail Price:</span>
              <span className="text-lg font-black text-slate-900">
                {formatNaira(product.sellingPrice)}
              </span>
            </div>
            {canViewCost && (
              <div>
                <span className="text-slate-500 block">Cost Price:</span>
                <span className="text-base font-bold text-slate-700">
                  {formatNaira(product.costPrice)}
                </span>
              </div>
            )}
          </div>
          {canViewCost && (
            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
              <span className="text-slate-500">Gross Margin:</span>
              <span className="font-bold text-emerald-700">
                {formatNaira(product.sellingPrice - product.costPrice)} ({grossMargin}%)
              </span>
            </div>
          )}
        </div>

        {/* Inventory Details */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">Inventory Metrics</h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-[var(--radius-control)] p-3 space-y-2">
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Unit of Measure:</span>
              <span className="font-semibold text-slate-800 capitalize">{product.unit}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Current Balance:</span>
              <span className="font-bold text-slate-900">{product.currentStock} {product.unit}s</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Low Stock Threshold:</span>
              <span className="text-slate-700">{product.minStockThreshold} {product.unit}s</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Category:</span>
              <span className="text-slate-700">{product.categoryName}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Barcode / UPC:</span>
              <span className="font-mono text-slate-700">{product.barcode || '—'}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-500">Supplier:</span>
              <span className="text-slate-700">{product.supplierName || 'Direct'}</span>
            </div>
          </div>
        </div>

        {/* Expiry Tracking Section */}
        {product.trackExpiry && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-[var(--radius-control)] text-xs space-y-1">
            <h5 className="font-bold text-amber-900">Perishable / Expiry Tracking Enabled</h5>
            <p className="text-amber-800">
              Next Batch Expiry: <strong>{formatDate(product.expiryDate)}</strong>
            </p>
            {product.batchNumber && (
              <p className="text-amber-800 font-mono text-[11px]">
                Batch Lot: {product.batchNumber}
              </p>
            )}
          </div>
        )}

        {/* Drawer Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button
            variant={product.isActive ? 'danger' : 'outline'}
            size="sm"
            onClick={() => onToggleStatus(product.id)}
            className="w-full"
          >
            {product.isActive ? 'Archive Product' : 'Restore Product'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

