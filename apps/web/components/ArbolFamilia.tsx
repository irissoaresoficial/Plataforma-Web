'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * ============================================================================
 * EL ÁRBOL QUE SE DIBUJA SOLO, Y LA RAMA QUE NADIE TERMINÓ
 * ============================================================================
 *
 * Un árbol de familia en tinta fina que crece delante de quien entra: primero
 * el tronco, después cada generación, y al final —cuando el árbol ya está
 * entero— aparece UNA rama que no está dibujada. Está punteada, en dorado, y no
 * llega a ninguna parte.
 *
 * Esa rama es toda la web en una imagen: la historia que en esa familia nadie
 * contó. No hace falta explicarla; se ve.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTÁ GENERADO Y NO ES LA IMAGEN
 * ---------------------------------------------------------------------------
 * Hay un dibujo de referencia —el que mandó Gerson— y esto no es una copia: es
 * el mismo árbol construido con la misma regla con la que crece uno de verdad.
 * Un tronco que se parte en dos, y cada mitad otra vez, cinco veces.
 *
 * Y se genera por tres motivos, no por gusto:
 *
 *   1. UNA IMAGEN NO SE PUEDE DIBUJAR DELANTE DE NADIE. Se puede desvanecer, y
 *      eso es otra cosa. Aquí cada rama tiene su trazo y su turno, así que el
 *      árbol CRECE — que es exactamente lo que hace una familia.
 *   2. PESA NADA. El PNG de referencia son 2752 px de ancho; esto son unos
 *      kilobytes de coordenadas y se ve nítido en cualquier pantalla.
 *   3. LA RAMA DORADA TIENE QUE PODER LLEGAR TARDE. En una imagen ya está ahí
 *      desde el primer fotograma, y entonces no es un hallazgo: es un adorno.
 *
 * ---------------------------------------------------------------------------
 * SALE IGUAL SIEMPRE
 * ---------------------------------------------------------------------------
 * El azar del dibujo —cuánto se tuerce cada rama, cuánto se acorta— viene de un
 * generador con semilla fija. O sea que es aleatorio de aspecto y determinista
 * de verdad: la misma persona ve el mismo árbol hoy y dentro de un mes, y las
 * capturas de pantalla no cambian solas.
 *
 * ---------------------------------------------------------------------------
 * Y EL TEXTO NO ESPERA A QUE TERMINE
 * ---------------------------------------------------------------------------
 * La frase entra cuando el árbol va por la mitad, no al final. Si el titular de
 * una web tarda tres segundos en aparecer, hay gente que ya se ha ido — y el
 * primer fotograma, que es lo que se ve al compartir el enlace, saldría vacío.
 *
 * La rama dorada sí llega la última, después de la frase. Se lee «una historia
 * que nadie contó» y entonces, encima de esa lectura, aparece la rama que falta.
 * Ése es el orden que hace que se entienda sin explicar nada.
 *
 * Con `prefers-reduced-motion` no se dibuja nada: el árbol sale entero y quieto
 * desde el primer fotograma, con su rama dorada incluida.
 */

/* ── el azar con semilla ──────────────────────────────────────────────────
   Un generador congruencial de toda la vida. No hace falta nada mejor: sólo
   tiene que dar siempre la misma serie de números entre 0 y 1. */
function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Rama = {
  d: string;
  /** Qué generación es. Manda en el orden en que se dibuja y en el grosor. */
  nivel: number;
  grosor: number;
  /** El largo del trazo, para que la animación dure lo que mide. */
  largo: number;
  /** La que nadie terminó. */
  rota?: boolean;
};
type Nodo = { x: number; y: number; r: number; nivel: number };

const ANCHO = 1000;
/* 1,79:1, la proporción del dibujo de referencia. Con el lienzo más cuadrado
   el árbol salía estrecho y de pie, y ése es un árbol de parque — el de una
   familia se abre a lo ancho porque cada generación es más gente. */
const ALTO = 560;
/** Cinco generaciones. Con seis el dibujo se emborrona a tamaño de móvil. */
const NIVELES = 5;

/**
 * Construye el árbol entero.
 *
 * Cada rama sale de la punta de la anterior con un giro a un lado y otro, y
 * mide un poco menos. La curva es un cuadrático con el punto de control
 * desplazado en perpendicular: es lo que le quita el aire de diagrama y le da
 * el de trazo hecho a mano.
 */
