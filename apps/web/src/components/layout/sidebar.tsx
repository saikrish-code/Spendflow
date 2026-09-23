'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Receipt,
  Settings,
  Menu,
  X,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Bills', icon: FileText },
  { href: '/approvals', label: 'Approvals', icon: CheckCircle2 },
  { href: '/reimbursements', label: 'Reimbursements', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile header bar */}
      <div className="bg-background/95 border-border/40 fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Wallet className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-lg font-bold">SpendFlow</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg shadow-sm">
            <Wallet className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">SpendFlow</h1>
            <p className="text-muted-foreground text-[11px]">Finance Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="bg-primary ml-auto h-1.5 w-1.5 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-sidebar-border space-y-3 border-t p-4">
          <ThemeToggle />
          <div className="flex items-center gap-3 px-1">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Priya Sharma</p>
              <p className="text-muted-foreground truncate text-xs">Finance Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <div className="bg-background/95 border-border/40 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md md:hidden">
        <nav className="flex items-center justify-around py-1" role="navigation" aria-label="Mobile navigation">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
