import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Calendar,
  Users,
  FileSpreadsheet,
  Box,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StorageAdapter } from '@/services/storageAdapter';
import { CustomersManager } from './sai/CustomersManager';
import { BookingsManager } from './sai/BookingsManager';
import { EquipmentManager } from './sai/EquipmentManager';
import { QuotesManager } from './sai/QuotesManager';
import type { SaiCustomer, SaiBooking, SaiEquipment, SaiQuote } from '@/types/saiDecoration';

type SaiTab = 'overview' | 'bookings' | 'customers' | 'equipment' | 'quotes';

export const SaiDecorationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SaiTab>('overview');
  const [customers, setCustomers] = useState<SaiCustomer[]>([]);
  const [bookings, setBookings] = useState<SaiBooking[]>([]);
  const [equipment, setEquipment] = useState<SaiEquipment[]>([]);
  const [quotes, setQuotes] = useState<SaiQuote[]>([]);

  const loadData = () => {
    setCustomers(StorageAdapter.getSaiCustomers());
    setBookings(StorageAdapter.getSaiBookings());
    setEquipment(StorageAdapter.getSaiEquipment());
    setQuotes(StorageAdapter.getSaiQuotes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const rentedEquipment = equipment.filter((e) => e.status === 'rented');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sai Decoration Business Hub
            </h1>
            <Badge variant="primary">Family Business HQ</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational center for event bookings, client directory, generator fleet, and quotations.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Portals', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'bookings', label: `Event Bookings (${bookings.length})`, icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: 'customers', label: `Customer Directory (${customers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'equipment', label: `Equipment Fleet (${equipment.length})`, icon: <Box className="w-3.5 h-3.5" /> },
          { id: 'quotes', label: `Quotations (${quotes.length})`, icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SaiTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Existing Portals */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Bookings', value: pendingBookings.length, icon: <Calendar className="w-4 h-4 text-indigo-500" /> },
              { label: 'Total Clients', value: customers.length, icon: <Users className="w-4 h-4 text-emerald-500" /> },
              { label: 'Rented Equipment', value: `${rentedEquipment.length} / ${equipment.length}`, icon: <Box className="w-4 h-4 text-amber-500" /> },
              { label: 'Quotes Created', value: quotes.length, icon: <FileSpreadsheet className="w-4 h-4 text-violet-500" /> },
            ].map((m) => (
              <Card key={m.label} className="p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{m.label}</span>
                  {m.icon}
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{m.value}</p>
              </Card>
            ))}
          </div>

          {/* Existing Live Deployments */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Production Portals (Netlify)</CardTitle>
              <Badge variant="success">Active Production</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
                    Sai Decoration Business Website
                  </span>
                  <a
                    href="https://sai-decoration.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    https://sai-decoration.netlify.app/
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer-facing portfolio showcasing wedding stages, mandaps, floral backdrops, and lighting setups.
                  </p>
                </div>
                <a href="https://sai-decoration.netlify.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Launch Site
                  </Button>
                </a>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
                    Sai Decoration Billing System
                  </span>
                  <a
                    href="https://sai-decoration-billing.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    https://sai-decoration-billing.netlify.app/
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Internal billing, invoices, and accounting utility deployed for shop management.
                  </p>
                </div>
                <a href="https://sai-decoration-billing.netlify.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Launch Billing
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts to Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" onClick={() => setActiveTab('bookings')}>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
                <Calendar className="w-4 h-4" />
                Event Bookings Schedule
              </div>
              <p className="text-[11px] text-slate-500">
                Track event dates, venues, advance payments, and outstanding balances.
              </p>
            </Card>

            <Card className="p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" onClick={() => setActiveTab('customers')}>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
                <Users className="w-4 h-4" />
                Customer & Client Directory
              </div>
              <p className="text-[11px] text-slate-500">
                Directory of repeat clients, contact numbers, addresses, and order histories.
              </p>
            </Card>

            <Card className="p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" onClick={() => setActiveTab('equipment')}>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
                <Box className="w-4 h-4" />
                Generator & Equipment Rentals
              </div>
              <p className="text-[11px] text-slate-500">
                Monitor silent generator rentals, fuel capacities, meter hours, and stage truss inventory.
              </p>
            </Card>

            <Card className="p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" onClick={() => setActiveTab('quotes')}>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                Client Quotation Generator
              </div>
              <p className="text-[11px] text-slate-500">
                Generate itemized decoration package quotations with discounts, GST, and printable formats.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings */}
      {activeTab === 'bookings' && (
        <BookingsManager bookings={bookings} customers={customers} onRefresh={loadData} />
      )}

      {/* Tab 3: Customers */}
      {activeTab === 'customers' && (
        <CustomersManager customers={customers} onRefresh={loadData} />
      )}

      {/* Tab 4: Equipment */}
      {activeTab === 'equipment' && (
        <EquipmentManager equipment={equipment} onRefresh={loadData} />
      )}

      {/* Tab 5: Quotations */}
      {activeTab === 'quotes' && (
        <QuotesManager quotes={quotes} onRefresh={loadData} />
      )}
    </div>
  );
};
