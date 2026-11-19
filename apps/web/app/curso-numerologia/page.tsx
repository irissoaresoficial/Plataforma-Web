/**
 * LA FORMACIÓN DE NUMEROLOGÍA TRANSGENERACIONAL — LA MITAD DE SERVIDOR.
 *
 * Sin `'use client'` para poder llevar título, descripción y canonical (ver
 * `app/masterclass/page.tsx`, que es igual). Aquí sí va como `Event`: hay
 * fecha y hora de verdad, sacadas del cartel de Iris.
 */

import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import CursoNumerologia from '@/components/casa/CursoNumerologia';
import { CONTACTO, FORMACION, LOGO_COLOR } from '@/content/site';

const CASA = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export const metadata: Metadata = {
  title: 'Formación en Numerología Transgeneracional y Árbol Genealógico · Iris Soares',
  description: `${FORMACION.lema} Formación online en directo con Iris Soares, ${FORMACION.cuando}. Escuela de Sabiduría 33.`,
  alternates: { canonical: '/curso-numerologia' },
  openGraph: {
    type: 'website',
    url: `${CASA}/curso-numerologia`,
    title: FORMACION.lema,
    description: `${FORMACION.titulo}: formación online en directo, 22 y 28 de noviembre. Escuela de Sabiduría 33.`,
    siteName: 'Escuela de Sabiduría 33',
    locale: 'es_ES',
  },
};

export default function Pagina() {
  return (
    <>
      <Ficha
        datos={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: FORMACION.titulo,
          description: FORMACION.subtitulo,
          startDate: FORMACION.iso,
          endDate: '2026-11-28T19:00:00+01:00',
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: { '@type': 'VirtualLocation', url: `${CASA}/curso-numerologia` },
          url: `${CASA}/curso-numerologia`,
          inLanguage: 'es-ES',
          performer: { '@type': 'Person', name: 'Iris Soares' },
          organizer: {
            '@type': 'Organization',
            name: 'Escuela de Sabiduría 33',
            url: CASA,
            logo: `${CASA}${LOGO_COLOR}`,
            email: CONTACTO.email,
          },
        }}
      />
      <CursoNumerologia />
    </>
  );
}
