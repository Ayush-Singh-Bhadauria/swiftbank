'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DisputeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    transactionId: '',
    reason: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!formData.transactionId || !formData.reason || !formData.description) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.createDispute(formData);
      if (response.success) {
        setMessage('Dispute submitted successfully');
        setFormData({
          transactionId: '',
          reason: '',
          description: '',
        });
      } else {
        setMessage(response.error || 'Failed to submit dispute');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise a Dispute</CardTitle>
        <CardDescription>
          Report an issue with a transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.includes('success')
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              name="transactionId"
              placeholder="TXN123456789"
              value={formData.transactionId}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <select
              id="reason"
              name="reason"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.reason}
              onChange={handleChange}
              disabled={isLoading}
              required
            >
              <option value="">Select a reason</option>
              <option value="unauthorized">Unauthorized Transaction</option>
              <option value="duplicate">Duplicate Charge</option>
              <option value="wrong_amount">Wrong Amount</option>
              <option value="not_received">Service Not Received</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
