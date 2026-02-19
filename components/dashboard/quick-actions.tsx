'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, FileCheck, HelpCircle } from 'lucide-react';

const actions = [
  {
    title: 'Transfer Money',
    description: 'Send money with OTP',
    icon: ArrowUpRight,
    href: '/transfer',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Deposit Cheque',
    description: 'Deposit a cheque online',
    icon: FileCheck,
    href: '/cheque',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'View Transactions',
    description: 'Check your transaction history',
    icon: ArrowDownRight,
    href: '/transactions',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Raise Dispute',
    description: 'Report an issue',
    icon: HelpCircle,
    href: '/dispute',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="transition-all hover:shadow-md cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${action.bgColor}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
