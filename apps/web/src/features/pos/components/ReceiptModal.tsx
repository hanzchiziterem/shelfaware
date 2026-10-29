import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import { usePosStore } from '../../../store/posStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { Button } from '../../../components/ui/Button';

export const ReceiptModal: React.FC = () => {
  const { lastCompletedSale, isReceiptModalOpen, closeReceiptModal } = usePosStore();
  const { settings } = useSettingsStore();

  if (!isReceiptModalOpen || !lastCompletedSale) return null;

  const biz = settings?.business || {
    name: 'Adeola Foods & Provisions',
    address: '14 Broad Street, Lagos Island, Lagos',
    phone: '+234 802 345 6789',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={closeReceiptModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-white rounded-[var(--radius-card)] shadow-floating border border-slate-200 p-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Success top badge */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="printable-receipt"
          className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded text-slate-900 font-mono text-xs space-y-3"
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <h3 className="font-bold text-sm tracking-wide uppercase">{biz.name}</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">{biz.address}</p>
            <p className="text-[11px] text-slate-600">Tel: {biz.phone}</p>
            <div className="mt-2 text-[10px] text-slate-500">
              Receipt: <span className="font-bold text-slate-800">{lastCompletedSale.transactionNumber}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Date: {formatDate(lastCompletedSale.createdAt, true)}
            </div>
          </div>

          {/* Cashier & Customer Info */}
          <div className="text-[11px] space-y-0.5 text-slate-600 pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span className="font-semibold text-slate-800">{lastCompletedSale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold text-slate-800">{lastCompletedSale.customerName}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span>Item / Qty</span>
              <span>Amount</span>
            </div>
            {lastCompletedSale.items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="font-bold text-slate-900">{item.productName}</div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>
                    {item.quantity} x {formatNaira(item.unitPrice)}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatNaira(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Totals */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatNaira(lastCompletedSale.subtotal)}</span>
            </div>
            {lastCompletedSale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>- {formatNaira(lastCompletedSale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900">
              <span>TOTAL PAID:</span>
              <span>{formatNaira(lastCompletedSale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>Payment Method:</span>
              <span className="capitalize font-semibold text-slate-800">{lastCompletedSale.paymentMethod}</span>
            </div>
            {lastCompletedSale.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Cash Tendered:</span>
                  <span>{formatNaira(lastCompletedSale.amountReceived)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span>Change Given:</span>
                  <span>{formatNaira(lastCompletedSale.changeDue)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
            <p>Thank you for shopping with us!</p>
            <p className="mt-0.5">Goods sold in good condition are not returnable.</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={closeReceiptModal} className="w-1/2">
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="w-1/2 bg-slate-900 hover:bg-slate-800"
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

