import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import { paginaMeta, SITIO, MARCA } from '@/lib/seo';

/* El porqué de este archivo está en `lib/seo.ts`. */

/*
 * ÉSTA ES LA PÁGINA POR LA QUE ENTRA LA GENTE DESDE REDES, así que es la que
 * más se comparte y la que peor estaba: al pegarla salía la descripción de la
 * portada, que no dice en ningún sitio que esto sea gratis ni que dé un
 * resultado al momento — las dos únicas razones por las que alguien pincha.
 *
 * «Gratis» y «al momento» van en la descripción y no en el título porque en el
 * título ocupan el sitio de lo que se busca, y en la descripción son justo lo
 * que decide el clic.
 */
export const metadata: Metadata = paginaMeta({
  ruta: '/sinergia',
  titulo: 'Compatibilidad numerológica entre dos fechas',
  descripcion:
    'Pon tu fecha y la de esa persona y te digo qué se activa entre los dos y qué se viene repitiendo. Gratis, al momento y sin registrarte.',
});

export default function SinergiaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Una herramienta que se usa dentro de la página, no un artículo. Se
          declara como tal para que Google entienda que aquí se HACE algo. */}
      <Ficha
        datos={{
          '@type': 'WebApplication',
          name: 'Sinergia entre dos fechas',
          url: `${SITIO}/sinergia`,
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web',
          inLanguage: 'es',
          publisher: { '@type': 'Organization', name: MARCA, url: SITIO },
          /* Es gratis de verdad: no pide tarjeta, no pide cuenta y el resultado
             sale en pantalla. Un precio 0 que no fuera cierto sería lo peor que
             se puede declarar aquí. */
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        }}
      />
      {children}
    </>
  );
}
