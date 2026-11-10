'use client';

/**
 * LA PRESENTACIÓN DE LA MASTERCLASS «DESÓRDENES AMOROSOS» (v2, 10 nov 2026).
 *
 * Lienzo de 1920×1080 escalado a la pantalla. Cada clic hace pasar algo:
 * aparece una frase, una tarjeta, un número, un vídeo. Se maneja con:
 *   → / espacio / clic        siguiente paso
 *   ←                         paso anterior
 *   F pantalla completa · N notas y modo edición · G índice
 *
 * Lo interactivo de verdad:
 *   · Pantalla de espera con música y cuenta atrás de 10 minutos.
 *   · Votaciones del chat que quien presenta va sumando y crecen en directo.
 *   · «Vuestras frases»: se escriben las frases del chat y aparecen en pantalla.
 *   · El ejercicio de las tres generaciones con edades.
 *   · 10 minutos de preguntas con cuenta atrás antes del vídeo de la venta.
 *
 * Nada inventado y nada marcado como PENDIENTE a la vista del público: los
 * datos que aún no hay (fechas del curso, enlace de pago, la guía en PDF) son
 * campos que se rellenan en modo edición (tecla N) y se guardan en este
 * navegador. Si un campo está vacío, en directo no se ve.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './clase.css';

type Fondo = 'vino' | 'arena' | 'oro' | 'foto' | 'negro';

type Estado = {
  escala: number[];
  claves: number[];
  edades: [string, string, string];
  frases: string[];
  relojes: Record<string, { fin: number | null; queda: number }>;
};

type Ctx = {
  paso: number;
  e: Estado;
  set: (f: (e: Estado) => Estado) => void;
  editar: boolean;
  campos: Record<string, string>;
  setCampo: (k: string, v: string) => void;
  ahora: number;
};

type Diapo = {
  id: string;
  titulo: string;
  fondo: Fondo;
  pasos: number;
  notas: string;
  foto?: string;
  pinta: (c: Ctx) => React.ReactNode;
};

const IMG = '/images/clase/';

/* Lo que aparece con cada clic. Antes de su paso se queda casi invisible en
   su sitio, así nada salta al aparecer. */
const V = ({ en, c, children, className = '' }: { en: number; c: Ctx; children: React.ReactNode; className?: string }) => (
  <div className={`cl-aparece${c.paso >= en ? ' cl-visto' : ''} ${className}`}>{children}</div>
);

/* Un dato que aún no existe. En modo edición se escribe; en directo, si está
   vacío, no se pinta nada. */
function Campo({ k, c, ayuda }: { k: string; c: Ctx; ayuda: string }) {
  const v = c.campos[k] ?? '';
  if (!c.editar) return v ? <span className="cl-campo">{v}</span> : null;
  return (
    <input
      className="cl-campo-edita"
      value={v}
      placeholder={ayuda}
      onChange={(ev) => c.setCampo(k, ev.target.value)}
      onClick={(ev) => ev.stopPropagation()}
      onKeyDown={(ev) => ev.stopPropagation()}
    />
  );
}

const TOTAL = 600;

