"use client";

/**
 * LOS LEADS: QUIÉN HA ENTRADO POR LA WEB.
 *
 * Es donde se cierra el círculo del proyecto entero. Alguien deja su correo en
 * la web —la prueba gratis, la lista de la comunidad, un curso, o reserva una
 * sesión por el chat— y el servidor lo guarda en Firestore antes de hacer nada
 * más. Esta pantalla lee esa misma base: lo que entra por la web aparece aquí,
 * sin que nadie tenga que copiarlo a mano.
 *
 * POR QUÉ COLUMNAS Y NO UNA LISTA CON FILTROS
 * ---------------------------------------------------------------------------
 * Aquí había una lista con cuatro botones encima para filtrarla, y no se
 * entendía. El motivo es que una lista filtrada enseña UN montón cada vez, y lo
 * que hay que ver de un embudo es la FORMA de todos a la vez: si hay veinte
 * esperando en «nuevo» y ninguno en «le has escrito», eso es un problema, y con
 * filtros hacen falta cuatro clics y memoria para darse cuenta. En columnas se
 * ve sin leer una palabra.
 *
 * Y sobre todo: con filtros, mover a alguien era entrar en su ficha y pulsar un
 * botón de una lista de cuatro. Aquí se arrastra la tarjeta a la columna de al
 * lado. El trabajo de este panel es mover gente de izquierda a derecha, así que
 * la pantalla tenía que estar hecha de izquierda a derecha.
 *
 * DOS COSAS DISTINTAS SOBRE DE DÓNDE VIENE CADA UNO
 * ---------------------------------------------------------------------------
 * El FORMULARIO por el que entró lo sabe el sistema —lo escribe la web— y el
 * CANAL por el que llegó a la web no lo sabe nadie más que Iris, porque se
 * entera hablando con la persona. Las dos preguntas se parecen y no son la
 * misma: «pidió la prueba gratis» no dice si la mandó una clienta o la vio en
 * un anuncio, que es lo que decide dónde merece la pena poner el tiempo.
 *
 * Aquí eso se traduce en tres sitios: la ficha, donde se pone con un clic; la
 * tarjeta, donde se lee sin abrir nada; y el renglón de arriba, que dice cuánta
 * gente llega por cada uno. El tercero es el que sostiene al primero — un campo
 * que se rellena y no devuelve nada deja de rellenarse.
 *
 * ARRASTRAR NO PUEDE SER LA ÚNICA FORMA. Arrastrar no existe con el teclado y
 * es incómodo en un móvil, así que cada tarjeta abre su ficha al pulsarla y
 * desde ahí se mueve con botones. Lo mismo, por otro camino.
 *
 * SIN FIREBASE ESTÁ VACÍA A PROPÓSITO. No hay versión local de los leads: un
 * lead sólo puede nacer de un formulario real de la web guardándose en la nube,
 * así que sin nube no hay nada que enseñar — y decirlo es más honesto que
 * fingir una lista de prueba.
 */

import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { hayFirebase } from "@/lib/firebase";
import { hace, diasEntre } from "@/lib/despacho/fechas";
import {
  CANALES_LEAD,
  ESTADOS_LEAD,
  anotaLead,
  mueveLead,
  ponCanal,
  ultimosLeads,
  type CanalLead,
  type EstadoLead,
  type Lead,
} from "@/lib/despacho/leads";
import { APOYO, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, rotulo, tarjetaCon } from "@/lib/ui";
import { Avatar, Cabecera } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";

/**
 * EL MARCO DE LA PÁGINA ES EL MISMO QUE EL DE LAS OTRAS TRES.
 *
 * Esta pantalla tenía el suyo: 1180 px de ancho en la rama sin conectar, 1400
 * en la de trabajo, un `padding` de `--gutter` por los cuatro lados y un título
 * de `--t-hero` escrito a mano. Las otras tres del despacho usan 1320, el
 * `padding` de arriba corto y el título de `Cabecera`.
 *
 * Eso se veía: al pasar de Agenda a Leads el título saltaba once píxeles a la
 * derecha y crecía catorce, y la página entera se estrechaba ciento cuarenta.
 * Cuatro pantallas que son la misma herramienta y que no empiezan en el mismo
 * sitio se leen como cuatro sitios distintos.
 */
const MARCO = "max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;";

