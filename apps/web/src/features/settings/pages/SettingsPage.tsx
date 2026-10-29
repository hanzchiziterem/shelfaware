import React, { useEffect, useState } from 'react';
import { Store, Palette, Receipt, Sliders, Check } from 'lucide-react';
import { useSettingsStore } from '../../../store/settingsStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export const SettingsPage: React.FC = () => {
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'pos' | 'inventory'>('branding');
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [productName, setProductName] = useState('');
  const [brandColor, setBrandColor] = useState('');
  const [sidebarBg, setSidebarBg] = useState('');
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'relaxed'>('compact');
  const [borderRadius, setBorderRadius] = useState('6px');
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business.name);
      setPhone(settings.business.phone);
      setAddress(settings.business.address);
      setProductName(settings.branding.productName);
      setBrandColor(settings.branding.brandColor);
      setSidebarBg(settings.branding.sidebarBg);
      setTableDensity(settings.branding.tableDensity);
      setBorderRadius(settings.branding.borderRadius);
      setReceiptHeader(settings.pos.receiptHeader);
      setReceiptFooter(settings.pos.receiptFooter);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      business: {
        ...(settings?.business as any),
        name: businessName,
        phone,
        address,
      },
      branding: {
        productName,
        brandColor,
        sidebarBg,
        tableDensity,
        fontFamily: settings?.branding.fontFamily || 'Inter',
        borderRadius,
      },
      pos: {
        ...(settings?.pos as any),
        receiptHeader,
        receiptFooter,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const brandColorPresets = [
    { name: 'Enterprise Slate (Default)', value: '#0F172A' },
    { name: 'Emerald Grocery', value: '#059669' },
    { name: 'Indigo Enterprise', value: '#4338CA' },
    { name: 'Deep Navy', value: '#0A0F1D' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & SaaS White-Label Customization"
        description="Adapt brand identity, theme tokens, store profile, and POS receipt layouts live."
        actions={
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            leftIcon={isSaved ? <Check className="w-4 h-4" /> : undefined}
          >
            {isSaved ? 'Changes Applied!' : 'Save & Apply Live'}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'branding', label: 'Branding & Design System', icon: Palette },
          { id: 'profile', label: 'Store Business Profile', icon: Store },
          { id: 'pos', label: 'POS & Receipt Rules', icon: Receipt },
          { id: 'inventory', label: 'Inventory Rules', icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors select-none ${
                activeTab === t.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Branding & Appearance */}
      {activeTab === 'branding' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>White-Label Brand & Visual Tokens</CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SaaS Product Brand Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. ShelfAware or Mate"
              helperText="Appears on sidebar branding and top header."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Brand Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-slate-300 p-0.5"
                />
                <select
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 h-9 text-xs border border-slate-300 rounded px-2"
                >
                  {brandColorPresets.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Table Density Preference
              </label>
              <Select
                value={tableDensity}
                onChange={(e) => setTableDensity(e.target.value as any)}
              >
                <option value="compact">Compact (36px row height - maximum data density)</option>
                <option value="normal">Normal (42px row height - standard enterprise)</option>
                <option value="relaxed">Relaxed (50px row height - comfortable)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Control Border Radius
              </label>
              <Select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
              >
                <option value="4px">Subtle / Enterprise (4px)</option>
                <option value="6px">Standard (6px - Default)</option>
                <option value="10px">Smooth (10px)</option>
              </Select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            ✨ Changes saved here update the CSS design tokens live across all tables, buttons, and navigation bars immediately.
          </div>
        </Card>
      )}

      {/* Tab: Business Profile */}
      {activeTab === 'profile' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Physical Store Details</CardTitle>
          </CardHeader>
          <Input label="Store Trading Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <Input label="Store Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Store Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Base Currency" value="Nigerian Naira (NGN - ₦)" disabled />
            <Input label="Locale" value="en-NG (Nigeria)" disabled />
          </div>
        </Card>
      )}

      {/* Tab: POS & Receipts */}
      {activeTab === 'pos' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Thermal Receipt Configuration (80mm)</CardTitle>
          </CardHeader>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Header Lines
            </label>
            <textarea
              rows={2}
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full text-xs font-mono border border-slate-300 rounded p-2 focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Footer Note
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full text-xs font-mono border border-slate-300 rounded p-2 focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </Card>
      )}

      {/* Tab: Inventory Rules */}
      {activeTab === 'inventory' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Inventory Automation Thresholds</CardTitle>
          </CardHeader>
          <Input label="Default Low-Stock Warning Threshold" type="number" defaultValue={5} />
          <Input label="Perishable Expiry Notice (Days in advance)" type="number" defaultValue={30} />
        </Card>
      )}
    </div>
  );
};
