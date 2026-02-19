import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex w-full flex-col md:ml-0">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