/** Cómo se llama cada origen cuando se le enseña a Iris. */
const ORIGENES: Record<string, string> = {
  sinergia: "La prueba gratis",
  membresia: "Lista de espera",
  curso: "Un curso",
  reserva: "Reservó una sesión",
};

const origenLegible = (o: string) => ORIGENES[o] || o;

const cortoCanal = (k: CanalLead) => CANALES_LEAD.find((c) => c.k === k)?.corto ?? "";

/**
 * LO QUE DICE LA SEGUNDA LÍNEA DE UNA TARJETA: DE DÓNDE SALIÓ Y POR DÓNDE ENTRÓ.
 *
 * Son dos datos distintos y los dos hacen falta, pero un cuarto renglón ahoga
 * la tarjeta —ya lleva nombre, esto y el cuándo—. Así que van en el mismo, con
 * una flecha entre medias: se lee como el camino que hizo la persona, «la vio en
 * Instagram y acabó pidiendo la prueba gratis», que es exactamente lo que es.
 *
 * Mientras el canal esté sin decir, la línea es la de siempre: el formulario y
 * nada más. La tarjeta no enseña un hueco ni un «sin especificar» — sólo gana
 * información cuando Iris la pone, que es lo que hace que valga la pena ponerla.
 */
const deDondeYPorDonde = (l: Lead) => {
  const canal = cortoCanal(l.canal);
  return canal ? `${canal} → ${origenLegible(l.origen)}` : origenLegible(l.origen);
};

/**
 * El color de cada columna. Marca el hilo de arriba y el número, nunca rellena:
 * cuatro columnas con cuatro fondos de color son cuatro carteles peleándose, y
 * lo que tiene que destacar en esta pantalla son las personas.
 */
const COLOR_ESTADO: Record<EstadoLead, string> = {
  nuevo: "var(--accion)",
  contactado: "var(--gold)",
  cliente: "var(--green)",
  descartado: "var(--text-4)",
};

