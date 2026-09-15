import type { Metadata } from 'next';
import { paginaMeta } from '@/lib/seo';

/* El porqué de este archivo está en `lib/seo.ts`. */

/*
 * AQUÍ NO VA FICHA PARA GOOGLE, Y NO ES UN OLVIDO.
 *
 * La comunidad todavía no existe: no tiene precio, ni fecha de apertura
 * cerrada, ni nada que se pueda comprar hoy. La página entera es un cartel de
 * «próximamente» con una casilla para dejar el correo.
 *
 * Un `Product` o un `Offer` describiendo algo que no se vende es justo el tipo
 * de dato que hace que Google deje de fiarse de las fichas del resto del sitio
 * —las de los cursos, que sí tienen fecha y precio de verdad—. Se pone el día
 * que abra, con lo que cueste.
 */
export const metadata: Metadata = paginaMeta({
  ruta: '/membresia',
  /* «· Lista de espera» se ha ido del título: lo dice la primera frase de la
     descripción, y en el título gastaba dieciséis caracteres de los sesenta
     que se ven en repetir algo que ya está justo debajo. */
  titulo: 'La comunidad de Iris Soares',
  descripcion:
    'La comunidad todavía no está abierta. Deja tu correo y te aviso yo: las primeras deciden conmigo qué se trabaja dentro.',
});

export default function MembresiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
