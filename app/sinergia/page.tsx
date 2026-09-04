'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cursor from '@/components/Cursor';
import DustField from '@/components/DustField';
import ParticleField from '@/components/ParticleField';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import SubNav from '@/components/SubNav';
import { estudio, emailValido, limpiar, SENTIDO, type Estudio } from '@/lib/numerologia';
import { sendLead } from '@/lib/sendLead';
import Informe from '@/components/Informe';

const RELACIONES = ['Mi madre', 'Mi padre', 'Mi pareja', 'Mi hijo/a', 'Mi hermano/a', 'Mi socio/a', 'Mi jefe/a', 'Otra persona'];

export default function Sinergia() {
  useSiteScroll();
  const [step, setStep] = useState(0);
  const [aName, setAName] = useState('');
  const [aDate, setADate] = useState('');
  const [bName, setBName] = useState('');
  const [bDate, setBDate] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [res, setRes] = useState<Estudio | null>(null);
  const [leadOk, setLeadOk] = useState<boolean | null>(null);
  const [rel, setRel] = useState('');

  const isForm = step === 0 || step === 1;
  const isGate = step === 2;
  const isResult = step === 3;
  const stepLabel = step === 3 ? 'Tu resultado' : `Paso ${step + 1}/3`;

  const next = () => {
    if (step === 0) {
      if (limpiar(aName).length < 3) return setErr('Escribe el nombre completo.');
      if (!aDate) return setErr('Falta la fecha de nacimiento.');
      setErr('');
      setStep(1);
      return;
    }
    if (step === 1) {
      if (limpiar(bName).length < 3) return setErr('Escribe el nombre completo.');
      if (!bDate) return setErr('Falta la fecha de nacimiento.');
      setErr('');
      setRes(estudio(aName, aDate, bName, bDate, rel));
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!emailValido(email)) return setErr('Ese correo no parece válido.');
      setErr('');
      setStep(3);

      // El resultado se enseña igual: si el correo no se puede guardar, se avisa abajo.
      const r = res || estudio(aName, aDate, bName, bDate, rel);
      sendLead({
        email,
        nombre: aName,
        origen: 'sinergia',
        detalle:
          `${rel ? rel + ': ' : ''}${r.a.nombrePila} ${r.a.camino.valor} · ${r.b.nombrePila} ${r.b.camino.valor} · ` +
          `juntos ${r.comun} (${r.nombreVinculo})` +
          (r.repeticiones.length ? ` · ${r.repeticiones.length} repeticiones` : ''),
      }).then(setLeadOk);
    }
  };

  const reset = () => {
    setStep(0);
    setBName('');
    setBDate('');
    setRel('');
    setErr('');
    setRes(null);
    setLeadOk(null);
  };

  const dot = (i: number) => ({
    width: i === step ? 18 : 6,
    height: 6,
    borderRadius: 100,
    background: i <= step ? '#C89B4A' : 'rgba(10,10,12,.16)',
    transition: 'width .4s cubic-bezier(.16,1,.3,1),background .4s ease',
  });

  return (
    <div id="page" style={{ width: '100%', background: '#0A0A0C', color: '#F4F3EF', overflowX: 'hidden' }}>
      <Cursor hitSelector="[data-mag],a,input,[data-card]" />
      <DustField />
      <SubNav links={[]} cta="Probarlo gratis" ctaHref="#calc" />

      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(86px,11vh,124px) clamp(14px,3vw,36px) clamp(30px,5vh,54px)', overflow: 'hidden' }}>
        <ParticleField />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 78% 30%,rgba(200,155,74,.16),transparent 62%),linear-gradient(to bottom,rgba(10,10,12,.5),rgba(10,10,12,.92))',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(26px,3.4vw,58px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,28px)' }}>
            <Reveal>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Gratis · resultado al momento</div>
            </Reveal>
            <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'min(clamp(38px,6vw,80px),15vh)', fontFamily: 'var(--serif)', lineHeight: 0.99, letterSpacing: '-.045em', maxWidth: '16ch' }}>
              Con tu madre, con tu socio, con tu pareja: <span style={{ color: '#C89B4A' }}>siempre acabas en el mismo sitio</span>.
            </Reveal>
            <Reveal delay={150}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.25vw,20px)', lineHeight: 1.5, color: 'rgba(244,243,239,.6)', maxWidth: '40ch' }}>
                Elige a cualquier persona de tu vida —tu madre, tu padre, tu abuela, tu hijo, tu socio, tu pareja— y mira qué se activa entre los dos. Dos nombres, dos fechas y lo tienes.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Tu número y el de esa persona', 'Lo que se activa entre los dos', 'Tres frases concretas para trabajarlo'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                    <span style={{ color: '#C89B4A' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={290}>
              <a href="#calc" data-mag data-cur-label="Empezar" className="pill pill-cream" style={{ alignSelf: 'flex-start' }}>
                <span>Elegir a una persona</span>
                <span className="pill-arrow">↓</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div id="calc" style={{ background: '#FFFFFF', color: '#0A0A0C', borderRadius: 22, padding: 'clamp(20px,2.4vw,32px)', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 34px 80px rgba(0,0,0,.5)', scrollMarginTop: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>{stepLabel}</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={dot(i)} />
                  ))}
                </div>
              </div>

              {isForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 'clamp(20px,2.2vw,27px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.15 }}>{step === 0 ? 'Tus datos' : 'La otra persona'}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>
                    {step === 0 ? 'Tu nombre completo y tu fecha de nacimiento.' : 'Cualquiera: alguien de tu familia, de tu trabajo o de tu casa.'}
                  </p>
                  {step === 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {RELACIONES.map((r) => {
                        const on = rel === r;
                        return (
                          <span
                            key={r}
                            onClick={() => setRel(on ? '' : r)}
                            data-mag
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              padding: '8px 13px',
                              borderRadius: 100,
                              cursor: 'pointer',
                              transition: 'background .3s ease,border-color .3s ease,color .3s ease',
                              border: `1px solid ${on ? '#C89B4A' : 'rgba(10,10,12,.14)'}`,
                              background: on ? '#C89B4A' : 'transparent',
                              color: on ? '#0A0A0C' : '#6B6B72',
                            }}
                          >
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <input
                    type="text"
                    value={step === 0 ? aName : bName}
                    placeholder={step === 0 ? 'Tu nombre completo' : 'Su nombre completo'}
                    onChange={(e) => {
                      setErr('');
                      step === 0 ? setAName(e.target.value) : setBName(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    className="field-input"
                    style={{ background: '#F5F4F0', border: '1px solid rgba(10,10,12,.1)', color: '#0A0A0C' }}
                  />
                  <input
                    type="date"
                    value={step === 0 ? aDate : bDate}
                    onChange={(e) => {
                      setErr('');
                      step === 0 ? setADate(e.target.value) : setBDate(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    className="field-input"
                    style={{ background: '#F5F4F0', border: '1px solid rgba(10,10,12,.1)', color: '#0A0A0C' }}
                  />
                  <div onClick={next} data-mag className="pill pill-dark" style={{ justifyContent: 'center' }}>
                    <span>{step === 0 ? 'Siguiente' : 'Calcular'}</span>
                    <span>→</span>
                  </div>
                  {err && <div style={{ fontSize: 13, color: '#A33B3B' }}>{err}</div>}
                </div>
              )}

              {isGate && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 118, background: '#F5F4F0', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8A8A92' }}>{res?.a.nombrePila}</span>
                      <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{res?.a.camino.valor}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 118, background: '#F5F4F0', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8A8A92' }}>{res?.b.nombrePila}</span>
                      <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{res?.b.camino.valor}</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', background: '#0A0A0C', color: '#F4F3EF', borderRadius: 16, padding: 22, overflow: 'hidden' }}>
                    <div style={{ filter: 'blur(7px)', opacity: 0.4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1 }}>{res?.comun}</span>
                      <div style={{ height: 9, borderRadius: 100, background: 'rgba(244,243,239,.3)' }} />
                      <div style={{ height: 9, borderRadius: 100, background: 'rgba(244,243,239,.3)', width: '68%' }} />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>
                      Para verlo, tu correo
                    </div>
                  </div>
                  <input
                    type="email"
                    value={email}
                    placeholder="tucorreo@ejemplo.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErr('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    className="field-input"
                    style={{ background: '#F5F4F0', border: '1px solid rgba(10,10,12,.1)', color: '#0A0A0C' }}
                  />
                  <div onClick={next} data-mag data-cur-label="Ver" className="pill pill-gold" style={{ justifyContent: 'center' }}>
                    <span>Ver mi resultado</span>
                    <span>→</span>
                  </div>
                  {err && <div style={{ fontSize: 13, color: '#A33B3B' }}>{err}</div>}
                  <span style={{ fontSize: 11, lineHeight: 1.6, color: '#8A8A92' }}>
                    Te mando el resultado y, durante unos días, lo que significa y de dónde viene. Te borras en un clic cuando quieras.
                  </span>
                </div>
              )}

              {isResult && res && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {rel && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#8F6B18' }}>
                      {rel === 'Otra persona' ? 'Con esa persona' : `Con ${rel.toLowerCase()}`}
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 118, background: '#F5F4F0', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8A8A92' }}>{res.a.nombrePila}</span>
                      <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{res.a.camino.valor}</span>
                      <span style={{ fontSize: 13, color: '#6B6B72' }}>{SENTIDO[res.a.camino.valor]?.clave}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 118, background: '#F5F4F0', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8A8A92' }}>{res.b.nombrePila}</span>
                      <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{res.b.camino.valor}</span>
                      <span style={{ fontSize: 13, color: '#6B6B72' }}>{SENTIDO[res.b.camino.valor]?.clave}</span>
                    </div>
                  </div>
                  <div style={{ background: '#0A0A0C', color: '#F4F3EF', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(244,243,239,.45)' }}>Lo que se activa entre los dos</span>
                        <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1, color: '#C89B4A' }}>{res.comun}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, border: '1px solid rgba(200,155,74,.5)', color: '#C89B4A', borderRadius: 100, padding: '7px 13px' }}>{res.nombreVinculo}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.7)' }}>
                      {res.lineas.map((l, i) => (
                        <div key={i} style={{ display: 'flex', gap: 9 }}>
                          <span style={{ color: '#C89B4A' }}>·</span>
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {res.repeticiones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#F5F4F0', borderRadius: 16, padding: 20 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>
                        Lo que se repite entre los dos
                      </span>
                      {res.repeticiones.map((r, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{r.titulo}</span>
                          <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>{r.detalle}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#6B6B72' }}>
                    Esto explica el roce, pero no de dónde viene. Eso está en tu línea familiar, y se mira entera.
                  </p>
                  <Link href="/#lista-espera" data-mag data-cur-label="Ver" className="pill pill-gold" style={{ justifyContent: 'center' }}>
                    <span>Mirar la mía entera</span>
                    <span>→</span>
                  </Link>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div onClick={() => window.print()} data-mag data-cur-label="PDF" className="pill pill-dark" style={{ flex: 1, minWidth: 148, justifyContent: 'center' }}>
                      <span>Descargar el informe</span>
                      <span>↓</span>
                    </div>
                    <Link href="/#cita" data-mag className="btn-outline btn-outline-dark" style={{ flex: 1, minWidth: 148, justifyContent: 'center' }}>
                      Sesión con Iris
                    </Link>
                  </div>
                  {leadOk === false && (
                    <span style={{ fontSize: 12, lineHeight: 1.6, color: '#A33B3B' }}>
                      No he podido guardar tu correo, así que no te llegará nada por email. Descárgate el resultado en PDF con el botón de arriba.
                    </span>
                  )}
                  <div onClick={reset} style={{ fontSize: 13, color: '#8A8A92', cursor: 'pointer', textAlign: 'center' }}>
                    Probar con otra persona
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>
              <span>Cómo se calcula</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(10,10,12,.12)' }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10 }}>
            {[
              ['01', 'Tu número', 'Se suman los dígitos de tu fecha de nacimiento hasta dejar uno solo.'],
              ['02', 'El de la otra persona', 'Lo mismo con su fecha. Dos números que ya explican mucho.'],
              ['03', 'Y el de los dos', 'Sumando los vuestros sale lo que se activa cuando estáis juntos.'],
            ].map(([n, title, desc], i) => (
              <Reveal key={n} delay={i * 90}>
                <div data-card className="card-hover-light" style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.1)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20, minHeight: 190 }}>
                  <span data-cardnum style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-.04em', color: 'rgba(10,10,12,.14)', transition: 'color .5s ease' }}>{n}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>{desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ fontSize: 'clamp(22px,3vw,40px)', fontFamily: 'var(--serif)', lineHeight: 1.06, letterSpacing: '-.04em', maxWidth: '24ch' }}>
              Esto es una foto. En consulta se ve la película entera: de dónde viene y en qué generación empezó.
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Link href="/#lista-espera" data-mag data-cur-label="Ver" className="pill pill-dark">
                <span>Ver la comunidad</span>
                <span className="pill-arrow" style={{ background: '#C89B4A', color: '#0A0A0C' }}>→</span>
              </Link>
              <Link href="/#cita" data-mag className="btn-outline btn-outline-dark">
                O reservar una sesión
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', borderTop: '1px solid rgba(244,243,239,.1)', padding: 'clamp(34px,5vw,60px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#F4F3EF' }}>
              iris soares
            </Link>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(244,243,239,.3)', maxWidth: '58ch' }}>
              Los estudios de gestión emocional y numerología transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(244,243,239,.28)' }}>© 2026</span>
        </div>
      </div>

      {res && <Informe e={res} />}
    </div>
  );
}
