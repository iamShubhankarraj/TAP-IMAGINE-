import Footer from '@/components/layout/Footer';
import { ImageStoreProvider } from '@/context/image-store';
import { AuthProvider } from '@/context/auth-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ImageStoreProvider>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </ImageStoreProvider>
    </AuthProvider>
  );
}