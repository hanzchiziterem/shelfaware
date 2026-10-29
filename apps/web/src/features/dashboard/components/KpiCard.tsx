import React from 'react';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const iconColors = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border border-rose-100',
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 block">
            {value}
          </span>
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0', iconColors[variant])}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={cn(
                'font-bold inline-flex items-center gap-0.5',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};

