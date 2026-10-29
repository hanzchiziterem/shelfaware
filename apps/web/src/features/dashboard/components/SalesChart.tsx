import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatNaira } from '../../../utils/currency';

interface SalesChartProps {
  data: Array<{ day: string; revenue: number; profit: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded shadow-lg text-xs font-mono space-y-1">
          <p className="font-bold text-slate-300">{label}</p>
          <p className="text-emerald-400">
            Revenue: {formatNaira(payload[0]?.value)}
          </p>
          <p className="text-blue-400">
            Est. Profit: {formatNaira(payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={customTooltip} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#profitGradient)"
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

