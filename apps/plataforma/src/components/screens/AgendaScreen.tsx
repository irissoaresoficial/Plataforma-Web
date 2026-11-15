"use client";

/**
 * LA AGENDA
 *
 * QUÉ ERA Y POR QUÉ AHORA ES UNA REJILLA.
 *
 * Eran dos listas —lo de hoy y lo que queda de semana— y un formulario al lado.
 * Contestaba bien «¿a quién veo hoy?», y esa parte se ha conservado entera. Lo
 * que no contestaba de ninguna manera era la otra mitad del trabajo: «¿tengo
 * hueco el jueves por la tarde?». En una lista los huecos no se ven, porque un
 * hueco es justamente lo que no está escrito, y ésa es la pregunta que hay que
 * contestar por teléfono con la persona esperando al otro lado.
 *
 * Una rejilla con las horas en vertical enseña el hueco y la sesión con el
 * mismo golpe de vista. Y además deja apuntar señalando: se pulsa el rato vacío
 * del jueves a las seis y el formulario se abre con el día y la hora puestos.
 *
 * LO QUE NO SE HA PERDIDO AL CAMBIAR DE FORMA:
 *
 *  · Apuntar una sesión con sólo el nombre, y que a quien no esté fichado se le
 *    abra la ficha sola. Es lo que hace que la lista de clientes se llene sin
 *    que nadie se siente a dar de alta a nadie.
 *  · El recado que llega desde la ficha de alguien: «Apuntarle una sesión» abre
 *    el formulario con su nombre escrito.
 *  · Las frases de siempre —«Hoy tienes 3 sesiones»— y los huecos que dicen qué
 *    hacer en vez de decir que no hay datos.
 *
 * Y UNA COSA QUE FALTABA: quitar una sesión se hacía de un clic y sin preguntar.
 * Ahora pasa por `Confirmar`, como todo lo que destruye en esta casa.
 *
 * EN UN MÓVIL NO CABEN SIETE COLUMNAS DE HORAS. Por debajo de 860 px la semana
 * se pinta como lista por días —que es como se lee una agenda en la mano— y la
 * rejilla se reserva para un día, que es donde las horas y los huecos importan
 * de verdad. No es un apaño: es que en 390 px un día ocupa la pantalla entera y
 * se lee perfectamente, y siete no se leen de ninguna manera.
 *
 * No toca `localStorage`: pide las citas y los clientes a los repositorios de
 * `lib/despacho`. El día que eso sea Firebase, este archivo no cambia.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_PLANO, NOTA, PAD_SM, RAYA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import Confirmar from "../Confirmar";
import { AvisoNavegador, Estado, Vacio, useEstrecho } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";
import MiniCalendario from "../despacho/MiniCalendario";
import RejillaSemana, { COLOR_TIPO } from "../despacho/RejillaSemana";
import {
  citas as repoCitas,
  clientes as repoClientes,
  abreDia,
  abreSemana,
  cierraDia,
  claveDia,
  cuadriculaDelMes,
  deClave,
  diaLargo,
  diaRelativo,
  diaYMes,
  duracion,
  etiquetaTipo,
  hora,
  instante,
  masDias,
  masMeses,
  mesYAno,
  nuevoId,
  proximaMediaHora,
  semanaDe,
  sinTildes,
  TIPOS_CITA,
  type Cita,
  type Cliente,
} from "@/lib/despacho";

/** Lo que dura una sesión por defecto. Es lo mismo que reserva la web en el
 *  Apps Script (`DURATION_MIN`), para que las dos mitades no discrepen. */
const DURACION_NORMAL = 90;

const DURACIONES = [30, 45, 60, 90, 120];

/** El color de cada estado. Marca, no rellena: sólo tiñe la letra. */
const COLOR_ESTADO: Record<Cita["estado"], string> = {
  pedida: "var(--gold)",
  confirmada: "var(--text-3)",
  hecha: "var(--green)",
  anulada: "var(--red)",
};

type Vista = "dia" | "semana" | "mes";

const VISTAS: Array<{ k: Vista; label: string }> = [
  { k: "dia", label: "Día" },
  { k: "semana", label: "Semana" },
  { k: "mes", label: "Mes" },
];

/** Lo que se está mirando en la hoja lateral: nada, el hueco de apuntar, o una
 *  sesión concreta. Un solo estado y no tres banderas: así no puede haber dos
 *  hojas abiertas a la vez. */
type Hoja = null | { modo: "apuntar" } | { modo: "sesion"; id: string };

