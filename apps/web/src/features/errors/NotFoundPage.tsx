import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PATHS } from '../../router/paths';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6">
        The register or workspace page you requested does not exist or may have been relocated.
      </p>
      <Link to={PATHS.DASHBOARD}>
        <Button size="sm" leftIcon={<Home className="w-4 h-4" />}>
          Back to Overview
        </Button>
      </Link>
    </div>
  );
};

