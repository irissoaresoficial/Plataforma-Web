"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type Seccion, type Disciplina, type View } from "@/lib/app-context";
import {
  IcoAgenda,
  IcoAlma,
  IcoArbol,
  IcoCiclos,
  IcoClientes,
  IcoConsulta,
  IcoCuentas,
  IcoDocumento,
  IcoEstructura,
  IcoFacturas,
  IcoLeads,
  IcoNumerologia,
  IcoNumeros,
  IcoPareja,
  IcoPlegar,
  IcoResumen,
} from "./Iconos";

type Ico = (p: { size?: number }) => React.JSX.Element;
type Item = { k: Seccion; label: string; Ico: Ico };

/* En la lateral los nombres van cortos: caben en un renglón y la columna
 * queda a plomo. El nombre largo sigue estando en el encabezado de cada
 * sección. */
const KABALA: Item[] = [
  { k: "resumen", label: "Resumen", Ico: IcoResumen },
  { k: "arbol", label: "Árbol", Ico: IcoArbol },
  { k: "numeros", label: "Números", Ico: IcoNumeros },
  { k: "estructura", label: "Estructura", Ico: IcoEstructura },
  { k: "alma", label: "Imagen del alma", Ico: IcoAlma },
  { k: "cuentas", label: "Cuentas abiertas", Ico: IcoCuentas },
  { k: "ciclos", label: "Ciclos vitales", Ico: IcoCiclos },
];

/** Las disciplinas de la escuela, en el orden en que se estudian. Feng Shui
 *  estaba aquí en tercer lugar y se ha retirado: no había nada detrás. */
export const DISCIPLINAS: Array<{ k: Disciplina; label: string; Ico: Ico }> = [
  { k: "kabala", label: "Kábala", Ico: IcoArbol },
  { k: "numerologia", label: "Numerología", Ico: IcoNumerologia },
];

/** El despacho: lo que no es leer una carta. Nunca se bloquea — una factura no
 *  depende de que haya un estudio abierto. */
const DESPACHO: Array<{ k: View; label: string; Ico: Ico }> = [
  { k: "leads", label: "Leads", Ico: IcoLeads },
  { k: "agenda", label: "Agenda", Ico: IcoAgenda },
  { k: "clientes", label: "Clientes", Ico: IcoClientes },
  { k: "facturas", label: "Facturas", Ico: IcoFacturas },
];

/**
 * TODA LA NAVEGACIÓN, EN UN SOLO SITIO.
 *
 * Antes estaba repartida en dos: una tira de pestañas arriba —Consulta, Panel,
 * Estudio y los tres del despacho— y esta columna, que sólo llevaba las partes
 * del estudio. Seis pestañas arriba no caben en un portátil, así que a partir
 * de 1200 px se iban al cajón y desaparecían; y tener dos navegaciones que hay
 * que mirar por turnos para saber a dónde se puede ir es exactamente lo que
 * hace que una herramienta se sienta grande y confusa.
 *
 * Ahora la columna es LA navegación, con dos grupos:
 *
 *   EL ESTUDIO      — la consulta y las disciplinas con sus partes.
 *   PARA ENTREGAR   — lo que sale de ahí y se le da a la persona.
 *   EL DESPACHO     — la agenda, los clientes y las facturas.
 *
 * SON TRES Y NO DOS desde que se sacaron de «El estudio» el documento y la
 * comparativa de pareja. Estaban colgando debajo de las disciplinas, al mismo
 * nivel que «Kábala» y «Numerología», y ahí mezclan dos cosas distintas: las
 * disciplinas son DÓNDE SE TRABAJA y el documento es QUÉ SE ENTREGA. Puestos
 * en la misma lista, hay que leerlos todos para saber cuál es cuál.
 *
 * Cada grupo contesta ahora a una pregunta: dónde miro, qué le doy, cómo llevo
 * el negocio. Arriba se queda
 * la marca, la cuenta y el tema, que no son navegación.
 *
 * Es la misma lista en los dos sitios donde aparece —esta columna en pantalla
 * ancha y el cajón en móvil— para que no haya dos que mantener y que puedan
 * discrepar. `alCambiar` lo usa el cajón para cerrarse al elegir.
 */
