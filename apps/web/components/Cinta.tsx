'use client';

/**
 * LA CINTA: UNA FILA QUE NO SE ACABA
 *
 * ===========================================================================
 * QUÉ PROBLEMA RESUELVE
 * ===========================================================================
 * Las cinco piezas de la numerología estaban en una rejilla de cuatro
 * columnas. Cinco no se divide entre cuatro, así que la quinta caía sola en la
 * segunda fila con tres huecos vacíos al lado.
 *
 * Y el problema de fondo no era la aritmética. Una rejilla dice «esto es una
 * lista, léela entera»; y nadie lee cinco párrafos seguidos en medio de una
 * página de venta. Una cinta dice otra cosa: «esto sigue, coge lo que te
 * llame». Se mira, no se lee.
 *
 * ===========================================================================
 * POR QUÉ ESTO NO ES UNA ANIMACIÓN DE CSS — Y POR QUÉ LO FUE Y SE ROMPIÓ
 * ===========================================================================
 * La primera versión tenía DOS capas: un `@keyframes` de CSS movía el carril de
 * 0 a −50 %, y encima una capa con un `transform` que escribía el scroll. Los
 * dos transformes se sumaban, que era la idea.
 *
 * Y se rompía, con una foto que lo demuestra: la cinta empezando a la mitad de
 * la pantalla con medio metro de blanco a la izquierda.
 *
 * El motivo: el empuje del scroll NO DABA LA VUELTA. Al subir, la velocidad se
 * hace negativa, la posición crece, el carril se desplaza a la DERECHA y deja
 * al descubierto el hueco que hay antes de la primera ficha. Y como esa
 * posición no tenía tope, podía irse tan lejos como se quisiera. Dos capas
 * independientes no se pueden envolver: para saber si hay que dar la vuelta
 * hay que mirar la suma, y ninguna de las dos la conoce.
 *
 * Así que ahora hay UNA SOLA POSICIÓN, calculada en JavaScript, que lleva
 * dentro la deriva constante y el empuje del scroll, y que se envuelve con un
 * módulo del ancho de UNA copia. Envuelta siempre entre −ancho y 0, y con la
 * fila repetida cuatro veces, nunca se puede llegar al borde del contenido:
 * siempre hay fichas a izquierda y a derecha, se venga de donde se venga.
 *
 * Se escribe directamente en el DOM dentro del rAF, sin pasar por el estado de
 * React: sesenta repintados por segundo de un componente con veinte fichas
 * dentro es exactamente lo que hace que una web vaya a tirones en un teléfono.
 */

import { useEffect, useRef, type ReactNode } from 'react';

/** Píxeles por segundo que la cinta se mueve sola, sin tocar nada. */
const DERIVA = 26;

/**
 * Cuánto empuja la rueda: píxeles de cinta por cada píxel que se baja. A 0,45
 * se nota claramente que la fila responde al gesto sin que el texto salga
 * disparado y deje de poder leerse.
 */
const EMPUJE = 0.45;

/** Cuánto se frena el empuje en cada fotograma cuando se deja de bajar. */
const FRENO = 0.9;

/** Tope de píxeles por fotograma, para que un manotazo no lance la fila. */
const TOPE = 60;

/**
 * Cuántas veces se repite la fila. Con cuatro, la posición envuelta —que nunca
 * pasa del ancho de una copia— deja siempre tres copias por delante, y eso
 * cubre cualquier pantalla sin que se vea el final del contenido.
 */
const COPIAS = 4;

export type PiezaCinta = {
  /** Lo que se lee arriba, en dorado: de dónde sale este número. */
  rotulo: string;
  /** El nombre de la pieza. */
  titulo: string;
  /** Qué es, en dos o tres líneas. */
  texto: string;
};

