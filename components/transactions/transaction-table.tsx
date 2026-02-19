'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.transactionId} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-2 ${
                  transaction.type === 'CREDIT'
                    ? 'bg-green-500/10'
                    : 'bg-red-500/10'
                }`}
              >
                {transaction.type === 'CREDIT' ? (
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.description || transaction.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(transaction.timestamp)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {transaction.transactionId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-semibold ${
                  transaction.type === 'CREDIT'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'CREDIT' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <Badge
                variant={
                  transaction.status === 'SUCCESS'
                    ? 'default'
                    : transaction.status === 'PENDING'
                    ? 'secondary'
                    : 'destructive'
                }
                className="mt-1"
              >
                {transaction.status}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
