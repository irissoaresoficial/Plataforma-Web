'use client';

import { useState } from 'react';
import { SENTIDO, type Estudio } from '@/lib/numerologia';
import { LOGO_COLOR } from '@/content/site';

const INK = '#0A0A0C';
const GOLD = '#8F6B18';
const SUAVE = '#6B6B72';
const LINEA = '#E4E2EC';

/** Un número grande con su clave debajo. */
function Cifra({ etiqueta, numero, clave }: { etiqueta: string; numero: number; clave?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9A9AA2', marginBottom: 6 }}>{etiqueta}</div>
      <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-.055em', lineHeight: 1, color: INK }}>{numero || '—'}</div>
      {clave && <div style={{ fontSize: 13, color: SUAVE, marginTop: 4 }}>{clave}</div>}
    </div>
  );
}

/**
 * El informe que la persona se descarga. Se imprime desde el navegador
 * (window.print), así que no hace falta ninguna librería de PDF.
 */
export default function Informe({ e }: { e: Estudio }) {
  const [logoOk, setLogoOk] = useState(true);
  const conQuien = e.etiqueta ? (e.etiqueta === 'Otra persona' ? '' : e.etiqueta.toLowerCase()) : '';

  return (
    <div
      id="sheet"
      style={{
        display: 'none',
        background: '#fff',
        color: INK,
        fontFamily: "'Satoshi',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif",
        WebkitFontSmoothing: 'antialiased',
        lineHeight: 1.5,
      }}
    >
      {/* Cabecera */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingBottom: 18, borderBottom: `1px solid ${LINEA}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {logoOk && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={LOGO_COLOR} alt="" width={52} height={52} onError={() => setLogoOk(false)} style={{ display: 'block', width: 52, height: 52, objectFit: 'contain' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Iris Soares</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: GOLD }}>Escuela de Sabiduría 33</span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#9A9AA2' }}>{e.fecha}</span>
      </header>

      {/* Titular */}
      <section style={{ marginTop: 44 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
          {conQuien ? `Contigo y ${conQuien}` : 'Tu estudio'}
        </div>
        <h1 style={{ margin: 0, fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 42, fontWeight: 400, letterSpacing: '-.02em', lineHeight: 1.06, maxWidth: '18ch' }}>
          Lo que se activa entre {e.a.nombrePila} y {e.b.nombrePila}.
        </h1>
      </section>

      {/* Los dos perfiles */}
      <section style={{ marginTop: 40, display: 'flex', gap: 28 }}>
        <Cifra etiqueta={e.a.nombrePila} numero={e.a.camino.valor} clave={SENTIDO[e.a.camino.valor]?.clave} />
        <Cifra etiqueta={e.b.nombrePila} numero={e.b.camino.valor} clave={SENTIDO[e.b.camino.valor]?.clave} />
        <Cifra etiqueta="Juntos" numero={e.comun} clave={e.nombreVinculo} />
      </section>

      {/* Qué significa */}
      <section style={{ marginTop: 40, paddingTop: 26, borderTop: `1px solid ${LINEA}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9A9AA2', marginBottom: 14 }}>Qué significa</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {e.lineas.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
              <span style={{ color: GOLD, flexShrink: 0 }}>·</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Lo que se repite: el corazón del estudio */}
      {e.repeticiones.length > 0 && (
        <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${LINEA}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9A9AA2', marginBottom: 18 }}>Lo que se repite</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {e.repeticiones.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: GOLD, letterSpacing: '-.02em' }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 3 }}>{r.titulo}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: SUAVE }}>{r.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detalle numérico */}
      <section style={{ marginTop: 36, paddingTop: 26, borderTop: `1px solid ${LINEA}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9A9AA2', marginBottom: 16 }}>El detalle</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['', e.a.nombrePila, e.b.nombrePila].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '0 0 10px', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#9A9AA2' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Camino de vida', e.a.camino.valor, e.b.camino.valor],
              ['Expresión', e.a.expresion.valor, e.b.expresion.valor],
              ['Alma', e.a.alma.valor, e.b.alma.valor],
              ['Herencia del apellido', e.a.herencia.valor, e.b.herencia.valor],
              ['Año personal', e.a.anioPersonal, e.b.anioPersonal],
              ['Lecciones pendientes', e.a.lecciones.join(' · ') || '—', e.b.lecciones.join(' · ') || '—'],
            ].map(([k, va, vb], i) => (
              <tr key={i} style={{ borderTop: `1px solid ${LINEA}` }}>
                <td style={{ padding: '10px 0', color: SUAVE }}>{k}</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{va}</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{vb}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(e.a.camino.deuda || e.b.camino.deuda) && (
          <div style={{ marginTop: 16, background: '#FBF7EE', borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.6, color: '#5C4A1E' }}>
            {e.a.camino.deuda ? `${e.a.nombrePila} arrastra el ${e.a.camino.deuda}. ` : ''}
            {e.b.camino.deuda ? `${e.b.nombrePila} arrastra el ${e.b.camino.deuda}. ` : ''}
            Es una cuenta pendiente que se hereda hasta que alguien la mira.
          </div>
        )}
      </section>

      {/* Cierre */}
      <footer style={{ marginTop: 40, paddingTop: 20, borderTop: `2px solid ${INK}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 6 }}>
          Esto es una foto. La película entera está en tu línea familiar.
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: SUAVE, maxWidth: '62ch' }}>
          En una sesión de hora y media se levanta tu mapa completo y el de tu familia, y se ve en qué
          generación empezó lo que se te repite.
        </div>
        <div style={{ marginTop: 18, fontSize: 10, lineHeight: 1.7, color: '#9A9AA2' }}>
          Iris Soares · Escuela de Sabiduría 33 — Los estudios de gestión emocional y numerología
          transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
        </div>
      </footer>
    </div>
  );
}
