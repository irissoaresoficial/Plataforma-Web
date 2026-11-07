'use client';

/**
 * ============================================================================
 * LA PRESENTACIÓN DEL EVENTO, EN DIRECTO
 * ============================================================================
 *
 * Para darla en una sala con proyector o compartiendo pantalla:
 *
 *   · Se pasa con → , la barra espaciadora, Av Pág o un mando de
 *     presentaciones; se vuelve con ←. Un clic en la parte derecha avanza y
 *     en la izquierda retrocede. En una tableta, deslizando.
 *   · Las listas con pasos descubren una fila por pulsación, como en Keynote.
 *   · Entre capítulos, una cortina de agua barre la pantalla. Dentro de un
 *     capítulo, la diapositiva sólo se funde: menos es más con las
 *     transiciones (Gerson, en sus reglas de vídeo).
 *   · F, pantalla completa. O, el índice para saltar. Inicio y Fin.
 *   · Las imágenes de la formación se amplían con un clic.
 *   · La diapositiva en curso va en la dirección (#7): recargar o mandar el
 *     enlace deja a cada uno donde estaba.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CAPITULOS, type Diapo as D } from '@/content/kangen';
import Diapo from './Diapo';
import './kangen.css';

type Plana = { d: D; cap: number; enCap: number };

/** Cuántas pulsaciones necesita una diapositiva antes de pasar: una lista con
 *  pasos, una por fila; una pregunta o un acertijo, una para la respuesta. */
const pasosDe = (d: D) => (d.tipo === 'lista' && d.pasos ? d.puntos.length : d.tipo === 'quiz' || d.tipo === 'acertijo' ? 1 : 0);
const tituloDe = (d: D) => ('titulo' in d ? d.titulo : '').replace(/\*|\[|\]/g, '').replace(/ \/ /g, ' ');

function useEscala() {
  const [caja, setCaja] = useState({ k: 0.5, x: 0, y: 0, vertical: false });
  useEffect(() => {
    const mide = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const k = Math.min(w / 1920, h / 1080);
      setCaja({ k, x: (w - 1920 * k) / 2, y: (h - 1080 * k) / 2, vertical: h > w * 1.2 });
    };
    mide();
    window.addEventListener('resize', mide);
    return () => window.removeEventListener('resize', mide);
  }, []);
  return caja;
}