export default function AgendaScreen() {
  const { setView, setClienteAbierto, recado, setRecado } = useApp();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [gente, setGente] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  /** El día sobre el que se está: manda en las tres vistas. En «semana» se pinta
   *  su semana; en «mes», su mes. Un solo ancla y no tres evita que al volver de
   *  la vista de mes se aterrice en una semana distinta de la que se dejó. */
  const [ancla, setAncla] = useState<Date | null>(null);
  const [vista, setVista] = useState<Vista>("semana");
  const [hoja, setHoja] = useState<Hoja>(null);

  // Los filtros son de verdad: quitan bloques de la rejilla. Empiezan con todo
  // encendido menos las anuladas, que son las que ya no ocupan hora.
  const [tipos, setTipos] = useState<Array<Cita["tipo"]>>(TIPOS_CITA.map((t) => t.k));
  const [verAnuladas, setVerAnuladas] = useState(false);
  const [verFiltros, setVerFiltros] = useState(false);
  /** En el móvil el mes va plegado a su semana; se abre con su botón. */
  const [mesAbierto, setMesAbierto] = useState(false);

  // El formulario. La fecha arranca en hoy y la hora en la media hora
  // siguiente: es lo que casi siempre se quiere y ahorra teclear.
  const [nombre, setNombre] = useState("");
  const [dia, setDia] = useState("");
  const [horaTexto, setHoraTexto] = useState("");
  const [minutos, setMinutos] = useState(DURACION_NORMAL);
  const [tipo, setTipo] = useState<Cita["tipo"]>("sesion");
  const [notas, setNotas] = useState("");

  const estrecho = useEstrecho(860);
  const quieto = useReducedMotion();

  const recargar = useCallback(async () => {
    // Se piden las dos a la vez: la lista de nombres hace falta para poder
    // escribir a quién es cada cita.
    const [c, g] = await Promise.all([repoCitas.listar(), repoClientes.listar()]);
    setCitas(c);
    setGente(g);
    setCargando(false);
  }, []);

  /* El almacenamiento vive en el equipo y el servidor no puede verlo: si se
     leyera en el primer render, el HTML de servidor y el del navegador no
     coincidirían. Se pide al montar, como hace `app-context` con el historial.
     Y con la fecha de hoy pasa lo mismo: el servidor y este equipo pueden estar
     en días distintos, así que el ancla tampoco puede sembrarse en el estado
     inicial. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recargar();
    const hoy = new Date();
    setAncla(hoy);
    setDia(claveDia(hoy));
    setHoraTexto(proximaMediaHora());
  }, [recargar]);

  /*
   * SI SE VIENE DE UNA FICHA, EL NOMBRE YA ESTÁ PUESTO Y EL HUECO ABIERTO.
   *
   * «Apuntarle una sesión» desde la ficha de alguien tiene que llegar aquí con
   * su nombre escrito: si hubiera que volver a teclearlo, el botón sólo habría
   * cambiado de pantalla. Se recoge el recado y se apaga en el acto — dejarlo
   * puesto haría que la siguiente visita a la agenda apareciera con un nombre
   * que nadie ha pedido.
   */
  useEffect(() => {
    if (!recado) return;
    setNombre(recado);
    setHoja({ modo: "apuntar" });
    setRecado(null);
  }, [recado, setRecado]);

  /*
   * EN UN MÓVIL SE ENTRA POR EL DÍA, PERO LA SEMANA SIGUE ESTANDO.
   *
   * Lo que se mira en un teléfono entre sesión y sesión es el día de hoy, así
   * que al entrar desde un ancho estrecho se abre en «Día». Lo que NO se hace
   * es prohibir la semana: pulsando «Semana» se ve entera, en forma de lista
   * por días —la rejilla de siete columnas no cabe en 390 px, la lista sí—.
   *
   * De ahí el testigo: sin él, esto devolvería a «Día» en cuanto ella pulsara
   * «Semana», y el botón se quedaría sin funcionar sin decir por qué.
   */
  const vistaElegidaAMano = useRef(false);
  useEffect(() => {
    if (estrecho && !vistaElegidaAMano.current && vista === "semana") setVista("dia");
  }, [estrecho, vista]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const elegirVista = (v: Vista) => {
    vistaElegidaAMano.current = true;
    setVista(v);
  };

  const nombreDe = useCallback(
    (personaId: string) => gente.find((g) => g.id === personaId)?.nombre ?? "Sin nombre",
    [gente]
  );

  /* ------------------------------------------------------------- lo que se ve */

  /** Las sesiones que pasan el filtro. Se calcula una vez y lo usan la rejilla,
   *  la lista, el mes y los puntos del calendario pequeño: si cada uno filtrara
   *  por su cuenta, el punto del día 24 diría que hay algo y la rejilla de ese
   *  día saldría vacía. */
  const visibles = useMemo(
    () => citas.filter((c) => tipos.includes(c.tipo) && (verAnuladas || c.estado !== "anulada")),
    [citas, tipos, verAnuladas]
  );

  const diasVisibles = useMemo(() => {
    if (!ancla) return [];
    return vista === "semana" ? semanaDe(ancla) : [abreDia(ancla)];
  }, [ancla, vista]);

  /** Los días que llevan un punto en el calendario pequeño. */
  const diasConSesion = useMemo(() => new Set(visibles.map((c) => claveDia(new Date(c.inicioISO)))), [visibles]);

  /** Lo que queda de hoy, que es la frase con la que se abre la pantalla. */
  const hoyQuedan = useMemo(() => {
    const ahora = new Date();
    return citas.filter(
      (c) =>
        c.estado !== "anulada" &&
        c.inicioISO >= abreDia(ahora).toISOString() &&
        c.inicioISO <= cierraDia(ahora).toISOString()
    ).length;
  }, [citas]);

  /** Lo que hay en los días que se están viendo, ordenado por hora. Es lo que
   *  usa la lista de la pantalla estrecha. */
  const enLosDias = useMemo(() => {
    const claves = new Set(diasVisibles.map(claveDia));
    return visibles
      .filter((c) => claves.has(claveDia(new Date(c.inicioISO))))
      .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
  }, [visibles, diasVisibles]);

  const sesionAbierta = useMemo(
    () => (hoja?.modo === "sesion" ? citas.find((c) => c.id === hoja.id) ?? null : null),
    [hoja, citas]
  );

  /* ---------------------------------------------------------- ir de un sitio a otro */

  /** Un paso adelante o atrás, con el tamaño de lo que se esté mirando: un día,
   *  una semana o un mes. Es lo que esperan las flechas sin tener que pensarlo. */
  const mover = (paso: -1 | 1) => {
    if (!ancla) return;
    if (vista === "mes") return setAncla(masMeses(ancla, paso));
    setAncla(masDias(ancla, vista === "semana" ? 7 * paso : paso));
  };

  /** Qué pone entre las flechas. Dice el tramo entero, no el día de en medio. */
  const tituloDelTramo = () => {
    if (!ancla) return "";
    if (vista === "mes") return mesYAno(ancla).replace(/^./, (c) => c.toLocaleUpperCase("es"));
    if (vista === "dia") {
      // «Hoy» a secas, al lado del botón que también dice «Hoy», se lee como si
      // fueran lo mismo. Con la fecha detrás se sabe qué día se está mirando.
      const relativo = diaRelativo(ancla);
      return relativo === "Hoy" || relativo === "Mañana" ? `${relativo}, ${diaYMes(ancla)}` : relativo;
    }
    const l = abreSemana(ancla);
    const d = masDias(l, 6);
    return `${l.getDate()} – ${diaYMes(d)}`;
  };

  /* --------------------------------------------------------------- escrituras */

  const abrirHueco = (d: Date, minutosDelDia: number) => {
    setDia(claveDia(d));
    setHoraTexto(`${String(Math.floor(minutosDelDia / 60)).padStart(2, "0")}:${String(minutosDelDia % 60).padStart(2, "0")}`);
    setAviso("");
    setHoja({ modo: "apuntar" });
  };

  const apuntar = async () => {
    if (!nombre.trim()) return setAviso("Falta con quién es la sesión.");
    if (!dia) return setAviso("Falta el día.");

    // Si el nombre no es de nadie conocido, se le abre ficha en el momento.
    // Es lo que hace que la lista de clientes se llene sola: nadie se sienta a
    // dar de alta a la gente, la da de alta apuntando su sesión.
    const buscado = sinTildes(nombre);
    let persona = gente.find((g) => sinTildes(g.nombre) === buscado);
    const esNueva = !persona;
    if (!persona) {
      persona = await repoClientes.guardar({
        id: nuevoId(),
        nombre: nombre.trim(),
        email: "",
        origen: "a-mano",
        etiquetas: [],
        // Nadie ha firmado nada: se apunta como está, sin inventar un
        // consentimiento que no existe. Ver `lib/despacho/tipos.ts`.
        consentimiento: null,
        notas: [],
        creada: new Date().toISOString(),
        actualizada: new Date().toISOString(),
      });
    }

    const inicioISO = instante(dia, horaTexto);
    await repoCitas.guardar({
      id: nuevoId(),
      personaId: persona.id,
      inicioISO,
      minutos,
      tipo,
      // La apunta Iris a mano, así que ya está confirmada. «Pedida» se reserva
      // para lo que entre por la web sin que ella la haya mirado.
      estado: "confirmada",
      notas: notas.trim() || undefined,
      creada: new Date().toISOString(),
    });

    setAviso(
      `Apuntada: ${persona.nombre}, ${diaRelativo(deClave(dia)).toLocaleLowerCase("es")} a las ${hora(inicioISO)}.` +
        (esNueva ? ` ${persona.nombre} se ha añadido también a tus clientes.` : "")
    );
    setNombre("");
    setNotas("");
    // La rejilla salta al día de lo que se acaba de apuntar: si no, se guarda
    // algo para el jueves y la pantalla sigue enseñando el martes, que parece
    // que no ha pasado nada.
    setAncla(deClave(dia));
    await recargar();
  };

  const marcarHecha = async (c: Cita) => {
    await repoCitas.guardar({ ...c, estado: "hecha" });
    await recargar();
  };

  /**
   * CONFIRMAR UNA SESIÓN QUE HA ENTRADO POR LA WEB.
   *
   * Faltaba, y por eso faltaba también el aviso: una cita que entra sola se
   * pintaba «Por confirmar» y no había forma de confirmarla desde ningún sitio.
   * Iris veía la etiqueta, no podía hacer nada con ella, y la etiqueta se
   * quedaba ahí para siempre — con lo cual dejaba de significar nada.
   *
   * Confirmar no manda ningún correo. Es la decisión de Iris sobre su propia
   * agenda: «esta hora la doy por buena». Quien reservó ya recibió su
   * invitación de Google cuando reservó.
   */
  const confirmar = async (c: Cita) => {
    await repoCitas.guardar({ ...c, estado: "confirmada" });
    setAviso(`Confirmada: ${nombreDe(c.personaId)}, ${diaRelativo(new Date(c.inicioISO)).toLocaleLowerCase("es")} a las ${hora(c.inicioISO)}.`);
    await recargar();
  };

  const quitar = async (c: Cita) => {
    await repoCitas.borrar(c.id);
    setHoja(null);
    setAviso("Sesión quitada de la agenda.");
    await recargar();
  };

  /* ------------------------------------------------------------------ piezas */

  const campo = (etiqueta: string, hijo: React.ReactNode) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css(rotulo())}>{etiqueta}</span>
      {hijo}
    </label>
  );

  const entrada = "width:100%;min-width:0;padding:11px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-read);";

  /** Una sesión en la lista de la pantalla estrecha: la hora manda, el nombre y
   *  la cara identifican, y se abre pulsando. */
  const fila = (c: Cita, i: number) => (
    <motion.button
      key={c.id}
      initial={quieto ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setHoja({ modo: "sesion", id: c.id })}
      style={css(
        "display:flex;align-items:center;gap:var(--s3);width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:inherit;padding:var(--s3) 0;" +
          (i ? RAYA : "")
      )}
    >
      <span
        data-cifras=""
        style={css("flex:none;min-width:48px;font-size:var(--t-read);font-weight:600;color:var(--text);letter-spacing:-.01em;")}
      >
        {hora(c.inicioISO)}
      </span>
      {/* La inicial en el color de su clase: el mismo que el bloque de la
          rejilla, para que lista y rejilla se lean igual. */}
      <span
        aria-hidden="true"
        style={css(
          `flex:none;display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:var(--t-mini);font-weight:500;` +
            (c.estado === "anulada"
              ? "background:var(--surface-2);color:var(--text-3);"
              : `background:${COLOR_TIPO[c.tipo].fondo};color:${COLOR_TIPO[c.tipo].tinta};`) +
            (c.estado === "pedida" ? `outline:1.5px dashed ${COLOR_TIPO[c.tipo].fondo};outline-offset:2px;` : "")
        )}
      >
        {(nombreDe(c.personaId).trim().charAt(0) || "?").toLocaleUpperCase("es")}
      </span>
      <span style={css("flex:1 1 auto;min-width:0;")}>
        <span style={css("display:block;font-size:var(--t-read);color:var(--text);overflow-wrap:anywhere;")}>
          {nombreDe(c.personaId)}
        </span>
        <span style={css(NOTA + "display:block;margin-top:2px;")}>
          {etiquetaTipo(c.tipo)} · {duracion(c.minutos)}
          {c.notas ? ` · ${c.notas}` : ""}
        </span>
      </span>
      <Estado
        texto={c.estado === "hecha" ? "Hecha" : c.estado === "pedida" ? "Por confirmar" : c.estado === "anulada" ? "Anulada" : "Confirmada"}
        color={COLOR_ESTADO[c.estado]}
      />
    </motion.button>
  );

  /** La semana como lista, agrupada por día. Una lista corrida de siete días no
   *  se lee: hay que ver dónde acaba el jueves y empieza el viernes. */
  const listaPorDias = () => {
    if (!enLosDias.length) {
      return (
        <Vacio>
          {vista === "dia"
            ? "Ese día lo tienes libre."
            : "Esa semana la tienes libre entera."}
        </Vacio>
      );
    }
    return diasVisibles.map((d, gi) => {
      const k = claveDia(d);
      const delDia = enLosDias.filter((c) => claveDia(new Date(c.inicioISO)) === k);
      if (!delDia.length) return null;
      return (
        <div key={k} style={css(gi ? RAYA + "margin-top:var(--s4);padding-top:var(--s4);" : "")}>
          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s1);")}>{diaRelativo(d)}</div>
          {delDia.map(fila)}
        </div>
      );
    });
  };

  /** El mes entero: para elegir dónde meter algo, no para leer los detalles.
   *  Por eso cada día enseña como mucho tres sesiones y luego cuenta el resto. */
  const rejillaDelMes = () => {
    if (!ancla) return null;
    const dias = cuadriculaDelMes(ancla);
    const hoy = claveDia(new Date());
    return (
      <div style={css("display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;")}>
        {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => (
          <div key={d} style={css(NOTA + "text-align:center;padding:4px 0 6px;")}>
            {d}
          </div>
        ))}
        {dias.map((d) => {
          const k = claveDia(d);
          const delDia = visibles
            .filter((c) => claveDia(new Date(c.inicioISO)) === k)
            .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
          const esDeEsteMes = d.getMonth() === ancla.getMonth();
          const esHoy = k === hoy;
          return (
            <button
              key={k}
              onClick={() => {
                setAncla(d);
                elegirVista("dia");
              }}
              aria-label={diaLargo(d) + (delDia.length ? `, ${delDia.length} citas` : "")}
              style={css(
                "display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;cursor:pointer;font-family:inherit;min-width:0;" +
                  `min-height:${estrecho ? 58 : 92}px;padding:6px;border-radius:var(--r-sm);` +
                  "border:1px solid var(--border);background:" +
                  (esDeEsteMes ? "var(--surface-solid)" : "transparent") +
                  ";" +
                  (esDeEsteMes ? "" : "opacity:.55;")
              )}
            >
              <span
                data-cifras=""
                style={css(
                  "display:inline-grid;place-items:center;align-self:flex-start;width:26px;height:26px;border-radius:50%;font-size:var(--t-mini);line-height:1;" +
                    (esHoy ? "background:var(--cita-hoy);color:var(--cita-hoy-tx);font-weight:500;" : "color:var(--text-2);")
                )}
              >
                {d.getDate()}
              </span>
              {/* En estrecho no caben los nombres: un punto por cita, en su
                  color. En ancho, hasta tres pastillas con hora y nombre. */}
              {estrecho ? (
                delDia.length > 0 && (
                  <span style={css("display:flex;flex-wrap:wrap;gap:3px;padding-left:2px;")}>
                    {delDia.slice(0, 4).map((c) => (
                      <span
                        key={c.id}
                        style={css(
                          "width:7px;height:7px;border-radius:50%;background:" +
                            (c.estado === "anulada" ? "var(--text-4)" : COLOR_TIPO[c.tipo].fondo) +
                            ";box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--text) 14%, transparent);"
                        )}
                      />
                    ))}
                  </span>
                )
              ) : (
                delDia.slice(0, 3).map((c) => {
                  const anulada = c.estado === "anulada";
                  const { fondo, tinta } = anulada ? { fondo: "var(--surface-2)", tinta: "var(--text-3)" } : COLOR_TIPO[c.tipo];
                  return (
                    <span
                      key={c.id}
                      data-cifras=""
                      style={css(
                        `display:block;font-size:var(--t-micro);line-height:1.3;padding:2px 6px;border-radius:var(--r-pill);background:${fondo};color:${tinta};` +
                          "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
                          (anulada ? "text-decoration:line-through;" : "") +
                          (c.estado === "pedida" ? `box-shadow:inset 0 0 0 1px ${tinta};` : "")
                      )}
                    >
                      {hora(c.inicioISO)} {nombreDe(c.personaId)}
                    </span>
                  );
                })
              )}
              {!estrecho && delDia.length > 3 && (
                <span style={css("font-size:var(--t-micro);color:var(--text-3);padding-left:4px;")}>y {delDia.length - 3} más</span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  /* ----------------------------------------------------------------- pintado */

  const flecha = (paso: -1 | 1) => (
    <button
      onClick={() => mover(paso)}
      aria-label={paso === 1 ? "Adelante" : "Atrás"}
      style={css(
        "flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;cursor:pointer;" +
          "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);"
      )}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paso === 1 ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
      </svg>
    </button>
  );

  /** Las que han entrado por la web y aún no ha mirado, de hoy en adelante. Es
   *  la cifra que pide hacer algo, y por eso va en la cabecera. */
  const porConfirmar = useMemo(() => {
    const desde = abreDia(new Date()).toISOString();
    return citas.filter((c) => c.estado === "pedida" && c.inicioISO >= desde).length;
  }, [citas]);

  /** Lo de hoy, en orden, para la lista de la columna: se tacha lo hecho. */
  const deHoy = useMemo(() => {
    const ahora = new Date();
    const desde = abreDia(ahora).toISOString();
    const hasta = cierraDia(ahora).toISOString();
    return citas
      .filter((c) => c.estado !== "anulada" && c.inicioISO >= desde && c.inicioISO <= hasta)
      .sort((x, y) => x.inicioISO.localeCompare(y.inicioISO));
  }, [citas]);

  /** Las del mes que se mira, sin las anuladas: la cifra de la vista de mes. */
  const delMes = useMemo(() => {
    if (!ancla) return 0;
    return citas.filter((c) => {
      const d = new Date(c.inicioISO);
      return c.estado !== "anulada" && d.getMonth() === ancla.getMonth() && d.getFullYear() === ancla.getFullYear();
    }).length;
  }, [citas, ancla]);

  const cifras = cargando
    ? []
    : [
        { n: hoyQuedan, que: "Hoy" },
        vista === "mes"
          ? { n: delMes, que: "Este mes" }
          : { n: enLosDias.filter((c) => c.estado !== "anulada").length, que: vista === "semana" ? "Esta semana" : "Este día" },
        ...(porConfirmar > 0 ? [{ n: porConfirmar, que: "Por confirmar", viva: true }] : []),
      ];

  /** Día / Semana / Mes. La activa, rellena en vino con la letra clara: es el
   *  selector de la referencia, con el color de la casa. */
  const selector = (
    <div
      role="group"
      aria-label="Cómo ver la agenda"
      style={css(
        "display:flex;gap:2px;padding:4px;border-radius:var(--r-pill);flex:none;background:var(--surface);box-shadow:var(--nm-alto);border:1px solid var(--border);" +
          (estrecho ? "width:100%;" : "")
      )}
    >
      {VISTAS.map((v) => {
        const on = vista === v.k;
        return (
          <button
            key={v.k}
            onClick={() => elegirVista(v.k)}
            aria-pressed={on}
            style={css(
              "flex:1;padding:9px 20px;border-radius:var(--r-pill);border:none;cursor:pointer;font-family:inherit;font-size:var(--t-body);font-weight:500;white-space:nowrap;" +
                "transition:background var(--t-normal) var(--curva),color var(--t-normal);background:" +
                (on ? "var(--cita-sesion)" : "transparent") +
                ";color:" +
                (on ? "var(--cita-sesion-tx)" : "var(--text-3)") +
                ";"
            )}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );

  const botonApuntar = (
    <button
      onClick={() => {
        setAviso("");
        setHoja({ modo: "apuntar" });
      }}
      style={css(botonPrincipal() + "display:inline-flex;align-items:center;justify-content:center;gap:8px;" + (estrecho ? "width:100%;" : ""))}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Apuntar una sesión
    </button>
  );

  /** La leyenda de colores, que es a la vez el filtro: cada clase con su
   *  círculo del color de sus bloques. Se apaga pulsándola. */
  const leyenda = (
    <div style={css("display:flex;flex-direction:column;gap:2px;")}>
      {TIPOS_CITA.map((t) => {
        const on = tipos.includes(t.k);
        return (
          <button
            key={t.k}
            onClick={() => setTipos((s) => (on ? s.filter((x) => x !== t.k) : [...s, t.k]))}
            aria-pressed={on}
            style={css(
              "display:flex;align-items:center;gap:10px;width:100%;padding:7px 0;border:none;background:none;cursor:pointer;font-family:inherit;text-align:left;" +
                "font-size:var(--t-body);color:" + (on ? "var(--text)" : "var(--text-4)") + ";"
            )}
          >
            <span
              aria-hidden="true"
              style={css(
                "flex:none;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;" +
                  (on
                    ? `background:${COLOR_TIPO[t.k].fondo};color:${COLOR_TIPO[t.k].tinta};box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--text) 10%, transparent);`
                    : "background:none;box-shadow:inset 0 0 0 1.5px var(--border-strong);")
              )}
            >
              {on && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              )}
            </span>
            {t.label}
          </button>
        );
      })}
      <button
        onClick={() => setVerAnuladas((v) => !v)}
        aria-pressed={verAnuladas}
        style={css(
          RAYA +
            "margin-top:var(--s2);padding:10px 0 2px;display:flex;align-items:center;gap:10px;width:100%;border-left:none;border-right:none;border-bottom:none;background:none;cursor:pointer;font-family:inherit;text-align:left;" +
            "font-size:var(--t-body);color:" + (verAnuladas ? "var(--text)" : "var(--text-3)") + ";"
        )}
      >
        <span
          aria-hidden="true"
          style={css(
            "flex:none;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;" +
              (verAnuladas ? "background:var(--text-3);color:var(--surface-solid);" : "box-shadow:inset 0 0 0 1.5px var(--border-strong);")
          )}
        >
          {verAnuladas && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          )}
        </span>
        Ver también las anuladas
      </button>
    </div>
  );

  /** Lo de hoy como lista de tareas: el círculo se rellena y el nombre se tacha
   *  cuando la sesión está hecha. Se pulsa y se abre la sesión. */
  const listaDeHoy = (
    <div>
      <div style={css("display:flex;align-items:baseline;gap:var(--s2);margin-bottom:var(--s2);")}>
        <span style={css("font-size:var(--t-read);font-weight:500;color:var(--text);letter-spacing:-.01em;")}>Hoy</span>
        <span style={css(NOTA)}>{ancla ? diaYMes(new Date()) : ""}</span>
      </div>
      {deHoy.length === 0 ? (
        <p style={css(APOYO + "margin:0;")}>No tienes ninguna sesión.</p>
      ) : (
        deHoy.map((c) => {
          const hecha = c.estado === "hecha";
          return (
            <button
              key={c.id}
              onClick={() => setHoja({ modo: "sesion", id: c.id })}
              style={css(
                "display:flex;align-items:center;gap:10px;width:100%;padding:8px 0;border:none;background:none;cursor:pointer;font-family:inherit;text-align:left;"
              )}
            >
              <span
                aria-hidden="true"
                style={css(
                  "flex:none;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;" +
                    (hecha ? "background:var(--cita-sesion);color:var(--cita-sesion-tx);" : "box-shadow:inset 0 0 0 1.5px var(--border-strong);")
                )}
              >
                {hecha && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
              </span>
              <span style={css("flex:1;min-width:0;")}>
                <span
                  style={css(
                    "display:block;font-size:var(--t-body);line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:" +
                      (hecha ? "var(--text-4);text-decoration:line-through;" : "var(--text);")
                  )}
                >
                  {nombreDe(c.personaId)}
                </span>
                <span data-cifras="" style={css(NOTA + "display:block;margin-top:1px;")}>
                  {hora(c.inicioISO)} · {etiquetaTipo(c.tipo)}
                  {c.estado === "pedida" ? " · por confirmar" : ""}
                </span>
              </span>
              <span aria-hidden="true" style={css(`flex:none;width:8px;height:8px;border-radius:50%;background:${COLOR_TIPO[c.tipo].fondo};box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--text) 14%, transparent);`)} />
            </button>
          );
        })
      )}
    </div>
  );

  const calendarioPequeno = ancla && (
    <section style={css("background:var(--bloque);color:var(--sobre-bloque);border-radius:var(--r-tarjeta);padding:var(--pad-card-sm);min-width:0;box-shadow:var(--nm-alto);")}>
      <MiniCalendario
        mes={ancla}
        elegido={ancla}
        conSesion={diasConSesion}
        semana={vista === "semana"}
        plegado={estrecho && !mesAbierto}
        alPlegar={estrecho ? () => setMesAbierto((v) => !v) : undefined}
        alElegir={(d) => setAncla(d)}
        alCambiarMes={(pasos) => setAncla((a) => (a ? masMeses(a, pasos) : a))}
      />
    </section>
  );

  const hoyLargo = ancla ? diaLargo(new Date()).replace(/^./, (c) => c.toLocaleUpperCase("es")) : "";

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      {/* LA CABECERA, sin foto (noviembre de 2026). La banda con foto se comía
          un tercio de la pantalla antes de llegar a la semana. Ahora va como en
          la referencia que pasó Ger: el título a la izquierda, el selector en
          medio y a la derecha las cifras grandes y el único botón lleno. */}
      <header
        style={css(
          "display:flex;flex-wrap:wrap;align-items:flex-end;gap:" + (estrecho ? "var(--s3)" : "var(--s4) var(--gap-lg)") + ";margin-bottom:var(--gap);" +
            (estrecho ? "flex-direction:column;align-items:stretch;" : "")
        )}
      >
        <div style={css("flex:1 1 auto;min-width:0;")}>
          <h1 style={css("margin:0;font-family:var(--font-display);font-size:var(--t-hero);font-weight:500;letter-spacing:-.035em;line-height:1;color:var(--text);")}>
            Agenda
          </h1>
          <p style={css(APOYO + "margin:8px 0 0;")}>{hoyLargo}</p>
        </div>

        {!estrecho && selector}

        {cifras.length > 0 && (
          <div style={css("display:flex;gap:var(--gap-lg);align-items:flex-end;" + (estrecho ? "justify-content:space-between;" : ""))}>
            {cifras.map((c) => (
              <div key={c.que} style={css("min-width:0;")}>
                <div
                  data-cifras=""
                  style={css(
                    "font-size:" + (estrecho ? "var(--t-head)" : "var(--t-hero)") + ";font-weight:500;letter-spacing:-.04em;line-height:1;" +
                      ("viva" in c && c.viva
                        ? "display:inline-grid;place-items:center;min-width:1.25em;height:1.25em;padding:0 .2em;border-radius:var(--r-pill);background:var(--cita-sinergia);color:var(--cita-sinergia-tx);"
                        : "color:var(--text);")
                  )}
                >
                  {c.n}
                </div>
                <div style={css(NOTA + "margin-top:" + (estrecho ? 4 : 6) + "px;")}>{c.que}</div>
              </div>
            ))}
          </div>
        )}

        {estrecho && selector}
        <div style={css(estrecho ? "" : "flex:none;")}>{botonApuntar}</div>
      </header>

      <div
        style={css(
          "display:grid;gap:var(--gap);align-items:start;min-width:0;" +
            (estrecho ? "grid-template-columns:minmax(0,1fr);" : "grid-template-columns:260px minmax(0,1fr);")
        )}
      >
        {/* ============================================== la columna de la izquierda */}
        {estrecho ? (
          calendarioPequeno
        ) : (
          <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
            {calendarioPequeno}
            <section style={css(TARJETA + PAD_SM + "min-width:0;")}>{listaDeHoy}</section>
            <section style={css(TARJETA + PAD_SM + "min-width:0;")}>
              <div style={css("font-size:var(--t-read);font-weight:500;color:var(--text);letter-spacing:-.01em;margin-bottom:var(--s1);")}>Qué se ve</div>
              {leyenda}
            </section>
            <AvisoNavegador que="Las sesiones apuntadas" />
          </div>
        )}

        {/* ================================================================ el centro */}
        <section style={css(TARJETA + PAD_SM + "min-width:0;display:flex;flex-direction:column;gap:var(--s4);")}>
          {/* La barra: el tramo que se mira, «Hoy» y las flechas en círculo. */}
          <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;padding:2px 2px 0;")}>
            <h2 style={css("margin:0;" + (estrecho ? "flex:1 1 100%;" : "flex:1 1 160px;") + "min-width:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;line-height:1.2;color:var(--text);")}>
              {tituloDelTramo()}
            </h2>
            {estrecho && (
              <button onClick={() => setVerFiltros((v) => !v)} style={css(BOTON_PLANO + "margin-right:auto;")}>
                {verFiltros ? "Dejar los filtros" : "Filtrar"}
              </button>
            )}
            <button
              onClick={() => setAncla(new Date())}
              style={css("border:none;background:none;cursor:pointer;font-family:inherit;font-size:var(--t-body);font-weight:500;color:var(--accion);padding:6px 4px;")}
            >
              Hoy
            </button>
            {flecha(-1)}
            {flecha(1)}
          </div>

          {estrecho && (
            <AnimatePresence initial={false}>
              {verFiltros && (
                <motion.div
                  initial={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={quieto ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  exit={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  style={css("overflow:hidden;")}
                >
                  {leyenda}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {cargando || !ancla ? (
            <Vacio>Un momento…</Vacio>
          ) : vista === "mes" ? (
            rejillaDelMes()
          ) : estrecho && vista === "semana" ? (
            listaPorDias()
          ) : (
            /* Aquí no va ningún aviso de «semana libre»: la rejilla vacía ya
               dice que está vacía, y lo de pulsar se aprende en el primer clic. */
            <RejillaSemana
              dias={diasVisibles}
              citas={visibles}
              nombreDe={nombreDe}
              elegido={ancla}
              alPulsarCita={(c) => setHoja({ modo: "sesion", id: c.id })}
              alPulsarHueco={abrirHueco}
            />
          )}
        </section>

        {estrecho && <section style={css(TARJETA + PAD_SM + "min-width:0;")}>{listaDeHoy}</section>}
        {estrecho && <AvisoNavegador que="Las sesiones apuntadas" />}
      </div>

      {/* ================================================== apuntar una sesión */}
      <HojaLateral
        abierta={hoja?.modo === "apuntar"}
        cerrar={() => setHoja(null)}
        titulo="Apuntar una sesión"
        pie="Con el nombre basta. Si esa persona todavía no está en tus clientes, se le abre ficha sola."
      >
        <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
          {campo(
            "¿Con quién?",
            <>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                list="es33-clientes"
                placeholder="Nombre y apellidos"
                style={css(entrada)}
              />
              {/* La lista de quien ya está fichado, para no volver a teclearlo y,
                  sobre todo, para no crear «Maria» al lado de «María». */}
              <datalist id="es33-clientes">
                {gente.map((g) => (
                  <option key={g.id} value={g.nombre} />
                ))}
              </datalist>
            </>
          )}

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,130px),1fr));gap:var(--s3);")}>
            {campo("¿Qué día?", <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} style={css(entrada)} />)}
            {campo("¿A qué hora?", <input type="time" value={horaTexto} onChange={(e) => setHoraTexto(e.target.value)} style={css(entrada)} />)}
          </div>

          {campo(
            "¿Cuánto dura?",
            <select value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} style={css(entrada)}>
              {DURACIONES.map((m) => (
                <option key={m} value={m}>
                  {duracion(m)}
                </option>
              ))}
            </select>
          )}

          <div style={css("display:flex;flex-direction:column;gap:6px;")}>
            <span style={css(rotulo())}>¿Qué es?</span>
            <div style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:var(--r-pill);padding:3px;")}>
              {TIPOS_CITA.map((t) => (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setTipo(t.k)}
                  aria-pressed={tipo === t.k}
                  style={css(
                    "flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 10px;border-radius:var(--r-pill);border:none;cursor:pointer;font-family:inherit;font-size:var(--t-body);font-weight:500;white-space:nowrap;" +
                      "transition:background var(--t-normal) var(--curva),color var(--t-normal);background:" +
                      /* La elegida se rellena con el color que tendrá su bloque
                         en la rejilla: se ve qué se va a apuntar antes de
                         apuntarlo. */
                      (tipo === t.k ? COLOR_TIPO[t.k].fondo : "transparent") +
                      ";color:" +
                      (tipo === t.k ? COLOR_TIPO[t.k].tinta : "var(--text-3)") +
                      ";"
                  )}
                >
                  {tipo !== t.k && (
                    <span aria-hidden="true" style={css(`width:8px;height:8px;border-radius:50%;flex:none;background:${COLOR_TIPO[t.k].fondo};box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--text) 14%, transparent);`)} />
                  )}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {campo(
            "Algo que recordar (si hace falta)",
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Viene por su hija · primera vez · por videollamada"
              style={css(entrada + "resize:vertical;line-height:1.5;")}
            />
          )}
        </div>

        <button onClick={() => void apuntar()} style={css(botonPrincipal() + "width:100%;margin-top:var(--s5);")}>
          Apuntar la sesión
        </button>

        {aviso && (
          <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
            {aviso}
          </p>
        )}
      </HojaLateral>

      {/* ====================================================== una sesión abierta */}
      <HojaLateral
        abierta={Boolean(sesionAbierta)}
        cerrar={() => setHoja(null)}
        titulo={sesionAbierta ? nombreDe(sesionAbierta.personaId) : ""}
        /* Sin pie: el día, la hora y lo que dura van en la pieza de color de
           justo debajo, que se lee mejor. Repetirlos aquí era decirlo dos veces. */
      >
        {sesionAbierta && (
          <div>
            {/* LA CITA EN SU COLOR, arriba: la misma pieza que en la rejilla,
                en grande. Se sabe qué es y a qué hora antes de leer nada. */}
            {(() => {
              const anulada = sesionAbierta.estado === "anulada";
              const { fondo, tinta } = anulada ? { fondo: "var(--surface-2)", tinta: "var(--text-2)" } : COLOR_TIPO[sesionAbierta.tipo];
              const fin = new Date(new Date(sesionAbierta.inicioISO).getTime() + sesionAbierta.minutos * 60000).toISOString();
              return (
                <div
                  style={css(
                    `background:${fondo};color:${tinta};border-radius:var(--r);padding:var(--s4) var(--s5);margin-bottom:var(--s4);` +
                      (sesionAbierta.estado === "pedida" ? `border:1.5px dashed ${tinta};` : "border:1px solid transparent;")
                  )}
                >
                  <div style={css("font-size:var(--t-mini);font-weight:500;opacity:.86;")}>{etiquetaTipo(sesionAbierta.tipo)}</div>
                  <div data-cifras="" style={css("font-size:var(--t-head);font-weight:500;letter-spacing:-.03em;line-height:1.1;margin-top:4px;" + (anulada ? "text-decoration:line-through;" : ""))}>
                    {hora(sesionAbierta.inicioISO)} – {hora(fin)}
                  </div>
                  <div style={css("font-size:var(--t-body);margin-top:4px;opacity:.86;")}>
                    {diaLargo(new Date(sesionAbierta.inicioISO)).replace(/^./, (c) => c.toLocaleUpperCase("es"))} · {duracion(sesionAbierta.minutos)}
                  </div>
                </div>
              );
            })()}
            <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
              <Estado
                texto={
                  sesionAbierta.estado === "hecha"
                    ? "Hecha"
                    : sesionAbierta.estado === "pedida"
                      ? "Por confirmar"
                      : sesionAbierta.estado === "anulada"
                        ? "Anulada"
                        : "Confirmada"
                }
                color={COLOR_ESTADO[sesionAbierta.estado]}
              />
            </div>

            {sesionAbierta.notas && (
              <p style={css(APOYO + "margin:var(--s4) 0 0;color:var(--text-2);white-space:pre-wrap;")}>{sesionAbierta.notas}</p>
            )}

            <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);display:flex;flex-wrap:wrap;gap:var(--s2);align-items:center;")}>
              {/* Confirmar va PRIMERO y en el botón lleno cuando la sesión ha
                  entrado por la web: es lo único que hay que hacer con ella, y
                  hasta que se haga sigue saliendo en los avisos. «Ya está
                  hecha» pasa entonces al botón plano — es de otro momento del
                  día, no de este. */}
              {sesionAbierta.estado === "pedida" && (
                <button onClick={() => void confirmar(sesionAbierta)} style={css(botonPrincipal())}>
                  Confirmar esta hora
                </button>
              )}
              {sesionAbierta.estado !== "hecha" && (
                <button
                  onClick={() => void marcarHecha(sesionAbierta)}
                  style={css(sesionAbierta.estado === "pedida" ? BOTON_PLANO : botonPrincipal())}
                >
                  Ya está hecha
                </button>
              )}
              <button
                onClick={() => {
                  setClienteAbierto(sesionAbierta.personaId);
                  setView("personas");
                }}
                style={css(BOTON_PLANO)}
              >
                Abrir su ficha
              </button>
              {/* Antes se quitaba de un clic y sin preguntar. Una sesión borrada
                  no se recupera de ningún sitio: no hay copia. Y va apartada al
                  otro extremo de la fila —de ahí el envoltorio, que es quien
                  puede empujar dentro de la fila—: en rojo es lo que más se ve,
                  y no puede estar pegada a los dos botones que sí se pulsan a
                  diario. */}
              <div style={css("margin-left:auto;")}>
                <Confirmar
                  estilo={BOTON_PLANO + "color:var(--red);"}
                  alineado="derecha"
                  pregunta={`Se va la sesión de ${nombreDe(sesionAbierta.personaId)} del ${diaLargo(new Date(sesionAbierta.inicioISO))} a las ${hora(sesionAbierta.inicioISO)}. Su ficha se queda. Esto no se puede deshacer.`}
                  confirmar="Sí, quitarla"
                  alConfirmar={() => void quitar(sesionAbierta)}
                >
                  Quitar de la agenda
                </Confirmar>
              </div>
            </div>

            <p style={css(NOTA + "margin:var(--s5) 0 0;line-height:1.5;")}>
              Para cambiarle el día o la hora, quítala y apúntala otra vez: todavía no se pueden mover.
            </p>
          </div>
        )}
      </HojaLateral>
    </main>
  );
}
