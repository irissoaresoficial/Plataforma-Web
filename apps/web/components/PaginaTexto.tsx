'use client';

import Barra from './casa/Barra';
import Pie from './casa/Pie';
import { CONTACTO } from '@/content/site';
import './casa/casa.css';

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
 * ---------------------------------------------------------------------------
 * 18 DE OCTUBRE: LA MISMA ROPA QUE LA PORTADA
 * ---------------------------------------------------------------------------
 * Gerson: «me gustaría que adaptaras el apartado de talleres y todos los links
 * de políticas y demás con ese estilo». Así que estas páginas dejan el `Nav` de
 * siempre y se ponen la barra nueva —la pastilla con el sello, que se abre a
 * toda la pantalla— y el pie nuevo.
 *
 * La barra va en su variante `fija`: aquí no hay portada a pantalla completa a
 * la que pegarse, así que se clava a la ventana y acompaña al bajar.
 *
 * Y el chat se va, que es lo que se pidió. No deja un callejón: la barra lleva
 * a las cinco puertas y el pie al correo de Iris, que es más salidas de las que
 * tenía esta página antes de todo esto.
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
    <div className="claro casa" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Barra fija />

      {/* `main` de verdad, no un `div`: es el contenido principal de la
          página y es lo que busca el salto de «ir al contenido» de un lector
          de pantalla. Y 124 px por arriba como mínimo, que es lo que mide la
          barra flotante más su aire. */}
      <main style={{ maxWidth: 'var(--ancho-lectura)', margin: '0 auto', padding: 'clamp(124px,13vw,160px) var(--hueco) clamp(64px,9vw,110px)' }}>
        <p style={{ margin: '0 0 14px', fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>
          Actualizado el {actualizado}
        </p>
        <h1 className="display" style={{ margin: '0 0 18px', fontSize: 'var(--t-portada)' }}>{titulo}</h1>
        <p style={{ margin: '0 0 clamp(36px,5vw,56px)', fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '58ch' }}>
          {entradilla}
        </p>
        <div className="texto-legal">{children}</div>

        <div style={{ marginTop: 'clamp(44px,6vw,72px)', paddingTop: 24, borderTop: '1px solid var(--linea)', fontSize: 'var(--t-nota)', color: 'var(--tx-2)' }}>
          ¿Alguna duda con esto? Escribe a{' '}
          <a href={`mailto:${CONTACTO.email}`} style={{ color: 'var(--acento)' }}>{CONTACTO.email}</a>.
        </div>
      </main>

      <Pie />
    </div>
  );
}
