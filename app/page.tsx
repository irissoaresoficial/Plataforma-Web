'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import Cursor from '@/components/Cursor';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import Foto from '@/components/Foto';
import useSiteScroll from '@/components/useSiteScroll';
import HomeNav from '@/components/HomeNav';
import Marca from '@/components/Marca';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
import { useLang } from '@/lib/i18n';
import { CONTACTO, FOTOS, MEMBRESIA, eur } from '@/content/site';

const PAD = 'clamp(76px,10vw,150px) clamp(16px,4vw,56px)';
const ANCHO = 1320;

/** Rótulo de sección: línea fina + palabra pequeña. */
function Rotulo({ children, claro = false }: { children: React.ReactNode; claro?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--acento)' }}>
      <span style={{ width: 22, height: 1, background: 'currentColor', opacity: 0.5 }} />
      <span>{children}</span>
    </div>
  );
}

function PillCTA({ onClick, href, variant, label, curLabel }: { onClick?: () => void; href?: string; variant: 'cream' | 'gold' | 'dark'; label: string; curLabel?: string }) {
  const cls = `pill pill-${variant}`;
  const inner = (
    <>
      <span>{label}</span>
      <span className="pill-arrow">→</span>
    </>
  );
  return href ? (
    <Link href={href} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </Link>
  ) : (
    <div onClick={onClick} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  useSiteScroll({ methodProgress: true });
  const chatRef = useRef<ChatWidgetHandle>(null);
  const openChat = () => chatRef.current?.open();
  const [faq, setFaq] = useState(-1);

  const faqs: [string, string][] = [
    [t.f_q1, t.f_a1],
    [t.f_q2, t.f_a2],
    [t.f_q3, t.f_a3],
    [t.f_q4, t.f_a4],
  ];
  const chips = [t.w1, t.w2, t.w3, t.w4, t.w5, t.w6];
  const dolor = [t.p1, t.p2, t.p3, t.p4];
  const pasos: [string, string][] = [
    [t.m1t, t.m1p],
    [t.m2t, t.m2p],
    [t.m3t, t.m3p],
  ];

  return (
    <div id="app" className="claro" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'hidden' }}>
      <Cursor />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <HomeNav onBook={openChat} />

      {/* ── APERTURA ─────────────────────────────────────────── */}
      {/* El retrato va dentro de un arco: un nicho, no un rectángulo. Es el
          gesto que le da carácter a la portada, y le pega a una escuela.
          El sello de la casa gira despacio apoyado en el borde del arco. */}
      <div id="top" className="claro" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(112px,14vh,168px) clamp(16px,4vw,56px) clamp(48px,7vh,86px)', overflow: 'hidden' }}>
        <CampoNumeros intensidad={0.7} />
        <div id="glow" style={{ position: 'absolute', width: 900, height: 900, left: 0, top: 0, margin: '-450px 0 0 -450px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,163,92,.16),transparent 66%)', pointerEvents: 'none', transition: 'opacity .6s ease' }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: ANCHO, margin: '0 auto', width: '100%' }}>
          <div className="hero-rejilla">
            <div className="hero-texto" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px,2.8vw,36px)' }}>
              <Reveal>
                <Rotulo>{t.kick}</Rotulo>
              </Reveal>
              {/* Dos voces en el mismo titular: la afirmación en seco, y el giro
                  en cursiva. El contraste es lo que lo hace legible de un vistazo. */}
              <Reveal as="h1" delay={70} style={{ margin: 0, lineHeight: 1.04 }}>
                {/* Las mayúsculas piden aire, no tracking negativo: apretadas se
                    leen como un bloque en vez de como una frase. */}
                <span style={{ display: 'block', fontFamily: 'var(--sans)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.004em', wordSpacing: '.05em', fontSize: 'min(clamp(27px,2.9vw,42px),5.6vh)' }}>
                  {t.h1a}
                </span>
                <span className="display" style={{ display: 'block', fontStyle: 'italic', color: 'var(--acento)', letterSpacing: '-.012em', lineHeight: 0.98, fontSize: 'min(clamp(44px,5.4vw,86px),12vh)', marginTop: '.1em' }}>
                  {t.h1b}
                </span>
              </Reveal>
              <Reveal delay={150} desde="izq">
                <p style={{ margin: 0, fontSize: 'clamp(16px,1.2vw,20px)', lineHeight: 1.55, color: 'var(--tx-2)', maxWidth: '32ch' }}>{t.hsub}</p>
              </Reveal>
              <Reveal delay={220}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <PillCTA onClick={openChat} variant="cream" label={t.hcta} curLabel={t.cbook} />
                  <Link href="/sinergia" data-mag className="btn-outline">
                    {t.hcta2}
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120} desde="crece" className="hero-arco-caja">
              {/* La flotación va en su propia capa: el Reveal ya usa transform
                  en la caja de fuera, y dos animaciones sobre la misma
                  propiedad se pisan. */}
              <div className="hero-flota">
                <div className="hero-arco">
                  <Foto src={FOTOS.portada} alt="Iris Soares" llenar radius={0} priority sizes="(max-width:900px) 78vw, 40vw" objectPosition="center 42%" />
                </div>
                {/* El filete dorado repite el arco un poco por fuera. */}
                <span className="hero-arco-filete" aria-hidden />
                <span className="hero-sello" aria-hidden>
                  <Marca tam={74} texto={false} />
                </span>
              </div>
              {/* La sombra va suelta en el suelo y se encoge cuando ella sube:
                  sin eso, subir y bajar no se lee como flotar. */}
              <span className="hero-sombra" aria-hidden />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── FRANJA DE IMÁGENES: sin una palabra ─────────────── */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(70px,9vw,120px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'clamp(10px,1.4vw,18px)', alignItems: 'start' }}>
          {/* Tamaños y alturas distintos: una rejilla perfecta se lee como catálogo. */}
          <Reveal desde="crece" style={{ paddingTop: 'clamp(0px,5vw,72px)' }}>
            <Foto src={FOTOS.hablando} alt="Iris en directo" ratio="3/4" radius={18} sizes="(max-width:900px) 100vw, 30vw" />
          </Reveal>
          <Reveal delay={90} desde="crece">
            <Foto src={FOTOS.cerca} alt="Iris Soares" ratio="3/4" radius={18} sizes="(max-width:900px) 100vw, 30vw" />
          </Reveal>
          <Reveal delay={180} desde="crece" style={{ paddingTop: 'clamp(0px,9vw,128px)' }}>
            <Foto src={FOTOS.sala} alt="Sala" ratio="1/1" radius={18} sizes="(max-width:900px) 100vw, 30vw" />
          </Reveal>
        </div>
      </div>

      {/* ── EL DOLOR ─────────────────────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(34px,4vw,56px)' }}>
          <Reveal>
            <Rotulo claro>{t.p_lab}</Rotulo>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dolor.map((linea, i) => (
              <Reveal key={i} line delay={i * 70}>
                <div className="line-hover" style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(14px,2.4vw,32px)', padding: 'clamp(16px,2vw,26px) 0', borderBottom: '1px solid var(--linea)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--acento)', flexShrink: 0, width: 18 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="display" style={{ fontSize: 'clamp(24px,3.4vw,48px)', color: i === 3 ? 'var(--tx-2)' : undefined }}>{linea}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="display" style={{ fontSize: 'clamp(30px,5vw,68px)', maxWidth: '18ch' }}>
              <em>{t.p_punch}</em>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── POR QUÉ PASA ─────────────────────────────────────── */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,84px)', alignItems: 'center' }}>
          <Reveal>
            <div data-par="-.04">
              <Foto src={FOTOS.hablando} alt="Iris Soares" ratio="4/5" radius={22} sizes="(max-width:900px) 100vw, 42vw" />
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.4vw,28px)' }}>
            <Reveal>
              <Rotulo>{t.b_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'clamp(32px,4.4vw,62px)', maxWidth: '14ch' }}>
              {t.b_h}
            </Reveal>
            <Reveal delay={140}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.2vw,19px)', lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '40ch' }}>{t.b_p1}</p>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.2vw,19px)', lineHeight: 1.65, color: 'var(--tx)', maxWidth: '40ch', borderLeft: '2px solid #C89B4A', paddingLeft: 20 }}>{t.b_p2}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── QUIÉN SOY ────────────────────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(70px,9vw,120px) clamp(16px,4vw,56px) clamp(76px,10vw,150px)', overflow: 'hidden' }}>
        {/* Su nombre a lo ancho de la sección, muy tenue: firma la página sin
            gastar una línea de texto. Aquí sí hay aire para que respire. */}
        <div aria-hidden style={{ maxWidth: ANCHO, margin: '0 auto clamp(-14px,-1.4vw,-30px)', pointerEvents: 'none' }}>
          <span className="display" style={{ display: 'block', fontSize: 'clamp(54px,11vw,168px)', lineHeight: 0.9, letterSpacing: '-.02em', whiteSpace: 'nowrap', color: 'var(--tx)', opacity: 0.07 }}>
            Iris Soares
          </span>
        </div>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,84px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,26px)' }}>
            <Reveal>
              <Rotulo>{t.w_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'clamp(32px,4.2vw,58px)', maxWidth: '14ch' }}>
              {t.w_h}
            </Reveal>
            <Reveal delay={140}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 'clamp(15px,1.1vw,18px)', lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '42ch' }}>
                <p style={{ margin: 0 }}>{t.w_p1}</p>
                <p style={{ margin: 0 }}>{t.w_p2}</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {chips.map((c) => (
                  <span key={c} className="chip" style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx-2)', border: '1px solid var(--linea)', borderRadius: 100, padding: '7px 14px' }}>
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={110} style={{ justifySelf: 'end', width: '100%' }}>
            <Foto src={FOTOS.cerca} alt="Iris Soares" ratio="1/1" radius={22} sizes="(max-width:900px) 100vw, 42vw" />
          </Reveal>
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <div id="metodo" className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: '0 clamp(16px,4vw,56px) clamp(76px,10vw,150px)' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(30px,3.6vw,50px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Rotulo>{t.m_lab}</Rotulo>
                <span className="display" style={{ fontSize: 'clamp(30px,3.8vw,52px)', maxWidth: '14ch' }}>{t.m_h}</span>
              </div>
              <div style={{ height: 2, background: 'var(--linea)', borderRadius: 2, overflow: 'hidden', width: 'min(200px,40vw)' }}>
                <div id="mprog" style={{ height: '100%', width: '0%', background: 'var(--acento)', transition: 'width .3s linear' }} />
              </div>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
            {pasos.map(([titulo, texto], i) => (
              <Reveal key={titulo} delay={i * 90}>
                <div data-step data-card className="card-hover" style={{ border: '1px solid var(--linea)', borderRadius: 20, padding: 'clamp(22px,2.4vw,32px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 30, minHeight: 220 }}>
                  <span data-cardnum className="display" style={{ fontSize: 40, lineHeight: 1, color: 'var(--deco)', transition: 'color .5s ease' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <span className="display" style={{ fontSize: 'clamp(21px,2vw,27px)' }}>{titulo}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--tx-2)' }}>{texto}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── LA COMUNIDAD (lleva a su landing) ────────────────── */}
      <div id="lista-espera" className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD, scrollMarginTop: 80, overflow: 'hidden' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(28px,4vw,72px)', alignItems: 'center' }}>
          <Reveal>
            <Foto src={FOTOS.sala} alt="La comunidad" ratio="4/3" radius={22} sizes="(max-width:900px) 100vw, 45vw" />
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,26px)' }}>
            <Reveal>
              <Rotulo claro>{t.wl_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'clamp(32px,4.2vw,58px)', maxWidth: '14ch' }}>
              {t.wl_h}
            </Reveal>
            <Reveal delay={130}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.15vw,19px)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '36ch' }}>{t.wl_p}</p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span className="display" style={{ fontSize: 'clamp(44px,5vw,68px)', color: '#8F6B18' }}>{eur(MEMBRESIA.precioReserva)}</span>
                <span style={{ fontSize: 17, color: 'var(--tx-3)', textDecoration: 'line-through' }}>{eur(MEMBRESIA.precio)}</span>
                <span style={{ fontSize: 13, color: 'var(--tx-3)' }}>al mes</span>
              </div>
            </Reveal>
            <Reveal delay={230}>
              <PillCTA href="/membresia" variant="dark" label={t.wl_cta} curLabel={t.csee} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── CURSOS ───────────────────────────────────────────── */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3vw,40px)' }}>
          <Reveal>
            <Rotulo>{t.e_lab}</Rotulo>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,3vw,56px)', alignItems: 'end' }}>
            <Reveal delay={60} className="display" style={{ fontSize: 'clamp(34px,4.6vw,64px)', maxWidth: '13ch' }}>
              {t.e_h}
            </Reveal>
            <Reveal delay={140} style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
              <p style={{ margin: 0, fontSize: 'clamp(15px,1.1vw,18px)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '32ch' }}>{t.e_sub}</p>
              <PillCTA href="/cursos" variant="cream" label={t.e_cta} curLabel={t.csee} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── DUDAS ────────────────────────────────────────────── */}
      <div id="dudas" className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,4vw,72px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 100 }}>
            <Reveal>
              <Rotulo claro>{t.f_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'clamp(30px,3.8vw,52px)', maxWidth: '13ch' }}>
              {t.f_h}
            </Reveal>
          </div>
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {faqs.map(([q, a], i) => {
                const on = faq === i;
                return (
                  <div key={q} onClick={() => setFaq(on ? -1 : i)} data-mag className="line-hover" style={{ borderTop: '1px solid var(--linea)', borderBottom: i === faqs.length - 1 ? '1px solid var(--linea)' : undefined, padding: '24px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 18 }}>
                      <span className="display" style={{ fontSize: 'clamp(20px,2vw,27px)' }}>{q}</span>
                      <span style={{ fontSize: 18, color: 'var(--acento)', flexShrink: 0 }}>{on ? '−' : '+'}</span>
                    </div>
                    <div style={{ overflow: 'hidden', transition: 'max-height .55s cubic-bezier(.16,1,.3,1),opacity .4s ease', maxHeight: on ? 240 : 0, opacity: on ? 1 : 0 }}>
                      <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '48ch' }}>{a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── CIERRE ───────────────────────────────────────────── */}
      <div id="cita" className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(90px,12vw,170px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 26 }}>
          <Reveal className="display" style={{ fontSize: 'clamp(38px,6vw,86px)', maxWidth: '13ch' }}>
            {t.c_h}
          </Reveal>
          <Reveal delay={80}>
            <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '34ch' }}>{t.c_p}</p>
          </Reveal>
          <Reveal delay={150}>
            <PillCTA onClick={openChat} variant="gold" label={t.c_btn} curLabel={t.cbook} />
          </Reveal>
          <Reveal delay={210}>
            <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>{t.c_micro}</span>
          </Reveal>
        </div>
      </div>

      {/* ── PIE: el mapa de la web ───────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Marca tam={68} apilado />
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tx-3)', maxWidth: '28ch' }}>{t.ft_p}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tx-4)' }}>{t.ft_start}</span>
              <div onClick={openChat} data-mag style={{ fontSize: 14, color: 'var(--tx-2)', cursor: 'pointer' }}>
                {t.ft_1}
              </div>
              <Link href="/sinergia" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_2}
              </Link>
              <Link href="/cursos" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_3}
              </Link>
              <Link href="/membresia" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_4}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tx-4)' }}>{t.ft_legal}</span>
              <Link href="/legal" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l1}
              </Link>
              <Link href="/privacidad" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l2}
              </Link>
              <a href={`mailto:${CONTACTO.email}`} data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l3}
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>{t.ft_disc}</span>
            <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>© 2026 · ES / PT / EN</span>
          </div>
        </div>
      </div>

      <ChatWidget ref={chatRef} />
    </div>
  );
}
