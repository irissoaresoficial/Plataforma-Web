"use client";

/**
 * LA SEMANA COMO REJILLA
 *
 * Una columna por día, las horas en el eje vertical y cada sesión pintada a su
 * hora y con la altura de lo que dura. Es la única forma de contestar de un
 * vistazo la pregunta que se hace por teléfono —«¿tengo hueco el jueves por la
 * tarde?»—: en una lista, los huecos no se ven, porque un hueco es
 * precisamente lo que no está escrito.
 *
 * POR QUÉ EL FONDO ES UN HUECO Y LOS BLOQUES SON TARJETAS.
 *
 * Las referencias de estos calendarios rellenan cada bloque de un pastel
 * distinto, y aquí eso no vale: el color de esta casa marca, no rellena. Así
 * que se ha dado la vuelta al relieve, que sí es de la casa: el tiempo vacío es
 * el arena hundido —el mismo hueco de un campo donde se escribe— y cada sesión
 * es una tarjeta blanca levantada encima, con una raya de color al canto que
 * dice de qué clase es. Se distingue igual de bien de qué es cada bloque, y la
 * pantalla sigue siendo esta plataforma y no un calendario genérico.
 *
 * LOS SOLAPES SE REPARTEN, no se tapan. La cuenta está en `lib/despacho/
 * rejilla.ts`, aparte, porque es geometría y se puede leer sin un navegador.
 *
 * SIRVE PARA UN DÍA Y PARA SIETE. En un móvil no caben siete columnas de horas,
 * así que la misma rejilla se pinta con un solo día. No hay dos componentes que
 * mantener ni dos maneras de que se vea una sesión.
 */

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import {
  claveDia,
  diaCorto,
  duracion,
  etiquetaTipo,
  franjaDeHoras,
  hora,
  minutosDelDia,
  reparteCarriles,
  type Cita,
} from "@/lib/despacho";

/** Lo que mide una hora en la pantalla. Con menos, una sesión de media hora no
 *  tiene sitio ni para el nombre; con más, la jornada no cabe en la ventana. */
const ALTO_HORA = 64;
/** Lo que ocupa como mínimo una sesión, dure lo que dure. Una de quince minutos
 *  medida a escala son catorce píxeles: una raya donde no se lee nada. */
const MINIMO_MINUTOS = 40;
/** Ancho de la columna de las horas. Cabe «21:00» sin apretar. */
const CANAL_HORAS = 52;
/** Lo que mide la fila de los días: el nombre, el número grande y la cuenta. */
const ALTO_CABECERA = 82;

/**
 * EL ORDEN DE LAS CAPAS, DECIDIDO UNA VEZ Y AQUÍ.
 *
 * Estaba repartido: cada trozo se ponía su `z-index` a ojo donde hacía falta, y
 * salieron números que se contradecían — las tarjetas de sesión llevaban un 3 y
 * la cabecera de los días un 2. Como la cabecera es `sticky`, se queda pegada
 * arriba al bajar por la rejilla… y las tarjetas le pasaban POR ENCIMA. Lo que
 * se veía era «Sin nombre · Sesión 1h30» escrito encima de «mar 8», con la
 * cabecera medio tapada. Se leía como una avería de la agenda.
 *
 * Con la escala escrita junta, el orden se lee de un vistazo y una capa nueva
 * ya no puede colarse en medio por descuido. De abajo arriba:
 *
 *   FONDO    las medias horas y las líneas.
 *   BLOQUE   las sesiones. Por encima de las líneas y por debajo de todo lo
 *            que se queda pegado a un borde, que es la regla que faltaba.
 *   AHORA    la raya del presente, que tiene que cruzar por encima de una
 *            sesión en curso: si no, la sesión de las 12 la esconde justo
 *            mientras está pasando.
 *   HORAS    la columna de la izquierda, pegada al desplazar en horizontal.
 *   DIAS     la cabecera, pegada al desplazar en vertical.
 *   ESQUINA  el hueco donde se cruzan las dos: tiene que ganar a las dos o al
 *            desplazar en diagonal se ve una hora asomando por debajo.
 */
const CAPA = { FONDO: 0, BLOQUE: 1, AHORA: 2, HORAS: 4, DIAS: 5, ESQUINA: 6 };

/**
 * El color de cada clase de sesión: fondo y tinta. Es lo único que distingue
 * un bloque de otro y por eso son tres y no seis: los tres tipos que existen.
 * Los valores y sus contrastes están en globals.css («LOS COLORES DE LA
 * AGENDA») y en MARCA.md.
 */
