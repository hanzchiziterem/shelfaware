import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import { useReportStore } from '../../../store/reportStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SalesChart } from '../../dashboard/components/SalesChart';
import { formatNaira } from '../../../utils/currency';

export const ReportsPage: React.FC = () => {
  const { salesSummary, inventoryValuation, fetchReports } = useReportStore();
  const { weeklySales, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchReports();
    fetchDashboardData();
  }, [fetchReports, fetchDashboardData]);

  const handleExport = () => {
    alert('Simulating report export: Sales_Report_October_2026.csv downloaded.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Financial Analytics"
        description="Monitor sales revenue, gross profit margins, inventory valuation, and payment performance."
        actions={
          <Button size="sm" variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV Report
          </Button>
        }
      />

      {/* Valuation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Inventory Cost Value
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {formatNaira(inventoryValuation?.totalCostValue || 0)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Procurement cost basis</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Retail Stock Value
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {formatNaira(inventoryValuation?.totalRetailValue || 0)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated selling value</span>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Potential Gross Profit
          </span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            {formatNaira(inventoryValuation?.potentialGrossProfit || 0)}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Retail minus cost</span>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Avg. Order Value (AOV)
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {formatNaira(salesSummary?.averageOrderValue || 0)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Per completed transaction</span>
        </Card>
      </div>

      {/* Revenue & Profit Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales & Profit Analysis</CardTitle>
        </CardHeader>
        <SalesChart data={weeklySales} />
      </Card>
    </div>
  );
};
