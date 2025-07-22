import '../styles/globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'GreenTwin - Municipiul Timișoara',
  description: 'Aplicație de cartografiere a copacilor pentru Municipiul Timișoara',
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
