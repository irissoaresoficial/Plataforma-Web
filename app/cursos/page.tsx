'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Cursor from '@/components/Cursor';
import DustField from '@/components/DustField';
import ParticleField from '@/components/ParticleField';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import SubNav from '@/components/SubNav';

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);

const PRECIO1 = 87;
const INSCRITOS1 = 19;
const CAP1 = 30;
const PRECIO2 = 129;
const INSCRITOS2 = 6;
const CAP2 = 24;

const AGENDA1 = [
  { h: '18:00', t: 'Apertura y para qué sirve un nombre', w: 45 },
  { h: '18:30', t: 'Cálculo de expresión en pantalla', w: 78 },
  { h: '19:45', t: 'Pausa', w: 20 },
  { h: '20:00', t: 'Cuatro nombres leídos en directo', w: 100 },
  { h: '21:15', t: 'Qué te llevas y cómo seguir', w: 55 },
];
const AGENDA2 = [
  { h: 'T1 · 18:00', t: 'Tu techo: la cifra que se rompe', w: 70 },
  { h: 'T1 · 19:15', t: 'Quién perdió qué en tu línea', w: 90 },
  { h: 'T1 · 20:30', t: 'Mapa de herencias y ruinas', w: 60 },
  { h: 'T2 · 18:00', t: 'Lealtades caras al descubierto', w: 82 },
  { h: 'T2 · 19:15', t: 'Ejercicios de cierre', w: 48 },
  { h: 'T2 · 20:15', t: 'La carta que se escribe y se guarda', w: 100 },
];
const CEILING = [
  { label: 'abuelos', v: 22 },
  { label: 'padres', v: 38 },
  { label: 'tú hoy', v: 61 },
  { label: 'techo', v: 100, hot: true },
  { label: 'lo que intentas', v: 74 },
  { label: 'lo que vuelve', v: 40 },
  { label: 'después', v: 30 },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
}

