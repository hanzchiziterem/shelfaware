import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCustomerStore } from '../../../store/customerStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Dialog } from '../../../components/ui/Dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { formatNaira } from '../../../utils/currency';
import { formatDate } from '../../../utils/dates';

export const CustomersPage: React.FC = () => {
  const { customers, fetchCustomers, createCustomer } = useCustomerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createCustomer({ name, phone, email, address, notes });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Directory"
        description="Maintain customer loyalty records, transaction histories, and catering account buyers."
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Customer
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location / Address</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Lifetime Spend</TableHead>
            <TableHead>Last Order Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-semibold text-slate-900">
                {c.name} {c.isWalkIn && <span className="text-[10px] text-emerald-600 font-bold ml-1">(Walk-in)</span>}
              </TableCell>
              <TableCell className="font-mono text-slate-600">{c.phone}</TableCell>
              <TableCell className="text-slate-500">{c.email || '—'}</TableCell>
              <TableCell className="text-slate-600 max-w-xs truncate">{c.address || '—'}</TableCell>
              <TableCell className="font-bold text-slate-800">{c.totalOrders}</TableCell>
              <TableCell className="font-bold font-mono text-slate-900">
                {formatNaira(c.totalSpent)}
              </TableCell>
              <TableCell className="font-mono text-[11px] text-slate-500">
                {formatDate(c.lastPurchaseDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Customer Account">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <Input label="Customer Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 802 ..." />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Bulk weekly purchaser" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>Save Customer</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
