import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }, []);
  return { copied, copy };
}

/* ─── Unit Converter ─── */

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'data';

const UNIT_DATA: Record<UnitCategory, { units: { value: string; label: string }[]; convert: (val: number, from: string, to: string) => number }> = {
  length: {
    units: [
      { value: 'mm', label: 'Millimeter' }, { value: 'cm', label: 'Centimeter' }, { value: 'm', label: 'Meter' },
      { value: 'km', label: 'Kilometer' }, { value: 'in', label: 'Inch' }, { value: 'ft', label: 'Foot' },
      { value: 'yd', label: 'Yard' }, { value: 'mi', label: 'Mile' },
    ],
    convert: (val, from, to) => {
      const toMeter: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 };
      return (val * toMeter[from]) / toMeter[to];
    },
  },
  weight: {
    units: [
      { value: 'mg', label: 'Milligram' }, { value: 'g', label: 'Gram' }, { value: 'kg', label: 'Kilogram' },
      { value: 'lb', label: 'Pound' }, { value: 'oz', label: 'Ounce' }, { value: 'ton', label: 'Metric Ton' },
    ],
    convert: (val, from, to) => {
      const toGram: Record<string, number> = { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495, ton: 1000000 };
      return (val * toGram[from]) / toGram[to];
    },
  },
  temperature: {
    units: [
      { value: 'c', label: 'Celsius' }, { value: 'f', label: 'Fahrenheit' }, { value: 'k', label: 'Kelvin' },
    ],
    convert: (val, from, to) => {
      let celsius: number;
      if (from === 'c') celsius = val;
      else if (from === 'f') celsius = (val - 32) * (5 / 9);
      else celsius = val - 273.15;

      if (to === 'c') return celsius;
      if (to === 'f') return celsius * (9 / 5) + 32;
      return celsius + 273.15;
    },
  },
  area: {
    units: [
      { value: 'sqm', label: 'Square Meter' }, { value: 'sqkm', label: 'Square Km' },
      { value: 'sqft', label: 'Square Foot' }, { value: 'acre', label: 'Acre' },
      { value: 'hectare', label: 'Hectare' },
    ],
    convert: (val, from, to) => {
      const toSqm: Record<string, number> = { sqm: 1, sqkm: 1000000, sqft: 0.092903, acre: 4046.86, hectare: 10000 };
      return (val * toSqm[from]) / toSqm[to];
    },
  },
  volume: {
    units: [
      { value: 'ml', label: 'Milliliter' }, { value: 'l', label: 'Liter' },
      { value: 'gal', label: 'US Gallon' }, { value: 'cup', label: 'Cup' },
    ],
    convert: (val, from, to) => {
      const toMl: Record<string, number> = { ml: 1, l: 1000, gal: 3785.41, cup: 236.588 };
      return (val * toMl[from]) / toMl[to];
    },
  },
  data: {
    units: [
      { value: 'b', label: 'Bytes' }, { value: 'kb', label: 'KB' }, { value: 'mb', label: 'MB' },
      { value: 'gb', label: 'GB' }, { value: 'tb', label: 'TB' },
    ],
    convert: (val, from, to) => {
      const toBytes: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 };
      return (val * toBytes[from]) / toBytes[to];
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [value, setValue] = useState('');

  const units = UNIT_DATA[category].units;

  const result = useMemo(() => {
    const val = parseFloat(value);
    if (!isFinite(val)) return null;
    const converted = UNIT_DATA[category].convert(val, from, to);
    return Number.isInteger(converted) ? String(converted) : converted.toPrecision(8).replace(/\.?0+$/, '');
  }, [value, from, to, category]);

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const u = UNIT_DATA[cat].units;
    setFrom(u[0].value);
    setTo(u.length > 1 ? u[1].value : u[0].value);
    setValue('');
  };

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <Input label="Value" type="number" placeholder="Enter value" value={value} onChange={(e) => setValue(e.target.value)} />
        <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)} options={units} />
        <div className="flex justify-center">
          <button onClick={swap} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Swap">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
        <Select label="To" value={to} onChange={(e) => setTo(e.target.value)} options={units} />
        <Card className="p-3 text-center bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Result</p>
          <p className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{result ?? '—'}</p>
        </Card>
      </div>
    </div>
  );
};