function construye() {
  const r = azar(20101433);
  const ramas: Rama[] = [];
  const nodos: Nodo[] = [];

  /*
   * QUÉ RAMA ES LA QUE NADIE TERMINÓ.
   *
   * Se identifica por su CAMINO desde el tronco —una cadena de izquierdas y
   * derechas— y no por su posición en la lista. El primer intento la marcaba
   * con «la rama número seis», y no salió ninguna: el número que ocupa cada
   * rama en la lista depende del orden en que la recursión baja por el árbol, y
   * ese orden no es el que uno tiene en la cabeza mirando el dibujo.
   *
   * `RLR` es: al primer nudo a la derecha, al segundo hacia dentro, y al
   * tercero otra vez afuera. Eso la deja arriba a la derecha, que es donde está
   * en el dibujo que mandó Gerson.
   */
  const LA_ROTA = 'RLR';

  const crece = (
    x: number,
    y: number,
    ang: number,
    largo: number,
    grosor: number,
    nivel: number,
    ruta: string,
    rota: boolean,
  ) => {
    const x2 = x + Math.cos(ang) * largo;
    const y2 = y + Math.sin(ang) * largo;

    /* El punto de control, empujado en perpendicular. El signo alterna con el
       nivel para que las curvas no se vayan todas hacia el mismo lado. */
    const curva = largo * (0.12 + r() * 0.16) * (nivel % 2 === 0 ? 1 : -1);
    const mx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * curva;
    const my = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * curva;

    ramas.push({
      d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      nivel,
      grosor,
      largo: Math.hypot(x2 - x, y2 - y) * 1.25,
      rota,
    });

    if (nivel >= NIVELES) return;

    /* El nudo donde se parte. Del nivel 3 en adelante ya no se marca: en el
       dibujo de referencia las puntas finas no llevan círculo, y con ellos el
       árbol se llena de lunares. */
    if (nivel >= 1 && nivel <= 3 && !rota) {
      nodos.push({ x: x2, y: y2, r: nivel === 1 ? 4.2 : 3.4, nivel });
    }

    /* La apertura se cierra según sube: abajo el árbol se abre mucho —de ahí la
       forma de abanico— y arriba las ramitas casi van rectas. */
    const abre = (0.80 - nivel * 0.105) * (0.85 + r() * 0.3);
    const encoge = 0.74 + r() * 0.08;

    /* Todo lo que crece de la rama rota nace roto también: una historia que no
       se cuenta no se corta ahí — sigue bajando, sin nombre. */
    const izq = ruta + 'L';
    const der = ruta + 'R';
    crece(x2, y2, ang - abre, largo * encoge, grosor * 0.68, nivel + 1, izq, rota || izq === LA_ROTA);
    crece(x2, y2, ang + abre, largo * encoge, grosor * 0.68, nivel + 1, der, rota || der === LA_ROTA);
  };

  crece(ANCHO / 2, ALTO, -Math.PI / 2, 150, 3.4, 0, '', false);
  return { ramas, nodos };
}

const ARBOL = construye();

/** Cuánto tarda en salir cada generación, y cuánto dura su trazo. */
const POR_NIVEL = 380;
const DURA_TRAZO = 900;

export default function ArbolFamilia({ children }: { children?: React.ReactNode }) {
  const [visto, setVisto] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setQuieto(true);
      setVisto(true);
      return;
    }
    /* Arranca en cuanto está montado: esto es la portada, se ve al entrar y no
       hay nada que esperar. El observador es sólo por si algún día se coloca
       más abajo en otra página. */
    const el = caja.current;
    if (!el) return;
    const ojo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          ojo.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    ojo.observe(el);
    return () => ojo.disconnect();
  }, []);

  /* Las ramas rotas van al final del todo: se dibujan encima y llegan tarde. */
  const { enteras, rotas } = useMemo(
    () => ({
      enteras: ARBOL.ramas.filter((b) => !b.rota),
      rotas: ARBOL.ramas.filter((b) => b.rota),
    }),
    [],
  );

  /** Cuándo termina el árbol entero. La rama rota entra justo después. */
  const finArbol = NIVELES * POR_NIVEL + DURA_TRAZO;

  return (
    <div ref={caja} className={`arbolf${visto ? ' arbolf-visto' : ''}${quieto ? ' arbolf-quieto' : ''}`}>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} aria-hidden focusable="false">
        <g className="arbolf-ramas">
          {enteras.map((b, i) => (
            <path
              key={i}
              d={b.d}
              strokeWidth={b.grosor}
              style={{
                ['--largo' as string]: b.largo,
                ['--t' as string]: `${b.nivel * POR_NIVEL}ms`,
              }}
            />
          ))}
        </g>

        <g className="arbolf-nodos">
          {ARBOL.nodos.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              style={{ ['--t' as string]: `${n.nivel * POR_NIVEL + DURA_TRAZO * 0.5}ms` }}
            />
          ))}
        </g>

        {/* LA RAMA QUE NADIE TERMINÓ. Punteada, en dorado, y la última en
            llegar — después de que la frase ya se haya leído. */}
        <g className="arbolf-rota">
          {rotas.map((b, i) => (
            <path
              key={i}
              d={b.d}
              strokeWidth={Math.max(b.grosor, 1.6)}
              style={{ ['--t' as string]: `${finArbol + b.nivel * 170}ms` }}
            />
          ))}
        </g>
      </svg>

      {/* El texto entra cuando el árbol va por la mitad, no al final. */}
      <div className="arbolf-texto" style={{ ['--t' as string]: `${finArbol * 0.42}ms` }}>
        {children}
      </div>
    </div>
  );
}
