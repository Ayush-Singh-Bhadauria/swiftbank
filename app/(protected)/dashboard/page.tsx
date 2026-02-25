import { Metadata } from 'next';
import { AccountSummary } from '@/components/dashboard/account-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import { Chatbot } from '@/components/dashboard/chatbot';

export const metadata: Metadata = {
  title: 'Dashboard - SwiftBank',
  description: 'Your banking dashboard and account overview',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-pretty text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's your account overview.
        </p>
      </div>

      {/* Account Summary */}
      <AccountSummary />

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Notifications */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NotificationsPanel />
        </div>

        {/* Stats Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold">This Month</h3>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Spending</p>
              <p className="mt-1 text-2xl font-bold">$2,485.30</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Transactions
              </p>
              <p className="mt-1 text-2xl font-bold">24</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Savings Goal
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                67% of $5,000
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}
