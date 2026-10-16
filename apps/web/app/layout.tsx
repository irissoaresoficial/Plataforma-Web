import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import { LangProvider } from '@/lib/i18n';
import Medicion from '@/components/Medicion';
import Ficha from '@/components/Ficha';
import { SITIO } from '@/lib/seo';
import { CONTACTO } from '@/content/site';
import './globals.css';
/* El sistema de aparición al bajar (`components/Aparece.tsx`). Va DESPUÉS de la
   hoja global a propósito: en un empate de especificidad tiene que ganar el
   movimiento, y así no hace falta ni un `!important` para colocarlo. */
import './movimiento.css';

/*
 * LAS DOS LETRAS DE LA CASA
 *
 * Antes había una sola —Montserrat— para absolutamente todo, y se le pedía a
 * Google en cada visita. Dos cosas iban mal ahí.
 *
 * UNA SOLA FAMILIA APLANA. Lo que hace que una web se lea cara no es el tamaño
 * de las letras: es que el titular y el texto tengan voces distintas y se note
 * quién manda. Con una sola familia, un titular no es más que texto grande. Y
 * Montserrat, además, es la letra que sale por defecto en media internet:
 * correcta, y exactamente igual que las cuatrocientas webs que venden lo mismo.
 *
 * PEDÍRSELAS A GOOGLE EN CADA VISITA. Cada persona que entra hace una petición
 * a un servidor de Google, que se queda con su IP. En Europa eso ha costado
 * multas de protección de datos, y encima es una conexión más antes de que se
 * pinte una sola letra. Con `next/font` se descargan al compilar y se sirven
 * desde el propio dominio: más rápido, sin terceros y sin el parpadeo del texto
 * sin formato.
 *
 * FRAUNCES para los titulares. Es variable y tiene un eje, SOFT, que redondea
 * las esquinas de las letras: es la diferencia entre una serif de periódico y
 * una serif con la que da gusto que te hablen. Alto y en peso fino, es lo más
 * cerca de «tierna y elegante» que se puede pedir a una tipografía. WONK se
 * queda a cero: ese eje es el que le pone los gestos raros, y aquí no hay nada
 * que llamar la atención.
 *
 * INSTRUMENT SANS para leer. Limpia, sin gestos y sólida en tamaño pequeño, que
 * es donde vive media web —notas, rótulos, letra legal—. Debajo de una serif
 * con carácter, el texto tiene que apartarse.
 */
/* Sin lista de pesos: pidiendo ejes hay que traerse la fuente variable entera,
   que además es lo que queremos —el peso se mueve de 300 a 500 según el sitio— y
   pesa menos que tres archivos sueltos. */
const display = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--f-display',
  display: 'swap',
});

const texto = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--f-texto',
  display: 'swap',
});

