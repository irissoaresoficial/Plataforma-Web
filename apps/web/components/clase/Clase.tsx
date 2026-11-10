'use client';

/**
 * LA PRESENTACIÓN DE LA MASTERCLASS «DESÓRDENES AMOROSOS».
 *
 * Un lienzo de 1920×1080 que se escala a la pantalla, como un Keynote. Se
 * maneja con el teclado o con clics:
 *   → / espacio / clic en la mitad derecha  siguiente paso
 *   ← / clic en la mitad izquierda          paso anterior
 *   F  pantalla completa · N  notas para quien presenta · G  índice
 *
 * Lo interactivo es lo que pasa en directo: las votaciones del chat (quien
 * presenta pulsa cada respuesta que llega y las barras crecen), el ejercicio de
 * las tres generaciones (se escriben las edades y se ve si se repiten) y el
 * reloj de las preguntas. No hay ningún dato inventado: lo que Iris y Marco
 * aún no han decidido sale marcado como PENDIENTE, en rojo, como en toda la web.
 *
 * Las imágenes son nuevas (generadas el 10 de noviembre para la campaña) y
 * tres fotogramas de «Los hilos». Están en `public/images/clase/`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './clase.css';

type Fondo = 'vino' | 'arena' | 'oro' | 'foto';

type Estado = {
  escala: number[];
  claves: number[];
  edades: [string, string, string];
  reloj: { corriendo: boolean; quedan: number };
};

type Diapo = {
  id: string;
  fondo: Fondo;
  pasos?: number;
  notas: string;
  foto?: string;
  pinta: (paso: number, e: Estado, set: (f: (e: Estado) => Estado) => void) => React.ReactNode;
};

const IMG = '/images/clase/';
const Pendiente = ({ children }: { children: React.ReactNode }) => <span className="cl-pendiente">PENDIENTE · {children}</span>;
const Ver = ({ desde, paso, children, como = 'div' }: { desde: number; paso: number; children: React.ReactNode; como?: 'div' | 'li' }) => {
  const C = como;
  return <C className={`cl-aparece${paso >= desde ? ' cl-visto' : ''}`}>{children}</C>;
};

const DIAPOS: Diapo[] = [
  {
    id: 'portada',
    fondo: 'foto',
    foto: 'hilos-42.jpg',
    notas: 'Pantalla de espera. Ponla 10 minutos antes de las 21:00. Empieza a las 21:02 como tarde.',
    pinta: () => (
      <div className="cl-col cl-izq cl-centro-v">
        <img className="cl-logo" src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" />
        <p className="cl-rotulo">Masterclass gratuita en directo</p>
        <h1 className="cl-h1">Desórdenes<br />Amorosos</h1>
        <p className="cl-lead">Por qué repites la misma historia <b>y dónde empezó</b></p>
        <div className="cl-pildoras">
          <span className="cl-pildora">Jueves 26 de noviembre · 21:00 (España)</span>
          <span className="cl-pildora">Iris Soares · Marco Célio Sousa</span>
        </div>
      </div>
    ),
  },
  {
    id: 'gancho',
    fondo: 'vino',
    notas: 'Minuto 0 a 2 · El vídeo «Los hilos» primero, sin hablar encima. Al acabar, Marco dice la frase despacio y deja dos segundos de silencio.',
    pinta: () => (
      <div className="cl-fila cl-centro-v">
        <div className="cl-col" style={{ flex: 1 }}>
          <p className="cl-rotulo">Empezamos</p>
          <h2 className="cl-h2">¿Y si no estás eligiendo <b>a quién amas?</b></h2>
          <p className="cl-lead">Vivimos movidos por hilos que vienen de antes que nosotros.</p>
        </div>
        <video className="cl-video" src="/video/los-hilos.mp4" poster="/images/los-hilos-poster.jpg" controls playsInline preload="metadata">
          <track kind="subtitles" src="/video/los-hilos.es.vtt" srcLang="es" label="Español" default />
        </video>
      </div>
    ),
  },
  {
    id: 'escala',
    fondo: 'oro',
    notas: 'Minuto 3 a 4 · Iris. Pide que escriban del 1 al 10. Pulsa el número de cada respuesta que llegue: las barras crecen en directo. Si alguien pone 9 o 10: «Hoy esta clase es para ti».',
    pinta: (_p, e, set) => {
      const max = Math.max(1, ...e.escala);
      const total = e.escala.reduce((a, b) => a + b, 0);
      const media = total ? e.escala.reduce((a, v, i) => a + v * (i + 1), 0) / total : 0;
      return (
        <div className="cl-col">
          <p className="cl-rotulo">Momento chat</p>
          <h2 className="cl-h2 cl-oscuro">Del 1 al 10: ¿cuánto se repite tu historia en el amor?</h2>
          <div className="cl-barras" onClick={(ev) => ev.stopPropagation()}>
            {e.escala.map((v, i) => (
              <button
                key={i}
                type="button"
                className="cl-barra"
                onClick={() => set((s) => ({ ...s, escala: s.escala.map((x, j) => (j === i ? x + 1 : x)) }))}
                aria-label={`Sumar un voto al ${i + 1}`}
              >
                <span className="cl-barra-num">{v || ''}</span>
                <span className="cl-barra-col" style={{ height: `${(v / max) * 100}%` }} />
                <span className="cl-barra-etq">{i + 1}</span>
              </button>
            ))}
          </div>
          <p className="cl-nota cl-oscuro">
            {total ? <>Habéis respondido <b>{total}</b>. La media es <b>{media.toFixed(1)}</b>.</> : 'Escribe tu número en el chat.'}
          </p>
        </div>
      );
    },
  },
  {
    id: 'dolores',
    fondo: 'arena',
    pasos: 3,
    notas: 'Minuto 4 a 6 · Iris. Cada clic descubre una historia. Pregunta: «¿Con cuál te reconoces?». Sin nombres ni detalles que identifiquen a nadie.',
    pinta: (p) => (
      <div className="cl-col">
        <p className="cl-rotulo">Lo que nos contáis · Iris</p>
        <h2 className="cl-h3">Tres historias que llegan a consulta</h2>
        <div className="cl-tres">
          {[
            ['cena.jpg', 'De pareja a compañeros de piso', 'Llegaron los hijos y la pareja se apagó.'],
            ['bar.jpg', 'Cambias de persona, vuelve lo mismo', 'El mismo tipo, la misma discusión, el mismo final.'],
            ['foto-madre.jpg', 'Lo que se repite en la familia', 'Lo que vivió tu madre, lo estás viviendo tú.'],
          ].map(([f, t, d], i) => (
            <Ver key={f} desde={i + 1} paso={p}>
              <figure className="cl-tarjeta-foto">
                <img src={IMG + f} alt="" />
                <figcaption>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </figcaption>
              </figure>
            </Ver>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'promesa',
    fondo: 'vino',
    pasos: 3,
    notas: 'Minuto 6 a 7 · Iris. La promesa de la clase: una línea por clic, despacio.',
    pinta: (p) => (
      <div className="cl-col">
        <p className="cl-rotulo">Lo que te llevas hoy</p>
        <h2 className="cl-h3">En una hora vas a ver tres cosas</h2>
        <ol className="cl-lista">
          <Ver como="li" desde={1} paso={p}><b>Por qué se repite.</b> Cambias de persona y vuelve la misma historia. No es mala suerte.</Ver>
          <Ver como="li" desde={2} paso={p}><b>De dónde viene.</b> El patrón tiene historia: se hereda dentro de la familia.</Ver>
          <Ver como="li" desde={3} paso={p}><b>Qué hacer con él.</b> Lo primero es verlo. Hoy te enseñamos cómo.</Ver>
        </ol>
      </div>
    ),
  },
  {
    id: 'quienes',
    fondo: 'arena',
    notas: 'Minuto 7 a 10. Un minuto cada uno, como máximo. Una historia personal corta vale más que un currículum.',
    pinta: () => (
      <div className="cl-col cl-centro-v">
        <p className="cl-rotulo">Quién da la clase</p>
        <h2 className="cl-h3">Dos miradas sobre el mismo patrón</h2>
        <div className="cl-dos">
          <div className="cl-persona">
            <img src={IMG + 'iris.jpg'} alt="Iris Soares" />
            <div>
              <h3>Iris Soares</h3>
              <p className="cl-cargo">Terapeuta psicosomática clínica y numeróloga transgeneracional</p>
              <p>De dónde viene: lo que se repite en tu familia, leído a partir de las fechas de nacimiento.</p>
            </div>
          </div>
          <div className="cl-persona">
            <img src={IMG + 'marco.jpg'} alt="Marco Célio Sousa" />
            <div>
              <h3>Marco Célio Sousa</h3>
              <p className="cl-cargo">Psicólogo y terapeuta psicosomático clínico</p>
              <p>Cómo lo vives hoy: lo que sientes, lo que repites y lo que el cuerpo avisa.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'clave1',
    fondo: 'foto',
    foto: 'coche.jpg',
    pasos: 3,
    notas: 'Minuto 10 a 15 · Marco. «Casi todo empieza en el amor». Cada clic, una repetición. Un ejemplo de consulta sin datos que identifiquen a nadie.',
    pinta: (p) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo">Clave 1 · Marco</p>
        <h2 className="cl-h2">Casi todo empieza <b>en el amor.</b></h2>
        <ul className="cl-lista cl-lista-corta">
          <Ver como="li" desde={1} paso={p}>La misma persona, con otra cara.</Ver>
          <Ver como="li" desde={2} paso={p}>La misma discusión, por el mismo motivo.</Ver>
          <Ver como="li" desde={3} paso={p}>El mismo final, aunque cambie todo lo demás.</Ver>
        </ul>
      </div>
    ),
  },
  {
    id: 'frase',
    fondo: 'oro',
    notas: 'Minuto 15 a 16. Deja 60 segundos. Lee tres o cuatro frases y únelas: «Distintas personas, la misma frase».',
    pinta: () => (
      <div className="cl-col cl-centro-v">
        <p className="cl-rotulo">Momento chat</p>
        <h2 className="cl-h2 cl-oscuro">¿Qué frase se repite en tus relaciones?</h2>
        <p className="cl-lead cl-oscuro">Escríbela en el chat. Leemos algunas en voz alta, sin nombres.</p>
      </div>
    ),
  },
  {
    id: 'clave2',
    fondo: 'foto',
    foto: 'tres-generaciones.jpg',
    pasos: 3,
    notas: 'Minuto 16 a 21 · Iris. Empieza la numerología transgeneracional. Son patrones, no culpables.',
    pinta: (p) => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo">Clave 2 · Iris</p>
        <h2 className="cl-h2">El patrón tiene historia. <b>Se hereda.</b></h2>
        <ul className="cl-lista cl-lista-corta">
          <Ver como="li" desde={1} paso={p}><b>La abuela</b> aguantó y no dijo nada.</Ver>
          <Ver como="li" desde={2} paso={p}><b>La madre</b> eligió al mismo tipo de persona.</Ver>
          <Ver como="li" desde={3} paso={p}><b>La hija</b> jura que ella no lo repetirá.</Ver>
        </ul>
      </div>
    ),
  },
  {
    id: 'ejercicio',
    fondo: 'arena',
    notas: 'Minuto 21 a 27 · Iris. Pide en el chat la edad a la que se emparejó cada una (abuela, madre y la persona). Escríbelas aquí con un voluntario: la línea muestra si se repite. El cálculo con las fechas de nacimiento lo explica Iris en directo.',
    pinta: (_p, e, set) => {
      const nums = e.edades.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
      const repite = nums.length === 3 && Math.max(...nums) - Math.min(...nums) <= 3;
      const quien = ['Tu abuela', 'Tu madre', 'Tú'];
      return (
        <div className="cl-fila cl-centro-v">
          <div className="cl-col" style={{ flex: 1 }}>
            <p className="cl-rotulo">Ejercicio en directo</p>
            <h2 className="cl-h3">¿A qué edad se emparejó cada una?</h2>
            <div className="cl-edades" onClick={(ev) => ev.stopPropagation()}>
              {quien.map((q, i) => (
                <label key={q} className="cl-edad">
                  <span>{q}</span>
                  <input
                    id={`edad-${i}`}
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="—"
                    value={e.edades[i]}
                    onChange={(ev) => {
                      const v = ev.target.value.replace(/\D/g, '').slice(0, 2);
                      set((s) => {
                        const ed = [...s.edades] as Estado['edades'];
                        ed[i] = v;
                        return { ...s, edades: ed };
                      });
                    }}
                    onKeyDown={(ev) => ev.stopPropagation()}
                  />
                  <span className="cl-anos">años</span>
                </label>
              ))}
            </div>
            <div className="cl-regla" aria-hidden="true">
              {nums.length > 0 &&
                e.edades.map((x, i) => {
                  const n = parseInt(x, 10);
                  if (Number.isNaN(n)) return null;
                  const pos = Math.min(100, Math.max(0, ((n - 14) / (45 - 14)) * 100));
                  return (
                    <span key={i} className={`cl-punto cl-punto-${i}`} style={{ left: `${pos}%` }}>
                      {quien[i]} · {n}
                    </span>
                  );
                })}
              <span className="cl-regla-ini">14</span>
              <span className="cl-regla-fin">45</span>
            </div>
            <p className={`cl-veredicto${repite ? ' cl-si' : ''}`}>
              {nums.length < 3 ? 'Escribe las tres edades.' : repite ? 'Se repite: casi la misma edad en tres generaciones.' : 'Edades distintas. Miramos ahora el tipo de pareja y cómo acabó.'}
            </p>
          </div>
          <img className="cl-foto-lado" src={IMG + 'foto-madre.jpg'} alt="Una mujer mira la foto de boda de su madre" />
        </div>
      );
    },
  },
  {
    id: 'clave3',
    fondo: 'foto',
    foto: 'madre-hija.jpg',
    notas: 'Minuto 27 a 31 · Marco. El síndrome de la madre araña: fue el tema con más interés en la campaña. La madre no es la mala de la historia: también repite algo que aprendió.',
    pinta: () => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo">Clave 3 · Marco</p>
        <h2 className="cl-h2">El amor que <b>no deja marchar.</b></h2>
        <p className="cl-lead">Hay madres que no dejan marchar. No con gritos: con culpa. Y el hijo o la hija acaba eligiendo parejas que nunca terminan de encajar.</p>
        <p className="cl-nota"><Pendiente>las tres señales de la madre araña que más ve Marco en consulta</Pendiente></p>
      </div>
    ),
  },
  {
    id: 'cuerpo',
    fondo: 'foto',
    foto: 'cama.jpg',
    notas: 'Minuto 31 a 33 · Marco. La mirada psicosomática. No hagas diagnósticos a nadie del chat ni nombres enfermedades.',
    pinta: () => (
      <div className="cl-col cl-izq">
        <p className="cl-rotulo">Lo que dice el cuerpo</p>
        <h2 className="cl-h2">El cuerpo <b>también avisa.</b></h2>
        <p className="cl-lead">El nudo en el estómago, la tensión, el cansancio que no se va. Mucho de lo que llega a consulta empieza en una relación.</p>
      </div>
    ),
  },
  {
    id: 'claves-voto',
    fondo: 'oro',
    notas: 'Minuto 33 a 34. Pulsa cada 1, 2 o 3 que llegue al chat. La más votada te dice qué parte del curso destacar en la venta.',
    pinta: (_p, e, set) => {
      const ops = ['Es un patrón', 'Se hereda', 'No deja marchar'];
      const total = e.claves.reduce((a, b) => a + b, 0);
      return (
        <div className="cl-col">
          <p className="cl-rotulo">Momento chat</p>
          <h2 className="cl-h2 cl-oscuro">¿En qué clave te has reconocido?</h2>
          <div className="cl-votos" onClick={(ev) => ev.stopPropagation()}>
            {ops.map((o, i) => {
              const pct = total ? Math.round((e.claves[i] / total) * 100) : 0;
              return (
                <button key={o} type="button" className="cl-voto" onClick={() => set((s) => ({ ...s, claves: s.claves.map((x, j) => (j === i ? x + 1 : x)) }))}>
                  <span className="cl-voto-relleno" style={{ width: `${pct}%` }} />
                  <span className="cl-voto-txt"><b>{i + 1}</b> · {o}</span>
                  <span className="cl-voto-pct">{total ? `${pct} %` : ''}</span>
                </button>
              );
            })}
          </div>
          <p className="cl-nota cl-oscuro">Escribe 1, 2 o 3 en el chat.</p>
        </div>
      );
    },
  },
  {
    id: 'caso',
    fondo: 'arena',
    notas: 'Minuto 34 a 37. Solo un caso real y con permiso por escrito. Si no hay ninguno, salta esta diapositiva: un caso inventado no se cuenta nunca.',
    pinta: () => (
      <div className="cl-col">
        <p className="cl-rotulo">Un caso real</p>
        <h2 className="cl-h3"><Pendiente>nombre cambiado y edad</Pendiente></h2>
        <div className="cl-tres cl-tres-texto">
          <div className="cl-caja"><p className="cl-rotulo">Lo que se repetía</p><Pendiente>qué le pasaba en sus relaciones</Pendiente></div>
          <div className="cl-caja"><p className="cl-rotulo">Lo que vimos</p><Pendiente>qué salió en las fechas de su familia</Pendiente></div>
          <div className="cl-caja cl-caja-vino"><p className="cl-rotulo">Lo que cambió</p><Pendiente>qué es distinto hoy, contado por ella</Pendiente></div>
        </div>
        <p className="cl-nota">Se cuenta con su permiso y sin ningún dato que permita reconocerla.</p>
      </div>
    ),
  },
  {
    id: 'puente',
    fondo: 'foto',
    foto: 'hilos-77.jpg',
    notas: 'Minuto 37 a 38 · Iris. Pide permiso: «¿Os cuento cómo seguimos trabajando esto con quien quiere ir más allá?». Espera un sí en el chat.',
    pinta: () => (
      <div className="cl-col cl-izq cl-centro-v">
        <p className="cl-rotulo">Y ahora</p>
        <h2 className="cl-h2">Verlo es el primer paso.<br /><b>Cambiarlo lleva más de una hora.</b></h2>
      </div>
    ),
  },
  {
    id: 'curso',
    fondo: 'vino',
    notas: 'Minuto 38 a 42 · Marco e Iris. Lo marcado PENDIENTE son decisiones de Iris y Marco: cerrarlas antes del 26.',
    pinta: () => (
      <div className="cl-col">
        <p className="cl-rotulo">La propuesta</p>
        <h2 className="cl-h2">Curso <b>Desórdenes Amorosos</b></h2>
        <p className="cl-lead"><Pendiente>lo que consigues al terminar el curso, en una frase</Pendiente></p>
        <div className="cl-datos">
          {['Fechas', 'Horario', 'Duración', 'Modalidad'].map((d) => (
            <div key={d} className="cl-dato"><span className="cl-rotulo">{d}</span><Pendiente>por decidir</Pendiente></div>
          ))}
        </div>
        <p className="cl-nota">Con Iris Soares y Marco Célio Sousa</p>
      </div>
    ),
  },
  {
    id: 'para-quien',
    fondo: 'arena',
    notas: 'Minuto 42 a 43 · Marco. Decir para quién NO es da confianza. Sin presión.',
    pinta: () => (
      <div className="cl-col">
        <p className="cl-rotulo">Para que lo decidas con calma</p>
        <h2 className="cl-h3">¿Es para ti?</h2>
        <div className="cl-dos">
          <div className="cl-caja">
            <p className="cl-rotulo">Es para ti si</p>
            <ul className="cl-lista cl-lista-chica">
              <li>Cambias de pareja y vuelve la misma historia.</li>
              <li>Sientes que vives la vida de otra persona.</li>
              <li>Quieres entender de dónde viene, no solo aguantarlo.</li>
            </ul>
          </div>
          <div className="cl-caja">
            <p className="cl-rotulo">No es para ti si</p>
            <ul className="cl-lista cl-lista-chica">
              <li>Buscas una solución mágica en una semana.</li>
              <li>No quieres mirar tu historia familiar.</li>
              <li>Esperas que cambie la otra persona y no tú.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'precio',
    fondo: 'vino',
    pasos: 3,
    notas: 'Minuto 43 a 46 · Iris presenta, Marco remata. Un clic por opción. Di cada precio una vez y calla dos segundos. La opción a 12 meses no se nombra hasta que esté confirmada. Nada de cuentas atrás ni plazas inventadas.',
    pinta: (p) => (
      <div className="cl-col">
        <p className="cl-rotulo">Tu siguiente paso</p>
        <h2 className="cl-h3">Elige cómo seguir con nosotros</h2>
        <div className="cl-precios">
          <Ver desde={1} paso={p}>
            <div className="cl-precio">
              <p className="cl-rotulo">Por separado</p>
              <p className="cl-cifra"><Pendiente>valor real</Pendiente></p>
              <p>Lo que costaría lo que incluye el curso en sesiones sueltas.</p>
            </div>
          </Ver>
          <Ver desde={2} paso={p}>
            <div className="cl-precio cl-precio-top">
              <p className="cl-rotulo">El recomendado · Curso completo</p>
              <p className="cl-cifra">1.297 €</p>
              <p>En 3 pagos de 432,33 €<br />o <b>desde 233 € al mes</b> (6 meses · 1.397 € en total)</p>
            </div>
          </Ver>
          <Ver desde={3} paso={p}>
            <div className="cl-precio">
              <p className="cl-rotulo">Terapia grupal</p>
              <p className="cl-cifra">111 €</p>
              <p>Una sesión de 2 horas al mes, en grupo.</p>
            </div>
          </Ver>
        </div>
      </div>
    ),
  },
  {
    id: 'como',
    fondo: 'arena',
    notas: 'Minuto 46 a 48. Pega el enlace en el chat mientras hablas y en el grupo de WhatsApp. Deja esta diapositiva durante las preguntas.',
    pinta: () => (
      <div className="cl-col">
        <p className="cl-rotulo">Cómo apuntarte</p>
        <h2 className="cl-h3">Tres pasos</h2>
        <ol className="cl-lista cl-lista-oscura">
          <li>Entra en <Pendiente>enlace corto de pago</Pendiente></li>
          <li>Elige cómo pagar: <Pendiente>opciones</Pendiente></li>
          <li>Te llega el acceso por correo.</li>
        </ol>
        <p className="cl-nota">El enlace también lo dejamos ahora en el chat y en el grupo de WhatsApp.</p>
      </div>
    ),
  },
  {
    id: 'preguntas',
    fondo: 'oro',
    notas: 'Minuto 48 a 57. Pulsa «Empezar» para el reloj de 9 minutos. Primero las preguntas sobre el curso; cada respuesta sobre el curso termina recordando el enlace.',
    pinta: (_p, e, set) => {
      const m = Math.floor(e.reloj.quedan / 60);
      const s = e.reloj.quedan % 60;
      return (
        <div className="cl-col cl-centro-v">
          <p className="cl-rotulo">Preguntas en directo</p>
          <h2 className="cl-h2 cl-oscuro">Tu turno. Pregunta lo que quieras.</h2>
          <div className="cl-reloj" onClick={(ev) => ev.stopPropagation()}>
            <span className="cl-reloj-cifra">{m}:{String(s).padStart(2, '0')}</span>
            <button type="button" className="cl-boton" onClick={() => set((x) => ({ ...x, reloj: { ...x.reloj, corriendo: !x.reloj.corriendo } }))}>
              {e.reloj.corriendo ? 'Pausar' : 'Empezar'}
            </button>
            <button type="button" className="cl-boton cl-boton-suave" onClick={() => set((x) => ({ ...x, reloj: { corriendo: false, quedan: 9 * 60 } }))}>
              Reiniciar
            </button>
          </div>
        </div>
      );
    },
  },
  {
    id: 'pdf',
    fondo: 'arena',
    notas: 'Minuto 57 a 59 · Marco. Solo para quien no ha comprado. Una frase y al cierre.',
    pinta: () => (
      <div className="cl-col">
        <p className="cl-rotulo">Antes de irte</p>
        <h2 className="cl-h3">¿Aún no es tu momento?</h2>
        <p className="cl-lead cl-oscuro">Llévate la guía en PDF y sigue mirando tu patrón a tu ritmo.</p>
        <div className="cl-caja">
          <p><Pendiente>título de la guía</Pendiente></p>
          <p><Pendiente>precio (20-30 €)</Pendiente></p>
          <p>El enlace, en el grupo de WhatsApp.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'gracias',
    fondo: 'foto',
    foto: 'hilos-67.jpg',
    notas: 'Minuto 59 a 60. Despedida corta y cálida. Cierra a la hora.',
    pinta: () => (
      <div className="cl-col cl-izq cl-centro-v">
        <img className="cl-logo" src="/images/logo-33-blanco.png" alt="Escuela de Sabiduría 33" />
        <h2 className="cl-h2">Gracias <b>por quedarte.</b></h2>
        <p className="cl-lead">Seguimos en el grupo de WhatsApp de la masterclass.</p>
        <p className="cl-nota">Iris Soares · Marco Célio Sousa · Escuela de Sabiduría 33</p>
      </div>
    ),
  },
];

const INICIAL: Estado = { escala: Array(10).fill(0), claves: [0, 0, 0], edades: ['', '', ''], reloj: { corriendo: false, quedan: 9 * 60 } };

export default function Clase() {
  const [i, setI] = useState(0);
  const [paso, setPaso] = useState(0);
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [notas, setNotas] = useState(false);
  const [indice, setIndice] = useState(false);
  const [escala, setEscala] = useState(1);
  const raiz = useRef<HTMLDivElement>(null);
  const d = DIAPOS[i];
  const pasos = d.pasos ?? 0;

  /* El lienzo mide 1920×1080 y se escala para caber entero en la ventana. */
  useEffect(() => {
    const medir = () => setEscala(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  /* Se recuerda la diapositiva en el enlace (#7) por si se recarga en directo. */
  useEffect(() => {
    const leer = () => {
      const n = parseInt(window.location.hash.slice(1), 10);
      if (n >= 1 && n <= DIAPOS.length) { setI(n - 1); setPaso(0); }
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => window.removeEventListener('hashchange', leer);
  }, []);
  useEffect(() => {
    window.history.replaceState(null, '', `#${i + 1}`);
  }, [i]);

  const ir = useCallback((n: number, alFinal = false) => {
    const k = Math.max(0, Math.min(DIAPOS.length - 1, n));
    setI(k);
    setPaso(alFinal ? DIAPOS[k].pasos ?? 0 : 0);
  }, []);
  const siguiente = useCallback(() => (paso < pasos ? setPaso(paso + 1) : ir(i + 1)), [paso, pasos, i, ir]);
  const anterior = useCallback(() => (paso > 0 ? setPaso(paso - 1) : ir(i - 1, true)), [paso, i, ir]);

  const pantallaCompleta = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else raiz.current?.requestFullscreen();
    } catch {
      /* Algunos navegadores no la dejan: se sigue en la ventana. */
    }
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); siguiente(); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); anterior(); }
      else if (e.key === 'f' || e.key === 'F') pantallaCompleta();
      else if (e.key === 'n' || e.key === 'N') setNotas((x) => !x);
      else if (e.key === 'g' || e.key === 'G' || e.key === 'Escape') setIndice((x) => (e.key === 'Escape' ? false : !x));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [siguiente, anterior, pantallaCompleta]);

  /* El reloj de las preguntas. */
  useEffect(() => {
    if (!estado.reloj.corriendo) return;
    const t = setInterval(() => setEstado((s) => {
      const q = Math.max(0, s.reloj.quedan - 1);
      return { ...s, reloj: { corriendo: q > 0, quedan: q } };
    }), 1000);
    return () => clearInterval(t);
  }, [estado.reloj.corriendo]);

  const clic = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left > r.width * 0.35) siguiente();
    else anterior();
  };

  const progreso = useMemo(() => ((i + (pasos ? paso / (pasos + 1) : 0)) / (DIAPOS.length - 1)) * 100, [i, paso, pasos]);

  return (
    <div className="cl-raiz" ref={raiz}>
      <div className="cl-escenario" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
        <section key={d.id} className={`cl-diapo cl-${d.fondo}`} onClick={clic}>
          {d.foto && <img className="cl-fondo" src={IMG + d.foto} alt="" />}
          <div className="cl-contenido">{d.pinta(paso, estado, setEstado)}</div>
          <p className="cl-pie">Desórdenes Amorosos · Escuela de Sabiduría 33</p>
        </section>
      </div>

      <div className="cl-progreso" aria-hidden="true"><span style={{ width: `${progreso}%` }} /></div>

      <nav className="cl-mandos" aria-label="Controles de la presentación">
        <button type="button" onClick={anterior} aria-label="Anterior">‹</button>
        <span className="cl-contador">{i + 1} / {DIAPOS.length}</span>
        <button type="button" onClick={siguiente} aria-label="Siguiente">›</button>
        <button type="button" onClick={() => setIndice((x) => !x)}>Índice</button>
        <button type="button" onClick={() => setNotas((x) => !x)} aria-pressed={notas}>Notas</button>
        <button type="button" onClick={pantallaCompleta}>Pantalla completa</button>
      </nav>

      {notas && (
        <aside className="cl-notas">
          <p className="cl-rotulo">Notas · {i + 1}</p>
          <p>{d.notas}</p>
        </aside>
      )}

      {indice && (
        <div className="cl-indice" role="dialog" aria-label="Índice de diapositivas">
          {DIAPOS.map((x, k) => (
            <button key={x.id} type="button" className={k === i ? 'cl-actual' : ''} onClick={() => { ir(k); setIndice(false); }}>
              <span>{k + 1}</span> {x.id.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
