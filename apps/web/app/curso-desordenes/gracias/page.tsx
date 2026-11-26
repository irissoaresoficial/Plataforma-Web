import type { Metadata } from 'next';
import Gracias from '@/components/curso-da/Gracias';

export const metadata: Metadata = {
  title: 'Gracias · Curso Desórdenes Amorosos',
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <Gracias />;
}