export const metadata: Metadata = {
  /*
   * LA DIRECCIÓN DE CASA, ESCRITA UNA VEZ.
   *
   * Sin `metadataBase`, Next resuelve las direcciones de las imágenes para
   * compartir contra `localhost` al compilar. Eso no rompe la web —se ve
   * perfecta— pero cuando alguien pega el enlace en WhatsApp o en Instagram, la
   * vista previa sale sin imagen: el sitio que la lee va a buscarla a un
   * localhost que no es el suyo. Es el fallo que sólo se descubre cuando ya lo
   * ha compartido alguien.
   *
   * Sale de una variable para que las vistas previas de Vercel apunten a sí
   * mismas en vez de al dominio de producción.
   */
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com'),
  title: 'Iris Soares · Numerología Transgeneracional',
  description: 'Deja de repetir una vida que no elegiste. Consultas, membresía y formación en el método IRIS.',
  /*
   * EL CANONICAL DE LA PORTADA. Y AQUÍ HUBO UN AGUJERO DE LOS CAROS.
   *
   * Esto ya estaba, con su comentario explicando lo de www y sin www. Lo que no
   * se vio es que en el layout RAÍZ se hereda hacia abajo. O sea que /cursos,
   * /taller, /numerologia, /kabala, /sinergia y /membresia servían todas:
   *
   *     <link rel="canonical" href="https://escueladesabiduria33.com">
   *
   * Un canonical es una nota firmada que dice «no me indexes a mí, la buena es
   * ésa». Las seis páginas de contenido le estaban pidiendo a Google que las
   * tratara como copias de la portada. Una web puede pasarse meses sin aparecer
   * en las búsquedas por esto sin que nadie entienda el motivo.
   *
   * Ahora cada ruta declara la suya en su propio `layout.tsx`, con
   * `paginaMeta()`. Esta línea vale sólo para la portada, que es lo único que
   * pretendía decir desde el principio.
   */
  alternates: { canonical: '/' },

  /*
   * LO QUE SE VE AL PEGAR EL ENLACE EN WHATSAPP.
   *
   * Next ya componía `og:title` y `og:description` a partir del título y la
   * descripción de arriba, y la imagen sale sola de `app/opengraph-image.png`.
   * Lo que faltaba es esto:
   *
   *   · `type` y `locale`: es lo que hace que WhatsApp y Facebook traten esto
   *     como una página en español y no como algo sin identificar;
   *   · `siteName`, el nombre que sale encima del título en la ficha. Sin él
   *     sale el dominio pelado, que parece un enlace reenviado por alguien;
   *   · `url`, para que la ficha se guarde a nombre de la dirección limpia
   *     aunque el enlace que se comparta lleve `?utm_source=instagram` detrás.
   */
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Escuela de Sabiduría 33',
    title: 'Iris Soares · Numerología Transgeneracional',
    description: 'Deja de repetir una vida que no elegiste. Consultas, membresía y formación en el método IRIS.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com',
  },

  /* Qué puede hacer Google con esto. `max-image-preview: large` decide si en el
     móvil sale la foto grande o un sello del tamaño de una uña, y en una web
     que vende algo visual eso cambia cuánta gente entra. */
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body>
        {/*
            QUIÉN ES LA CASA Y QUIÉN ES IRIS, ESCRITO PARA GOOGLE.

            Va en el layout raíz porque es lo único que es verdad en todas las
            páginas: la escuela y la persona que la lleva son las mismas se
            entre por donde se entre. Lo de cada página —el curso, la consulta,
            el taller— está en el layout de su carpeta.

            Es lo que hace que, al buscar «Iris Soares», Google pueda montar la
            tarjeta de la derecha con el nombre, el oficio y el enlace, en vez
            de enseñar un resultado azul más.

            SÓLO VA LO QUE ESTÁ CONFIRMADO. No hay redes sociales aquí porque
            no están en `content/site.ts`: el campo que las llevaría —`sameAs`—
            es justo el que más pesa para que Google ate el perfil de Instagram
            con esta web, así que en cuanto Gerson pase los enlaces, se añade y
            se nota. Inventarlos ahora, no.
        */}
        <Ficha
          datos={{
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${SITIO}#escuela`,
                name: 'Escuela de Sabiduría 33',
                url: SITIO,
                email: CONTACTO.email,
                founder: { '@id': `${SITIO}#iris` },
              },
              {
                '@type': 'Person',
                '@id': `${SITIO}#iris`,
                name: 'Iris Soares',
                jobTitle: 'Numeróloga transgeneracional',
                url: SITIO,
                worksFor: { '@id': `${SITIO}#escuela` },
                knowsAbout: ['Numerología', 'Numerología transgeneracional', 'Kábala'],
              },
            ],
          }}
        />
        <LangProvider>{children}</LangProvider>
        {/* La medición va en el layout y no en cada página porque el cartel del
            consentimiento tiene que salir se entre por donde se entre — también
            si alguien llega directo a /cursos desde un anuncio. Mientras no
            estén puestas las variables del píxel, esto no pinta nada. */}
        <Medicion />
      </body>
    </html>
  );
}
