"use client";

/**
 * ============================================================================
 * LA GUÍA DE PRIMEROS PASOS: LA PASTILLA Y LA NUBE
 * ============================================================================
 *
 * Gerson, el 21 de octubre de 2026, antes de dar acceso a Marco: «quiero esa
 * UI de cuando una persona abre una app y tiene los primeros pasos, y que eso
 * le sume puntos. Hasta que no complete los puntos no quiero que le deje de
 * salir las nubes. UI Apple style modern».
 *
 * SON DOS PIEZAS, Y LAS DOS SALEN EN TODAS LAS PANTALLAS:
 *
 *   · LA PASTILLA, abajo a la izquierda (en el móvil, abajo del todo): un aro
 *     que se llena, «Primeros pasos · 2 de 7» y los puntos que quedan por
 *     ganar. Se pulsa y se abre la lista entera, con lo hecho tachado.
 *
 *   · LA NUBE: un bocadillo que señala EL SITIO EXACTO del siguiente paso —el
 *     botón, la fila del menú, la caja donde se escribe—, con un halo que late
 *     alrededor. Si ese sitio no está en la pantalla (otra vista, o el menú
 *     escondido en el móvil), la nube se posa encima de la pastilla y ofrece
 *     llevarle.
 *
 * NO SE PUEDE QUITAR PARA SIEMPRE. «Luego» la esconde en esta pantalla y
 * vuelve en la siguiente. La pastilla no se cierra. Las dos se van solas, y
 * para siempre, cuando el último paso está hecho: ahí no hay nada que pedir.
 *
 * LOS PUNTOS NO SE CUENTAN AQUÍ: los pasos y lo que vale cada uno salen de
 * `lib/escuela/puntos.ts`, igual que en la cabecera y en el inicio. Al
 * cambiar de pantalla se vuelve a mirar —eso es lo que tacha un paso recién
 * hecho— y se avisa a la cabecera, que es la que celebra con su «+N puntos».
 *
 * Los sitios a los que apunta llevan `data-guia` en el marcado. Si alguien
 * cambia un botón de sitio, la nube lo sigue; si lo quita, apunta al menú.
 */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { useApp } from "@/lib/app-context";
import { misPuntos, refrescaPuntos, type MisPuntos, type Paso } from "@/lib/escuela/puntos";

/** Dónde está cada paso, del sitio más preciso al menos. Gana el primero visible. */
const DONDE: Record<string, string[]> = {
  foto: ["foto-perfil", "foto"],
  tema: ["tema", "nav-comunidad"],
  resp: ["resp", "nav-comunidad"],
  curso: ["curso", "nav-cursos"],
  clase: ["clase", "editar", "nav-cursos"],
  publicar: ["publicar", "editar", "nav-cursos"],
  agenda: ["nav-miagenda"],
  leccion: ["leccion", "nav-cursos"],
};

/** Por qué cada paso, en una línea: lo que gana quien lo hace, no lo que queremos. */
const PARA: Record<string, string> = {
  foto: "Con tu cara, la gente sabe con quién habla.",
  tema: "Preséntate o pregunta lo que quieras. Iris lo lee.",
  resp: "Contestar a otra persona es la forma más rápida de conocerla.",
  curso: "Un borrador basta. Nadie lo ve hasta que lo pidas.",
  clase: "Entra en tu curso y sube el vídeo de la primera lección.",
  publicar: "Marca que está listo. Iris lo revisa y lo publica.",
  agenda: "Aquí apuntas tus directos y tus sesiones.",
  leccion: "Entra en tu curso y marca la primera clase como hecha.",
};

type Caja = { x: number; y: number; w: number; h: number };

function visible(el: Element): Caja | null {
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  const s = getComputedStyle(el);
  if (s.visibility === "hidden" || s.display === "none") return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/** El primer sitio del paso que se ve ahora mismo, o null. */
function buscaSitio(k: string): Caja | null {
  for (const g of DONDE[k] ?? []) {
    for (const el of Array.from(document.querySelectorAll(`[data-guia="${g}"]`))) {
      const c = visible(el);
      if (c) return c;
    }
  }
  return null;
}

/** El aro de progreso de la pastilla. */
function Aro({ hechos, total, tam = 34 }: { hechos: number; total: number; tam?: number }) {
  const r = tam / 2 - 3;
  const largo = 2 * Math.PI * r;
  const k = total ? hechos / total : 0;
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} aria-hidden style={css("flex:none;transform:rotate(-90deg);")}>
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="var(--bloque-borde)" strokeWidth="3" />
      <motion.circle
        cx={tam / 2}
        cy={tam / 2}
        r={r}
        fill="none"
        stroke="var(--oro-luz)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={largo}
        initial={false}
        animate={{ strokeDashoffset: largo * (1 - k) }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </svg>
  );
}

