import React from 'react';
import { Banknote, CreditCard, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePosStore } from '../../../store/posStore';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PaymentMethod } from '../../../types/domain';
import { formatNaira } from '../../../utils/currency';
import { cn } from '../../../utils/cn';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    getGrandTotal,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    notes,
    setNotes,
    processCheckout,
    isProcessing,
    error,
  } = usePosStore();

  const grandTotal = getGrandTotal();
  const changeDue = amountReceived >= grandTotal ? amountReceived - grandTotal : 0;

  // Preset quick cash denominations for Nigerian retail (₦)
  const quickCashOptions = [
    grandTotal,
    Math.ceil(grandTotal / 1000) * 1000,
    Math.ceil(grandTotal / 5000) * 5000,
    Math.ceil(grandTotal / 10000) * 10000,
  ].filter((val, idx, arr) => val >= grandTotal && arr.indexOf(val) === idx);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await processCheckout();
    if (success) {
      onClose();
    }
  };

  const paymentMethods: Array<{ id: PaymentMethod; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'cash', label: 'Cash Tender', icon: Banknote },
    { id: 'card', label: 'POS Terminal / Card', icon: CreditCard },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: ArrowLeftRight },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Complete Retail Sale" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total Banner */}
        <div className="bg-slate-900 text-white p-4 rounded-[var(--radius-control)] flex items-center justify-between shadow-subtle">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Payable Amount
            </span>
            <span className="text-2xl font-black text-white tracking-tight">
              {formatNaira(grandTotal)}
            </span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
            Ready to tender
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon;
              const isSelected = paymentMethod === pm.id;
              return (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => {
                    setPaymentMethod(pm.id);
                    if (pm.id !== 'cash') {
                      setAmountReceived(grandTotal);
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-[var(--radius-control)] border text-xs font-semibold transition-all',
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mb-1.5', isSelected ? 'text-emerald-600' : 'text-slate-400')} />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Fields */}
        {paymentMethod === 'cash' && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-[var(--radius-control)] border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cash Amount Received (₦)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amountReceived || ''}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full h-10 text-lg font-bold text-slate-900 px-3 bg-white border border-slate-300 rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Quick denomination chips */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Quick Tender:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setAmountReceived(opt)}
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {formatNaira(opt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Due Display */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Change Due to Customer:</span>
              <span
                className={cn(
                  'text-base font-extrabold',
                  amountReceived >= grandTotal ? 'text-emerald-600' : 'text-rose-500'
                )}
              >
                {amountReceived >= grandTotal
                  ? formatNaira(changeDue)
                  : `Short by ${formatNaira(grandTotal - amountReceived)}`}
              </span>
            </div>
          </div>
        )}

        {/* Notes / Reference */}
        <Input
          label="Payment Note / Transaction Reference"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            paymentMethod === 'bank_transfer'
              ? 'e.g. GTBank / Zenith transfer reference'
              : paymentMethod === 'card'
              ? 'e.g. Moniepoint POS RRN number'
              : 'Optional cashier remarks'
          }
        />

        {/* Confirmation buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isProcessing}
            disabled={paymentMethod === 'cash' && amountReceived < grandTotal}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Print Receipt
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
