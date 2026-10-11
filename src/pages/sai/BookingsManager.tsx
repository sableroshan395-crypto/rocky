import React, { useState } from 'react';
import { Calendar, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { SaiBooking, SaiCustomer, EventType, BookingStatus } from '@/types/saiDecoration';

interface BookingsManagerProps {
  bookings: SaiBooking[];
  customers: SaiCustomer[];
  onRefresh: () => void;
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding Stage',
  reception: 'Reception',
  birthday: 'Birthday Party',
  anniversary: 'Anniversary',
  stage_decoration: 'Stage Decoration',
  corporate: 'Corporate Event',
  religious: 'Religious / Pooja',
  other: 'Other Function',
};

const STATUS_VARIANTS: Record<BookingStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  inquiry: 'default',
  confirmed: 'primary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export const BookingsManager: React.FC<BookingsManagerProps> = ({ bookings, customers, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<SaiBooking | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [totalStr, setTotalStr] = useState('');
  const [advanceStr, setAdvanceStr] = useState('');
  const [status, setStatus] = useState<BookingStatus>('confirmed');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.venue.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectCustomer = (cId: string) => {
    setCustomerId(cId);
    const found = customers.find((c) => c.id === cId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
    }
  };

  const openAddModal = () => {
    setEditingBooking(null);
    setCustomerId(customers[0]?.id || '');
    setCustomerName(customers[0]?.name || '');
    setCustomerPhone(customers[0]?.phone || '');
    setEventType('wedding');
    setEventDate(new Date().toISOString().slice(0, 10));
    setVenue('');
    setTotalStr('');
    setAdvanceStr('');
    setStatus('confirmed');
    setAssignedTeam('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: SaiBooking) => {
    setEditingBooking(b);
    setCustomerId(b.customerId);
    setCustomerName(b.customerName);
    setCustomerPhone(b.customerPhone);
    setEventType(b.eventType);
    setEventDate(b.eventDate);
    setVenue(b.venue);
    setTotalStr((b.totalAmountPaise / 100).toFixed(2));
    setAdvanceStr((b.advanceReceivedPaise / 100).toFixed(2));
    setStatus(b.status);
    setAssignedTeam(b.assignedTeam || '');
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showError('Customer details are required.');
      return;
    }
    if (!eventDate) {
      showError('Event date is required.');
      return;
    }

    const totalPaise = parseINRToPaise(totalStr);
    const advancePaise = parseINRToPaise(advanceStr) || 0;

    if (totalPaise === null || totalPaise < 0) {
      showError('Please enter a valid total amount.');
      return;
    }

    try {
      StorageAdapter.saveSaiBooking({
        id: editingBooking?.id,
        customerId: customerId || `temp_${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        eventType,
        eventDate,
        venue: venue.trim(),
        totalAmountPaise: totalPaise,
        advanceReceivedPaise: advancePaise,
        status,
        assignedTeam: assignedTeam.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showSuccess(
        editingBooking ? 'Booking Updated' : 'Booking Created',
        `${EVENT_TYPE_LABELS[eventType]} for ${customerName} on ${eventDate}`
      );
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save booking.');
    }
  };

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    StorageAdapter.updateBookingStatus(id, newStatus);
    showSuccess('Status Updated', `Booking moved to ${newStatus}.`);
    onRefresh();
  };

  const handleDelete = (id: string, eventInfo: string) => {
    if (window.confirm(`Delete booking for "${eventInfo}"?`)) {
      StorageAdapter.deleteSaiBooking(id);
      showSuccess('Booking Deleted', 'Removed from schedule.');
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search bookings by customer, venue, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'inquiry', label: 'Inquiry' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          New Booking
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {bookings.length === 0
              ? 'No event bookings recorded. Create a booking to track dates, advances, and balances.'
              : 'No bookings match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {EVENT_TYPE_LABELS[b.eventType] || b.eventType}
                    </span>
                    <Badge variant={STATUS_VARIANTS[b.status]} size="sm">
                      {b.status}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">
                      📅 {b.eventDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium">{b.customerName}</span> ({b.customerPhone})
                    {b.venue && <span className="text-slate-500"> · 📍 {b.venue}</span>}
                  </p>
                  {b.assignedTeam && (
                    <p className="text-[11px] text-slate-500">
                      Team: {b.assignedTeam}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Total / Due</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                      {formatPaiseToINR(b.totalAmountPaise)}
                    </span>
                    <span className={`text-[11px] font-mono block ${b.balanceDuePaise > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>
                      Due: {formatPaiseToINR(b.balanceDuePaise)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick Status:</span>
                  {(['confirmed', 'in_progress', 'completed', 'cancelled'] as BookingStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={b.status === st}
                      onClick={() => handleStatusChange(b.id, st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        b.status === st
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-default'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(b)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(b.id, `${b.eventType} on ${b.eventDate}`)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? 'Edit Booking' : 'New Event Booking'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {customers.length > 0 && !editingBooking && (
            <Select
              label="Select Existing Customer (Optional)"
              value={customerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              options={[{ value: '', label: '-- Create / Type New --' }, ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.phone})` }))]}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Customer Name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Ramesh Patil" />
            <Input label="Customer Phone" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 9876543210" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Event Type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              options={Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            <Input label="Event Date" type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>

          <Input label="Venue / Location Address" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Balaji Lawns, Pune" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Total Amount (₹)" type="number" step="0.01" required value={totalStr} onChange={(e) => setTotalStr(e.target.value)} placeholder="50000" />
            <Input label="Advance Received (₹)" type="number" step="0.01" value={advanceStr} onChange={(e) => setAdvanceStr(e.target.value)} placeholder="15000" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Booking Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              options={[
                { value: 'inquiry', label: 'Inquiry' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Input label="Assigned Team / Lead" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)} placeholder="e.g. Sandeep + 4 crew" />
          </div>

          <Textarea label="Booking Notes & Instructions" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Stage dimensions, theme colors, generator requirement..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingBooking ? 'Save Changes' : 'Confirm Booking'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
