import type { Metadata } from 'next';
import Gracias from '@/components/curso-da/Gracias';

export const metadata: Metadata = {
  title: 'Obrigada · Curso Desordens Amorosas',
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return <Gracias idioma="pt" />;
}
