import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - SwiftBank',
  description: 'Sign in to your SwiftBank account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <span className="text-lg font-bold text-white">SB</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your SwiftBank account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Protected by bank-level security and 256-bit encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
