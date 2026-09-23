'use client';

import * as React from 'react';
import {
  IndianRupee,
  CalendarClock,
  ClipboardCheck,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { useFetch } from '@/hooks/use-fetch';
import type { Bill, CashflowEntry } from '@spendflow/shared/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const CashflowChart = dynamic(() => import('./cashflow-chart'), { ssr: false });
const SpendByCategoryChart = dynamic(() => import('./spend-by-category-chart'), { ssr: false });

interface BillsResponse {
  data: Bill[];
  total: number;
}

interface CashflowResponse {
  entries: CashflowEntry[];
  summary: { totalActual: number; totalForecast: number; netCashflow: number };
}

function statusBadgeVariant(status: string) {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
    Draft: 'secondary',
    'Pending Approval': 'warning',
    Approved: 'default',
    Scheduled: 'outline',
    Paid: 'success',
    Rejected: 'destructive',
  };
  return map[status] ?? 'secondary';
}

export default function DashboardPage() {
  const bills = useFetch<BillsResponse>('/api/bills?pageSize=100');
  const cashflow = useFetch<CashflowResponse>('/api/cashflow');

  const allBills = bills.data?.data ?? [];

  // KPI calculations
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  const weekFromNow = now ? new Date(now) : null;
  if (weekFromNow) {
    weekFromNow.setDate(weekFromNow.getDate() + 7);
  }

  const payablesDueThisWeek = allBills
    .filter((b) => {
      if (!now || !weekFromNow) return false;
      const due = new Date(b.dueDate);
      return due >= now && due <= weekFromNow && !['Paid', 'Rejected'].includes(b.status);
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const cashOutThisMonth = allBills
    .filter((b) => b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingApprovals = allBills.filter((b) => b.status === 'Pending Approval').length;

  const openReimbursementsCount = 8; // We'll use static count for KPI

  const upcomingBills = allBills
    .filter((b) => {
      if (!now) return false;
      return new Date(b.dueDate) >= now && !['Paid', 'Rejected'].includes(b.status);
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Spend by category
  const categorySpend = allBills
    .filter((b) => b.status === 'Paid')
    .reduce(
      (acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.totalAmount;
        return acc;
      },
      {} as Record<string, number>
    );

  const categoryData = Object.entries(categorySpend)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const isLoading = bills.isLoading || cashflow.isLoading;
  const error = bills.error || cashflow.error;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="text-destructive h-12 w-12" />
        <p className="text-muted-foreground text-lg">Failed to load dashboard data</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          onClick={() => {
            bills.refetch();
            cashflow.refetch();
          }}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Payables Due This Week',
      value: formatCurrency(payablesDueThisWeek),
      icon: CalendarClock,
      trend: '+12%',
      trendUp: true,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
    },
    {
      title: 'Cash Out This Month',
      value: formatCurrency(cashOutThisMonth),
      icon: IndianRupee,
      trend: '-5%',
      trendUp: false,
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      title: 'Pending Approvals',
      value: String(pendingApprovals),
      icon: ClipboardCheck,
      trend: '+3',
      trendUp: true,
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
    },
    {
      title: 'Open Reimbursements',
      value: String(openReimbursementsCount),
      icon: Receipt,
      trend: '−2',
      trendUp: false,
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">{kpi.title}</p>
                      <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                    </div>
                    <div className={`${kpi.bg} rounded-lg p-2.5`}>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs">
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-chart-1" />
                    )}
                    <span className={kpi.trendUp ? 'text-success' : 'text-chart-1'}>
                      {kpi.trend}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow Chart (2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cashflow — 30 Day View</CardTitle>
            <CardDescription>Actual spend vs forecasted outflow</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <CashflowChart entries={cashflow.data?.entries ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Spend by Category (1/3) */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Paid bills breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <SpendByCategoryChart data={categoryData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Next 5 bills due</CardDescription>
          </div>
          <Link href="/bills">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : upcomingBills.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No upcoming payments
            </p>
          ) : (
            <div className="space-y-1">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="hover:bg-muted/50 flex items-center gap-4 rounded-lg p-3 transition-colors"
                >
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                    {bill.vendorName
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{bill.vendorName}</p>
                    <p className="text-muted-foreground text-xs">
                      Due {formatRelativeDate(bill.dueDate)} · {bill.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(bill.totalAmount)}</p>
                    <Badge variant={statusBadgeVariant(bill.status)} className="mt-0.5 text-[10px]">
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