function Reloj({ id, c, etiqueta }: { id: string; c: Ctx; etiqueta: string }) {
  const r = c.e.relojes[id];
  const queda = r ? (r.fin ? Math.max(0, Math.round((r.fin - c.ahora) / 1000)) : r.queda) : TOTAL;
  const m = Math.floor(queda / 60);
  const s = queda % 60;
  const corre = !!r?.fin && queda > 0;
  return (
    <div className="cl-reloj-caja" onClick={(ev) => ev.stopPropagation()}>
      <div className="cl-reloj-circulo">
        <svg className="cl-anillo" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" className="cl-anillo-fondo" />
          <circle cx="60" cy="60" r="54" className="cl-anillo-arco" style={{ strokeDashoffset: `${339.3 * (1 - queda / TOTAL)}` }} />
        </svg>
        <div className="cl-reloj-dentro">
          <span className="cl-reloj-cifra">{m}:{String(s).padStart(2, '0')}</span>
          <span className="cl-reloj-etq">{queda === 0 ? 'Empezamos' : etiqueta}</span>
        </div>
      </div>
      <div className="cl-reloj-botones">
        <button
          type="button"
          className="cl-boton"
          onClick={() =>
            c.set((x) => {
              const a = x.relojes[id] ?? { fin: null, queda: TOTAL };
              const n = a.fin
                ? { fin: null, queda: Math.max(0, Math.round((a.fin - Date.now()) / 1000)) }
                : { fin: Date.now() + a.queda * 1000, queda: a.queda };
              return { ...x, relojes: { ...x.relojes, [id]: n } };
            })
          }
        >
          {corre ? 'Pausar' : 'Empezar'}
        </button>
        <button type="button" className="cl-boton cl-boton-suave" onClick={() => c.set((x) => ({ ...x, relojes: { ...x.relojes, [id]: { fin: null, queda: TOTAL } } }))}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}

const DIAPOS: Diapo[] = [
  {
    id: 'espera',
    titulo: 'Espera · 10 minutos',
    fondo: 'foto',
    foto: 'hilos-42.jpg',
    pasos: 0,
    notas: 'Pantalla de espera. Ábrela 10 minutos antes. Pulsa «Empezar»: arrancan la cuenta atrás y la música. Saluda por su nombre a quien escribe en el chat. A las 21:00, flecha derecha.',
    pinta: (c) => (
      <div className="cl-fila cl-centro-v">
        <div className="cl-col" style={{ flex: 1 }}>
          <img className="cl-logo cl-entra-1" src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" />
          <p className="cl-rotulo cl-entra-2">Masterclass gratuita en directo</p>
          <h1 className="cl-h1 cl-entra-3">Desórdenes<br />Amorosos</h1>
          <p className="cl-lead cl-entra-4">Por qué repites la misma historia <b>y dónde empezó</b></p>
          <p className="cl-nota cl-entra-5">Mientras empezamos, escribe en el chat desde dónde nos ves.</p>
        </div>
        <Reloj id="espera" c={c} etiqueta="para empezar" />
      </div>
    ),
  },
  {
    id: 'gancho',
    titulo: 'Gancho · Los hilos',
    fondo: 'negro',
    pasos: 1,
    notas: 'Minuto 0 a 2 · Primero la pregunta. Clic: sube y aparece el vídeo; dale al play y no hables encima. Al acabar, Marco repite la frase despacio.',
    pinta: (c) => (
      <div className="cl-col cl-centro-v cl-centro-h">
        <h2 className={`cl-h2 cl-titular-vivo${c.paso >= 1 ? ' cl-arriba' : ''}`}>¿Y si no estás eligiendo <b>a quién amas?</b></h2>
        <V en={1} c={c}>
          <video className="cl-video" src="/video/los-hilos.mp4" poster="/images/los-hilos-poster.jpg" controls playsInline preload="metadata" onClick={(ev) => ev.stopPropagation()}>
            <track kind="subtitles" src="/video/los-hilos.es.vtt" srcLang="es" label="Español" default />
          </video>
        </V>
      </div>
    ),
  },
  {
    id: 'escala',
    titulo: 'Chat · del 1 al 10',
    fondo: 'oro',
    pasos: 0,
    notas: 'Minuto 3 a 4 · Iris. Pide un número del 1 al 10. Pulsa la barra de cada respuesta que llegue. Si alguien pone 9 o 10: «Hoy esta clase es para ti».',
    pinta: (c) => {
      const max = Math.max(1, ...c.e.escala);
      const total = c.e.escala.reduce((a, b) => a + b, 0);
      const media = total ? c.e.escala.reduce((a, v, i) => a + v * (i + 1), 0) / total : 0;
      return (
        <div className="cl-col">
          <p className="cl-rotulo cl-entra-1">Momento chat · escribe tu número</p>
          <h2 className="cl-h2 cl-oscuro cl-entra-2">Del 1 al 10: ¿cuánto se repite tu historia en el amor?</h2>
          <div className="cl-barras cl-entra-3" onClick={(ev) => ev.stopPropagation()}>
            {c.e.escala.map((v, i) => (
              <button key={i} type="button" className="cl-barra" onClick={() => c.set((s) => ({ ...s, escala: s.escala.map((x, j) => (j === i ? x + 1 : x)) }))} aria-label={`Sumar un voto al ${i + 1}`}>
                <span className="cl-barra-num">{v || ''}</span>
                <span className="cl-barra-col" style={{ height: `${(v / max) * 100}%` }} />
                <span className="cl-barra-etq">{i + 1}</span>
              </button>
            ))}
          </div>
          <p className="cl-nota cl-oscuro cl-media">{total ? <>Habéis respondido <b>{total}</b>. La media es <b>{media.toFixed(1)}</b>.</> : ''}</p>
        </div>
      );
    },
  },
  {
    id: 'dolores',
    titulo: 'Tres historias',
    fondo: 'arena',
    pasos: 3,
    notas: 'Minuto 4 a 6 · Iris. Cada clic descubre una historia. Pregunta: «¿Con cuál te reconoces?».',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Lo que nos contáis · Iris</p>
        <h2 className="cl-h3 cl-entra-2">Tres historias que llegan a consulta</h2>
        <div className="cl-tres">
          {[
            ['cena.jpg', 'De pareja a compañeros de piso', 'Llegaron los hijos y la pareja se apagó.'],
            ['bar.jpg', 'Cambias de persona y vuelve lo mismo', 'El mismo tipo, la misma discusión, el mismo final.'],
            ['foto-madre.jpg', 'Lo que se repite en la familia', 'Lo que vivió tu madre, lo estás viviendo tú.'],
          ].map(([f, t, d], i) => (
            <V key={f} en={i + 1} c={c} className="cl-carta">
              <figure className="cl-tarjeta-foto">
                <img src={IMG + f} alt="" />
                <figcaption><h3>{t}</h3><p>{d}</p></figcaption>
              </figure>
            </V>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'promesa',
    titulo: 'Lo que te llevas',
    fondo: 'vino',
    pasos: 3,
    notas: 'Minuto 6 a 7 · Iris. Una idea por clic, despacio.',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Lo que te llevas hoy</p>
        <h2 className="cl-h3 cl-entra-2">En una hora vas a ver tres cosas</h2>
        <div className="cl-pasos3">
          {[
            ['Por qué se repite', 'Cambias de persona y vuelve la misma historia. No es mala suerte.'],
            ['De dónde viene', 'El patrón tiene historia: se hereda dentro de la familia.'],
            ['Qué hacer con él', 'Lo primero es verlo. Hoy te enseñamos cómo.'],
          ].map(([t, d], i) => (
            <V key={t} en={i + 1} c={c} className="cl-paso3">
              <span className="cl-paso3-num">{i + 1}</span>
              <div><h3>{t}</h3><p>{d}</p></div>
            </V>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'quienes',
    titulo: 'Quién da la clase',
    fondo: 'arena',
    pasos: 2,
    notas: 'Minuto 7 a 10. Clic: Iris. Clic: Marco. Un minuto cada uno, como máximo: una historia personal corta vale más que un currículum.',
    pinta: (c) => (
      <div className="cl-col cl-centro-v">
        <p className="cl-rotulo cl-entra-1">Quién da la clase</p>
        <h2 className="cl-h3 cl-entra-2">Dos miradas sobre el mismo patrón</h2>
        <div className="cl-dos">
          <V en={1} c={c} className="cl-persona">
            <img src={IMG + 'iris.jpg'} alt="Iris Soares" />
            <div>
              <h3>Iris Soares</h3>
              <p className="cl-cargo">Terapeuta psicosomática clínica y numeróloga transgeneracional</p>
              <p>De dónde viene: lo que se repite en tu familia, leído a partir de las fechas de nacimiento.</p>
            </div>
          </V>
          <V en={2} c={c} className="cl-persona">
            <img src={IMG + 'marco.jpg'} alt="Marco Célio Sousa" />
            <div>
              <h3>Marco Célio Sousa</h3>
              <p className="cl-cargo">Psicólogo y terapeuta psicosomático clínico</p>
              <p>Cómo lo vives hoy: lo que sientes, lo que repites y lo que el cuerpo avisa.</p>
            </div>
          </V>
        </div>
      </div>
    ),
  },
  {
    id: 'clave1',
    titulo: 'Clave 1 · El amor',
    fondo: 'foto',
    foto: 'coche.jpg',
    pasos: 3,
    notas: 'Minuto 10 a 15 · Marco. Cada clic, una repetición. Un ejemplo de consulta sin datos que identifiquen a nadie.',
    pinta: (c) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo cl-entra-1">Clave 1 · Marco</p>
        <h2 className="cl-h2 cl-entra-2">Casi todo empieza <b>en el amor.</b></h2>
        <div className="cl-repite">
          {['La misma persona, con otra cara.', 'La misma discusión, por el mismo motivo.', 'El mismo final, aunque cambie todo lo demás.'].map((t, i) => (
            <V key={t} en={i + 1} c={c} className="cl-repite-linea"><span>{i + 1}</span><p>{t}</p></V>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'frases',
    titulo: 'Chat · vuestras frases',
    fondo: 'oro',
    pasos: 0,
    notas: 'Minuto 15 a 16. Escribe aquí abajo las frases que lleguen al chat (sin nombres) y pulsa Intro: aparecen en pantalla. Al final únelas: «Distintas personas, la misma frase».',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Momento chat · escribe tu frase</p>
        <h2 className="cl-h2 cl-oscuro cl-entra-2">¿Qué frase se repite en tus relaciones?</h2>
        <div className="cl-nube">
          {c.e.frases.map((f, i) => (
            <span key={`${i}-${f}`} className="cl-burbuja" style={{ ['--g' as string]: `${((i * 37) % 7) - 3}deg` }}>«{f}»</span>
          ))}
        </div>
        <form
          className="cl-nueva-frase"
          onClick={(ev) => ev.stopPropagation()}
          onSubmit={(ev) => {
            ev.preventDefault();
            const inp = ev.currentTarget.elements.namedItem('frase') as HTMLInputElement;
            const v = inp.value.trim();
            if (v) c.set((s) => ({ ...s, frases: [...s.frases, v].slice(-10) }));
            inp.value = '';
          }}
        >
          <input id="frase" name="frase" placeholder="Escribe una frase del chat y pulsa Intro" autoComplete="off" onKeyDown={(ev) => ev.stopPropagation()} />
        </form>
      </div>
    ),
  },
  {
    id: 'clave2',
    titulo: 'Clave 2 · Se hereda',
    fondo: 'foto',
    foto: 'tres-generaciones.jpg',
    pasos: 3,
    notas: 'Minuto 16 a 21 · Iris. Un clic por generación. Son patrones, no culpables.',
    pinta: (c) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo cl-entra-1">Clave 2 · Iris</p>
        <h2 className="cl-h2 cl-entra-2">El patrón tiene historia. <b>Se hereda.</b></h2>
        <div className="cl-repite">
          {[['La abuela', 'aguantó y no dijo nada.'], ['La madre', 'eligió al mismo tipo de persona.'], ['La hija', 'jura que ella no lo repetirá.']].map(([q, t], i) => (
            <V key={q} en={i + 1} c={c} className="cl-repite-linea"><span>{i + 1}</span><p><b>{q}</b> {t}</p></V>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'ejercicio',
    titulo: 'Ejercicio · tres generaciones',
    fondo: 'arena',
    pasos: 0,
    notas: 'Minuto 21 a 27 · Iris. Pide a una persona del chat la edad a la que se emparejó su abuela, su madre y ella. Escríbelas: la línea enseña si se repite. Después Iris explica el cálculo con las fechas de nacimiento.',
    pinta: (c) => {
      const nums = c.e.edades.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
      const repite = nums.length === 3 && Math.max(...nums) - Math.min(...nums) <= 3;
      const quien = ['Su abuela', 'Su madre', 'Ella'];
      return (
        <div className="cl-fila cl-centro-v">
          <div className="cl-col" style={{ flex: 1 }}>
            <p className="cl-rotulo cl-entra-1">Ejercicio en directo</p>
            <h2 className="cl-h3 cl-entra-2">¿A qué edad se emparejó cada una?</h2>
            <div className="cl-edades cl-entra-3" onClick={(ev) => ev.stopPropagation()}>
              {quien.map((q, i) => (
                <label key={q} className="cl-edad">
                  <span>{q}</span>
                  <input
                    id={`edad-${i}`}
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="—"
                    value={c.e.edades[i]}
                    onChange={(ev) => {
                      const v = ev.target.value.replace(/\D/g, '').slice(0, 2);
                      c.set((s) => { const ed = [...s.edades] as Estado['edades']; ed[i] = v; return { ...s, edades: ed }; });
                    }}
                    onKeyDown={(ev) => ev.stopPropagation()}
                  />
                </label>
              ))}
            </div>
            <div className="cl-regla" aria-hidden="true">
              {c.e.edades.map((x, i) => {
                const n = parseInt(x, 10);
                if (Number.isNaN(n)) return null;
                const pos = Math.min(100, Math.max(0, ((n - 14) / (45 - 14)) * 100));
                return <span key={i} className={`cl-punto cl-punto-${i}`} style={{ left: `${pos}%` }}>{quien[i]} · {n}</span>;
              })}
              <span className="cl-regla-ini">14 años</span>
              <span className="cl-regla-fin">45 años</span>
            </div>
            <p className={`cl-veredicto${repite ? ' cl-si' : ''}`}>
              {nums.length < 3 ? '' : repite ? 'Se repite: casi la misma edad en tres generaciones.' : 'Edades distintas. Miramos ahora el tipo de pareja y cómo acabó.'}
            </p>
          </div>
          <img className="cl-foto-lado cl-entra-2" src={IMG + 'foto-madre.jpg'} alt="Una mujer mira la foto de boda de su madre" />
        </div>
      );
    },
  },
  {
    id: 'clave3',
    titulo: 'Clave 3 · La madre araña',
    fondo: 'foto',
    foto: 'madre-hija.jpg',
    pasos: 2,
    notas: 'Minuto 27 a 31 · Marco. Fue el tema con más interés en la campaña. La madre no es la mala de la historia: también repite algo que aprendió.',
    pinta: (c) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo cl-entra-1">Clave 3 · Marco</p>
        <h2 className="cl-h2 cl-entra-2">El amor que <b>no deja marchar.</b></h2>
        <V en={1} c={c}><p className="cl-lead">Hay madres que no dejan marchar. No con gritos: con culpa.</p></V>
        <V en={2} c={c}><p className="cl-lead">Y el hijo o la hija acaba eligiendo parejas que nunca terminan de encajar.</p></V>
      </div>
    ),
  },
  {
    id: 'cuerpo',
    titulo: 'El cuerpo avisa',
    fondo: 'foto',
    foto: 'cama.jpg',
    pasos: 3,
    notas: 'Minuto 31 a 33 · Marco. Un clic por señal. Sin diagnósticos a nadie del chat ni nombres de enfermedades.',
    pinta: (c) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo cl-entra-1">Lo que dice el cuerpo</p>
        <h2 className="cl-h2 cl-entra-2">El cuerpo <b>también avisa.</b></h2>
        <div className="cl-chips">
          {['El nudo en el estómago', 'La tensión que no se va', 'El cansancio de siempre'].map((t, i) => (
            <V key={t} en={i + 1} c={c} className="cl-chip">{t}</V>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'claves-voto',
    titulo: 'Chat · ¿en qué clave?',
    fondo: 'oro',
    pasos: 0,
    notas: 'Minuto 33 a 34. Pulsa cada 1, 2 o 3 que llegue al chat. La más votada te dice qué parte del curso destacar.',
    pinta: (c) => {
      const ops = ['Es un patrón', 'Se hereda', 'No deja marchar'];
      const total = c.e.claves.reduce((a, b) => a + b, 0);
      return (
        <div className="cl-col">
          <p className="cl-rotulo cl-entra-1">Momento chat · escribe 1, 2 o 3</p>
          <h2 className="cl-h2 cl-oscuro cl-entra-2">¿En qué clave te has reconocido?</h2>
          <div className="cl-votos cl-entra-3" onClick={(ev) => ev.stopPropagation()}>
            {ops.map((o, i) => {
              const pct = total ? Math.round((c.e.claves[i] / total) * 100) : 0;
              return (
                <button key={o} type="button" className="cl-voto" onClick={() => c.set((s) => ({ ...s, claves: s.claves.map((x, j) => (j === i ? x + 1 : x)) }))}>
                  <span className="cl-voto-relleno" style={{ width: `${pct}%` }} />
                  <span className="cl-voto-txt"><b>{i + 1}</b> · {o}</span>
                  <span className="cl-voto-pct">{total ? `${pct} %` : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'preguntas',
    titulo: 'Preguntas · 10 minutos',
    fondo: 'vino',
    pasos: 0,
    notas: 'Minuto 34 a 44 · Pulsa «Empezar». 10 minutos de preguntas y de hablar con las personas del chat, por su nombre. Al acabar, flecha derecha: el vídeo.',
    pinta: (c) => (
      <div className="cl-fila cl-centro-v">
        <div className="cl-col" style={{ flex: 1 }}>
          <p className="cl-rotulo cl-entra-1">Tu turno</p>
          <h2 className="cl-h2 cl-entra-2">Pregúntanos <b>lo que quieras.</b></h2>
          <p className="cl-lead cl-entra-3">Escribe tu pregunta en el chat. Hablamos contigo, en directo.</p>
        </div>
        <Reloj id="preguntas" c={c} etiqueta="de preguntas" />
      </div>
    ),
  },
  {
    id: 'video-puente',
    titulo: 'Vídeo antes del curso',
    fondo: 'negro',
    pasos: 0,
    notas: 'Minuto 44 a 45 · El vídeo da paso a la venta: play y silencio. Mientras el vídeo nuevo no esté en la web, se ve «Los hilos».',
    pinta: () => (
      <div className="cl-col cl-centro-v cl-centro-h">
        <video className="cl-video cl-video-grande cl-entra-1" controls playsInline preload="metadata" poster="/images/los-hilos-poster.jpg" onClick={(ev) => ev.stopPropagation()}>
          <source src="/video/puente-curso.mp4" type="video/mp4" />
          <source src="/video/los-hilos.mp4" type="video/mp4" />
        </video>
      </div>
    ),
  },
  {
    id: 'puente',
    titulo: 'Y ahora',
    fondo: 'foto',
    foto: 'hilos-77.jpg',
    pasos: 1,
    notas: 'Minuto 45 · Iris. Primero la frase. Clic: la segunda parte. Pide permiso: «¿Os cuento cómo seguimos trabajando esto?». Espera un sí en el chat.',
    pinta: (c) => (
      <div className="cl-col cl-izq cl-centro-v">
        <p className="cl-rotulo cl-entra-1">Y ahora</p>
        <h2 className="cl-h2 cl-entra-2">Verlo es el primer paso.</h2>
        <V en={1} c={c}><h2 className="cl-h2"><b>Cambiarlo lleva más de una hora.</b></h2></V>
      </div>
    ),
  },
  {
    id: 'curso',
    titulo: 'El curso · fechas y propuesta',
    fondo: 'vino',
    pasos: 1,
    notas: 'Minuto 45 a 48 · Marco. Antes de la clase, en modo edición (tecla N), escribe la frase del curso, las fechas, el horario, la duración y la modalidad. Lo vacío no se ve.',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">La propuesta</p>
        <h2 className="cl-h2 cl-entra-2">Curso <b>Desórdenes Amorosos</b></h2>
        <p className="cl-lead cl-entra-3"><Campo k="curso-frase" c={c} ayuda="Lo que consigues al terminar el curso, en una frase" /></p>
        <V en={1} c={c} className="cl-datos">
          {[['Fechas', 'curso-fechas'], ['Horario', 'curso-horario'], ['Duración', 'curso-duracion'], ['Modalidad', 'curso-modalidad']].map(([t, k]) =>
            c.editar || c.campos[k] ? (
              <div key={k} className="cl-dato"><span className="cl-rotulo">{t}</span><Campo k={k} c={c} ayuda={t} /></div>
            ) : null,
          )}
        </V>
        <p className="cl-nota cl-entra-4">Con Iris Soares y Marco Célio Sousa</p>
      </div>
    ),
  },
  {
    id: 'para-quien',
    titulo: '¿Es para ti?',
    fondo: 'arena',
    pasos: 2,
    notas: 'Minuto 48 a 49 · Marco. Clic: para quién es. Clic: para quién no. Sin presión.',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Para que lo decidas con calma</p>
        <h2 className="cl-h3 cl-entra-2">¿Es para ti?</h2>
        <div className="cl-dos">
          <V en={1} c={c} className="cl-caja">
            <p className="cl-rotulo">Es para ti si</p>
            <ul className="cl-puntos">
              <li>Cambias de pareja y vuelve la misma historia.</li>
              <li>Sientes que vives la vida de otra persona.</li>
              <li>Quieres entender de dónde viene, no solo aguantarlo.</li>
            </ul>
          </V>
          <V en={2} c={c} className="cl-caja">
            <p className="cl-rotulo">No es para ti si</p>
            <ul className="cl-puntos">
              <li>Buscas una solución mágica en una semana.</li>
              <li>No quieres mirar tu historia familiar.</li>
              <li>Esperas que cambie la otra persona y no tú.</li>
            </ul>
          </V>
        </div>
      </div>
    ),
  },
  {
    id: 'precio',
    titulo: 'Precio',
    fondo: 'vino',
    pasos: 2,
    notas: 'Minuto 49 a 52 · Iris presenta, Marco remata. Clic: el curso. Clic: la terapia grupal. Di cada precio una vez y calla dos segundos. Nada de cuentas atrás ni plazas inventadas.',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Tu siguiente paso</p>
        <h2 className="cl-h3 cl-entra-2">Elige cómo seguir con nosotros</h2>
        <div className="cl-precios">
          <V en={1} c={c} className="cl-precio cl-precio-top">
            <p className="cl-rotulo">El recomendado · Curso completo</p>
            <p className="cl-cifra">1.297 €</p>
            <p>En 3 pagos de 432,33 €<br />o <b>desde 233 € al mes</b> (6 meses · 1.397 € en total)</p>
          </V>
          <V en={2} c={c} className="cl-precio">
            <p className="cl-rotulo">Para empezar en grupo · Terapia grupal</p>
            <p className="cl-cifra">111 €</p>
            <p>Una sesión de 2 horas al mes, en grupo.</p>
          </V>
        </div>
      </div>
    ),
  },
  {
    id: 'como',
    titulo: 'Cómo apuntarte',
    fondo: 'arena',
    pasos: 3,
    notas: 'Minuto 52 a 55. Escribe antes, en modo edición (tecla N), el enlace de pago. Pégalo también en el chat y en el grupo de WhatsApp mientras hablas.',
    pinta: (c) => (
      <div className="cl-col">
        <p className="cl-rotulo cl-entra-1">Cómo apuntarte</p>
        <h2 className="cl-h3 cl-entra-2">Tres pasos</h2>
        <div className="cl-pasos3 cl-pasos3-claro">
          <V en={1} c={c} className="cl-paso3"><span className="cl-paso3-num">1</span><div><h3>Entra en el enlace</h3><p>{c.campos['pago-enlace'] || c.editar ? <Campo k="pago-enlace" c={c} ayuda="Enlace corto de pago" /> : 'Te lo dejamos ahora en el chat.'}</p></div></V>
          <V en={2} c={c} className="cl-paso3"><span className="cl-paso3-num">2</span><div><h3>Elige cómo pagar</h3><p>En 3 pagos o desde 233 € al mes.</p></div></V>
          <V en={3} c={c} className="cl-paso3"><span className="cl-paso3-num">3</span><div><h3>Te llega el acceso</h3><p>Por correo, al momento.</p></div></V>
        </div>
      </div>
    ),
  },
  {
    id: 'pdf',
    titulo: 'La guía en PDF',
    fondo: 'oro',
    pasos: 1,
    notas: 'Minuto 55 a 58 · Marco. Solo después de vender el curso y para quien aún no lo compra. Una frase y al cierre. El título y el precio se escriben antes en modo edición (tecla N).',
    pinta: (c) => (
      <div className="cl-col cl-centro-v">
        <p className="cl-rotulo cl-entra-1">Antes de irte</p>
        <h2 className="cl-h2 cl-oscuro cl-entra-2">¿Aún no es tu momento?</h2>
        <V en={1} c={c}>
          <p className="cl-lead cl-oscuro">Llévate la guía <Campo k="pdf-titulo" c={c} ayuda="Título de la guía" /> en PDF y sigue mirando tu patrón a tu ritmo. <Campo k="pdf-precio" c={c} ayuda="Precio (20-30 €)" /></p>
          <p className="cl-nota cl-oscuro">El enlace, en el grupo de WhatsApp.</p>
        </V>
      </div>
    ),
  },
  {
    id: 'gracias',
    titulo: 'Gracias',
    fondo: 'foto',
    foto: 'hilos-67.jpg',
    pasos: 0,
    notas: 'Minuto 58 a 60. Despedida corta y cálida. Cierra a la hora.',
    pinta: () => (
      <div className="cl-col cl-izq cl-centro-v">
        <img className="cl-logo cl-entra-1" src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" />
        <h2 className="cl-h2 cl-entra-2">Gracias <b>por quedarte.</b></h2>
        <p className="cl-lead cl-entra-3">Seguimos en el grupo de WhatsApp de la masterclass.</p>
        <p className="cl-nota cl-entra-4">Iris Soares · Marco Célio Sousa · Escuela de Sabiduría 33</p>
      </div>
    ),
  },
];

const INICIAL: Estado = { escala: Array(10).fill(0), claves: [0, 0, 0], edades: ['', '', ''], frases: [], relojes: {} };
const LLAVE = 'clase-desordenes-campos';

export default function Clase() {
  const [i, setI] = useState(0);
  const [paso, setPaso] = useState(0);
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [notas, setNotas] = useState(false);
  const [indice, setIndice] = useState(false);
  const [escala, setEscala] = useState(1);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [ahora, setAhora] = useState(() => Date.now());
  const [musica, setMusica] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const d = DIAPOS[i];

  useEffect(() => {
    try { setCampos(JSON.parse(localStorage.getItem(LLAVE) || '{}')); } catch { /* sin almacenamiento: campos vacíos */ }
  }, []);
  const setCampo = useCallback((k: string, v: string) => {
    setCampos((c) => {
      const n = { ...c, [k]: v };
      try { localStorage.setItem(LLAVE, JSON.stringify(n)); } catch { /* no pasa nada */ }
      return n;
    });
  }, []);

  useEffect(() => {
    const medir = () => setEscala(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  useEffect(() => {
    const leer = () => {
      const n = parseInt(window.location.hash.slice(1), 10);
      if (n >= 1 && n <= DIAPOS.length) { setI(n - 1); setPaso(0); }
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => window.removeEventListener('hashchange', leer);
  }, []);
  useEffect(() => { window.history.replaceState(null, '', `#${i + 1}`); }, [i]);

  /* El reloj de las cuentas atrás. */
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  /* La música suena en la pantalla de espera y se apaga despacio al salir. */
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (d.id === 'espera' && musica) {
      a.volume = 0.55;
      a.play().catch(() => setMusica(false));
      return;
    }
    let v = a.volume;
    const t = setInterval(() => {
      v = Math.max(0, v - 0.05);
      a.volume = v;
      if (v === 0) { a.pause(); clearInterval(t); }
    }, 80);
    return () => clearInterval(t);
  }, [d.id, musica]);

  /* Al empezar la cuenta atrás de la espera arranca también la música: el
     clic en «Empezar» es el gesto que el navegador pide para sonar. */
  const esperaEmpezada = !!estado.relojes.espera?.fin;
  useEffect(() => {
    if (esperaEmpezada) setMusica(true);
  }, [esperaEmpezada]);

  const ir = useCallback((n: number, alFinal = false) => {
    const k = Math.max(0, Math.min(DIAPOS.length - 1, n));
    setI(k);
    setPaso(alFinal ? DIAPOS[k].pasos : 0);
  }, []);
  const siguiente = useCallback(() => (paso < d.pasos ? setPaso(paso + 1) : ir(i + 1)), [paso, d.pasos, i, ir]);
  const anterior = useCallback(() => (paso > 0 ? setPaso(paso - 1) : ir(i - 1, true)), [paso, i, ir]);

  const pantallaCompleta = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else raiz.current?.requestFullscreen();
    } catch { /* algunos navegadores no la dejan */ }
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); siguiente(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); anterior(); }
      else if (e.key === 'f' || e.key === 'F') pantallaCompleta();
      else if (e.key === 'n' || e.key === 'N') setNotas((x) => !x);
      else if (e.key === 'g' || e.key === 'G') setIndice((x) => !x);
      else if (e.key === 'Escape') setIndice(false);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [siguiente, anterior, pantallaCompleta]);

  const clic = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left > r.width * 0.3) siguiente();
    else anterior();
  };

  const progreso = useMemo(() => ((i + (d.pasos ? paso / (d.pasos + 1) : 0)) / (DIAPOS.length - 1)) * 100, [i, paso, d.pasos]);
  const ctx: Ctx = { paso, e: estado, set: setEstado, editar: notas, campos, setCampo, ahora };

  return (
    <div className="cl-raiz" ref={raiz}>
      <audio ref={audio} src="/audio/espera.mp3" loop preload="auto" />
      <div className="cl-escenario" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
        <section key={d.id} className={`cl-diapo cl-${d.fondo}`} onClick={clic}>
          {d.foto && <img className="cl-fondo" src={IMG + d.foto} alt="" />}
          <div className="cl-contenido">{d.pinta(ctx)}</div>
          <p className="cl-pie">Desórdenes Amorosos · Escuela de Sabiduría 33</p>
          {d.pasos > 0 && (
            <div className="cl-puntitos" aria-hidden="true">
              {Array.from({ length: d.pasos + 1 }).map((_, k) => <span key={k} className={k <= paso ? 'cl-on' : ''} />)}
            </div>
          )}
        </section>
      </div>

      <div className="cl-progreso" aria-hidden="true"><span style={{ width: `${progreso}%` }} /></div>

      <nav className="cl-mandos" aria-label="Controles de la presentación">
        <button type="button" onClick={anterior} aria-label="Anterior">‹</button>
        <span className="cl-contador">{i + 1} / {DIAPOS.length}</span>
        <button type="button" onClick={siguiente} aria-label="Siguiente">›</button>
        <button type="button" onClick={() => setMusica((x) => !x)} aria-pressed={musica}>Música</button>
        <button type="button" onClick={() => setIndice((x) => !x)}>Índice</button>
        <button type="button" onClick={() => setNotas((x) => !x)} aria-pressed={notas}>Notas y edición</button>
        <button type="button" onClick={pantallaCompleta}>Pantalla completa</button>
      </nav>

      {notas && (
        <aside className="cl-notas">
          <p className="cl-rotulo">Notas · {i + 1} · {d.titulo}</p>
          <p>{d.notas}</p>
        </aside>
      )}

      {indice && (
        <div className="cl-indice" role="dialog" aria-label="Índice de diapositivas">
          {DIAPOS.map((x, k) => (
            <button key={x.id} type="button" className={k === i ? 'cl-actual' : ''} onClick={() => { ir(k); setIndice(false); }}>
              <span>{k + 1}</span> {x.titulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
