import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Phone, HelpCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">BANK OF INDIA</span>
            </div>
            <div className="hidden items-center gap-6 md:flex">
              <button className="text-sm font-medium hover:text-primary">Savings & CDs</button>
              <button className="text-sm font-medium hover:text-primary">Credit Cards</button>
              <button className="text-sm font-medium hover:text-primary">Home Loans</button>
              <button className="text-sm font-medium hover:text-primary">Auto Loans</button>
              <button className="text-sm font-medium hover:text-primary">Investments</button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search"
                className="hidden rounded border border-border px-3 py-2 text-sm md:block"
              />
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Credit Cards Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-800 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Login Form */}
            <div className="flex flex-col justify-center">
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold">Login</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <input type="text" className="mt-1 w-full rounded border border-border px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <input type="password" className="mt-1 w-full rounded border border-border px-3 py-2" />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Save user ID</span>
                  </label>
                  <Link href="/login">
                    <Button className="w-full">Log in</Button>
                  </Link>
                </div>
                <div className="mt-4 text-center text-sm">
                  <a href="#" className="text-primary hover:underline">Forgot ID/Password</a>
                </div>
              </div>
            </div>

            {/* Right: Card Offers */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white">Choose the card that works for you</h2>
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4 rounded-lg bg-white/10 p-4 backdrop-blur">
                  <div className="text-4xl font-bold text-white">6%</div>
                  <div className="text-white">
                    <div className="font-semibold">Cash back offer</div>
                    <div className="text-sm">No annual fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-white/10 p-4 backdrop-blur">
                  <div className="text-4xl font-bold text-white">2%</div>
                  <div className="text-white">
                    <div className="font-semibold">Cash back offer</div>
                    <div className="text-sm">No annual fee</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Connect with us</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <Calendar className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold text-primary">Schedule an appointment</h3>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <MapPin className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold text-primary">Find a location</h3>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <Phone className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold text-primary">Contact us</h3>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold text-primary">Help center</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="bg-gradient-to-r from-primary to-blue-800 px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white">Convenient banking with our Mobile app</h2>
              <p className="mt-4 text-lg text-white/90">Access your accounts anytime, anywhere with secure mobile banking.</p>
              <Link href="/register" className="mt-6 inline-block w-fit">
                <Button variant="secondary" size="lg">Explore our app</Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="h-96 w-48 rounded-3xl border-8 border-black bg-white shadow-2xl flex flex-col items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="font-semibold text-primary">Bank of India</div>
                  <div className="mt-2 text-xs">Mobile App</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Goals Section */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Your financial goals matter</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              We can help you achieve them through financial education and programs that make communities stronger.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/40"></div>
              <div className="p-4">
                <h3 className="font-semibold text-primary">Digital Banking Guide</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="h-32 bg-gradient-to-br from-accent/20 to-accent/40"></div>
              <div className="p-4">
                <h3 className="font-semibold text-accent">Investment Planning Tips</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="h-32 bg-gradient-to-br from-blue-200 to-blue-400"></div>
              <div className="p-4">
                <h3 className="font-semibold">Savings Strategies</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="h-32 bg-gradient-to-br from-green-200 to-green-400"></div>
              <div className="p-4">
                <h3 className="font-semibold">Emergency Fund Building</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl mb-12">Your news and information</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Level up your account security</h3>
              <p className="mt-4 text-muted-foreground">
                Watch your security meter rise as you take action to help protect against fraud. See it in the Security Center in Mobile and Online Banking.
              </p>
              <Button variant="destructive" className="mt-6">Check your level</Button>
            </div>
            <div className="flex justify-center">
              <div className="h-96 w-48 rounded-3xl border-8 border-black bg-white shadow-2xl flex flex-col items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="font-semibold text-primary">Security Center</div>
                  <div className="mt-2 text-xs">Advanced security features</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="border-t border-border bg-gray-50 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-muted-foreground">Investment and insurance products:</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded border border-border bg-white p-4 text-center text-sm">
              Are Not FDIC Insured
            </div>
            <div className="rounded border border-border bg-white p-4 text-center text-sm">
              Are Not Bank Guaranteed
            </div>
            <div className="rounded border border-border bg-white p-4 text-center text-sm">
              May Lose Value
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            © 2024 Bank of India. All rights reserved. Bank of India is committed to equal opportunity and accessibility.
          </p>
        </div>
      </section>
    </div>
  );
}
