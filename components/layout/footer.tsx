export function Footer() {
  return (
    <footer className="border-t bg-card py-6">
      <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SwiftBank. All rights reserved.</p>
      </div>
    </footer>
  );
}
