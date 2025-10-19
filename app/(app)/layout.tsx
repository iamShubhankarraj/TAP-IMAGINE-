import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ImageStoreProvider } from '@/context/image-store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageStoreProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ImageStoreProvider>
  );
}