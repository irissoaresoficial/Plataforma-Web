'use client';

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import DustField from '@/components/DustField';
import ParticleField from '@/components/ParticleField';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import SubNav from '@/components/SubNav';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import Pendiente from '@/components/Pendiente';
import { CURSOS, MEMBRESIA, PENDIENTE, eur, falta, type Curso } from '@/content/site';

/** Texto real, o etiqueta roja si todavía está sin rellenar. */
function T({ v, style }: { v: string; style?: React.CSSProperties }) {
  if (falta(v)) return <Pendiente />;
  return <span style={style}>{v}</span>;
}

function CursoBloque({ curso, index }: { curso: Curso; index: number }) {
  const claro = index % 2 === 0;
  const bg = claro ? '#F5F4F0' : '#0A0A0C';
  const fg = claro ? '#0A0A0C' : '#F4F3EF';
  const suave = claro ? '#6B6B72' : 'rgba(244,243,239,.58)';
  const linea = claro ? 'rgba(10,10,12,.14)' : 'rgba(244,243,239,.14)';
  const acento = claro ? '#8F6B18' : '#C89B4A';

  return (
    <div id={curso.id} style={{ position: 'relative', zIndex: 3, background: bg, color: fg, padding: 'clamp(50px,7vw,104px) clamp(14px,3vw,36px)', scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.2vw,44px)' }}>
        {/* Cabecera */}
        <Reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 'clamp(18px,2.6vw,44px)',
            alignItems: 'end',
            borderBottom: `1px solid ${linea}`,
            paddingBottom: 'clamp(18px,2.2vw,28px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: acento }}>Próximo curso</span>
              {falta(curso.fechas) ? <Pendiente>Fechas por confirmar</Pendiente> : <span style={{ fontSize: 13, fontWeight: 600, color: suave }}>{curso.fechas}</span>}
            </div>
            <span style={{ fontSize: 'clamp(30px,4.4vw,64px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", lineHeight: 0.98, letterSpacing: '-.026em', maxWidth: '15ch', textWrap: 'pretty' }}>
              <T v={curso.titulo} />
            </span>
            <span style={{ fontSize: 'clamp(15px,1.2vw,19px)', lineHeight: 1.55, color: suave, maxWidth: '40ch' }}>
              <T v={curso.claim} />
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,2.4vw,38px)', justifySelf: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 'clamp(20px,2.2vw,30px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", letterSpacing: '-.022em', lineHeight: 1 }}>
                <T v={curso.duracion} />
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: suave }}>duración</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 'clamp(20px,2.2vw,30px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", letterSpacing: '-.022em', lineHeight: 1 }}>
                <T v={curso.horario} />
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: suave }}>horario</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 'clamp(20px,2.2vw,30px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", letterSpacing: '-.022em', lineHeight: 1, color: acento }}>
                {curso.precio === null ? <Pendiente>Precio</Pendiente> : eur(curso.precio)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: suave }}>con grabación</span>
            </div>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(14px,2.2vw,28px)', alignItems: 'start' }}>
          {/* Vídeo + descripción */}
          <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {curso.videoUrl ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden', background: '#131318', border: `1px solid ${linea}` }}>
                <iframe
                  src={curso.videoUrl}
                  title={falta(curso.titulo) ? 'Presentación del curso' : curso.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 20,
                  border: `1px dashed ${claro ? 'rgba(10,10,12,.22)' : 'rgba(244,243,239,.22)'}`,
                  background: claro
                    ? 'repeating-linear-gradient(135deg,rgba(10,10,12,.04) 0 1px,transparent 1px 12px)'
                    : 'repeating-linear-gradient(135deg,rgba(244,243,239,.04) 0 1px,transparent 1px 12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                }}
              >
                <span style={{ width: 68, height: 68, borderRadius: '50%', border: `1px solid ${acento}`, color: acento, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</span>
                <Pendiente>Vídeo de Iris</Pendiente>
                <span style={{ fontSize: 13, color: suave, maxWidth: '34ch', textAlign: 'center', lineHeight: 1.5 }}>
                  Pega aquí el enlace del vídeo en <code style={{ fontSize: 12 }}>content/site.ts</code> y aparece solo.
                </span>
              </div>
            )}
            <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.65, color: suave }}>
              <T v={curso.descripcion} />
            </p>
          </Reveal>

          {/* Programa + reserva */}
          <Reveal delay={100} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                background: claro ? '#FFFFFF' : 'transparent',
                border: `1px solid ${claro ? 'rgba(10,10,12,.1)' : 'rgba(244,243,239,.13)'}`,
                borderRadius: 20,
                padding: 'clamp(18px,2vw,26px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: acento }}>Lo que se ve</span>
              {curso.bloques.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.022em', color: claro ? 'rgba(10,10,12,.16)' : 'rgba(244,243,239,.18)', width: 26, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>
                      <T v={b.t} />
                    </span>
                    {!falta(b.d) && <span style={{ fontSize: 14, lineHeight: 1.5, color: suave }}>{b.d}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: claro ? '#0A0A0C' : 'linear-gradient(155deg,rgba(200,155,74,.12),rgba(10,10,12,0) 62%)',
                border: claro ? 'none' : '1px solid rgba(200,155,74,.34)',
                color: '#F4F3EF',
                borderRadius: 20,
                padding: 'clamp(18px,2vw,26px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.025em' }}>Guardar mi plaza</span>
                {curso.plazas !== null && <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(244,243,239,.5)' }}>{curso.plazas} plazas</span>}
              </div>
              <LeadForm
                origen="curso"
                detalle={`Curso: ${falta(curso.titulo) ? curso.id : curso.titulo}${curso.fechas && !falta(curso.fechas) ? ` (${curso.fechas})` : ''}`}
                cta={curso.precio === null ? 'Avisadme cuando abra' : `Reservar · ${eur(curso.precio)}`}
                successTitle="Plaza guardada."
                successText="Iris te escribe con el enlace de pago y los detalles de la sala."
                privacidad="No se cobra nada aquí. El pago llega por correo."
                pedirNombre
                pedirWhatsapp
              />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export default function Cursos() {
  useSiteScroll();

  return (
    <div style={{ width: '100%', background: '#0A0A0C', color: '#F4F3EF', overflowX: 'hidden' }}>
      <Cursor hitSelector="[data-mag],a,input,label,[data-card]" />
      <DustField />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: '#C89B4A', zIndex: 130 }} />
      <SubNav links={CURSOS.map((c) => ({ href: `#${c.id}`, label: falta(c.titulo) ? 'Próximo curso' : c.titulo }))} cta="La membresía" ctaHref="/membresia" />

      {/* HERO */}
      <div style={{ position: 'relative', padding: 'clamp(104px,16vh,170px) clamp(14px,3vw,36px) clamp(40px,5vw,70px)', overflow: 'hidden' }}>
        <ParticleField />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 55% at 12% 0%,rgba(200,155,74,.16),transparent 60%),linear-gradient(to bottom,rgba(10,10,12,.5),rgba(10,10,12,.94))',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(22px,2.8vw,36px)' }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Cursos y talleres en directo</div>
          </Reveal>
          <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'clamp(38px,6.2vw,88px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", lineHeight: 0.96, letterSpacing: '-.028em', maxWidth: '16ch', textWrap: 'pretty' }}>
            Unas tardes que cambian la conversación en tu casa.
          </Reveal>
          <Reveal delay={140}>
            <p style={{ margin: 0, fontSize: 'clamp(16px,1.25vw,20px)', lineHeight: 1.55, color: 'rgba(244,243,239,.6)', maxWidth: '44ch' }}>
              Formatos cortos, en directo y con caso propio: sales con tu historia mirada, no con apuntes.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <a href={`#${CURSOS[0]?.id ?? 'proximo'}`} data-mag data-cur-label="Ver" className="pill pill-cream" style={{ alignSelf: 'flex-start' }}>
              <span>Ver el próximo</span>
              <span className="pill-arrow">↓</span>
            </a>
          </Reveal>
        </div>
      </div>

      {CURSOS.map((curso, i) => (
        <CursoBloque key={curso.id} curso={curso} index={i} />
      ))}

      {/* PUENTE A LA MEMBRESÍA + FOOTER */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', borderTop: '1px solid rgba(244,243,239,.1)', padding: 'clamp(38px,5vw,68px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Reveal
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: 'clamp(18px,2.4vw,40px)',
              alignItems: 'center',
              border: '1px solid rgba(244,243,239,.13)',
              borderRadius: 20,
              padding: 'clamp(20px,2.4vw,30px)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 'clamp(20px,2.4vw,30px)', fontFamily: 'var(--serif)', fontVariationSettings: "'opsz' 144, 'SOFT' 100", letterSpacing: '-.02em', lineHeight: 1.05, maxWidth: '22ch' }}>
                Un curso es una tarde. La comunidad es cada mes.
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.5)', maxWidth: '40ch' }}>
                Todavía no ha abierto. Quien reserva ahora entra por {eur(MEMBRESIA.precioReserva)} en vez de {eur(MEMBRESIA.precio)}.
              </span>
            </div>
            <Link href="/membresia" data-mag data-cur-label="Ver" className="pill pill-cream" style={{ justifySelf: 'end' }}>
              <span>Ver la membresía</span>
              <span className="pill-arrow">→</span>
            </Link>
          </Reveal>
          <div style={{ borderTop: '1px solid rgba(244,243,239,.1)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#F4F3EF' }}>
                <Marca tam={52} apilado />
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link href="/sinergia" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Prueba gratis</Link>
                <Link href="/membresia" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>La membresía</Link>
                <Link href="/#cita" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Sesión con Iris</Link>
              </div>
              <span style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(244,243,239,.3)', maxWidth: '58ch' }}>
                Los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(244,243,239,.28)' }}>© 2026 · Cursos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
