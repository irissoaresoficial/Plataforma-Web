'use client';

/**
 * UNA DIAPOSITIVA, DIBUJADA SOBRE SU LIENZO DE 1920 × 1080.
 *
 * Hay pocos tipos y se repiten a propósito: una presentación en la que cada
 * diapositiva tiene su propio diseño se lee como un catálogo. Aquí las de
 * idea (granate), las de chat (dorado) y las de contenido (crema) se alternan,
 * y es esa alternancia la que marca el ritmo de la clase.
 *
 * Las piezas entran escalonadas, una detrás de otra, cuando se llega a la
 * diapositiva. En el índice y en la vista de quien presenta salen quietas.
 */

import { createContext, useContext } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { CURSOS, MASTERCLASS, PRESENTAN, eur, falta } from '@/content/site';
import type { Diapo, Tarjeta } from '@/content/presentacion';

const Quieta = createContext(false);

const pieza: Variants = {
  fuera: { opacity: 0, y: 26, filter: 'blur(6px)' },
  dentro: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Un bloque que entra escalonado. Quieto en el índice o sin movimiento. */
function B({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const quieta = useContext(Quieta);
  const sinMovimiento = useReducedMotion();
  if (quieta || sinMovimiento) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div className={className} style={style} variants={pieza}>
      {children}
    </motion.div>
  );
}

/**
 * EL TEXTO CON SUS DOS MARCAS: *resalte* en el color de la casa y [pendiente]
 * en rojo. Lo pendiente lleva además la palabra para un lector de pantalla,
 * porque el color solo no dice nada a quien no lo ve.
 */
export function Rico({ t }: { t: string }) {
  const trozos = t.split(/(\*[^*]+\*|\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {trozos.map((x, i) =>
        x.startsWith('*') ? (
          <span key={i} className="pres-resalte">
            {x.slice(1, -1)}
          </span>
        ) : x.startsWith('[') ? (
          <mark key={i} className="pres-pendiente" aria-label={`Pendiente: ${x.slice(1, -1)}`}>
            {x}
          </mark>
        ) : (
          <span key={i}>{x}</span>
        )
      )}
    </>
  );
}

/** Lo que no está decidido en la ficha del curso, en rojo y sin inventar. */
const dato = (v: unknown, texto?: string) => (falta(v) ? '[Pendiente]' : texto ?? String(v));

function Pie({ oscura }: { oscura?: boolean }) {
  return (
    <div className="pres-pie" aria-hidden>
      <span>{MASTERCLASS.titulo} · Escuela de Sabiduría 33</span>
      {oscura ? null : <span>{MASTERCLASS.corto}</span>}
    </div>
  );
}

function Cabecera({ rotulo, titulo }: { rotulo?: string; titulo: string }) {
  return (
    <B style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {rotulo && (
        <p className="pres-rotulo">
          <Rico t={rotulo} />
        </p>
      )}
      <h2 className="pres-h2">
        <Rico t={titulo} />
      </h2>
    </B>
  );
}

function TarjetaV({ t }: { t: Tarjeta }) {
  /* Con dos piezas (rótulo y título, o título y texto) se reparten arriba y
     abajo. Una lista no: sus líneas van seguidas. */
  const partes = [t.rotulo, t.titulo, t.texto].filter(Boolean).length;
  const reparte = !t.lineas && !t.grande && partes >= 2;
  return (
    <B className={`pres-tarjeta${t.oscura ? ' oscura' : ''}${t.grande ? ' grande' : ''}${reparte ? ' reparte' : ''}`}>
      {t.rotulo && (
        <p className="pres-rotulo">
          <Rico t={t.rotulo} />
        </p>
      )}
      {t.titulo && (
        <h3 className="pres-h3">
          <Rico t={t.titulo} />
        </h3>
      )}
      {t.texto && (
        <p className="pres-texto">
          <Rico t={t.texto} />
        </p>
      )}
      {t.lineas?.map((l) => (
        <p key={l} className="pres-texto">
          <Rico t={l} />
        </p>
      ))}
    </B>
  );
}

/** El icono del chat, dibujado aquí: no hace falta una librería para uno. */
function IcoChat() {
  return (
    <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.2A7.5 7.5 0 1 1 20 12.5z" />
      <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" strokeWidth="2.4" />
    </svg>
  );
}

const contenedor: Variants = { fuera: {}, dentro: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } } };

