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
        {/* Una sola familia en toda la web: Libre Bodoni. Tiene el contraste
            alto y los remates finos de una didone —el aire de revista— pero
            está dibujada para leerse en párrafo, que es donde las bodoni de
            display se caen. Su único eje variable es el peso: no hay forma de
            que dos sitios de la web acaben con dos dibujos distintos. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400..700;1,400..700&display=swap"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
