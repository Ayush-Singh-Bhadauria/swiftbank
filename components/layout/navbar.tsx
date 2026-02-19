'use client';

import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary">SwiftBank</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'Not logged in'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