export default function Cursos() {
  useSiteScroll();
  const [n1, setN1] = useState('');
  const [m1, setM1] = useState('');
  const [case1, setCase1] = useState(true);
  const [e1, setE1] = useState('');
  const [d1, setD1] = useState(false);
  const [n2, setN2] = useState('');
  const [m2, setM2] = useState('');
  const [e2, setE2] = useState('');
  const [d2, setD2] = useState(false);

  const left1 = CAP1 - INSCRITOS1;
  const left2 = CAP2 - INSCRITOS2;

  const send1 = () => {
    if (n1.trim().split(/\s+/).length < 2) return setE1('Escribe tu nombre completo.');
    if (!isValidEmail(m1)) return setE1('Ese correo no parece válido.');
    setE1('');
    setD1(true);
  };
  const send2 = () => {
    if (n2.trim().split(/\s+/).length < 2) return setE2('Escribe tu nombre completo.');
    if (!isValidEmail(m2)) return setE2('Ese correo no parece válido.');
    setE2('');
    setD2(true);
  };

  const ring = (taken: number, cap: number, hero: boolean) => {
    const pct = Math.round((taken / cap) * 100);
    return `conic-gradient(#C89B4A 0% ${pct}%,rgba(244,243,239,${hero ? '.14' : '.1'}) ${pct}% 100%)`;
  };
  const seats = (taken: number, cap: number) =>
    Array.from({ length: 10 }, (_, i) => i < Math.round((taken / cap) * 10));

  const cards = useMemo(
    () => [
      { href: '#c1', day: '25', month: 'septiembre', time: '18:00 → 22:00 CET', title: 'El nombre que te pusieron', claim: 'A quién repites y qué se esperaba de ti antes de nacer.', hours: '4 h · una tarde', price: eur(PRECIO1), left: left1, taken: INSCRITOS1, cap: CAP1, hero: true },
      { href: '#c2', day: '13', month: 'noviembre', time: '18:00 → 21:00 CET', title: 'El dinero de tu familia', claim: 'Por qué ganas más y acabas igual de justo.', hours: '6 h · dos tardes', price: eur(PRECIO2), left: left2, taken: INSCRITOS2, cap: CAP2, hero: false },
    ],
    []
  );

  return (
    <div style={{ width: '100%', background: '#0A0A0C', color: '#F4F3EF', overflowX: 'hidden' }}>
      <Cursor hitSelector="[data-mag],a,input,label" />
      <DustField />
      <SubNav
        links={[
          { href: '#c1', label: '25 sep' },
          { href: '#c2', label: '13 nov' },
        ]}
        cta="La Escuela"
        ctaHref="/escuela"
      />

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
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.4vw,46px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Reveal>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Próximos cursos · otoño 2026</div>
            </Reveal>
            <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'clamp(38px,6.6vw,96px)', fontWeight: 900, lineHeight: 0.94, letterSpacing: '-.05em', maxWidth: '15ch' }}>
              Dos tardes que cambian la conversación en tu casa.
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(12px,1.6vw,20px)' }}>
            {cards.map((c) => (
              <a
                key={c.href}
                href={c.href}
                data-mag
                data-cur-label="Ver"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 'clamp(20px,2.4vw,30px)',
                  minHeight: 340,
                  borderRadius: 24,
                  padding: 'clamp(20px,2.4vw,30px)',
                  color: '#F4F3EF',
                  border: `1px solid ${c.hero ? 'rgba(200,155,74,.4)' : 'rgba(244,243,239,.13)'}`,
                  background: c.hero ? 'linear-gradient(160deg,rgba(200,155,74,.13),rgba(10,10,12,0) 60%)' : 'rgba(244,243,239,.02)',
                }}
                className="card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 'clamp(64px,8vw,116px)', fontWeight: 900, letterSpacing: '-.06em', lineHeight: 0.86 }}>{c.day}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#C89B4A' }}>{c.month}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(244,243,239,.4)' }}>{c.time}</span>
                  </div>
                  <div style={{ position: 'relative', width: 74, height: 74, borderRadius: '50%', flexShrink: 0, background: ring(c.taken, c.cap, c.hero) }}>
                    <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: '#0A0A0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-.03em' }}>{c.left}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,243,239,.4)' }}>libres</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 'clamp(21px,2.3vw,29px)', fontWeight: 700, letterSpacing: '-.028em', lineHeight: 1.1 }}>{c.title}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(244,243,239,.55)' }}>{c.claim}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div style={{ display: 'flex', gap: 3, height: 8 }}>
                    {seats(c.taken, c.cap).map((on, i) => (
                      <span key={i} style={{ flex: 1, borderRadius: 100, background: on ? '#C89B4A' : 'rgba(244,243,239,.13)' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'rgba(244,243,239,.4)' }}>{c.taken} de {c.cap} plazas ocupadas</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.035em', color: '#C89B4A' }}>{c.price}</span>
                      <span style={{ fontSize: 12, color: 'rgba(244,243,239,.4)' }}>{c.hours}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* CURSO 1 */}
      <div id="c1" style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: 'clamp(50px,7vw,104px) clamp(14px,3vw,36px)', scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.2vw,46px)' }}>
          <Reveal
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
              gap: 'clamp(18px,2.6vw,44px)',
              alignItems: 'end',
              borderBottom: '1px solid rgba(10,10,12,.14)',
              paddingBottom: 'clamp(18px,2.2vw,28px)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>Curso 01 · 25 septiembre 2026</span>
              <span style={{ fontSize: 'clamp(30px,4.4vw,64px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-.045em', maxWidth: '15ch' }}>El nombre que te pusieron.</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,2.4vw,38px)', justifySelf: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>4 h</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8A92' }}>en directo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{left1}/{CAP1}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8A92' }}>plazas libres</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1, color: '#8F6B18' }}>{eur(PRECIO1)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8A92' }}>con grabación</span>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(14px,2vw,26px)', alignItems: 'start' }}>
            <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div data-hov-img style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, aspectRatio: '4/3', background: '#E7E5DF' }}>
                <Image src="/images/iris.jpg" alt="Iris Soares" fill sizes="500px" style={{ objectFit: 'cover', objectPosition: 'center 14%', transition: 'transform 1s cubic-bezier(.16,1,.3,1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,10,12,.65),transparent 55%)' }} />
                <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#F4F3EF' }}>Lo da Iris, en directo</span>
                  <span style={{ fontSize: 12, color: 'rgba(244,243,239,.65)' }}>18:00 → 22:00 CET</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: '#6B6B72' }}>
                Por qué te llamas como te llamas: a quién repites, qué se esperaba de ti antes de nacer y qué hacer con eso. Se calcula tu nombre completo en pantalla y se compara con tu fecha.
              </p>
            </Reveal>

            <Reveal delay={80} style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.1)', borderRadius: 20, padding: 'clamp(18px,2vw,26px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>Cómo va la tarde</span>
              {AGENDA1.map((a) => (
                <div key={a.h} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.01em', color: '#0A0A0C' }}>{a.h}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.015em' }}>{a.t}</span>
                    <div style={{ height: 6, borderRadius: 100, width: `${a.w}%`, background: 'linear-gradient(90deg,#C89B4A,rgba(200,155,74,.35))' }} />
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal delay={160} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.1)', borderRadius: 20, padding: 'clamp(18px,2vw,26px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>Los cuatro bloques</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    ['01', 'De dónde sale tu nombre', 'Quién lo eligió y qué deuda hay detrás.'],
                    ['02', 'Cálculo de expresión', 'Tu número de nombre frente a tu fecha.'],
                    ['03', 'Repetir un nombre', 'Llevar el de tu madre, un hermano muerto o un santo impuesto.'],
                    ['04', 'Casos en directo', 'Iris lee cuatro nombres del grupo.'],
                  ].map(([n, title, desc]) => (
                    <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.04em', color: 'rgba(10,10,12,.16)', width: 28, flexShrink: 0 }}>{n}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</span>
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: '#6B6B72' }}>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0A0A0C', color: '#F4F3EF', borderRadius: 20, padding: 'clamp(18px,2vw,26px)', display: 'flex', flexDirection: 'column', gap: 13 }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.025em' }}>Guardar mi plaza</span>
                {!d1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <input
                      type="text"
                      value={n1}
                      placeholder="Tu nombre completo"
                      onChange={(e) => {
                        setN1(e.target.value);
                        setE1('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && send1()}
                      className="field-input"
                      style={{ background: 'rgba(244,243,239,.06)', border: '1px solid rgba(244,243,239,.16)', color: '#F4F3EF' }}
                    />
                    <input
                      type="email"
                      value={m1}
                      placeholder="tucorreo@ejemplo.com"
                      onChange={(e) => {
                        setM1(e.target.value);
                        setE1('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && send1()}
                      className="field-input"
                      style={{ background: 'rgba(244,243,239,.06)', border: '1px solid rgba(244,243,239,.16)', color: '#F4F3EF' }}
                    />
                    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, color: 'rgba(244,243,239,.6)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={case1} onChange={(e) => setCase1(e.target.checked)} style={{ marginTop: 3, accentColor: '#C89B4A' }} />
                      <span>Ofrezco mi nombre para que Iris lo lea en directo</span>
                    </label>
                    <div onClick={send1} data-mag data-cur-label="Enviar" className="pill pill-gold" style={{ justifyContent: 'center' }}>
                      <span>Reservar · {eur(PRECIO1)}</span>
                      <span>→</span>
                    </div>
                    {e1 && <span style={{ fontSize: 13, color: '#E08585' }}>{e1}</span>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, border: '1px solid rgba(124,196,138,.4)', background: 'rgba(124,196,138,.08)', borderRadius: 14, padding: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#7CC48A' }}>Plaza guardada</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.62)' }}>Te llega a {m1} el enlace de pago y la sala del 25 de septiembre.</span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* CURSO 2 */}
      <div id="c2" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(50px,7vw,104px) clamp(14px,3vw,36px)', scrollMarginTop: 74 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.2vw,46px)' }}>
          <Reveal
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
              gap: 'clamp(18px,2.6vw,44px)',
              alignItems: 'end',
              borderBottom: '1px solid rgba(244,243,239,.14)',
              paddingBottom: 'clamp(18px,2.2vw,28px)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Curso 02 · 13 noviembre 2026</span>
              <span style={{ fontSize: 'clamp(30px,4.4vw,64px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-.045em', maxWidth: '15ch' }}>El dinero de tu familia.</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,2.4vw,38px)', justifySelf: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>6 h</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(244,243,239,.42)' }}>en dos tardes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1 }}>{left2}/{CAP2}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(244,243,239,.42)' }}>plazas libres</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1, color: '#C89B4A' }}>{eur(PRECIO2)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(244,243,239,.42)' }}>con grabación</span>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(14px,2vw,26px)', alignItems: 'start' }}>
            <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ border: '1px solid rgba(244,243,239,.13)', borderRadius: 20, padding: 'clamp(18px,2vw,26px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Tu techo económico</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
                  {CEILING.map((b) => (
                    <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6, height: '100%' }}>
                      <div
                        style={{
                          height: `${b.v}%`,
                          borderRadius: '6px 6px 2px 2px',
                          background: b.hot ? 'linear-gradient(to top,#C89B4A,#E0B15C)' : 'rgba(244,243,239,.16)',
                          transition: 'height .8s cubic-bezier(.16,1,.3,1)',
                        }}
                      />
                      <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', color: 'rgba(244,243,239,.38)', whiteSpace: 'pre-line' }}>{b.label}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.55)' }}>
                  Casi todo el mundo tiene una cifra a partir de la cual algo se rompe. En el curso se calcula la tuya y se busca en qué generación se fijó.
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: 'rgba(244,243,239,.58)' }}>
                Herencias mal repartidas, ruinas que nadie nombra y lealtades caras: no ganar más que tu padre, no pedir, no cobrar lo que vale tu trabajo.
              </p>
            </Reveal>

            <Reveal delay={80} style={{ border: '1px solid rgba(244,243,239,.13)', borderRadius: 20, padding: 'clamp(18px,2vw,26px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Las dos tardes</span>
              {AGENDA2.map((a) => (
                <div key={a.h} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(244,243,239,.75)' }}>{a.h}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.015em' }}>{a.t}</span>
                    <div style={{ height: 6, borderRadius: 100, width: `${a.w}%`, background: 'linear-gradient(90deg,#C89B4A,rgba(200,155,74,.25))' }} />
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal
              delay={160}
              style={{
                background: 'linear-gradient(155deg,rgba(200,155,74,.12),rgba(10,10,12,0) 62%)',
                border: '1px solid rgba(200,155,74,.34)',
                borderRadius: 20,
                padding: 'clamp(18px,2vw,26px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 13,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.025em' }}>Guardar mi plaza</span>
              {!d2 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <input
                    type="text"
                    value={n2}
                    placeholder="Tu nombre completo"
                    onChange={(e) => {
                      setN2(e.target.value);
                      setE2('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && send2()}
                    className="field-input"
                    style={{ background: 'rgba(244,243,239,.06)', border: '1px solid rgba(244,243,239,.16)', color: '#F4F3EF' }}
                  />
                  <input
                    type="email"
                    value={m2}
                    placeholder="tucorreo@ejemplo.com"
                    onChange={(e) => {
                      setM2(e.target.value);
                      setE2('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && send2()}
                    className="field-input"
                    style={{ background: 'rgba(244,243,239,.06)', border: '1px solid rgba(244,243,239,.16)', color: '#F4F3EF' }}
                  />
                  <div onClick={send2} data-mag data-cur-label="Enviar" className="pill pill-gold" style={{ justifyContent: 'center' }}>
                    <span>Reservar · {eur(PRECIO2)}</span>
                    <span>→</span>
                  </div>
                  {e2 && <span style={{ fontSize: 13, color: '#E08585' }}>{e2}</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, border: '1px solid rgba(124,196,138,.4)', background: 'rgba(124,196,138,.08)', borderRadius: 14, padding: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#7CC48A' }}>Plaza guardada</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.62)' }}>Te llega a {m2} el enlace de pago y las dos sesiones de noviembre.</span>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', borderTop: '1px solid rgba(244,243,239,.1)', padding: 'clamp(38px,5vw,68px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              <span style={{ fontSize: 'clamp(20px,2.4vw,30px)', fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.05, maxWidth: '22ch' }}>Los dos cursos entran en la membresía.</span>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.5)', maxWidth: '40ch' }}>Linaje incluye estas dos fechas y los directos mensuales por menos que las dos entradas sueltas.</span>
            </div>
            <Link href="/escuela#membresia" data-mag data-cur-label="Ver" className="pill pill-cream" style={{ justifySelf: 'end' }}>
              <span>Ver la membresía</span>
              <span className="pill-arrow">→</span>
            </Link>
          </Reveal>
          <div style={{ borderTop: '1px solid rgba(244,243,239,.1)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#F4F3EF' }}>
                iris soares
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link href="/escuela" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>La Escuela</Link>
                <Link href="/escuela#curso" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Curso de numerología transgeneracional</Link>
                <Link href="/sinergia" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Sinergia</Link>
              </div>
              <span style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(244,243,239,.3)', maxWidth: '58ch' }}>Los cursos del método IRIS no son un tratamiento médico ni psicológico y no sustituyen a ninguno.</span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(244,243,239,.28)' }}>© 2026 · Cursos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
