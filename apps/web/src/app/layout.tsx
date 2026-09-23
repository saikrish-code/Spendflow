import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { AppSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SpendFlow — AI-Powered Spend Management',
    template: '%s | SpendFlow',
  },
  description:
    'Manage bills, approvals, reimbursements, and cashflow with SpendFlow — the intelligent finance dashboard for modern teams.',
  keywords: ['spend management', 'finance dashboard', 'bills', 'approvals', 'cashflow'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-full font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex flex-1 flex-col md:pl-64">
                <Header />
                <main id="main-content" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
                  {children}
                </main>
                {/* Spacer for mobile bottom nav */}
                <div className="h-16 md:hidden" />
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
