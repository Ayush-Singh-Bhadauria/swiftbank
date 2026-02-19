'use client';

import { useState } from 'react';
import { DisputeForm } from '@/components/dispute/dispute-form';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function DisputePage() {
  const [disputeFiled, setDisputeFiled] = useState(false);

  if (disputeFiled) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-pretty text-3xl font-bold">Dispute Filed Successfully</h1>
          <p className="mt-2 text-muted-foreground">
            Your dispute has been submitted and is now under review
          </p>
        </div>

        <Card className="border-green-200 bg-green-50 p-8">
          <div className="flex gap-4">
            <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Case #CASE-2024-001
              </h3>
              <p className="mt-2 text-green-800">
                Your dispute has been successfully filed. You will receive
                updates via email at your registered address.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Status Timeline */}
          <Card className="border-border p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-6">Dispute Status</h3>
            <div className="space-y-6">
              {[
                { status: 'Submitted', date: 'Today', icon: CheckCircle, done: true },
                { status: 'Under Review', date: 'In Progress', icon: Clock, done: false },
                { status: 'Resolved', date: 'Pending', icon: AlertTriangle, done: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Icon
                        size={24}
                        className={
                          item.done
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }
                      />
                      {item.status !== 'Resolved' && (
                        <div className="mt-2 h-8 w-1 bg-muted" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>We'll review your dispute</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Contact you if we need more info</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Provide resolution within 5-10 days</span>
              </li>
            </ul>
          </Card>
        </div>

        <button
          onClick={() => setDisputeFiled(false)}
          className="text-primary hover:underline"
        >
          ← File Another Dispute
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-pretty text-3xl font-bold">Raise a Dispute</h1>
        <p className="mt-2 text-muted-foreground">
          If you believe a transaction is fraudulent or incorrect, you can file a
          dispute here. We'll investigate and work to resolve it quickly.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-border p-6 md:p-8">
            <DisputeForm
              onSuccess={() => setDisputeFiled(true)}
            />
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card className="border-border p-6">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Select the transaction you want to dispute</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Choose your dispute reason</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>Provide detailed information</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>We'll investigate and resolve it</span>
              </li>
            </ul>
          </Card>

          {/* Timeline */}
          <Card className="border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Timeline
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>Day 1:</strong> We review your case
              </li>
              <li>
                <strong>Days 2-3:</strong> Investigation begins
              </li>
              <li>
                <strong>Days 4-10:</strong> Resolution provided
              </li>
            </ul>
          </Card>

          {/* FAQ */}
          <Card className="border-border p-6">
            <h3 className="text-lg font-semibold mb-4">FAQ</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">What if I'm wrong?</p>
                <p className="text-muted-foreground">
                  No problem. We'll cancel the dispute.
                </p>
              </div>
              <div>
                <p className="font-medium">How long does it take?</p>
                <p className="text-muted-foreground">
                  Usually 5-10 business days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
