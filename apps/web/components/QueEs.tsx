'use client';

import { Fragment, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * QUÉ ES ESTO — EL BLOQUE QUE SE ESCRIBE SOLO, ENTRE PARTÍCULAS
 * ============================================================================
 *
 * Aquí había un titular a la izquierda y una foto grande a la derecha: una fila
 * de hombres repitiéndose hacia el fondo. La foto contaba bien la idea, pero
 * hacía dos cosas mal en este sitio concreto:
 *
 *   · PESABA MÁS QUE LO QUE HAY QUE LEER. Este es el único bloque de la página
 *     donde se explica QUÉ ES esto. Una cara a media pantalla al lado de la
 *     explicación se lleva la mirada entera, y la explicación se salta.
 *   · Y VENÍA JUSTO DESPUÉS de otro bloque con foto —el de Iris—. Dos fotos
 *     seguidas a media pantalla y la página se lee como un catálogo.
 *
 * Ahora el bloque es solo texto, centrado, y lo que lo acompaña no compite: un
 * campo de partículas doradas flotando muy despacio por detrás. Polvo en el
 * aire. Es lo único que hay en pantalla además de las palabras, y por eso las
 * palabras mandan.
 *
 * ---------------------------------------------------------------------------
 * LAS LETRAS SE FORMAN AL BAJAR
 * ---------------------------------------------------------------------------
 * El titular y los dos párrafos no aparecen: se ESCRIBEN, palabra a palabra, al
 * ritmo al que se baja. Es el mismo mecanismo de la portada y por el mismo
 * motivo: una frase que aparece entera de golpe se ve; una que se escribe se
 * lee. Y funciona en los dos sentidos — al subir se des-escribe.
 *
 * El progreso sale de dónde está el bloque respecto a la ventana, no de un
 * temporizador. Si la persona para de bajar, las palabras paran. Eso es lo que
 * hace que se sienta ligado a la mano y no a un reloj.
 *
 * ---------------------------------------------------------------------------
 * EL ESPACIO VA FUERA DEL SPAN
 * ---------------------------------------------------------------------------
 * Cada palabra es `inline-block` para poder moverse, y un `inline-block` se
 * COME el espacio que tenga dentro al final. Con el espacio dentro, la frase
 * sale escrita del tirón: «Noestucarácter.Noesmalasuerte.». Pasó una vez y se
 * subió así. El espacio va fuera, en el `Fragment`.
 *
 * ---------------------------------------------------------------------------
 * LO QUE NO HACE
 * ---------------------------------------------------------------------------
 * Nada de estado de React en el bucle: escribe directo en el DOM y solo toca
 * las palabras que cruzan el umbral en ese fotograma. El bucle y las partículas
 * solo corren mientras el bloque está en pantalla; fuera, un observador los
 * apaga y no gastan ni un ciclo.
 *
 * Con `prefers-reduced-motion` no se mueve nada: el texto sale entero y las
 * partículas se pintan una vez, quietas.
 */

/** Cuánto del recorrido del bloque se gasta escribiendo el texto. */
const VENTANA = 0.55;
/** Cuántas partículas. Cuarenta es polvo; cien es una pantalla de salvapantallas. */
const CUANTAS = 44;

type Mota = { x: number; y: number; r: number; vx: number; vy: number; a: number };

function palabras(txt: string) {
  return txt.split(' ').filter(Boolean);
}

/** Un trozo de texto que se escribe palabra a palabra. */
function Escrito({ txt, clase }: { txt: string; clase: string }) {
  return (
    <p className={clase}>
      {palabras(txt).map((w, k) => (
        <Fragment key={k}>
          <span className="pal">{w}</span>{' '}
        </Fragment>
      ))}
    </p>
  );
}

export default function QueEs({ titular, uno, dos }: { titular: string; uno: string; dos: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = caja.current;
    const cv = lienzo.current;
    if (!c || !cv) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pincel = cv.getContext('2d');

    /* ── LAS PARTÍCULAS ───────────────────────────────────────────────────
       El lienzo se dibuja a la resolución real de la pantalla (`devicePixelRatio`)
       y se escala por CSS: en un móvil moderno, si no, los puntos salen con el
       borde dentado. */
    let motas: Mota[] = [];
    let ancho = 0;
    let alto = 0;

    const mide = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width;
      alto = r.height;
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      pincel?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!motas.length) {
        motas = Array.from({ length: CUANTAS }, () => ({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          r: 0.7 + Math.random() * 1.9,
          /* Muy despacio: esto es polvo suspendido, no nieve. A más velocidad
             el ojo las persigue y deja de leer. */
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          a: 0.16 + Math.random() * 0.34,
        }));
      }
    };
    mide();
    const alRedimensionar = () => mide();
    window.addEventListener('resize', alRedimensionar);

    const pintaMotas = () => {
      if (!pincel) return;
      pincel.clearRect(0, 0, ancho, alto);
      for (const m of motas) {
        if (!quieto) {
          m.x += m.vx;
          m.y += m.vy;
          /* Se asoman por un lado y vuelven por el otro. Rebotar contra el borde
             delata la caja y aquí no hay ninguna caja que enseñar. */
          if (m.x < -4) m.x = ancho + 4;
          if (m.x > ancho + 4) m.x = -4;
          if (m.y < -4) m.y = alto + 4;
          if (m.y > alto + 4) m.y = -4;
        }
        pincel.beginPath();
        pincel.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        pincel.fillStyle = `rgba(169, 136, 79, ${m.a})`;
        pincel.fill();
      }
    };

    /* ── LAS PALABRAS ─────────────────────────────────────────────────────── */
    const grupos = Array.from(c.querySelectorAll<HTMLElement>('[data-escrito]')).map((n) => ({
      pal: Array.from(n.querySelectorAll<HTMLElement>('.pal')),
      vistas: 0,
    }));
    const total = grupos.reduce((n, g) => n + g.pal.length, 0);

    if (quieto) {
      c.classList.add('quees-quieto');
      grupos.forEach((g) => g.pal.forEach((w) => w.classList.add('pal-si')));
      pintaMotas();
      return () => window.removeEventListener('resize', alRedimensionar);
    }

    let suave = 0;
    let id = 0;
    let vivo = false;

    const bucle = () => {
      const r = c.getBoundingClientRect();
      const h = window.innerHeight;
      /* Cuánto ha entrado el bloque: 0 cuando su borde de arriba toca el pie de
         la ventana, 1 cuando ha subido una ventana entera. Es el recorrido en el
         que la persona lo tiene delante. */
      const meta = Math.min(1, Math.max(0, (h - r.top) / (h * 0.9 + r.height * 0.25)));
      suave += (meta - suave) * 0.14;
      if (Math.abs(meta - suave) < 0.0008) suave = meta;

      const q = Math.min(1, Math.max(0, (suave - 0.12) / VENTANA));
      let cuantas = Math.round(q * total);
      for (const g of grupos) {
        const n = Math.min(g.pal.length, Math.max(0, cuantas));
        cuantas -= g.pal.length;
        if (n === g.vistas) continue;
        const a = Math.min(g.vistas, n);
        const b = Math.max(g.vistas, n);
        for (let k = a; k < b; k++) g.pal[k].classList.toggle('pal-si', k < n);
        g.vistas = n;
      }

      pintaMotas();
      id = requestAnimationFrame(bucle);
    };

    const ojo = new IntersectionObserver(
      ([x]) => {
        if (x.isIntersecting && !vivo) {
          vivo = true;
          id = requestAnimationFrame(bucle);
        } else if (!x.isIntersecting && vivo) {
          vivo = false;
          cancelAnimationFrame(id);
        }
      },
      { threshold: 0, rootMargin: '120px' },
    );
    ojo.observe(c);

    return () => {
      ojo.disconnect();
      cancelAnimationFrame(id);
      window.removeEventListener('resize', alRedimensionar);
    };
  }, []);

  return (
    <div ref={caja} className="quees">
      <canvas ref={lienzo} className="quees-polvo" aria-hidden />
      <div className="quees-dentro">
        <h2 className="quees-h" data-escrito>
          {palabras(titular).map((w, k) => (
            <Fragment key={k}>
              <span className="pal">{w}</span>{' '}
            </Fragment>
          ))}
        </h2>
        <div className="quees-parrafos" data-escrito>
          <Escrito txt={uno} clase="quees-p" />
        </div>
        <div className="quees-parrafos" data-escrito>
          <Escrito txt={dos} clase="quees-p" />
        </div>
      </div>
    </div>
  );
}
