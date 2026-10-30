'use client';

/**
 * ============================================================================
 * LA PRESENTACIÓN EN DIRECTO
 * ============================================================================
 *
 * Gerson: «interactiva y fluida, que me permita cambiar (vamos, presentación
 * de diapositivas)». Lo que hace, pensado para dar la clase compartiendo
 * pantalla en Zoom:
 *
 *   · Se pasa con las flechas, la barra espaciadora, un clic, deslizando el
 *     dedo o con un mando de presentaciones (que manda flechas o Av Pág).
 *   · Algunas diapositivas descubren sus filas de una en una, como en Keynote.
 *   · ÍNDICE (tecla O): todas las diapositivas de un vistazo, para saltar.
 *   · NOTAS (tecla N): lo que hay que decir, debajo, para quien tiene una
 *     sola pantalla.
 *   · PRESENTADOR (tecla P): abre otra ventana con la diapositiva, la
 *     siguiente, las notas y el reloj. Las dos ventanas van a la vez: se pasa
 *     en cualquiera y cambia en las dos. En Zoom se comparte la otra.
 *   · PAUSA (tecla B): pantalla granate con el sello, para hablar sin
 *     diapositiva.
 *   · PANTALLA COMPLETA (tecla F).
 *
 * La diapositiva en curso va en la dirección (#7), así que recargar o mandar
 * el enlace deja a cada uno donde estaba.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DIAPOSITIVAS, tituloDe } from '@/content/presentacion';
import Diapositiva from './Diapositiva';
import './presentacion.css';

const TOTAL = DIAPOSITIVAS.length;
const CANAL = 'presentacion-masterclass';

/** Cuántas pulsaciones necesita una diapositiva antes de pasar a la siguiente. */
const pasosDe = (i: number) => {
  const d = DIAPOSITIVAS[i];
  return d.tipo === 'filas' && d.pasos ? d.filas.length : 0;
};

const limita = (n: number) => Math.max(0, Math.min(TOTAL - 1, n));

/** El lienzo de 1920 × 1080 escalado al ancho del hueco que lo contiene. */
function Lienzo({ i, paso, quieta }: { i: number; paso: number; quieta?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.15);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const mide = () => setK(el.clientWidth / 1920);
    mide();
    const ro = new ResizeObserver(mide);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="pres-mini-lienzo" style={{ transform: `scale(${k})` }}>
      <Diapositiva d={DIAPOSITIVAS[i]} paso={paso} quieta={quieta} />
    </div>
  );
}

function useEscala(margen: number) {
  const [caja, setCaja] = useState({ k: 0.5, x: 0, y: 0 });
  useEffect(() => {
    const mide = () => {
      const w = window.innerWidth - margen * 2;
      const h = window.innerHeight - margen * 2;
      const k = Math.min(w / 1920, h / 1080);
      setCaja({ k, x: (window.innerWidth - 1920 * k) / 2, y: (window.innerHeight - 1080 * k) / 2 });
    };
    mide();
    window.addEventListener('resize', mide);
    return () => window.removeEventListener('resize', mide);
  }, [margen]);
  return caja;
}

