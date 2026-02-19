'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type TransferStep = 'amount' | 'otp' | 'complete';

export default function TransferPage() {
  const [step, setStep] = useState<TransferStep>('amount');
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  const handleGenerateOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.generateOTP();
      if (response.success && response.data) {
        setGeneratedOtp(response.data.data?.otp || '');
        setStep('otp');
      } else {
        setError(response.error || 'Failed to generate OTP');
      }
    } catch (err) {
      setError('Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // First check balance
      const balanceResponse = await apiClient.getBalance();
      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data.balance);
        
        if (balanceResponse.data.balance < Number(amount)) {
          setError(`Insufficient balance. Available: ${formatCurrency(balanceResponse.data.balance)}`);
          setLoading(false);
          return;
        }
      }

      // Initiate transfer
      const response = await apiClient.initiateTransfer(Number(amount));
      if (response.success) {
        // Generate OTP
        await handleGenerateOtp();
      } else {
        setError(response.error || 'Failed to initiate transfer');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to initiate transfer');
      setLoading(false);
    }
  };

  const handleCompleteTransfer = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.completeTransfer(otp, Number(amount));
      if (response.success && response.data) {
        setTransactionId(response.data.data?.transactionId || '');
        setSuccess(true);
        setStep('complete');
      } else {
        setError(response.error || 'Invalid OTP or transfer failed');
      }
    } catch (err) {
      setError('Failed to complete transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('amount');
    setAmount('');
    setOtp('');
    setGeneratedOtp('');
    setError('');
    setSuccess(false);
    setTransactionId('');
    setBalance(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Transfer Money</h1>
          <p className="mt-2 text-muted-foreground">
            Secure OTP-based fund transfer
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'amount'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </div>
            <span className="text-sm">Amount</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'otp'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </div>
            <span className="text-sm">OTP</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === 'complete'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </div>
            <span className="text-sm">Complete</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Enter Amount */}
        {step === 'amount' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Transfer Amount</CardTitle>
              <CardDescription>
                Enter the amount you want to transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {balance !== null && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleInitiateTransfer}
                disabled={loading || !amount}
              >
                {loading ? 'Processing...' : 'Continue to OTP'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle>Verify OTP</CardTitle>
              <CardDescription>
                Enter the OTP to complete the transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Transfer Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(Number(amount))}</p>
              </div>
              {generatedOtp && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-sm text-green-600 mb-1">
                    <strong>Demo OTP Generated:</strong>
                  </p>
                  <p className="text-3xl font-mono font-bold text-green-600 tracking-wider">
                    {generatedOtp}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    In production, this would be sent via SMS/Email
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCompleteTransfer}
                disabled={loading || !otp}
              >
                {loading ? 'Verifying...' : 'Complete Transfer'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'complete' && success && (
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle>Transfer Successful!</CardTitle>
                <CardDescription>
                  Your money has been transferred successfully
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatCurrency(Number(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm text-green-600 font-semibold">SUCCESS</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleReset}>
                Make Another Transfer
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
