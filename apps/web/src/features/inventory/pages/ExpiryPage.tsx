import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../../../store/inventoryStore';
import { useProductStore } from '../../../store/productStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { formatDate, isExpiringSoon, isExpired } from '../../../utils/dates';
import { formatNaira } from '../../../utils/currency';
import { PATHS } from '../../../router/paths';

export const ExpiryPage: React.FC = () => {
  const { fetchBatches } = useInventoryStore();
  const { products, fetchProducts } = useProductStore();
  const [filterWindow, setFilterWindow] = useState<'all' | '30' | '60' | 'expired'>('all');

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, [fetchBatches, fetchProducts]);

  // Combine products with trackExpiry and batches
  const perishableProducts = products.filter((p) => p.trackExpiry && p.expiryDate);

  const filteredItems = perishableProducts.filter((p) => {
    if (!p.expiryDate) return false;
    if (filterWindow === 'expired') return isExpired(p.expiryDate);
    if (filterWindow === '30') return isExpiringSoon(p.expiryDate, 30);
    if (filterWindow === '60') return isExpiringSoon(p.expiryDate, 60);
    return true;
  });

  const totalValueAtRisk = filteredItems.reduce(
    (acc, p) => acc + p.currentStock * p.sellingPrice,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to={PATHS.INVENTORY} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Stock Control
        </Link>
      </div>

      <PageHeader
        title="Perishable Stocks & Expiry Watch"
        description="Monitor expiry dates on frozen seafood, poultry, dairy, and packaged provisions to prevent stock loss."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Stock Value at Risk
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">
            {formatNaira(totalValueAtRisk)}
          </span>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Filtered items retail value</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Tracked Perishable SKUs
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {perishableProducts.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Active batches in store</span>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/40">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
            Critical (&lt; 30 Days)
          </span>
          <span className="text-2xl font-black text-rose-900 mt-1 block">
            {perishableProducts.filter((p) => p.expiryDate && isExpiringSoon(p.expiryDate, 30)).length}
          </span>
          <span className="text-[10px] text-rose-700 mt-0.5 block">Requires discount or promo</span>
        </Card>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold mr-1">Filter Window:</span>
        {(['all', '30', '60', 'expired'] as const).map((win) => (
          <button
            key={win}
            onClick={() => setFilterWindow(win)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border select-none ${
              filterWindow === win
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {win === 'all'
              ? 'All Tracked Items'
              : win === '30'
              ? 'Expires in ≤ 30 Days'
              : win === '60'
              ? 'Expires in ≤ 60 Days'
              : 'Already Expired'}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Batch Lot</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Remaining Stock</TableHead>
            <TableHead>Stock Value At Risk</TableHead>
            <TableHead>Urgency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((p) => {
            const expired = isExpired(p.expiryDate!);
            const critical = isExpiringSoon(p.expiryDate!, 30);
            const warning = isExpiringSoon(p.expiryDate!, 60);

            return (
              <TableRow key={p.id}>
                <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                <TableCell className="font-mono text-slate-500">{p.sku}</TableCell>
                <TableCell className="font-mono text-slate-700">
                  {p.batchNumber || 'LOT-2026-DEFAULT'}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">
                  {formatDate(p.expiryDate)}
                </TableCell>
                <TableCell className="font-bold text-slate-900">
                  {p.currentStock} {p.unit}s
                </TableCell>
                <TableCell className="font-bold font-mono text-slate-900">
                  {formatNaira(p.currentStock * p.sellingPrice)}
                </TableCell>
                <TableCell>
                  {expired ? (
                    <Badge variant="danger" size="sm">Expired</Badge>
                  ) : critical ? (
                    <Badge variant="danger" size="sm" dot>Critical (&lt; 30d)</Badge>
                  ) : warning ? (
                    <Badge variant="warning" size="sm" dot>Approaching (&lt; 60d)</Badge>
                  ) : (
                    <Badge variant="success" size="sm">Stable</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}

          {filteredItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                No perishable stock records found in selected window.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
