'use client';

import Nav from './Nav';
import ChatWidget from './ChatWidget';
import { CONTACTO } from '@/content/site';

/**
 * El molde de las páginas de texto legal. Una columna, mucho aire y nada que
 * distraiga: son páginas que se leen, no que se recorren.
 *
 * ---------------------------------------------------------------------------
 * PERO CON LA BARRA DE SIEMPRE, QUE ANTES NO TENÍA
 * ---------------------------------------------------------------------------
 * Llevaban una cabecera propia con un «← IRIS SOARES» y nada más. Contadas en
 * el navegador: dos enlaces en toda la página —ése y el `mailto` del final— y
 * cero botones. Sin menú, sin pie y sin chat.
 *
 * Eso convierte la política de privacidad en un callejón. Quien llega desde
 * Google, o desde el pie de la portada para resolver una duda antes de dejar su
 * correo, no tiene forma de seguir a los cursos, a la prueba gratis ni a la
 * comunidad: sólo puede volver al principio y empezar de cero.
 *
 * Con el `<Nav>` normal recuperan las cuatro salidas de la casa y el botón de
 * reservar, que es lo que hacen las otras cuatro páginas. No hace falta nada
 * especial: `Nav` ya sabe funcionar sin enlaces propios de página.
 */
export default function PaginaTexto({
  titulo,
  entradilla,
  actualizado,
  children,
}: {
  titulo: string;
  entradilla: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div className="claro" style={{ minHeight: '100vh' }}>
      <Nav cta="Reservar" ctaHref="/#cita" />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(104px,12vw,140px) clamp(16px,4vw,32px) clamp(64px,9vw,120px)' }}>
        <p style={{ margin: '0 0 14px', fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>
          Actualizado el {actualizado}
        </p>
        <h1 className="display" style={{ margin: '0 0 18px', fontSize: 'var(--t-portada)' }}>{titulo}</h1>
        <p style={{ margin: '0 0 clamp(36px,5vw,56px)', fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '58ch' }}>
          {entradilla}
        </p>
        <div className="texto-legal">{children}</div>

        <div style={{ marginTop: 'clamp(44px,6vw,72px)', paddingTop: 24, borderTop: '1px solid var(--linea)', fontSize: 14, color: 'var(--tx-2)' }}>
          ¿Alguna duda con esto? Escribe a{' '}
          <a href={`mailto:${CONTACTO.email}`} style={{ color: 'var(--acento)' }}>{CONTACTO.email}</a>.
        </div>
      </div>

      {/* El chat, también aquí. Era la única página desde la que no se podía
          reservar sin volver al principio, y a la política de privacidad se
          llega justo cuando alguien está decidiendo si deja su correo. */}
      <ChatWidget />
    </div>
  );
}
