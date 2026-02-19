'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('CUST001');
  const [amount, setAmount] = useState('1000');
  const [otp, setOtp] = useState('');

  const addResult = (title: string, data: any) => {
    setResults((prev) => [{ title, data, timestamp: new Date().toISOString() }, ...prev]);
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await fn();
      addResult(name, result);
    } catch (error) {
      addResult(name, { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">BANKMOCK API Test Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Test all banking features connected to your BANKMOCK backend
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Set test parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer ID</label>
                <Input
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="CUST001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">OTP (for transfer)</label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons - Authentication & Profile */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Authentication & Profile Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                onClick={() => runTest('Login', () => 
                  apiClient.loginWithCustomerId(customerId, 'password')
                )}
                disabled={loading}
              >
                Test Login
              </Button>
              <Button
                onClick={() => runTest('Get Profile', () => apiClient.getProfile())}
                disabled={loading}
                variant="outline"
              >
                Get Profile
              </Button>
              <Button
                onClick={() => runTest('Get Account', () => apiClient.getAccount())}
                disabled={loading}
                variant="outline"
              >
                Get Account Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons - Balance & Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Balance & Transaction Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                onClick={() => runTest('Get Balance', () => apiClient.getBalance())}
                disabled={loading}
              >
                Get Balance
              </Button>
              <Button
                onClick={() => runTest('Get Transactions (10)', () => 
                  apiClient.getTransactions({ limit: 10, page: 1 })
                )}
                disabled={loading}
                variant="outline"
              >
                Get Transactions
              </Button>
              <Button
                onClick={() => runTest('Get Statement', () => apiClient.getStatement())}
                disabled={loading}
                variant="outline"
              >
                Get Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons - Transfer Flow */}
        <Card>
          <CardHeader>
            <CardTitle>💸 Transfer Tests (OTP Flow)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                onClick={() => runTest('Generate OTP', () => apiClient.generateOTP())}
                disabled={loading}
              >
                1. Generate OTP
              </Button>
              <Button
                onClick={() => runTest('Initiate Transfer', () => 
                  apiClient.initiateTransfer(Number(amount))
                )}
                disabled={loading}
                variant="outline"
              >
                2. Initiate Transfer
              </Button>
              <Button
                onClick={() => runTest('Complete Transfer', () => 
                  apiClient.completeTransfer(otp, Number(amount))
                )}
                disabled={loading || !otp}
                variant="default"
              >
                3. Complete Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons - Cheque Operations */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Cheque Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                onClick={() => runTest('Deposit Cheque', () => 
                  apiClient.depositCheque(Number(amount))
                )}
                disabled={loading}
              >
                Deposit Cheque
              </Button>
              <Button
                onClick={() => runTest('Get Cheques', () => apiClient.getCheques())}
                disabled={loading}
                variant="outline"
              >
                Get All Cheques
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📊 Test Results</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResults([])}
              >
                Clear Results
              </Button>
            </div>
            <CardDescription>
              {results.length} test{results.length !== 1 ? 's' : ''} executed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tests run yet. Click any button above to test BANKMOCK API.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div key={idx} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{result.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant={result.data.success ? 'default' : 'destructive'}
                      >
                        {result.data.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="rounded bg-muted p-3 overflow-auto">
                      <pre className="text-xs">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Login First:</strong> Click "Test Login" to authenticate with BANKMOCK</p>
            <p><strong>2. Test Features:</strong> Try different API endpoints to see live data</p>
            <p><strong>3. Transfer Flow:</strong></p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Click "Generate OTP" - Copy the OTP from results</li>
              <li>Paste OTP in the "OTP" field above</li>
              <li>Click "Initiate Transfer"</li>
              <li>Click "Complete Transfer" to finish</li>
            </ul>
            <p className="text-muted-foreground pt-2">
              <strong>Note:</strong> Make sure you have valid customer data in your BANKMOCK MongoDB.
              Default test customer: CUST001
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
