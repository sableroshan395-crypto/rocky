import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  Receipt,
  FileCode,
  KeyRound,
  Fingerprint,
  Binary,
  Link2,
  AlignLeft,
  Type,
  FileText,
  Ruler,
  Clock,
  Palette,
  ArrowLeft,
  QrCode,
  Image as ImageIcon,
  Crop,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Financial
import { GstCalculator, CommissionCalculator, PercentageCalculator } from './tools/FinancialCalculators';
// Dev
import { JsonFormatter, PasswordGenerator, UuidGenerator, Base64Tool, UrlEncoder } from './tools/DevUtilities';
// Text
import { WordCounter, CaseConverter, LoremGenerator } from './tools/TextUtilities';
// Converters
import { UnitConverter, TimestampConverter, ColorConverter } from './tools/Converters';

interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component?: React.FC;
  externalUrl?: string;
  category: string;
}

const TOOLS: ToolDef[] = [
  // Useful Tools (Direct Redirects)
  {
    id: 'pdf-tool',
    name: 'PDF Tool',
    description: 'Merge, split, compress, and edit PDF files online (iLovePDF)',
    icon: <FileText className="w-4 h-4" />,
    externalUrl: 'https://www.ilovepdf.com/',
    category: 'Useful Tools',
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Create custom QR codes for URLs, WiFi, contact cards, and text',
    icon: <QrCode className="w-4 h-4" />,
    externalUrl: 'https://www.the-qrcode-generator.com/',
    category: 'Useful Tools',
  },
  {
    id: 'photo-converter',
    name: 'Photo Converter',
    description: 'Batch convert image formats (PNG, JPG, WebP, SVG, HEIC)',
    icon: <ImageIcon className="w-4 h-4" />,
    externalUrl: 'https://www.freeconvert.com/image-converter',
    category: 'Useful Tools',
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize, crop, and optimize image dimensions online',
    icon: <Crop className="w-4 h-4" />,
    externalUrl: 'https://imageresizer.com/',
    category: 'Useful Tools',
  },
  // Financial
  { id: 'gst', name: 'GST Calculator', description: 'CGST + SGST split, inclusive & exclusive modes', icon: <Receipt className="w-4 h-4" />, component: GstCalculator, category: 'Financial' },
  { id: 'commission', name: 'Commission Calculator', description: 'Calculate commission at any rate (default 3.2%)', icon: <Calculator className="w-4 h-4" />, component: CommissionCalculator, category: 'Financial' },
  { id: 'percentage', name: 'Percentage Calculator', description: 'X% of Y, X is what % of Y, % change', icon: <Percent className="w-4 h-4" />, component: PercentageCalculator, category: 'Financial' },
  // Dev
  { id: 'json', name: 'JSON Formatter', description: 'Format, validate, and minify JSON data', icon: <FileCode className="w-4 h-4" />, component: JsonFormatter, category: 'Developer' },
  { id: 'password', name: 'Password Generator', description: 'Cryptographically secure random passwords', icon: <KeyRound className="w-4 h-4" />, component: PasswordGenerator, category: 'Developer' },
  { id: 'uuid', name: 'UUID Generator', description: 'Generate one or many v4 UUIDs instantly', icon: <Fingerprint className="w-4 h-4" />, component: UuidGenerator, category: 'Developer' },
  { id: 'base64', name: 'Base64 Encode/Decode', description: 'Encode text to Base64 or decode back', icon: <Binary className="w-4 h-4" />, component: Base64Tool, category: 'Developer' },
  { id: 'url', name: 'URL Encode/Decode', description: 'Encode and decode URL components', icon: <Link2 className="w-4 h-4" />, component: UrlEncoder, category: 'Developer' },
  // Text
  { id: 'wordcount', name: 'Word & Character Counter', description: 'Count words, characters, reading time', icon: <AlignLeft className="w-4 h-4" />, component: WordCounter, category: 'Text' },
  { id: 'case', name: 'Case Converter', description: 'Convert to UPPER, lower, Title, camel, snake, kebab', icon: <Type className="w-4 h-4" />, component: CaseConverter, category: 'Text' },
  { id: 'lorem', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text paragraphs', icon: <FileText className="w-4 h-4" />, component: LoremGenerator, category: 'Text' },
  // Converters
  { id: 'unit', name: 'Unit Converter', description: 'Length, weight, temperature, area, volume, data', icon: <Ruler className="w-4 h-4" />, component: UnitConverter, category: 'Converters' },
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Unix timestamp ↔ human-readable date', icon: <Clock className="w-4 h-4" />, component: TimestampConverter, category: 'Converters' },
  { id: 'color', name: 'Color Converter', description: 'HEX ↔ RGB ↔ HSL with color picker & CSS', icon: <Palette className="w-4 h-4" />, component: ColorConverter, category: 'Converters' },
];

const ICON_BG: Record<string, string> = {
  'Useful Tools': 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
  Financial: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  Developer: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  Text: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  Converters: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
};

export const ToolsHubPage: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const activeTool = TOOLS.find((t) => t.id === activeToolId);
  const categories = [...new Set(TOOLS.map((t) => t.category))];

  const handleToolClick = (tool: ToolDef) => {
    if (tool.externalUrl) {
      window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveToolId(tool.id);
    }
  };

  if (activeTool && activeTool.component) {
    const ToolComponent = activeTool.component;
    return (
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={() => setActiveToolId(null)}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            All Tools
          </Button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${ICON_BG[activeTool.category]}`}>
              {activeTool.icon}
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{activeTool.name}</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeTool.description}</p>
            </div>
          </div>
        </div>

        <Card className="p-5">
          <ToolComponent />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Tools Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {TOOLS.length} utilities · Client-side tools and instant web redirects
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {cat}
            </h2>
            {cat === 'Useful Tools' && (
              <span className="text-[10px] text-slate-400 font-mono">1-Click Online Redirects</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {TOOLS.filter((t) => t.category === cat).map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="text-left group"
              >
                <Card className="p-3.5 h-full flex items-start gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer">
                  <span className={`p-2 rounded-lg shrink-0 ${ICON_BG[tool.category]}`}>
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {tool.name}
                      </h3>
                      {tool.externalUrl && (
                        <span className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0">
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {tool.description}
                    </p>
                    {tool.externalUrl && (
                      <span className="inline-block mt-2 font-mono text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-full">
                        {tool.externalUrl.replace('https://', '').replace('www.', '').replace(/\/$/, '')}
                      </span>
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
