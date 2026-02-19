'use client';

import { useState } from 'react';
import { TransactionFilter, TransactionType, TransactionStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilter) => void;
  onSearchChange: (search: string) => void;
}

export function TransactionFilters({
  onFilterChange,
  onSearchChange,
}: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilter>({});

  const handleTypeChange = (type: string) => {
    const newFilters = {
      ...filters,
      type: type === 'ALL' ? undefined : (type as TransactionType),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = {
      ...filters,
      status: status === 'ALL' ? undefined : (status as TransactionStatus),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search transactions..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
