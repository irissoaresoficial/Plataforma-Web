'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ============================================================================
 * EL ÁRBOL DE LA VIDA, DIBUJÁNDOSE
 * ============================================================================
 *
 * El bloque de Kábala decía «diez estaciones y veintidós senderos» y no
 * enseñaba ni una. Y el pie del propio bloque dice, literalmente, que en
 * consulta esto no se explica: SE DIBUJA DELANTE DE TI. Contarlo con cuatro
 * columnas de texto era prometer una cosa y dar otra.
 *
 * Así que aquí está el árbol de verdad: los diez sefirot en sus tres columnas y
 * los veintidós senderos que los unen, tendiéndose solos cuando el bloque entra
 * en pantalla. Nadie que llegue a la ficha de 333 € tiene que imaginarse qué va
 * a recibir — lo ha visto.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ SE DIBUJA Y NO APARECE HECHO
 * ---------------------------------------------------------------------------
 * Un diagrama que aparece entero es un icono: se mira medio segundo y se pasa.
 * Uno que se tiende delante obliga a seguirlo, y al seguirlo se aprende la forma
 * — que es exactamente lo que pasa en la consulta. Los senderos salen primero y
 * las estaciones después, en el orden en que se leen: de arriba abajo, del 1 al
 * 10, que es el recorrido de una idea hasta que se hace cosa.
 *
 * Sólo se dibuja UNA VEZ y sólo cuando el árbol está a la vista. Repetir la
 * animación cada vez que se pasa por delante convierte una pieza bonita en un
 * tic.
 *
 * ---------------------------------------------------------------------------
 * LO QUE SE PUEDE TOCAR
 * ---------------------------------------------------------------------------
 * Cada estación se toca y cuenta qué es, en una línea y en castellano llano. La
 * explicación sale DEBAJO del dibujo, en un sitio fijo, y no en un globito
 * flotante: en un móvil un globito tapa justo lo que se acaba de tocar.
 *
 * Y con `prefers-reduced-motion` el árbol sale entero y quieto desde el primer
 * fotograma. Sigue siendo un árbol.
 */

/** Los diez sefirot. `x`/`y` en unidades del viewBox. */
const SEFIROT = [
  { n: 1, k: 'keter', nombre: 'Kéter', es: 'La chispa', x: 200, y: 46, txt: 'Eso que todavía no sabes ni cómo explicar, pero que ya te empuja.' },
  { n: 2, k: 'jojma', nombre: 'Jojmá', es: 'La ocurrencia', x: 318, y: 132, txt: 'El «ya lo tengo»: la idea entera de golpe, antes de pensarla.' },
  { n: 3, k: 'bina', nombre: 'Biná', es: 'Entenderlo', x: 82, y: 132, txt: 'Cuando esa idea por fin se entiende y le encuentras la forma.' },
  { n: 4, k: 'jesed', nombre: 'Jésed', es: 'Dar', x: 318, y: 268, txt: 'Dar sin contar. Abrir la mano y no mirar cuánto.' },
  { n: 5, k: 'guevura', nombre: 'Guevurá', es: 'Poner límite', x: 82, y: 268, txt: 'Saber decir que no, y decirlo a tiempo.' },
  { n: 6, k: 'tiferet', nombre: 'Tiféret', es: 'El equilibrio', x: 200, y: 340, txt: 'El centro. Donde dar y decir que no se ponen de acuerdo.' },
  { n: 7, k: 'netzaj', nombre: 'Nétzaj', es: 'Insistir', x: 318, y: 424, txt: 'Lo que sigues haciendo aunque ya no te apetezca.' },
  { n: 8, k: 'hod', nombre: 'Hod', es: 'Decirlo', x: 82, y: 424, txt: 'Poner en palabras lo que sientes, para que se entienda fuera.' },
  { n: 9, k: 'yesod', nombre: 'Yesod', es: 'El cimiento', x: 200, y: 506, txt: 'Donde se junta todo justo antes de salir al mundo.' },
  { n: 10, k: 'maljut', nombre: 'Maljut', es: 'Aquí', x: 200, y: 606, txt: 'Tu cuerpo, tu casa, tu dinero y lo que haces hoy.' },
];

/**
 * Los veintidós senderos, por pares de estaciones.
 *
 * Son el árbol de Kircher, que es el que se dibuja en clase y del que salen los
 * veintidós arcanos. No están numerados en el dibujo a propósito: la numeración
 * de los senderos cambia de escuela a escuela y aquí no hace falta — lo que
 * tiene que verse es que son veintidós y que unen las diez.
 */
