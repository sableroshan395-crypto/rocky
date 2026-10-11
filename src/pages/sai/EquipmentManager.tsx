import React, { useState } from 'react';
import { Box, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { SaiEquipment, RentalStatus } from '@/types/saiDecoration';

interface EquipmentManagerProps {
  equipment: SaiEquipment[];
  onRefresh: () => void;
}

const CATEGORY_LABELS: Record<SaiEquipment['category'], string> = {
  generator: 'Generator',
  lighting: 'Stage Lighting',
  sound: 'Sound Equipment',
  stage_truss: 'Stage Truss & Frames',
  fabric_tent: 'Fabric & Tent Materials',
  other: 'Other Rentals',
};

const STATUS_BADGES: Record<RentalStatus, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  rented: { variant: 'warning', label: 'Currently Rented' },
  maintenance: { variant: 'danger', label: 'Maintenance' },
  reserved: { variant: 'default', label: 'Reserved' },
};

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({ equipment, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SaiEquipment | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SaiEquipment['category']>('generator');
  const [serialNumber, setSerialNumber] = useState('');
  const [dailyRateStr, setDailyRateStr] = useState('');
  const [status, setStatus] = useState<RentalStatus>('available');
  const [currentRenter, setCurrentRenter] = useState('');
  const [rentedUntil, setRentedUntil] = useState('');
  const [fuelCapacity, setFuelCapacity] = useState('');
  const [runningHours, setRunningHours] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = equipment.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.currentRenter && e.currentRenter.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('generator');
    setSerialNumber('');
    setDailyRateStr('');
    setStatus('available');
    setCurrentRenter('');
    setRentedUntil('');
    setFuelCapacity('');
    setRunningHours('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SaiEquipment) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setSerialNumber(item.serialNumber || '');
    setDailyRateStr((item.dailyRatePaise / 100).toFixed(2));
    setStatus(item.status);
    setCurrentRenter(item.currentRenter || '');
    setRentedUntil(item.rentedUntil || '');
    setFuelCapacity(item.fuelCapacityLiters ? String(item.fuelCapacityLiters) : '');
    setRunningHours(item.runningHours ? String(item.runningHours) : '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Equipment name is required.');
      return;
    }

    const ratePaise = parseINRToPaise(dailyRateStr) || 0;

    try {
      StorageAdapter.saveSaiEquipment({
        id: editingItem?.id,
        name: name.trim(),
        category,
        serialNumber: serialNumber.trim() || undefined,
        dailyRatePaise: ratePaise,
        status,
        currentRenter: status === 'rented' ? currentRenter.trim() || undefined : undefined,
        rentedUntil: status === 'rented' ? rentedUntil || undefined : undefined,
        fuelCapacityLiters: fuelCapacity ? parseFloat(fuelCapacity) : undefined,
        runningHours: runningHours ? parseFloat(runningHours) : undefined,
        notes: notes.trim() || undefined,
      });

      showSuccess(
        editingItem ? 'Equipment Updated' : 'Equipment Added',
        `${name.trim()} saved.`
      );
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save equipment.');
    }
  };

  const handleQuickStatus = (id: string, newStatus: RentalStatus) => {
    StorageAdapter.updateEquipmentStatus(id, newStatus);
    showSuccess('Status Updated', `Item marked as ${newStatus}.`);
    onRefresh();
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`Delete equipment item "${itemName}"?`)) {
      StorageAdapter.deleteSaiEquipment(id);
      showSuccess('Equipment Deleted', `${itemName} was removed.`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search equipment by name, renter, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'generator', label: 'Generators' },
              { value: 'lighting', label: 'Lighting' },
              { value: 'sound', label: 'Sound' },
              { value: 'stage_truss', label: 'Stage Truss' },
              { value: 'fabric_tent', label: 'Tents & Fabrics' },
              { value: 'other', label: 'Other' },
            ]}
            className="w-40"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Equipment
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Box className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {equipment.length === 0
              ? 'No rental equipment added yet. Track generators, fuel, sound and lighting units.'
              : 'No equipment matches your filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{CATEGORY_LABELS[item.category]}</p>
                </div>
                <Badge variant={STATUS_BADGES[item.status].variant} size="sm">
                  {STATUS_BADGES[item.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Daily Rate</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatPaiseToINR(item.dailyRatePaise)}/day
                  </span>
                </div>
                {item.category === 'generator' && (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Fuel & Hours</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {item.fuelCapacityLiters ? `${item.fuelCapacityLiters}L` : '—'} · {item.runningHours ? `${item.runningHours} hrs` : '—'}
                    </span>
                  </div>
                )}
              </div>

              {item.status === 'rented' && (
                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5">
                  <p className="font-semibold">Rented to: {item.currentRenter || 'Unknown party'}</p>
                  {item.rentedUntil && <p>Until: 📅 {item.rentedUntil}</p>}
                </div>
              )}

              {item.notes && (
                <p className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                  {item.notes}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Mark:</span>
                  {(['available', 'rented', 'maintenance'] as RentalStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={item.status === st}
                      onClick={() => handleQuickStatus(item.id, st)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        item.status === st ? 'font-bold underline' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(item)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id, item.name)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Equipment' : 'Add Rental Equipment'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Equipment Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kirloskar 15kVA Silent Generator" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SaiEquipment['category'])}
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            />
            <Input label="Serial / Asset Tag (Optional)" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. GEN-001" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Daily Rental Rate (₹)" type="number" step="0.01" value={dailyRateStr} onChange={(e) => setDailyRateStr(e.target.value)} placeholder="2500" />
            <Select
              label="Availability Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RentalStatus)}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'rented', label: 'Rented Out' },
                { value: 'maintenance', label: 'In Maintenance' },
                { value: 'reserved', label: 'Reserved' },
              ]}
            />
          </div>

          {status === 'rented' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <Input label="Current Renter Name / Booking" value={currentRenter} onChange={(e) => setCurrentRenter(e.target.value)} placeholder="Ramesh Patil event" />
              <Input label="Rented Until Date" type="date" value={rentedUntil} onChange={(e) => setRentedUntil(e.target.value)} />
            </div>
          )}

          {category === 'generator' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Input label="Fuel Tank Capacity (Liters)" type="number" step="0.1" value={fuelCapacity} onChange={(e) => setFuelCapacity(e.target.value)} placeholder="35" />
              <Input label="Meter Running Hours" type="number" step="0.5" value={runningHours} onChange={(e) => setRunningHours(e.target.value)} placeholder="420.5" />
            </div>
          )}

          <Textarea label="Maintenance Notes & Details" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Last oil change date, spare cable info..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
