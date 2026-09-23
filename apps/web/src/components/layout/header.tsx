'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/bills': 'Bills',
  '/approvals': 'Approvals',
  '/reimbursements': 'Reimbursements',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'SpendFlow';

  return (
    <header className="bg-background/95 border-border/40 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-xs">
            {new Intl.DateTimeFormat('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search bills, vendors..."
            className="w-64 pl-9"
            aria-label="Search bills and vendors"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="bg-destructive absolute right-1.5 top-1.5 h-2 w-2 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
