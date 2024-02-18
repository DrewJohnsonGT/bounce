import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '~/app/providers';
import { AppContextProvider } from '~/context/useContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Providers>
          <AppContextProvider>{children}</AppContextProvider>
        </Providers>
      </body>
    </html>
  );
}
