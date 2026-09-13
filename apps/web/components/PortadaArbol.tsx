'use client';

import { useEffect, useRef } from 'react';

/**
 * ============================================================================
 * LA PORTADA: EL ÁRBOL CRECE CUANDO TÚ BAJAS
 * ============================================================================
 *
 * Quien entra no ve una web con un vídeo puesto de fondo. Ve un dibujo a tinta
 * —un árbol de familia— y, en cuanto mueve la rueda del ratón, el dibujo CRECE.
 * Para. Retrocede si sube. El árbol no va a su aire: va al ritmo de la mano de
 * quien está mirando.
 *
 * Eso es todo el truco, y es la diferencia entre «una web bonita» y «esta web
 * hace algo». Un vídeo que se reproduce solo es decoración y se ignora en dos
 * segundos. Un vídeo que responde obliga a probarlo, y probarlo es quedarse.
 *
 * ---------------------------------------------------------------------------
 * CÓMO FUNCIONA, EN UNA FRASE
 * ---------------------------------------------------------------------------
 * El bloque mide casi tres pantallas de alto. Dentro hay una escena PEGADA
 * (`position: sticky`) que ocupa exactamente una pantalla y se queda quieta
 * mientras las otras dos pasan por debajo. Ese recorrido —cuánto has bajado
 * dentro del bloque, de 0 a 1— se traduce en el segundo del vídeo que toca
 * enseñar. Bajar es adelantar la película a mano.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EL VÍDEO ESTÁ CODIFICADO APARTE
 * ---------------------------------------------------------------------------
 * Un mp4 normal solo guarda la imagen entera cada dos segundos; el resto son
 * diferencias. Para enseñar un segundo cualquiera, el navegador tiene que
 * retroceder a la última imagen entera y recomponer desde ahí — y eso, sesenta
 * veces por segundo, son tirones.
 *
 * `arbol-scroll.mp4` está codificado con una imagen entera cada CUATRO
 * fotogramas. Pesa algo más por segundo, pero se puede saltar a cualquier punto
 * sin recomponer nada. Dos megas por diez segundos: menos que una foto de las
 * que ya hay en esta web.
 *
 * ---------------------------------------------------------------------------
 * EL SUAVIZADO
 * ---------------------------------------------------------------------------
 * El vídeo no salta al punto exacto donde está la página: se acerca a él un
 * 16 % por fotograma. Sin eso, una rueda de ratón —que no da pasos suaves, da
 * saltos de cien píxeles— hace que el árbol pegue tirones. Con eso, el árbol
 * «persigue» a la mano y el movimiento se lee como un ser vivo y no como una
 * barra de progreso.
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
 * está en pantalla, y un observador lo apaga en cuanto sale.
 *
 * CON `prefers-reduced-motion` se apaga entero: el bloque se queda del alto de
 * su contenido, el vídeo se queda en su cartel, y los tres textos salen
 * apilados a la vez. Quien ha pedido que nada se mueva no tiene que bajar tres
 * pantallas para llegar al botón.
 */

/**
 * Dónde entra cada texto, en tanto por uno del recorrido.
 *
 * El primero está desde el segundo cero: hay que poder leer de qué va esto sin
 * haber tocado nada. Los otros dos llegan cuando el árbol ya ha crecido lo
 * bastante como para que se note que crece.
 */
const CORTES = [0.32, 0.62] as const;

/** Cuánto se acerca el vídeo a su destino en cada fotograma. */
const PERSIGUE = 0.16;

