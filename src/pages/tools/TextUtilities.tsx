import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Copy, Check } from 'lucide-react';

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  }, []);
  return { copied, copy };
}

/* ─── Word & Character Counter ─── */

export const WordCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (words > 0 ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));
    return { chars, charsNoSpace, words, sentences, paragraphs, readingTime, speakingTime };
  }, [text]);

  return (
    <div className="space-y-4">
      <Textarea label="Enter or paste text" rows={8} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text here..." className="text-sm" />
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
        {[
          { label: 'Characters', value: stats.chars },
          { label: 'No Spaces', value: stats.charsNoSpace },
          { label: 'Words', value: stats.words },
          { label: 'Sentences', value: stats.sentences },
          { label: 'Paragraphs', value: stats.paragraphs },
          { label: 'Read (min)', value: stats.readingTime },
          { label: 'Speak (min)', value: stats.speakingTime },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">{s.value}</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ─── Case Converter ─── */

export const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const { copied, copy } = useCopy();

  const conversions = useMemo(() => {
    if (!text.trim()) return [];
    return [
      { label: 'UPPERCASE', value: text.toUpperCase() },
      { label: 'lowercase', value: text.toLowerCase() },
      { label: 'Title Case', value: text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) },
      { label: 'Sentence case', value: text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()) },
      { label: 'camelCase', value: text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase()) },
      { label: 'snake_case', value: text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
      { label: 'kebab-case', value: text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') },
      { label: 'CONSTANT_CASE', value: text.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
    ];
  }, [text]);

  return (
    <div className="space-y-4">
      <Textarea label="Enter text to convert" rows={3} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text..." className="text-sm" />
      {conversions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {conversions.map((c) => (
            <Card key={c.label} className="p-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{c.label}</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-mono break-all mt-0.5 select-all">{c.value}</p>
              </div>
              <button onClick={() => copy(c.value)} className="shrink-0 p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Copy">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Lorem Ipsum Generator ─── */

const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function generateLorem(paragraphs: number, wordsPerParagraph: number): string {
  const result: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const words: string[] = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    result.push(words.join(' ') + '.');
  }
  return result.join('\n\n');
}

export const LoremGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [output, setOutput] = useState('');
  const { copied, copy } = useCopy();

  const handleGenerate = () => {
    setOutput(generateLorem(paragraphs, wordsPerParagraph));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Paragraphs: {paragraphs}</label>
          <input type="range" min="1" max="20" value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))}
            className="w-32 accent-indigo-600" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Words/para: {wordsPerParagraph}</label>
          <input type="range" min="10" max="150" step="5" value={wordsPerParagraph}
            onChange={(e) => setWordsPerParagraph(Number(e.target.value))} className="w-32 accent-indigo-600" />
        </div>
        <Button variant="primary" size="sm" onClick={handleGenerate}>Generate</Button>
        {output && (
          <Button size="sm" variant="secondary" onClick={() => copy(output)}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>
      {output && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="py-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-all">{output}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
