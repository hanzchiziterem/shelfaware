import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useInventoryStore } from '../../../store/inventoryStore';
import { useProductStore } from '../../../store/productStore';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose }) => {
  const { adjustStock } = useInventoryStore();
  const { products, fetchProducts } = useProductStore();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<
    'adjustment_in' | 'adjustment_out' | 'damage' | 'expiry_writeoff' | 'stocktake_adjustment'
  >('adjustment_in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Physical stock count recount');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const currentStock = selectedProduct?.currentStock || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setIsSubmitting(true);
    const qtyChange =
      adjustmentType === 'adjustment_out' ||
      adjustmentType === 'damage' ||
      adjustmentType === 'expiry_writeoff'
        ? -Math.abs(parseFloat(quantity))
        : Math.abs(parseFloat(quantity));

    const success = await adjustStock({
      productId,
      quantityChange: qtyChange,
      type: adjustmentType,
      reason,
      notes,
    });

    setIsSubmitting(false);
    if (success) {
      await fetchProducts();
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Manual Stock Adjustment" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Select
          label="Select Product to Adjust"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Current: {p.currentStock} {p.unit}s)
            </option>
          ))}
        </Select>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between">
          <span className="text-slate-500">Current Stock Balance:</span>
          <span className="font-bold text-slate-900">
            {currentStock} {selectedProduct?.unit || 'units'}
          </span>
        </div>

        <Select
          label="Adjustment Type / Source"
          value={adjustmentType}
          onChange={(e) => setAdjustmentType(e.target.value as any)}
        >
          <option value="adjustment_in">Add Stock (+) (Manual count addition)</option>
          <option value="adjustment_out">Reduce Stock (-) (Unrecorded loss / audit)</option>
          <option value="damage">Damaged Goods (-) (Broken seal / wet bags)</option>
          <option value="expiry_writeoff">Expired Stock Write-off (-)</option>
          <option value="stocktake_adjustment">Monthly Stocktake Reconciliation</option>
        </Select>

        <Input
          label="Adjustment Quantity"
          type="number"
          min="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 5"
        />

        <Input
          label="Official Reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Brief explanation for the inventory audit record"
        />

        <Input
          label="Additional Remarks / Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