export function NavDisciplinas({ alCambiar, compacta }: { alCambiar?: () => void; compacta?: boolean }) {
  const { r, re, view, setView, seccion, setSeccion, disciplina, setDisciplina } = useApp();
  const quieto = useReducedMotion();
  // Qué disciplinas están desplegadas. Se abre la que se está mirando, y
  // pulsando su nombre se cierra.
  const [abiertas, setAbiertas] = useState<Disciplina[]>(["kabala"]);

  const hayEstudio = Boolean(r || re);
  // El estudio de empresa cabe entero en una pantalla: no hay siete partes
  // que listar porque seis de ellas salen de la fecha, y no hay fecha.
  const partesKabala = re ? KABALA.slice(0, 1) : KABALA;

  const alterna = (d: Disciplina) => {
    setView("panel");
    setDisciplina(d);
    setAbiertas((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  };

  const fila = (
    activo: boolean,
    Ico: Ico,
    label: string,
    onClick: () => void,
    opts?: { grande?: boolean; abierta?: boolean; apagado?: boolean }
  ) => {
    const { grande, abierta, apagado } = opts ?? {};
    return (
      <button
        key={label}
        onClick={apagado ? undefined : onClick}
        disabled={apagado}
        title={compacta ? label : apagado ? "Primero genera un estudio" : undefined}
        aria-label={compacta ? label : undefined}
        aria-current={activo ? "page" : undefined}
        style={css(
          "display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:9px 10px;white-space:nowrap;border:none;border-radius:var(--r-sm);letter-spacing:-.01em;line-height:1.25;transition:background .18s,color .18s;" +
            (apagado ? "cursor:not-allowed;" : "cursor:pointer;") +
            (grande ? "font-size:var(--t-read);font-weight:600;" : "font-size:var(--t-body);font-weight:590;") +
            /* Dónde estás, en granate. Es la misma regla que el botón: lo activo
               y lo que se pulsa comparten color, y el oro se queda para adornar.
               En oscuro `--accion` es el oro claro por sí solo. */
            "background:" +
            (activo ? "var(--accion-suave)" : "transparent") +
            ";color:" +
            (activo ? "var(--accion)" : apagado ? "var(--text-4)" : grande ? "var(--text)" : "var(--text-3)") +
            ";"
        )}
      >
        <span
          style={css(
            "flex:none;display:grid;place-items:center;" +
              (grande ? "width:26px;height:26px;border-radius:var(--r);background:var(--gold-soft);" : "") +
              "color:" +
              (apagado ? "var(--text-4)" : activo || grande ? "var(--gold)" : "var(--text-4)") +
              ";"
          )}
        >
          <Ico size={grande ? 16 : 19} />
        </span>
        {!compacta && label}
        {/* La flecha dice si el grupo está abierto y sirve para cerrarlo. */}
        {!compacta && abierta !== undefined && (
          <motion.span
            aria-hidden="true"
            animate={{ rotate: abierta ? 0 : -90 }}
            transition={quieto ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={css("margin-left:auto;display:grid;place-items:center;color:var(--text-4);")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.span>
        )}
      </button>
    );
  };

  /* El rótulo de un grupo. Se calla cuando la columna está plegada a iconos:
     ahí no cabe y la separación ya la hace el aire entre grupos. */
  const rotulo = (t: string) =>
    !compacta && (
      <div style={css("font-size:var(--t-micro);font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:var(--text-4);padding:0 10px var(--s2);")}>
        {t}
      </div>
    );

  const ir = (v: View) => () => {
    setView(v);
    alCambiar?.();
  };

  return (
    <nav style={css("display:flex;flex-direction:column;gap:var(--s6);")}>
      {/* ------------------------------------------------------- EL ESTUDIO */}
      <div style={css("display:flex;flex-direction:column;gap:2px;")}>
        {rotulo("El estudio")}

        {/* La consulta es donde se empieza y donde se cambia de persona, así
            que no se bloquea nunca: es la salida de todas las demás. */}
        {fila(view === "inicio", IcoConsulta, "Consulta", ir("inicio"))}

        {DISCIPLINAS.map((d) => {
          const dentro = view === "panel" && disciplina === d.k;
          // Sólo Kábala tiene partes por ahora; Numerología no lleva flecha
          // porque no hay nada que desplegar todavía.
          const partes = d.k === "kabala" && hayEstudio ? partesKabala : [];
          const abierta = partes.length > 0 && (compacta || abiertas.includes(d.k));
          return (
            <div key={d.k} style={css("display:flex;flex-direction:column;gap:2px;")}>
              {/* La disciplina abierta no se resalta si tiene partes: ya se ve
                  cuál está por la sección marcada de dentro. */}
              {fila(
                dentro && !partes.length,
                d.Ico,
                d.label,
                () => {
                  if (partes.length) alterna(d.k);
                  else {
                    setView("panel");
                    setDisciplina(d.k);
                    alCambiar?.();
                  }
                },
                { grande: true, abierta: partes.length ? abierta : undefined, apagado: !hayEstudio }
              )}
              <AnimatePresence initial={false}>
                {abierta && (
                  <motion.div
                    key="partes"
                    initial={quieto ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={quieto ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.22 } }}
                    style={css("overflow:hidden;")}
                  >
                    {partes.map(({ k, label, Ico }, i) => (
                      <motion.div
                        key={k}
                        initial={quieto ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {fila(seccion === k && dentro, Ico, label, () => {
                          // Pulsar una parte de Kábala lleva al panel en Kábala,
                          // aunque se estuviera en otra pantalla.
                          setView("panel");
                          setDisciplina("kabala");
                          setSeccion(k);
                          alCambiar?.();
                        })}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

      </div>

      {/* ---------------------------------------------------- PARA ENTREGAR */}
      {/* Lo que se imprime y se le da a la persona. Los dos salen del estudio
          que esté abierto, así que se apagan igual que las disciplinas cuando
          todavía no hay ninguno. */}
      <div style={css("display:flex;flex-direction:column;gap:2px;")}>
        {rotulo("Para entregar")}
        {fila(view === "estudio", IcoDocumento, "El documento", ir("estudio"), { apagado: !hayEstudio })}
        {fila(view === "pareja", IcoPareja, "Comparar pareja", ir("pareja"), { apagado: !hayEstudio })}
      </div>

      {/* ------------------------------------------------------ EL DESPACHO */}
      <div style={css("display:flex;flex-direction:column;gap:2px;")}>
        {rotulo("El despacho")}
        {DESPACHO.map(({ k, label, Ico }) => fila(view === k, Ico, label, ir(k)))}
      </div>
    </nav>
  );
}

/**
 * La columna de la izquierda en pantalla ancha. Por debajo de 980 px
 * desaparece y manda el menú del botón de la cabecera.
 *
 * Se pliega a una tira de iconos para leer el estudio a todo lo ancho — que en
 * las secciones de dos columnas se nota — y al pasar el ratón por encima
 * enseña el nombre de lo que hay debajo de cada icono.
 */
export default function Sidebar() {
  const { lateral, setLateral } = useApp();

  return (
    <aside
      data-sidebar=""
      data-chrome="1"
      style={css(
        "position:sticky;top:63px;align-self:start;flex:none;width:" +
          (lateral ? "238px" : "62px") +
          /* Cristal, igual que la cabecera: es la otra pieza que se queda quieta
             mientras el contenido pasa por detrás. */
          ";height:calc(100vh - 63px);overflow-y:auto;overflow-x:hidden;padding:14px 12px 28px;background:var(--vidrio);backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);border-right:1px solid var(--border);transition:width .3s cubic-bezier(.22,1,.36,1);"
      )}
    >
      <button
        onClick={() => setLateral(!lateral)}
        title={lateral ? "Plegar la columna" : "Desplegar la columna"}
        aria-label={lateral ? "Plegar la columna" : "Desplegar la columna"}
        style={css(
          "display:flex;align-items:center;gap:9px;width:100%;margin-bottom:var(--s4);padding:8px;border:none;border-radius:var(--r-sm);background:none;color:var(--text-4);cursor:pointer;font-size:var(--t-mini);font-weight:590;white-space:nowrap;"
        )}
      >
        <span style={css("flex:none;display:grid;place-items:center;")}>
          <IcoPlegar size={19} abierto={lateral} />
        </span>
        {lateral && "Plegar"}
      </button>
      <NavDisciplinas compacta={!lateral} />
    </aside>
  );
}
