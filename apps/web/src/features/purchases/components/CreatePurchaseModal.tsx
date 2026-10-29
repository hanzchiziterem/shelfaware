import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { usePurchaseStore } from '../../../store/purchaseStore';
import { useSupplierStore } from '../../../store/supplierStore';
import { useProductStore } from '../../../store/productStore';
import { formatNaira } from '../../../utils/currency';
import { Trash2, Plus } from 'lucide-react';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({ isOpen, onClose }) => {
  const { createPurchase } = usePurchaseStore();
  const { suppliers } = useSupplierStore();
  const { products } = useProductStore();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; unitCost: number }>>([
    {
      productId: products[0]?.id || '',
      quantity: 10,
      unitCost: products[0]?.costPrice || 5000,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    const nextProd = products.find((p) => !items.some((i) => i.productId === p.id)) || products[0];
    if (nextProd) {
      setItems([...items, { productId: nextProd.id, quantity: 5, unitCost: nextProd.costPrice }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      updated[index] = {
        ...updated[index],
        productId: val,
        unitCost: prod?.costPrice || updated[index].unitCost,
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setItems(updated);
  };

  const totalCost = items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await createPurchase({
      supplierId,
      items: items.map((it) => ({
        productId: it.productId,
        orderedQuantity: it.quantity,
        unitCost: it.unitCost,
      })),
      expectedDate,
      notes,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Purchase Order (PO)" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Supplier"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.contactPerson})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
          <Input
            label="Order Reference / Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Urgent restock for grain warehouse"
          />
        </div>

        {/* PO Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Order Line Items</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <select
                  value={it.productId}
                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                  className="flex-1 h-8 text-xs bg-white border border-slate-300 rounded px-2"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-xs bg-white border border-slate-300 rounded px-2 text-center"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Unit Cost"
                  value={it.unitCost}
                  onChange={(e) => handleItemChange(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-xs bg-white border border-slate-300 rounded px-2 text-right font-mono"
                />

                <span className="w-24 text-right text-xs font-bold text-slate-800 font-mono">
                  {formatNaira(it.quantity * it.unitCost)}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length === 1}
                  className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-100 rounded text-xs font-bold text-slate-900">
            <span>Total Estimated Cost:</span>
            <span className="text-sm font-mono text-slate-900">{formatNaira(totalCost)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Generate Purchase Order
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

