"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type Seccion, type Disciplina } from "@/lib/app-context";
import {
  IcoAlma,
  IcoArbol,
  IcoCiclos,
  IcoCuentas,
  IcoEstructura,
  IcoFengShui,
  IcoNumerologia,
  IcoNumeros,
  IcoPlegar,
  IcoResumen,
} from "./Iconos";

type Ico = (p: { size?: number }) => React.JSX.Element;
type Item = { k: Seccion; label: string; Ico: Ico };

/* En la lateral los nombres van cortos: caben en un renglón y la columna
 * queda a plomo. El nombre largo sigue estando arriba, en la tira de
 * pestañas y en el encabezado de cada sección. */
const KABALA: Item[] = [
  { k: "resumen", label: "Resumen", Ico: IcoResumen },
  { k: "arbol", label: "Árbol", Ico: IcoArbol },
  { k: "numeros", label: "Números", Ico: IcoNumeros },
  { k: "estructura", label: "Estructura", Ico: IcoEstructura },
  { k: "alma", label: "Imagen del alma", Ico: IcoAlma },
  { k: "cuentas", label: "Cuentas abiertas", Ico: IcoCuentas },
  { k: "ciclos", label: "Ciclos vitales", Ico: IcoCiclos },
];

/** Las tres disciplinas de la escuela, en el orden en que se estudian. */
export const DISCIPLINAS: Array<{ k: Disciplina; label: string; Ico: Ico }> = [
  { k: "kabala", label: "Kábala", Ico: IcoArbol },
  { k: "fengshui", label: "Feng Shui", Ico: IcoFengShui },
  { k: "numerologia", label: "Numerología", Ico: IcoNumerologia },
];

/**
 * La navegación del estudio: un grupo por disciplina y, dentro de Kábala, sus
 * siete partes. Es la misma lista en los dos sitios donde aparece — la columna
 * de la izquierda en pantalla ancha y el cajón del menú en móvil y tableta —
 * para que no haya dos navegaciones que mantener y que puedan discrepar.
 *
 * `alCambiar` lo usa el cajón para cerrarse en cuanto se elige algo.
 */
export function NavDisciplinas({ alCambiar, compacta }: { alCambiar?: () => void; compacta?: boolean }) {
  const { r, re, seccion, setSeccion, disciplina, setDisciplina } = useApp();
  const quieto = useReducedMotion();
  // Qué disciplinas están desplegadas. Se abre la que se está mirando, y
  // pulsando su nombre se cierra: en cuanto haya partes en las tres, la
  // columna entera abierta no cabría de una vez.
  const [abiertas, setAbiertas] = useState<Disciplina[]>(["kabala"]);
  if (!r && !re) return null;
  // El estudio de empresa cabe entero en una pantalla: no hay siete partes
  // que listar porque seis de ellas salen de la fecha, y no hay fecha.
  const partesKabala = re ? KABALA.slice(0, 1) : KABALA;

  const alterna = (d: Disciplina) => {
    setDisciplina(d);
    setAbiertas((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  };

  const fila = (activo: boolean, Ico: Ico, label: string, onClick: () => void, grande?: boolean, abierta?: boolean) => (
    <button
      key={label}
      onClick={onClick}
      title={compacta ? label : undefined}
      aria-label={compacta ? label : undefined}
      style={css(
        "display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:9px 10px;white-space:nowrap;border:none;border-radius:var(--r-sm);cursor:pointer;letter-spacing:-.01em;line-height:1.25;transition:background .18s,color .18s;" +
          (grande ? "font-size:var(--t-read);font-weight:600;" : "font-size:var(--t-body);font-weight:590;") +
          "background:" +
          (activo ? "var(--gold-soft)" : "transparent") +
          ";color:" +
          (activo ? "var(--gold-deep)" : grande ? "var(--text)" : "var(--text-3)") +
          ";"
      )}
    >
      <span
        style={css(
          "flex:none;display:grid;place-items:center;" +
            (grande ? "width:26px;height:26px;border-radius:9px;background:var(--gold-soft);" : "") +
            "color:" +
            (activo || grande ? "var(--gold)" : "var(--text-4)") +
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

  return (
    <nav style={css("display:flex;flex-direction:column;gap:var(--s5);")}>
      {DISCIPLINAS.map((d) => {
        const dentro = disciplina === d.k;
        // Sólo Kábala tiene partes por ahora; las otras dos no llevan flecha
        // porque no hay nada que desplegar todavía.
        const partes = d.k === "kabala" ? partesKabala : [];
        const abierta = partes.length > 0 && (compacta || abiertas.includes(d.k));
        return (
          <div key={d.k} style={css("display:flex;flex-direction:column;gap:2px;")}>
            {/* La disciplina abierta no se resalta si es Kábala: ya se ve
             * cuál está por la sección marcada de dentro. */}
            {fila(
              dentro && !partes.length,
              d.Ico,
              d.label,
              () => {
                if (partes.length) alterna(d.k);
                else {
                  setDisciplina(d.k);
                  alCambiar?.();
                }
              },
              true,
              partes.length ? abierta : undefined
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
                  {!compacta && <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-4);padding:var(--s2) 10px 2px;")}>El estudio</div>}
                  {partes.map(({ k, label, Ico }, i) => (
                    <motion.div
                      key={k}
                      initial={quieto ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {fila(seccion === k && dentro, Ico, label, () => {
                        // Pulsar una parte de Kábala devuelve a Kábala, aunque
                        // se estuviera mirando otra disciplina.
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
          ";height:calc(100vh - 63px);overflow-y:auto;overflow-x:hidden;padding:14px 12px 28px;background:var(--bg);border-right:1px solid var(--border);transition:width .3s cubic-bezier(.22,1,.36,1);"
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