/* ========================================================================= */
/*  LA VISTA DE QUIEN PRESENTA                                                */
/* ========================================================================= */
function Presentador({ i, paso, ir, siguiente, anterior }: { i: number; paso: number; ir: (n: number) => void; siguiente: () => void; anterior: () => void }) {
  const [inicio, setInicio] = useState<number | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const pasado = inicio ? Math.floor((ahora - inicio) / 1000) : 0;
  const mmss = `${String(Math.floor(pasado / 60)).padStart(2, '0')}:${String(pasado % 60).padStart(2, '0')}`;
  const hora = new Date(ahora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pres-presentador">
      <div className="pres-presentador-barra">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span className="pres-reloj" aria-label="Tiempo de clase">
            {mmss}
          </span>
          <span style={{ opacity: 0.6 }}>{hora}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="pres-boton" onClick={() => setInicio(inicio ? null : Date.now())} style={{ background: 'rgba(251,246,238,.1)' }}>
            {inicio ? 'Reiniciar reloj' : 'Empezar reloj'}
          </button>
          <button type="button" className="pres-boton" onClick={anterior} style={{ background: 'rgba(251,246,238,.1)' }} aria-label="Anterior">
            ←
          </button>
          <span className="pres-cuenta" style={{ alignSelf: 'center' }}>
            {i + 1} / {TOTAL}
          </span>
          <button type="button" className="pres-boton solido" onClick={siguiente} aria-label="Siguiente">
            →
          </button>
        </div>
      </div>
      {/* Lo que ve la gente, y debajo lo que hay que decir. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, minHeight: 0 }}>
        <div className="pres-ventana">
          <Lienzo i={i} paso={paso} quieta />
        </div>
        <span style={{ opacity: 0.7, fontSize: 15 }}>
          Ahora: {tituloDe(DIAPOSITIVAS[i])}
          {pasosDe(i) > 0 ? ` · fila ${Math.min(paso, pasosDe(i))} de ${pasosDe(i)}` : ''}
        </span>
        <div className="pres-lado-notas">{DIAPOSITIVAS[i].nota}</div>
      </div>
      {/* Lo que viene. */}
      <div className="pres-lado">
        <span style={{ opacity: 0.7, fontSize: 15 }}>{i + 1 < TOTAL ? `Después: ${tituloDe(DIAPOSITIVAS[i + 1])}` : 'Es la última'}</span>
        {i + 1 < TOTAL && (
          <button type="button" className="pres-ventana" onClick={() => ir(i + 1)} style={{ border: 'none', padding: 0, cursor: 'pointer', flex: 'none' }} aria-label="Ir a la siguiente">
            <Lienzo i={i + 1} paso={Infinity} quieta />
          </button>
        )}
        <ol className="pres-proximas" aria-label="Diapositivas que vienen">
          {DIAPOSITIVAS.map((x, n) =>
            n > i + 1 && n <= i + 7 ? (
              <li key={n}>
                <button type="button" onClick={() => ir(n)}>
                  {n + 1} · {tituloDe(x)}
                </button>
              </li>
            ) : null
          )}
        </ol>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  LA PRESENTACIÓN                                                           */
/* ========================================================================= */
export default function Presentacion() {
  const sinMovimiento = useReducedMotion();
  const [i, setI] = useState(0);
  const [paso, setPaso] = useState(0);
  const [indice, setIndice] = useState(false);
  const [notas, setNotas] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [esPresentador, setEsPresentador] = useState(false);
  const canal = useRef<BroadcastChannel | null>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const caja = useEscala(0);

  /* Al entrar: dónde estaba (#7) y si esta ventana es la de quien presenta.
     También se marca el cuerpo, para que la web no pinte encima su cartel de
     cookies en mitad de la clase. */
  useEffect(() => {
    const n = Number(window.location.hash.replace('#', ''));
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL) {
      setI(n - 1);
      setPaso(pasosDe(n - 1));
    }
    setEsPresentador(new URLSearchParams(window.location.search).has('presentador'));
    document.body.dataset.presentacion = '1';
    return () => {
      delete document.body.dataset.presentacion;
    };
  }, []);

  /* Las dos ventanas hablan entre sí: lo que se pasa en una, se pasa en la otra. */
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const c = new BroadcastChannel(CANAL);
    canal.current = c;
    c.onmessage = (ev: MessageEvent<{ i: number; paso: number; pausa?: boolean }>) => {
      setI(ev.data.i);
      setPaso(ev.data.paso);
      if (typeof ev.data.pausa === 'boolean') setPausa(ev.data.pausa);
    };
    return () => c.close();
  }, []);

  const ponte = useCallback((n: number, p: number, avisar = true, pa?: boolean) => {
    setI(n);
    setPaso(p);
    if (typeof pa === 'boolean') setPausa(pa);
    if (avisar) canal.current?.postMessage({ i: n, paso: p, pausa: pa });
    try {
      window.history.replaceState(null, '', `#${n + 1}`);
    } catch {
      /* Una dirección que no se puede tocar no es motivo para parar la clase. */
    }
  }, []);

  const siguiente = useCallback(() => {
    if (paso < pasosDe(i)) return ponte(i, paso + 1);
    if (i < TOTAL - 1) ponte(i + 1, 0);
  }, [i, paso, ponte]);
  const anterior = useCallback(() => {
    if (paso > 0 && pasosDe(i) > 0) return ponte(i, paso - 1);
    if (i > 0) ponte(i - 1, pasosDe(i - 1));
  }, [i, paso, ponte]);
  const ir = useCallback((n: number) => ponte(limita(n), pasosDe(limita(n))), [ponte]);

  const pantallaCompleta = useCallback(() => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    } catch {
      /* Hay navegadores (el iPhone) que no la dan: se sigue igual. */
    }
  }, []);

  const abrePresentador = useCallback(() => {
    window.open(`${window.location.pathname}?presentador=1#${i + 1}`, 'presentador', 'width=1280,height=800');
  }, [i]);

  /* El teclado, que es lo que manda un mando de presentaciones. */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) {
        e.preventDefault();
        if (indice) setIndice(false);
        siguiente();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) {
        e.preventDefault();
        anterior();
      } else if (k === 'Home') ir(0);
      else if (k === 'End') ir(TOTAL - 1);
      else if (k === 'o' || k === 'O') setIndice((v) => !v);
      else if (k === 'Escape') setIndice(false);
      else if (k === 'n' || k === 'N') setNotas((v) => !v);
      else if (k === 'f' || k === 'F') pantallaCompleta();
      else if (k === 'p' || k === 'P') abrePresentador();
      else if (k === 'b' || k === 'B' || k === '.') ponte(i, paso, true, !pausa);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [siguiente, anterior, ir, indice, pantallaCompleta, abrePresentador, ponte, i, paso, pausa]);

  /* El mando de abajo se esconde solo cuando no se mueve el ratón: en
     pantalla compartida, la diapositiva se ve limpia. */
  useEffect(() => {
    let t = window.setTimeout(() => setQuieto(true), 2500);
    const mueve = () => {
      setQuieto(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setQuieto(true), 2500);
    };
    window.addEventListener('pointermove', mueve);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pointermove', mueve);
    };
  }, []);

  const d = DIAPOSITIVAS[i];
  const avance = useMemo(() => ((i + 1) / TOTAL) * 100, [i]);

  if (esPresentador) return <Presentador i={i} paso={paso} ir={ir} siguiente={siguiente} anterior={anterior} />;

  return (
    <div className="pres" role="region" aria-roledescription="presentación" aria-label="Masterclass Desórdenes Amorosos">
      {/* -------------------------------------------------- EL ESCENARIO */}
      <div
        className="pres-escenario"
        style={{ transform: `translate(${caja.x}px, ${caja.y}px) scale(${caja.k})`, borderRadius: 0 }}
        onPointerDown={(e) => {
          toque.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const t = toque.current;
          toque.current = null;
          if (!t) return;
          const dx = e.clientX - t.x;
          if (Math.abs(dx) > 50) return dx < 0 ? siguiente() : anterior();
          /* Un toque: el tercio izquierdo vuelve, el resto avanza. */
          if (e.clientX < window.innerWidth / 3) anterior();
          else siguiente();
        }}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={i}
            style={{ position: 'absolute', inset: 0 }}
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
            transition={{ duration: sinMovimiento ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Diapositiva d={d} paso={paso} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lo que oye un lector de pantalla al pasar. */}
      <p aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Diapositiva {i + 1} de {TOTAL}: {tituloDe(d)}
      </p>

      {pausa && (
        <div className="pres-pausa" onClick={() => ponte(i, paso, true, false)}>
          <Image src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" width={180} height={180} />
        </div>
      )}

      {notas && (
        <div className="pres-notas" role="note">
          <strong>Notas · {tituloDe(d)}</strong>
          {d.nota}
        </div>
      )}

      {/* ------------------------------------------------------ EL ÍNDICE */}
      <AnimatePresence>
        {indice && (
          <motion.div className="pres-indice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="pres-indice-rejilla">
              {DIAPOSITIVAS.map((x, n) => (
                <button
                  key={n}
                  type="button"
                  className="pres-mini"
                  aria-current={n === i}
                  aria-label={`Ir a la diapositiva ${n + 1}: ${tituloDe(x)}`}
                  onClick={() => {
                    ir(n);
                    setIndice(false);
                  }}
                >
                  <Lienzo i={n} paso={Infinity} quieta />
                  <span className="pres-mini-num">
                    {n + 1} · {tituloDe(x)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------- EL MANDO */}
      <div className={`pres-mando${quieto && !indice && !notas ? ' quieto' : ''}`} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" className="pres-boton" onClick={anterior} aria-label="Anterior" disabled={i === 0 && paso === 0}>
          ←
        </button>
        <span className="pres-cuenta">
          {i + 1} / {TOTAL}
        </span>
        <button type="button" className="pres-boton solido" onClick={siguiente} aria-label="Siguiente">
          →
        </button>
        <button type="button" className="pres-boton" aria-pressed={indice} onClick={() => setIndice((v) => !v)} title="Índice (O)">
          Índice
        </button>
        <button type="button" className="pres-boton pres-solo-ancho" aria-pressed={notas} onClick={() => setNotas((v) => !v)} title="Notas (N)">
          Notas
        </button>
        <button type="button" className="pres-boton pres-solo-ancho" onClick={abrePresentador} title="Vista de quien presenta (P)">
          Presentador
        </button>
        <button type="button" className="pres-boton" onClick={pantallaCompleta} title="Pantalla completa (F)" aria-label="Pantalla completa">
          ⤢
        </button>
      </div>
      <div className="pres-progreso" style={{ width: `${avance}%` }} aria-hidden />
    </div>
  );
}
