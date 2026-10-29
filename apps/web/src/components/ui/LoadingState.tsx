import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-6 h-6 animate-spin text-slate-500 mb-2" />
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
};

