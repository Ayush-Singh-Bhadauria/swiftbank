'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Balance, Account } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccountSummary() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, accountRes] = await Promise.all([
          apiClient.getBalance(),
          apiClient.getAccount(),
        ]);

        if (balanceRes.success && balanceRes.data) {
          setBalance(balanceRes.data);
        }
        if (accountRes.success && accountRes.data) {
          setAccount(accountRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Account Balance</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {showBalance && balance
                  ? formatCurrency(balance.balance)
                  : '₹ ••••••'}
              </p>
              <p className="text-sm text-muted-foreground">
                {balance?.type || 'Savings'} Account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="text-lg font-semibold">
                {account?.accountNumber || balance?.accountNumber || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {account?.ifsc && `IFSC: ${account.ifsc}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
