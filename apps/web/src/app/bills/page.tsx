'use client';

import * as React from 'react';
import { useFetch } from '@/hooks/use-fetch';
import type { Bill } from '@spendflow/shared/types';
import { BillsDataTable } from './bills-data-table';
import { BillDetailSheet } from './bill-detail-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillsResponse {
  data: Bill[];
  total: number;
  page: number;
  pageSize: number;
}

export default function BillsPage() {
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null);
  const bills = useFetch<BillsResponse>('/api/bills?pageSize=100');

  if (bills.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="text-destructive h-12 w-12" />
        <p className="text-muted-foreground text-lg">Failed to load bills</p>
        <p className="text-muted-foreground text-sm">{bills.error}</p>
        <Button onClick={bills.refetch} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  if (bills.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <div className="flex gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </div>
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b p-4">
              <Skeleton className="h-4 w-4" />
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <BillsDataTable
        data={bills.data?.data ?? []}
        onRowClick={setSelectedBill}
        onRefresh={bills.refetch}
      />
      <BillDetailSheet
        bill={selectedBill}
        open={!!selectedBill}
        onOpenChange={(open) => {
          if (!open) setSelectedBill(null);
        }}
      />
    </>
  );
}
