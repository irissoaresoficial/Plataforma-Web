'use client';

/**
 * LA PORTADA.
 * ============================================================================
 *
 * Reescrita entera el 18 de octubre de 2026. Encargo de Gerson, literal:
 * «elimina la web completamente (home), incluye header y footer, y haz el home
 * con base a esto» —una plantilla de una landing de una sola página— «adapta la
 * comunicación a lo que queremos nosotros».
 *
 * O sea: la estructura y el movimiento son los de la plantilla; lo que se dice
 * es nuestro. Tres bloques y una línea legal:
 *
 *   1. LA PORTADA ...... la pregunta, sobre el vídeo a pantalla entera.
 *   2. EL CREMA ........ de dónde viene el patrón: la abuela, la madre, tú.
 *   3. LAS CLAVES ...... quién es Iris y por qué creerla, en tres fichas.
 *   4. LA LÍNEA ........ lo que la ley obliga a tener a la vista. Nada más.
 *
 * LO QUE YA NO ESTÁ AQUÍ, Y DÓNDE ESTÁ:
 *   · `Nav`, la barra de siempre .... la portada lleva la suya, `Barra`. Las
 *     demás páginas siguen con `Nav` y no se han tocado.
 *   · El pie de siete columnas ...... ya no se pinta, como se pidió. Todos sus
 *     enlaces siguen vivos en sus páginas; sólo deja de haber un mapa al final
 *     de la portada.
 *   · El portal de cinco tramos ..... sigue en el repositorio, entero, en
 *     components/Portal.tsx. Se vuelve a poner cambiando una línea.
 *   · `Llamada`, `Susurros`, `Marca`, `Aparece` ... igual: en el repositorio,
 *     sin pintar aquí.
 *
 * NO SE HA BORRADO NINGÚN COMPONENTE (MARCA.md §8.4: se borra poco; lo que
 * estorba se deja de pintar).
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Cursor from '@/components/Cursor';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
import Barra from '@/components/casa/Barra';
import Sobre from '@/components/casa/Sobre';
import Claves from '@/components/casa/Claves';
import { CONTACTO } from '@/content/site';
import '@/components/casa/casa.css';

export default function Home() {
  /* `useSiteScroll` ya no se llama aquí. Mueve tres cosas —la barrita de
     progreso `#bar`, los `[data-par]` del paralaje y los `[data-step]`— y en
     esta portada no existe ninguna de las tres: era un escuchador de scroll a
     sesenta veces por segundo sin un solo elemento al que mirar. El hook se
     queda para las demás páginas, que sí los tienen. */
  const chatRef = useRef<ChatWidgetHandle>(null);
  const portada = useRef<HTMLElement>(null);

  /* MIENTRAS SE VE LA PORTADA, EL CHAT SE CALLA.
     La pastilla del chat se planta abajo a la derecha y caía justo encima de
     la barra de llamada: dos peticiones pisándose en la misma pantalla. Se
     marca el <html> mientras la portada está a la vista y casa.css hace el
     resto; en cuanto se baja, vuelve. Y al salir de la página se limpia la
     marca, o la siguiente se queda sin chat sin que nadie sepa por qué. */
  useEffect(() => {
    const zona = portada.current;
    if (!zona) return;
    const ojo = new IntersectionObserver(
      ([e]) => {
        document.documentElement.dataset.portada = e.isIntersecting ? 'si' : 'no';
      },
      { threshold: 0.35 },
    );
    ojo.observe(zona);
    return () => {
      ojo.disconnect();
      delete document.documentElement.dataset.portada;
    };
  }, []);

  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />

      {/* ── 1. LA PORTADA: LA PREGUNTA ─────────────────────────
          Una sola pregunta, el vídeo detrás y lo justo para decidir si se
          sigue bajando. Nada más: es la pantalla que paga, y cada cosa de más
          es un motivo para irse. */}
      <section className="casa-portada" id="top" ref={portada}>
        <video
          className="casa-portada-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/arbol-scroll-cartel.jpg"
          aria-hidden="true"
        >
          <source src="/video/recorrido.webm" type="video/webm" />
          <source src="/video/recorrido.mp4" type="video/mp4" />
        </video>
        <div className="casa-portada-velo" aria-hidden="true" />

        <Barra />

        <div className="casa-portada-dentro">
          <h1 className="casa-h1">
            Por qué se repite
            <br />
            {/* La palabra en cursiva de la plantilla, puesta en Fraunces
                itálica, que es nuestra letra de titular. Ver casa.css. */}
            <em>siempre lo mismo</em>
          </h1>

          <p className="casa-portada-p">
            Numerología transgeneracional. Tu fecha y tu nombre dicen qué patrón
            heredaste, y por dónde se sale.
          </p>

          <div className="casa-llamada">
            <p className="casa-larga">
              Sin cartas y sin adivinación. Dos datos que no elegiste y una cuenta que puedes rehacer.
            </p>
            <p className="casa-corta">Sin cartas. Sin adivinación.</p>
            <Link href="/cursos" className="casa-llamada-boton">
              Ver los talleres
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. DE DÓNDE VIENE ──────────────────────────────── */}
      <Sobre />

      {/* ── 3. QUIÉN ES IRIS, Y POR QUÉ CREERLA ────────────── */}
      <Claves />

      {/* ── 4. LA LÍNEA LEGAL ───────────────────────────────
          El pie se ha quitado, pero esto no es el pie: es lo que la LSSI-CE
          (art. 10) y el RGPD obligan a tener alcanzable desde cualquier
          página. Una línea, callada, y la web queda en norma. */}
      <footer className="casa-pie">
        <div className="casa-pie-dentro">
          <span>Iris Soares · Escuela de Sabiduría 33</span>
          <span className="casa-pie-hueco" />
          <Link href="/legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <a href={`mailto:${CONTACTO.email}`}>Escribir</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      <ChatWidget ref={chatRef} />
    </div>
  );
}
