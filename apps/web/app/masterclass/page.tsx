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
import { CONTACTO, LOGO_COLOR, MASTERCLASS } from '@/content/site';

const CASA = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export const metadata: Metadata = {
  title: 'Masterclass Desórdenes Amorosos · Iris Soares',
  description:
    /* YA LLEVA FECHA. Hasta hoy decía «te aviso de la fecha» porque no había
       ninguna, y citar a alguien un día que nadie ha fijado es otra cosa.
       Gerson la cerró el 19 de octubre, así que aquí va — y tiene que ser la
       misma que dice la página, porque Meta compara el anuncio con su destino
       y una fecha que no cuadra es motivo de rechazo.
       QUIÉN LA DA sigue sin ir aquí: lo que firma es la escuela. Esto se ve al
       compartir el enlace por WhatsApp, donde más se nota una promesa floja.
       La fecha se escribe sola desde `content/site.ts`: un solo sitio. */
    `Masterclass gratuita de numerología transgeneracional, ${MASTERCLASS.cuando}, en directo. Lo que se repite en tu forma de querer no empezó contigo. Escuela de Sabiduría 33.`,
  alternates: { canonical: '/masterclass' },
  openGraph: {
    type: 'website',
    url: `${CASA}/masterclass`,
    /* Igual que el titular de la página: lo que se comparte por WhatsApp
       tiene que decir lo mismo que lo que se ve al entrar. */
    title: '¿Por qué siempre acaba igual?',
    description:
      `${MASTERCLASS.titulo}: masterclass gratuita y en directo, ${MASTERCLASS.cuando}. Escuela de Sabiduría 33.`,
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
