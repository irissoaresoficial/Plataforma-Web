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
import { NOTA } from "@/lib/ui";
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
const ALTO_HORA = 58;
/** Lo que ocupa como mínimo una sesión, dure lo que dure. Una de quince minutos
 *  medida a escala son catorce píxeles: una raya donde no se lee nada. */
const MINIMO_MINUTOS = 40;
/** Ancho de la columna de las horas. Cabe «21:00» sin apretar. */
const CANAL_HORAS = 48;

/**
 * El color de cada clase de sesión. Es lo único que distingue un bloque de
 * otro y por eso son tres colores y no seis: los tres tipos que existen.
 * Los tres están medidos para leerse sobre el papel y sobre el granate.
 */
const COLOR_TIPO: Record<Cita["tipo"], string> = {
  sesion: "var(--gold)",
  seguimiento: "var(--via-transformacion-tx)",
  sinergia: "var(--via-destino-tx)",
};

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
        "min-width:0;overflow:auto;overscroll-behavior:contain;max-height:calc(100vh - 260px);" +
          /* El tiempo vacío es un hueco: el arena de la casa, hundido. Sobre él
             cada sesión se levanta como una tarjeta. */
          "background:var(--surface-2);border-radius:var(--r);box-shadow:var(--nm-hondo);"
      )}
    >
      <div style={css(`display:grid;grid-template-columns:${columnas};min-width:${dias.length > 2 ? 640 : 0}px;`)}>
        {/* --------------------------------------------------- fila de cabecera */}
        {/* La esquina vacía sobre la columna de las horas. Va pegada arriba y a
            la izquierda, o al desplazarse deja pasar los números por debajo. */}
        <div
          style={css(
            "position:sticky;top:0;left:0;z-index:3;background:var(--surface);border-bottom:1px solid var(--border);height:56px;"
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
                "position:sticky;top:0;z-index:2;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;" +
                  "background:var(--surface);border-bottom:1px solid var(--border);border-left:1px solid var(--border);" +
                  /* El día que se está mirando lleva el granate de la casa —lo
                     elegido— y hoy, cuando no es el elegido, sólo el aro de oro. */
                  (esElegido ? "box-shadow:inset 0 2px 0 var(--accion);" : esHoy ? "box-shadow:inset 0 2px 0 var(--gold);" : "")
              )}
            >
              <span style={css(NOTA + "text-transform:none;color:var(--text-4);line-height:1.1;")}>{diaCorto(d)}</span>
              <span
                data-cifras=""
                style={css(
                  "font-size:var(--t-body);font-weight:600;line-height:1.1;color:" +
                    (esElegido ? "var(--accion)" : esHoy ? "var(--text)" : "var(--text-2)") +
                    ";"
                )}
              >
                {d.getDate()}
              </span>
              {cuantas > 0 && (
                <span style={css("font-size:var(--t-micro);line-height:1;color:var(--text-4);")}>
                  {cuantas === 1 ? "1 sesión" : `${cuantas} sesiones`}
                </span>
              )}
            </div>
          );
        })}

        {/* ------------------------------------------------- la columna de horas */}
        <div style={css(`position:sticky;left:0;z-index:1;background:var(--surface-2);height:${alto}px;`)}>
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
                style={css("font-size:var(--t-micro);color:var(--text-4);line-height:1;transform:translateY(-5px);")}
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
            <div key={k} style={css(`position:relative;height:${alto}px;border-left:1px solid var(--border);`)}>
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
              {esHoy && dentroDeLaFranja && (
                <div
                  aria-hidden="true"
                  style={css(
                    `position:absolute;left:0;right:0;top:${((minutosAhora - abre * 60) / 60) * ALTO_HORA}px;height:0;` +
                      "border-top:2px solid var(--accion);z-index:2;pointer-events:none;"
                  )}
                />
              )}

              {colocadas.map(({ dato: c, desde, carril, carriles }, i) => {
                const anulada = c.estado === "anulada";
                const color = anulada ? "var(--text-4)" : COLOR_TIPO[c.tipo];
                const altoBloque = (Math.max(c.minutos, MINIMO_MINUTOS) / 60) * ALTO_HORA;
                const ancho = 100 / carriles;
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
                    transition={{ duration: 0.36, delay: Math.min(i, 6) * 0.035, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => alPulsarCita(c)}
                    title={`${nombreDe(c.personaId)} · ${hora(c.inicioISO)} · ${duracion(c.minutos)}`}
                    style={css(
                      "position:absolute;overflow:hidden;text-align:left;cursor:pointer;z-index:3;transform-origin:top;" +
                        `top:${((desde - abre * 60) / 60) * ALTO_HORA + 1}px;height:${altoBloque - 2}px;` +
                        `left:calc(${carril * ancho}% + 2px);width:calc(${ancho}% - 4px);` +
                        /* La tarjeta de la casa, levantada del hueco, con la
                           raya de color que dice de qué clase es.
                           La raya va pintada en el fondo y no como `border-left`
                           por lo mismo que en `lib/ui.ts`: con el canto blando,
                           un borde de un solo lado da la vuelta a las dos
                           esquinas y sale una coma en vez de una raya. Aquí
                           además el bloque puede medir treinta y ocho píxeles,
                           así que la barra se mide en porcentaje. */
                        "background:var(--surface);border:1px solid var(--border);" +
                        "background-image:linear-gradient(" + color + "," + color + ");" +
                        "background-repeat:no-repeat;background-position:0 50%;background-size:3px 64%;" +
                        "border-radius:var(--r);box-shadow:var(--nm-alto);padding:5px 7px 5px 12px;" +
                        (anulada ? "opacity:.62;" : "")
                    )}
                  >
                    <span
                      data-cifras=""
                      style={css("display:block;font-size:var(--t-micro);font-weight:600;line-height:1.2;color:" + color + ";")}
                    >
                      {hora(c.inicioISO)}
                      {c.estado === "pedida" && " · por confirmar"}
                      {anulada && " · anulada"}
                    </span>
                    <span
                      style={css(
                        "display:block;margin-top:1px;font-size:var(--t-mini);font-weight:590;line-height:1.25;color:var(--text);" +
                          "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
                          (anulada ? "text-decoration:line-through;" : "")
                      )}
                    >
                      {nombreDe(c.personaId)}
                    </span>
                    {/* El tipo y la duración sólo cuando el bloque es lo bastante
                        alto: en una sesión corta, meterlos a la fuerza deja el
                        nombre cortado, y el nombre es lo único que no puede
                        faltar. */}
                    {altoBloque >= 62 && (
                      <span
                        style={css(
                          "display:block;margin-top:2px;font-size:var(--t-micro);line-height:1.2;color:var(--text-4);" +
                            /* En un renglón y cortado con puntos: partido en dos
                               se sale por debajo del bloque y se ve la mitad de
                               una letra asomando por el canto. */
                            "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                        )}
                      >
                        {etiquetaTipo(c.tipo)} · {duracion(c.minutos)}
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