export default function Kangen() {
  const reducido = useReducedMotion();
  const todas = useMemo<Plana[]>(() => CAPITULOS.flatMap((c, cap) => c.diapos.map((d, enCap) => ({ d, cap, enCap }))), []);
  const TOTAL = todas.length;
  const [i, setI] = useState(0);
  const [paso, setPaso] = useState(0);
  const [indice, setIndice] = useState(false);
  const [lupa, setLupa] = useState<{ src: string; alt: string } | null>(null);
  const [quieto, setQuieto] = useState(false);
  const [ayuda, setAyuda] = useState(true);
  /* De dónde se viene: decide si hay cortina (cambio de capítulo) y hacia
     qué lado barre. */
  const [desde, setDesde] = useState(0);
  const escala = useEscala();

  /* La dirección manda al cargar: #7 abre la séptima. Hasta haberla leído no
     se escribe, o la primera escritura (#1) pisaría la que traía el enlace. */
  const [leida, setLeida] = useState(false);
  useEffect(() => {
    const n = Number(window.location.hash.slice(1));
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL) {
      setI(n - 1);
      setDesde(n - 1);
    }
    setLeida(true);
    /* Sin cartel de cookies: taparía la diapositiva en directo. */
    document.body.setAttribute('data-kangen', '');
    const t = window.setTimeout(() => setAyuda(false), 6000);
    return () => {
      window.clearTimeout(t);
      document.body.removeAttribute('data-kangen');
    };
  }, [TOTAL]);
  useEffect(() => {
    if (leida) window.history.replaceState(null, '', `#${i + 1}`);
  }, [i, leida]);

  const ir = useCallback(
    (n: number, alFinal = false) => {
      const m = Math.max(0, Math.min(TOTAL - 1, n));
      setDesde(i);
      setI(m);
      setPaso(alFinal ? pasosDe(todas[m].d) : 0);
    },
    [TOTAL, todas, i]
  );
  const siguiente = useCallback(() => {
    if (paso < pasosDe(todas[i].d)) setPaso((p) => p + 1);
    else if (i < TOTAL - 1) ir(i + 1);
  }, [paso, i, todas, TOTAL, ir]);
  const atras = useCallback(() => {
    if (paso > 0) setPaso((p) => p - 1);
    else if (i > 0) ir(i - 1, true);
  }, [paso, i, ir]);

  const pantallaCompleta = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  /* EL TECLADO, y el mando de presentaciones, que manda las mismas teclas. */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (lupa) {
        if (['Escape', ' ', 'Enter'].includes(e.key)) setLupa(null);
        return;
      }
      if (indice) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'o') setIndice(false);
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          siguiente();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          atras();
          break;
        case 'Home':
          ir(0);
          break;
        case 'End':
          ir(TOTAL - 1);
          break;
        case 'f':
        case 'F':
          pantallaCompleta();
          break;
        case 'o':
        case 'O':
          setIndice(true);
          break;
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [siguiente, atras, ir, TOTAL, indice, lupa, pantallaCompleta]);

  /* LOS MANDOS DE ABAJO se esconden si el ratón no se mueve. */
  useEffect(() => {
    let t = 0;
    const despierta = () => {
      setQuieto(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setQuieto(true), 2600);
    };
    despierta();
    window.addEventListener('pointermove', despierta);
    return () => {
      window.removeEventListener('pointermove', despierta);
      window.clearTimeout(t);
    };
  }, []);

  /* DESLIZAR en una tableta o un móvil. */
  const toque = useRef<{ x: number; y: number } | null>(null);

  const actual = todas[i];
  const cambiaCapitulo = todas[desde]?.cap !== actual.cap;
  const haciaDelante = i >= desde;

  /* El progreso, por capítulos. */
  const porCapitulo = CAPITULOS.map((c, k) => {
    const inicio = todas.findIndex((t) => t.cap === k);
    const n = c.diapos.length;
    const hechas = k < actual.cap ? n : k > actual.cap ? 0 : actual.enCap + 1;
    return { titulo: c.titulo, inicio, n, hechas };
  });

  return (
    <div
      className="kg"
      onPointerDown={(e) => {
        toque.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const t = toque.current;
        toque.current = null;
        if (!t || indice || lupa) return;
        const dx = e.clientX - t.x;
        const dy = e.clientY - t.y;
        if (e.pointerType !== 'mouse' && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) siguiente();
          else atras();
        }
      }}
      onClick={(e) => {
        if (indice || lupa) return;
        if ((e.target as HTMLElement).closest('button, a, iframe, .kg-video, .kg-hud')) return;
        if (e.clientX < window.innerWidth * 0.3) atras();
        else siguiente();
      }}
    >
      <div className="kg-escenario" style={{ transform: `translate(${escala.x}px, ${escala.y}px) scale(${escala.k})` }}>
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={i}
            style={{ position: 'absolute', inset: 0 }}
            initial={
              reducido
                ? { opacity: 0 }
                : cambiaCapitulo
                  ? { opacity: 1, clipPath: haciaDelante ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }
                  : { opacity: 0, scale: 1.02, filter: 'blur(14px)' }
            }
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0 0%)' }}
            exit={reducido ? { opacity: 0 } : cambiaCapitulo ? { opacity: 1, filter: 'brightness(0.5) blur(6px)' } : { opacity: 0, scale: 0.985, filter: 'blur(10px)' }}
            transition={{ duration: cambiaCapitulo ? 1 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Diapo d={actual.d} paso={paso} alAmpliar={(src, alt) => setLupa({ src, alt })} alDesvelar={() => setPaso((p) => Math.max(p, 1))} />
          </motion.div>
        </AnimatePresence>

        {/* LA CORTINA DE AGUA, sólo al cambiar de capítulo: un barrido rápido
            con desenfoque de movimiento, un poco más oscuro. */}
        <AnimatePresence>
          {cambiaCapitulo && !reducido && (
            <motion.div
              key={`cortina-${i}`}
              aria-hidden
              initial={{ x: haciaDelante ? '105%' : '-105%', skewX: haciaDelante ? -12 : 12, filter: 'blur(30px)' }}
              animate={{ x: haciaDelante ? '-105%' : '105%', filter: 'blur(30px)' }}
              transition={{ duration: 1.05, ease: [0.65, 0, 0.35, 1] }}
              style={{
                position: 'absolute',
                inset: '-5% -20%',
                zIndex: 4,
                pointerEvents: 'none',
                background: 'linear-gradient(90deg, transparent 0%, #0a63c9 18%, #36c6f4 50%, #0b4a8f 82%, transparent 100%)',
                opacity: 0.92,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* EL PROGRESO, por capítulos. */}
      <div className="kg-progreso" aria-hidden>
        {porCapitulo.map((c, k) => (
          <span key={k} style={{ flex: c.n }}>
            <b style={{ width: `${(c.hechas / c.n) * 100}%` }} />
          </span>
        ))}
      </div>

      {/* LOS MANDOS. */}
      <div className="kg-hud" data-oculto={quieto && !indice ? '1' : undefined} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={atras} aria-label="Anterior" title="Anterior (←)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="kg-hud-cuenta">
          {CAPITULOS[actual.cap].titulo} · {i + 1} / {TOTAL}
        </span>
        <button type="button" onClick={siguiente} aria-label="Siguiente" title="Siguiente (→)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button type="button" onClick={() => setIndice(true)} title="Índice (O)">
          Índice
        </button>
        <button type="button" onClick={pantallaCompleta} aria-label="Pantalla completa" title="Pantalla completa (F)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>

      {/* En un móvil en vertical la diapositiva queda en una franja: se dice
          cómo verla en grande en vez de dejar que se lea con lupa. */}
      {escala.vertical && (
        <div className="kg-ayuda" style={{ top: 'auto', right: 'auto', left: '50%', bottom: `calc(50% - ${(1080 * escala.k) / 2}px - 64px)`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          Gira el móvil para verla en grande
        </div>
      )}

      {ayuda && !escala.vertical && (
        <div className="kg-ayuda" aria-hidden>
          <kbd>→</kbd> pasar · <kbd>←</kbd> volver · <kbd>F</kbd> pantalla completa · <kbd>O</kbd> índice
        </div>
      )}

      {/* EL ÍNDICE. */}
      <AnimatePresence>
        {indice && (
          <motion.nav
            className="kg-indice"
            aria-label="Índice de la presentación"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIndice(false);
            }}
          >
            <button type="button" onClick={() => setIndice(false)} style={{ position: 'fixed', top: 18, right: 18, zIndex: 2 }}>
              Cerrar
            </button>
            {CAPITULOS.map((c, k) => (
              <div key={k}>
                <h2>{c.titulo}</h2>
                <div className="kg-indice-filas">
                  {todas.map((t, n) =>
                    t.cap === k ? (
                      <button
                        key={n}
                        type="button"
                        aria-current={n === i}
                        onClick={() => {
                          ir(n);
                          setIndice(false);
                        }}
                      >
                        <small>{n + 1}</small>
                        <span>{tituloDe(t.d) || t.d.tipo}</span>
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* LA IMAGEN AMPLIADA. */}
      <AnimatePresence>
        {lupa && (
          <motion.div className="kg-lupa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLupa(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img src={lupa.src} alt={lupa.alt} initial={{ scale: 0.94 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
