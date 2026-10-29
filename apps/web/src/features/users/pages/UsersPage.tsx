import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useUserStore } from '../../../store/userStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { Role } from '../../../types/domain';

export const UsersPage: React.FC = () => {
  const { users, fetchUsers, createUser, toggleActive } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('cashier');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createUser({ name, email, role, phone });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Team & Staff Access"
        description="Manage cashier registers, floor managers, and administrator roles."
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Invite Staff Member
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name</TableHead>
            <TableHead>Work Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Assigned Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-semibold text-slate-900">{u.name}</TableCell>
              <TableCell className="text-slate-600">{u.email}</TableCell>
              <TableCell className="font-mono text-slate-600">{u.phone || '—'}</TableCell>
              <TableCell>
                <span className="capitalize text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {u.role}
                </span>
              </TableCell>
              <TableCell>
                {u.isActive ? (
                  <Badge variant="success" size="sm">Active</Badge>
                ) : (
                  <Badge variant="danger" size="sm">Deactivated</Badge>
                )}
              </TableCell>
              <TableCell className="text-slate-500 font-mono text-[11px]">{u.lastActive}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => toggleActive(u.id)}
                  className={u.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Staff Member">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Staff Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 ..." />
          <Select label="Role Assignment" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="cashier">Cashier (POS register operations only)</option>
            <option value="manager">Store Manager (Inventory, purchases & reports)</option>
            <option value="admin">Administrator (Full company control)</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>Add Staff</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
