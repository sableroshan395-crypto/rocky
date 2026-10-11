import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, MapPin, Search, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { SaiCustomer } from '@/types/saiDecoration';

interface CustomersManagerProps {
  customers: SaiCustomer[];
  onRefresh: () => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({ customers, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<SaiCustomer | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: SaiCustomer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      showError('Phone number is required.');
      return;
    }

    try {
      StorageAdapter.saveSaiCustomer({
        id: editingCustomer?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showSuccess(
        editingCustomer ? 'Customer Updated' : 'Customer Added',
        `${name.trim()} has been saved.`
      );
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save customer.');
    }
  };

  const handleDelete = (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
      StorageAdapter.deleteSaiCustomer(id);
      showSuccess('Customer Deleted', `${customerName} was removed.`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search customers by name, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Customer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {customers.length === 0
              ? 'No customers recorded yet. Add your first client above.'
              : 'No customers match your search.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{c.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <a href={`tel:${c.phone}`} className="hover:text-indigo-600">{c.phone}</a>
                  </p>
                </div>
                <Badge variant={c.totalBookings > 0 ? 'success' : 'neutral'} size="sm">
                  {c.totalBookings} {c.totalBookings === 1 ? 'Booking' : 'Bookings'}
                </Badge>
              </div>

              {c.email && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <a href={`mailto:${c.email}`} className="truncate hover:text-indigo-600">{c.email}</a>
                </p>
              )}

              {c.address && (
                <p className="text-[11px] text-slate-500 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{c.address}</span>
                </p>
              )}

              {c.notes && (
                <p className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                  {c.notes}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEditModal(c)} className="h-7 px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id, c.name)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Customer / Party Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Patil" />
          <Input label="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 9876543210" />
          <Input label="Email (Optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ramesh@example.com" />
          <Textarea label="Address / City" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, City, Landmark" />
          <Textarea label="Notes & Preferences" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requirements, VIP client..." />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingCustomer ? 'Save Changes' : 'Create Customer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
