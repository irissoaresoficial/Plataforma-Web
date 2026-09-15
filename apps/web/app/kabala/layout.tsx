import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import { paginaMeta, SITIO, AUTORA } from '@/lib/seo';
import { KABALA } from '@/content/site';

/* El porqué de este archivo está en `lib/seo.ts`. */

export const metadata: Metadata = paginaMeta({
  ruta: '/kabala',
  titulo: 'Consulta de Kábala con Iris Soares',
  descripcion:
    'Tres sesiones online para mirar tu mapa completo: de dónde vienes, qué cargas que no elegiste y qué se puede soltar. Un método que tiene tres mil años.',
});

/**
 * La ficha del servicio.
 *
 * Se cae a `null` sin precio, y eso puede pasar de verdad: `KABALA.precio` está
 * tipado como `number | null` justo para poder dejarlo sin poner. Declarar una
 * oferta sin importe es peor que no declarar nada.
 */
function fichaDeKabala() {
  if (!KABALA.precio) return null;
  return {
    '@type': 'Service',
    name: 'Consulta de Kábala',
    /* Las TRES sesiones van en la descripción de la ficha por lo mismo que van
       en grande en la página: el precio se entiende de otra manera cuando se
       sabe que no es una sesión suelta. */
    description: 'Tres sesiones online de lectura kabalística con Iris Soares.',
    url: `${SITIO}/kabala`,
    serviceType: 'Consulta de Kábala',
    provider: { '@type': 'Person', name: AUTORA, url: SITIO },
    areaServed: 'ES',
    offers: {
      '@type': 'Offer',
      price: String(KABALA.precio),
      priceCurrency: 'EUR',
      url: `${SITIO}/kabala`,
    },
  };
}

export default function KabalaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ficha datos={fichaDeKabala()} />
      {children}
    </>
  );
}