export default function PortadaArbol({
  pasos,
}: {
  /** Los tres textos, en orden. El primero se ve sin bajar. */
  pasos: [React.ReactNode, React.ReactNode, React.ReactNode];
}) {
  const caja = useRef<HTMLDivElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const c = caja.current;
    const e = escena.current;
    const v = vid.current;
    if (!c || !e || !v) return;

    /* Nada de estado de React aquí dentro: el bucle escribe directamente en el
       DOM. Sesenta re-renders por segundo para cambiar una opacidad es el
       camino más corto a que una web se sienta pesada en un móvil. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      c.classList.add('portada-quieta');
      e.dataset.paso = 'todos';
      return;
    }

    /*
     * EL ARRANQUE EN EL IPHONE.
     *
     * Safari en móvil no pinta un fotograma buscado hasta que el vídeo se ha
     * reproducido al menos una vez: se queda en el cartel y el árbol no crece
     * por mucho que bajes. Se arranca y se para en el mismo suspiro —sin
     * sonido, así que el sistema lo permite— y a partir de ahí los saltos de
     * tiempo sí se dibujan. Si el navegador lo rechaza, no pasa nada: el
     * `catch` se lo traga y en escritorio nunca hizo falta.
     */
    v.play().then(() => v.pause()).catch(() => {});

    /*
     * EL FONDO DE LA PÁGINA TOMA LA LUZ DEL DIBUJO.
     *
     * El vídeo tiene una sombra que lo recorre: el papel empieza en un crema
     * claro (#ebe9e5) y a mitad de la animación baja hasta un gris (#c8c4bd).
     * Cuarenta puntos de diferencia. Con un color de fondo fijo, no hay
     * difuminado de bordes que valga: se ve el rectángulo del vídeo como un
     * parche sucio sobre la página, y se ve MÁS cuanto más oscurece.
     *
     * Así que el fondo no es fijo. Cada tres fotogramas se dibuja el vídeo en
     * un lienzo de ocho por ocho —cuesta lo que no está escrito—, se promedia
     * el ANILLO DE FUERA (que siempre es papel, nunca tinta) y ese color pasa a
     * ser el fondo del bloque. El rectángulo desaparece porque deja de existir:
     * la página y el dibujo son el mismo papel, y la sombra que cruza el vídeo
     * cruza también la pantalla.
     *
     * Si el navegador marcase el lienzo como contaminado —no debería, el vídeo
     * sale del mismo dominio— se apaga y se queda el color de reserva del CSS.
     */
    const lienzo = document.createElement('canvas');
    lienzo.width = 8;
    lienzo.height = 8;
    const pincel = lienzo.getContext('2d', { willReadFrequently: true });
    let mide = pincel !== null;
    let cuenta = 0;

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

    let suave = 0;
    let id = 0;
    let vivo = false;

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

      if (cuenta++ % 3 === 0) tomaLaLuz();

      id = requestAnimationFrame(pinta);
    };

    const ojo = new IntersectionObserver(
      ([x]) => {
        if (x.isIntersecting && !vivo) {
          vivo = true;
          id = requestAnimationFrame(pinta);
        } else if (!x.isIntersecting && vivo) {
          vivo = false;
          cancelAnimationFrame(id);
        }
      },
      { threshold: 0 },
    );
    ojo.observe(c);

    return () => {
      ojo.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div ref={caja} className="portada">
      <div ref={escena} className="portada-escena" data-paso="0">
        <div className="portada-marco">
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
          >
            {/* El mp4 primero: es el único que entiende el iPhone, y en el
                resto el salto de fotograma va por hardware. El webm queda
                detrás para Firefox en Linux, que muchas veces viene sin los
                códecs de pago instalados — y sin él ese navegador se queda con
                el cartel y el árbol no crece nunca. */}
            <source src="/video/arbol-scroll.mp4" type="video/mp4" />
            <source src="/video/arbol-scroll.webm" type="video/webm" />
          </video>
        </div>

        {/* Los tres textos ocupan la MISMA casilla de una rejilla, así que se
            cruzan en el sitio en vez de empujarse. Y la caja mide siempre lo
            que el más alto de los tres: nada da un salto al cambiar. */}
        <div className="portada-textos">
          {pasos.map((p, i) => (
            <div key={i} className="portada-paso" data-i={i}>
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
