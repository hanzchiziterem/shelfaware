import React from 'react';
import { BookOpen, MessageSquare, PhoneCall } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Help & Knowledge Base"
        description="Cashier guidelines, stock management workflows, and technical support."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <BookOpen className="w-6 h-6 text-emerald-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900">POS Cashier Guide</h4>
          <p className="text-xs text-slate-500 mt-1">
            How to ring up customer sales, calculate cash change, and tender bank transfers.
          </p>
        </Card>

        <Card className="p-4">
          <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900">Stocktake FAQ</h4>
          <p className="text-xs text-slate-500 mt-1">
            Reconciling packaging units (cartons vs individual packs, bags vs paint rubber).
          </p>
        </Card>

        <Card className="p-4">
          <PhoneCall className="w-6 h-6 text-amber-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-900">Direct Support Line</h4>
          <p className="text-xs text-slate-500 mt-1">
            Call +234 802 345 6789 (Mon - Sat, 8am - 6pm WAT) for immediate assistance.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="pt-2">
            <h5 className="font-bold text-slate-800">How do I process a split payment between Cash and Bank Transfer?</h5>
            <p className="text-slate-600 mt-0.5">
              In the POS Checkout tender modal, choose 'Cash Tender' for the cash portion, record the cash received, and log the balance in the payment remarks reference.
            </p>
          </div>
          <div className="pt-3">
            <h5 className="font-bold text-slate-800">What happens when I mark a Purchase Order as 'Received'?</h5>
            <p className="text-slate-600 mt-0.5">
              The system automatically increases the current stock for every line item on the order and logs an immutable stock movement audit record.
            </p>
          </div>
          <div className="pt-3">
            <h5 className="font-bold text-slate-800">Can a cashier view cost prices or profit margins?</h5>
            <p className="text-slate-600 mt-0.5">
              No. Role-based permission controls conceal cost price and margin metrics when logged in as a Cashier.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
