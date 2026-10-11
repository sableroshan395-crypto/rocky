import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Copy, Check, RefreshCw } from 'lucide-react';

/* ─── Clipboard Copy Hook ─── */

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }, []);
  return { copied, copy };
}

/* ─── JSON Formatter ─── */

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState('2');
  const { copied, copy } = useCopy();

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      const parsed = JSON.parse(input);
      return { output: JSON.stringify(parsed, null, Number(indent) || 2), error: '' };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
  }, [input, indent]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Select label="Indent" value={indent} onChange={(e) => setIndent(e.target.value)}
          options={[{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: '0', label: 'Minified' }]}
          className="w-36"
        />
        {result.output && (
          <Button size="sm" variant="secondary" onClick={() => copy(result.output)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Textarea label="Input JSON" rows={12} placeholder='{"key": "value"}' value={input} onChange={(e) => setInput(e.target.value)}
          className="font-mono text-xs" />
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Output</label>
          {result.error ? (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-mono">
              {result.error}
            </div>
          ) : (
            <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono overflow-auto max-h-72 whitespace-pre-wrap">
              {result.output || 'Paste JSON on the left'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Password Generator ─── */

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const { copied, copy } = useCopy();

  const generate = useCallback(() => {
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (digits) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (!chars) { setPassword(''); return; }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    setPassword(Array.from(array, (v) => chars[v % chars.length]).join(''));
  }, [length, upper, lower, digits, symbols]);

  const strength = useMemo(() => {
    if (!password) return { label: '', color: '' };
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 20) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { label: 'Weak', color: 'text-rose-500' };
    if (score <= 4) return { label: 'Medium', color: 'text-amber-500' };
    return { label: 'Strong', color: 'text-emerald-500' };
  }, [password]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Length: {length}</label>
          <input type="range" min="6" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-600" />
        </div>
        {[
          { label: 'Uppercase', checked: upper, set: setUpper },
          { label: 'Lowercase', checked: lower, set: setLower },
          { label: 'Numbers', checked: digits, set: setDigits },
          { label: 'Symbols', checked: symbols, set: setSymbols },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={generate}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Generate</Button>
        {password && (
          <Button size="sm" variant="secondary" onClick={() => copy(password)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>

      {password && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="py-3">
            <p className="font-mono text-sm break-all text-slate-900 dark:text-slate-100 select-all">{password}</p>
            <p className={`text-[10px] font-semibold mt-1.5 ${strength.color}`}>{strength.label}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ─── UUID Generator ─── */

export const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState('1');
  const { copied, copy } = useCopy();

  const generate = () => {
    const n = Math.min(Math.max(parseInt(count) || 1, 1), 50);
    setUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Input label="Count" type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" max="50" className="w-24" />
        <Button variant="primary" size="sm" onClick={generate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Generate</Button>
        {uuids.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => copy(uuids.join('\n'))}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy All'}
          </Button>
        )}
      </div>
      {uuids.length > 0 && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="py-3 space-y-1">
            {uuids.map((uuid, i) => (
              <p key={i} className="font-mono text-xs text-slate-700 dark:text-slate-300 select-all">{uuid}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ─── Base64 Encoder/Decoder ─── */

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const { copied, copy } = useCopy();

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      if (mode === 'encode') {
        return btoa(unescape(encodeURIComponent(input)));
      } else {
        return decodeURIComponent(escape(atob(input)));
      }
    } catch {
      return '⚠ Invalid input';
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Select label="Mode" value={mode} onChange={(e) => { setMode(e.target.value as 'encode' | 'decode'); setInput(''); }}
          options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} className="w-32" />
        {result && !result.startsWith('⚠') && (
          <Button size="sm" variant="secondary" onClick={() => copy(result)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Textarea label={mode === 'encode' ? 'Plain Text' : 'Base64 String'} rows={6} value={input}
          onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode' : 'Enter base64 to decode'}
          className="font-mono text-xs" />
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
          </label>
          <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-auto min-h-[150px] max-h-48 whitespace-pre-wrap select-all">
            {result || 'Output appears here'}
          </pre>
        </div>
      </div>
    </div>
  );
};

/* ─── URL Encoder/Decoder ─── */

export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const { copied, copy } = useCopy();

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch {
      return '⚠ Invalid input';
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Select label="Mode" value={mode} onChange={(e) => { setMode(e.target.value as 'encode' | 'decode'); setInput(''); }}
          options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} className="w-32" />
        {result && !result.startsWith('⚠') && (
          <Button size="sm" variant="secondary" onClick={() => copy(result)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Textarea label="Input" rows={4} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter URL or text' : 'Enter encoded URL'} className="font-mono text-xs" />
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Output</label>
          <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-auto min-h-[100px] max-h-32 whitespace-pre-wrap select-all break-all">
            {result || 'Output appears here'}
          </pre>
        </div>
      </div>
    </div>
  );
};
