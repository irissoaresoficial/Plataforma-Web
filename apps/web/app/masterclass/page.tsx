/**
 * LA MASTERCLASS — LA MITAD DE SERVIDOR.
 *
 * Sin `'use client'`: es la que lleva el título, la descripción y el
 * canonical. Una página de cliente no puede exportar `metadata` y hereda la
 * del layout sin avisar — está contado entero en `lib/seo.ts`.
 *
 * Y aquí importa el doble: ésta es la página a la que apunta la campaña de
 * Meta. El título y la descripción son lo que se ve cuando alguien comparte
 * el enlace por WhatsApp, que en una campaña pasa todo el rato.
 */

import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import Masterclass from '@/components/casa/Masterclass';
import { CONTACTO, LOGO_COLOR } from '@/content/site';

const CASA = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export const metadata: Metadata = {
  title: 'Masterclass Desórdenes Amorosos · Iris Soares',
  description:
    /* «Gratuita» sí, confirmado por Gerson. La fecha NO: sigue sin decidir
       y citar a alguien un día que nadie ha fijado es otra cosa.
       Y QUIÉN LA DA, TAMPOCO. Ponía «con Iris Soares» y la da Marco (Gerson,
       19 de octubre). Lo que firma es la escuela, que sí es verdad: esto se
       ve al compartir el enlace por WhatsApp, o sea donde más se nota una
       promesa que no cuadra. */
    'Lo que se repite en tu forma de querer no empezó contigo. Masterclass gratuita de numerología transgeneracional de la Escuela de Sabiduría 33. Déjame tu correo y te aviso de la fecha.',
  alternates: { canonical: '/masterclass' },
  openGraph: {
    type: 'website',
    url: `${CASA}/masterclass`,
    title: 'Hay una forma de amar que no elegiste',
    description:
      'Masterclass gratuita de Desórdenes Amorosos, en la Escuela de Sabiduría 33. Déjame tu correo y te aviso en cuanto haya fecha.',
    siteName: 'Escuela de Sabiduría 33',
    locale: 'es_ES',
    images: [`${CASA}/images/desordenes-aterrizaje-cartel.jpg`],
  },
};

export default function Pagina() {
  return (
    <>
      {/*
       * Los datos estructurados dicen QUÉ es esto sin que Google lo adivine.
       * `Event` sería lo suyo para una masterclass, pero exige `startDate` y
       * esa fecha no existe todavía: inventarla para rellenar el campo es
       * justo lo que MARCA.md §7 prohíbe, y además Google penaliza los datos
       * estructurados que no coinciden con lo que se ve en la página.
       * Así que va como `WebPage` con su organización, que es verdad entera.
       * El día que haya fecha, esto pasa a `Event` y se gana la ficha con el
       * día y la hora en los resultados.
       */}
      <Ficha
        datos={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Masterclass Desórdenes Amorosos',
          description:
            'Masterclass de numerología transgeneracional sobre los patrones que se repiten en la forma de querer.',
          url: `${CASA}/masterclass`,
          inLanguage: 'es-ES',
          publisher: {
            '@type': 'Organization',
            name: 'Escuela de Sabiduría 33',
            url: CASA,
            logo: `${CASA}${LOGO_COLOR}`,
            email: CONTACTO.email,
          },
        }}
      />
      <Masterclass />
    </>
  );
}