export default function LeadsScreen() {
  const conNube = hayFirebase();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  /** Sobre qué columna está ahora mismo la tarjeta que se arrastra. */
  const [encima, setEncima] = useState<EstadoLead | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  const carga = () => {
    if (!conNube) return;
    ultimosLeads().then(setLeads);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carga, [conNube]);

  const activo = useMemo(() => leads?.find((l) => l.id === abierto) ?? null, [leads, abierto]);

  useEffect(() => {
    setNota(activo?.nota ?? "");
  }, [activo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Escape y el clic en el velo cierran la ficha, y de eso se encarga
     `HojaLateral`: es la misma salida que en las otras tres pantallas y no hace
     falta —ni conviene— que ésta se la escriba por su cuenta. */

  const porEstado = (e: EstadoLead) => leads?.filter((l) => l.estado === e) ?? [];

  const cambiaEstado = async (id: string, estado: EstadoLead) => {
    // Optimista: se ve el cambio al momento y si algo falla se recarga de la
    // base, que es la única fuente de verdad — no se deja la pantalla mintiendo.
    setLeads((s) => s?.map((l) => (l.id === id ? { ...l, estado } : l)) ?? s);
    try {
      await mueveLead(id, estado);
    } catch {
      carga();
    }
  };

  /* Igual que mover de estado, y a propósito: una escritura de un campo, la
     pantalla pintada al momento y la base como única fuente de verdad si algo
     falla. Poner de dónde salió alguien tiene que costar lo mismo que moverlo
     de columna — un clic— o no se pondrá nunca. */
  const cambiaCanal = async (id: string, canal: CanalLead) => {
    setLeads((s) => s?.map((l) => (l.id === id ? { ...l, canal } : l)) ?? s);
    try {
      await ponCanal(id, canal);
    } catch {
      carga();
    }
  };

  /**
   * CUÁNTA GENTE LLEGA POR CADA CANAL.
   *
   * Es la mitad que devuelve el favor: pedirle a Iris que rellene un campo que
   * no le contesta nada acaba con el campo sin rellenar en una semana. Aquí, en
   * cuanto pone tres, ya ve por dónde le entra la gente.
   *
   * De mayor a menor y sólo los que tienen a alguien: una lista fija con ceros
   * sería un cuadro de mandos, y esto es un renglón. «No lo sé» va al final
   * aunque sea el más gordo —que lo va a ser— porque no es un canal: es lo que
   * falta por saber, y ponerlo primero taparía la respuesta con la pregunta.
   */
  const porCanal = useMemo(() => {
    if (!leads?.length) return [];
    return CANALES_LEAD.map((c) => ({ ...c, n: leads.filter((l) => l.canal === c.k).length }))
      .filter((c) => c.n > 0)
      .sort((a, b) => (a.k === "nose" ? 1 : b.k === "nose" ? -1 : b.n - a.n));
  }, [leads]);

  const guardaNota = async () => {
    if (!activo) return;
    setGuardando(true);
    try {
      await anotaLead(activo.id, nota);
      setLeads((s) => s?.map((l) => (l.id === activo.id ? { ...l, nota } : l)) ?? s);
    } finally {
      setGuardando(false);
    }
  };

  const total = leads?.length ?? 0;

  if (!conNube) {
    return (
      <main style={css(MARCO)}>
        <Cabecera titulo="Leads" pie="Los que dejan su correo en la web caen aquí." />
        {/*
            SIN RAYA ROJA, Y NO ES UN DESCUIDO.
            Estaba en una tarjeta con el canto rojo, como los avisos de lo que se
            puede perder. Pero esto no es una avería ni algo urgente: es el
            estado normal de una instalación a la que todavía no le han puesto
            las claves, y sale IGUAL cada vez que se entra. Un rojo permanente
            deja de significar «mira esto» y pasa a ser el color de esta
            pantalla — y el día que haya una alarma de verdad, ya no avisará.
        */}
        {/* La tarjeta se acota al ancho de lo que dice. Estirada a los mil
            quinientos píxeles de la página, tres renglones de texto dentro de
            una caja vacía se leen como una franja de aviso, no como una
            explicación. */}
        <section style={css(TARJETA + PAD + "max-width:62ch;")}>
          <div style={css(rotulo() + "margin-bottom:var(--s2);")}>Todavía sin conectar</div>
          <p style={css(APOYO + "margin:0;")}>
            Esta pantalla lee de Firebase. Mientras no estén puestas sus claves aquí no aparece nadie — y lo que se apunte en la
            web sigue guardándose igual, así que no se pierde nada por el camino.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={css(MARCO)}>
      {/*
          LA CABECERA, LA MISMA DE LAS OTRAS TRES.
          Había aquí dos frases explicando qué es un lead y que la lista se llena
          sola. Se lee una vez, el primer día, y después son dos renglones que
          empujan hacia abajo lo único que importa —la gente— en todas las visitas
          restantes. Lo que la pantalla hace se ve haciéndolo.

          La cuenta va donde `Cabecera` pone el pie: es lo que se quiere saber al
          llegar y no hace falta una frase para decirlo.
      */}
      <Cabecera titulo="Leads" pie={total === 0 ? "Nadie todavía" : total === 1 ? "1 persona" : `${total} personas`} />

      {/* El recuento por canal: un renglón, sin tarjeta y sin dibujo. Lo que se
          quiere saber es el reparto, y el reparto de seis cifras se ve leyéndolas
          — una gráfica de seis barras ocuparía media pantalla para decir lo
          mismo y convertiría el embudo en un panel de estadísticas. */}
      {porCanal.length > 0 && (
        <div style={css("display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--s2) var(--s5);margin:calc(var(--gap-lg) * -1 + var(--s2)) 0 var(--gap);")}>
          <span style={css(rotulo("var(--gold)"))}>De dónde llegan</span>
          {porCanal.map((c) => (
            <span key={c.k} style={css("display:inline-flex;align-items:baseline;gap:6px;font-size:var(--t-mini);color:var(--text-3);")}>
              {/* El nombre corto, el mismo que va en la tarjeta. Con los largos
                  —«Te la mandó alguien», «Un taller o un evento»— el renglón se
                  partía en tres en un teléfono, y un recuento que ocupa tres
                  renglones ya no es un recuento: es un párrafo. */}
              {c.corto || c.label}
              <span data-cifras="" style={css("font-weight:640;color:var(--text);")}>
                {c.n}
              </span>
            </span>
          ))}
        </div>
      )}

      {leads === null ? (
        <div style={css(TARJETA + PAD)}>
          <p style={css(APOYO + "margin:0;")}>Mirando en Firebase…</p>
        </div>
      ) : (
        <div
          style={css(
            "display:grid;gap:var(--gap);align-items:start;" +
              /* Cuatro carriles que no se estrechan por debajo de lo legible: si no
                 caben, la fila se desplaza en horizontal en vez de aplastar las
                 tarjetas hasta que el nombre de alguien no cabe. */
              "grid-auto-flow:column;grid-auto-columns:minmax(238px,1fr);overflow-x:auto;padding-bottom:4px;"
          )}
        >
          {ESTADOS_LEAD.map((e) => {
            const dentro = porEstado(e.k);
            const marcada = encima === e.k;
            return (
              <section
                key={e.k}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  if (encima !== e.k) setEncima(e.k);
                }}
                onDragLeave={() => setEncima((c) => (c === e.k ? null : c))}
                onDrop={(ev) => {
                  ev.preventDefault();
                  setEncima(null);
                  const id = ev.dataTransfer.getData("text/plain");
                  if (id) cambiaEstado(id, e.k);
                }}
                style={css(
                  "display:flex;flex-direction:column;gap:10px;min-height:180px;border-radius:var(--r);padding:4px;" +
                    /* La columna sólo se ilumina mientras hay algo encima. En
                       reposo no tiene fondo: cuatro cajas grises no dicen nada,
                       y lo que separa las columnas es el aire entre ellas. */
                    (marcada
                      ? "background:var(--accion-suave);outline:1px dashed var(--accion-borde);"
                      : "background:transparent;outline:1px dashed transparent;") +
                    "transition:background .18s ease,outline-color .18s ease;"
                )}
              >
                <header style={css("display:flex;align-items:center;gap:8px;padding:2px 6px 8px;")}>
                  <span style={css("width:6px;height:6px;border-radius:50%;flex:none;background:" + COLOR_ESTADO[e.k] + ";")} />
                  <span style={css("font-size:var(--t-mini);font-weight:640;letter-spacing:.02em;color:var(--text-2);")}>
                    {e.label}
                  </span>
                  <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:640;color:var(--text-4);font-variant-numeric:tabular-nums;")}>
                    {dentro.length}
                  </span>
                </header>

                {dentro.length === 0 ? (
                  /* Un hueco marcado, no un texto. Dice «aquí caben cosas» y a la
                     vez enseña dónde soltar mientras se arrastra. */
                  <div
                    style={css(
                      "border:1px dashed var(--border);border-radius:var(--r);min-height:64px;display:grid;place-items:center;" +
                        "font-size:var(--t-mini);color:var(--text-4);"
                    )}
                  >
                    —
                  </div>
                ) : (
                  dentro.map((l) => {
                    const dias = l.visto ? diasEntre(l.visto, new Date()) : 0;
                    const yendo = arrastrando === l.id;
                    return (
                      <button
                        key={l.id}
                        draggable
                        onDragStart={(ev) => {
                          ev.dataTransfer.setData("text/plain", l.id);
                          ev.dataTransfer.effectAllowed = "move";
                          setArrastrando(l.id);
                        }}
                        onDragEnd={() => {
                          setArrastrando(null);
                          setEncima(null);
                        }}
                        onClick={() => setAbierto(l.id)}
                        style={css(
                          /* La raya del color de la columna la pone
                             `tarjetaCon`: escrita a mano como `border-left`,
                             con el canto blando de la casa se convertía en una
                             coma envolviendo la tarjeta. El porqué entero está
                             en `lib/ui.ts`. */
                          tarjetaCon(COLOR_ESTADO[e.k]) +
                            "text-align:left;padding:12px 13px 12px 20px;cursor:grab;display:flex;gap:10px;align-items:flex-start;" +
                            (yendo ? "opacity:.45;" : "opacity:1;") +
                            (abierto === l.id ? "outline:2px solid var(--accion);outline-offset:-2px;" : "") +
                            "transition:opacity .15s ease,transform .15s ease;"
                        )}
                      >
                        <Avatar nombre={l.nombre || l.email} tamano={28} />
                        <span style={css("min-width:0;flex:1;")}>
                          <span style={css("display:block;font-size:var(--t-body);font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                            {l.nombre || l.email}
                          </span>
                          <span
                            title={deDondeYPorDonde(l)}
                            style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}
                          >
                            {deDondeYPorDonde(l)}
                          </span>
                          <span style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:4px;")}>
                            {l.visto ? hace(dias) : ""}
                            {l.veces > 1 ? ` · ${l.veces}×` : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </section>
            );
          })}
        </div>
      )}

      {/*
          LA FICHA, ENCIMA Y NO AL LADO.
          Una columna fija a la derecha se comía un tercio del ancho SIEMPRE, y
          las tres cuartas partes del tiempo enseñaba «elige a alguien de la
          lista». El embudo necesita ese ancho; la ficha sólo aparece cuando hace
          falta y se quita con Escape.

          Y ES LA MISMA HOJA QUE EN LAS OTRAS TRES PANTALLAS. Aquí estaba escrita
          a mano: 380 px en vez de 580, velo negro plano en vez del velo cálido y
          desenfocado, cabecera que se iba con el scroll, una × de 19 px en la
          esquina en vez del botón de 44, y su propio manejo de Escape. Era la
          misma acción —abrir a alguien— con otra forma según la pantalla, y con
          su propio código que mantener. `HojaLateral` ya resolvía todo eso.
      */}
      <HojaLateral
        abierta={Boolean(activo)}
        cerrar={() => setAbierto(null)}
        titulo={activo ? activo.nombre || "Sin nombre" : ""}
        pie={activo ? origenLegible(activo.origen) : undefined}
      >
        {activo && (
          <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
            <div style={css("display:flex;flex-direction:column;gap:8px;font-size:var(--t-body);")}>
              <a href={`mailto:${activo.email}`} style={css("color:var(--accion);text-decoration:none;overflow-wrap:anywhere;")}>
                {activo.email}
              </a>
              {activo.whatsapp && (
                <a href={`https://wa.me/${activo.whatsapp.replace(/\D/g, "")}`} style={css("color:var(--accion);text-decoration:none;")}>
                  {activo.whatsapp} · WhatsApp
                </a>
              )}
              {activo.detalle && <div style={css(NOTA + "line-height:1.5;")}>{activo.detalle}</div>}
            </div>

            <div style={css(RAYA)} />

            <div>
              <div style={css(rotulo() + "margin-bottom:8px;")}>Mover a</div>
              <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                {ESTADOS_LEAD.map((e) => (
                  <button
                    key={e.k}
                    onClick={() => cambiaEstado(activo.id, e.k)}
                    title={e.que}
                    aria-pressed={activo.estado === e.k}
                    style={css(
                      "padding:7px 13px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:590;cursor:pointer;" +
                        (activo.estado === e.k
                          ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
                          : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={css(RAYA)} />

            {/*
                DE DÓNDE SALIÓ: LO MISMO QUE «MOVER A», POR DEBAJO.
                Mismas pastillas, mismo granate para la puesta, misma escritura
                de un campo. No es un formulario aparte ni un desplegable: se
                pregunta al teléfono —«¿y tú de qué me conoces?»— y se pulsa
                mientras se habla. Cualquier cosa que pida más de un clic se
                queda sin rellenar.

                Va DESPUÉS del estado a propósito: mover a alguien de columna es
                el trabajo del embudo y tiene que seguir siendo lo primero que se
                encuentra al abrir la ficha.
            */}
            <div>
              <div style={css(rotulo() + "margin-bottom:8px;")}>De dónde salió</div>
              <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                {CANALES_LEAD.map((c) => (
                  <button
                    key={c.k}
                    onClick={() => cambiaCanal(activo.id, c.k)}
                    aria-pressed={activo.canal === c.k}
                    style={css(
                      "padding:7px 13px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:590;cursor:pointer;" +
                        (activo.canal === c.k
                          ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
                          : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={css(RAYA)} />

            <div>
              <div style={css(rotulo() + "margin-bottom:8px;")}>Lo que apuntas</div>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Qué se dijo, qué quedó pendiente…"
                rows={5}
                style={css("width:100%;padding:11px 13px;font-family:var(--font-ui);font-size:var(--t-body);color:var(--text);resize:vertical;")}
              />
              <button onClick={guardaNota} disabled={guardando} style={css(BOTON_PLANO + "margin-top:10px;")}>
                {guardando ? "Guardando…" : "Guardar la nota"}
              </button>
            </div>
          </div>
        )}
      </HojaLateral>
    </main>
  );
}
