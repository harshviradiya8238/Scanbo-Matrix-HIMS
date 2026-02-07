import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeRegistry from '@/src/components/providers/ThemeRegistry';
import ReduxProvider from '@/src/components/providers/ReduxProvider';
import { UserProvider } from '@/src/core/auth/UserContext';
import { ErrorBoundary } from '@/src/ui/components/ErrorBoundary';
import AppLayout from '@/src/ui/components/AppLayout';

export const metadata: Metadata = {
  title: 'Scanbo HIMS - Healthcare Information Management System',
  description: 'Enterprise-grade healthcare information management system built with Next.js, Material UI, and Redux Toolkit',
  keywords: ['healthcare', 'HIMS', 'medical', 'enterprise'],
  authors: [{ name: 'Scanbo' }],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1172BA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <ErrorBoundary>
          <ReduxProvider>
            <ThemeRegistry>
              <UserProvider defaultRole="HOSPITAL_ADMIN">
                <AppLayout>{children}</AppLayout>
              </UserProvider>
            </ThemeRegistry>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
