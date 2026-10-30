/**
 * LA PRESENTACIÓN DE LA MASTERCLASS.
 *
 * Se ve en /presentacion y, con su propio subdominio, en
 * presentacion.escueladesabiduria33.com (la regla está en `next.config.js`).
 *
 * NO SE INDEXA: es la herramienta de la clase, no una página para que nadie
 * la encuentre en Google. Quien quiera apuntarse tiene /masterclass.
 */
import type { Metadata } from 'next';
import Presentacion from '@/components/presentacion/Presentacion';

export const metadata: Metadata = {
  title: 'Masterclass Desórdenes Amorosos · Presentación',
  description: 'La presentación de la masterclass Desórdenes Amorosos.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Pagina() {
  return <Presentacion />;
}
