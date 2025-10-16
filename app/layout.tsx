// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { ImageStoreProvider } from '@/context/image-store';
import { ExportQueueProvider } from '@/context/export-queue-context';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TAP[IMAGINE] - AI Image Editor',
  description: 'Advanced AI-powered image editor using Google Nano Banana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ImageStoreProvider>
            <ExportQueueProvider>
              <Navbar />
              <main>
                {children}
              </main>
            </ExportQueueProvider>
          </ImageStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}