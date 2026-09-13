'use client';

import { Fragment, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * LA PORTADA: EL ÁRBOL, A PANTALLA COMPLETA, CRECIENDO CUANDO TÚ BAJAS
 * ============================================================================
 *
 * El dibujo no está DENTRO de la portada: el dibujo ES la portada. Ocupa la
 * pantalla entera, de borde a borde, y encima —abajo, a la izquierda— hay tres
 * líneas de texto y un botón. Nada más.
 *
 * Y no se reproduce solo. Avanza al ritmo de la rueda: bajas y crece, subes y
 * vuelve atrás, paras y se para. Quien entra tarda dos segundos en darse cuenta
 * de que el dibujo le hace caso, y ese descubrimiento es lo que le hace seguir
 * bajando — que es justo lo que esta portada necesita que haga.
 *
 * ---------------------------------------------------------------------------
 * CÓMO FUNCIONA, EN UNA FRASE
 * ---------------------------------------------------------------------------
 * El bloque mide tres pantallas de alto. Dentro hay una escena PEGADA
 * (`position: sticky`) que ocupa exactamente una y se queda quieta mientras las
 * otras dos pasan por debajo. Ese recorrido —cuánto has bajado dentro del
 * bloque, de 0 a 1— se traduce en el segundo del vídeo que toca enseñar. Bajar
 * es adelantar la película a mano.
 *
 * ---------------------------------------------------------------------------
 * DOS VÍDEOS, NO UNO
 * ---------------------------------------------------------------------------
 * El dibujo es apaisado y un móvil es vertical. Recortar el apaisado para que
 * llene un móvil se lleva por delante la mitad del árbol — y, sobre todo, la
 * rama dorada de la derecha, que es la que cuenta la historia.
 *
 * Así que hay una versión vertical de verdad: el mismo dibujo entero, a lo
 * ancho de la pantalla, y el papel de arriba y de abajo ESTIRADO desde las
 * propias filas del borde del original y desenfocado. Como el papel de ese
 * dibujo es liso, el estirado se lee como papel y no como un truco — y encima
 * la sombra que cruza el vídeo cruza también el papel estirado, fotograma a
 * fotograma, porque sale del mismo sitio.
 *
 * Cuál se carga se decide aquí y no con el atributo `media` de `<source>`, que
 * es de los que unos navegadores respetan y otros no. Cada persona se descarga
 * uno solo: el que va a ver.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EL VÍDEO ESTÁ CODIFICADO APARTE
 * ---------------------------------------------------------------------------
 * Un mp4 normal solo guarda la imagen entera cada dos segundos; el resto son
 * diferencias. Para enseñar un segundo cualquiera, el navegador tiene que
 * retroceder a la última imagen entera y recomponer desde ahí — y eso, sesenta
 * veces por segundo, son tirones.
 *
 * Éstos van con una imagen entera cada CUATRO fotogramas. Pesan algo más por
 * segundo, pero se puede saltar a cualquier punto sin recomponer nada. Dos
 * megas el apaisado, uno el vertical.
 *
 * ---------------------------------------------------------------------------
 * EL SUAVIZADO
 * ---------------------------------------------------------------------------
 * El vídeo no salta al punto exacto donde está la página: se acerca a él un
 * 16 % por fotograma. Sin eso, una rueda de ratón —que no da pasos suaves, da
 * saltos de cien píxeles— hace que el árbol pegue tirones. Con eso, el árbol
 * «persigue» a la mano y el movimiento se lee como un ser vivo.
 *
 * ---------------------------------------------------------------------------
 * LO QUE NO HACE
 * ---------------------------------------------------------------------------
 * NO se reproduce solo. Ni al entrar, ni nunca. Sin scroll no pasa nada, y eso
 * es a propósito: el primer fotograma —el árbol desnudo con la rama dorada que
 * no llega a ninguna parte— ya cuenta la historia entero y quieto. Es lo que se
 * ve al compartir el enlace y lo que ve quien tiene el móvil en modo ahorro.
 *
 * NO gasta batería fuera de la vista: el bucle solo corre mientras el bloque
 * está en pantalla.
 *
 * CON `prefers-reduced-motion` se apaga entero: el bloque se queda del alto de
 * una pantalla, el vídeo en su cartel y los tres textos salen a la vez.
 */

/**
 * Dónde entra cada texto, en tanto por uno del recorrido.
 *
 * El primero está desde el segundo cero: hay que poder leer de qué va esto sin
 * haber tocado nada, y es lo que sale en el primer fotograma cuando se comparte
 * el enlace.
 */
const CORTES = [0.34, 0.64] as const;

/** Cuánto se acerca el vídeo a su destino en cada fotograma. */
const PERSIGUE = 0.16;

/**
 * Por debajo de esta proporción de pantalla se sirve el vídeo vertical.
 *
 * 5:4 no es un número redondo elegido a ojo: el árbol ocupa el 70 % central del
 * fotograma apaisado, y 1,25 dividido entre 1,778 da exactamente 0,703. O sea
 * que en una pantalla de 5:4 el recorte de `cover` llega justo al borde del
 * dibujo. Un pelo más estrecha y empezaría a comerse ramas — y la primera en
 * caer sería la dorada, que está a la derecha.
 */
const ES_VERTICAL = '(max-aspect-ratio: 5/4)';

/**
 * Un paso de la portada.
 *
 * El primero trae `nodo`: es el titular, y sale ENTERO desde el primer
 * fotograma. Es lo que ve quien comparte el enlace y quien tiene el móvil en
 * modo ahorro, así que no puede depender de que nadie mueva nada.
 *
 * Los otros dos traen `texto` y se escriben palabra a palabra según se baja.
 */
export type PasoPortada = {
  nodo?: React.ReactNode;
  texto?: string;
  /** La última frase, en granate. Es la que remata. */
  fuerte?: string;
  /** Sólo el último paso: el botón. */
  accion?: React.ReactNode;
};

/** Cuánto scroll tarda una frase en escribirse entera. */
const VENTANA = 0.15;

/** Parte una frase en palabras conservando los espacios entre ellas. */
function palabras(txt: string) {
  return txt.split(' ').filter(Boolean);
}

export default function PortadaArbol({ pasos }: { pasos: [PasoPortada, PasoPortada, PasoPortada] }) {
  const caja = useRef<HTMLDivElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const c = caja.current;
    const e = escena.current;
    const v = vid.current;
    if (!c || !e || !v) return;

    /* Qué vídeo toca. El webm solo hace falta para Firefox en Linux, que muchas
       veces viene sin los códecs de pago; el resto del mundo se lleva el mp4,
       que además busca fotograma por hardware. */
    const puedeMp4 = v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    const forma = window.matchMedia(ES_VERTICAL);

    const pon = (vertical: boolean) => {
      const cual = vertical ? 'arbol-vertical' : 'arbol-scroll';
      const nueva = `/video/${cual}.${puedeMp4 ? 'mp4' : 'webm'}`;
      if (v.src.endsWith(nueva)) return;
      /* Al girar el móvil se cambia de vídeo, y hay que devolverlo al mismo
         punto: si no, el árbol vuelve a estar pelado con la página a media
         altura. Los dos duran lo mismo, así que basta con el segundo. */
      const donde = v.currentTime;
      v.poster = vertical ? '/images/arbol-vertical-cartel.jpg' : '/images/arbol-scroll-cartel.jpg';
      v.src = nueva;
      c.classList.toggle('portada-vertical', vertical);
      if (donde > 0) v.addEventListener('loadedmetadata', () => { v.currentTime = donde; }, { once: true });
    };
    pon(forma.matches);
    const alGirar = (ev: MediaQueryListEvent) => pon(ev.matches);
    forma.addEventListener('change', alGirar);

    /*
     * MIENTRAS LA PORTADA ESTÁ EN PANTALLA, LA PÁGINA SE APARTA.
     *
     * Este atributo lo lee el CSS y lo leen los susurros, y hace dos cosas:
     *
     *   · LA BARRA SE VUELVE TRANSPARENTE. Con el vídeo ocupando la pantalla
     *     entera, la barra esmerilada blanca es una tira que corta el dibujo
     *     por arriba. Aquí no estorba a nadie: en la portada no hay texto
     *     arriba, y la marca y el botón se leen igual sobre el papel.
     *   · LOS SUSURROS SE CALLAN. Son las burbujas que salen del chat contando
     *     cosas de la Kábala. En medio de una portada de tres frases, una caja
     *     gris con cuatro renglones es lo único que sobra en la pantalla.
     *
     * Se borra al desmontar para que ninguna otra página herede una barra
     * invisible ni un chat mudo.
     */
    const raiz = document.documentElement;
    const enPortada = (si: boolean) => {
      const v = si ? 'si' : 'no';
      if (raiz.dataset.portada !== v) {
        raiz.dataset.portada = v;
        window.dispatchEvent(new Event('iris:portada'));
      }
    };
    enPortada(true);

    /* Nada de estado de React en el bucle: escribe directamente en el DOM.
       Sesenta re-renders por segundo para cambiar una opacidad es el camino más
       corto a que una web se sienta pesada en un móvil. */
    const limpia = () => {
      forma.removeEventListener('change', alGirar);
      delete raiz.dataset.portada;
      window.dispatchEvent(new Event('iris:portada'));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      c.classList.add('portada-quieta');
      e.dataset.paso = 'todos';
      e.querySelectorAll('.pal').forEach((w) => w.classList.add('pal-si'));
      return limpia;
    }

    /*
     * EL ARRANQUE EN EL IPHONE.
     *
     * Safari en móvil no pinta un fotograma buscado hasta que el vídeo se ha
     * reproducido al menos una vez: se queda en el cartel y el árbol no crece
     * por mucho que bajes. Se arranca y se para en el mismo suspiro —sin
     * sonido, así que el sistema lo permite— y a partir de ahí los saltos de
     * tiempo sí se dibujan.
     */
    v.play().then(() => v.pause()).catch(() => {});

    /*
     * EL FONDO DE LA PÁGINA TOMA LA LUZ DEL DIBUJO.
     *
     * El vídeo tiene una sombra que lo recorre: el papel empieza en un crema
     * claro (#ebe9e5) y a mitad de la animación baja hasta un gris (#c8c4bd).
     * Cuarenta puntos de diferencia. Con un color de fondo fijo se ve el
     * rectángulo del vídeo como un parche sucio en cuanto la pantalla no tiene
     * la proporción exacta del vídeo.
     *
     * Así que el fondo no es fijo. Cada tres fotogramas se dibuja el vídeo en
     * un lienzo de ocho por ocho —cuesta lo que no está escrito—, se promedia
     * el ANILLO DE FUERA (que siempre es papel, nunca tinta) y ese color pasa a
     * ser el fondo del bloque: la página y el dibujo son el mismo papel, y la
     * sombra que cruza el vídeo cruza también la pantalla.
     */
    const lienzo = document.createElement('canvas');
    lienzo.width = 8;
    lienzo.height = 8;
    const pincel = lienzo.getContext('2d', { willReadFrequently: true });
    let mide = pincel !== null;

    const tomaLaLuz = () => {
      if (!mide || !pincel || v.readyState < 2) return;
      try {
        pincel.drawImage(v, 0, 0, 8, 8);
        const d = pincel.getImageData(0, 0, 8, 8).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (x > 0 && x < 7 && y > 0 && y < 7) continue;
            const i = (y * 8 + x) * 4;
            r += d[i];
            g += d[i + 1];
            b += d[i + 2];
            n++;
          }
        }
        c.style.setProperty('--portada-fondo', `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`);
      } catch {
        mide = false;
      }
    };

    /*
     * LA FRASE SE ESCRIBE MIENTRAS BAJAS.
     *
     * Cada palabra es un `<span>`. Según avanza el recorrido se les va poniendo
     * una clase, de la primera a la última, y el CSS las trae de un gris casi
     * invisible y desenfocado a su sitio. No es un adorno: es lo que hace que
     * la frase se LEA al ritmo al que se baja, en vez de aparecer de golpe
     * cuando ya has pasado de largo.
     *
     * Se escribe en el DOM, no en el estado de React —sesenta re-renders por
     * segundo para cambiar una opacidad es el camino corto a que un móvil vaya
     * a tirones— y sólo se tocan las palabras que cruzan el umbral en ese
     * fotograma, nunca las veinte de golpe.
     *
     * Y funciona en los dos sentidos: al subir se des-escribe sola.
     */
    const grupos = Array.from(e.querySelectorAll<HTMLElement>('.portada-paso')).map((n) => ({
      pal: Array.from(n.querySelectorAll<HTMLElement>('.pal')),
      vistas: 0,
    }));

    const escribe = () => {
      for (let i = 0; i < grupos.length; i++) {
        const g = grupos[i];
        if (!g.pal.length) continue;
        const arranca = i === 0 ? 0 : CORTES[i - 1];
        const q = Math.min(1, Math.max(0, (suave - arranca) / VENTANA));
        const n = Math.round(q * g.pal.length);
        if (n === g.vistas) continue;
        const a = Math.min(g.vistas, n);
        const b = Math.max(g.vistas, n);
        for (let k = a; k < b; k++) g.pal[k].classList.toggle('pal-si', k < n);
        g.vistas = n;
      }
    };

    let suave = 0;
    let id = 0;
    let vivo = false;
    let cuenta = 0;

    const pinta = () => {
      const r = c.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      const meta = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 0;

      suave += (meta - suave) * PERSIGUE;
      /* Cerrar del todo. Si no, el número se queda temblando en la sexta cifra
         decimal para siempre y el vídeo pide un salto en cada fotograma. */
      if (Math.abs(meta - suave) < 0.0008) suave = meta;

      const dur = v.duration;
      if (dur && Number.isFinite(dur)) {
        /* Un pelo antes del final: pedir el último fotograma exacto deja el
           vídeo en negro en algunos navegadores. */
        const t = suave * (dur - 0.06);
        /* Y no se pide un salto si ya estamos ahí o si el anterior sigue en
           curso: encadenar búsquedas es justo lo que provoca el tartamudeo. */
        if (!v.seeking && Math.abs(v.currentTime - t) > 0.016) v.currentTime = t;
      }

      const paso = suave >= CORTES[1] ? '2' : suave >= CORTES[0] ? '1' : '0';
      if (e.dataset.paso !== paso) e.dataset.paso = paso;

      escribe();

      if (cuenta++ % 3 === 0) tomaLaLuz();

      id = requestAnimationFrame(pinta);
    };

    /* Y al salir de pantalla, las palabras se dejan como tienen que quedar.
       Si el bucle se apaga a media escritura —pasa bajando de un golpe de
       rueda— las que faltaban se quedan apagadas para siempre. Por encima de la
       ventana: todo escrito. Por debajo: todo por escribir. Nunca a medias. */
    const cierraPalabras = () => {
      const pasado = c.getBoundingClientRect().bottom < 0;
      for (const g of grupos) {
        g.pal.forEach((w) => w.classList.toggle('pal-si', pasado));
        g.vistas = pasado ? g.pal.length : 0;
      }
    };

    const ojo = new IntersectionObserver(
      ([x]) => {
        enPortada(x.isIntersecting);
        if (x.isIntersecting && !vivo) {
          vivo = true;
          id = requestAnimationFrame(pinta);
        } else if (!x.isIntersecting && vivo) {
          vivo = false;
          cancelAnimationFrame(id);
          cierraPalabras();
        }
      },
      { threshold: 0 },
    );
    ojo.observe(c);

    return () => {
      ojo.disconnect();
      cancelAnimationFrame(id);
      limpia();
    };
  }, []);

  return (
    <div ref={caja} className="portada">
      <div ref={escena} className="portada-escena" data-paso="0">
        {/* Sin `src` en el servidor: lo pone el efecto según la forma de la
            pantalla, para que nadie se descargue el vídeo que no va a ver.
            Hasta entonces manda el cartel. */}
        <video
          ref={vid}
          className="portada-video"
          poster="/images/arbol-scroll-cartel.jpg"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          tabIndex={-1}
        />

        {/* Un velo de papel que sube desde abajo. El dibujo es tinta finísima
            sobre crema y el texto va encima: sin esto, una rama cruzando una
            letra la parte por la mitad. Es un degradado del propio color del
            papel —el que el bucle acaba de medir— así que no se ve como un
            filtro puesto encima: se ve como que ahí abajo hay más luz. */}
        <span className="portada-velo" aria-hidden />

        {/* Los tres textos ocupan la MISMA casilla de una rejilla, así que se
            cruzan en el sitio en vez de empujarse. */}
        <div className="portada-textos">
          {pasos.map((p, i) => (
            <div key={i} className="portada-paso" data-i={i}>
              {p.nodo}
              {p.texto && (
                <p className="portada-frase">
                  {/* EL ESPACIO VA FUERA DEL SPAN, y esto no es un detalle: la
                      palabra es `inline-block` para poder moverse, y un
                      inline-block se COME el espacio que tenga dentro al final.
                      Con el espacio dentro, la frase salía escrita del tirón:
                      «Noestucarácter.Noesmalasuerte.». Fuera, el navegador lo
                      trata como el hueco entre dos palabras de siempre y la
                      línea parte donde tiene que partir. */}
                  {palabras(p.texto).map((w, k) => (
                    <Fragment key={k}>
                      <span className="pal">{w}</span>{' '}
                    </Fragment>
                  ))}
                  {p.fuerte && (
                    <b>
                      {palabras(p.fuerte).map((w, k) => (
                        <Fragment key={k}>
                          <span className="pal">{w}</span>{' '}
                        </Fragment>
                      ))}
                    </b>
                  )}
                </p>
              )}
              {p.accion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
