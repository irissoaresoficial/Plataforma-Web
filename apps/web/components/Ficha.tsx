import { jsonLd } from '@/lib/seo';

/**
 * LA FICHA QUE SÓLO LEEN LOS BUSCADORES.
 *
 * Un `<script type="application/ld+json">` con los datos de la página escritos
 * de forma que Google no tenga que adivinarlos del texto: qué es esto, quién lo
 * da, cuándo empieza, cuánto cuesta.
 *
 * NO SE VE EN PANTALLA Y NO PINTA NADA. Va dentro del layout de servidor de
 * cada ruta, así que llega en el HTML de la primera respuesta — que es cuando
 * lo lee el robot. Si esto se montara desde el navegador llegaría tarde para la
 * mitad de los rastreadores.
 *
 * `dangerouslySetInnerHTML` es la única forma de meter JSON dentro de un script
 * sin que React lo escape y lo deje ilegible. El escapado que sí hace falta
 * —el del `<`— está en `jsonLd()`.
 */
export default function Ficha({ datos }: { datos: Record<string, unknown> | null }) {
  const texto = jsonLd(datos);
  if (!texto) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: texto }} />;
}
