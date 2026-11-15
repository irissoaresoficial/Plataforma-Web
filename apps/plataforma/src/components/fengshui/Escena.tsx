"use client";
/**
 * ============================================================================
 * LA ESCENA: LA VIVIENDA EN GRANDE Y EL ESTUDIO EN CRISTAL ENCIMA
 * ============================================================================
 *
 * Gerson, el 15 de noviembre de 2026, con una referencia de una inmobiliaria:
 * «mira algo así para Feng Shui, adapta todo esto a lo nuestro» y «solo
 * estamos hablando de diseño, las reglas del negocio no las toques».
 *
 * Así que aquí NO SE CALCULA NADA NUEVO. Todo lo que se pinta sale de lo que
 * la pantalla ya calculaba: la orientación, la carta, el Kua de cada persona
 * y las propuestas de cada zona. Esto sólo lo coloca.
 *
 *   · DE FONDO, la vivienda: el plano, desenfocado y oscurecido, y nítido en
 *     el hueco del centro. Cuando se puedan subir fotos de la casa, irán aquí.
 *   · ARRIBA A LA IZQUIERDA, qué estudio es, las cinco partes y los dos datos
 *     que más se preguntan: hacia dónde mira y de espaldas a qué.
 *   · ARRIBA A LA DERECHA, un plano mínimo con el norte arriba y la flecha de
 *     la fachada.
 *   · ABAJO, lo que hay marcado en el plano y los accesos.
 *   · LA COLUMNA DE LA DERECHA, tres tarjetas: la vivienda, el número Kua de
 *     quien vive en ella y lo que hay que cambiar, zona por zona.
 */
import { BA_ZHAI, MANSIONES, MANSION_BUENA, NOMBRE_DIR, dirDe, norm, type Casilla, type CartaNatal, type Anio } from "@/lib/fengshui/calculo";
import { kuaDe, type EstudioFs } from "@/lib/fengshui/estudio";
import { FORMACION, MANSION, propuestaZona } from "@/lib/fengshui/textos";
import type { ParteFengShui } from "@/lib/app-context";
import s from "./Escena.module.css";

const ORDEN: Casilla[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO", "C"];
const TIPO = { casa: "Casa", piso: "Piso", local: "Local" } as const;
const coma = (n: number) => n.toFixed(1).replace(".", ",");

type Props = {
  e: EstudioFs;
  plano: string | null;
  lista: EstudioFs[];
  carta: CartaNatal | null;
  periodo: number | null;
  anio: Anio;
  partes: Array<{ k: ParteFengShui; label: string }>;
  parte: ParteFengShui;
  alParte: (p: ParteFengShui) => void;
  alAbrir: (id: string) => void;
  alNuevo: () => void;
  alZona: (k: Casilla) => void;
  persona: string;
  alPersona: (id: string) => void;
};

/* ------------------------------------------------------------- iconos */
const Cama = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
    <circle cx="7" cy="11" r="1.6" />
  </svg>
);
const Bano = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2ZM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2" />
  </svg>
);
const Persona = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

