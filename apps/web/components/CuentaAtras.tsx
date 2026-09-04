'use client';

import { useEffect, useState } from 'react';

/**
 * Cuánto falta para una fecha, en días, horas, minutos y segundos.
 *
 * El anillo no es adorno: la parte dorada es lo que queda de la ventana de
 * inscripción, contada desde el día en que se abrió. Sin fecha configurada no
 * se dibuja nada, porque una cuenta atrás inventada es una mentira.
 *
 * El primer render deja los huecos vacíos a propósito: el servidor no sabe qué
 * hora es en el navegador de quien mira, y pintar una cifra distinta en cada
 * sitio rompe la hidratación.
 */
export default function CuentaAtras({
  fechaISO,
  abiertoDesdeISO,
  etiqueta = 'Para que empiece',
  compacto = false,
}: {
  fechaISO?: string;
  abiertoDesdeISO?: string;
  etiqueta?: string;
  /** Sin anillo: solo las cifras, para meterlo en una tarjeta estrecha. */
  compacto?: boolean;
}) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    if (!fechaISO) return;
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fechaISO]);

  if (!fechaISO) return null;
  const fin = new Date(`${fechaISO}T00:00:00`).getTime();
  if (Number.isNaN(fin)) return null;
  if (ahora !== null && fin - ahora <= 0) return null;

  const resto = ahora === null ? null : fin - ahora;
  const dias = resto === null ? null : Math.floor(resto / 86_400_000);
  const horas = resto === null ? null : Math.floor((resto % 86_400_000) / 3_600_000);
  const mins = resto === null ? null : Math.floor((resto % 3_600_000) / 60_000);
  const segs = resto === null ? null : Math.floor((resto % 60_000) / 1000);

  const inicio = abiertoDesdeISO ? new Date(`${abiertoDesdeISO}T00:00:00`).getTime() : fin - 60 * 86_400_000;
  const total = Math.max(1, fin - inicio);
  const restante = resto === null ? 1 : Math.max(0, Math.min(1, resto / total));

  const R = 52;
  const C = 2 * Math.PI * R;
  const dosCifras = (n: number | null) => (n === null ? '––' : String(n).padStart(2, '0'));

  const cifras = (
    <div className="cuenta-cifras">
      {[
        [dias === null ? '––' : String(dias), dias === 1 ? 'día' : 'días'],
        [dosCifras(horas), 'h'],
        [dosCifras(mins), 'min'],
        [dosCifras(segs), 'seg'],
      ].map(([v, l]) => (
        <div key={l}>
          <strong>{v}</strong>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );

  if (compacto) {
    return (
      <div className="cuenta compacta">
        <span className="cuenta-rotulo">{etiqueta}</span>
        {cifras}
      </div>
    );
  }

  return (
    <div className="cuenta">
      <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden>
        <circle cx="62" cy="62" r={R} fill="none" strokeWidth="5" style={{ stroke: 'var(--linea)' }} />
        <circle
          cx="62"
          cy="62"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - restante)}
          transform="rotate(-90 62 62)"
          style={{ stroke: 'var(--acento-2)', transition: 'stroke-dashoffset 1s linear' }}
        />
        <text x="62" y="59" textAnchor="middle" style={{ fill: 'var(--tx)', fontFamily: 'var(--serif)', fontSize: 32 }}>
          {dias === null ? '––' : dias}
        </text>
        <text x="62" y="79" textAnchor="middle" style={{ fill: 'var(--tx-3)', fontSize: 10, letterSpacing: '.18em' }}>
          {dias === 1 ? 'DÍA' : 'DÍAS'}
        </text>
      </svg>
      <div>
        <span className="cuenta-rotulo">{etiqueta}</span>
        {cifras}
      </div>
    </div>
  );
}
