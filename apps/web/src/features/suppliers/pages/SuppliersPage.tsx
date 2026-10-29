import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupplierStore } from '../../../store/supplierStore';
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

export const SuppliersPage: React.FC = () => {
  const { suppliers, fetchSuppliers, createSupplier } = useSupplierStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [categoriesText, setCategoriesText] = useState('Grains & Rice');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createSupplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      suppliedCategories: categoriesText.split(',').map((s) => s.trim()),
      isActive: true,
    });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Distributors & Wholesale Suppliers"
        description="Manage direct foodstuff millers, FMCG distribution partners, and depot contacts."
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Supplier
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier Company</TableHead>
            <TableHead>Contact Representative</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Depot Location</TableHead>
            <TableHead>Supplied Categories</TableHead>
            <TableHead>Total Purchase Volume</TableHead>
            <TableHead>Payable Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-semibold text-slate-900">{s.name}</TableCell>
              <TableCell className="font-medium text-slate-800">{s.contactPerson}</TableCell>
              <TableCell className="font-mono text-slate-600">{s.phone}</TableCell>
              <TableCell className="text-slate-600 max-w-xs truncate">{s.address}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {s.suppliedCategories.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-bold font-mono text-slate-900">
                {formatNaira(s.totalPurchases)}
              </TableCell>
              <TableCell className="font-bold font-mono text-amber-700">
                {formatNaira(s.balancePayable)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Supplier Partner">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <Input label="Company Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Contact Representative" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Depot / Warehouse Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Supplied Categories (comma separated)" value={categoriesText} onChange={(e) => setCategoriesText(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>Save Supplier</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
