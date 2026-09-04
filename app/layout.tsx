import type { Metadata } from 'next';
import { LangProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Iris Soares · Numerología Transgeneracional',
  description: 'Deja de repetir una vida que no elegiste. Consultas, membresía y formación en el método IRIS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
