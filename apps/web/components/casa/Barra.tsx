'use client';

/**
 * LA BARRA DE LA PORTADA: UNA PASTILLA QUE FLOTA.
 * ============================================================================
 *
 * Sustituye a `Nav` SÓLO en la portada. Las demás páginas siguen con la barra
 * de siempre, que tiene idiomas, botón de reserva y el menú entero: ahí hace
 * falta. Aquí no. En una portada que es una sola historia contada al bajar, una
 * barra con siete cosas es siete motivos para irse antes de empezar a leer.
 *
 * Así que queda lo mínimo: el nombre y tres puertas.
 *
 * EL BOTÓN DE LAS TRES RAYAS SON DOS.
 * Dos rayas y no tres, y al abrir se cruzan. Tres rayas convertidas en aspa
 * obligan a esconder la del medio, y esa desaparición se ve. Con dos, el gesto
 * es limpio: cada raya gira sobre el mismo centro.
 *
 * ACCESIBILIDAD, que en un menú que se abre no es un detalle:
 *   · es un <button> de verdad, así que lo alcanza el tabulador y lo abre Intro;
 *   · `aria-expanded` dice si está abierto y `aria-controls` a quién abre;
 *   · se cierra con Escape y pulsando fuera;
 *   · cerrado, el desplegable lleva `inert`: ni lo lee un lector de pantalla ni
 *     se cuela el tabulador dentro de unos enlaces invisibles.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const PUERTAS = [
  { href: '/cursos', texto: 'Talleres y cursos' },
  { href: '/membresia', texto: 'La escuela' },
  { href: 'https://app.escueladesabiduria33.com', texto: 'Entrar', fuera: true },
];

export default function Barra() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const fuga = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', fuga);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', fuga);
    };
  }, [abierto]);

  return (
    <div className="casa-barra" ref={caja}>
      <div className="casa-pastilla">
        <Link href="/" className="casa-marca" onClick={() => setAbierto(false)}>
          Iris Soares
        </Link>
        <button
          type="button"
          className={`casa-rayas${abierto ? ' casa-rayas-abierta' : ''}`}
          aria-expanded={abierto}
          aria-controls="casa-menu"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => setAbierto((v) => !v)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        id="casa-menu"
        className={`casa-menu${abierto ? ' casa-menu-abierto' : ''}`}
        /* `inert` es lo que impide que el tabulador entre en un menú cerrado.
           React lo pinta como atributo booleano desde la 19; en TypeScript hay
           que pasarle el booleano, no la cadena. */
        inert={!abierto}
      >
        {PUERTAS.map((p) =>
          p.fuera ? (
            <a key={p.href} href={p.href} onClick={() => setAbierto(false)}>
              {p.texto}
            </a>
          ) : (
            <Link key={p.href} href={p.href} onClick={() => setAbierto(false)}>
              {p.texto}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
