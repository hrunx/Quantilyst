import type {Metadata} from 'next';
import './globals.css';
// import { Toaster } from "@/components/ui/toaster"; // Temporarily commented out
// import {Geist, Geist_Mono} from 'next/font/google'; // Temporarily commented out

// const geistSans = Geist({ // Temporarily commented out
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({ // Temporarily commented out
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Market Insights Pro',
  description: 'Trending keyword analysis and SEO suggestions for your business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body className={`${geistSans?.variable} ${geistMono?.variable} antialiased`}> */}
      <body>
        {children}
        {/* <Toaster /> */} {/* Temporarily commented out */}
      </body>
    </html>
  );
}
