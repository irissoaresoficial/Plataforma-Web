'use client';

import Link from 'next/link';
import Marca from './Marca';
import { CONTACTO } from '@/content/site';

/**
 * El molde de las páginas de texto legal. Una columna, mucho aire y nada que
 * distraiga: son páginas que se leen, no que se recorren.
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
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)', borderBottom: '1px solid var(--linea)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '15px clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--tx)' }}>
            <span aria-hidden>←</span>
            <Marca tam={26} />
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(48px,8vw,96px) clamp(16px,4vw,32px) clamp(64px,9vw,120px)' }}>
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
    </div>
  );
}