/* ─── Timestamp Converter ─── */

export const TimestampConverter: React.FC = () => {
  const [unix, setUnix] = useState('');
  const [dateStr, setDateStr] = useState('');
  const { copied, copy } = useCopy();

  const now = useMemo(() => Math.floor(Date.now() / 1000), []);

  const fromUnix = useMemo(() => {
    const val = parseInt(unix);
    if (!isFinite(val)) return null;
    const ms = unix.length > 10 ? val : val * 1000;
    try { return new Date(ms); } catch { return null; }
  }, [unix]);

  const fromDate = useMemo(() => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  }, [dateStr]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 items-end flex-wrap">
        <Button size="sm" variant="secondary" onClick={() => setUnix(String(now))}>Now (Unix)</Button>
        <Button size="sm" variant="secondary" onClick={() => setDateStr(new Date().toISOString().slice(0, 19))}>Now (Date)</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Input label="Unix Timestamp" placeholder="e.g. 1700000000" value={unix} onChange={(e) => setUnix(e.target.value)} className="font-mono" />
          {fromUnix && !isNaN(fromUnix.getTime()) && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="py-3 space-y-1.5">
                {[
                  { label: 'ISO 8601', value: fromUnix.toISOString() },
                  { label: 'Local', value: fromUnix.toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'long' }) },
                  { label: 'UTC', value: fromUnix.toUTCString() },
                  { label: 'Relative', value: `${Math.floor((Date.now() - fromUnix.getTime()) / 1000)} seconds ago` },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">{r.label}</span>
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 select-all">{r.value}</span>
                    </div>
                    <button onClick={() => copy(r.value)} className="shrink-0 p-1 text-slate-400 hover:text-indigo-600" title="Copy">
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Input label="Date/Time String" type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="font-mono" />
          {fromDate && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="py-3 space-y-1.5">
                {[
                  { label: 'Unix (seconds)', value: String(Math.floor(fromDate.getTime() / 1000)) },
                  { label: 'Unix (milliseconds)', value: String(fromDate.getTime()) },
                  { label: 'ISO 8601', value: fromDate.toISOString() },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">{r.label}</span>
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 select-all">{r.value}</span>
                    </div>
                    <button onClick={() => copy(r.value)} className="shrink-0 p-1 text-slate-400 hover:text-indigo-600" title="Copy">
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Color Converter ─── */

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#4f46e5');
  const { copied, copy } = useCopy();

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(...rgb) : null, [rgb]);

  const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHex(e.target.value);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHex(val);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pick Color</label>
          <input type="color" value={rgb ? rgbToHex(...rgb) : '#000000'} onChange={handleColorPick}
            className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer" />
        </div>
        <Input label="HEX" value={hex} onChange={handleHexInput} placeholder="#4f46e5" className="font-mono w-32" />
      </div>

      {rgb && hsl && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="w-full h-20 rounded-lg border border-slate-200 dark:border-slate-700 mb-3"
              style={{ backgroundColor: rgbToHex(...rgb) }} />
            <div className="space-y-2">
              {[
                { label: 'HEX', value: rgbToHex(...rgb) },
                { label: 'RGB', value: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
                { label: 'HSL', value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide block">{item.label}</span>
                    <span className="text-xs font-mono text-slate-800 dark:text-slate-200 select-all">{item.value}</span>
                  </div>
                  <button onClick={() => copy(item.value)} className="p-1 text-slate-400 hover:text-indigo-600" title="Copy">
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:col-span-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-3">CSS Custom Property Usage</p>
            <div className="space-y-1.5">
              {[
                `--color-primary: ${rgbToHex(...rgb)};`,
                `background-color: ${rgbToHex(...rgb)};`,
                `color: rgb(${rgb.join(', ')});`,
                `border: 1px solid hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%);`,
                `box-shadow: 0 4px 14px ${rgbToHex(...rgb)}40;`,
              ].map((css, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 select-all">{css}</code>
                  <button onClick={() => copy(css)} className="shrink-0 p-1 text-slate-400 hover:text-indigo-600" title="Copy">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
