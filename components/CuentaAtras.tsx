'use client';

import { useEffect, useState } from 'react';

/**
 * Cuánto falta para el curso, en un anillo que se va cerrando.
 *
 * El anillo no es decorativo: la parte dorada es lo que queda de la ventana de
 * inscripción, contada desde el día en que se abrió. Sin fecha configurada no
 * se dibuja nada, porque inventarse una cuenta atrás es mentir.
 */
export default function CuentaAtras({ fechaISO, abiertoDesdeISO }: { fechaISO?: string; abiertoDesdeISO?: string }) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    // Solo en el navegador: en el servidor no hay "ahora" que valga.
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!fechaISO || ahora === null) return null;
  const fin = new Date(`${fechaISO}T00:00:00`).getTime();
  if (Number.isNaN(fin)) return null;

  const restanteMs = fin - ahora;
  if (restanteMs <= 0) return null;

  const dias = Math.floor(restanteMs / 86_400_000);
  const horas = Math.floor((restanteMs % 86_400_000) / 3_600_000);

  // Si no se dice desde cuándo está abierto, se toman 60 días de ventana.
  const inicio = abiertoDesdeISO ? new Date(`${abiertoDesdeISO}T00:00:00`).getTime() : fin - 60 * 86_400_000;
  const total = Math.max(1, fin - inicio);
  const restante = Math.max(0, Math.min(1, restanteMs / total));

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden style={{ flexShrink: 0 }}>
        <circle cx="62" cy="62" r={R} fill="none" stroke="var(--linea)" strokeWidth="6" />
        <circle
          cx="62"
          cy="62"
          r={R}
          fill="none"
          stroke="var(--acento-2)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - restante)}
          transform="rotate(-90 62 62)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="62" y="58" textAnchor="middle" fill="var(--tx)" style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>
          {dias}
        </text>
        <text x="62" y="78" textAnchor="middle" fill="var(--tx-3)" style={{ fontSize: 11, letterSpacing: '.1em' }}>
          {dias === 1 ? 'DÍA' : 'DÍAS'}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--acento)' }}>
          Para que empiece
        </span>
        <span style={{ fontSize: 15, color: 'var(--tx-2)' }}>
          {dias} {dias === 1 ? 'día' : 'días'} y {horas} h
        </span>
      </div>
    </div>
  );
}
