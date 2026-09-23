'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReimbursementCreateSchema } from '@spendflow/shared/schemas';
import type { Reimbursement, ReimbursementCreate } from '@spendflow/shared/types';
import { useFetch } from '@/hooks/use-fetch';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Upload,
  Send,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  Loader2,
} from 'lucide-react';

const categories = [
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Training',
  'Equipment',
  'Other',
] as const;

function statusBadgeVariant(status: string) {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
    Pending: 'warning',
    Approved: 'default',
    Rejected: 'destructive',
    Paid: 'success',
  };
  return map[status] ?? 'secondary';
}

interface ReimbursementsResponse {
  data: Reimbursement[];
  total: number;
}

export default function ReimbursementsPage() {
  const { data: response, error, isLoading, refetch } = useFetch<ReimbursementsResponse>('/api/reimbursements');
  const reimbursements = response?.data;
  const { addToast } = useToast();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReimbursementCreate>({
    resolver: zodResolver(ReimbursementCreateSchema),
    defaultValues: {
      employeeName: '',
      employeeEmail: '',
      amount: undefined,
      description: '',
      category: undefined,
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: 'File too large',
          description: 'Receipt must be under 5MB',
          variant: 'destructive',
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue('receiptUrl', file.name);
    }
  }

  async function onSubmit(data: ReimbursementCreate) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/reimbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Submission failed');
      }

      addToast({
        title: 'Reimbursement submitted',
        description: `Your claim for ${formatCurrency(data.amount)} has been submitted`,
        variant: 'success',
      });
      reset();
      setPreviewUrl(null);
      refetch();
    } catch (err) {
      addToast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Submission Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>New Reimbursement</CardTitle>
          <CardDescription>Submit a new expense claim</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                placeholder="Your full name"
                {...register('employeeName')}
                aria-invalid={!!errors.employeeName}
              />
              {errors.employeeName && (
                <p className="text-destructive text-sm">{errors.employeeName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeEmail">Email</Label>
              <Input
                id="employeeEmail"
                type="email"
                placeholder="you@spendflow.in"
                {...register('employeeEmail')}
                aria-invalid={!!errors.employeeEmail}
              />
              {errors.employeeEmail && (
                <p className="text-destructive text-sm">{errors.employeeEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                {...register('amount', { valueAsNumber: true })}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-destructive text-sm">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(val) => setValue('category', val as ReimbursementCreate['category'])}
              >
                <SelectTrigger id="category" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the expense (min 10 characters)"
                rows={3}
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt (optional)</Label>
              <div className="border-border hover:border-primary/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors">
                <input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="receipt" className="cursor-pointer text-center">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="mx-auto h-24 w-24 rounded-lg object-cover"
                      />
                      <p className="text-primary text-xs">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-muted-foreground mx-auto h-8 w-8" />
                      <p className="text-muted-foreground mt-1 text-sm">
                        Click to upload receipt
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG or PDF up to 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Claim
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reimbursements List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Your Claims</CardTitle>
          <CardDescription>Track submitted reimbursements</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <AlertCircle className="text-destructive h-8 w-8" />
              <p className="text-muted-foreground text-sm">Failed to load claims</p>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : reimbursements && reimbursements.length > 0 ? (
            <div className="space-y-2">
              {reimbursements.map((r) => (
                <div
                  key={r.id}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
                >
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                    {r.receiptUrl ? (
                      <ImageIcon className="text-muted-foreground h-5 w-5" />
                    ) : (
                      <span className="text-muted-foreground text-xs font-bold">
                        {r.category.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {r.employeeName} · {formatDate(r.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(r.amount)}
                    </p>
                    <Badge variant={statusBadgeVariant(r.status)} className="mt-0.5 text-[10px]">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No reimbursements yet. Submit your first claim!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
