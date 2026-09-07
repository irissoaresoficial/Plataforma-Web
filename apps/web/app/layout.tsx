import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import { LangProvider } from '@/lib/i18n';
import './globals.css';

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
  /* El dominio canónico. Con www y sin www sirviendo lo mismo, Google trata dos
     direcciones como dos páginas iguales y reparte el crédito entre las dos.
     Esto le dice cuál es la buena. */
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
