'use client';

/**
 * LA CINTA: UNA FILA QUE NO SE ACABA
 *
 * ===========================================================================
 * POR QUÉ ESTO Y NO UNA REJILLA
 * ===========================================================================
 * Las cinco piezas de la numerología —camino de vida, expresión, ciclos,
 * desafíos y la herencia— estaban en una rejilla de cuatro columnas. Cinco no
 * se divide entre cuatro, así que la quinta caía sola en la segunda fila con
 * tres huecos vacíos al lado. En la captura de Gerson se ve exactamente eso:
 * media pantalla en blanco debajo de «La herencia».
 *
 * Y el problema de fondo no era la aritmética. Una rejilla dice «esto es una
 * lista, léela entera»; y nadie lee cinco párrafos seguidos en medio de una
 * página de venta. Una cinta dice otra cosa: «esto sigue, coge lo que te
 * llame». Se mira, no se lee — que es exactamente lo que hace alguien que
 * todavía está decidiendo si esto le interesa.
 *
 * ===========================================================================
 * CÓMO SE HACE QUE NO SE ACABE, Y POR QUÉ SIN JAVASCRIPT
 * ===========================================================================
 * El contenido va DOS VECES dentro del carril, y el carril se desplaza de 0 a
 * −50 % en bucle. Cuando llega al −50 % está enseñando el principio de la
 * segunda copia, que es idéntico al principio de la primera: el salto de vuelta
 * a 0 no se ve. No hay reloj, ni medición, ni un `requestAnimationFrame`
 * girando — lo mueve el compositor del navegador, así que no gasta batería ni
 * se entrecorta cuando el hilo principal está ocupado.
 *
 * LA SEGUNDA COPIA VA CON `aria-hidden`. Si no, quien navega con un lector de
 * pantalla se encuentra las cinco piezas dos veces seguidas y no hay manera de
 * saber que es la misma lista.
 *
 * SE PARA AL PASAR POR ENCIMA Y AL LLEGAR CON EL TABULADOR. Una cinta que no
 * se para es una cinta de la que no se puede leer nada: el texto se escapa
 * justo cuando has empezado. Y con `prefers-reduced-motion` no se mueve en
 * absoluto: se queda quieta y se recorre con el dedo, que es lo que pide quien
 * marca esa casilla.
 *
 * Y SE PUEDE ARRASTRAR. `overflow-x: auto` en el marco: en un teléfono, tirar
 * de la fila con el dedo es lo primero que prueba cualquiera, y sin esto el
 * gesto no hacía nada.
 */

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * CUÁNTO EMPUJA LA RUEDA.
 *
 * Píxeles que se desplaza la cinta por cada píxel que se baja. A 0,45 se nota
 * claramente que la fila responde al gesto sin que el texto salga disparado y
 * deje de poder leerse, que es lo que pasa por encima de 1.
 */
const EMPUJE = 0.45;

/** Cuánto se frena el empuje en cada fotograma cuando se deja de bajar. */
const FRENO = 0.9;

/**
 * Tope de píxeles por fotograma, para que un manotazo en la rueda no dispare
 * la fila. Sesenta por fotograma son unos 3.600 al segundo: se nota mucho y
 * todavía se puede seguir con el ojo.
 */
const TOPE = 60;

export type PiezaCinta = {
  /** Lo que se lee arriba, en dorado: de dónde sale este número. */
  rotulo: string;
  /** El nombre de la pieza. */
  titulo: string;
  /** Qué es, en dos o tres líneas. */
  texto: string;
};

