import React, { useState } from 'react';
import {
  GripVertical,
  Maximize2,
  X,
  Mail,
  Phone,
  Printer,
  Copy,
  Download,
  MoreHorizontal,
  Package,
  Ban,
} from 'lucide-react';
import { Sale } from '../../../types/domain';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { useSalesStore } from '../../../store/salesStore';
import { useProductStore } from '../../../store/productStore';

interface OrderFloatingCardProps {
  sale: Sale;
  onClose: () => void;
}

export const OrderFloatingCard: React.FC<OrderFloatingCardProps> = ({ sale, onClose }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'delivery' | 'docs'>('items');
  const { voidSale } = useSalesStore();
  const { fetchProducts } = useProductStore();
  const [isVoiding, setIsVoiding] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleVoid = async () => {
    if (!window.confirm(`Void order ${sale.transactionNumber}? All items will be restored to inventory stock.`)) {
      return;
    }
    setIsVoiding(true);
    await voidSale(sale.id, 'Customer cancellation / cashier refund');
    await fetchProducts();
    setIsVoiding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Floating Card Modal matching image 1 */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header matching image 1: ':: Order #4567' + icons */}
        <div className="px-4 py-3 bg-[#0B0F19] text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
            <span>Order #{sale.transactionNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={() => alert('Full view expanded')}
              className="p-1 hover:text-white rounded"
              title="Expand view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:text-white rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Info Card matching image 1 */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
              {sale.customerName.charAt(0)}
            </div>
            <span>{sale.customerName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{sale.customerName.toLowerCase().replace(/\s+/g, '.') + '@gmail.com'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{sale.customerPhone || '+234 (802) 345-6789'}</span>
          </div>
        </div>

        {/* Tabs: Order items, Delivery, Docs */}
        <div className="px-4 pt-2.5 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'items'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Order items ({sale.items.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'delivery'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Docs
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-72 overflow-y-auto space-y-3">
          {activeTab === 'items' && (
            <div className="space-y-3 divide-y divide-slate-100">
              {sale.items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">
                      {item.productName}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.quantity} x {formatNaira(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatNaira(item.subtotal)}
                  </span>
                </div>
              ))}

              <div className="pt-3 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-xs text-slate-500 font-semibold">Total Paid:</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatNaira(sale.totalAmount)}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold text-slate-800">Store Pickup / Walk-in</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pickup Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(sale.createdAt, true)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">14 Broad Street, Lagos Island</span>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="text-xs text-slate-600 space-y-2">
              <p className="text-slate-500">Electronic customer receipt available for printing.</p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] flex justify-between items-center">
                <span>Receipt_{sale.transactionNumber}.pdf</span>
                <button onClick={handlePrint} className="text-emerald-600 font-bold hover:underline">
                  Print
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions matching image 1: ↑ Export | ⧉ Duplicate | ⎙ Print | ... */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Exporting order ${sale.transactionNumber}...`)}
              className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => alert(`Duplicating items to cart...`)}
              className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {sale.status === 'completed' && (
              <button
                onClick={handleVoid}
                disabled={isVoiding}
                className="px-2.5 py-1.5 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 font-semibold text-rose-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Void order and restore stock"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isVoiding ? 'Voiding...' : 'Void'}</span>
              </button>
            )}
          </div>

          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
