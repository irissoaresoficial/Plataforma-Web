import type { Metadata } from 'next';
import Ficha from '@/components/Ficha';
import { paginaMeta, SITIO, MARCA, AUTORA } from '@/lib/seo';
import { TALLER } from '@/content/site';

/* El porqué de este archivo está en `lib/seo.ts`. */

export const metadata: Metadata = paginaMeta({
  ruta: '/taller',
  titulo: 'Taller gratuito de numerología transgeneracional',
  descripcion:
    'Hora y media en directo con Iris Soares. Sacamos tu número delante de ti y ves por qué eso que se repite en tu familia no empezó contigo.',
});

/**
 * LA FICHA DEL TALLER, QUE HOY NO SE PONE. Y ES LA DECISIÓN CORRECTA.
 *
 * `TALLER.fechaISO` está vacío porque la fecha no está cerrada: la página lo
 * sabe y por eso enseña «te aviso yo del día» en lugar de un día.
 *
 * Aquí la tentación es poner un `Event` igualmente, con una fecha cualquiera o
 * con la de hoy, «para que Google lo vea». Eso no es una chapuza sin
 * consecuencias: un evento cuya fecha no coincide con lo que dice la página es
 * exactamente lo que Google marca como datos engañosos, y la penalización no
 * cae sobre esta página, cae sobre el dominio entero. Se perdería la
 * indexación de los cursos, que sí tienen fecha y sí se venden.
 *
 * Así que mientras no haya fecha, esto devuelve `null` y no se pinta nada. El
 * día que Iris cierre el día, se rellena `TALLER.fechaISO` en `content/site.ts`
 * y la ficha aparece sola, sin tocar este archivo.
 */
function fichaDelTaller() {
  if (!TALLER.fechaISO) return null;

  return {
    '@type': 'Event',
    name: 'Taller gratuito de numerología transgeneracional',
    description:
      'Hora y media en directo: sacamos tu número con tu fecha y vemos qué se repite en tu familia.',
    url: `${SITIO}/taller`,
    startDate: TALLER.hora ? `${TALLER.fechaISO}T${TALLER.hora.slice(0, 5)}:00+02:00` : TALLER.fechaISO,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    /* Un evento online necesita un «sitio» virtual, y el sitio es la propia
       página: el enlace de la sala se manda por correo a quien se apunta, así
       que no hay una dirección pública que dar y no se inventa ninguna. */
    location: { '@type': 'VirtualLocation', url: `${SITIO}/taller` },
    inLanguage: 'es',
    organizer: { '@type': 'Organization', name: MARCA, url: SITIO },
    performer: { '@type': 'Person', name: AUTORA },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITIO}/taller`,
    },
  };
}

export default function TallerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ficha datos={fichaDelTaller()} />
      {children}
    </>
  );
}
