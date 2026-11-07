/**
 * LA PRESENTACIÓN DEL EVENTO.
 *
 * Se ve en /kangen y, con su propio subdominio, en
 * kangen.escueladesabiduria33.com (la regla está en `next.config.js`; el
 * dominio hay que añadirlo en Vercel, Settings → Domains).
 *
 * NO SE INDEXA: es la herramienta del evento, no una página para buscadores.
 * El contenido vive en `content/kangen.ts`; el diseño, en
 * `components/kangen`.
 */
import type { Metadata } from 'next';
import Kangen from '@/components/kangen/Kangen';

export const metadata: Metadata = {
  title: 'Formar parte del futuro · Presentación',
  description: 'La presentación del evento.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/kangen' },
};

export default function Pagina() {
  return <Kangen />;
}