export default function GuiaPasos() {
  const { usuario, puede } = useSesion();
  const { view, setView } = useApp();
  const quieto = useReducedMotion();
  const [p, setP] = useState<MisPuntos | null>(null);
  const [abierta, setAbierta] = useState(false);
  const [luego, setLuego] = useState<string>("");
  const [sitio, setSitio] = useState<Caja | null>(null);
  const [listo, setListo] = useState(false);
  const [ancho, setAncho] = useState(1440);
  /* El hueco que deja la columna para la pastilla. Sin columna (móvil), null. */
  const [ancla, setAncla] = useState<HTMLElement | null>(null);
  const [cajaAncla, setCajaAncla] = useState<Caja | null>(null);
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? Boolean(usuario.foto) : false;

  const carga = useCallback(async () => {
    if (!uid) return;
    const x = await misPuntos(uid, foto, puede).catch(() => null);
    if (x) setP(x);
  }, [uid, foto, puede]);

  /* Al cambiar de pantalla se vuelve a mirar: es lo que tacha un paso recién
     hecho. `refrescaPuntos` además avisa a la cabecera, que celebra. */
  useEffect(() => {
    refrescaPuntos();
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLuego("");
  }, [view]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void carga();
    const oye = () => void carga();
    window.addEventListener("es33:puntos", oye);
    return () => window.removeEventListener("es33:puntos", oye);
  }, [carga]);

  const pendientes = p ? p.pasos.filter((s) => !s.hecho) : [];
  const siguiente: Paso | undefined = pendientes[0];

  /* Mientras la pastilla está, la página deja hueco abajo para que no tape
     lo último que hay en ella. */
  const activa = Boolean(siguiente) && !ancla;
  useEffect(() => {
    if (!activa) return;
    document.documentElement.dataset.guia = "1";
    return () => {
      delete document.documentElement.dataset.guia;
    };
  }, [activa]);

  /*
   * DÓNDE APUNTAR, mirado cada poco. La pantalla se mueve —se hace scroll, se
   * abre un curso, carga una lista— y el botón cambia de sitio; un reloj de
   * un tercio de segundo es lo más simple que lo sigue sin enredarse con cada
   * componente. Y espera a que se cierre la bienvenida de los puntos: dos
   * cosas hablando a la vez no se leen.
   */
  useEffect(() => {
    if (!siguiente) return;
    const mira = () => {
      setAncho(window.innerWidth);
      let bienvenidaVista = true;
      try {
        bienvenidaVista = Boolean(localStorage.getItem(`es33.puntos-vistos.${uid}`));
      } catch {
        /* sin almacenamiento: no se espera a nada */
      }
      setListo(bienvenidaVista);
      setSitio(buscaSitio(siguiente.k));
      const a = document.querySelector<HTMLElement>("[data-guia-ancla]");
      const r = a ? a.getBoundingClientRect() : null;
      const vale = a && r && r.width > 30 && a.offsetParent !== null;
      setAncla(vale ? a : null);
      setCajaAncla(vale && r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null);
    };
    mira();
    const t = window.setInterval(mira, 350);
    window.addEventListener("resize", mira);
    window.addEventListener("scroll", mira, true);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("resize", mira);
      window.removeEventListener("scroll", mira, true);
    };
  }, [siguiente, uid]);

  if (!p || !siguiente || typeof document === "undefined") return null;

  const total = p.pasos.length;
  const hechos = total - pendientes.length;
  const quedan = pendientes.reduce((s, x) => s + x.puntos, 0);
  const movil = ancho < 760;
  /* Con la pastilla en la columna, la lista y la nube suelta salen a su
     derecha, a la altura de abajo. */
  const alLado = cajaAncla ? `left:${cajaAncla.x + cajaAncla.w + 26}px;bottom:24px;` : "";
  const estrecha = Boolean(cajaAncla && cajaAncla.w < 120);
  const nubeFuera = luego !== siguiente.k && listo && !abierta;
  /* En el sitio exacto sólo si el sitio está; si no, encima de la pastilla. */
  const anclada = Boolean(sitio);
  const enSuSitio = view === siguiente.ir;

  /* Dónde va la nube cuando señala algo: a la derecha si hay hueco (el menú
     de la izquierda), si no debajo, y si no encima. */
  const ANCHO_NUBE = 300;
  let pos: { left: number; top: number; flecha: "izq" | "arriba" | "abajo" } | null = null;
  if (sitio) {
    const derecha = sitio.x + sitio.w + 16;
    if (!movil && derecha + ANCHO_NUBE < ancho - 12) {
      pos = { left: derecha, top: Math.max(12, sitio.y + sitio.h / 2 - 54), flecha: "izq" };
    } else {
      const left = Math.min(Math.max(12, sitio.x + sitio.w / 2 - ANCHO_NUBE / 2), ancho - ANCHO_NUBE - 12);
      const abajo = sitio.y + sitio.h + 14;
      pos = abajo + 190 < window.innerHeight
        ? { left, top: abajo, flecha: "arriba" }
        : { left, top: Math.max(12, sitio.y - 14 - 170), flecha: "abajo" };
    }
  }

  const muelle = quieto ? { duration: 0.15 } : { type: "spring" as const, stiffness: 380, damping: 30 };

  const nube = (
    <motion.div
      key={`nube-${siguiente.k}-${anclada ? "s" : "d"}`}
      role="dialog"
      aria-label={`Siguiente paso: ${siguiente.que}`}
      initial={quieto ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={quieto ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
      transition={muelle}
      style={css(
        "position:fixed;z-index:62;pointer-events:auto;" +
          (pos
            ? `left:${pos.left}px;top:${pos.top}px;width:${Math.min(ANCHO_NUBE, ancho - 24)}px;`
            : movil
              ? "left:12px;right:12px;bottom:84px;"
              : alLado
                ? `${alLado}width:${ANCHO_NUBE}px;`
                : `left:24px;bottom:92px;width:${ANCHO_NUBE}px;`) +
          "padding:16px 16px 14px;border-radius:var(--r-lg);background:var(--bloque);color:var(--sobre-bloque);" +
          "border:1px solid var(--bloque-borde);box-shadow:0 18px 50px color-mix(in srgb, var(--bloque) 45%, transparent);"
      )}
    >
      {/* La punta del bocadillo, girada hacia lo que señala. */}
      {pos && (
        <span
          aria-hidden
          style={css(
            "position:absolute;width:14px;height:14px;background:var(--bloque);transform:rotate(45deg);" +
              (pos.flecha === "izq"
                ? "left:-7px;top:46px;border-left:1px solid var(--bloque-borde);border-bottom:1px solid var(--bloque-borde);"
                : pos.flecha === "arriba"
                  ? `top:-7px;left:${Math.min(Math.max(18, (sitio ? sitio.x + sitio.w / 2 : 0) - pos.left - 7), ANCHO_NUBE - 32)}px;border-left:1px solid var(--bloque-borde);border-top:1px solid var(--bloque-borde);`
                  : `bottom:-7px;left:${Math.min(Math.max(18, (sitio ? sitio.x + sitio.w / 2 : 0) - pos.left - 7), ANCHO_NUBE - 32)}px;border-right:1px solid var(--bloque-borde);border-bottom:1px solid var(--bloque-borde);`)
          )}
        />
      )}
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;")}>
        <span style={css("font-size:var(--t-mini);color:var(--oro-luz);font-weight:500;")}>
          Paso {hechos + 1} de {total}
        </span>
        <span
          style={css(
            "font-size:var(--t-mini);font-weight:500;padding:3px 9px;border-radius:var(--r-pill);color:var(--vino);" +
              "background:linear-gradient(135deg,var(--oro-luz),var(--oro));"
          )}
        >
          +{siguiente.puntos} puntos
        </span>
      </div>
      <div style={css("font-size:var(--t-read);font-weight:500;letter-spacing:-.015em;line-height:1.3;")}>{siguiente.que}</div>
      <p style={css("margin:6px 0 0;font-size:var(--t-mini);line-height:1.5;color:var(--sobre-bloque-2);")}>
        {PARA[siguiente.k] ?? ""}
      </p>
      <div style={css("display:flex;gap:8px;margin-top:12px;")}>
        {!enSuSitio && (
          <button
            onClick={() => setView(siguiente.ir)}
            style={css(
              "font:inherit;font-size:var(--t-mini);font-weight:500;padding:8px 14px;border-radius:var(--r-pill);cursor:pointer;border:none;" +
                "background:var(--sobre-bloque);color:var(--vino);"
            )}
          >
            Llévame
          </button>
        )}
        <button
          onClick={() => setLuego(siguiente.k)}
          style={css(
            "font:inherit;font-size:var(--t-mini);font-weight:500;padding:8px 14px;border-radius:var(--r-pill);cursor:pointer;" +
              "background:transparent;color:var(--sobre-bloque-2);border:1px solid var(--bloque-borde);"
          )}
        >
          Luego
        </button>
      </div>
    </motion.div>
  );

  /* La pastilla: siempre, hasta el último paso. En la columna cuando la hay
     —granate, para que destaque sobre el cristal—; si no, flotando abajo. */
  const pastilla = (
    <motion.button
      onClick={() => setAbierta((a) => !a)}
      aria-expanded={abierta}
      aria-label={estrecha ? `Primeros pasos: ${hechos} de ${total}` : undefined}
      initial={quieto ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={muelle}
      style={css(
        (ancla ? "position:relative;width:100%;" : "position:fixed;z-index:63;" + (movil ? "left:12px;right:12px;bottom:14px;" : "left:24px;bottom:24px;")) +
          "display:flex;align-items:center;gap:11px;cursor:pointer;font:inherit;text-align:left;" +
          (estrecha ? "justify-content:center;padding:6px;" : "padding:9px 14px 9px 9px;") +
          (ancla ? "border-radius:var(--r);" : "border-radius:var(--r-pill);") +
          "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);" +
          "box-shadow:0 10px 30px color-mix(in srgb, var(--bloque) 35%, transparent);"
      )}
    >
      <span style={css("position:relative;display:grid;place-items:center;flex:none;")}>
        <Aro hechos={hechos} total={total} />
        <span style={css("position:absolute;font-size:var(--t-mini);font-weight:500;color:var(--sobre-bloque);")}>{hechos}</span>
      </span>
      {!estrecha && (
        <>
          <span style={css("display:flex;flex-direction:column;line-height:1.25;min-width:0;")}>
            <span style={css("font-size:var(--t-body);font-weight:500;letter-spacing:-.01em;")}>Primeros pasos</span>
            <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>
              {hechos} de {total} · <span style={css("color:var(--oro-luz);font-weight:500;")}>+{quedan} puntos</span>
            </span>
          </span>
          <span aria-hidden style={css("margin-left:auto;padding-left:4px;color:var(--oro-luz);font-size:var(--t-mini);")}>
            {abierta ? "▾" : "▴"}
          </span>
        </>
      )}
    </motion.button>
  );

  return createPortal(
    <>
      {/* El halo que late alrededor de lo que hay que pulsar. */}
      <AnimatePresence>
        {nubeFuera && sitio && (
          <motion.span
            key={`halo-${siguiente.k}`}
            aria-hidden
            data-guia-halo=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={css(
              `position:fixed;z-index:61;pointer-events:none;left:${sitio.x - 5}px;top:${sitio.y - 5}px;width:${sitio.w + 10}px;height:${sitio.h + 10}px;` +
                "border-radius:var(--r);border:2px solid var(--oro);"
            )}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{nubeFuera && nube}</AnimatePresence>

      {/* La lista entera, al pulsar la pastilla. */}
      <AnimatePresence>
        {abierta && (
          <motion.div
            key="lista"
            role="dialog"
            aria-label="Tus primeros pasos"
            initial={quieto ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={muelle}
            style={css(
              "position:fixed;z-index:63;" +
                (movil ? "left:12px;right:12px;bottom:84px;" : alLado ? `${alLado}width:340px;` : "left:24px;bottom:92px;width:340px;") +
                "padding:18px;border-radius:var(--r-tarjeta);background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-lg);color:var(--text);"
            )}
          >
            <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:10px;")}>
              <span style={css("font-size:var(--t-read);font-weight:500;letter-spacing:-.02em;")}>Tus primeros pasos</span>
              <span style={css("font-size:var(--t-mini);color:var(--text-3);")}>
                {hechos} de {total}
              </span>
            </div>
            <p style={css("margin:4px 0 12px;font-size:var(--t-mini);color:var(--text-3);line-height:1.5;")}>
              Cada paso suma puntos. Te quedan {quedan} por ganar.
            </p>
            <ol style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;")}>
              {p.pasos.map((s) => {
                const es = s.k === siguiente.k;
                return (
                  <li key={s.k}>
                    <button
                      onClick={() => {
                        setView(s.ir);
                        setAbierta(false);
                        setLuego("");
                      }}
                      disabled={s.hecho}
                      style={css(
                        "width:100%;display:flex;align-items:center;gap:11px;text-align:left;font:inherit;padding:10px 10px;border-radius:var(--r-sm);" +
                          (s.hecho ? "cursor:default;" : "cursor:pointer;") +
                          (es ? "background:color-mix(in srgb, var(--oro) 14%, transparent);" : "background:transparent;") +
                          "border:none;color:var(--text);"
                      )}
                    >
                      <span
                        aria-hidden
                        style={css(
                          "flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-mini);" +
                            (s.hecho
                              ? "background:var(--oro);color:var(--vino);"
                              : es
                                ? "border:2px solid var(--oro);"
                                : "border:1.5px solid var(--border-strong);")
                        )}
                      >
                        {s.hecho ? "✓" : ""}
                      </span>
                      <span
                        style={css(
                          "flex:1;min-width:0;font-size:var(--t-body);" +
                            (s.hecho ? "color:var(--text-4);text-decoration:line-through;" : "")
                        )}
                      >
                        {s.que}
                      </span>
                      <span style={css("flex:none;font-size:var(--t-mini);font-weight:500;color:" + (s.hecho ? "var(--text-4)" : "var(--gold)") + ";")}>
                        +{s.puntos}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {!ancla && pastilla}
      {ancla && createPortal(pastilla, ancla)}
    </>,
    document.body
  );
}
