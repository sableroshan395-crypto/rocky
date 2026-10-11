import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatPaiseToINR, parseINRToPaise, formatDateDDMMYYYY } from '@/utils/formatters';
import { StorageAdapter } from '@/services/storageAdapter';
import { useToast } from '@/context/ToastContext';
import type { WorkCommissionRecord } from '@/types/financial';

export const CommissionLedgerPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [records, setRecords] = useState<WorkCommissionRecord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [referenceId, setReferenceId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [processedAmountStr, setProcessedAmountStr] = useState('');
  const [ratePercent, setRatePercent] = useState('3.2');
  const [commissionReceivedStr, setCommissionReceivedStr] = useState('');
  const [relatedFeesStr, setRelatedFeesStr] = useState('0.00');
  const [status, setStatus] = useState<WorkCommissionRecord['status']>('completed');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecords = () => {
    setRecords(StorageAdapter.getCommissionRecords());
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const summary = useMemo(() => {
    let totalProcessedPaise = 0;
    let totalCalculatedCommissionPaise = 0;
    let totalReceivedPaise = 0;
    let totalFeesPaise = 0;

    for (const r of records) {
      if (r.status === 'completed') {
        totalProcessedPaise += r.amountProcessedPaise;
        totalCalculatedCommissionPaise += r.calculatedCommissionPaise;
        totalReceivedPaise += r.commissionReceivedPaise;
        totalFeesPaise += r.relatedFeesPaise;
      }
    }

    return {
      totalProcessedPaise,
      totalCalculatedCommissionPaise,
      totalReceivedPaise,
      totalFeesPaise,
      netCommissionPaise: totalReceivedPaise - totalFeesPaise,
    };
  }, [records]);

  // Handle Form Submit
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const processedPaise = parseINRToPaise(processedAmountStr);
    const rate = parseFloat(ratePercent);

    if (!referenceId.trim()) {
      showError('Reference ID is required.');
      return;
    }
    if (!processedPaise || processedPaise <= 0) {
      showError('Processed amount must be greater than zero.');
      return;
    }
    if (isNaN(rate) || rate < 0) {
      showError('Please enter a valid commission rate percentage.');
      return;
    }

    const calculatedCommissionPaise = Math.round((processedPaise * rate) / 100);
    const receivedPaise = commissionReceivedStr
      ? parseINRToPaise(commissionReceivedStr) || calculatedCommissionPaise
      : calculatedCommissionPaise;
    const feesPaise = parseINRToPaise(relatedFeesStr) || 0;

    const newRecord: WorkCommissionRecord = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
      referenceId: referenceId.trim(),
      purpose: purpose.trim() || 'Authorized account work transaction',
      amountProcessedPaise: processedPaise,
      commissionRate: rate,
      commissionBasisPaise: processedPaise,
      calculatedCommissionPaise,
      commissionReceivedPaise: receivedPaise,
      relatedFeesPaise: feesPaise,
      status,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageAdapter.saveCommissionRecord(newRecord);
    showSuccess('Commission record logged', `Ref ${newRecord.referenceId} saved.`);
    setIsAddModalOpen(false);
    loadRecords();
  };

  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Date',
      'Reference ID',
      'Purpose',
      'Processed Amount (INR)',
      'Commission Rate (%)',
      'Calculated Commission (INR)',
      'Commission Received (INR)',
      'Fees (INR)',
      'Status',
    ];
    const rows = records.map((r) => [
      r.id,
      r.date,
      `"${r.referenceId}"`,
      `"${r.purpose.replace(/"/g, '""')}"`,
      (r.amountProcessedPaise / 100).toFixed(2),
      r.commissionRate,
      (r.calculatedCommissionPaise / 100).toFixed(2),
      (r.commissionReceivedPaise / 100).toFixed(2),
      (r.relatedFeesPaise / 100).toFixed(2),
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rocky_commission_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('CSV exported', `Exported ${records.length} records.`);
  };

  return (
    <div className="space-y-4">
      {/* Commission KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Total Processed Volume
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {formatPaiseToINR(summary.totalProcessedPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Authorized work basis</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Calculated Commission (3.2% Default)
          </span>
          <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatPaiseToINR(summary.totalCalculatedCommissionPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Formula: Amount × Rate ÷ 100</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Commission Received
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatPaiseToINR(summary.totalReceivedPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Actual credited earnings</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Net Commission Earnings
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {formatPaiseToINR(summary.netCommissionPaise)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">After deducting related fees</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="primary">Default Rate: 3.2%</Badge>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Separated from personal spending and business income
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setDateStr(new Date().toISOString().slice(0, 16));
              setReferenceId('');
              setPurpose('');
              setProcessedAmountStr('');
              setRatePercent('3.2');
              setCommissionReceivedStr('');
              setRelatedFeesStr('0.00');
              setNotes('');
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Work Record
          </Button>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Work & Commission History</CardTitle>
          <span className="text-[11px] text-slate-400 font-mono">{records.length} records</span>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No account work records logged yet. Click "Add Work Record" to track authorized work transactions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reference ID</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3 text-right">Processed Volume</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Calculated Comm.</th>
                    <th className="px-4 py-3 text-right">Received</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDateDDMMYYYY(r.date)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {r.referenceId}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">{r.purpose}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                        {formatPaiseToINR(r.amountProcessedPaise)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 whitespace-nowrap">
                        {r.commissionRate}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {formatPaiseToINR(r.calculatedCommissionPaise)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatPaiseToINR(r.commissionReceivedPaise)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          size="sm"
                          variant={r.status === 'completed' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}
                          className="capitalize"
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Work Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Account Work & Commission"
        description="Record legitimate, authorized work processing and calculate commission."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRecord} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reference ID *"
              placeholder="e.g. WRK-2026-081"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              autoFocus
            />
            <Input
              label="Date & Time"
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>

          <Input
            label="Purpose / Client Authorization *"
            placeholder="e.g. Authorized vendor processing, verified business batch"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount Processed (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={processedAmountStr}
              onChange={(e) => setProcessedAmountStr(e.target.value)}
            />
            <Input
              label="Commission Rate (%) *"
              type="number"
              step="0.01"
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
              helperText="Default is 3.2%"
            />
          </div>

          {/* Commission Live Formula Preview */}
          {processedAmountStr && parseFloat(processedAmountStr) > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs flex justify-between items-center font-mono">
              <span className="text-indigo-950 dark:text-indigo-200 font-sans">
                Calculated Commission ({ratePercent}%):
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {formatPaiseToINR(
                  Math.round(((parseINRToPaise(processedAmountStr) || 0) * (parseFloat(ratePercent) || 0)) / 100)
                )}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Commission Received (₹)"
              type="number"
              step="0.01"
              placeholder="Leave blank if matches calculated"
              value={commissionReceivedStr}
              onChange={(e) => setCommissionReceivedStr(e.target.value)}
            />
            <Input
              label="Related Fees (₹)"
              type="number"
              step="0.01"
              value={relatedFeesStr}
              onChange={(e) => setRelatedFeesStr(e.target.value)}
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkCommissionRecord['status'])}
            options={[
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'reversed', label: 'Reversed' },
              { value: 'failed', label: 'Failed' },
            ]}
          />

          <Textarea
            label="Notes (Optional)"
            rows={2}
            placeholder="Reference notes, payment mode, or batch ID"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Work Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
