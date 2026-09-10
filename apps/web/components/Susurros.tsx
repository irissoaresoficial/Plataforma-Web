'use client';

import { useEffect, useState } from 'react';

/**
 * ============================================================================
 * LOS SUSURROS — LO QUE IRIS VA PENSANDO MIENTRAS TÚ BAJAS
 * ============================================================================
 *
 * Frases cortas que salen del botón del chat como pensamientos, se quedan unos
 * segundos y se reabsorben. Explican en palabras llanas de qué va esto —la
 * Kábala, la numerología, el árbol, los ciclos— sin abrir un bloque nuevo para
 * contarlo.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ SALEN DEL CHAT Y NO DE UNA ESQUINA CUALQUIERA
 * ---------------------------------------------------------------------------
 * La primera versión las ponía en la esquina de abajo a la izquierda, sueltas.
 * Funcionaba, pero no se entendía QUIÉN habla: una caja de cristal aparece sola
 * en un borde de la pantalla y el cerebro la lee como un anuncio, que es
 * exactamente lo que uno ha aprendido a no mirar.
 *
 * Ahora salen del botón donde está la cara de Iris, con la cola de dos bolitas
 * que en cualquier viñeta significa «esto lo está pensando ella». Cambia dos
 * cosas de golpe: se sabe de quién es la voz, y el botón de reservar —que es la
 * única forma de reservar en toda la web— deja de ser un botón parado en una
 * esquina y pasa a ser alguien que está ahí.
 *
 * ---------------------------------------------------------------------------
 * LAS REGLAS QUE HACEN QUE ESTO NO SEA UN INFIERNO
 * ---------------------------------------------------------------------------
 *   1. UNA SOLA A LA VEZ, y con silencio entre medias. Dos frases flotando
 *      compiten entre ellas y con el texto de la página.
 *   2. SÓLO CUANDO EL BOTÓN ESTÁ. Si el botón no se ve —la portada a pantalla
 *      completa lo esconde, y el chat abierto lo tapa— no hay nada de donde
 *      puedan salir, así que no salen. Un pensamiento sin cabeza es un cartel.
 *   3. SÓLO EN PANTALLA ANCHA (1180 px). En un móvil el pensamiento taparía
 *      media pantalla.
 *   4. NO SE TOCAN Y NO ROBAN EL FOCO. `pointer-events: none` y `aria-hidden`:
 *      no se pueden pulsar por error, no salen en el tabulador y un lector de
 *      pantalla no las lee en mitad de un párrafo.
 *
 * Y una quinta que no es negociable: con `prefers-reduced-motion` no se monta
 * ninguna. Para quien ha pedido que las cosas no se muevan, esto es exactamente
 * lo que ha pedido que no pase.
 */

/** Cuánto está una frase en pantalla, cuánto tarda en reabsorberse, y cuánto
 *  silencio hay después. La salida tiene que cuadrar con la animación del CSS. */
const DURA = 7200;
const SALIDA = 460;
const SILENCIO = 5200;
const PRIMERA = 3400;

/**
 * Lo que piensa.
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
  { de: 'Kábala', txt: '«Kábala» quiere decir recibir. No hay que creer en nada: es un mapa de cómo eres por dentro, y los mapas se miran, no se creen.' },
  { de: 'Numerología', txt: 'Tu fecha de nacimiento no la elegiste tú. Por eso dice tanto: es el único dato tuyo que ya estaba escrito antes de que llegaras.' },
  { de: 'El árbol', txt: 'El Árbol de la Vida son diez paradas por las que pasa todo lo que te ocurre: desde que se te ocurre algo hasta que lo haces de verdad.' },
  { de: 'Tu familia', txt: '¿Te has fijado en que en tu familia se repite siempre lo mismo? Eso no es carácter. Es algo que alguien no pudo cerrar y sigue buscando quién lo cierre.' },
  { de: 'Los senderos', txt: 'Entre esas diez paradas hay veintidós caminos. En tu carta se encienden los que te tocan a ti, y cada uno cuenta algo tuyo.' },
  { de: 'Numerología', txt: 'No adivina el futuro. Ordena el presente: te enseña de dónde viene eso que ya te está pasando.' },
  { de: 'El Tikun', txt: 'Tikun significa reparar. Lo que te llega de tu familia no hay que aguantarlo: se repara y se le devuelve a quien era.' },
  { de: 'Los ciclos', txt: 'La vida no va en línea recta, va por tramos. Saber en cuál estás cambia lo que merece la pena intentar este año.' },
  { de: 'Kábala', txt: 'No es una religión, ni es para elegidos. Es un mapa. Y un mapa sirve para dejar de dar vueltas en círculo.' },
  { de: 'Tu nombre', txt: 'Tu nombre también cuenta. Fue lo primero que alguien decidió por ti, y viene con lo que esa persona esperaba de ti.' },
];

export default function Susurros() {
  /** Qué frase toca y en qué momento de su vida está. */
  const [frase, setFrase] = useState<{ i: number; yendose: boolean } | null>(null);

  /**
   * SI NO ESTÁ EL BOTÓN, NO HAY PENSAMIENTO.
   *
   * El ChatWidget publica en el `<html>` si su botón se ve o no —lo esconde
   * mientras la portada ocupa la pantalla, y mientras el chat está abierto—.
   * Se lee de ahí en vez de levantar un contexto: son dos componentes que no se
   * conocen y que viven en páginas distintas.
   */
  const [hayBoton, setHayBoton] = useState(false);
  useEffect(() => {
    const mira = () => setHayBoton(document.documentElement.dataset.iris === 'si');
    mira();
    window.addEventListener('iris:boton', mira);
    return () => window.removeEventListener('iris:boton', mira);
  }, []);

  useEffect(() => {
    /* Ni con el movimiento reducido, ni en pantallas donde el margen es
       contenido, ni mientras no haya botón del que salir. Las comprobaciones van
       aquí y no en el CSS porque así ni se monta el temporizador. */
    if (typeof window === 'undefined') return;
    if (!hayBoton) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1180px)').matches) return;

    let n = 0;
    let vivo = true;
    const relojes: ReturnType<typeof setTimeout>[] = [];
    const luego = (ms: number, f: () => void) =>
      relojes.push(setTimeout(() => vivo && f(), ms));

    const ciclo = () => {
      const i = n % FRASES.length;
      n += 1;
      setFrase({ i, yendose: false });
      /* Se va como vino: primero se marca la salida —el CSS la encoge de vuelta
         hacia el botón— y sólo cuando esa animación ha terminado se desmonta. */
      luego(DURA, () => {
        setFrase({ i, yendose: true });
        luego(SALIDA, () => {
          setFrase(null);
          luego(SILENCIO, ciclo);
        });
      });
    };
    luego(PRIMERA, ciclo);

    return () => {
      vivo = false;
      relojes.forEach(clearTimeout);
      setFrase(null);
    };
  }, [hayBoton]);

  if (!frase) return null;
  const f = FRASES[frase.i];

  return (
    <aside className={`susurro${frase.yendose ? ' susurro-sale' : ''}`} aria-hidden="true">
      <span className="susurro-de">{f.de}</span>
      <p>{f.txt}</p>
      {/* La cola de la viñeta: dos bolitas que bajan hacia la cara de Iris. Van
          como elementos y no como `::before`/`::after` porque cada una entra con
          su propio retraso, y encadenar dos animaciones distintas en
          pseudoelementos del mismo nodo se vuelve ilegible enseguida. */}
      <i className="susurro-cola susurro-cola-1" />
      <i className="susurro-cola susurro-cola-2" />
    </aside>
  );
}