const SENDEROS: Array<[string, string]> = [
  ['keter', 'jojma'],
  ['keter', 'bina'],
  ['keter', 'tiferet'],
  ['jojma', 'bina'],
  ['jojma', 'jesed'],
  ['jojma', 'tiferet'],
  ['bina', 'guevura'],
  ['bina', 'tiferet'],
  ['jesed', 'guevura'],
  ['jesed', 'tiferet'],
  ['jesed', 'netzaj'],
  ['guevura', 'tiferet'],
  ['guevura', 'hod'],
  ['tiferet', 'netzaj'],
  ['tiferet', 'hod'],
  ['tiferet', 'yesod'],
  ['netzaj', 'hod'],
  ['netzaj', 'yesod'],
  ['netzaj', 'maljut'],
  ['hod', 'yesod'],
  ['hod', 'maljut'],
  ['yesod', 'maljut'],
];

const POR_CLAVE = Object.fromEntries(SEFIROT.map((s) => [s.k, s]));

export default function ArbolVida() {
  const [visto, setVisto] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [elegida, setElegida] = useState<string | null>(null);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setQuieto(true);
      setVisto(true);
      return;
    }
    const el = caja.current;
    if (!el) return;
    /* Una sola vez: en cuanto se ha dibujado, se deja de mirar. Volver a
       dibujarlo cada vez que se pasa por delante lo convierte en un tic. */
    const ojo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          ojo.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    ojo.observe(el);
    return () => ojo.disconnect();
  }, []);

  const s = elegida ? POR_CLAVE[elegida] : null;

  return (
    <div ref={caja} className={`arbol${visto ? ' arbol-visto' : ''}${quieto ? ' arbol-quieto' : ''}`}>
      <svg viewBox="0 0 400 660" role="img" aria-label="El Árbol de la Vida: diez sefirot unidos por veintidós senderos">
        {/* Las tres columnas, apenas insinuadas. No son decoración: la izquierda
            es la del rigor, la derecha la de la bondad y la del medio la del
            equilibrio, y es lo primero que se explica del árbol. */}
        <g className="arbol-pilares" aria-hidden>
          <line x1="82" y1="110" x2="82" y2="448" />
          <line x1="318" y1="110" x2="318" y2="448" />
          <line x1="200" y1="24" x2="200" y2="630" />
        </g>

        {/* --------------------------------------------------- los 22 senderos */}
        <g className="arbol-senderos">
          {SENDEROS.map(([a, b], i) => {
            const pa = POR_CLAVE[a];
            const pb = POR_CLAVE[b];
            const toca = elegida === a || elegida === b;
            return (
              <line
                key={a + b}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                className={toca ? 'arbol-sendero arbol-sendero-on' : 'arbol-sendero'}
                style={{ ['--t' as string]: `${i * 55}ms` }}
              />
            );
          })}
        </g>

        {/* ------------------------------------------------- las 10 estaciones */}
        {SEFIROT.map((p, i) => {
          const on = elegida === p.k;
          return (
            <g
              key={p.k}
              className={`arbol-sef${on ? ' arbol-sef-on' : ''}`}
              style={{ ['--t' as string]: `${1250 + i * 90}ms`, transformOrigin: `${p.x}px ${p.y}px` }}
              role="button"
              tabIndex={0}
              aria-label={`${p.nombre}, ${p.es}`}
              onClick={() => setElegida((k) => (k === p.k ? null : p.k))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setElegida((k) => (k === p.k ? null : p.k));
                }
              }}
              onPointerEnter={() => setElegida(p.k)}
            >
              <circle cx={p.x} cy={p.y} r={34} className="arbol-halo" />
              <circle cx={p.x} cy={p.y} r={26} className="arbol-disco" />
              <text x={p.x} y={p.y + 6} className="arbol-cifra">
                {p.n}
              </text>
              <text x={p.x} y={p.y + 45} className="arbol-nombre">
                {p.nombre}
              </text>
            </g>
          );
        })}
      </svg>

      {/* El pie, en sitio fijo. Un globito flotante taparía en el móvil justo la
          estación que se acaba de tocar. */}
      <p className="arbol-pie" aria-live="polite">
        {s ? (
          <>
            <b>
              {s.n} · {s.nombre}
            </b>
            <span className="arbol-pie-es">{s.es}</span>
            {s.txt}
          </>
        ) : (
          <span className="arbol-pie-guia">Toca cualquiera de las diez y te digo qué es.</span>
        )}
      </p>
    </div>
  );
}
