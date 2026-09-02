import React from 'react';
import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'ReachInbox Email Scheduler | Production Grade',
  description: 'Full-Stack BullMQ & Redis Email Scheduling Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
