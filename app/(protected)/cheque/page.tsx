'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cheque } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileCheck, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ChequePage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [depositedCheque, setDepositedCheque] = useState<Cheque | null>(null);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [fetchingCheques, setFetchingCheques] = useState(false);

  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    setFetchingCheques(true);
    try {
      const response = await apiClient.getCheques();
      if (response.success && response.data) {
        setCheques(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch cheques:', err);
    } finally {
      setFetchingCheques(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.depositCheque(Number(amount));
      if (response.success && response.data) {
        setDepositedCheque(response.data);
        setSuccess(true);
        setAmount('');
        // Refresh cheque list
        await fetchCheques();
      } else {
        setError(response.error || 'Failed to deposit cheque');
      }
    } catch (err) {
      setError('Failed to deposit cheque');
    } finally {
      setLoading(false);
    }
  };

  const getChequeStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Cleared':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Bounced':
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileCheck className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChequeStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Cleared':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'Bounced':
      case 'Cancelled':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cheque Deposit</h1>
        <p className="mt-2 text-muted-foreground">
          Deposit your cheques online and track their status
        </p>
      </div>

      {/* Deposit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit New Cheque</CardTitle>
          <CardDescription>
            Enter cheque details to deposit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && depositedCheque && (
              <div className="rounded-md bg-green-500/10 p-4 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-600">
                      Cheque deposited successfully!
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <strong>Cheque Number:</strong> {depositedCheque.chequeNumber}
                      </p>
                      <p>
                        <strong>Amount:</strong> {formatCurrency(depositedCheque.amount)}
                      </p>
                      <p>
                        <strong>Expected Clearance:</strong>{' '}
                        {formatDate(depositedCheque.expectedClearanceDate)}
                      </p>
                      <p className="text-muted-foreground">
                        Typically clears in 3 business days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Cheque Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Deposit Cheque
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cheque List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Cheques</CardTitle>
              <CardDescription>
                Track the status of your deposited cheques
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCheques}
              disabled={fetchingCheques}
            >
              {fetchingCheques ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingCheques ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cheques.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No cheques deposited yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cheques.map((cheque) => (
                <div
                  key={cheque.chequeNumber}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="rounded-full bg-muted p-3">
                    {getChequeStatusIcon(cheque.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{cheque.chequeNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(cheque.expectedClearanceDate)}
                        </p>
                      </div>
                      {getChequeStatusBadge(cheque.status)}
                    </div>
                    <p className="mt-1 text-lg font-bold">
                      {formatCurrency(cheque.amount)}
                    </p>
                    {cheque.status === 'Processing' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expected clearance: {formatDate(cheque.expectedClearanceDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Cheque Deposits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Processing Time:</strong> Cheques typically take 3 business days to clear.
          </p>
          <p>
            <strong>Status Updates:</strong>
          </p>
          <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
            <li><strong>Processing:</strong> Cheque is being verified</li>
            <li><strong>Cleared:</strong> Amount credited to your account</li>
            <li><strong>Bounced:</strong> Insufficient funds in drawer's account</li>
            <li><strong>Cancelled:</strong> Cheque was cancelled by you</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
