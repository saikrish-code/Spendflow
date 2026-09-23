'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import type { Bill } from '@spendflow/shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowUpDown,
  Search,
  Download,
  CheckCircle2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const statusOptions = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Scheduled',
  'Paid',
  'Rejected',
] as const;

const categoryOptions = [
  'Software',
  'Office Supplies',
  'Marketing',
  'Travel',
  'Utilities',
  'Professional Services',
  'Hardware',
  'Telecommunications',
] as const;

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

interface BillsDataTableProps {
  data: Bill[];
  onRowClick: (bill: Bill) => void;
  onRefresh: () => void;
}

export function BillsDataTable({ data, onRowClick, onRefresh }: BillsDataTableProps) {
  const { addToast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  const filteredData = React.useMemo(() => {
    let result = data;
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((b) => b.category === categoryFilter);
    }
    return result;
  }, [data, statusFilter, categoryFilter]);

  const columns: ColumnDef<Bill>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'vendorName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Vendor
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.vendorName}</p>
            <p className="text-muted-foreground text-xs">{row.original.invoiceNumber}</p>
          </div>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-semibold tabular-nums">
            {formatCurrency(row.original.totalAmount)}
          </div>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{formatDate(row.original.dueDate)}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-normal">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.status)} className="text-xs">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'approver',
        header: 'Approver',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.approver}</span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRowClick(row.original)}>
                View details
              </DropdownMenuItem>
              {row.original.status === 'Pending Approval' && (
                <DropdownMenuItem
                  onClick={() => handleApprove([row.original.id])}
                >
                  Approve
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onRowClick]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  async function handleApprove(billIds: string[]) {
    try {
      await Promise.all(
        billIds.map((billId) =>
          fetch('/api/approvals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billId, action: 'Approved' }),
          })
        )
      );
      addToast({
        title: 'Bills approved',
        description: `${billIds.length} bill(s) approved successfully`,
        variant: 'success',
      });
      setRowSelection({});
      onRefresh();
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to approve bills. Please try again.',
        variant: 'destructive',
      });
    }
  }

  function handleExportCsv() {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

    const headers = ['ID', 'Vendor', 'Invoice', 'Amount', 'GST', 'Total', 'Due Date', 'Category', 'Status', 'Approver'];
    const csvContent = [
      headers.join(','),
      ...rowsToExport.map((row) => {
        const b = row.original;
        return [b.id, `"${b.vendorName}"`, b.invoiceNumber, b.amount, b.gstAmount, b.totalAmount, b.dueDate, b.category, b.status, b.approver].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `spendflow-bills-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    addToast({
      title: 'CSV exported',
      description: `${rowsToExport.length} bills exported`,
      variant: 'success',
    });
  }

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || globalFilter !== '';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search vendors, invoices..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
              aria-label="Search bills"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by category">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setGlobalFilter('');
              }}
              className="h-9"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              size="sm"
              onClick={() => {
                const selectedBillIds = table
                  .getFilteredSelectedRowModel()
                  .rows.filter((r) => r.original.status === 'Pending Approval')
                  .map((r) => r.original.id);
                if (selectedBillIds.length > 0) {
                  handleApprove(selectedBillIds);
                }
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve ({selectedCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="cursor-pointer"
                  onClick={(e) => {
                    // Don't open sheet if clicking checkbox or action button
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('[role="checkbox"]') ||
                      target.closest('[data-slot="dropdown-menu-trigger"]') ||
                      target.closest('button')
                    ) {
                      return;
                    }
                    onRowClick(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground space-y-1">
                    <p className="font-medium">No bills found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          {selectedCount > 0 ? `${selectedCount} of ` : ''}
          {table.getFilteredRowModel().rows.length} bill(s)
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
