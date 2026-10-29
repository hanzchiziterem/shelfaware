import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { usePurchaseStore } from '../../../store/purchaseStore';
import { useProductStore } from '../../../store/productStore';
import { useSupplierStore } from '../../../store/supplierStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { CreatePurchaseModal } from '../components/CreatePurchaseModal';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';
import { PurchaseOrder } from '../../../types/domain';

export const PurchasesPage: React.FC = () => {
  const { purchases, fetchPurchases, receivePurchase } = usePurchaseStore();
  const { fetchProducts } = useProductStore();
  const { fetchSuppliers } = useSupplierStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, [fetchPurchases, fetchProducts, fetchSuppliers]);

  const handleReceive = async (po: PurchaseOrder) => {
    if (
      window.confirm(
        `Confirm receipt of ${po.poNumber} from ${po.supplierName}?\nThis will automatically increment current product stock and log inventory movements.`
      )
    ) {
      setReceivingId(po.id);
      const success = await receivePurchase(po.id);
      setReceivingId(null);
      if (success) {
        await fetchProducts();
      }
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchases & Stock Receiving"
        description="Replenish retail grocery supplies, generate purchase orders, and verify received shipments."
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Purchase Order
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Items Count</TableHead>
            <TableHead>Total Cost (₦)</TableHead>
            <TableHead>Delivery Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((po) => {
            const isReceived = po.status === 'received';
            const isPending = po.status === 'pending' || po.status === 'draft';

            return (
              <TableRow key={po.id}>
                <TableCell className="font-mono font-bold text-slate-900">{po.poNumber}</TableCell>
                <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                  {formatDate(po.createdAt)}
                </TableCell>
                <TableCell className="font-medium text-slate-800">{po.supplierName}</TableCell>
                <TableCell>
                  {po.items.length} {po.items.length === 1 ? 'line item' : 'line items'}
                </TableCell>
                <TableCell className="font-bold text-slate-900 font-mono">
                  {formatNaira(po.totalCost)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isReceived ? 'success' : isPending ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {po.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`capitalize text-xs font-semibold ${
                      po.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {po.paymentStatus}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isPending ? (
                    <Button
                      size="xs"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      isLoading={receivingId === po.id}
                      onClick={() => handleReceive(po)}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Receive Stock
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      Received {formatDate(po.receivedDate)}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}

          {purchases.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-400">
                No purchase orders recorded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreatePurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