export default function Cinta({
  piezas,
  velocidad = 46,
  children,
}: {
  piezas: PiezaCinta[];
  /** Segundos que tarda en dar una vuelta entera. Más alto, más despacio. */
  velocidad?: number;
  /** Por si algún día hace falta meter algo detrás de la cinta. */
  children?: ReactNode;
}) {
  /*
   * LA RUEDA EMPUJA LA CINTA.
   *
   * La cinta ya se movía sola, y eso es decoración: pasa lo mismo estés
   * mirando o no. Esto es otra cosa — la fila RESPONDE al gesto: bajas y se
   * adelanta, subes y retrocede, paras y se va frenando hasta volver a su
   * deriva. Es lo que pidió Gerson: «que la web baje también a medida que haga
   * scroll, puede ser más interactiva».
   *
   * Cómo está montado, y por qué así:
   *
   *  · La deriva de fondo la sigue haciendo el CSS con su `@keyframes`, sobre
   *    `.cinta-carril`. La mueve el compositor, no gasta nada y no se
   *    entrecorta aunque el hilo principal esté ocupado.
   *  · El empuje del scroll va en una capa APARTE, la de fuera. Dos transformes
   *    en dos elementos se suman solos; metidos en el mismo, el de JavaScript
   *    pisaría al de la animación en cada fotograma.
   *  · Se escribe DIRECTAMENTE EN EL DOM dentro del rAF, sin pasar por el
   *    estado de React. Sesenta repintados por segundo de un componente con
   *    diez fichas dentro es exactamente la clase de cosa que hace que una web
   *    vaya a tirones en un teléfono.
   *  · Y se frena solo con una multiplicación por 0,9: sin eso, al soltar la
   *    rueda la cinta se queda clavada donde estaba y el gesto se lee como un
   *    corte en vez de como inercia.
   */
  const empuje = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ultimo = window.scrollY;
    let velocidad = 0;
    let posicion = 0;
    let vivo = true;

    const paso = () => {
      if (!vivo) return;
      const y = window.scrollY;
      /*
       * MEDIDO: LA PRIMERA VERSIÓN EMPUJABA DIEZ VECES MÁS DE LO QUE PEDÍA.
       *
       * Decía `velocidad += delta * EMPUJE` y después `velocidad *= FRENO`.
       * Sumar en cada fotograma sobre una velocidad que sólo decae al 90 % no
       * da `delta * EMPUJE`: da `delta * EMPUJE / (1 - FRENO)`, o sea diez
       * veces más. Bajando 600 px la cinta se desplazaba 2.700 en vez de 270,
       * que es lo que salió al medirlo.
       *
       * Esto es un filtro de verdad: el término nuevo entra con el peso que le
       * queda al freno, así que en marcha estable la velocidad vale
       * exactamente `delta * EMPUJE`. El freno sigue haciendo lo suyo —suavizar
       * la entrada y dejar inercia al soltar— pero ya no multiplica.
       */
      velocidad = velocidad * FRENO + (y - ultimo) * EMPUJE * (1 - FRENO);
      ultimo = y;
      /* Y un tope, para que un manotazo no lance la fila fuera de lo legible. */
      if (velocidad > TOPE) velocidad = TOPE;
      else if (velocidad < -TOPE) velocidad = -TOPE;
      /* Por debajo de un décimo de píxel ya no se ve nada: se pone a cero para
         no dejar un rAF escribiendo transformes eternamente. */
      if (Math.abs(velocidad) < 0.1) velocidad = 0;
      posicion -= velocidad;
      if (empuje.current) empuje.current.style.transform = `translate3d(${posicion.toFixed(2)}px,0,0)`;
      requestAnimationFrame(paso);
    };
    const id = requestAnimationFrame(paso);
    return () => {
      vivo = false;
      cancelAnimationFrame(id);
    };
  }, []);

  const fila = (duplicada: boolean) => (
    <ul className="cinta-fila" aria-hidden={duplicada || undefined}>
      {piezas.map((p) => (
        <li className="cinta-pieza" key={(duplicada ? 'b-' : 'a-') + p.titulo}>
          <span className="cinta-rotulo">{p.rotulo}</span>
          <h3 className="cinta-titulo">{p.titulo}</h3>
          <p className="cinta-texto">{p.texto}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="cinta">
      {/* El marco es lo que recorta, y también lo que se puede arrastrar. */}
      <div className="cinta-marco">
        {/* Dos capas y no una: la de fuera lleva el empuje de la rueda y la de
            dentro la deriva del CSS. Los dos transformes se suman solos. */}
        <div className="cinta-empuje" ref={empuje}>
          <div className="cinta-carril" style={{ ['--cinta-vuelta' as string]: `${velocidad}s` }}>
            {fila(false)}
            {fila(true)}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
