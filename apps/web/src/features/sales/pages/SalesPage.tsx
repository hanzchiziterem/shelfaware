import React, { useEffect, useState } from 'react';
import {
  Download,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  Printer,
  MoreHorizontal,
  MessageSquare,
  Package,
  Plus,
  Trash2,
  Ban,
} from 'lucide-react';
import { useSalesStore } from '../../../store/salesStore';
import { useProductStore } from '../../../store/productStore';
import { OrderFloatingCard } from '../components/OrderFloatingCard';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { Sale } from '../../../types/domain';

export const SalesPage: React.FC = () => {
  const { sales, fetchSales, voidSale, deleteSale, simulateSale } = useSalesStore();
  const { fetchProducts } = useProductStore();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided' | 'refunded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'store_pickup' | 'delivery'>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  // Row selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSales.map((s) => s.id));
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

  const filteredSales = sales.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (typeFilter !== 'all') {
      const orderType = s.orderType || (s.customerId !== 'cust-walkin' ? 'delivery' : 'store_pickup');
      if (orderType !== typeFilter) return false;
    }
    return true;
  });

  // Dynamic calculations across all sales
  const completedSales = sales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((a, b) => a + b.totalAmount, 0);
  const totalOrders = sales.length;
  const paidCount = completedSales.length;
  const cancelledCount = sales.filter((s) => s.status === 'voided').length;
  const refundedCount = sales.filter((s) => s.status === 'refunded').length;
  const pendingCount = sales.filter((s) => s.status === 'pending').length;

  const paidPct = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0;
  const cancelledPct = totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;
  const refundedPct = totalOrders > 0 ? Math.round((refundedCount / totalOrders) * 100) : 0;

  // Dynamic Shipments vs Pickups
  const deliverySales = completedSales.filter(
    (s) => (s.orderType || (s.customerId !== 'cust-walkin' ? 'delivery' : 'store_pickup')) === 'delivery'
  );
  const pickupSales = completedSales.filter(
    (s) => (s.orderType || (s.customerId !== 'cust-walkin' ? 'delivery' : 'store_pickup')) === 'store_pickup'
  );

  const deliveryRevenue = deliverySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const pickupRevenue = pickupSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Dynamic items count and averages
  const totalItemsCount = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, it) => sum + it.quantity, 0),
    0
  );
  const avgItemsPerOrder = totalOrders > 0 ? (totalItemsCount / totalOrders).toFixed(1) : '0';
  const rejectRate = totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : '0.0';

  // Dynamic Top Sellers from completed sales
  const topSellersMap = new Map<string, { id: string; name: string; quantity: number }>();
  completedSales.forEach((s) => {
    s.items.forEach((it) => {
      const cur = topSellersMap.get(it.productId) || {
        id: it.productId,
        name: it.productName,
        quantity: 0,
      };
      cur.quantity += it.quantity;
      topSellersMap.set(it.productId, cur);
    });
  });
  const dynamicTopSellers = Array.from(topSellersMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  const handleSimulatePurchase = async () => {
    setIsSimulating(true);
    const sale = await simulateSale();
    setIsSimulating(false);
    if (sale) {
      await fetchProducts();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} orders? Active inventory will be restored.`)) {
      return;
    }
    for (const id of selectedIds) {
      await deleteSale(id);
    }
    setSelectedIds([]);
    await fetchProducts();
  };

  const handleBulkVoid = async () => {
    if (!window.confirm(`Void ${selectedIds.length} orders? Stock will be restored to inventory.`)) {
      return;
    }
    for (const id of selectedIds) {
      await voidSale(id, 'Bulk voided from order manager');
    }
    setSelectedIds([]);
    await fetchProducts();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative min-h-[calc(100vh-6rem)]">
      {/* Left Main Orders Workspace matching image 1 */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        {/* Title & Top Right Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live retail transactions, customer delivery orders, and store pickups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulatePurchase}
              disabled={isSimulating}
              className="h-8 px-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Simulates a live Nigerian grocery store customer purchase, decrementing stock and recording auditable movements"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Simulating...' : '+ Simulate Sale'}</span>
            </button>
            <button
              onClick={() => alert('Simulating CSV order import...')}
              className="h-8 px-3 rounded-md bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>+ Import</span>
            </button>
            <button
              onClick={() => alert('Exporting all orders to CSV...')}
              className="h-8 px-3 rounded-md border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar matching image 1 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Active Type Filter Chip */}
          <button
            onClick={() => {
              if (typeFilter === 'all') setTypeFilter('store_pickup');
              else if (typeFilter === 'store_pickup') setTypeFilter('delivery');
              else setTypeFilter('all');
            }}
            className="h-7 px-3 rounded-full bg-[#0F172A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs select-none"
          >
            <span>Type ({typeFilter === 'all' ? 'All' : typeFilter === 'store_pickup' ? 'Pickups' : 'Deliveries'})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Status Chip */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-7 pl-3 pr-6 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:border-slate-400 focus:outline-none cursor-pointer appearance-none shadow-xs"
            >
              <option value="all">Status (All)</option>
              <option value="completed">Paid Only</option>
              <option value="voided">Cancelled Only</option>
              <option value="refunded">Refunded Only</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>

          {/* Reset filters Chip */}
          <button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="h-7 px-3 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:border-slate-400 flex items-center gap-1.5 transition-colors shadow-xs select-none"
          >
            <span>Reset filters</span>
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Enterprise Data Table matching image 1 */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-medium bg-white">
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredSales.length && filteredSales.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Order ˇ</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Customer</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Type</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Status</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Product</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Total</th>
                <th className="px-3 py-2.5 font-medium text-slate-500">Date</th>
                <th className="w-10 px-3 py-2.5 text-right font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => {
                const isSelected = selectedIds.includes(sale.id);
                const orderType = sale.orderType || (sale.customerId !== 'cust-walkin' ? 'delivery' : 'store_pickup');

                return (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer select-none ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(sale.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Order ID */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="font-mono">{sale.transactionNumber}</span>
                        <MessageSquare className="w-3 h-3 text-slate-300" />
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {sale.customerName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 truncate max-w-[140px]">
                          {sale.customerName}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                      {orderType === 'delivery' ? 'Shipping' : 'Pickups'}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {sale.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </span>
                      ) : sale.status === 'voided' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-medium text-xs">
                          <X className="w-3.5 h-3.5" />
                          <span>Cancelled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-xs">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refunded</span>
                        </span>
                      )}
                    </td>

                    {/* Product preview thumbnails matching image 1 */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {sale.items.slice(0, 2).map((it, i) => (
                          <div
                            key={i}
                            title={it.productName}
                            className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold overflow-hidden"
                          >
                            <Package className="w-3 h-3 text-slate-400" />
                          </div>
                        ))}
                        {sale.items.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium ml-0.5">
                            +{sale.items.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-3 py-2 whitespace-nowrap font-bold text-slate-900 font-mono">
                      {formatNaira(sale.totalAmount)}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2 whitespace-nowrap text-slate-400 text-[11px]">
                      {formatDate(sale.createdAt)}
                    </td>

                    {/* Action menu '...' */}
                    <td
                      className="px-3 py-2 text-right text-slate-400 hover:text-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSale(sale);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No orders matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar Analytics Panel matching image 1 */}
      <div className="w-full xl:w-72 shrink-0 bg-white border border-slate-200 rounded-lg p-4 space-y-6 shadow-subtle">
        {/* Section 1: RECEIPT OF GOODS */}
        <div className="space-y-3 pb-5 border-b border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Receipt of Goods
          </h4>

          {/* Semi-circular gauge visual representation */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <div className="w-36 h-20 overflow-hidden relative">
              <div className="w-36 h-36 border-[12px] border-slate-100 border-t-emerald-500 border-r-emerald-500 rounded-full rotate-45 transform" />
            </div>
            <div className="text-center -mt-6">
              <span className="text-xl font-black text-slate-900 block font-mono">
                {formatNaira(totalRevenue, { decimals: 0 })}
              </span>
              <span className="text-[11px] text-slate-400 block">{paidCount} completed orders</span>
            </div>
          </div>

          {/* Breakdown legend (100% dynamic from delivery vs pickup sales) */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-2 h-2 rounded-xs bg-slate-900" />
                <span className="font-mono text-[11px]">
                  {formatNaira(deliveryRevenue, { decimals: 0 })}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pl-3.5">{deliverySales.length} shipments</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                <span className="font-mono text-[11px]">
                  {formatNaira(pickupRevenue, { decimals: 0 })}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pl-3.5">{pickupSales.length} pickups</p>
            </div>
          </div>
        </div>

        {/* Section 2: ORDERS STATUS */}
        <div className="space-y-3 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Orders Status
            </h4>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              Active <ChevronDown className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Paid</span>
              </div>
              <span className="font-bold text-slate-900">{paidPct}%</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Cancelled</span>
              </div>
              <span className="font-bold text-slate-900">{cancelledPct}%</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Refunded</span>
              </div>
              <span className="font-bold text-slate-900">{refundedPct}%</span>
            </div>
          </div>
        </div>

        {/* Section 3: OVERVIEW */}
        <div className="space-y-3 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overview
            </h4>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              Live Registers <ChevronDown className="w-3 h-3" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-sm font-bold text-slate-900 font-mono block">
                {formatNaira(paidCount > 0 ? totalRevenue / paidCount : 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">Average order</span>
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 font-mono block">
                {formatNaira(totalRevenue, { decimals: 0 })}
              </span>
              <span className="text-[10px] text-slate-400 block">Total revenue</span>
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 block">12 min</span>
              <span className="text-[10px] text-slate-400 block">Processing time</span>
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 block font-mono">
                {avgItemsPerOrder}
              </span>
              <span className="text-[10px] text-slate-400 block">Avg. items/order</span>
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 block font-mono">
                {pendingCount}
              </span>
              <span className="text-[10px] text-slate-400 block">Pending orders</span>
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 block font-mono">
                {rejectRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">Reject rate</span>
            </div>
          </div>
        </div>

        {/* Section 4: TOP SELLERS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Top Sellers
            </h4>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              Active Store <ChevronDown className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-2">
            {dynamicTopSellers.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="font-semibold text-slate-800 truncate" title={prod.name}>
                    {prod.name}
                  </span>
                </div>
                <span className="font-mono text-slate-700 font-bold ml-2 shrink-0">
                  {prod.quantity} sold
                </span>
              </div>
            ))}

            {dynamicTopSellers.length === 0 && (
              <p className="text-xs text-slate-400 py-2">No completed orders yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Black Action Bar matching image 1 (Selected: N | Void | Delete | Print | Export) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#0B0F19] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200 border border-slate-700 select-none">
          <button
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <span className="font-semibold text-slate-300 pr-2 border-r border-slate-700">
            Selected: {selectedIds.length}
          </span>

          <button
            onClick={handleBulkVoid}
            className="hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
            title="Void selected orders and return items to product stock"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Void</span>
          </button>

          <button
            onClick={handleBulkDelete}
            className="hover:text-rose-400 flex items-center gap-1 font-medium transition-colors"
            title="Delete selected orders"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => alert(`Exporting ${selectedIds.length} orders...`)}
            className="hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => window.print()}
            className="hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      )}

      {/* Floating Order Card Modal matching image 1 */}
      {selectedSale && (
        <OrderFloatingCard
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};
