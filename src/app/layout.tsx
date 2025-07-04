
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Quantilyst Market Intelligence',
  description: 'Real-time, end-to-end market visibility for whoever cares.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={robotoMono.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased dark`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
