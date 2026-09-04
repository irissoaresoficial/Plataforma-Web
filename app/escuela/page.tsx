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
import { isValidEmail } from '@/lib/numerology';

const MODULES = [
  { id: 'M1', title: 'Los cimientos', desc: 'Qué es y qué no es el método. Cálculo base y vocabulario común.', weeks: 'Semanas 1–2' },
  { id: 'M2', title: 'El mapa personal', desc: 'Camino de vida, expresión, ciclos y años personales sin atajos.', weeks: 'Semanas 3–4' },
  { id: 'M3', title: 'Tres generaciones', desc: 'Levantar la línea familiar y ver qué se repite y desde cuándo.', weeks: 'Semanas 5–6' },
  { id: 'M4', title: 'Cuerpo y síntoma', desc: 'Psicosomática y descodificación: del síntoma al relato familiar.', weeks: 'Semanas 7–8' },
  { id: 'M5', title: 'La consulta', desc: 'Devolución, límites, ética y qué hacer cuando aparece dolor.', weeks: 'Semanas 9–10' },
  { id: 'M6', title: 'Casos reales', desc: 'Tres casos tutorizados de principio a fin, con supervisión de Iris.', weeks: 'Semanas 11–12' },
];

const TIERS = [
  { key: 'base', name: 'Semilla', m: 29, tagText: 'Entrada', desc: 'Para mirar tu propia historia sin prisa.', f1: 'Una sesión grabada al mes', f2: 'Plantillas de cálculo del método', f3: 'Comunidad privada' },
  { key: 'pro', name: 'Linaje', m: 69, tagText: 'La más elegida', desc: 'Traes tu caso y se revisa en voz alta.', f1: 'Dos directos al mes con Iris', f2: 'Tu caso revisado cada trimestre', f3: 'Descuento en la formación completa' },
  { key: 'max', name: 'Consulta', m: 149, tagText: 'Acompañada', desc: 'Membresía con sesión individual incluida.', f1: 'Todo lo de Linaje', f2: 'Una sesión de 90 min al trimestre', f3: 'Revisión de tus informes por WhatsApp' },
];

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);

const PRECIO_LANZAMIENTO = 890;
const PLAZAS_RESERVADAS = 4;
const PRECIO_CURSO = 149;

