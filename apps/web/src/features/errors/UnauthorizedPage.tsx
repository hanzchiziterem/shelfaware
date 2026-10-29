import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PATHS } from '../../router/paths';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6">
        Your current staff role does not possess permissions to view this administrative view.
      </p>
      <Link to={PATHS.POS}>
        <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to POS Register
        </Button>
      </Link>
    </div>
  );
};

