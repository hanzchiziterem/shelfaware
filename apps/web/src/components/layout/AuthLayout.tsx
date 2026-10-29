import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const AuthLayout: React.FC = () => {
  const { settings } = useSettingsStore();
  const brandName = settings?.branding.productName || 'ShelfAware';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">{brandName}</span>
        </Link>
        <p className="text-xs text-slate-500">Retail Point of Sale & Smart Inventory Management</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card border border-slate-200 rounded-[var(--radius-card)] sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

