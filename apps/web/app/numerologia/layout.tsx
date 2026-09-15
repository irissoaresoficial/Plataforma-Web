import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import { paginaMeta, SITIO, MARCA, AUTORA } from '@/lib/seo';

/* El porqué de este archivo está en `lib/seo.ts`. */

/*
 * LA PÁGINA MÁS IMPORTANTE DE TODA LA WEB PARA GOOGLE, y no es la portada.
 *
 * Nadie busca «Iris Soares» si no la conoce ya. Lo que sí se busca, y mucho, es
 * «numerología transgeneracional qué es». Ésta es la única página de la casa
 * que contesta esa pregunta entera, así que es por donde puede entrar alguien
 * que no ha oído hablar de Iris en su vida — que es justo la gente que hace
 * falta.
 *
 * El título es literalmente la pregunta que se escribe en el buscador. Eso no
 * es poco imaginativo: es que ahí la imaginación se paga.
 */
export const metadata: Metadata = paginaMeta({
  ruta: '/numerologia',
  titulo: 'Numerología transgeneracional: qué es y para qué sirve',
  descripcion:
    'Qué es la numerología transgeneracional, qué sale de tu nombre y de tu fecha de nacimiento, y qué no es: no adivina el futuro. Explicado sin jerga.',
});

export default function NumerologiaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Un artículo que explica algo, firmado. Sin `author` Google lo trata
          como una página suelta más; con él entra en el mismo saco que el resto
          de lo que publica Iris. */}
      <Ficha
        datos={{
          '@type': 'Article',
          headline: 'Numerología transgeneracional: qué es y para qué sirve',
          description:
            'Qué es la numerología transgeneracional, qué sale de tu nombre y de tu fecha de nacimiento, y qué no es.',
          url: `${SITIO}/numerologia`,
          inLanguage: 'es',
          author: { '@type': 'Person', name: AUTORA, url: SITIO },
          publisher: { '@type': 'Organization', name: MARCA, url: SITIO },
        }}
      />
      {children}
    </>
  );
}
