import './globals.css';
import { Inter } from 'next/font/google';
import ClientWrapper from './components/ClientWrapper';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My Music App',
  description: 'Listen to my music.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface-950 text-surface-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <ErrorBoundary>
            <ClientWrapper>
              <main className="flex-grow">
                {children}
              </main>
            </ClientWrapper>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}