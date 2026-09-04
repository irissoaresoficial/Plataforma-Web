'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import Cursor from '@/components/Cursor';
import DustField from '@/components/DustField';
import ParticleField from '@/components/ParticleField';
import Reveal from '@/components/Reveal';
import Counter from '@/components/Counter';
import useSiteScroll from '@/components/useSiteScroll';
import HomeNav from '@/components/HomeNav';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
import { useLang } from '@/lib/i18n';
import { isValidEmail } from '@/lib/numerology';

const SECTION_PAD = 'clamp(70px,10vw,150px) clamp(14px,3vw,36px)';

function PillCTA({
  onClick,
  href,
  variant,
  label,
  arrow = '→',
  curLabel,
}: {
  onClick?: () => void;
  href?: string;
  variant: 'cream' | 'gold' | 'dark';
  label: string;
  arrow?: string;
  curLabel?: string;
}) {
  const cls = `pill pill-${variant}`;
  const content = (
    <>
      <span>{label}</span>
      <span className="pill-arrow">{arrow}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} data-mag data-cur-label={curLabel} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <div onClick={onClick} data-mag data-cur-label={curLabel} className={cls}>
      {content}
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

  const [wlEmail, setWlEmail] = useState('');
  const [wlErr, setWlErr] = useState('');
  const [wlDone, setWlDone] = useState(false);
  const sendWaitlist = () => {
    if (!isValidEmail(wlEmail)) return setWlErr(t.wl_err);
    setWlErr('');
    setWlDone(true);
  };

  const chips = [t.w1, t.w2, t.w3, t.w4, t.w5, t.w6];
  const problemLines = [t.p1, t.p2, t.p3, t.p4];
  const methodSteps: [string, string][] = [
    [t.m1t, t.m1p],
    [t.m2t, t.m2p],
    [t.m3t, t.m3p],
  ];

  return (
    <div id="app" style={{ width: '100%', background: '#0A0A0C', color: '#F4F3EF', overflowX: 'hidden' }}>
      <Cursor />
      <DustField />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: '#C89B4A', zIndex: 130 }} />
      <HomeNav onBook={openChat} />

      {/* HERO */}
      <div
        id="top"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: 'clamp(90px,12vh,130px) clamp(14px,3vw,36px) clamp(28px,5vh,54px)',
          overflow: 'hidden',
        }}
      >
        <ParticleField />
        <div
          id="glow"
          style={{
            position: 'absolute',
            width: 760,
            height: 760,
            left: 0,
            top: 0,
            margin: '-380px 0 0 -380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(200,155,74,.14),transparent 60%)',
            pointerEvents: 'none',
            transition: 'opacity .6s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg,rgba(10,10,12,.9) 8%,rgba(10,10,12,.35) 55%,rgba(10,10,12,.85))',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 1360,
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))',
            gap: 'clamp(28px,4vw,72px)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.4vw,30px)' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, fontWeight: 500, letterSpacing: '.02em', color: 'rgba(244,243,239,.5)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C89B4A' }} />
                {t.kick}
              </div>
            </Reveal>
            <Reveal
              as="h1"
              delay={70}
              style={{
                margin: 0,
                fontSize: 'min(clamp(38px,5.4vw,74px),13vh)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-.042em',
                maxWidth: '17ch',
              }}
            >
              {t.h1a}
              <span style={{ color: '#C89B4A' }}> {t.h1b}</span>
            </Reveal>
            <Reveal delay={150}>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.2vw,19px)', fontWeight: 400, lineHeight: 1.5, color: 'rgba(244,243,239,.58)', maxWidth: '34ch' }}>
                {t.hsub}
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <PillCTA onClick={openChat} variant="cream" label={t.hcta} curLabel={t.cbook} />
                <a href="#lista-espera" data-mag className="btn-outline">
                  {t.hcta2}
                </a>
              </div>
            </Reveal>
            <Reveal delay={310}>
              <div style={{ display: 'flex', gap: 'clamp(22px,3.4vw,48px)', borderTop: '1px solid rgba(244,243,239,.12)', paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 'clamp(24px,2.6vw,34px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>
                    <Counter to={2200} group />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(244,243,239,.42)' }}>{t.s1}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 'clamp(24px,2.6vw,34px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, color: '#C89B4A' }}>2010</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(244,243,239,.42)' }}>{t.s2}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 'clamp(24px,2.6vw,34px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>3</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(244,243,239,.42)' }}>{t.s3}</span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={130} style={{ position: 'relative', justifySelf: 'end', width: '100%', maxWidth: 'min(400px,42vh)' }}>
            <div data-hov-img data-cur-label={t.clook} style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, aspectRatio: '4/5', background: '#131318' }}>
              <Image
                src="/images/iris.jpg"
                alt="Iris Soares"
                fill
                sizes="400px"
                style={{ objectFit: 'cover', objectPosition: 'center 18%', transition: 'transform 1.1s cubic-bezier(.16,1,.3,1),filter .8s ease', filter: 'saturate(.92)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(10,10,12,.5),transparent 45%)' }} />
            </div>
          </Reveal>
        </div>
      </div>

      {/* EL SÍNTOMA */}
      <div style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(34px,4vw,58px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>
              <span>{t.p_lab}</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(10,10,12,.12)' }} />
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {problemLines.map((line, i) => (
              <Reveal key={i} line delay={i * 70}>
                <div
                  className="line-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(12px,2vw,26px)',
                    padding: 'clamp(14px,1.8vw,24px) 0',
                    borderBottom: '1px solid rgba(10,10,12,.1)',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#C89B4A', flexShrink: 0, width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 'clamp(20px,3vw,42px)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-.03em', color: i === 3 ? '#6B6B72' : undefined }}>
                    {line}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ fontSize: 'clamp(26px,4.6vw,62px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-.04em', maxWidth: '20ch' }}>{t.p_punch}</div>
          </Reveal>
        </div>
      </div>

      {/* QUIÉN SOY */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(28px,4vw,72px)', alignItems: 'center' }}>
          <Reveal style={{ position: 'relative' }}>
            <div data-par="-.04" data-hov-img data-cur-label={t.clook} style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, aspectRatio: '1/1', background: '#131318' }}>
              <Image src="/images/iris.jpg" alt="Iris Soares" fill sizes="500px" style={{ objectFit: 'cover', objectPosition: 'center 16%', transition: 'transform 1.1s cubic-bezier(.16,1,.3,1),filter .8s ease' }} />
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,26px)' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>
                <span>{t.w_lab}</span>
                <span style={{ flex: 1, height: 1, background: 'rgba(244,243,239,.12)' }} />
              </div>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ fontSize: 'clamp(28px,3.6vw,52px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-.04em', maxWidth: '16ch' }}>{t.w_h}</div>
            </Reveal>
            <Reveal delay={140}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.62, color: 'rgba(244,243,239,.58)', maxWidth: '46ch' }}>
                <p style={{ margin: 0 }}>{t.w_p1}</p>
                <p style={{ margin: 0 }}>{t.w_p2}</p>
              </div>
            </Reveal>
            <Reveal delay={210}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {chips.map((c) => (
                  <span
                    key={c}
                    className="chip"
                    style={{ fontSize: 12, fontWeight: 500, color: 'rgba(244,243,239,.62)', border: '1px solid rgba(244,243,239,.14)', borderRadius: 100, padding: '7px 13px' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* MÉTODO */}
      <div id="metodo" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: '0 clamp(14px,3vw,36px) clamp(70px,10vw,150px)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(28px,3.4vw,48px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>{t.m_lab}</span>
                <span style={{ fontSize: 'clamp(26px,3.4vw,46px)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-.04em', maxWidth: '16ch' }}>{t.m_h}</span>
              </div>
              <div style={{ height: 2, background: 'rgba(244,243,239,.12)', borderRadius: 2, overflow: 'hidden', width: 'min(200px,40vw)' }}>
                <div id="mprog" style={{ height: '100%', width: '0%', background: '#C89B4A', transition: 'width .3s linear' }} />
              </div>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 10 }}>
            {methodSteps.map(([title, desc], i) => (
              <Reveal key={title} delay={i * 90}>
                <div
                  data-step
                  data-card
                  className="card-hover"
                  style={{
                    border: '1px solid rgba(244,243,239,.13)',
                    borderRadius: 18,
                    padding: 'clamp(20px,2.2vw,30px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 26,
                    minHeight: 230,
                  }}
                >
                  <span data-cardnum style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1, color: 'rgba(244,243,239,.14)', transition: 'color .5s ease' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <span style={{ fontSize: 'clamp(19px,1.8vw,24px)', fontWeight: 700, letterSpacing: '-.025em', lineHeight: 1.1 }}>{title}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(244,243,239,.55)' }}>{desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* MEMBRESÍA / LISTA DE ESPERA */}
      <div id="lista-espera" style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: SECTION_PAD, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(22px,2.8vw,34px)', alignItems: 'flex-start' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>
              <span>{t.wl_lab}</span>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <div style={{ fontSize: 'clamp(28px,4vw,50px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.04em', maxWidth: '17ch' }}>{t.wl_h}</div>
          </Reveal>
          <Reveal delay={130}>
            <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: '#5C5972', maxWidth: '52ch' }}>{t.wl_p}</p>
          </Reveal>
          <Reveal delay={180} style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#FBF7EE',
                border: '1px solid rgba(168,135,63,.35)',
                borderRadius: 14,
                padding: '16px 20px',
                fontSize: 14,
                lineHeight: 1.55,
                color: '#5C4A1E',
              }}
            >
              <span>🔥</span>
              <span>{t.wl_urgent}</span>
            </div>
          </Reveal>
          <Reveal delay={230} style={{ width: '100%', maxWidth: 440 }}>
            {!wlDone ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  value={wlEmail}
                  placeholder={t.wl_ph_mail}
                  onChange={(e) => {
                    setWlEmail(e.target.value);
                    setWlErr('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && sendWaitlist()}
                  className="field-input"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.14)', color: '#0A0A0C' }}
                />
                <div onClick={sendWaitlist} data-mag className="pill pill-dark" style={{ justifyContent: 'center', padding: '15px 20px' }}>
                  <span>{t.wl_cta}</span>
                  <span>→</span>
                </div>
                {wlErr && <span style={{ fontSize: 13, color: '#A33B3B' }}>{wlErr}</span>}
                <span style={{ fontSize: 12, color: '#8A8A92' }}>{t.wl_priv}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid rgba(47,93,80,.35)', background: '#EFF5F2', borderRadius: 14, padding: 18 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2F5D50' }}>{t.wl_done_h}</span>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: '#5C5972' }}>{t.wl_done_p}</span>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* ESCUELA TEASER */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(70px,10vw,140px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>
              <span>{t.e_lab}</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(244,243,239,.12)' }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,3vw,56px)', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Reveal delay={60}>
                <div style={{ fontSize: 'clamp(30px,4.6vw,64px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-.045em', maxWidth: '14ch' }}>{t.e_h}</div>
              </Reveal>
              <Reveal delay={130}>
                <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: 'rgba(244,243,239,.58)', maxWidth: '38ch' }}>{t.e_sub}</p>
              </Reveal>
            </div>
            <Reveal delay={180} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
              <PillCTA href="/escuela" variant="cream" label={t.e_cta} curLabel={t.cgo} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="dudas" style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,4vw,72px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 100 }}>
            <Reveal>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>{t.f_lab}</div>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ fontSize: 'clamp(26px,3.4vw,46px)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-.042em', maxWidth: '16ch' }}>{t.f_h}</div>
            </Reveal>
          </div>
          <Reveal style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {faqs.map(([q, a], i) => {
                const on = faq === i;
                return (
                  <div
                    key={q}
                    onClick={() => setFaq(on ? -1 : i)}
                    data-mag
                    className="line-hover"
                    style={{
                      borderTop: '1px solid rgba(10,10,12,.12)',
                      borderBottom: i === faqs.length - 1 ? '1px solid rgba(10,10,12,.12)' : undefined,
                      padding: '22px 0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 18 }}>
                      <span style={{ fontSize: 'clamp(17px,1.7vw,22px)', fontWeight: 600, letterSpacing: '-.02em' }}>{q}</span>
                      <span style={{ fontSize: 17, color: '#C89B4A', flexShrink: 0 }}>{on ? '−' : '+'}</span>
                    </div>
                    <div style={{ overflow: 'hidden', transition: 'max-height .55s cubic-bezier(.16,1,.3,1),opacity .4s ease', maxHeight: on ? 240 : 0, opacity: on ? 1 : 0 }}>
                      <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.6, color: '#6B6B72', maxWidth: '52ch' }}>{a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>

      {/* CITA */}
      <div id="cita" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(76px,11vw,160px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
          <Reveal>
            <div style={{ fontSize: 'clamp(32px,5.4vw,76px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-.045em', maxWidth: '15ch' }}>{t.c_h}</div>
          </Reveal>
          <Reveal delay={80}>
            <p style={{ margin: 0, fontSize: 'clamp(15px,1.2vw,19px)', lineHeight: 1.55, color: 'rgba(244,243,239,.55)', maxWidth: '38ch' }}>{t.c_p}</p>
          </Reveal>
          <Reveal delay={160}>
            <PillCTA onClick={openChat} variant="gold" label={t.c_btn} curLabel={t.cbook} />
          </Reveal>
          <Reveal delay={220}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(244,243,239,.4)' }}>{t.c_micro}</div>
          </Reveal>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', borderTop: '1px solid rgba(244,243,239,.1)', padding: 'clamp(40px,6vw,70px) clamp(14px,3vw,36px) 28px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>iris soares</span>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(244,243,239,.45)', maxWidth: '30ch' }}>{t.ft_p}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,243,239,.32)' }}>{t.ft_start}</span>
              <div onClick={openChat} data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)', cursor: 'pointer' }}>
                {t.ft_1}
              </div>
              <Link href="/sinergia" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_2}
              </Link>
              <Link href="/escuela" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_3}
              </Link>
              <Link href="/cursos" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_4}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,243,239,.32)' }}>{t.ft_legal}</span>
              <a href="#" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_l1}
              </a>
              <a href="#" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_l2}
              </a>
              <a href="#" data-mag style={{ fontSize: 14, color: 'rgba(244,243,239,.78)' }}>
                {t.ft_l3}
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(244,243,239,.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(244,243,239,.3)', maxWidth: '58ch' }}>{t.ft_disc}</span>
            <span style={{ fontSize: 11, color: 'rgba(244,243,239,.28)' }}>© 2026 · ES / PT / EN</span>
          </div>
        </div>
      </div>

      <ChatWidget ref={chatRef} />
    </div>
  );
}
