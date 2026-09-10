'use client';

import { useEffect, useState } from 'react';

/**
 * ============================================================================
 * LOS SUSURROS — LO QUE SE APRENDE SIN QUERER, MIENTRAS SE BAJA
 * ============================================================================
 *
 * Frases cortas que asoman por los márgenes de la página mientras se navega,
 * se quedan unos segundos y se van. Explican en palabras llanas de qué va esto
 * —la Kábala, la numerología, el árbol, los ciclos— sin abrir un bloque nuevo
 * para contarlo.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ASÍ Y NO EN UNA SECCIÓN
 * ---------------------------------------------------------------------------
 * Esta web vende dos consultas y una de ellas es de Kábala. Quien no sabe qué
 * es la Kábala no compra la más cara: no por el precio, sino porque no sabe qué
 * está comprando. Pero tampoco se puede parar la página para dar una clase —
 * nadie ha venido a estudiar.
 *
 * Los susurros resuelven las dos cosas: enseñan sin interrumpir. Quien va a lo
 * suyo los ignora; quien tiene curiosidad los lee y, al llegar a la ficha de
 * 333 €, ya sabe de qué le hablan.
 *
 * ---------------------------------------------------------------------------
 * LAS TRES REGLAS QUE HACEN QUE ESTO NO SEA UN INFIERNO
 * ---------------------------------------------------------------------------
 * Un elemento que aparece solo encima de una página es, casi siempre, una mala
 * idea. Éstas son las condiciones bajo las que no lo es:
 *
 *   1. UNA SOLA A LA VEZ, y con silencio entre medias. Dos frases flotando
 *      compiten entre ellas y con el texto de la página.
 *   2. SIEMPRE EN LA MISMA ESQUINA, la de abajo a la izquierda, y sólo si la
 *      pantalla es ancha. Por debajo de 1180 px no sale ninguna: en un móvil
 *      esto sería puro estorbo.
 *   3. NO SE TOCAN Y NO ROBAN EL FOCO. `pointer-events: none` y
 *      `aria-hidden`: no se pueden pulsar por error, no aparecen en el
 *      tabulador y un lector de pantalla no las lee en mitad de un párrafo.
 *
 * Y una cuarta que no es negociable: con `prefers-reduced-motion` no se monta
 * ninguna. Para quien ha pedido que las cosas no se muevan, esto es exactamente
 * lo que ha pedido que no pase.
 */

/** Cuánto está una frase en pantalla, y cuánto silencio hay después. */
const DURA = 7200;
const SILENCIO = 5200;
const PRIMERA = 3400;

/**
 * Lo que dicen.
 *
 * Cada una es una idea entera en una línea y media. Nada de aquí es inventado:
 * el árbol, los 22 senderos, los tres caminos y el Tikun salen del mismo
 * material que la sección «Qué es la Kábala», y lo de la fecha y los ciclos, de
 * lo que la plataforma calcula de verdad.
 *
 * El orden importa: alternan Kábala y numerología para que quien pille dos
 * seguidas no se lleve dos veces lo mismo.
 */
const FRASES = [
  { de: 'Kábala', txt: '«Kábala» significa recibir. No hay que creer en nada: es una forma de leer cómo está montada una persona por dentro.' },
  { de: 'Numerología', txt: 'Tu fecha de nacimiento no se elige. Por eso dice tanto: es el único dato tuyo que estaba escrito antes de que tú llegaras.' },
  { de: 'El árbol', txt: 'El Árbol de la Vida son diez estaciones por las que pasa todo lo que te ocurre, desde que lo piensas hasta que lo haces.' },
  { de: 'Transgeneracional', txt: 'Lo que se repite en una familia no es carácter. Es una historia que alguien no pudo cerrar, y que sigue buscando quien la cierre.' },
  { de: 'Los senderos', txt: 'Veintidós caminos unen esas diez estaciones. En tu carta se encienden los que te tocan, y cada uno tiene su arcano.' },
  { de: 'Numerología', txt: 'No predice nada. Ordena: te enseña de dónde viene lo que ya te está pasando.' },
  { de: 'El Tikun', txt: 'Tikun quiere decir rectificación. Lo que se hereda no se aguanta: se repara y se devuelve a su sitio.' },
  { de: 'Los ciclos', txt: 'La vida no va en línea recta, va por tramos. Saber en cuál estás cambia lo que tiene sentido intentar hoy.' },
  { de: 'Kábala', txt: 'No es una religión ni cosa de iniciados. Es un mapa, y los mapas se leen para no andar en círculos.' },
  { de: 'Tu nombre', txt: 'El nombre también cuenta. Es lo primero que alguien decidió por ti, y viene con el encargo de quien lo eligió.' },
];

/*
 * SIEMPRE EN LA MISMA ESQUINA, Y ES LA DE ABAJO A LA IZQUIERDA.
 *
 * La primera versión las repartía por cuatro sitios de los márgenes, y salió
 * mal a la primera prueba: la web tiene bloques a sangre —el retrato de «Quién
 * soy» ocupa el ancho entero— y ahí no hay margen que valga. Un susurro cayó
 * justo encima del nombre de Iris.
 *
 * Una sola esquina, siempre la misma, arregla las dos cosas: no puede tapar un
 * titular (los titulares no viven abajo del todo) y se vuelve predecible — a la
 * segunda ya sabes de dónde salen y las lees o las ignoras a voluntad. La de
 * abajo a la derecha está ocupada por el botón del chat.
 */

export default function Susurros() {
  const [i, setI] = useState<number | null>(null);

  useEffect(() => {
    /* Ni con el movimiento reducido, ni en pantallas donde el margen es
       contenido. Las dos comprobaciones van aquí y no en el CSS porque así ni
       siquiera se monta el temporizador. */
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1180px)').matches) return;

    let n = 0;
    let vivo = true;
    const relojes: ReturnType<typeof setTimeout>[] = [];

    const ciclo = () => {
      if (!vivo) return;
      setI(n % FRASES.length);
      n += 1;
      relojes.push(
        setTimeout(() => {
          if (!vivo) return;
          setI(null);
          relojes.push(setTimeout(ciclo, SILENCIO));
        }, DURA)
      );
    };
    relojes.push(setTimeout(ciclo, PRIMERA));

    return () => {
      vivo = false;
      relojes.forEach(clearTimeout);
    };
  }, []);

  if (i === null) return null;
  const f = FRASES[i];

  return (
    <aside className="susurro" aria-hidden="true">
      <span className="susurro-de">{f.de}</span>
      <p>{f.txt}</p>
    </aside>
  );
}
