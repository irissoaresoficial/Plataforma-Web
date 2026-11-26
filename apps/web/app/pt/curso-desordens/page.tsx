import type { Metadata } from 'next';
import CursoDA from '@/components/curso-da/CursoDA';

export const metadata: Metadata = {
  title: 'Curso Desordens Amorosas · Como pagar · Escuela de Sabiduría 33',
  description: 'Curso Desordens Amorosas com Iris Soares e Marco Célio Sousa. Começa a 5 e 6 de dezembro. Escolhe como pagar.',
  alternates: { canonical: '/pt/curso-desordens', languages: { 'es-ES': '/curso-desordenes', 'pt-PT': '/pt/curso-desordens' } },
};

export default function Pagina() {
  return <CursoDA idioma="pt" />;
}
