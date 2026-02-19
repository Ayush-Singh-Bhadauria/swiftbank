'use client';

import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, Mail, Phone, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const kycStatusColor = {
    verified: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-pretty text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account information and security settings
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="border-border p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-lg font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge className={kycStatusColor[user.kycStatus]}>
                  <Shield size={14} className="mr-1" />
                  {user.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold mb-6">Account Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
              <p className="font-medium capitalize">{user.kycStatus}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Forms */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Form */}
        <Card className="border-border p-6">
          <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>
          <ProfileForm />
        </Card>

        {/* Password Form */}
        <Card className="border-border p-6">
          <h3 className="text-lg font-semibold mb-6">Security</h3>
          <ChangePasswordForm />
        </Card>
      </div>

      {/* Security Tips */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Security Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Use a strong, unique password</li>
          <li>✓ Enable two-factor authentication (coming soon)</li>
          <li>✓ Review your login activity regularly</li>
          <li>✓ Never share your password or login details</li>
        </ul>
      </Card>
    </div>
  );
}
