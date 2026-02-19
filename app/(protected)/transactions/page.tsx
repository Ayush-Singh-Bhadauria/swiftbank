'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { Transaction, TransactionFilter } from '@/lib/types';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilter>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTransactions();
      if (response.success && response.data) {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: TransactionFilter) => {
    setFilters(newFilters);
    applyFilters(newFilters, searchTerm);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    applyFilters(filters, search);
  };

  const applyFilters = (appliedFilters: TransactionFilter, search: string) => {
    let filtered = transactions;

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filter
    if (appliedFilters.type) {
      filtered = filtered.filter((tx) => tx.type === appliedFilters.type);
    }

    // Apply status filter
    if (appliedFilters.status) {
      filtered = filtered.filter((tx) => tx.status === appliedFilters.status);
    }

    setFilteredTransactions(filtered);
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing transactions...');
    await fetchTransactions();
    toast.dismiss();
    toast.success('Transactions refreshed');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-pretty text-3xl font-bold">Transactions</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin' : ''}
            />
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex h-48 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredTransactions.length} transactions</p>
          </div>
          <TransactionTable transactions={filteredTransactions} />
        </>
      )}
    </div>
  );
}