/** El plano mínimo: la casa con el norte arriba y hacia dónde mira. */
function Mini({ fachada }: { fachada: number | null }) {
  const L = 14;
  const esquinas = [
    `M10 ${10 + L}V10H${10 + L}`,
    `M${110 - L} 10H110V${10 + L}`,
    `M110 ${110 - L}V110H${110 - L}`,
    `M${10 + L} 110H10V${110 - L}`,
  ];
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={fachada === null ? "Sin orientación todavía" : `La fachada mira al ${NOMBRE_DIR[dirDe(fachada)]}`}>
      {esquinas.map((d) => (
        <path key={d} d={d} fill="none" stroke="var(--sobre-bloque)" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      <rect x="26" y="26" width="68" height="68" rx="3" fill="none" stroke="var(--cristal-oscuro-raya)" strokeWidth="1" />
      <line x1="60" y1="26" x2="60" y2="94" stroke="var(--cristal-oscuro-raya-v)" />
      <line x1="26" y1="60" x2="94" y2="60" stroke="var(--cristal-oscuro-raya-v)" />
      <text x="60" y="21" textAnchor="middle" fontSize="9" fontWeight="500" fill="var(--oro-luz)">N</text>
      {fachada !== null && (
        <g transform={`rotate(${norm(fachada)} 60 60)`}>
          <line x1="60" y1="60" x2="60" y2="30" stroke="var(--sobre-bloque)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M55 35L60 28L65 35" fill="none" stroke="var(--sobre-bloque)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="60" r="2.6" fill="var(--oro-luz)" />
        </g>
      )}
    </svg>
  );
}

export default function Escena({ e, plano, lista, carta, periodo, anio, partes, parte, alParte, alAbrir, alNuevo, alZona, persona, alPersona }: Props) {
  /* ---------------------------------------- lo que ya estaba calculado */
  const mira = e.fachada !== null ? NOMBRE_DIR[dirDe(e.fachada)] : null;
  const espalda = e.fachada !== null ? NOMBRE_DIR[dirDe(e.fachada + 180)] : null;

  const cuenta = (pred: (t: string) => boolean) => Object.values(e.estancias).reduce((n, l) => n + (l ?? []).filter(pred).length, 0);
  const dormitorios = cuenta((t) => t.startsWith("Dormitorio"));
  const banos = cuenta((t) => t === "Baño");

  /* El Kua: la persona elegida, o la primera con fecha válida. */
  const conKua = e.ocupantes.map((o) => ({ o, k: kuaDe(o) })).filter((x) => x.k);
  const elegida = conKua.find((x) => x.o.id === persona) ?? conKua[0] ?? null;
  const direcciones = elegida
    ? MANSIONES.map((m) => ({ m, dir: BA_ZHAI[elegida.k!.kua][m], buena: MANSION_BUENA[m] }))
    : [];

  /* Lo que hay que cambiar: las zonas con más propuestas, primero. */
  const zonas = carta
    ? ORDEN.map((k) => {
        const props = propuestaZona({
          casilla: k,
          montana: carta.montana[k],
          agua: carta.agua[k],
          anual: anio.carta[k],
          taiSui: k !== "C" && anio.taiSui.dir === k,
          suiPo: k !== "C" && anio.suiPo.dir === k,
          sanSha: k !== "C" && anio.sanSha === k,
        });
        return { k, props };
      })
        .filter((z) => z.props.length > 0)
        .sort((a, b) => b.props.length - a.props.length)
        .slice(0, 3)
    : [];

  return (
    <section className={s.escena} aria-label="La vivienda">
      {/* ----------------------------------------------------- el fondo */}
      {plano && <img className={s.fondo} src={plano} alt="" aria-hidden />}
      <div className={s.velo} />
      <div className={s.casa}>
        {plano ? (
          <img src={plano} alt={`Plano de la vivienda${e.cliente ? ` de ${e.cliente}` : ""}`} />
        ) : (
          <div className={s.sinPlano}>
            <p>Aquí se verá la vivienda. Sube el plano y de él sale casi todo el estudio.</p>
            <button type="button" className={s.solido} onClick={() => alParte("plano")}>
              Subir el plano
            </button>
          </div>
        )}
      </div>

      <div className={s.capa}>
        {/* ------------------------------------------- arriba a la izquierda */}
        <div className={s.arriba}>
          <div className={s.izq}>
            <div className={s.fila}>
              {lista.length > 1 ? (
                <select aria-label="Abrir otro estudio" className={`${s.select} ${s.cristal}`} value={e.id} onChange={(ev) => alAbrir(ev.target.value)}>
                  {lista.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.cliente || "Vivienda sin nombre"}
                    </option>
                  ))}
                </select>
              ) : (
                <h1 className={s.nombre}>{e.cliente || "Vivienda sin nombre"}</h1>
              )}
              <button type="button" className={`${s.boton} ${s.cristal}`} onClick={alNuevo}>
                Nuevo<span className={s.largo}>estudio</span>
              </button>
            </div>

            <div role="tablist" aria-label="Partes del estudio" className={`${s.pestanas} ${s.cristal}`}>
              {partes.map(({ k, label }) => (
                <button key={k} type="button" role="tab" aria-selected={parte === k} className={s.pestana} onClick={() => alParte(k)}>
                  {label}
                </button>
              ))}
            </div>

            <div className={s.dos}>
              <div className={s.dato}>
                <span className={s.rot}>¿Hacia dónde mira?</span>
                <span className={s.val}>{mira ?? "Sin medir"}</span>
              </div>
              <div className={s.dato}>
                <span className={s.rot}>¿De espaldas a?</span>
                <span className={s.val}>{espalda ?? "Sin medir"}</span>
              </div>
            </div>
          </div>

          <div className={s.mini}>
            <button type="button" className={s.enlace} onClick={() => alParte("plano")}>
              Ver plano →
            </button>
            <Mini fachada={e.fachada} />
          </div>
        </div>

        {/* ------------------------------------------------------ abajo */}
        <div className={s.abajo}>
          <div className={s.fichas}>
            {(
              [
                [<Cama key="c" />, dormitorios, dormitorios === 1 ? "Dormitorio" : "Dormitorios"],
                [<Bano key="b" />, banos, banos === 1 ? "Baño" : "Baños"],
                [<Persona key="p" />, e.ocupantes.length, e.ocupantes.length === 1 ? "Persona" : "Personas"],
              ] as Array<[React.ReactNode, number, string]>
            ).map(([icono, n, t]) => (
              <div key={t} className={`${s.ficha} ${s.cristal}`}>
                {icono}
                <div>
                  <b>{n || "—"}</b>
                  <span>{t}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={s.botones}>
            <button type="button" className={`${s.boton} ${s.cristal}`} disabled title="Las fotos de la casa llegan cuando el estudio se guarde en la nube">
              Fotos <small>pronto</small>
            </button>
            <button type="button" className={`${s.boton} ${s.cristal}`} onClick={() => alParte("plano")}>
              Plano
            </button>
            <button type="button" className={`${s.boton} ${s.cristal} ${s.botonBorde}`} onClick={() => alParte("brujula")}>
              Luopan
            </button>
          </div>
        </div>

        {/* ------------------------------------------------- la columna */}
        <div className={s.columna}>
          {/* 1 · LA VIVIENDA */}
          <article className={`${s.tarjeta} ${s.cristal}`}>
            <span className={s.cab}>La vivienda</span>
            <div>
              <p className={s.grande}>{e.cliente || "Sin nombre"}</p>
              <p className={s.sub}>{e.direccion || "Sin dirección"}</p>
            </div>
            <hr className={s.raya} />
            <div className={s.columnas}>
              <div>
                <b>{e.fachada !== null ? `${coma(e.fachada)}°` : "—"}</b>
                <span>Fachada</span>
              </div>
              <div>
                <b>{periodo ?? "—"}</b>
                <span>Periodo</span>
              </div>
              <div>
                <b>{e.anioObra || "—"}</b>
                <span>Obra</span>
              </div>
              <div>
                <b>{TIPO[e.tipo]}</b>
                <span>{e.planta ? `Planta ${e.planta}` : "Tipo"}</span>
              </div>
            </div>
            <div className={s.chips}>
              {carta ? (
                <>
                  <span className={s.chip}>
                    <i />
                    {FORMACION[carta.formacion].nombre}
                  </span>
                  <span className={s.chip}>
                    Asiento {carta.asiento.codigo} {carta.asiento.pinyin}
                  </span>
                </>
              ) : (
                <span className={s.chip}>Falta {e.fachada === null ? "la orientación" : "el año de obra"} para la carta</span>
              )}
              {e.lecturas.length > 0 && <span className={s.chip}>{e.lecturas.length === 1 ? "1 medida" : `${e.lecturas.length} medidas`} de luopan</span>}
            </div>
          </article>

          {/* 2 · EL NÚMERO KUA */}
          <article className={`${s.tarjeta} ${s.cristal}`}>
            <div className={s.cabFila}>
              <span className={s.cab}>El número Kua</span>
              {elegida && conKua.length > 1 && (
                <div className={s.chips} role="group" aria-label="De quién">
                  {conKua.map(({ o }) => (
                    <button key={o.id} type="button" className={s.chip} aria-pressed={o.id === elegida.o.id} onClick={() => alPersona(o.id)}>
                      {o.nombre || "Sin nombre"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {elegida ? (
              <>
                <div className={s.kua}>
                  <b>{elegida.k!.kua}</b>
                  <span className={s.sub}>
                    {elegida.o.nombre || "Esta persona"} · grupo {elegida.k!.grupo === "este" ? "Este" : "Oeste"}
                  </span>
                </div>
                <hr className={s.raya} />
                <div className={s.dirs}>
                  {[true, false].map((buena) => (
                    <div key={String(buena)}>
                      <span className={s.rot}>{buena ? "¿Qué le va bien?" : "¿Qué evitar?"}</span>
                      <ul>
                        {direcciones
                          .filter((d) => d.buena === buena)
                          .map((d) => (
                            <li key={d.m}>
                              <span>{MANSION[d.m].nombre}</span>
                              <span>{NOMBRE_DIR[d.dir]}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className={s.dosBotones}>
                  <button
                    type="button"
                    className={s.solido}
                    onClick={() => {
                      alPersona(elegida.o.id);
                      alParte("estrellas");
                    }}
                  >
                    Ver en el plano
                  </button>
                  <button type="button" className={s.borde} onClick={() => alParte("datos")}>
                    Añadir persona
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={s.sub}>
                  {e.ocupantes.length ? "Falta la fecha de nacimiento de quien vive aquí." : "Aún no hay nadie. Con la fecha de nacimiento de cada persona sale su número y sus mejores direcciones."}
                </p>
                <button type="button" className={s.borde} onClick={() => alParte("datos")}>
                  {e.ocupantes.length ? "Poner la fecha" : "Añadir persona"}
                </button>
              </>
            )}
          </article>

          {/* 3 · LO QUE HAY QUE CAMBIAR */}
          <article className={`${s.tarjeta} ${s.cristal}`}>
            <span className={s.cab}>Qué cambiar · {anio.anio}</span>
            {zonas.length > 0 ? (
              <ul className={s.zonas}>
                {zonas.map(({ k, props }) => (
                  <li key={k}>
                    <button
                      type="button"
                      className={s.zona}
                      onClick={() => {
                        alZona(k);
                        alParte("estrellas");
                      }}
                    >
                      <span className={s.miniatura} aria-hidden>
                        <b>{k === "C" ? "C" : k}</b>
                        <span>
                          {carta!.montana[k]} · {carta!.agua[k]}
                        </span>
                      </span>
                      <span className={s.zonaTexto}>
                        <b>
                          {NOMBRE_DIR[k]}
                          {props.length > 1 ? ` · ${props.length} cosas` : ""}
                        </b>
                        <span>{props[0]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.sub}>{carta ? "Este año ninguna zona pide cambios." : "Aparece cuando la vivienda tenga orientación y año de obra."}</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
