'use client';

/**
 * EL BLOQUE CREMA: DE DÓNDE VIENE EL PATRÓN.
 * ============================================================================
 *
 * Es la segunda de las cinco cosas que pidió Gerson: «después explicas esto
 * (transgeneracional)». Y es la pieza que decide si alguien sigue leyendo,
 * porque es donde la web deja de dar vueltas y dice qué afirma exactamente.
 *
 * POR QUÉ MONTA SOBRE EL VÍDEO.
 * Sube 25 px por encima de la portada y lleva las esquinas de arriba
 * redondeadas. No es un adorno: es lo que hace que la página se lea como una
 * sola pieza que se desliza y no como dos secciones pegadas. El vídeo se corta
 * con una curva, no con una línea recta, y el ojo lo lee como continuidad.
 *
 * LA VOZ.
 * MARCA.md §6: castellano llano, frases cortas, se habla de tú y de lo que le
 * pasa a quien lee. Aquí hay una sola afirmación, dicha con nombres —la abuela,
 * la madre, tú— y sin una palabra de las prohibidas. Nada de energía, nada de
 * vibración, nada de despertar.
 */

import Link from 'next/link';
import { CONTACTO } from '@/content/site';
import Sello from './Sello';

export default function Sobre() {
  return (
    <section className="casa-sobre" id="esto">
      <div className="casa-sobre-alto">
        <p className="casa-sobre-entrada">
          No hace falta creer en nada. Hace falta mirar una cuenta que ya estaba
          hecha antes de que llegaras tú.
        </p>

        <div className="casa-sobre-botones">
          {/* Uno pide y el otro acompaña. MARCA.md §5: dos botones del mismo
              peso no son dos opciones, son una duda. Por eso el oscuro es el
              que pide y el claro habla más bajo. */}
          <a className="casa-boton casa-boton-oscuro" href={`mailto:${CONTACTO.email}`}>
            <span className="casa-boton-disco" aria-hidden="true">
              {/* Un sobre. Dos trazos: la caja y la solapa. */}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
            </span>
            Escríbeme
          </a>
          <Link className="casa-boton casa-boton-claro" href="/cursos">
            <span className="casa-boton-disco" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Ver los cursos
          </Link>
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

        <p className="casa-sobre-texto">
          Tu abuela tomó una decisión para sobrevivir a lo suyo: callarse,
          aguantar, irse. Tu madre creció con esa decisión puesta en casa, sin
          que nadie se la explicara. Y tú no repites lo que les pasó: repites la
          salida que encontraron ellas. Eso es lo que venimos a mirar.
        </p>
      </div>
    </section>
  );
}
