import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useProductStore } from '../../../store/productStore';
import { useSupplierStore } from '../../../store/supplierStore';
import { UnitOfMeasure } from '../../../types/domain';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose }) => {
  const { categories, createProduct } = useProductStore();
  const { suppliers } = useSupplierStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [unit, setUnit] = useState<UnitOfMeasure>('bag');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [description, setDescription] = useState('');
  const [trackExpiry, setTrackExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryObj = categories.find((c) => c.id === categoryId);

    const success = await createProduct({
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode,
      categoryId,
      categoryName: categoryObj?.name || 'General',
      description,
      unit,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseFloat(currentStock) || 0,
      minStockThreshold: parseFloat(minStockThreshold) || 5,
      supplierId,
      trackExpiry,
      expiryDate: trackExpiry ? expiryDate : undefined,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Retail Product" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Product Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Foreign Parboiled Rice 50kg"
        />

        <Input
          label="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sortexed grain, stone-free woven sack"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="SKU Identifier"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Auto-generated if blank"
          />
          <Input
            label="Barcode (EAN-13 / UPC)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan barcode..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Unit of Measurement"
            value={unit}
            onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
          >
            <option value="bag">Bag (50kg / 25kg)</option>
            <option value="carton">Carton (40 packs / 20 tins)</option>
            <option value="paint">Paint Bucket (4 Litres)</option>
            <option value="bottle">Bottle (1L / 2L / 5L)</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="piece">Individual Piece</option>
            <option value="pack">Pack</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cost Price (₦)"
            type="number"
            step="any"
            required
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="e.g. 72000"
          />
          <Input
            label="Selling Price (₦)"
            type="number"
            step="any"
            required
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="e.g. 85000"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Initial Stock Quantity"
            type="number"
            required
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
          />
          <Input
            label="Low-Stock Alert Threshold"
            type="number"
            required
            value={minStockThreshold}
            onChange={(e) => setMinStockThreshold(e.target.value)}
          />
        </div>

        <Select
          label="Primary Supplier"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">Select Primary Supplier (Optional)</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {/* Perishable / Expiry tracking toggle */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius-control)] space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={trackExpiry}
              onChange={(e) => setTrackExpiry(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Track batch expiration date (Recommended for frozen & dairy)
          </label>
          {trackExpiry && (
            <Input
              type="date"
              label="Expiry Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Save Product
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
