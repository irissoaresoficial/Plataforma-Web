'use client';

import Link from 'next/link';
import { useRef } from 'react';
import Cursor from '@/components/Cursor';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import Portal from '@/components/Portal';
import Catalogo from '@/components/Catalogo';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';

/**
 * ============================================================================
 * LA PORTADA
 * ============================================================================
 *
 * La home vieja se ha borrado entera y está rehecha con la plantilla del
 * portal, que es la que vale. Antes eran nueve bloques —el recorrido, «hola
 * soy Iris», la escuela, el dolor anclado, qué es esto, la sinergia, el
 * catálogo, la consulta y las dudas— y la mitad contaban lo mismo dos veces:
 * el portal presentaba a Iris y tres pantallas más abajo volvía a
 * presentarse. Eso no es una página larga, es dos páginas pegadas.
 *
 * Ahora son tres cosas y se leen de una sentada:
 *
 *   1. EL RECORRIDO. Cinco paradas de scroll contando una historia: la
 *      pregunta, de dónde viene, cómo se ve, quién es Iris y qué es la
 *      escuela. Acaba en un botón y es el único de la pieza.
 *   2. LOS CURSOS. Lo que abre ese botón: lo que hay ahora y lo que viene.
 *   3. EL PIE. El mapa de la casa, para quien baja buscando algo concreto.
 *
 * ---------------------------------------------------------------------------
 * LO QUE SE HA QUITADO DE AQUÍ Y DÓNDE ESTÁ
 * ---------------------------------------------------------------------------
 * No se ha borrado ni un componente: todos siguen en el repositorio y las
 * páginas que los usan siguen en pie.
 *
 *   · «Hola, soy Iris» ....... es la cuarta parada del recorrido.
 *   · «Qué es la escuela» .... es la quinta.
 *   · El bloque del dolor .... es la primera.
 *   · «Qué es esto» .......... es la tercera, y entero en /numerologia.
 *   · La sinergia ............ en /sinergia, que es su casa.
 *   · Las dudas .............. se caen de la portada: una lista de doce
 *     preguntas al final de una historia la desarma. Van a su página cuando
 *     toque; mientras tanto, el chat de reserva las contesta.
 *
 * La reserva no se toca: el botón de la barra y el del pie abren la agenda.
 */
export default function Inicio() {
  const chat = useRef<ChatWidgetHandle>(null);
  const reservar = () => chat.current?.open('consulta');

  return (
    <div
      id="app"
      className="claro"
      style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}
    >
      <Cursor />
      <div
        id="bar"
        style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }}
      />

      <Nav
        cta="Reservar"
        onCta={reservar}
        extra={[
          { href: '#cursos', label: 'Cursos' },
          { href: '/numerologia', label: 'Numerología' },
          { href: '/kabala', label: 'Kábala' },
          { href: '/membresia', label: 'La comunidad' },
        ]}
      />

      {/* 1 — EL RECORRIDO */}
      <Portal />

      {/* 2 — LOS CURSOS: lo que abre el botón del final del recorrido. */}
      <Catalogo id="cursos" rotulo="Escuela de Sabiduría 33" titulo="Talleres y cursos" />

      {/* 3 — EL PIE */}
      <footer
        className="arena"
        style={{
          position: 'relative',
          zIndex: 3,
          background: 'var(--bg)',
          borderTop: '1px solid var(--linea)',
          padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Marca tam={68} apilado />
              <p style={{ margin: 0, fontSize: 'var(--t-nota)', lineHeight: 1.6, color: 'var(--tx-3)', maxWidth: '28ch' }}>
                Entender de dónde viene lo que se repite, y dejar de repetirlo.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">Empezar</span>
              <button type="button" onClick={reservar} data-mag className="pie-enlace pie-boton">
                Sesión con Iris
              </button>
              <Link href="#cursos" data-mag className="pie-enlace">
                Talleres y cursos
              </Link>
              <Link href="/sinergia" data-mag className="pie-enlace">
                La sinergia, gratis
              </Link>
              <Link href="/membresia" data-mag className="pie-enlace">
                La comunidad
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">Saber más</span>
              <Link href="/numerologia" data-mag className="pie-enlace">
                Qué es la numerología transgeneracional
              </Link>
              <Link href="/kabala" data-mag className="pie-enlace">
                Qué es la Kábala
              </Link>
              <a href="https://app.escueladesabiduria33.com" data-mag className="pie-enlace">
                Entrar en la escuela
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">Legal</span>
              <Link href="/legal" data-mag className="pie-enlace">
                Aviso legal
              </Link>
              <Link href="/privacidad" data-mag className="pie-enlace">
                Privacidad
              </Link>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--linea)',
              paddingTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              fontSize: 'var(--t-nota)',
              color: 'var(--tx-3)',
            }}
          >
            <span>Escuela de Sabiduría 33</span>
            <span>Consulta online desde 2010</span>
          </div>
        </div>
      </footer>

      {/* La agenda. Sin pastilla propia: se abre desde los botones. */}
      <ChatWidget ref={chat} />
    </div>
  );
}
