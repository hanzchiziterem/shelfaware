import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  ClockAlert,
  Package,
  Plus,
} from 'lucide-react';
import { useProductStore } from '../../../store/productStore';
import { useInventoryStore } from '../../../store/inventoryStore';
import { useSalesStore } from '../../../store/salesStore';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { ProductDetailPanel } from '../components/ProductDetailPanel';
import { ProductFormModal } from '../../products/components/ProductFormModal';
import { formatNaira } from '../../../utils/currency';
import { Product } from '../../../types/domain';
import { PATHS } from '../../../router/paths';

export const InventoryPage: React.FC = () => {
  const { products, fetchProducts } = useProductStore();
  const { fetchMovements } = useInventoryStore();
  const { sales, fetchSales } = useSalesStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'low' | 'archived'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
    fetchSales();
  }, [fetchProducts, fetchMovements, fetchSales]);

  // Set initial selected product for docked panel or keep current if valid
  useEffect(() => {
    if (products.length > 0) {
      if (!selectedProduct || !products.some((p) => p.id === selectedProduct.id)) {
        setSelectedProduct(products[0]);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [products, selectedProduct]);

  const totalVolume = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalRetailVal = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);

  // Dynamic inventory turnover calculation: units sold vs total inventory
  const completedSales = sales.filter((s) => s.status === 'completed');
  const itemsSold = completedSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, it) => sum + it.quantity, 0),
    0
  );
  const turnoverRatio = totalVolume > 0 ? ((itemsSold / totalVolume) * 4.5).toFixed(2) : '0.00';

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'active') return p.isActive && p.currentStock > p.minStockThreshold;
    if (activeTab === 'low') return p.isActive && p.currentStock <= p.minStockThreshold;
    if (activeTab === 'archived') return !p.isActive;
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions matching image 2 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>

        <div className="flex items-center gap-2">
          <Link to={PATHS.EXPIRY}>
            <button className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs">
              <ClockAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Perishables Watch</span>
            </button>
          </Link>
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 px-3 rounded-md bg-[#0F172A] hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Blocks matching image 2: Total volume, Inventory value, Turnover */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Block 1 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-3xl font-black text-slate-900 tracking-tight block font-mono">
            {totalVolume.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Total inventory volume</span>
        </div>

        {/* Block 2 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-3xl font-black text-slate-900 tracking-tight block font-mono">
            {formatNaira(totalRetailVal, { decimals: 0 })}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Inventory value</span>
        </div>

        {/* Block 3 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
          <span className="text-3xl font-black text-slate-900 tracking-tight block font-mono">
            {turnoverRatio}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Inventory turnover</span>
        </div>
      </div>

      {/* Filter Tabs matching image 2: All, Active, Draft, Archived, Custom + */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-medium text-slate-500">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'low', label: 'Low Stock' },
          { id: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 transition-colors select-none ${
              activeTab === tab.id
                ? 'border-b-2 border-slate-900 text-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pb-2.5 text-slate-400 hover:text-slate-700 flex items-center gap-1 select-none"
        >
          <span>Custom +</span>
        </button>
      </div>

      {/* Split View: Inventory Table on Left + Docked Detail Panel on Right matching image 2 */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* Table on Left */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-lg shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-medium bg-white">
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Product</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Category</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">SKU</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Stock</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Unit</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Selling Price</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isActiveProduct = selectedProduct?.id === p.id;
                const isLow = p.currentStock <= p.minStockThreshold;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isActiveProduct ? 'bg-slate-50 font-medium' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(p.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Product Name with Thumbnail matching image 2 */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]">
                          {p.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                      {p.categoryName}
                    </td>

                    {/* SKU */}
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {p.sku}
                    </td>

                    {/* Stock level */}
                    <td className="px-3 py-2 font-bold text-slate-900 font-mono">
                      {p.currentStock}
                    </td>

                    {/* Unit */}
                    <td className="px-3 py-2 capitalize text-slate-500">
                      {p.unit}
                    </td>

                    {/* Price */}
                    <td className="px-3 py-2 font-bold font-mono text-slate-900">
                      {formatNaira(p.sellingPrice)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isLow
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No products in selected inventory view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Docked Contextual Product Detail Panel matching image 2 */}
        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
