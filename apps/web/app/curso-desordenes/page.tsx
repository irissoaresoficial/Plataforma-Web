import type { Metadata } from 'next';
import CursoDA from '@/components/curso-da/CursoDA';

export const metadata: Metadata = {
  title: 'Curso Desórdenes Amorosos · Cómo pagar · Escuela de Sabiduría 33',
  description: 'Curso Desórdenes Amorosos con Iris Soares y Marco Célio Sousa. Empieza el 5 y 6 de diciembre. Elige cómo pagar.',
  alternates: { canonical: '/curso-desordenes' },
};

export default function Pagina() {
  return <CursoDA />;
}
