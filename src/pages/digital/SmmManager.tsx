import React, { useState } from 'react';
import { Share2, Plus, ExternalLink, Search, Trash2, Edit2, Copy, Check, KeyRound, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StorageAdapter } from '@/services/storageAdapter';
import { formatPaiseToINR, parseINRToPaise } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import type { SmmOrder } from '@/types/digitalLibrary';

interface SmmManagerProps {
  orders: SmmOrder[];
  onRefresh: () => void;
}

const STATUS_BADGES: Record<SmmOrder['status'], { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
  pending: { variant: 'default', label: 'Pending' },
  processing: { variant: 'warning', label: 'Processing' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
  refunded: { variant: 'primary', label: 'Refunded' },
};

export const SmmManager: React.FC<SmmManagerProps> = ({ orders, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SmmOrder | null>(null);

  // Form state
  const [platform, setPlatform] = useState<SmmOrder['platform']>('Instagram');
  const [serviceType, setServiceType] = useState<SmmOrder['serviceType']>('followers');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState('1000');
  const [costStr, setCostStr] = useState('');
  const [sellStr, setSellStr] = useState('');
  const [providerOrderId, setProviderOrderId] = useState('');
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState<SmmOrder['status']>('processing');
  const [notes, setNotes] = useState('');

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.targetUrl.toLowerCase().includes(search.toLowerCase()) ||
      (o.clientName && o.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (o.providerOrderId && o.providerOrderId.includes(search));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProfitPaise = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.profitPaise, 0);

  const openAdd = () => {
    setEditingOrder(null);
    setPlatform('Instagram');
    setServiceType('followers');
    setTargetUrl('');
    setQuantity('1000');
    setCostStr('');
    setSellStr('');
    setProviderOrderId('');
    setClientName('');
    setStatus('processing');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEdit = (o: SmmOrder) => {
    setEditingOrder(o);
    setPlatform(o.platform);
    setServiceType(o.serviceType);
    setTargetUrl(o.targetUrl);
    setQuantity(String(o.quantity));
    setCostStr((o.costPricePaise / 100).toFixed(2));
    setSellStr((o.sellingPricePaise / 100).toFixed(2));
    setProviderOrderId(o.providerOrderId || '');
    setClientName(o.clientName || '');
    setStatus(o.status);
    setNotes(o.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      showError('Target account / post URL is required.');
      return;
    }

    const costPaise = parseINRToPaise(costStr) || 0;
    const sellPaise = parseINRToPaise(sellStr) || 0;
    const qty = parseInt(quantity) || 1;

    try {
      const saved = StorageAdapter.saveSmmOrder({
        id: editingOrder?.id,
        platform,
        serviceType,
        targetUrl: targetUrl.trim(),
        quantity: qty,
        costPricePaise: costPaise,
        sellingPricePaise: sellPaise,
        providerOrderId: providerOrderId.trim() || undefined,
        clientName: clientName.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });

      showSuccess(editingOrder ? 'Order Updated' : 'Order Logged', `#${saved.orderNumber}`);
      setIsModalOpen(false);
      onRefresh();
    } catch {
      showError('Failed to save SMM order.');
    }
  };

  const handleStatusChange = (id: string, newStatus: SmmOrder['status']) => {
    StorageAdapter.updateSmmOrderStatus(id, newStatus);
    showSuccess('Status Updated', `Order marked as ${newStatus}.`);
    onRefresh();
  };

  const handleDelete = (id: string, num: string) => {
    if (window.confirm(`Delete SMM order "${num}"?`)) {
      StorageAdapter.deleteSmmOrder(id);
      showSuccess('Order Deleted', num);
      onRefresh();
    }
  };

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const smmPanelsList = [
    {
      name: 'Cheapest SMM Panel',
      url: 'https://cheapestsmmpanels.com',
      username: 'sableroshan24@gmail.com',
      authInfo: 'Email: sableroshan24@gmail.com',
    },
    {
      name: 'Fine SMM Panel',
      url: 'https://finesmmpanel.com/',
      username: 'sableroshan24@gmail.com',
      authInfo: 'Email: sableroshan24@gmail.com',
    },
    {
      name: 'SMM Social Media',
      url: 'https://smmsocialmedia.in/',
      username: 'roshansableddd',
      authInfo: 'ID: roshansableddd | Pass: roshan2424',
      copyValue: 'roshan2424',
    },
  ];

  return (
    <div className="space-y-4">
      {/* SMM Panels Speed-Dial Access */}
      <Card className="p-4 border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/20 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Connected SMM Panels & Quick Access
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">1-Click Launch & Credentials</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smmPanelsList.map((panel) => (
            <div
              key={panel.name}
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {panel.name}
                </span>
                <a
                  href={panel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 rounded flex items-center gap-0.5 text-[11px] font-medium"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-1">
                <span className="font-mono truncate flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-indigo-500 shrink-0" />
                  {panel.authInfo}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(panel.username);
                    setCopiedKey(panel.name);
                    setTimeout(() => setCopiedKey(null), 1800);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 text-[10px] flex items-center gap-0.5"
                  title="Copy Login ID / Email"
                >
                  {copiedKey === panel.name ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-0.5"><Copy className="w-2.5 h-2.5" /> Copy ID</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Orders</span>
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{orders.length}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Completed</span>
          <p className="text-lg font-bold font-mono text-emerald-600">{orders.filter((o) => o.status === 'completed').length}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">In Processing</span>
          <p className="text-lg font-bold font-mono text-amber-600">{orders.filter((o) => o.status === 'processing').length}</p>
        </Card>
        <Card className="p-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Completed Profit</span>
          <p className="text-lg font-bold font-mono text-indigo-600">{formatPaiseToINR(totalProfitPaise)}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search SMM orders by number, URL, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="w-36"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Log SMM Order
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Share2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {orders.length === 0
              ? 'No SMM reseller orders recorded. Log social media growth orders and monitor profit margins.'
              : 'No orders match your filter.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {o.orderNumber}
                    </span>
                    <Badge variant={STATUS_BADGES[o.status].variant} size="sm">
                      {STATUS_BADGES[o.status].label}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {o.platform} · {o.serviceType} ({o.quantity.toLocaleString('en-IN')})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    <a href={o.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 inline-flex items-center gap-1">
                      {o.targetUrl} <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {o.clientName && <span>Client: {o.clientName}</span>}
                    {o.providerOrderId && <span>Provider ID: #{o.providerOrderId}</span>}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end font-mono">
                      <span>Cost: {formatPaiseToINR(o.costPricePaise)}</span>
                      <span>·</span>
                      <span>Sell: {formatPaiseToINR(o.sellingPricePaise)}</span>
                    </div>
                    <span className={`text-xs font-bold font-mono block ${o.profitPaise >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Margin: {o.profitPaise >= 0 ? '+' : ''}{formatPaiseToINR(o.profitPaise)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Mark:</span>
                  {(['processing', 'completed', 'cancelled'] as SmmOrder['status'][]).map((st) => (
                    <button
                      key={st}
                      disabled={o.status === st}
                      onClick={() => handleStatusChange(o.id, st)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        o.status === st ? 'font-bold underline' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(o)} className="h-7 px-2">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(o.id, o.orderNumber)} className="h-7 px-2 text-rose-500 hover:text-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? 'Edit SMM Order' : 'Log New SMM Reseller Order'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SmmOrder['platform'])}
              options={[
                { value: 'Instagram', label: 'Instagram' },
                { value: 'YouTube', label: 'YouTube' },
                { value: 'Telegram', label: 'Telegram' },
                { value: 'Twitter/X', label: 'Twitter / X' },
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Spotify', label: 'Spotify' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Service Type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as SmmOrder['serviceType'])}
              options={[
                { value: 'followers', label: 'Followers / Subscribers' },
                { value: 'likes', label: 'Likes' },
                { value: 'views', label: 'Views / Watch Hours' },
                { value: 'comments', label: 'Comments' },
                { value: 'custom', label: 'Custom Engagement' },
              ]}
            />
          </div>

          <Input label="Target URL / Profile Link" required value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://instagram.com/username or post link" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Quantity" type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1000" />
            <Input label="Cost Price ₹ (Provider)" type="number" step="0.01" required value={costStr} onChange={(e) => setCostStr(e.target.value)} placeholder="80" />
            <Input label="Selling Price ₹ (Client)" type="number" step="0.01" required value={sellStr} onChange={(e) => setSellStr(e.target.value)} placeholder="250" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Client Name (Optional)" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Rohan Sharma" />
            <Input label="Provider Order ID (Optional)" value={providerOrderId} onChange={(e) => setProviderOrderId(e.target.value)} placeholder="e.g. 1928471" />
          </div>

          <Select
            label="Order Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SmmOrder['status'])}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />

          <Textarea label="Notes & API Details" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Provider link, refill guarantee period..." />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingOrder ? 'Save Changes' : 'Record Order'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
