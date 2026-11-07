'use client';

/**
 * ============================================================================
 * UNA DIAPOSITIVA DEL EVENTO
 * ============================================================================
 *
 * Cada tipo de `content/kangen.ts` se pinta aquí. Todas entran igual —lo de
 * dentro sube y se enfoca en cascada, como en Keynote— y cada una tiene UNA
 * cosa que hacer: un número que se cuenta, una frase, una lista que se
 * descubre, una imagen que se amplía o un vídeo que se pone.
 *
 * Dos marcas en el texto, como en la presentación de la masterclass:
 *   · *palabra*  sale en el color del agua: lo que hay que recordar.
 *   · [texto]    sale en ROJO: algo que falta y no se inventa.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import { animate, motion, useReducedMotion, type Variants } from 'framer-motion';
import type { Diapo as D } from '@/content/kangen';

/* ------------------------------------------------------------ EL TEXTO */
export function Texto({ t }: { t: string }) {
  const trozos = t.split(/(\*[^*]+\*|\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {trozos.map((x, i) =>
        x.startsWith('*') && x.endsWith('*') ? (
          <span key={i} className="kg-resalta">
            {x.slice(1, -1)}
          </span>
        ) : x.startsWith('[') && x.endsWith(']') ? (
          <span key={i} className="kg-pendiente">
            {x.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{x}</Fragment>
        )
      )}
    </>
  );
}

/** Un salto de línea donde el texto lleva « / ». */
function Lineas({ t }: { t: string }) {
  const partes = t.split(' / ');
  return (
    <>
      {partes.map((p, i) => (
        <Fragment key={i}>
          <Texto t={p} />
          {i < partes.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/* ------------------------------------------------------------ LA ENTRADA */
const cascada: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const sube: Variants = {
  oculto: { opacity: 0, y: 46, filter: 'blur(12px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const quieto: Variants = { oculto: { opacity: 1 }, visible: { opacity: 1 } };

/* ------------------------------------------------------------ EL CONTADOR */
/** Con punto de miles SIEMPRE: el formato de España no lo pone en los números
 *  de cuatro cifras («4980»), y al lado de «11.400» parecía una errata. */
export const formato = (n: number, decimales = 0) => {
  const [ent, dec] = n.toFixed(decimales).split('.');
  const conPuntos = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${conPuntos},${dec}` : conPuntos;
};

/** Un número que se cuenta desde cero al entrar. Con la animación reducida,
 *  sale ya contado. */
export function Contador({ valor, decimales = 0, prefijo = '', sufijo = '', retardo = 0.35 }: { valor: number; decimales?: number; prefijo?: string; sufijo?: string; retardo?: number }) {
  const reducido = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducido) {
      el.textContent = prefijo + formato(valor, decimales) + sufijo;
      return;
    }
    const c = animate(0, valor, {
      duration: 1.8,
      delay: retardo,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = prefijo + formato(v, decimales) + sufijo;
      },
    });
    return () => c.stop();
  }, [valor, decimales, prefijo, sufijo, retardo, reducido]);
  return <span ref={ref}>{prefijo + formato(reducido ? valor : 0, decimales) + sufijo}</span>;
}

/** El tamaño del número de una tarjeta: el más grande que cabe en UNA línea.
 *  Antes «4.980 t» o «5.699 €» se partían en dos. */
function tamanoCifra(c: { valor: number; decimales?: number; prefijo?: string; sufijo?: string }, n: number) {
  const letras = (c.prefijo ?? '').length + formato(c.valor, c.decimales).length + (c.sufijo ?? '').length;
  const ancho = (1620 - 32 * (n - 1)) / n - 88;
  return Math.max(84, Math.min(n <= 2 ? 230 : 150, Math.floor((ancho / letras) * 1.72)));
}

/* ------------------------------------------------------------ EL FONDO */
function Agua({ burbujas, ola = true }: { burbujas?: boolean; ola?: boolean }) {
  return (
    <>
      <div className="kg-fondo" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      {ola && (
        <div className="kg-ola" aria-hidden>
          {[0.1, 0.07].map((o, i) => (
            <svg key={i} viewBox="0 0 2880 180" preserveAspectRatio="none">
              <path
                d="M0 110 C 240 70 480 70 720 110 S 1200 150 1440 110 S 1920 70 2160 110 S 2640 150 2880 110 V180 H0 Z"
                fill="currentColor"
                style={{ opacity: o, color: 'var(--k-agua)' }}
              />
            </svg>
          ))}
        </div>
      )}
      {burbujas && (
        <div className="kg-burbujas" aria-hidden>
          {Array.from({ length: 16 }, (_, k) => {
            const t = 14 + (k % 5) * 18;
            return (
              <i
                key={k}
                style={{
                  left: `${(k * 61) % 100}%`,
                  width: t,
                  height: t,
                  animationDuration: `${11 + (k % 6) * 2.2}s`,
                  animationDelay: `${-(k * 1.7) % 14}s`,
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

/** Lo de dentro de una diapositiva, que entra en cascada. Va fuera del
 *  componente de la diapositiva: definido dentro, se volvería a montar en cada
 *  paso de una lista y repetiría la entrada del título. */
function Capa({ children, estilo }: { children: React.ReactNode; estilo?: React.CSSProperties }) {
  return (
    <motion.div className="kg-capa" variants={cascada} initial="oculto" animate="visible" style={estilo}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------ LA DIAPOSITIVA */
type Props = {
  d: D;
  /** Cuántas filas de una lista con pasos se ven ya. */
  paso: number;
  /** Ampliar una imagen. */
  alAmpliar?: (src: string, alt: string) => void;
  /** Una pregunta se responde también tocando una opción. */
  alDesvelar?: () => void;
};

export default function Diapo({ d, paso, alAmpliar, alDesvelar }: Props) {
  const reducido = useReducedMotion();
  const v = reducido ? quieto : sube;
  const tono = 'tono' in d && d.tono === 'claro' ? 'kg-claro' : 'kg-oscuro';

  switch (d.tipo) {
    /* ------------------------------------------------------- PORTADA */
    case 'portada':
      return (
        <section className="kg-diapo kg-oscuro" style={{ justifyContent: 'center' }}>
          <Agua burbujas />
          <Capa estilo={{ justifyContent: 'center' }}>
            <motion.p className="kg-rotulo" variants={v}>
              {d.rotulo}
            </motion.p>
            <motion.h1 className="kg-h1" variants={v} style={{ fontSize: 168, maxWidth: 1500 }}>
              <Lineas t={d.titulo} />
            </motion.h1>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 48, maxWidth: 1100, fontSize: 44 }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
            <motion.p className="kg-pie" variants={v} style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.7 }}>
              Pulsa → para empezar
            </motion.p>
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- CAPÍTULO */
    case 'capitulo':
      return (
        <section className="kg-diapo kg-oscuro" style={{ justifyContent: 'flex-end' }}>
          <Agua />
          <motion.span
            aria-hidden
            initial={reducido ? false : { opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              right: 90,
              top: 40,
              fontSize: 620,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: '-0.06em',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(54,198,244,.35)',
              zIndex: 0,
            }}
          >
            {d.numero}
          </motion.span>
          <Capa estilo={{ justifyContent: 'flex-end', flex: 'none' }}>
            <motion.p className="kg-rotulo" variants={v}>
              Capítulo {d.numero}
            </motion.p>
            <motion.h2 className="kg-h1" variants={v} style={{ maxWidth: 1300 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 36, maxWidth: 1000 }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- FRASE */
    case 'frase':
      return (
        <section className={`kg-diapo ${tono}`} style={{ justifyContent: 'center', alignItems: d.centrada ? 'center' : undefined, textAlign: d.centrada ? 'center' : undefined }}>
          <Agua ola={tono === 'kg-oscuro'} />
          <Capa estilo={{ justifyContent: 'center', alignItems: d.centrada ? 'center' : undefined }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h1" variants={v} style={{ maxWidth: 1560 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 44, maxWidth: 1180 }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
            {d.fuente && (
              <motion.p className="kg-pie" variants={v} style={{ marginTop: 40, opacity: 0.75 }}>
                {d.fuente}
              </motion.p>
            )}
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- CIFRA */
    /* Centrada: un número solo, en el medio, con su frase debajo. Alineada a
       la izquierda dejaba media diapositiva vacía. */
    case 'cifra':
      return (
        <section className={`kg-diapo ${tono}`} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Agua ola={tono === 'kg-oscuro'} />
          <Capa estilo={{ justifyContent: 'center', alignItems: 'center' }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.div className="kg-cifra" variants={v}>
              <Contador valor={d.valor} decimales={d.decimales} prefijo={d.prefijo} sufijo={d.sufijo} />
            </motion.div>
            <motion.h2 className="kg-h2" variants={v} style={{ marginTop: 36, maxWidth: 1400 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 28, maxWidth: 1200 }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
            {d.fuente && (
              <motion.p className="kg-pie" variants={v} style={{ marginTop: 36, opacity: 0.7 }}>
                {d.fuente}
              </motion.p>
            )}
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- CIFRAS */
    case 'cifras':
      return (
        <section className={`kg-diapo ${tono}`}>
          <Agua ola={false} />
          <Capa>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h2" variants={v} style={{ maxWidth: 1500 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: `repeat(${d.cifras.length}, 1fr)`, gap: 32 }}>
              {d.cifras.map((c, k) => (
                <motion.div key={k} className="kg-cristal" variants={v} style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: d.cifras.length <= 2 ? 440 : 360 }}>
                  <div className="kg-cifra" style={{ fontSize: tamanoCifra(c, d.cifras.length), whiteSpace: 'nowrap' }}>
                    <Contador valor={c.valor} decimales={c.decimales} prefijo={c.prefijo} sufijo={c.sufijo} retardo={0.45 + k * 0.15} />
                  </div>
                  <p className="kg-texto" style={{ fontSize: 32, marginTop: 'auto' }}>
                    <Texto t={c.texto} />
                  </p>
                </motion.div>
              ))}
            </div>
            {d.fuente && (
              <motion.p className="kg-pie" variants={v} style={{ marginTop: 28, opacity: 0.7, fontSize: 22 }}>
                {d.fuente}
              </motion.p>
            )}
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- LISTA */
    case 'lista': {
      const visibles = d.pasos ? paso : d.puntos.length;
      const dos = d.puntos.length > 4;
      /* Más de ocho filas: tarjetas más bajas para que quepan sin apretar. */
      const apretada = d.puntos.length > 8;
      return (
        <section className={`kg-diapo ${tono}`}>
          <Agua ola={false} />
          <Capa estilo={{ flexDirection: 'row', gap: 90 }}>
            <div style={{ flex: '0 0 600px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {d.rotulo && (
                <motion.p className="kg-rotulo" variants={v}>
                  {d.rotulo}
                </motion.p>
              )}
              <motion.h2 className="kg-h2" variants={v}>
                <Lineas t={d.titulo} />
              </motion.h2>
              {d.texto && (
                <motion.p className="kg-texto" variants={v} style={{ marginTop: 32 }}>
                  <Texto t={d.texto} />
                </motion.p>
              )}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: dos ? '1fr 1fr' : '1fr', gap: apretada ? 16 : 22, alignContent: 'center' }}>
              {d.puntos.map((p, k) => (
                <motion.div
                  key={k}
                  className="kg-cristal"
                  initial={reducido ? false : { opacity: 0, x: 60, filter: 'blur(10px)' }}
                  animate={k < visibles ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: d.pasos ? 0.12 : 0, x: d.pasos ? 0 : 60, filter: d.pasos ? 'blur(0px)' : 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: d.pasos ? 0 : 0.3 + k * 0.1 }}
                  style={{ padding: apretada ? '20px 26px' : dos ? '30px 34px' : '36px 44px', display: 'flex', gap: apretada ? 20 : 28, alignItems: apretada ? 'center' : 'flex-start', borderRadius: apretada ? 28 : undefined }}
                >
                  <span className="kg-numero" style={apretada ? { width: 48, height: 48, fontSize: 22 } : undefined}>
                    {k + 1}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p className="kg-h3" style={{ fontSize: apretada ? 32 : dos ? 38 : 46 }}>
                      <Texto t={p.titulo} />
                    </p>
                    {p.texto && (
                      <p className="kg-texto" style={{ fontSize: dos ? 28 : 32 }}>
                        <Texto t={p.texto} />
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Capa>
        </section>
      );
    }

    /* ------------------------------------------------------- IMAGEN */
    case 'imagen':
      return (
        <section className={`kg-diapo ${tono}`} style={{ padding: d.titulo ? '100px 120px' : 70 }}>
          <Agua ola={false} />
          <Capa estilo={{ flexDirection: d.titulo ? 'row' : 'column', gap: 80, alignItems: 'center' }}>
            {d.titulo && (
              <div style={{ flex: '0 0 520px', display: 'flex', flexDirection: 'column' }}>
                {d.rotulo && (
                  <motion.p className="kg-rotulo" variants={v}>
                    {d.rotulo}
                  </motion.p>
                )}
                <motion.h2 className="kg-h2" variants={v} style={{ fontSize: 72 }}>
                  <Lineas t={d.titulo} />
                </motion.h2>
                {d.texto && (
                  <motion.p className="kg-texto" variants={v} style={{ marginTop: 30, fontSize: 34 }}>
                    <Texto t={d.texto} />
                  </motion.p>
                )}
              </div>
            )}
            <motion.button
              type="button"
              className="kg-marco"
              variants={reducido ? quieto : { oculto: { opacity: 0, scale: 0.94, y: 30 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
              onClick={(e) => {
                e.stopPropagation();
                alAmpliar?.(d.src, d.alt);
              }}
              aria-label={`Ampliar: ${d.alt}`}
              style={{ flex: 1, alignSelf: 'center', border: 0, padding: 0, background: tono === 'kg-claro' ? '#fff' : 'transparent' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt={d.alt} draggable={false} style={{ height: 'auto', maxHeight: 820 }} />
            </motion.button>
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- LÍNEA */
    case 'linea': {
      const n = d.hitos.length;
      return (
        <section className={`kg-diapo ${tono}`}>
          <Agua ola={false} />
          <Capa>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h2" variants={v} style={{ maxWidth: 1500 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            <div style={{ position: 'relative', marginTop: 'auto', marginBottom: d.pie ? 40 : 60 }}>
              {/* La raya, que se dibuja de izquierda a derecha. */}
              <motion.div
                aria-hidden
                initial={reducido ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
                style={{ position: 'absolute', left: 0, right: 0, top: 31, height: 4, borderRadius: 2, transformOrigin: '0 50%', background: 'linear-gradient(90deg, var(--k-azul), var(--k-agua))' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 24, position: 'relative' }}>
                {d.hitos.map((h, k) => (
                  <motion.div
                    key={k}
                    initial={reducido ? false : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 + (k * 1.2) / n, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                  >
                    <span style={{ width: 66, height: 66, borderRadius: '50%', display: 'grid', placeItems: 'center', background: k === n - 1 ? 'linear-gradient(160deg, var(--k-agua), var(--k-azul))' : 'var(--k-noche)', border: '4px solid var(--k-agua)', boxShadow: '0 0 0 10px rgba(54,198,244,.12)', color: '#fff', fontSize: 24, fontWeight: 600 }}>
                      {k + 1}
                    </span>
                    <span className="kg-rotulo" style={{ margin: '14px 0 0' }}>
                      {h.cuando}
                    </span>
                    <span className="kg-h3" style={{ fontSize: n > 5 ? 44 : 56 }}>
                      <Texto t={h.que} />
                    </span>
                    {h.texto && (
                      <span className="kg-texto" style={{ fontSize: 28 }}>
                        <Texto t={h.texto} />
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            {d.pie && (
              <motion.p className="kg-texto" variants={v} style={{ fontSize: 32 }}>
                <Texto t={d.pie} />
              </motion.p>
            )}
          </Capa>
        </section>
      );
    }

    /* ------------------------------------------------------- BARRAS */
    case 'barras': {
      const max = Math.max(...d.barras.map((b) => b.valor));
      const muchas = d.barras.length > 12;
      return (
        <section className={`kg-diapo ${tono}`} style={{ paddingBottom: 90 }}>
          <Agua ola={false} />
          <Capa>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 60 }}>
              <div>
                {d.rotulo && (
                  <motion.p className="kg-rotulo" variants={v}>
                    {d.rotulo}
                  </motion.p>
                )}
                <motion.h2 className="kg-h2" variants={v} style={{ maxWidth: 1200, fontSize: 76 }}>
                  <Lineas t={d.titulo} />
                </motion.h2>
              </div>
              {d.texto && (
                <motion.p className="kg-texto" variants={v} style={{ maxWidth: 520, fontSize: 30 }}>
                  <Texto t={d.texto} />
                </motion.p>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-end', gap: muchas ? 12 : 28, marginTop: 50 }}>
              {d.barras.map((b, k) => (
                <div key={k} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                  <motion.span
                    initial={reducido ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + k * 0.05, duration: 0.5 }}
                    style={{ fontSize: muchas ? 22 : 34, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: b.destaca ? 'var(--k-agua)' : undefined, whiteSpace: 'nowrap' }}
                  >
                    {formato(b.valor)}
                  </motion.span>
                  <motion.span
                    initial={reducido ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.4 + k * 0.05, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: '100%',
                      height: `${(b.valor / max) * 78}%`,
                      transformOrigin: '50% 100%',
                      borderRadius: muchas ? '12px 12px 4px 4px' : '20px 20px 6px 6px',
                      background: b.destaca ? 'linear-gradient(180deg, var(--k-turquesa), var(--k-agua))' : tono === 'kg-claro' ? 'linear-gradient(180deg, var(--k-azul), var(--k-marino))' : 'linear-gradient(180deg, rgba(54,198,244,.75), rgba(10,99,201,.55))',
                      boxShadow: b.destaca ? '0 0 40px rgba(94,230,220,.45)' : undefined,
                    }}
                  />
                  {b.etiqueta && (
                    <span className="kg-pie" style={{ fontSize: muchas ? 18 : 26, whiteSpace: 'nowrap' }}>
                      {b.etiqueta}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {(d.unidad || d.fuente) && (
              <motion.p className="kg-pie" variants={v} style={{ marginTop: 22, fontSize: 22, opacity: 0.75 }}>
                {[d.unidad, d.fuente].filter(Boolean).join(' · ')}
              </motion.p>
            )}
          </Capa>
        </section>
      );
    }

    /* ------------------------------------------------------- FOTO */
    /* A sangre, con el texto sobre una sombra: la foto manda. */
    case 'foto':
      return (
        <section className="kg-diapo kg-oscuro" style={{ justifyContent: 'flex-end', padding: '0 150px 130px' }}>
          <motion.img
            src={d.src}
            alt={d.alt}
            draggable={false}
            initial={reducido ? false : { scale: 1.12 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 9, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: d.foco ?? '50% 50%', zIndex: 0 }}
          />
          <span aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, rgba(3,19,42,.05) 0%, rgba(3,19,42,.2) 40%, rgba(3,19,42,.92) 100%)' }} />
          <Capa estilo={{ justifyContent: 'flex-end', flex: 'none' }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h1" variants={v} style={{ maxWidth: 1500, textShadow: '0 4px 40px rgba(0,0,0,.4)' }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 32, maxWidth: 1150, color: 'rgba(255,255,255,.88)' }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
          </Capa>
        </section>
      );

    /* ------------------------------------------------------- PREGUNTA CON OPCIONES */
    case 'quiz': {
      const vista = paso >= 1;
      return (
        <section className={`kg-diapo ${tono}`} style={{ justifyContent: 'center' }}>
          <Agua ola={false} />
          <Capa estilo={{ justifyContent: 'center' }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h2" variants={v} style={{ maxWidth: 1500 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${d.opciones.length}, 1fr)`, gap: 28, marginTop: 70 }}>
              {d.opciones.map((o, k) => {
                const buena = k === d.correcta;
                return (
                  <motion.button
                    key={k}
                    type="button"
                    className="kg-cristal"
                    variants={v}
                    onClick={(e) => {
                      e.stopPropagation();
                      alDesvelar?.();
                    }}
                    animate={vista ? { opacity: buena ? 1 : 0.35, scale: buena ? 1.04 : 0.97 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      padding: '44px 40px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 22,
                      textAlign: 'left',
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                      borderColor: vista && buena ? 'var(--k-turquesa)' : undefined,
                      boxShadow: vista && buena ? '0 0 0 3px var(--k-turquesa), 0 30px 90px rgba(94,230,220,.25)' : undefined,
                    }}
                  >
                    <span className="kg-numero" style={vista && buena ? { background: 'linear-gradient(160deg, var(--k-turquesa), var(--k-agua))' } : undefined}>
                      {vista && buena ? '✓' : String.fromCharCode(65 + k)}
                    </span>
                    <span className="kg-h3" style={{ fontSize: 46 }}>
                      <Texto t={o} />
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {d.texto && (
              <motion.p
                className="kg-texto"
                initial={false}
                animate={{ opacity: vista ? 1 : 0, y: vista ? 0 : 20 }}
                transition={{ duration: 0.6, delay: vista ? 0.3 : 0 }}
                style={{ marginTop: 50, maxWidth: 1300 }}
              >
                <Texto t={d.texto} />
              </motion.p>
            )}
          </Capa>
        </section>
      );
    }

    /* ------------------------------------------------------- ACERTIJO */
    case 'acertijo': {
      const vista = paso >= 1;
      return (
        <section className="kg-diapo kg-oscuro" style={{ justifyContent: 'center' }}>
          {d.src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt={d.alt ?? ''} draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
              <span aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(90deg, rgba(3,19,42,.94) 0%, rgba(3,19,42,.8) 45%, rgba(3,19,42,.25) 100%)' }} />
            </>
          ) : (
            <Agua />
          )}
          <Capa estilo={{ justifyContent: 'center', maxWidth: 1180 }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h2" variants={v}>
              <Lineas t={d.titulo} />
            </motion.h2>
            <motion.div
              initial={false}
              animate={vista ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(14px)' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: 60 }}
            >
              <p className="kg-cifra" style={{ fontSize: 190, margin: 0 }}>
                {d.respuesta}
              </p>
              {d.texto && (
                <p className="kg-texto" style={{ marginTop: 26 }}>
                  <Texto t={d.texto} />
                </p>
              )}
            </motion.div>
            {!vista && (
              <motion.p className="kg-pie" variants={v} style={{ marginTop: 40, opacity: 0.7 }}>
                Piénsalo… y pulsa para ver la respuesta.
              </motion.p>
            )}
          </Capa>
        </section>
      );
    }

    /* ------------------------------------------------------- VÍDEO */
    case 'video':
      return <Video d={d} />;

    /* ------------------------------------------------------- PREGUNTA */
    case 'pregunta':
      return (
        <section className="kg-diapo kg-oscuro" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Agua burbujas />
          <Capa estilo={{ justifyContent: 'center', alignItems: 'center' }}>
            {d.rotulo && (
              <motion.p className="kg-rotulo" variants={v}>
                {d.rotulo}
              </motion.p>
            )}
            <motion.h2 className="kg-h1" variants={v} style={{ fontSize: 150, maxWidth: 1600 }}>
              <Lineas t={d.titulo} />
            </motion.h2>
            {d.texto && (
              <motion.p className="kg-texto" variants={v} style={{ marginTop: 48, maxWidth: 1100 }}>
                <Texto t={d.texto} />
              </motion.p>
            )}
          </Capa>
        </section>
      );
  }
}

/* ------------------------------------------------------------ EL VÍDEO */
/**
 * LOS VÍDEOS ESTÁN EN VIMEO, PROTEGIDOS, dentro de Mentor6A23: no se pueden
 * bajar. Aquí se cargan sólo al pulsar —un reproductor por diapositiva
 * cargando a la vez en segundo plano haría ir a tirones la presentación— y,
 * si Vimeo no deja ponerlos fuera de la plataforma, la diapositiva dice
 * cómo se llama la clase para ponerlo desde allí. Nada de pantalla negra sin
 * explicación.
 */
function Video({ d }: { d: Extract<D, { tipo: 'video' }> }) {
  const [puesto, setPuesto] = useState(false);
  const reducido = useReducedMotion();
  const v = reducido ? quieto : sube;
  return (
    <section className="kg-diapo kg-oscuro" style={{ alignItems: 'center', justifyContent: 'center', padding: '80px 120px' }}>
      <Agua ola={false} />
      <motion.div className="kg-capa" variants={cascada} initial="oculto" animate="visible" style={{ alignItems: 'center', justifyContent: 'center', gap: 36, flex: 'none' }}>
        <motion.div variants={v} style={{ textAlign: 'center' }}>
          <p className="kg-rotulo" style={{ marginBottom: 14 }}>
            {d.rotulo}
          </p>
          <h2 className="kg-h2" style={{ fontSize: 64 }}>
            <Texto t={d.titulo} />
          </h2>
        </motion.div>
        <motion.div className="kg-video" variants={reducido ? quieto : { oculto: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }} onClick={(e) => e.stopPropagation()}>
          {puesto ? (
            <iframe
              src={`https://player.vimeo.com/video/${d.vimeo}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`}
              title={d.titulo.replace(/\*/g, '')}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" className="kg-play" onClick={() => setPuesto(true)} aria-label={`Poner el vídeo: ${d.titulo.replace(/\*/g, '')}`}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
                <span className="kg-play-disco">
                  <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
                <span style={{ fontSize: 30, fontWeight: 500, opacity: 0.9 }}>Pulsa para ponerlo</span>
              </span>
            </button>
          )}
        </motion.div>
        <motion.p className="kg-pie" variants={v} style={{ textAlign: 'center', fontSize: 24, opacity: 0.8 }}>
          Si no arranca aquí, ponlo desde Mentor6A23: {d.clase}
        </motion.p>
      </motion.div>
    </section>
  );
}
