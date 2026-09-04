'use client';

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import SubNav from '@/components/SubNav';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import Pendiente from '@/components/Pendiente';
import { MEMBRESIA, PENDIENTE, eur } from '@/content/site';

export default function Membresia() {
  useSiteScroll();
  const ahorro = MEMBRESIA.precio - MEMBRESIA.precioReserva;

  return (
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'hidden' }}>
      <Cursor />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <SubNav links={[{ href: '#reservar', label: 'Reservar mi plaza' }]} cta="Reservar" ctaHref="#reservar" />

      {/* HERO */}
      <div id="top" className="claro" style={{ position: 'relative', color: 'var(--tx)', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: 'clamp(88px,12vh,130px) clamp(14px,3vw,36px) clamp(30px,5vh,56px)', overflow: 'hidden' }}>
        <CampoNumeros intensidad={0.7} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 75% 60% at 20% 25%,rgba(200,163,92,.13),transparent 62%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(28px,4vw,68px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,28px)' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--acento)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acento)' }} />
                Aún no ha abierto · lista de espera
              </div>
            </Reveal>
            <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'min(clamp(38px,5.8vw,78px),15vh)', fontFamily: 'var(--serif)', lineHeight: 0.99, letterSpacing: '-.026em', maxWidth: '15ch', textWrap: 'pretty' }}>
              Entenderlo lleva una sesión. <span style={{ color: 'var(--acento)' }}>Cambiarlo lleva meses.</span>
            </Reveal>
            <Reveal delay={150}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.25vw,20px)', lineHeight: 1.55, color: 'var(--tx-2)', maxWidth: '42ch' }}>
                Un patrón que lleva tres generaciones funcionando no se desmonta en una tarde. Por eso abro un grupo pequeño: cada mes miramos una parte de tu historia familiar y sueltas algo que llevabas cargando sin saberlo.
              </p>
            </Reveal>

            {/* Un paso al mes */}
            <Reveal delay={210}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 460 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 68 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${26 + i * 6}%`,
                        borderRadius: '5px 5px 2px 2px',
                        background: i < 3 ? 'linear-gradient(to top,var(--oro),var(--oro-luz))' : 'var(--linea)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--tx-3)' }}>
                  <span>mes 1</span>
                  <span>sin fecha de final</span>
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tx-2)' }}>
                  Un paso cada mes. Esto no se acaba en seis semanas.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Tarjeta de reserva */}
          <Reveal
            delay={140}
            style={{
              background: 'linear-gradient(155deg,rgba(251,246,238,.13),rgba(251,246,238,.05) 62%)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(200,155,74,.34)',
              borderRadius: 24,
              padding: 'clamp(24px,2.6vw,36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 34px 80px rgba(0,0,0,.5)',
              scrollMarginTop: 90,
            }}
          >
            <div id="reservar" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tx-2)' }}>Precio de reserva</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--acento)', border: '1px solid rgba(200,155,74,.45)', borderRadius: 100, padding: '5px 11px' }}>
                Ahorras {eur(ahorro)} al mes
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(52px,6.5vw,80px)', fontFamily: 'var(--serif)', letterSpacing: '-.032em', lineHeight: 0.85, color: 'var(--acento)' }}>
                {eur(MEMBRESIA.precioReserva)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--tx-3)', textDecoration: 'line-through' }}>{eur(MEMBRESIA.precio)}</span>
                <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>al mes</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tx-2)' }}>
              Reservar ahora no te cobra nada. Guarda tu precio: cuando abra, entras por {eur(MEMBRESIA.precioReserva)} al mes en vez de {eur(MEMBRESIA.precio)}, y lo mantienes mientras sigas dentro.
            </p>

            <div style={{ height: 1, background: 'var(--linea)' }} />

            <LeadForm
              origen="membresia"
              detalle={`Reserva a ${eur(MEMBRESIA.precioReserva)} (precio normal ${eur(MEMBRESIA.precio)})`}
              cta="Reservar mi plaza"
              successTitle="Plaza reservada."
              successText={`Te escribo en cuanto abra, con tu precio de ${eur(MEMBRESIA.precioReserva)} guardado. Si me dejaste el WhatsApp, te aviso también por ahí.`}
              privacidad="No se cobra nada ahora. Te aviso cuando abra y nada más."
              pedirNombre
              pedirWhatsapp
            />
          </Reveal>
        </div>
      </div>

      {/* QUÉ INCLUYE */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>Qué incluye cada mes</span>
              <Pendiente>Por definir</Pendiente>
              <span style={{ flex: 1, height: 1, background: 'var(--linea)', minWidth: 40 }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
            {MEMBRESIA.incluye.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  data-card
                  className="card-hover-light"
                  style={{
                    background: '#FFFFFF',
                    border: `1px ${item === PENDIENTE ? 'dashed' : 'solid'} var(--linea)`,
                    borderRadius: 18,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 18,
                    minHeight: 150,
                  }}
                >
                  <span data-cardnum style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.022em', color: 'var(--deco)', transition: 'color .5s ease' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item === PENDIENTE ? <Pendiente /> : <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3 }}>{item}</span>}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '52ch' }}>
              El contenido exacto se cierra antes de abrir. Quien esté en la lista lo recibe el primero, y decide entonces si entra o no.
            </p>
          </Reveal>
        </div>
      </div>

      {/* PARA QUIÉN */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(24px,3.4vw,56px)' }}>
          <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--acento)' }}>Para quién sí</span>
            {[
              'Si llevas años viendo el mismo final y ya te cansaste de explicártelo con fuerza de voluntad.',
              'Si has hecho una sesión y quieres seguir tirando del hilo, no quedarte con la foto.',
              'Si prefieres un paso al mes bien dado que un curso de seis semanas que se acaba.',
            ].map((l) => (
              <div key={l} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.55 }}>
                <span style={{ color: 'var(--acento)' }}>✓</span>
                <span style={{ color: 'var(--tx-2)' }}>{l}</span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={100} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tx-3)' }}>Para quién no</span>
            {[
              'Si lo que buscas es que te digan qué va a pasar. Aquí se trabaja con lo que ya está pasando.',
              'Si quieres resolverlo en una tarde. Esto va de meses, no de una sesión.',
              'Si estás en un momento delicado y lo que necesitas es un profesional de la salud mental.',
            ].map((l) => (
              <div key={l} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.55 }}>
                <span style={{ color: 'var(--tx-4)' }}>—</span>
                <span style={{ color: 'var(--tx-2)' }}>{l}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* CIERRE */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: '0 clamp(14px,3vw,36px) clamp(60px,8vw,110px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <Reveal>
            <div style={{ fontSize: 'clamp(26px,3.6vw,48px)', fontFamily: 'var(--serif)', lineHeight: 1.04, letterSpacing: '-.022em', maxWidth: '18ch', textWrap: 'pretty' }}>
              Cuando abra, los de la lista entran primero.
            </div>
          </Reveal>
          <Reveal delay={80}>
            <a href="#reservar" data-mag data-cur-label="Reservar" className="pill pill-gold">
              <span>Reservar mi plaza por {eur(MEMBRESIA.precioReserva)}</span>
              <span className="pill-arrow">→</span>
            </a>
          </Reveal>
          <Reveal delay={140}>
            <span style={{ fontSize: 13, color: 'var(--tx-3)' }}>No se cobra nada hoy.</span>
          </Reveal>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(34px,5vw,60px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                <Marca tam={52} apilado />
            </Link>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <Link href="/sinergia" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Prueba gratis</Link>
              <Link href="/cursos" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Cursos</Link>
              <Link href="/#cita" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Sesión con Iris</Link>
            </div>
            <span style={{ display: 'flex', gap: 14, fontSize: 12, marginBottom: 4 }}>
              <Link href="/legal" style={{ color: 'var(--tx-2)' }}>Aviso legal</Link>
              <Link href="/privacidad" style={{ color: 'var(--tx-2)' }}>Tus datos</Link>
            </span>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>
              Las sesiones y los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>© 2026 · La comunidad</span>
        </div>
      </div>
    </div>
  );
}
