'use client';

import * as React from 'react';
import { useFetch } from '@/hooks/use-fetch';
import type { Bill } from '@spendflow/shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  PartyPopper,
  Building2,
  Calendar,
  Tag,
} from 'lucide-react';

interface ApprovalsResponse {
  data: Bill[];
  total: number;
}

export default function ApprovalsPage() {
  const { data: response, error, isLoading, refetch } = useFetch<ApprovalsResponse>('/api/approvals');
  const data = response?.data;
  const { addToast } = useToast();
  const [pendingBills, setPendingBills] = React.useState<Bill[]>([]);
  const [rejectBill, setRejectBill] = React.useState<Bill | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState('');
  const [processing, setProcessing] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (data) {
      setPendingBills(data);
    }
  }, [data]);

  async function handleApprove(bill: Bill) {
    setProcessing((prev) => new Set(prev).add(bill.id));

    // Optimistic update
    setPendingBills((prev) => prev.filter((b) => b.id !== bill.id));

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: bill.id, action: 'Approved' }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      addToast({
        title: 'Bill approved',
        description: `${bill.vendorName} — ${formatCurrency(bill.totalAmount)}`,
        variant: 'success',
      });
    } catch {
      // Rollback
      setPendingBills((prev) => [...prev, bill]);
      addToast({
        title: 'Approval failed',
        description: 'Could not approve the bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(bill.id);
        return next;
      });
    }
  }

  async function handleReject() {
    if (!rejectBill) return;
    if (!rejectReason.trim()) {
      setReasonError('Reason is required when rejecting a bill');
      return;
    }

    setProcessing((prev) => new Set(prev).add(rejectBill.id));
    const billToReject = rejectBill;

    // Optimistic update
    setPendingBills((prev) => prev.filter((b) => b.id !== billToReject.id));
    setRejectBill(null);
    setRejectReason('');
    setReasonError('');

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: billToReject.id,
          action: 'Rejected',
          reason: rejectReason.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      addToast({
        title: 'Bill rejected',
        description: `${billToReject.vendorName} has been rejected`,
        variant: 'info',
      });
    } catch {
      // Rollback
      setPendingBills((prev) => [...prev, billToReject]);
      addToast({
        title: 'Rejection failed',
        description: 'Could not reject the bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(billToReject.id);
        return next;
      });
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="text-destructive h-12 w-12" />
        <p className="text-muted-foreground text-lg">Failed to load approvals</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingBills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="bg-success/10 flex h-20 w-20 items-center justify-center rounded-full">
          <PartyPopper className="text-success h-10 w-10" />
        </div>
        <h2 className="text-xl font-semibold">All caught up!</h2>
        <p className="text-muted-foreground text-center">
          No bills waiting for your approval right now.
          <br />
          Check back later or head to the dashboard.
        </p>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          {pendingBills.length} bill{pendingBills.length !== 1 ? 's' : ''} awaiting your approval
        </p>

        {pendingBills.map((bill) => (
          <Card
            key={bill.id}
            className="transition-all hover:shadow-md"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{bill.vendorName}</h3>
                    <Badge variant="outline" className="text-xs">
                      {bill.invoiceNumber}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(bill.totalAmount)}</p>
                  <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {bill.vendorGstin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {formatDate(bill.dueDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {bill.category}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(bill)}
                    disabled={processing.has(bill.id)}
                    size="sm"
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRejectBill(bill)}
                    disabled={processing.has(bill.id)}
                    size="sm"
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectBill}
        onOpenChange={(open) => {
          if (!open) {
            setRejectBill(null);
            setRejectReason('');
            setReasonError('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Bill</DialogTitle>
            <DialogDescription>
              {rejectBill &&
                `Rejecting ${rejectBill.vendorName} — ${formatCurrency(rejectBill.totalAmount)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (e.target.value.trim()) setReasonError('');
              }}
              className={reasonError ? 'border-destructive' : ''}
              rows={4}
            />
            {reasonError && (
              <p className="text-destructive text-sm">{reasonError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectBill(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
