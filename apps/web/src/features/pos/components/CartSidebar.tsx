import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, User, Tag, ArrowRight } from 'lucide-react';
import { usePosStore } from '../../../store/posStore';
import { useCustomerStore } from '../../../store/customerStore';
import { formatNaira } from '../../../utils/currency';
import { Button } from '../../../components/ui/Button';

interface CartSidebarProps {
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    discountType,
    discountValue,
    setDiscount,
    getSubtotal,
    getDiscountAmount,
    getGrandTotal,
  } = usePosStore();

  const { customers } = useCustomerStore();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const grandTotal = getGrandTotal();

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-[var(--radius-card)] shadow-subtle overflow-hidden">
      {/* Top Customer selector */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/75">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
            <User className="w-3.5 h-3.5 text-slate-500" /> Customer
          </label>
          <span className="text-[10px] text-slate-400">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </span>
        </div>
        <select
          value={selectedCustomer?.id || 'cust-walkin'}
          onChange={(e) => {
            const found = customers.find((c) => c.id === e.target.value) || null;
            setSelectedCustomer(found);
          }}
          className="w-full h-8 text-xs bg-white border border-slate-300 rounded-[var(--radius-control)] px-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
        >
          <option value="cust-walkin">Walk-in Customer (General Retail)</option>
          {customers
            .filter((c) => !c.isWalkIn)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone !== '—' ? `(${c.phone})` : ''}
              </option>
            ))}
        </select>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
        {cart.map((item) => {
          const maxStock = item.product.currentStock;

          return (
            <div key={item.product.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-slate-900 truncate">
                  {item.product.name}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {formatNaira(item.unitPrice)} / {item.product.unit}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    disabled={item.quantity >= maxStock}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-slate-400 ml-1">
                    (Max: {maxStock})
                  </span>
                </div>
              </div>

              {/* Subtotal & Delete */}
              <div className="text-right flex flex-col items-end justify-between self-stretch">
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900">
                  {formatNaira(item.subtotal)}
                </span>
              </div>
            </div>
          );
        })}

        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <ShoppingCart className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs font-medium text-slate-600">Register cart is empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any product in the catalog to add</p>
          </div>
        )}
      </div>

      {/* Summary & Checkout Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/75 space-y-3">
        {/* Discount Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
            <Tag className="w-3 h-3" />
            <span>Discount:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={discountType}
              onChange={(e) => setDiscount(e.target.value as any, discountValue)}
              className="h-6 text-[11px] bg-white border border-slate-300 rounded px-1 text-slate-700"
            >
              <option value="fixed">₦ Fixed</option>
              <option value="percentage">% Pct</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discountValue || ''}
              onChange={(e) => setDiscount(discountType, parseFloat(e.target.value) || 0)}
              className="w-20 h-6 text-right text-xs bg-white border border-slate-300 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Calculation summary */}
        <div className="space-y-1 text-xs pt-1 border-t border-slate-200">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>- {formatNaira(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1.5 text-slate-900 border-t border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wide">Total Due</span>
            <span className="text-lg font-extrabold text-slate-900">{formatNaira(grandTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={cart.length === 0}
            onClick={clearCart}
            className="text-slate-600"
          >
            Clear
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Checkout ({cart.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

