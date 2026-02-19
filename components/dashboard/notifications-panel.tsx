'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'Transaction Successful',
    description: '₹5,000 debited from your account',
    time: '2 hours ago',
    type: 'success',
  },
  {
    id: 2,
    title: 'Cheque Processing',
    description: 'Your cheque deposit is being processed',
    time: '1 day ago',
    type: 'info',
  },
  {
    id: 3,
    title: 'Payment Due',
    description: 'Credit card payment due in 3 days',
    time: '2 days ago',
    type: 'warning',
  },
];

export function NotificationsPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="rounded-full bg-primary/10 p-2">
                {notification.type === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {notification.type === 'warning' && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                {notification.type === 'info' && (
                  <Bell className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{notification.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {notification.time}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
