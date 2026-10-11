import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Trash2, Printer, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { SaiQuote, QuoteItem, EventType } from '@/types/saiDecoration';

interface QuotesManagerProps {
  quotes: SaiQuote[];
  onRefresh: () => void;
}

interface DraftItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export const QuotesManager: React.FC<QuotesManagerProps> = ({ quotes, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<SaiQuote | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [venue, setVenue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discountStr, setDiscountStr] = useState('0');
  const [taxStr, setTaxStr] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([
    { id: '1', description: 'Main Stage Floral & Fabric Backdrop (30x12 ft)', quantity: '1', unitPrice: '25000' },
    { id: '2', description: 'Entry Pathway Tunnel & Lighting Arch', quantity: '1', unitPrice: '12000' },
  ]);

  const filtered = quotes.filter(
    (q) =>
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (q.venue && q.venue.toLowerCase().includes(search.toLowerCase()))
  );

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: '', quantity: '1', unitPrice: '0' },
    ]);
  };

  const removeItemRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: keyof DraftItem, val: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const openAddModal = () => {
    setCustomerName('');
    setCustomerPhone('');
    setEventDate(new Date().toISOString().slice(0, 10));
    setEventType('wedding');
    setVenue('');
    setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
    setDiscountStr('0');
    setTaxStr('0');
    setNotes('');
    setItems([
      { id: '1', description: 'Stage Decoration & Floral Backdrop', quantity: '1', unitPrice: '25000' },
      { id: '2', description: 'LED Par Stage Lights (Set of 8)', quantity: '1', unitPrice: '6000' },
    ]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showError('Customer information is required.');
      return;
    }
    if (items.length === 0) {
      showError('Please add at least one line item.');
      return;
    }

    const parsedItems: QuoteItem[] = [];
    for (const item of items) {
      if (!item.description.trim()) {
        showError('Item description cannot be empty.');
        return;
      }
      const qty = parseFloat(item.quantity) || 1;
      const unitPaise = parseINRToPaise(item.unitPrice) || 0;
      const totalPaise = Math.round(qty * unitPaise);
      parsedItems.push({
        id: item.id,
        description: item.description.trim(),
        quantity: qty,
        unitPricePaise: unitPaise,
        totalPaise,
      });
    }

    const discountPaise = parseINRToPaise(discountStr) || 0;
    const taxPaise = parseINRToPaise(taxStr) || 0;

    try {
      const saved = StorageAdapter.saveSaiQuote({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        eventDate,
        eventType,
        venue: venue.trim() || undefined,
        items: parsedItems,
        discountPaise,
        taxPaise,
        validUntil,
        status: 'sent',
        notes: notes.trim() || undefined,
      });

      showSuccess('Quotation Created', `Quote #${saved.quoteNumber} generated.`);
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to generate quotation.');
    }
  };

  const handleDelete = (id: string, quoteNum: string) => {
    if (window.confirm(`Delete quotation #${quoteNum}?`)) {
      StorageAdapter.deleteSaiQuote(id);
      showSuccess('Quote Deleted', `Quotation #${quoteNum} was removed.`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search quotes by number, customer, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Create Quotation
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {quotes.length === 0
              ? 'No quotations created yet. Generate professional estimates for clients above.'
              : 'No quotes match your search.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((q) => (
            <Card key={q.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {q.quoteNumber}
                    </span>
                    <Badge variant={q.status === 'accepted' ? 'success' : q.status === 'declined' ? 'danger' : 'neutral'} size="sm">
                      {q.status}
                    </Badge>
                    <span className="text-xs text-slate-500">📅 Event: {q.eventDate}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {q.customerName} ({q.customerPhone})
                    {q.venue && <span className="text-slate-500 font-normal"> · {q.venue}</span>}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {q.items.length} line items · Valid until {q.validUntil}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Quote Total</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                    {formatPaiseToINR(q.totalPaise)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <Button size="sm" variant="secondary" onClick={() => setViewingQuote(q)} leftIcon={<Printer className="w-3.5 h-3.5" />} className="h-7 text-xs">
                  View / Print Quote
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(q.id, q.quoteNumber)} className="h-7 text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quote Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Client Estimate / Quote"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Customer / Party Name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Ramesh Patil" />
            <Input label="Phone Number" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 9876543210" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Event Date" type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <Input label="Valid Until" type="date" required value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            <Input label="Venue / Location" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Hotel / Lawns" />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Package Items & Services</label>
              <Button size="sm" variant="ghost" onClick={addItemRow} leftIcon={<Plus className="w-3 h-3" />} className="h-6 text-xs text-indigo-600">
                Add Row
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {items.map((row, idx) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">
                    <Input
                      placeholder="Service / Item description"
                      value={row.description}
                      onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Rate ₹"
                      value={row.unitPrice}
                      onChange={(e) => updateItemRow(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItemRow(idx)} className="p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Discount (₹)" type="number" value={discountStr} onChange={(e) => setDiscountStr(e.target.value)} placeholder="0" />
            <Input label="Tax / GST (₹)" type="number" value={taxStr} onChange={(e) => setTaxStr(e.target.value)} placeholder="0" />
          </div>

          <Textarea label="Terms & Conditions" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="50% advance on confirmation, generator fuel extra..." />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate Quote</Button>
          </div>
        </form>
      </Modal>

      {/* Printable Quote Modal */}
      {viewingQuote && (
        <Modal
          isOpen={true}
          onClose={() => setViewingQuote(null)}
          title={`Quotation #${viewingQuote.quoteNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">SAI DECORATION & EVENT SERVICES</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Stage Decoration · Wedding Sets · Generator Rentals · Sound & Lighting</p>
                <p className="text-slate-500 text-[11px]">Contact: +91 98765 43210 · Netlify: sai-decoration.netlify.app</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block text-sm">{viewingQuote.quoteNumber}</span>
                <span className="text-[10px] text-slate-500 block">Date: {viewingQuote.createdAt.slice(0, 10)}</span>
                <span className="text-[10px] text-slate-500 block">Valid Until: {viewingQuote.validUntil}</span>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client / Party</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{viewingQuote.customerName}</p>
                <p className="text-slate-500">{viewingQuote.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Event Details</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{viewingQuote.eventType.toUpperCase()} · 📅 {viewingQuote.eventDate}</p>
                {viewingQuote.venue && <p className="text-slate-500">📍 {viewingQuote.venue}</p>}
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                  <th className="p-2 border border-slate-200 dark:border-slate-700">#</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700">Description</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-center">Qty</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-right">Rate</th>
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingQuote.items.map((it, idx) => (
                  <tr key={it.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">{idx + 1}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700">{it.description}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-mono">{it.quantity}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-mono">{formatPaiseToINR(it.unitPricePaise)}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-mono font-medium">{formatPaiseToINR(it.totalPaise)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="p-2 text-right font-semibold">Subtotal:</td>
                  <td className="p-2 text-right font-mono font-semibold">{formatPaiseToINR(viewingQuote.subtotalPaise)}</td>
                </tr>
                {viewingQuote.discountPaise > 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-right text-emerald-600">Discount:</td>
                    <td className="p-2 text-right font-mono text-emerald-600">- {formatPaiseToINR(viewingQuote.discountPaise)}</td>
                  </tr>
                )}
                {viewingQuote.taxPaise > 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-right">Tax / GST:</td>
                    <td className="p-2 text-right font-mono">+ {formatPaiseToINR(viewingQuote.taxPaise)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs">
                  <td colSpan={4} className="p-2 text-right">Grand Total:</td>
                  <td className="p-2 text-right font-mono text-indigo-600 dark:text-indigo-400">{formatPaiseToINR(viewingQuote.totalPaise)}</td>
                </tr>
              </tfoot>
            </table>

            {viewingQuote.notes && (
              <p className="text-[11px] text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                Notes: {viewingQuote.notes}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setViewingQuote(null)}>Close</Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Quotation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
