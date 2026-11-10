/**
 * LA PRESENTACIÓN DE LA MASTERCLASS, EN DIRECTO (10 de noviembre de 2026).
 *
 * Es la que Iris y Marco proyectan el jueves 26 de noviembre. Pública para que
 * se pueda abrir desde cualquier ordenador sin cuentas ni permisos, pero sin
 * aparecer en Google: no es una página para quien llega de fuera.
 *
 * La mitad de servidor sólo lleva el título y el `noindex`; todo lo demás está
 * en `components/clase/Clase.tsx`.
 */

import type { Metadata } from 'next';
import Clase from '@/components/clase/Clase';

export const metadata: Metadata = {
  title: 'Desórdenes Amorosos · Presentación',
  description: 'Presentación de la masterclass Desórdenes Amorosos.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Clase />;
}
