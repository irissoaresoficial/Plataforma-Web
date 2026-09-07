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
import { APOYO, BOTON_NORMAL, BOTON_PLANO, NOTA, PAD, PAD_SM, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import Confirmar from "../Confirmar";
import { AvisoNavegador, Avatar, Cabecera, Estado, Vacio, useEstrecho } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";
import MiniCalendario from "../despacho/MiniCalendario";
import RejillaSemana from "../despacho/RejillaSemana";
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
      transition={{ duration: 0.34, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] }}
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
      <Avatar nombre={nombreDe(c.personaId)} tamano={32} />
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
      <div style={css("display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;")}>
        {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => (
          <div key={d} style={css(NOTA + "background:var(--surface);text-align:center;padding:7px 0;font-weight:600;color:var(--text-4);")}>
            {d}
          </div>
        ))}
        {dias.map((d) => {
          const k = claveDia(d);
          const delDia = visibles
            .filter((c) => claveDia(new Date(c.inicioISO)) === k)
            .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
          const esDeEsteMes = d.getMonth() === ancla.getMonth();
          return (
            <button
              key={k}
              onClick={() => {
                setAncla(d);
                elegirVista("dia");
              }}
              style={css(
                "display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;cursor:pointer;border:none;font-family:inherit;" +
                  "min-height:86px;padding:6px 7px;background:" +
                  (esDeEsteMes ? "var(--surface)" : "var(--surface-2)") +
                  ";"
              )}
            >
              <span
                data-cifras=""
                style={css(
                  "font-size:var(--t-mini);font-weight:600;line-height:1;color:" +
                    (k === hoy ? "var(--accion)" : esDeEsteMes ? "var(--text-2)" : "var(--text-4)") +
                    ";"
                )}
              >
                {d.getDate()}
              </span>
              {/* En estrecho no caben los nombres: se dice cuántas hay, que es
                  lo que se necesita para decidir en qué día entrar. */}
              {estrecho
                ? delDia.length > 0 && (
                    <span style={css("font-size:var(--t-micro);color:var(--text-4);line-height:1.2;")}>{delDia.length}</span>
                  )
                : delDia.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      style={css(
                        "font-size:var(--t-micro);line-height:1.25;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
                          "padding-left:5px;border-left:2px solid " +
                          (c.estado === "anulada" ? "var(--text-4)" : "var(--gold)") +
                          ";"
                      )}
                    >
                      {hora(c.inicioISO)} {nombreDe(c.personaId)}
                    </span>
                  ))}
              {!estrecho && delDia.length > 3 && (
                <span style={css("font-size:var(--t-micro);color:var(--text-4);")}>y {delDia.length - 3} más</span>
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

  const filtros = (
    <div>
      <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Qué se ve</div>
      <div style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
        {TIPOS_CITA.map((t) => {
          const on = tipos.includes(t.k);
          return (
            <label key={t.k} style={css("display:flex;align-items:center;gap:9px;cursor:pointer;font-size:var(--t-body);color:var(--text-2);")}>
              <input
                type="checkbox"
                checked={on}
                onChange={() => setTipos((s) => (on ? s.filter((x) => x !== t.k) : [...s, t.k]))}
                style={css("width:16px;height:16px;flex:none;accent-color:var(--accion);box-shadow:none;")}
              />
              {/* El mismo punto de color que lleva la raya del bloque en la
                  rejilla: es lo que ata el filtro con lo que se ve. */}
              <span
                aria-hidden="true"
                style={css(
                  "width:7px;height:7px;border-radius:50%;flex:none;background:" +
                    (t.k === "sesion" ? "var(--gold)" : t.k === "seguimiento" ? "var(--via-transformacion-tx)" : "var(--via-destino-tx)") +
                    ";"
                )}
              />
              {t.label}
            </label>
          );
        })}
        <label style={css(RAYA + "margin-top:var(--s2);padding-top:var(--s3);display:flex;align-items:center;gap:9px;cursor:pointer;font-size:var(--t-body);color:var(--text-2);")}>
          <input
            type="checkbox"
            checked={verAnuladas}
            onChange={() => setVerAnuladas((v) => !v)}
            style={css("width:16px;height:16px;flex:none;accent-color:var(--accion);box-shadow:none;")}
          />
          Ver también las anuladas
        </label>
      </div>
    </div>
  );

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      <Cabecera
        titulo="Agenda"
        pie="Pulsa un hueco para apuntar algo."
      />

      <div
        style={css(
          "display:grid;gap:var(--gap-lg);align-items:start;min-width:0;" +
            (estrecho ? "grid-template-columns:minmax(0,1fr);" : "grid-template-columns:250px minmax(0,1fr);")
        )}
      >
        {/* ============================================== la columna de la izquierda */}
        {!estrecho && (
          <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
            <section style={css(TARJETA + PAD_SM + "min-width:0;")}>
              {ancla && (
                <MiniCalendario
                  mes={ancla}
                  elegido={ancla}
                  conSesion={diasConSesion}
                  alElegir={(d) => setAncla(d)}
                  alCambiarMes={(pasos) => setAncla((a) => (a ? masMeses(a, pasos) : a))}
                />
              )}
              <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>{filtros}</div>
            </section>
            <AvisoNavegador que="Las sesiones apuntadas" />
          </div>
        )}

        {/* ================================================================ el centro */}
        <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          {/* ------------------------------------------------------------ la barra */}
          <section style={css(TARJETA + PAD + "min-width:0;")}>
            <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3);")}>
              <div style={css("display:flex;align-items:center;gap:var(--s2);")}>
                {flecha(-1)}
                {flecha(1)}
                <button onClick={() => setAncla(new Date())} style={css(BOTON_PLANO)}>
                  Hoy
                </button>
              </div>

              {/* El tramo que se está viendo. Va en el título de tarjeta porque
                  es lo que dice dónde estás, que es la primera pregunta. */}
              <h2 style={css(TITULO + "margin:0;flex:1 1 120px;min-width:0;")}>{tituloDelTramo()}</h2>

              {/* El selector y el botón van juntos en su propia caja: al
                  estrecharse la pantalla bajan a la misma línea en vez de
                  repartirse en dos renglones y comerse media pantalla de
                  teléfono antes de llegar a la agenda. */}
              <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
                {/* Día / Semana / Mes, con la pastilla de la casa. */}
                <div
                  role="group"
                  aria-label="Cómo ver la agenda"
                  style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:980px;padding:3px;flex:none;")}
                >
                  {VISTAS.map((v) => {
                    const on = vista === v.k;
                    return (
                      <button
                        key={v.k}
                        onClick={() => elegirVista(v.k)}
                        aria-pressed={on}
                        style={css(
                          "padding:7px 14px;border-radius:980px;border:none;cursor:pointer;font-size:var(--t-mini);font-weight:590;white-space:nowrap;transition:all .2s;background:" +
                            (on ? "var(--surface-solid)" : "transparent") +
                            ";box-shadow:" +
                            (on ? "var(--shadow-sm)" : "none") +
                            ";color:" +
                            (on ? "var(--text)" : "var(--text-3)") +
                            ";"
                        )}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>

                {/* La única mancha de granate de la pantalla. */}
                <button
                  onClick={() => {
                    setAviso("");
                    setHoja({ modo: "apuntar" });
                  }}
                  style={css(botonPrincipal())}
                >
                  Apuntar una sesión
                </button>
              </div>
            </div>

            {/* «Hoy tienes 3 sesiones», que es como se lo diría alguien. Y a su
                derecha, cuando no hay columna donde ponerlos, los filtros. */}
            <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;margin-top:var(--s3);")}>
              <p style={css(APOYO + "margin:0;")}>
                {cargando
                  ? "Un momento…"
                  : hoyQuedan === 0
                    ? "Hoy no tienes ninguna sesión."
                    : hoyQuedan === 1
                      ? "Hoy tienes 1 sesión."
                      : `Hoy tienes ${hoyQuedan} sesiones.`}
              </p>
              {estrecho && (
                <button onClick={() => setVerFiltros((v) => !v)} style={css(BOTON_PLANO + "margin-left:auto;")}>
                  {verFiltros ? "Dejar los filtros" : "Filtrar"}
                </button>
              )}
            </div>

            {/* En estrecho los filtros no caben en una columna al lado, así que
                se piden. Plegados no molestan y siguen estando. */}
            {estrecho && (
              <div>
                <AnimatePresence>
                  {verFiltros && (
                    <motion.div
                      initial={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={quieto ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                      exit={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      style={css("overflow:hidden;")}
                    >
                      <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>{filtros}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* ------------------------------------------------------- lo que se ve */}
          <section style={css(TARJETA + (vista === "mes" || (estrecho && vista === "semana") ? PAD : PAD_SM) + "min-width:0;")}>
            {cargando || !ancla ? (
              <Vacio>Un momento…</Vacio>
            ) : vista === "mes" ? (
              rejillaDelMes()
            ) : estrecho && vista === "semana" ? (
              listaPorDias()
            ) : (
              <>
                {/* El hueco se dice ARRIBA y no debajo de la rejilla: la rejilla
                    mide seiscientos píxeles aunque esté vacía, así que un aviso
                    al pie se queda fuera de la ventana justo el día que hace
                    falta leerlo. */}
                {/* AQUÍ NO VA NINGÚN AVISO, Y ES A PROPÓSITO.
                    Decía «esa semana la tienes libre entera. Pulsa la hora que
                    quieras para apuntar algo» encima de una rejilla vacía. La
                    rejilla vacía ya dice que está vacía —para eso está dibujada—
                    y lo de pulsar se aprende en el primer clic, no leyéndolo.
                    Una frase que repite lo que ya se ve enseña a saltarse el
                    texto de esta pantalla. */}
                <RejillaSemana
                  dias={diasVisibles}
                  citas={visibles}
                  nombreDe={nombreDe}
                  elegido={ancla}
                  alPulsarCita={(c) => setHoja({ modo: "sesion", id: c.id })}
                  alPulsarHueco={abrirHueco}
                />
              </>
            )}
          </section>

          {/* En estrecho el aviso de dónde viven las cosas va aquí abajo: la
              columna que lo llevaba no existe en este ancho. */}
          {estrecho && <AvisoNavegador que="Las sesiones apuntadas" />}
        </div>
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
            <div style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:980px;padding:3px;")}>
              {TIPOS_CITA.map((t) => (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setTipo(t.k)}
                  style={css(
                    "flex:1;padding:8px 10px;border-radius:980px;border:none;cursor:pointer;font-size:var(--t-body);font-weight:590;white-space:nowrap;transition:all .2s;background:" +
                      (tipo === t.k ? "var(--surface-solid)" : "transparent") +
                      ";box-shadow:" +
                      (tipo === t.k ? "var(--shadow-sm)" : "none") +
                      ";color:" +
                      (tipo === t.k ? "var(--text)" : "var(--text-3)") +
                      ";"
                  )}
                >
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
        pie={
          sesionAbierta
            ? `${diaLargo(new Date(sesionAbierta.inicioISO))} a las ${hora(sesionAbierta.inicioISO)} · ${duracion(sesionAbierta.minutos)}`
            : undefined
        }
      >
        {sesionAbierta && (
          <div>
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
              <span style={css(NOTA)}>{etiquetaTipo(sesionAbierta.tipo)}</span>
            </div>

            {sesionAbierta.notas && (
              <p style={css(APOYO + "margin:var(--s4) 0 0;color:var(--text-2);white-space:pre-wrap;")}>{sesionAbierta.notas}</p>
            )}

            <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);display:flex;flex-wrap:wrap;gap:var(--s2);align-items:center;")}>
              {sesionAbierta.estado !== "hecha" && (
                <button onClick={() => void marcarHecha(sesionAbierta)} style={css(BOTON_NORMAL)}>
                  Ya está hecha
                </button>
              )}
              <button
                onClick={() => {
                  setClienteAbierto(sesionAbierta.personaId);
                  setView("clientes");
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