export default function Cinta({ piezas, children }: { piezas: PiezaCinta[]; children?: ReactNode }) {
  const carril = useRef<HTMLDivElement>(null);
  const primera = useRef<HTMLUListElement>(null);
  const marco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = carril.current;
    const f = primera.current;
    const m = marco.current;
    if (!c || !f || !m) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ancho = f.offsetWidth;
    let posicion = 0;
    let velocidad = 0;
    let ultimoScroll = window.scrollY;
    let ultimoTiempo = performance.now();
    let vivo = true;
    let id = 0;
    /* Parada: mientras el ratón está encima o algo de dentro tiene el foco, la
       deriva se detiene para poder leer. El empuje del scroll sigue, porque si
       alguien baja con el ratón encima lo raro sería que no pasara nada. */
    let parada = false;

    /* El ancho de una copia cambia si cambia el ancho de la ventana —las fichas
       son `clamp`—, así que se vuelve a medir en vez de guardarlo una vez. */
    const remedir = new ResizeObserver(() => {
      ancho = f.offsetWidth || ancho;
    });
    remedir.observe(f);

    const entra = () => { parada = true; };
    const sale = () => { parada = false; };
    m.addEventListener('mouseenter', entra);
    m.addEventListener('mouseleave', sale);
    m.addEventListener('focusin', entra);
    m.addEventListener('focusout', sale);

    const paso = (ahora: number) => {
      if (!vivo) return;
      const dt = Math.min((ahora - ultimoTiempo) / 1000, 0.05); // el tope evita
      ultimoTiempo = ahora;                                     // saltos al volver de otra pestaña

      const y = window.scrollY;
      /* Un filtro de verdad, no una suma. Sumando en cada fotograma sobre una
         velocidad que sólo decae al 90 % el empuje sale multiplicado por diez
         —medido: 2.700 px por cada 600 de scroll en vez de 270—. Aquí el
         término nuevo entra con el peso que le deja el freno, así que en marcha
         estable la velocidad vale exactamente `delta × EMPUJE`. */
      velocidad = velocidad * FRENO + (y - ultimoScroll) * EMPUJE * (1 - FRENO);
      ultimoScroll = y;
      if (velocidad > TOPE) velocidad = TOPE;
      else if (velocidad < -TOPE) velocidad = -TOPE;

      posicion -= velocidad;
      if (!parada) posicion -= DERIVA * dt;

      /*
       * Y AQUÍ ESTÁ EL ARREGLO. La posición se envuelve entre −ancho y 0.
       *
       * El `%` de JavaScript conserva el signo del dividendo, así que con una
       * posición positiva —que es lo que pasa al SUBIR— daría un resto positivo
       * y la cinta se seguiría yendo a la derecha. La doble vuelta la normaliza
       * primero a [0, ancho) y después se le resta el ancho.
       */
      if (ancho > 0) posicion = (((posicion % ancho) + ancho) % ancho) - ancho;

      c.style.transform = `translate3d(${posicion.toFixed(2)}px,0,0)`;
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);

    return () => {
      vivo = false;
      cancelAnimationFrame(id);
      remedir.disconnect();
      m.removeEventListener('mouseenter', entra);
      m.removeEventListener('mouseleave', sale);
      m.removeEventListener('focusin', entra);
      m.removeEventListener('focusout', sale);
    };
  }, []);

  return (
    <div className="cinta">
      {/* El marco es lo que recorta, y también lo que se puede arrastrar con el
          dedo: en un teléfono, tirar de la fila es lo primero que prueba
          cualquiera. */}
      <div className="cinta-marco" ref={marco}>
        <div className="cinta-carril" ref={carril}>
          {Array.from({ length: COPIAS }, (_, copia) => (
            /* Sólo la primera copia se lee. Sin `aria-hidden` en las otras,
               quien navega con un lector de pantalla se encuentra las cinco
               piezas cuatro veces seguidas sin manera de saber que es la misma
               lista. Y la primera es la que se mide para envolver. */
            <ul
              key={copia}
              className="cinta-fila"
              ref={copia === 0 ? primera : undefined}
              aria-hidden={copia > 0 || undefined}
            >
              {piezas.map((p) => (
                <li className="cinta-pieza" key={copia + '-' + p.titulo}>
                  <span className="cinta-rotulo">{p.rotulo}</span>
                  <h3 className="cinta-titulo">{p.titulo}</h3>
                  <p className="cinta-texto">{p.texto}</p>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
