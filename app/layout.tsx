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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Una sola familia en toda la web, en tres pesos: 300 light, 400
            regular y 700 bold. Hanken Grotesk es la grotesca geométrica más
            cercana a Objektiv de las que tienen un light de verdad —Objektiv es
            de Dinamo y de pago, y varias alternativas empiezan en 400. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