export default function Diapositiva({ d, paso = Infinity, quieta = false }: { d: Diapo; paso?: number; quieta?: boolean }) {
  const sinMovimiento = useReducedMotion();
  const clase =
    d.tipo === 'portada' || d.tipo === 'frase' || d.tipo === 'precio'
      ? 'pres-diapo oscura centrada'
      : d.tipo === 'chat'
        ? 'pres-diapo acento centrada'
        : 'pres-diapo';

  const cuerpo = (() => {
    switch (d.tipo) {
      /* ------------------------------------------------------------ PORTADA */
      case 'portada':
        return (
          <>
            <div style={{ position: 'absolute', left: 1000, top: 0, width: 920, height: 1080 }}>
              <Image src="/images/camino-escuela.jpg" alt="" fill sizes="920px" style={{ objectFit: 'cover' }} priority />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--vino) 0%, rgba(69,26,37,.55) 45%, rgba(69,26,37,.1) 100%)' }} />
            </div>
            <B>
              <Image src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" width={128} height={128} />
            </B>
            <B style={{ display: 'flex', flexDirection: 'column', gap: 26, width: 1000 }}>
              <p className="pres-rotulo">Masterclass gratuita en directo</p>
              <h1 className="pres-h1" style={{ fontSize: 'var(--p-gigante)', lineHeight: 0.98 }}>
                {MASTERCLASS.titulo}
              </h1>
              <p className="pres-texto" style={{ fontSize: 44, lineHeight: 1.25 }}>
                <Rico t="Por qué repites la misma historia *y dónde empezó*" />
              </p>
            </B>
            <B style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span className="pres-pastilla">
                <span className="pres-punto" aria-hidden />
                {MASTERCLASS.corto} ({MASTERCLASS.zona})
              </span>
              <span className="pres-pastilla">{PRESENTAN.map((p) => p.nombre).join(' · ')}</span>
            </B>
          </>
        );

      /* -------------------------------------------------------------- FRASE */
      case 'frase':
        return (
          <>
            {d.imagen && (
              <div style={{ position: 'absolute', left: 1180, top: 0, width: 740, height: 1080 }}>
                <Image src={d.imagen} alt="" fill sizes="740px" style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--vino) 0%, rgba(69,26,37,.25) 50%, rgba(69,26,37,0) 100%)' }} />
              </div>
            )}
            {d.logo && (
              <B>
                <Image src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" width={140} height={140} />
              </B>
            )}
            <B>
              <p className="pres-rotulo">
                <Rico t={d.rotulo} />
              </p>
            </B>
            <B>
              <h1 className="pres-h1" style={d.imagen ? { maxWidth: 1000 } : undefined}>
                <Rico t={d.titulo} />
              </h1>
            </B>
            {d.texto && (
              <B>
                <p className="pres-texto" style={{ fontSize: 44, lineHeight: 1.35 }}>
                  <Rico t={d.texto} />
                </p>
              </B>
            )}
            {d.logo && (
              <B>
                <p className="pres-rotulo" style={{ letterSpacing: '.08em' }}>
                  {PRESENTAN.map((p) => p.nombre).join(' · ')}
                </p>
              </B>
            )}
          </>
        );

      /* --------------------------------------------------------------- CHAT */
      case 'chat':
        return (
          <>
            <B style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <IcoChat />
              <p className="pres-rotulo">{d.rotulo ?? 'Momento chat'}</p>
            </B>
            <B>
              <h1 className="pres-h1">
                <Rico t={d.titulo} />
              </h1>
            </B>
            {d.pastillas && (
              <B style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                {d.pastillas.map((p) => (
                  <span key={p} className="pres-pastilla">
                    {p}
                  </span>
                ))}
              </B>
            )}
            {d.texto && (
              <B>
                <p className="pres-texto" style={{ fontSize: 44 }}>
                  <Rico t={d.texto} />
                </p>
              </B>
            )}
          </>
        );

      /* ----------------------------------------------------------- TARJETAS */
      case 'tarjetas':
        return (
          <>
            <Cabecera rotulo={d.rotulo} titulo={d.titulo} />
            <div className="pres-fila-tarjetas" style={d.tarjetas.length === 4 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 } : undefined}>
              {d.tarjetas.map((t, i) => (
                <TarjetaV key={i} t={t} />
              ))}
            </div>
            {d.pie && (
              <B>
                <p className="pres-texto" style={{ fontSize: 40, color: 'var(--vino)' }}>
                  <Rico t={d.pie} />
                </p>
              </B>
            )}
            <Pie />
          </>
        );

      /* -------------------------------------------------------------- FILAS */
      case 'filas':
        return (
          <>
            <div style={{ display: 'flex', gap: 72, flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 48 }}>
                <Cabecera rotulo={d.rotulo} titulo={d.titulo} />
                <B className="pres-filas">
                  {d.filas.map((f, i) => (
                    <motion.div
                      key={i}
                      className={`pres-filafila${f.texto ? '' : ' sin-texto'}`}
                      initial={false}
                      animate={i < paso ? { opacity: 1, x: 0 } : { opacity: 0.12, x: 0 }}
                      transition={{ duration: sinMovimiento || quieta ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="pres-num" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="pres-h3" style={{ fontSize: f.texto ? 44 : 40, fontWeight: f.texto ? 500 : 400 }}>
                        <Rico t={f.titulo} />
                      </span>
                      {f.texto && (
                        <span className="pres-texto" style={{ fontSize: 32 }}>
                          <Rico t={f.texto} />
                        </span>
                      )}
                    </motion.div>
                  ))}
                </B>
                {d.pie && (
                  <B>
                    <p className="pres-texto" style={{ fontSize: 30 }}>
                      <Rico t={d.pie} />
                    </p>
                  </B>
                )}
              </div>
              {d.imagen && (
                <B className="pres-imagen" style={{ height: 790 }}>
                  <Image src={d.imagen} alt="" fill sizes="640px" style={{ objectFit: 'cover' }} />
                </B>
              )}
            </div>
            <Pie />
          </>
        );

      /* ---------------------------------------------------------- PRESENTAN */
      case 'presentan':
        return (
          <>
            <Cabecera rotulo={d.rotulo} titulo={d.titulo} />
            <div className="pres-fila-tarjetas">
              {PRESENTAN.map((p, i) => (
                <B key={p.nombre} className="pres-tarjeta" style={{ flexDirection: 'row', alignItems: 'center', gap: 44 }}>
                  <span style={{ position: 'relative', flex: 'none', width: 250, height: 250, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 50px -20px rgba(34,29,31,.5)' }}>
                    {p.foto ? <Image src={p.foto} alt={p.alt} fill sizes="250px" style={{ objectFit: 'cover' }} /> : null}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                    <span className="pres-h3">{p.nombre}</span>
                    <span className="pres-texto" style={{ fontSize: 28, color: 'var(--oro-tinta)' }}>
                      {p.titulo}
                    </span>
                    {d.historias[i] && (
                      <span className="pres-texto" style={{ fontSize: 26 }}>
                        <Rico t={d.historias[i]} />
                      </span>
                    )}
                  </span>
                </B>
              ))}
            </div>
            <Pie />
          </>
        );

      /* -------------------------------------------------------------- CURSO */
      case 'curso': {
        const c = CURSOS[0];
        const datos: Array<[string, string]> = [
          ['Fechas', dato(c.fechas)],
          ['Horario', dato(c.horario)],
          ['Duración', dato(c.duracion)],
          ['Modalidad', dato(c.modalidad)],
        ];
        return (
          <>
            <div style={{ display: 'flex', gap: 72, flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 44 }}>
            <Cabecera rotulo="La propuesta · el curso" titulo={c.titulo} />
            <B>
              <p className="pres-texto" style={{ fontSize: 40 }}>
                <Rico t={falta(c.claim) ? '[Una frase: lo que consigues al terminar el curso]' : String(c.claim)} />
              </p>
            </B>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {datos.map(([k, v]) => (
                <B key={k} className="pres-tarjeta" style={{ padding: 40, gap: 14, minHeight: 170, justifyContent: 'space-between' }}>
                  <p className="pres-rotulo">{k}</p>
                  <p className="pres-texto" style={{ fontSize: 36, color: 'var(--tinta)' }}>
                    <Rico t={v} />
                  </p>
                </B>
              ))}
            </div>
            <B style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              {PRESENTAN.map((p) => (
                <span key={p.nombre} style={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', overflow: 'hidden' }}>
                  {p.foto ? <Image src={p.foto} alt={p.nombre} fill sizes="96px" style={{ objectFit: 'cover' }} /> : null}
                </span>
              ))}
              <span className="pres-texto" style={{ color: 'var(--tinta)' }}>
                Con {PRESENTAN.map((p) => p.nombre).join(' y ')}
              </span>
            </B>
            </div>
            <B className="pres-imagen" style={{ height: 790 }}>
              <Image src={c.cartel || '/images/desordenes-amorosos-cartel.jpg'} alt={`Logotipo del curso ${c.titulo}`} fill sizes="640px" style={{ objectFit: 'cover' }} />
            </B>
            </div>
            <Pie />
          </>
        );
      }

      /* ------------------------------------------------------------- PRECIO */
      case 'precio': {
        const c = CURSOS[0];
        return (
          <>
            <B>
              <p className="pres-rotulo" style={{ textAlign: 'center' }}>
                Precio del curso
              </p>
            </B>
            <B>
              <h1 className="pres-h1" style={{ fontSize: 220, textAlign: 'center', maxWidth: 'none' }}>
                <Rico t={c.precio === null ? '[€ __]' : eur(c.precio)} />
              </h1>
            </B>
            <B>
              <p className="pres-texto" style={{ fontSize: 40, textAlign: 'center', maxWidth: 1400, margin: '0 auto' }}>
                <Rico t="[Precio para quien está hoy en directo, y hasta qué día y hora vale]" />
              </p>
            </B>
            <B>
              <p className="pres-texto" style={{ textAlign: 'center', maxWidth: 1300, margin: '0 auto' }}>
                <Rico t="[Formas de pago: un pago o plazos, sólo si es real]" />
              </p>
            </B>
          </>
        );
      }
    }
  })();

  const alinear = d.tipo === 'precio' ? { alignItems: 'center' as const } : undefined;

  return (
    <Quieta.Provider value={quieta}>
      {quieta || sinMovimiento ? (
        <div className={clase} style={alinear}>
          {cuerpo}
        </div>
      ) : (
        <motion.div className={clase} style={alinear} variants={contenedor} initial="fuera" animate="dentro">
          {cuerpo}
        </motion.div>
      )}
    </Quieta.Provider>
  );
}
