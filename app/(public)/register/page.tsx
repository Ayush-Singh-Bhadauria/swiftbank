import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register - SwiftBank',
  description: 'Create a new SwiftBank account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <span className="text-lg font-bold text-white">SB</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
          <p className="mt-2 text-muted-foreground">
            Create your SwiftBank account in minutes
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
