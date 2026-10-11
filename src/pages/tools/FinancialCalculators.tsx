import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { formatPaiseToINR } from '@/utils/formatters';

/* ─── GST Calculator ─── */

type GstMode = 'exclusive' | 'inclusive';
type GstRate = 5 | 12 | 18 | 28;

export const GstCalculator: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState<GstRate>(18);
  const [mode, setMode] = useState<GstMode>('exclusive');

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !isFinite(val)) return null;

    const paise = Math.round(val * 100);
    if (mode === 'exclusive') {
      const gstPaise = Math.round((paise * rate) / 100);
      const cgstPaise = Math.round(gstPaise / 2);
      const sgstPaise = gstPaise - cgstPaise;
      return { base: paise, cgst: cgstPaise, sgst: sgstPaise, gst: gstPaise, total: paise + gstPaise };
    } else {
      const basePaise = Math.round((paise * 100) / (100 + rate));
      const gstPaise = paise - basePaise;
      const cgstPaise = Math.round(gstPaise / 2);
      const sgstPaise = gstPaise - cgstPaise;
      return { base: basePaise, cgst: cgstPaise, sgst: sgstPaise, gst: gstPaise, total: paise };
    }
  }, [amount, rate, mode]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Amount (₹)"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <Select
          label="GST Rate"
          value={String(rate)}
          onChange={(e) => setRate(Number(e.target.value) as GstRate)}
          options={[
            { value: '5', label: '5%' },
            { value: '12', label: '12%' },
            { value: '18', label: '18%' },
            { value: '28', label: '28%' },
          ]}
        />
        <Select
          label="Calculation Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as GstMode)}
          options={[
            { value: 'exclusive', label: 'Add GST to amount' },
            { value: 'inclusive', label: 'GST included in amount' },
          ]}
        />
      </div>

      {result && (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              {[
                { label: 'Base Amount', value: result.base },
                { label: `CGST (${rate / 2}%)`, value: result.cgst },
                { label: `SGST (${rate / 2}%)`, value: result.sgst },
                { label: `Total GST (${rate}%)`, value: result.gst },
                { label: 'Grand Total', value: result.total },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{item.label}</p>
                  <p className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatPaiseToINR(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ─── Commission Calculator ─── */

export const CommissionCalculator: React.FC = () => {
  const [processed, setProcessed] = useState('');
  const [rateStr, setRateStr] = useState('3.2');
  const [fees, setFees] = useState('');

  const result = useMemo(() => {
    const val = parseFloat(processed);
    const rate = parseFloat(rateStr);
    const feesVal = parseFloat(fees) || 0;
    if (!val || val <= 0 || !rate || rate <= 0 || !isFinite(val) || !isFinite(rate)) return null;

    const processedPaise = Math.round(val * 100);
    const feesPaise = Math.round(feesVal * 100);
    const commissionPaise = Math.round((processedPaise * rate) / 100);
    const netPaise = commissionPaise - feesPaise;

    return { processed: processedPaise, commission: commissionPaise, fees: feesPaise, net: netPaise, rate };
  }, [processed, rateStr, fees]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Amount Processed (₹)"
          type="number"
          placeholder="e.g. 50000"
          value={processed}
          onChange={(e) => setProcessed(e.target.value)}
          min="0"
          step="0.01"
        />
        <Input
          label="Commission Rate (%)"
          type="number"
          placeholder="3.2"
          value={rateStr}
          onChange={(e) => setRateStr(e.target.value)}
          min="0"
          max="100"
          step="0.1"
        />
        <Input
          label="Related Fees (₹)"
          type="number"
          placeholder="0"
          value={fees}
          onChange={(e) => setFees(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      {result && (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Amount Processed', value: result.processed },
                { label: `Commission (${result.rate}%)`, value: result.commission },
                { label: 'Fees Deducted', value: result.fees },
                { label: 'Net Earnings', value: result.net },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{item.label}</p>
                  <p className={`text-sm font-bold font-mono tabular-nums mt-0.5 ${
                    item.label === 'Net Earnings'
                      ? item.value >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {formatPaiseToINR(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ─── Percentage Calculator ─── */

type PercentMode = 'of' | 'is_what' | 'change';

export const PercentageCalculator: React.FC = () => {
  const [mode, setMode] = useState<PercentMode>('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const result = useMemo(() => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isFinite(numA) || !isFinite(numB)) return null;

    switch (mode) {
      case 'of':
        return { answer: (numA / 100) * numB, label: `${numA}% of ${numB}` };
      case 'is_what':
        if (numB === 0) return null;
        return { answer: (numA / numB) * 100, label: `${numA} is what % of ${numB}`, suffix: '%' };
      case 'change':
        if (numA === 0) return null;
        return { answer: ((numB - numA) / numA) * 100, label: `${numA} → ${numB}`, suffix: '%' };
      default:
        return null;
    }
  }, [mode, a, b]);

  const labels: Record<PercentMode, { a: string; b: string }> = {
    of: { a: 'Percentage (%)', b: 'Of value' },
    is_what: { a: 'Value', b: 'Total' },
    change: { a: 'From', b: 'To' },
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Calculation Mode"
          value={mode}
          onChange={(e) => { setMode(e.target.value as PercentMode); setA(''); setB(''); }}
          options={[
            { value: 'of', label: 'What is X% of Y?' },
            { value: 'is_what', label: 'X is what % of Y?' },
            { value: 'change', label: '% change from X to Y' },
          ]}
        />
        <Input label={labels[mode].a} type="number" placeholder="Enter value" value={a} onChange={(e) => setA(e.target.value)} />
        <Input label={labels[mode].b} type="number" placeholder="Enter value" value={b} onChange={(e) => setB(e.target.value)} />
      </div>

      {result && (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="py-4 text-center">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{result.label}</p>
            <p className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              mode === 'change' ? (result.answer >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-900 dark:text-slate-100'
            }`}>
              {mode === 'change' && result.answer > 0 ? '+' : ''}
              {Number.isInteger(result.answer) ? result.answer : result.answer.toFixed(4)}
              {result.suffix || ''}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
