'use client';

/**
 * EL BLOQUE CREMA: LA AFIRMACIÓN DE LA SECCIÓN.
 * ============================================================================
 *
 * Nació para la portada —«después explicas esto (transgeneracional)», pidió
 * Gerson— y es la pieza que decide si alguien sigue leyendo, porque es donde
 * la página deja de dar vueltas y dice qué afirma exactamente.
 *
 * AHORA LO USAN TRES PÁGINAS, Y POR ESO LLEVA PARÁMETROS.
 * Gerson, el 18 de octubre: «esos espacios de numerología y kábala deben
 * quitarse, erradícalo; debes de poner, insisto, el mismo diseño que tenemos
 * en la home adaptado a la comunicación del apartado».
 *
 * «El mismo diseño» no es copiar el aspecto en otro archivo: es el MISMO
 * bloque, con el mismo crema, el mismo filete y las mismas medidas, diciendo
 * otra cosa. Si se copia, a los dos meses hay tres cremas distintos porque
 * alguien tocó uno. Compartiendo el componente, lo que se arregla aquí se
 * arregla en las tres.
 *
 * Los valores por defecto son los de la portada, así que `<Sobre />` a secas
 * sigue siendo exactamente lo que era.
 *
 * POR QUÉ MONTA SOBRE LO DE ARRIBA.
 * Sube 25 px por encima de la portada y lleva las esquinas de arriba
 * redondeadas. No es un adorno: es lo que hace que la página se lea como una
 * sola pieza que se desliza y no como dos secciones pegadas. El vídeo se corta
 * con una curva, no con una línea recta, y el ojo lo lee como continuidad.
 *
 * LA VOZ.
 * MARCA.md §6: castellano llano, frases cortas, se habla de tú y de lo que le
 * pasa a quien lee. Una sola afirmación, dicha con nombres y sin una palabra
 * de las prohibidas. Nada de energía, nada de vibración, nada de despertar.
 */

import Link from 'next/link';
import { CONTACTO } from '@/content/site';
import Sello from './Sello';

/** Los tres dibujos que puede llevar el disco de un botón. Dos trazos cada
 *  uno: es el repertorio entero de iconos de la casa y no crece sin motivo. */
const ICONOS = {
  sobre: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></>,
  mas: <path d="M12 5v14M5 12h14" />,
  abajo: <path d="M12 5v14M19 12l-7 7-7-7" />,
} as const;

export type BotonSobre = {
  /** A dónde va. Si empieza por `/` o por `#` es de casa y va por `Link`. */
  a: string;
  texto: string;
  icono?: keyof typeof ICONOS;
};

const POR_DEFECTO: BotonSobre[] = [
  { a: `mailto:${CONTACTO.email}`, texto: 'Escríbeme', icono: 'sobre' },
  { a: '/cursos', texto: 'Ver los cursos', icono: 'mas' },
];

export default function Sobre({
  id = 'esto',
  /* «No hace falta creer en nada» se ha ido: ponía la fe sobre la mesa, y aquí
     la fe no pinta nada. Esto va de algo que se repite y de dónde viene. */
  entrada = 'Lo que se repite no es mala suerte. Es un patrón. Y los patrones se heredan.',
  texto = 'Tu abuela tomó una decisión para sobrevivir a lo suyo: callarse, aguantar, irse. Tu madre creció con esa decisión puesta en casa, sin que nadie se la explicara. Y tú no repites lo que les pasó: repites la salida que encontraron ellas. Eso es lo que venimos a mirar.',
  botones = POR_DEFECTO,
}: {
  id?: string;
  entrada?: string;
  texto?: string;
  botones?: BotonSobre[];
}) {
  return (
    <section className="casa-sobre" id={id}>
      <div className="casa-sobre-alto">
        <p className="casa-sobre-entrada">{entrada}</p>

        <div className="casa-sobre-botones">
          {/* Uno pide y el otro acompaña. MARCA.md §5: dos botones del mismo
              peso no son dos opciones, son una duda. Por eso el primero es el
              oscuro —el que pide— y el segundo habla más bajo. */}
          {botones.map((b, i) => {
            const dentro = (
              <>
                <span className="casa-boton-disco" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {ICONOS[b.icono ?? 'mas']}
                  </svg>
                </span>
                {b.texto}
              </>
            );
            const clase = `casa-boton ${i === 0 ? 'casa-boton-oscuro' : 'casa-boton-claro'}`;
            /* Un `mailto:` o un enlace de fuera no es navegación de la web:
               por `Link` no gana nada y además lo intenta precargar. */
            return b.a.startsWith('/') || b.a.startsWith('#') ? (
              <Link key={b.a} className={clase} href={b.a}>
                {dentro}
              </Link>
            ) : (
              <a key={b.a} className={clase} href={b.a}>
                {dentro}
              </a>
            );
          })}
        </div>
      </div>

      {/* El filete: punto, raya, punto. Es la única decoración de la página y
          existe para separar la entrada del bloque de leer sin meter un borde
          que corte la sección en dos cajas. */}
      <div className="casa-filete" aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      <div className="casa-sobre-bajo">
        <div className="casa-sobre-firma">
          <Sello />
          <span className="casa-sobre-rotulo">
            Escuela
            <br />
            Sabiduría 33
          </span>
        </div>

        <p className="casa-sobre-texto">{texto}</p>
      </div>
    </section>
  );
}
