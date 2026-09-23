'use client';

import * as React from 'react';
import type { Bill } from '@spendflow/shared/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Building2, Calendar, FileText, Hash, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface BillDetailSheetProps {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const statusTimeline = [
  { status: 'Draft', icon: FileText, label: 'Created' },
  { status: 'Pending Approval', icon: Clock, label: 'Submitted for Approval' },
  { status: 'Approved', icon: CheckCircle2, label: 'Approved' },
  { status: 'Scheduled', icon: Calendar, label: 'Payment Scheduled' },
  { status: 'Paid', icon: CheckCircle2, label: 'Payment Completed' },
];

export function BillDetailSheet({ bill, open, onOpenChange }: BillDetailSheetProps) {
  if (!bill) return null;

  const statusIndex = statusTimeline.findIndex((s) => s.status === bill.status);
  const isRejected = bill.status === 'Rejected';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between pr-8">
            <div>
              <SheetTitle>{bill.vendorName}</SheetTitle>
              <SheetDescription>{bill.invoiceNumber}</SheetDescription>
            </div>
            <Badge variant={statusBadgeVariant(bill.status)}>{bill.status}</Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6">
          {/* Amount section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-xs">Subtotal</p>
                <p className="text-sm font-semibold">{formatCurrency(bill.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">GST (18%)</p>
                <p className="text-sm font-semibold">{formatCurrency(bill.gstAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="text-lg font-bold">{formatCurrency(bill.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="grid gap-3">
              <DetailRow icon={Building2} label="Vendor GSTIN" value={bill.vendorGstin} />
              <DetailRow icon={Calendar} label="Due Date" value={formatDate(bill.dueDate)} />
              <DetailRow icon={Hash} label="Category" value={bill.category} />
              <DetailRow icon={User} label="Approver" value={bill.approver} />
              <DetailRow icon={FileText} label="Created" value={formatDate(bill.createdAt)} />
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Line Items</h3>
            <div className="rounded-lg border">
              <div className="border-b px-3 py-2">
                <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>
              </div>
              {bill.lineItems.map((item) => (
                <div key={item.id} className="border-b last:border-0 px-3 py-2">
                  <div className="grid grid-cols-12 text-sm">
                    <span className="col-span-6 truncate">{item.description}</span>
                    <span className="col-span-2 text-right tabular-nums">{item.quantity}</span>
                    <span className="col-span-2 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="col-span-2 text-right font-medium tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Approval Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Approval Timeline</h3>
            <div className="space-y-0">
              {isRejected ? (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Rejected</p>
                    <p className="text-muted-foreground text-xs">
                      by {bill.approver} · {formatDate(bill.updatedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                statusTimeline.map((step, index) => {
                  const isCompleted = index <= statusIndex;
                  const isCurrent = index === statusIndex;
                  return (
                    <div key={step.status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-primary/10'
                              : 'bg-muted'
                          }`}
                        >
                          <step.icon
                            className={`h-4 w-4 ${
                              isCompleted ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        {index < statusTimeline.length - 1 && (
                          <div
                            className={`w-px flex-1 ${
                              isCompleted ? 'bg-primary/30' : 'bg-border'
                            }`}
                            style={{ minHeight: '24px' }}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent ? '' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCompleted && (
                          <p className="text-muted-foreground text-xs">
                            {index === 0
                              ? formatDate(bill.createdAt)
                              : formatDate(bill.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {bill.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Notes</h3>
                <p className="text-muted-foreground text-sm">{bill.notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
      <span className="text-muted-foreground min-w-[100px]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