export const COLOR_TIPO: Record<Cita["tipo"], { fondo: string; tinta: string }> = {
  sesion: { fondo: "var(--cita-sesion)", tinta: "var(--cita-sesion-tx)" },
  seguimiento: { fondo: "var(--cita-seguimiento)", tinta: "var(--cita-seguimiento-tx)" },
  sinergia: { fondo: "var(--cita-sinergia)", tinta: "var(--cita-sinergia-tx)" },
};

/** La inicial de quien viene, en un círculo dentro del bloque: sin foto de
 *  banco de imágenes, sólo su letra. */
const inicial = (nombre: string) => (nombre.trim().charAt(0) || "?").toLocaleUpperCase("es");

/** La hora a la que acaba, para escribir el tramo entero: «10:00 – 11:30». */
const horaFin = (c: Cita) => hora(new Date(new Date(c.inicioISO).getTime() + c.minutos * 60000).toISOString());

export default function RejillaSemana({
  dias,
  citas,
  nombreDe,
  elegido,
  alPulsarCita,
  alPulsarHueco,
}: {
  /** De uno a siete días, ya en orden. */
  dias: Date[];
  /** Las sesiones que se pintan, ya filtradas por quien llama. */
  citas: Cita[];
  nombreDe: (personaId: string) => string;
  /** El día marcado, si hay alguno. Se resalta su cabecera. */
  elegido?: Date;
  alPulsarCita: (c: Cita) => void;
  /** Pulsar un rato vacío: día y minuto desde medianoche. */
  alPulsarHueco: (dia: Date, minutos: number) => void;
}) {
  const quieto = useReducedMotion();
  const marco = useRef<HTMLDivElement>(null);

  /**
   * Las citas de los días que se están pintando, repartidas por día.
   *
   * Se recorta aquí y no fuera a propósito: quien llama pasa todo lo que ha
   * pasado el filtro, y si no se acotara, una sesión de las siete de la mañana
   * de hace seis meses estiraría la franja de horas de TODAS las semanas —la
   * rejilla empezaría a las siete todos los lunes del año por algo que ya no se
   * ve—. La rejilla es quien sabe qué días pinta, así que es quien lo recorta.
   */
  const delTramo = useMemo(() => {
    const claves = new Set(dias.map(claveDia));
    return citas.filter((c) => claves.has(claveDia(new Date(c.inicioISO))));
  }, [citas, dias]);

  const porDia = useMemo(() => {
    const m = new Map<string, Cita[]>();
    delTramo.forEach((c) => {
      const k = claveDia(new Date(c.inicioISO));
      m.set(k, [...(m.get(k) ?? []), c]);
    });
    return m;
  }, [delTramo]);

  /** De qué hora a qué hora se pinta: la jornada normal, estirada si hay algo
   *  fuera. Se mide sobre los siete días a la vez para que las columnas
   *  empiecen a la misma altura. */
  const { abre, cierra } = useMemo(
    () =>
      franjaDeHoras(
        delTramo.map((c) => {
          const desde = minutosDelDia(c.inicioISO);
          return { desde, hasta: desde + Math.max(c.minutos, MINIMO_MINUTOS) };
        })
      ),
    [delTramo]
  );

  const horas = useMemo(() => Array.from({ length: cierra - abre }, (_, i) => abre + i), [abre, cierra]);
  const alto = horas.length * ALTO_HORA;

  /** Dónde cae ahora mismo la raya del presente, si es que cae dentro. */
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const dentroDeLaFranja = minutosAhora >= abre * 60 && minutosAhora <= cierra * 60;
  const semanaDeHoy = dias.some((d) => claveDia(d) === claveDia(ahora));

  /*
   * AL ABRIR, LA VISTA CAE EN LA PRIMERA SESIÓN.
   *
   * La rejilla puede empezar a las siete de la mañana porque un día hubo una
   * sesión a esa hora, y entonces al entrar se ve una franja vacía en vez del
   * trabajo. Se baja hasta un poco antes de lo primero que hay — o hasta la
   * hora actual si no hay nada.
   *
   * Y SÓLO UNA VEZ POR TRAMO. Marcar una sesión como hecha cambia la lista de
   * citas y volvería a disparar esto: la rejilla daría un salto hacia arriba
   * justo después de pulsar, con el dedo todavía encima. El testigo guarda para
   * qué tramo ya se colocó, así que las escrituras no mueven la vista y cambiar
   * de semana sí.
   */
  const tramo = (dias.length ? claveDia(dias[0]) : "") + "|" + abre;
  const colocado = useRef("");
  useEffect(() => {
    const el = marco.current;
    if (!el || colocado.current === tramo) return;
    colocado.current = tramo;
    const primeras = delTramo.map((c) => minutosDelDia(c.inicioISO));
    const objetivo = primeras.length ? Math.min(...primeras) : minutosAhora;
    el.scrollTop = Math.max(0, ((objetivo - abre * 60) / 60) * ALTO_HORA - ALTO_HORA * 0.6);
  }, [tramo, abre, delTramo, minutosAhora]);

  const columnas = `${CANAL_HORAS}px repeat(${dias.length},minmax(0,1fr))`;

  return (
    <div
      ref={marco}
      style={css(
        "min-width:0;overflow:auto;overscroll-behavior:contain;max-height:calc(100vh - 230px);" +
          /* El tiempo vacío es un hueco: el arena de la casa, hundido. Sobre él
             cada sesión se levanta como una tarjeta. */
          /* Papel blanco y no un hueco gris: la semana es donde se trabaja y
             tiene que leerse como una hoja, con las sesiones de color encima. */
          "background:var(--surface);border-radius:var(--r);border:1px solid var(--border);"
      )}
    >
      <div style={css(`display:grid;grid-template-columns:${columnas};min-width:${dias.length > 2 ? 640 : 0}px;`)}>
        {/* --------------------------------------------------- fila de cabecera */}
        {/* La esquina vacía sobre la columna de las horas. Va pegada arriba y a
            la izquierda, o al desplazarse deja pasar los números por debajo. */}
        <div
          style={css(
            `position:sticky;top:0;left:0;z-index:${CAPA.ESQUINA};background:var(--surface-solid);border-bottom:1px solid var(--border);height:${ALTO_CABECERA}px;`
          )}
        />
        {dias.map((d) => {
          const esHoy = claveDia(d) === claveDia(ahora);
          const esElegido = elegido ? claveDia(d) === claveDia(elegido) : false;
          const cuantas = porDia.get(claveDia(d))?.length ?? 0;
          return (
            <div
              key={claveDia(d)}
              style={css(
                `position:sticky;top:0;z-index:${CAPA.DIAS};height:${ALTO_CABECERA}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;` +
                  "background:var(--surface-solid);border-bottom:1px solid var(--border);border-left:1px solid var(--border);"
              )}
            >
              <span
                style={css(
                  "font-size:var(--t-mini);line-height:1.1;color:" + (esHoy ? "var(--text)" : "var(--text-4)") + ";font-weight:" + (esHoy ? 500 : 400) + ";"
                )}
              >
                {diaCorto(d)}
              </span>
              {/* El número, grande. Hoy va en el círculo de oro vivo, que es lo
                  primero que encuentra el ojo; el día elegido, en un aro vino. */}
              <span
                data-cifras=""
                style={css(
                  "display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:var(--t-title);line-height:1;letter-spacing:-.02em;" +
                    (esHoy
                      ? "background:var(--cita-hoy);color:var(--cita-hoy-tx);font-weight:500;"
                      : esElegido && dias.length > 1
                        ? "box-shadow:inset 0 0 0 1.5px var(--accion);color:var(--text);font-weight:500;"
                        : "color:var(--text-2);font-weight:400;")
                )}
              >
                {d.getDate()}
              </span>
              <span style={css("font-size:var(--t-micro);line-height:1;color:var(--text-4);min-height:11px;")}>
                {cuantas === 0 ? "" : cuantas === 1 ? "1 cita" : `${cuantas} citas`}
              </span>
            </div>
          );
        })}

        {/* ------------------------------------------------- la columna de horas */}
        <div style={css(`position:sticky;left:0;z-index:${CAPA.HORAS};background:var(--surface-solid);height:${alto}px;`)}>
          {horas.map((h, i) => (
            <div
              key={h}
              style={css(
                `height:${ALTO_HORA}px;display:flex;justify-content:flex-end;padding:0 8px;` +
                  /* La hora se escribe pegada a su línea, no centrada en la
                     franja: así el número y la raya dicen lo mismo. */
                  "align-items:flex-start;" +
                  (i ? "border-top:1px solid var(--border);" : "")
              )}
            >
              <span
                data-cifras=""
                style={css("font-size:var(--t-micro);color:var(--text-4);line-height:1;transform:translateY(" + (i ? -5 : 3) + "px);")}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------- un día, un carril */}
        {dias.map((d) => {
          const k = claveDia(d);
          const delDia = porDia.get(k) ?? [];
          const colocadas = reparteCarriles(
            delDia,
            (c) => minutosDelDia(c.inicioISO),
            (c) => c.minutos,
            MINIMO_MINUTOS
          );
          const esHoy = k === claveDia(ahora);

          return (
            <div
              key={k}
              style={css(
                `position:relative;height:${alto}px;border-left:1px solid var(--border);` +
                  /* Hoy, teñido: se encuentra sin buscarlo. */
                  (esHoy ? "background:color-mix(in srgb, var(--cita-hoy) 7%, transparent);" : "")
              )}
            >
              {/* Las franjas de media hora son las que se pulsan para apuntar
                  algo a esa hora. Sin ellas habría que ir al formulario y
                  teclear el día y la hora que ya se están señalando con el dedo. */}
              {horas.map((h, i) =>
                [0, 30].map((m) => (
                  <button
                    key={`${h}:${m}`}
                    onClick={() => alPulsarHueco(d, h * 60 + m)}
                    aria-label={`Apuntar una sesión el ${claveDia(d)} a las ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`}
                    style={css(
                      `position:absolute;left:0;right:0;top:${i * ALTO_HORA + (m ? ALTO_HORA / 2 : 0)}px;height:${ALTO_HORA / 2}px;` +
                        "border:none;background:none;cursor:pointer;padding:0;" +
                        /* Sólo la línea de la hora en punto: una raya cada media
                           hora convertiría la semana en un papel pautado.
                           Va como sombra interior y no como borde para no
                           mezclar `border` con una de sus partes, que es lo que
                           hace que React avise y que la raya se quede puesta
                           donde no toca. */
                        (m === 0 && i ? "box-shadow:inset 0 1px 0 var(--border);" : "")
                    )}
                  />
                ))
              )}

              {/* La raya de ahora mismo, sólo en la columna de hoy. Es lo que
                  hace que la rejilla diga «vas por aquí» sin mirar el reloj. */}
              {/* Cruza la semana entera, como en la referencia: fina en los
                  otros días y entera en el de hoy, con su punto al principio. */}
              {semanaDeHoy && dentroDeLaFranja && (
                <div
                  aria-hidden="true"
                  style={css(
                    `position:absolute;left:0;right:0;top:${((minutosAhora - abre * 60) / 60) * ALTO_HORA}px;height:0;` +
                      `border-top:${esHoy ? 2 : 1}px solid ${esHoy ? "var(--accion)" : "color-mix(in srgb, var(--accion) 35%, transparent)"};z-index:${CAPA.AHORA};pointer-events:none;` +
                      /* Un filo claro por arriba y por abajo: sin él, la raya
                         vino desaparece al cruzar una sesión, que es vino. */
                      (esHoy ? "box-shadow:0 -1px 0 var(--surface-solid),0 1px 0 var(--surface-solid);" : "")
                  )}
                >
                  {esHoy && (
                    <span
                      style={css(
                        "position:absolute;left:-5px;top:-6px;width:10px;height:10px;border-radius:50%;background:var(--accion);box-shadow:0 0 0 2px var(--surface-solid);"
                      )}
                    />
                  )}
                </div>
              )}

              {colocadas.map(({ dato: c, desde, carril, carriles }, i) => {
                const anulada = c.estado === "anulada";
                const pedida = c.estado === "pedida";
                const hecha = c.estado === "hecha";
                const { fondo, tinta } = anulada ? { fondo: "var(--surface-2)", tinta: "var(--text-3)" } : COLOR_TIPO[c.tipo];
                const altoBloque = (Math.max(c.minutos, MINIMO_MINUTOS) / 60) * ALTO_HORA;
                const ancho = 100 / carriles;
                const nombre = nombreDe(c.personaId);
                /* Un bloque corto (menos de una hora pintada) no da para dos
                   renglones: va en uno, el nombre y la hora seguidos. */
                const corto = altoBloque < 56 || (carriles > 1 && dias.length > 3);
                /* El nombre en dos renglones sólo si hay alto de sobra. */
                const dosRenglones = altoBloque >= 84;
                return (
                  <motion.button
                    key={c.id}
                    /* Crece desde su hora hacia abajo, como si el bloque se
                       llenara con el rato que ocupa. */
                    initial={quieto ? false : { opacity: 0, scaleY: 0.7 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    /* El gesto de «esto se pulsa» va por framer y no por CSS: la
                       entrada deja un `transform` en línea que se comería
                       cualquier `:hover` de la hoja de estilos. */
                    whileHover={quieto ? undefined : { y: -1 }}
                    whileTap={quieto ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.36, delay: Math.min(i, 6) * 0.035, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => alPulsarCita(c)}
                    title={`${nombre} · ${hora(c.inicioISO)} · ${duracion(c.minutos)}`}
                    style={css(
                      `position:absolute;overflow:hidden;text-align:left;cursor:pointer;z-index:${CAPA.BLOQUE};transform-origin:top;font-family:inherit;` +
                        `top:${((desde - abre * 60) / 60) * ALTO_HORA + 2}px;height:${altoBloque - 4}px;` +
                        `left:calc(${carril * ancho}% + 3px);width:calc(${ancho}% - 6px);` +
                        /* EL BLOQUE, MACIZO. Ger pidió «colores importantes» y
                           contraste: el color de la clase rellena el bloque
                           entero y se distingue a un metro. */
                        `background:${fondo};color:${tinta};border-radius:var(--r-sm);padding:${corto ? "4px 7px" : "7px 8px"};` +
                        "display:flex;flex-direction:column;gap:2px;" +
                        /* Por confirmar: el mismo color, con un filo de trazos.
                           Es una hora pedida que todavía no es firme. */
                        (pedida
                          ? `border:1.5px dashed ${tinta};`
                          : anulada
                            ? "border:1px solid var(--border);"
                            : "border:1px solid transparent;") +
                        (anulada ? "" : "box-shadow:0 1px 2px rgba(34,29,31,.08),0 6px 16px rgba(34,29,31,.1);")
                    )}
                  >
                    {corto ? (
                      <span
                        data-cifras=""
                        style={css(
                          "display:block;font-size:var(--t-micro);line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
                            (anulada ? "text-decoration:line-through;" : "")
                        )}
                      >
                        <span style={css("font-weight:500;")}>{nombre}</span>
                        <span style={css("opacity:.86;")}> · {hora(c.inicioISO)}</span>
                      </span>
                    ) : (
                      <>
                        {/* El nombre puede ir en dos renglones: en una columna
                            de semana, «Carmen Ruiz» no cabe en uno. */}
                        <span
                          style={css(
                            (dosRenglones
                                ? "display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;"
                                : "display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;") +
                              "font-size:var(--t-mini);font-weight:500;line-height:1.2;" +
                              (anulada ? "text-decoration:line-through;" : "")
                          )}
                        >
                          {nombre}
                        </span>
                        <span
                          data-cifras=""
                          style={css("display:flex;align-items:center;gap:4px;font-size:var(--t-micro);line-height:1.2;opacity:.86;white-space:nowrap;overflow:hidden;")}
                        >
                          {hecha && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Hecha" style={css("flex:none;")}>
                              <path d="m5 12 5 5 9-10" />
                            </svg>
                          )}
                          {/* La hora de fin sólo si cabe: en la semana, la de
                              empezar y lo que dura caben siempre. */}
                          {dias.length > 3 ? `${hora(c.inicioISO)} · ${duracion(c.minutos)}` : `${hora(c.inicioISO)} – ${horaFin(c)}`}
                        </span>
                      </>
                    )}
                    {/* Abajo, la inicial de quien viene y qué es —o lo que le
                        falta—, sólo si el bloque da para ello: en uno corto el
                        nombre es lo único que no puede faltar. */}
                    {altoBloque >= 90 && (
                      <span style={css("margin-top:auto;display:flex;align-items:center;gap:6px;min-width:0;")}>
                        <span
                          aria-hidden="true"
                          style={css(
                            `flex:none;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:var(--t-micro);font-weight:500;` +
                              `background:color-mix(in srgb, ${tinta} 16%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, ${tinta} 28%, transparent);`
                          )}
                        >
                          {inicial(nombre)}
                        </span>
                        <span style={css("font-size:var(--t-micro);line-height:1.2;opacity:.86;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                          {pedida ? "Por confirmar" : anulada ? "Anulada" : etiquetaTipo(c.tipo)}
                        </span>
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
