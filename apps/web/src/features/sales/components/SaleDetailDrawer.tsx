import React from 'react';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Sale } from '../../../types/domain';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { Printer, Ban } from 'lucide-react';

interface SaleDetailDrawerProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onVoid: (id: string) => void;
}

export const SaleDetailDrawer: React.FC<SaleDetailDrawerProps> = ({
  sale,
  isOpen,
  onClose,
  onVoid,
}) => {
  if (!sale) return null;

  const isCompleted = sale.status === 'completed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Transaction ${sale.transactionNumber}`}
      subtitle={formatDate(sale.createdAt, true)}
      width="lg"
    >
      <div className="space-y-6">
        {/* Status & Method Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant={
              sale.status === 'completed'
                ? 'success'
                : sale.status === 'voided'
                ? 'danger'
                : 'warning'
            }
          >
            {sale.status.toUpperCase()}
          </Badge>

          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-800 capitalize">
            Tender: {sale.paymentMethod}
          </span>
        </div>

        {/* Customer & Cashier Card */}
        <div className="bg-slate-50 p-3.5 rounded-[var(--radius-card)] border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-semibold text-slate-900">{sale.customerName}</span>
          </div>
          {sale.customerPhone && (
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="text-slate-700">{sale.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Served By:</span>
            <span className="font-medium text-slate-800">{sale.cashierName}</span>
          </div>
          {sale.notes && (
            <div className="pt-2 border-t border-slate-200 text-slate-600">
              <span className="font-semibold block text-slate-700">Remarks:</span>
              {sale.notes}
            </div>
          )}
        </div>

        {/* Items Purchased List */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Items Ordered ({sale.items.length})
          </h4>
          <div className="border border-slate-200 rounded-[var(--radius-control)] divide-y divide-slate-100 text-xs">
            {sale.items.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-slate-900">{item.productName}</h5>
                  <p className="text-[11px] text-slate-400">
                    {item.quantity} {item.unit}s x {formatNaira(item.unitPrice)}
                  </p>
                </div>
                <span className="font-bold text-slate-900 font-mono">
                  {formatNaira(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-1.5 text-xs p-3.5 bg-slate-50 rounded-[var(--radius-card)] border border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatNaira(sale.subtotal)}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discount</span>
              <span>- {formatNaira(sale.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold text-slate-900">
            <span className="text-xs uppercase">Total Paid</span>
            <span className="text-base text-slate-900">{formatNaira(sale.totalAmount)}</span>
          </div>
          {sale.paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Cash Tendered</span>
                <span>{formatNaira(sale.amountReceived)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 text-xs font-semibold">
                <span>Change Returned</span>
                <span>{formatNaira(sale.changeDue)}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
          {isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVoid(sale.id)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50"
              leftIcon={<Ban className="w-3.5 h-3.5" />}
            >
              Void Transaction
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="ml-auto"
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Reprint Receipt
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

