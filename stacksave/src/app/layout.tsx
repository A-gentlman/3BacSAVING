import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElatrachCabinet — Suivi Intelligent des Finances & Économies',
  description: 'Suivez vos objectifs d\'épargne, factures et dépenses dans un magnifique tableau de bord. Enrichissez-vous, respectez votre budget et atteignez vos rêves.',
  keywords: 'suivi epargne, finances personnelles, application budget, suivi objectifs, suivi factures',
};

import AuthGate from '@/components/AuthGate';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: '#f0f9ff', overflowX: 'hidden' }}>
        <AuthGate>
          {children}
        </AuthGate>
      </body>
    </html>
  );
}