export default function Escuela() {
  useSiteScroll();
  const [playing, setPlaying] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [plan, setPlan] = useState(0);
  const [waitEmail, setWaitEmail] = useState('');
  const [waitErr, setWaitErr] = useState('');
  const [waitDone, setWaitDone] = useState(false);

  const taken = PLAZAS_RESERVADAS;
  const left = Math.max(0, 10 - taken);
  const priceFull = PRECIO_LANZAMIENTO * 2;

  const tiers = useMemo(
    () =>
      TIERS.map((tr) => {
        const hero = tr.key === 'pro';
        const monthly = annual ? Math.round((tr.m * 10) / 12) : tr.m;
        return { ...tr, hero, monthly };
      }),
    [annual]
  );

  const sendWait = () => {
    if (!isValidEmail(waitEmail)) return setWaitErr('Ese correo no parece válido.');
    setWaitErr('');
    setWaitDone(true);
  };

  return (
    <div style={{ width: '100%', background: '#0A0A0C', color: '#F4F3EF', overflowX: 'hidden' }}>
      <Cursor />
      <DustField />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: '#C89B4A', zIndex: 130 }} />
      <SubNav
        links={[
          { href: '#video', label: 'Vídeo' },
          { href: '#membresia', label: 'Membresía' },
          { href: '#programa', label: 'Programa' },
        ]}
        cta="Entrar"
        ctaHref="#membresia"
      />

      {/* HERO */}
      <div id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(88px,12vh,130px) clamp(14px,3vw,36px) clamp(30px,5vh,56px)', overflow: 'hidden' }}>
        <ParticleField />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 18% 22%,rgba(200,155,74,.15),transparent 62%),linear-gradient(to bottom,rgba(10,10,12,.55),rgba(10,10,12,.9))',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.6vw,32px)' }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Primera edición · 10 plazas · online en directo</div>
          </Reveal>
          <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'min(clamp(40px,6.4vw,88px),15vh)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-.045em', maxWidth: '15ch' }}>
            La Escuela del <span style={{ color: '#C89B4A' }}>método IRIS</span>.
          </Reveal>
          <Reveal delay={150}>
            <p style={{ margin: 0, fontSize: 'clamp(16px,1.3vw,20px)', lineHeight: 1.5, color: 'rgba(244,243,239,.6)', maxWidth: '44ch' }}>
              Dieciséis años de consulta convertidos en un método que puedes aprender a leer tú. Diez personas por edición, acompañadas de principio a fin.
            </p>
          </Reveal>
          <Reveal delay={230}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <a href="#plazas" data-mag data-cur-label="Reservar" className="pill pill-cream">
                <span>Reservar mi plaza</span>
                <span className="pill-arrow">→</span>
              </a>
              <a href="#programa" data-mag className="btn-outline">
                Ver el programa
              </a>
            </div>
          </Reveal>
          <Reveal delay={310}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(18px,3vw,44px)', borderTop: '1px solid rgba(244,243,239,.12)', paddingTop: 16 }}>
              {[
                ['6', 'módulos'],
                ['12', 'semanas'],
                ['10', 'plazas'],
                ['3', 'casos tutorizados'],
              ].map(([n, l], i) => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 'clamp(22px,2.4vw,32px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, color: i === 2 ? '#C89B4A' : undefined }}>{n}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(244,243,239,.42)' }}>{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* VIDEO */}
      <div id="video" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(50px,7vw,100px) clamp(14px,3vw,36px)', borderTop: '1px solid rgba(244,243,239,.1)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,28px)', alignItems: 'center', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Mira esto primero · 12 min</div>
          </Reveal>
          <Reveal delay={70}>
            <div style={{ fontSize: 'clamp(24px,3.2vw,44px)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-.042em', maxWidth: '20ch' }}>Iris te explica el método y qué pasa dentro de la membresía.</div>
          </Reveal>
          <Reveal delay={140} style={{ width: '100%' }}>
            <div
              onClick={() => setPlaying((p) => !p)}
              data-mag
              data-cur-label="Play"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 20,
                overflow: 'hidden',
                border: `1px solid ${playing ? 'rgba(200,155,74,.5)' : 'rgba(244,243,239,.14)'}`,
                cursor: 'pointer',
                background: '#131318',
                transition: 'border-color .4s ease,transform .5s cubic-bezier(.16,1,.3,1)',
                transform: playing ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <Image src="/images/iris.jpg" alt="Iris Soares" fill sizes="1040px" style={{ objectFit: 'cover', objectPosition: 'center 16%', filter: 'saturate(.85) brightness(.62)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%,transparent,rgba(10,10,12,.55))' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <span style={{ width: 76, height: 76, borderRadius: '50%', background: '#C89B4A', color: '#0A0A0C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 18px 40px rgba(0,0,0,.4)' }}>▶</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(244,243,239,.75)' }}>{playing ? 'El vídeo real se sube aquí' : 'Ver la presentación (12 min)'}</span>
              </div>
              <span style={{ position: 'absolute', left: 14, top: 14, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: 'rgba(10,10,12,.7)', border: '1px solid rgba(244,243,239,.16)', borderRadius: 100, padding: '6px 12px', color: 'rgba(244,243,239,.8)' }}>
                Vídeo pendiente de Iris
              </span>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <a href="#membresia" data-mag data-cur-label="Entrar" className="pill pill-gold">
                <span>Quiero entrar en la membresía</span>
                <span className="pill-arrow">→</span>
              </a>
              <span style={{ fontSize: 13, color: 'rgba(244,243,239,.45)', alignSelf: 'center' }}>Sin permanencia · cancelas cuando quieras</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* TEMÁTICA */}
      <div style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(24px,3.4vw,56px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Reveal>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>La temática</div>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ fontSize: 'clamp(26px,3.4vw,46px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-.042em', maxWidth: '16ch' }}>Leer una historia familiar y saber qué hacer con ella.</div>
            </Reveal>
            <Reveal delay={140}>
              <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: '#6B6B72', maxWidth: '36ch' }}>Sales sabiendo levantar un mapa, interpretarlo y devolverlo a una persona sin hacer daño.</p>
            </Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
            {[
              ['01', 'Números y fechas', 'Camino, expresión, ciclos y años personales.'],
              ['02', 'Línea familiar', 'Tres generaciones: repeticiones, secretos, lealtades.'],
              ['03', 'Cuerpo y síntoma', 'Psicosomática y descodificación aplicadas al relato.'],
              ['04', 'La devolución', 'Cómo se cuenta, qué se calla y dónde está tu límite.'],
            ].map(([n, title, desc], i) => (
              <Reveal key={n} delay={i * 60}>
                <div className="card-hover-light" style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.1)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#C89B4A' }}>{n}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>{desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* PROGRAMA */}
      <div id="programa" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>El programa</span>
                <span style={{ fontSize: 'clamp(26px,3.4vw,46px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-.042em', maxWidth: '16ch' }}>Seis módulos, doce semanas.</span>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(244,243,239,.45)', maxWidth: '28ch' }}>Una sesión en directo por semana, más práctica tutorizada entre sesiones.</span>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MODULES.map((mod) => (
              <Reveal key={mod.id} line>
                <div
                  className="line-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: 'clamp(10px,2vw,36px)',
                    padding: 'clamp(16px,1.9vw,24px) 0',
                    borderTop: '1px solid rgba(244,243,239,.12)',
                    alignItems: 'baseline',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C89B4A', width: 26, flexShrink: 0 }}>{mod.id}</span>
                    <span style={{ fontSize: 'clamp(19px,2.2vw,28px)', fontWeight: 700, letterSpacing: '-.025em', lineHeight: 1.12 }}>{mod.title}</span>
                  </div>
                  <span style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(244,243,239,.55)' }}>{mod.desc}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(244,243,239,.35)', justifySelf: 'start' }}>{mod.weeks}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* METODOLOGÍA */}
      <div style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: '0 clamp(14px,3vw,36px) clamp(60px,8vw,120px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(22px,2.8vw,36px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>
              <span>La metodología</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(244,243,239,.12)' }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10 }}>
            {[
              ['01', 'Ves, luego haces', 'Cada módulo abre con Iris trabajando un caso en directo. Después lo haces tú.'],
              ['02', 'Grupos de diez', 'Diez plazas para que cada mapa se revise en voz alta, uno por uno.'],
              ['03', 'Tu propia historia', 'Empiezas por tu línea familiar. No se enseña a leer a otros sin haberse leído.'],
              ['04', 'Queda grabado', 'Grabación de cada sesión, plantillas de cálculo y guion de consulta.'],
            ].map(([n, title, desc], i) => (
              <Reveal key={n} delay={i * 80}>
                <div data-card className="card-hover" style={{ border: '1px solid rgba(244,243,239,.13)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20, minHeight: 200 }}>
                  <span data-cardnum style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-.04em', color: 'rgba(244,243,239,.14)', transition: 'color .5s ease' }}>{n}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.55)' }}>{desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* PONENTES */}
      <div id="ponentes" style={{ position: 'relative', zIndex: 3, background: '#F5F4F0', color: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8F6B18' }}>Ponentes</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A33B3B', border: '1px solid #A33B3B', borderRadius: 100, padding: '3px 9px' }}>Invitados por confirmar</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(10,10,12,.12)', minWidth: 40 }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
            <Reveal>
              <div className="card-hover-light" style={{ background: '#FFFFFF', border: '1px solid rgba(10,10,12,.1)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div data-hov-img data-cur-label="Iris" style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#E7E5DF' }}>
                  <Image src="/images/iris.jpg" alt="Iris Soares" fill sizes="400px" style={{ objectFit: 'cover', objectPosition: 'center 16%', transition: 'transform 1s cubic-bezier(.16,1,.3,1)' }} />
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.025em' }}>Iris Soares</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8F6B18' }}>Directora · método IRIS</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>Consulta propia desde 2010 y más de 2.200 personas acompañadas. Imparte los seis módulos y supervisa los casos.</span>
                </div>
              </div>
            </Reveal>
            {[
              ['Ponente invitada', 'Psicología clínica', 'Una sesión sobre cuándo derivar y cómo sostener a alguien que se rompe en consulta.'],
              ['Ponente invitado', 'Psicosomática', 'Del síntoma físico al relato familiar: lectura conjunta de dos casos.'],
            ].map(([name, role, desc], i) => (
              <Reveal key={name} delay={90 + i * 90}>
                <div style={{ background: '#FFFFFF', border: '1px dashed rgba(10,10,12,.2)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ aspectRatio: '4/3', background: 'repeating-linear-gradient(135deg,rgba(10,10,12,.05) 0 1px,transparent 1px 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A8A92', border: '1px solid rgba(10,10,12,.16)', borderRadius: 100, padding: '6px 12px' }}>foto pendiente</span>
                  </div>
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.025em', color: '#8A8A92' }}>{name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#8F6B18' }}>{role}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: '#6B6B72' }}>{desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* MEMBRESÍA */}
      <div id="membresia" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,42px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>La membresía</span>
                <span style={{ fontSize: 'clamp(26px,3.6vw,48px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-.042em', maxWidth: '17ch' }}>Quédate dentro y sigue leyendo casos cada mes.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(244,243,239,.5)' }}>Mensual</span>
                <div
                  onClick={() => setAnnual((a) => !a)}
                  style={{ width: 44, height: 24, borderRadius: 100, background: annual ? '#C89B4A' : 'rgba(244,243,239,.16)', padding: 3, cursor: 'pointer', display: 'flex', transition: 'background .4s ease' }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: annual ? '#0A0A0C' : '#F4F3EF', transition: 'transform .4s cubic-bezier(.16,1,.3,1)', transform: `translateX(${annual ? 20 : 0}px)` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(244,243,239,.5)' }}>
                  Anual <span style={{ color: '#C89B4A' }}>−2 meses</span>
                </span>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 10, alignItems: 'stretch' }}>
            {tiers.map((tier) => (
              <Reveal key={tier.key}>
                <div
                  data-card
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 22,
                    borderRadius: 20,
                    padding: 'clamp(20px,2.2vw,28px)',
                    height: '100%',
                    border: `1px solid ${tier.hero ? 'rgba(200,155,74,.42)' : 'rgba(244,243,239,.13)'}`,
                    background: tier.hero ? 'linear-gradient(160deg,rgba(200,155,74,.11),rgba(10,10,12,0) 62%)' : 'transparent',
                    transition: 'border-color .5s ease,transform .6s cubic-bezier(.16,1,.3,1)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.025em' }}>{tier.name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          borderRadius: 100,
                          padding: '5px 10px',
                          background: tier.hero ? '#C89B4A' : undefined,
                          color: tier.hero ? '#0A0A0C' : 'rgba(244,243,239,.55)',
                          border: tier.hero ? undefined : '1px solid rgba(244,243,239,.18)',
                        }}
                      >
                        {tier.tagText}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
                      <span style={{ fontSize: 'clamp(32px,3.6vw,44px)', fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1 }}>{eur(tier.monthly)}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(244,243,239,.45)', paddingBottom: 6 }}>{annual ? '/mes · facturado anual' : '/mes'}</span>
                    </div>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.55)' }}>{tier.desc}</span>
                    <div style={{ height: 1, background: 'rgba(244,243,239,.12)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[tier.f1, tier.f2, tier.f3].map((f) => (
                        <div key={f} style={{ display: 'flex', gap: 9, fontSize: 14, lineHeight: 1.5 }}>
                          <span style={{ color: '#C89B4A' }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/#cita"
                    data-mag
                    data-cur-label="Entrar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      borderRadius: 100,
                      padding: '15px 20px',
                      fontSize: 15,
                      fontWeight: 700,
                      transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
                      background: tier.hero ? '#C89B4A' : undefined,
                      color: tier.hero ? '#0A0A0C' : '#F4F3EF',
                      border: tier.hero ? undefined : '1px solid rgba(244,243,239,.2)',
                    }}
                  >
                    <span>{tier.hero ? 'Entrar en Linaje' : 'Entrar en ' + tier.name}</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
              {[
                ['01', 'Ves el vídeo', 'Doce minutos para saber si esto es para ti.'],
                ['02', 'Entras un mes', 'Sin permanencia. Si no encaja, te sales.'],
                ['03', 'Traes un caso', 'El tuyo o el de alguien de tu familia.'],
                ['04', 'Pasas a la formación', 'Con la cuota del mes descontada de la matrícula.'],
              ].map(([n, title, desc]) => (
                <div key={n} style={{ border: '1px solid rgba(244,243,239,.12)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#C89B4A' }}>{n}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(244,243,239,.5)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* PLAZAS / LANZAMIENTO */}
      <div id="plazas" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,3.4vw,56px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Reveal>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Promoción de lanzamiento</div>
            </Reveal>
            <Reveal delay={70}>
              <div style={{ fontSize: 'clamp(28px,3.8vw,52px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-.045em', maxWidth: '15ch' }}>Los diez primeros entran a mitad de precio.</div>
            </Reveal>
            <Reveal delay={140}>
              <p style={{ margin: 0, fontSize: 'clamp(15px,1.15vw,18px)', lineHeight: 1.6, color: 'rgba(244,243,239,.58)', maxWidth: '38ch' }}>
                La primera edición se cierra con diez personas. A cambio de estrenar el programa, el precio se queda en la mitad para siempre: si repites edición, mantienes tarifa.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Seis módulos en directo + grabaciones', 'Tres casos reales supervisados por Iris', 'Plantillas de cálculo y guion de consulta', 'Una sesión individual de 90 minutos contigo'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                    <span style={{ color: '#C89B4A' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={120}
            style={{
              background: 'linear-gradient(150deg,#15151B,#0A0A0C 65%)',
              border: '1px solid rgba(200,155,74,.32)',
              borderRadius: 22,
              padding: 'clamp(22px,2.4vw,32px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: '0 30px 70px rgba(0,0,0,.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(244,243,239,.5)' }}>Primera edición</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C89B4A', border: '1px solid rgba(200,155,74,.45)', borderRadius: 100, padding: '5px 11px' }}>{left} plazas libres</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(40px,5vw,62px)', fontWeight: 900, letterSpacing: '-.05em', lineHeight: 1, color: '#C89B4A' }}>{eur(PRECIO_LANZAMIENTO)}</span>
              <span style={{ fontSize: 18, fontWeight: 500, color: 'rgba(244,243,239,.4)', textDecoration: 'line-through', paddingBottom: 8 }}>{eur(priceFull)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 5, borderRadius: 100, background: 'rgba(244,243,239,.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, taken * 10)}%`, background: '#C89B4A', borderRadius: 100, transition: 'width .8s cubic-bezier(.16,1,.3,1)' }} />
              </div>
              <span style={{ fontSize: 12, color: 'rgba(244,243,239,.42)' }}>{taken} de 10 plazas reservadas</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Pago único', 'Un solo cargo al reservar', eur(PRECIO_LANZAMIENTO)],
                ['Tres plazos', 'Sin intereses, uno por módulo doble', eur(Math.round(PRECIO_LANZAMIENTO / 3)) + ' × 3'],
              ].map(([title, sub, price], i) => (
                <div
                  key={title}
                  onClick={() => setPlan(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    border: `1px solid ${plan === i ? '#C89B4A' : 'rgba(244,243,239,.14)'}`,
                    background: plan === i ? 'rgba(200,155,74,.09)' : 'transparent',
                    borderRadius: 14,
                    padding: '15px 16px',
                    cursor: 'pointer',
                    transition: 'border-color .4s ease,background .4s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
                    <span style={{ fontSize: 12, color: 'rgba(244,243,239,.45)' }}>{sub}</span>
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{price}</span>
                </div>
              ))}
            </div>
            <Link
              href="/#cita"
              data-mag
              data-cur-label="Reservar"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#C89B4A', color: '#0A0A0C', borderRadius: 100, padding: '16px 22px', fontSize: 16, fontWeight: 700, transition: 'transform .4s cubic-bezier(.16,1,.3,1)' }}
            >
              <span>Reservar mi plaza</span>
              <span>→</span>
            </Link>
            <span style={{ fontSize: 11, lineHeight: 1.6, color: 'rgba(244,243,239,.35)' }}>Reservas hablando con el asistente de Iris. Si la edición no sale, se devuelve el importe completo.</span>
          </Reveal>
        </div>
      </div>

      {/* CURSO TEASER + FOOTER */}
      <div id="curso" style={{ position: 'relative', zIndex: 3, background: '#0A0A0C', borderTop: '1px solid rgba(244,243,239,.1)', padding: 'clamp(46px,6vw,86px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.4vw,44px)' }}>
          <Reveal
            style={{
              border: '1px solid rgba(200,155,74,.3)',
              background: 'linear-gradient(150deg,rgba(200,155,74,.09),rgba(10,10,12,0) 60%)',
              borderRadius: 22,
              padding: 'clamp(22px,2.6vw,34px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
              gap: 'clamp(20px,2.6vw,44px)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#C89B4A' }}>Próximamente · curso suelto</div>
              <span style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-.04em', maxWidth: '20ch' }}>Curso de numerología transgeneracional</span>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(244,243,239,.55)', maxWidth: '44ch' }}>
                Cuatro sesiones grabadas para aprender a levantar tu propia línea familiar y leer las repeticiones. Sin acompañamiento en directo: a tu ritmo, con las plantillas del método.
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em' }}>4</span>
                  <span style={{ fontSize: 11, color: 'rgba(244,243,239,.42)' }}>sesiones grabadas</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em' }}>6 h</span>
                  <span style={{ fontSize: 11, color: 'rgba(244,243,239,.42)' }}>de contenido</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.03em', color: '#C89B4A' }}>{eur(PRECIO_CURSO)}</span>
                  <span style={{ fontSize: 11, color: 'rgba(244,243,239,.42)' }}>precio previsto</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(244,243,239,.5)' }}>Avísame cuando abra</span>
              {!waitDone ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <input
                    type="email"
                    value={waitEmail}
                    placeholder="tucorreo@ejemplo.com"
                    onChange={(e) => {
                      setWaitEmail(e.target.value);
                      setWaitErr('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && sendWait()}
                    className="field-input"
                    style={{ background: 'rgba(244,243,239,.05)', border: '1px solid rgba(244,243,239,.16)', color: '#F4F3EF' }}
                  />
                  <div onClick={sendWait} data-mag className="pill pill-cream" style={{ justifyContent: 'center', padding: '15px 20px' }}>
                    <span>Apuntarme a la lista</span>
                    <span>→</span>
                  </div>
                  {waitErr && <span style={{ fontSize: 13, color: '#E08585' }}>{waitErr}</span>}
                  <span style={{ fontSize: 11, lineHeight: 1.6, color: 'rgba(244,243,239,.35)' }}>Un aviso cuando abra y nada más.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(124,196,138,.4)', background: 'rgba(124,196,138,.08)', borderRadius: 14, padding: 18 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#7CC48A' }}>Apuntado</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,243,239,.6)' }}>Te escribimos a {waitEmail} en cuanto se abra la primera tanda.</span>
                </div>
              )}
            </div>
          </Reveal>

          <div style={{ borderTop: '1px solid rgba(244,243,239,.1)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#F4F3EF' }}>
                iris soares
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <a href="#membresia" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Membresía</a>
                <a href="#plazas" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Formación</a>
                <a href="#curso" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Curso de numerología transgeneracional</a>
                <Link href="/sinergia" style={{ fontSize: 13, color: 'rgba(244,243,239,.7)' }}>Sinergia gratis</Link>
              </div>
              <span style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(244,243,239,.3)', maxWidth: '58ch' }}>
                La formación y los cursos del método IRIS no habilitan para ejercer psicología ni medicina y no sustituyen a ningún tratamiento.
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(244,243,239,.28)' }}>© 2026 · La Escuela</span>
          </div>
        </div>
      </div>
    </div>
  );
}
