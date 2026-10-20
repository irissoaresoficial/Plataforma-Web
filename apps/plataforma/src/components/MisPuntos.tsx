"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { misPuntos, type MisPuntos as Puntos } from "@/lib/escuela/puntos";

/**
 * LOS PUNTOS: LA PASTILLA DE LA CABECERA Y LAS CELEBRACIONES.
 *
 * Gerson, el 20 de octubre de 2026: «necesito que tenga los pop up apareciendo
 * en un primer registro, para que vean cómo cargan sus puntos; la idea es que
 * genere más dopamina; realzado de una forma profesional y elegante, estilo
 * Apple premium, para toda la plataforma».
 *
 * TRES MOMENTOS:
 *   1. LA PRIMERA VEZ que alguien entra: una hoja de bienvenida en el centro,
 *      con sus puntos subiendo desde cero y lo que puede ganar.
 *   2. CADA VEZ QUE GANA ALGO —pone su foto, escribe en la comunidad, sube su
 *      primera clase—: un aviso abajo, de cristal oscuro y oro, con «+10» y
 *      el porqué. Uno detrás de otro si son varios. Y si sube de nivel, otro.
 *   3. SIEMPRE: la pastilla de arriba, con el número contando hasta su valor.
 *
 * Se recuerda lo ya celebrado en este navegador para no repetir la fiesta en
 * cada pantalla. Si alguien entra desde otro ordenador, le saldrá la
 * bienvenida otra vez: es mejor eso que guardar en la base de datos una
 * marca que no sirve para nada más.
 *
 * Iris no la lleva: es la anfitriona y no compite.
 */

type Visto = { total: number; hechos: string[]; com: number; nivel: string };
type Aviso = { id: string; puntos?: number; titulo: string; detalle: string };

const CLAVE = (uid: string) => `es33.puntos-vistos.${uid}`;
const lee = (uid: string): Visto | null => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE(uid)) || "null");
  } catch {
    return null;
  }
};
const guarda = (uid: string, p: Puntos) => {
  try {
    localStorage.setItem(
      CLAVE(uid),
      JSON.stringify({ total: p.total, hechos: p.pasos.filter((x) => x.hecho).map((x) => x.k), com: p.deComunidad, nivel: p.nivel.nombre })
    );
  } catch {
    /* sin almacenamiento */
  }
};

/** Un número que cuenta hasta su valor, como un marcador. */
function useCuenta(objetivo: number, quieto: boolean | null) {
  const [n, setN] = useState(0);
  const desde = useRef(0);
  useEffect(() => {
    if (quieto) {
      desde.current = objetivo;
      const t = setTimeout(() => setN(objetivo), 0);
      return () => clearTimeout(t);
    }
    const ini = desde.current;
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 1100);
      const suave = 1 - Math.pow(1 - k, 3);
      setN(Math.round(ini + (objetivo - ini) * suave));
      if (k < 1) raf = requestAnimationFrame(paso);
      else desde.current = objetivo;
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, quieto]);
  return n;
}

export default function MisPuntos() {
  const { usuario, puede, esAdmin } = useSesion();
  const { setView } = useApp();
  const quieto = useReducedMotion();
  const [p, setP] = useState<Puntos | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [bienvenida, setBienvenida] = useState(false);
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? Boolean(usuario.foto) : false;
  const nombre = ((usuario && usuario.nombre) || "").split(" ")[0];

  const carga = useCallback(async () => {
    if (!uid || esAdmin) return;
    const x = await misPuntos(uid, foto, puede).catch(() => null);
    if (!x) return;
    setP(x);
    const visto = lee(uid);
    if (!visto) {
      setBienvenida(true);
      return;
    }
    const nuevos: Aviso[] = x.pasos
      .filter((s) => s.hecho && !visto.hechos.includes(s.k))
      .map((s) => ({ id: `${s.k}-${Date.now()}`, puntos: s.puntos, titulo: `+${s.puntos} puntos`, detalle: s.que }));
    const com = x.deComunidad - visto.com;
    if (com > 0) nuevos.push({ id: `com-${Date.now()}`, puntos: com, titulo: `+${com} puntos`, detalle: "Por participar en la comunidad" });
    if (x.nivel.nombre !== visto.nivel && x.total > visto.total) {
      nuevos.push({ id: `nivel-${Date.now()}`, titulo: `Nuevo nivel: ${x.nivel.nombre}`, detalle: x.nivel.siguiente ? `El siguiente es ${x.nivel.siguiente}. Te faltan ${x.nivel.faltan}.` : "Has llegado a lo más alto." });
    }
    if (nuevos.length) setAvisos((a) => [...a, ...nuevos]);
    guarda(uid, x);
  }, [uid, foto, puede, esAdmin]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void carga();
    const oye = () => void carga();
    window.addEventListener("es33:puntos", oye);
    return () => window.removeEventListener("es33:puntos", oye);
  }, [carga]);

  /* Los avisos salen de uno en uno: cada uno se queda tres segundos y medio. */
  useEffect(() => {
    if (!avisos.length) return;
    const t = setTimeout(() => setAvisos((a) => a.slice(1)), 3600);
    return () => clearTimeout(t);
  }, [avisos]);

  const total = useCuenta(p ? p.total : 0, quieto);
  const enBienvenida = useCuenta(bienvenida && p ? p.total : 0, quieto);

  if (!p || esAdmin) return null;
  const aviso = avisos[0];

  const cierraBienvenida = () => {
    setBienvenida(false);
    guarda(uid, p);
  };

  return (
    <>
      {/* ------------------------------------------- la pastilla de arriba */}
      <button
        onClick={() => setView("escuela")}
        aria-label={`Tienes ${p.total} puntos, nivel ${p.nivel.nombre}`}
        title="Tus puntos: mira cómo ganar más"
        style={css(
          "flex:none;display:flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 6px;cursor:pointer;font:inherit;white-space:nowrap;" +
            "border-radius:var(--r-pill);border:1px solid color-mix(in srgb, var(--oro) 60%, transparent);" +
            "background:linear-gradient(120deg,var(--oro-luz),color-mix(in srgb, var(--oro) 70%, var(--oro-luz)));color:var(--vino);" +
            "box-shadow:0 6px 16px color-mix(in srgb, var(--oro) 35%, transparent);"
        )}
      >
        <span aria-hidden="true" style={css("width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--vino);color:var(--oro-luz);font-size:13px;")}>
          ✦
        </span>
        <span style={css("font-size:var(--t-body);font-weight:600;font-variant-numeric:tabular-nums;")}>{total}</span>
        <span data-agente-texto="" style={css("font-size:var(--t-mini);font-weight:500;")}>
          puntos · {p.nivel.nombre}
        </span>
      </button>

      {/*
        FUERA DE LA CABECERA, con un portal. La cabecera es cristal
        (`backdrop-filter`), y un elemento con filtro se vuelve el marco de
        todo lo `fixed` que lleva dentro: el aviso salía pegado a ella y la
        bienvenida cortada por arriba en vez de en el centro de la pantalla.
      */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
      {/* --------------------------------------- los avisos de abajo */}
      <div aria-live="polite" style={css("position:fixed;left:0;right:0;bottom:24px;z-index:90;display:flex;justify-content:center;pointer-events:none;padding:0 16px;")}>
        <AnimatePresence mode="wait">
          {aviso && (
            <motion.div
              key={aviso.id}
              initial={quieto ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={quieto ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={css(
                "pointer-events:auto;display:flex;align-items:center;gap:14px;padding:12px 22px 12px 12px;border-radius:var(--r-pill);max-width:min(460px,100%);" +
                  "background:color-mix(in srgb, var(--vino) 90%, transparent);backdrop-filter:saturate(1.6) blur(18px);-webkit-backdrop-filter:saturate(1.6) blur(18px);" +
                  "border:1px solid var(--bloque-borde);box-shadow:0 18px 50px color-mix(in srgb, var(--vino) 45%, transparent);color:var(--sobre-bloque);"
              )}
            >
              <span style={css("position:relative;flex:none;width:44px;height:44px;")}>
                {/* El destello: un aro de oro que se abre y se apaga. */}
                {!quieto && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0.6, opacity: 0.9 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    style={css("position:absolute;inset:0;border-radius:50%;border:2px solid var(--oro-luz);")}
                  />
                )}
                <span style={css("position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--oro-luz),var(--oro));color:var(--vino);font-size:18px;")}>
                  ✦
                </span>
              </span>
              <span style={css("min-width:0;")}>
                <span style={css("display:block;font-size:var(--t-read);font-weight:600;letter-spacing:-.01em;color:var(--oro-luz);")}>{aviso.titulo}</span>
                <span style={css("display:block;font-size:var(--t-mini);color:var(--sobre-bloque-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{aviso.detalle}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --------------------------------------- la bienvenida, la primera vez */}
      <AnimatePresence>
        {bienvenida && (
          <motion.div
            key="velo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cierraBienvenida}
            style={css(
              "position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;" +
                "background:color-mix(in srgb, var(--bloque) 55%, transparent);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);"
            )}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Te damos la bienvenida"
              onClick={(e) => e.stopPropagation()}
              initial={quieto ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={quieto ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={css(
                "width:min(480px,100%);border-radius:28px;overflow:hidden;background:var(--surface);box-shadow:0 40px 120px color-mix(in srgb, var(--vino) 40%, transparent);"
              )}
            >
              <div
                style={css(
                  "position:relative;padding:34px 30px 28px;text-align:center;color:var(--sobre-bloque);background:var(--bloque);" +
                    "background-image:radial-gradient(360px 200px at 50% 0%,color-mix(in srgb, var(--oro) 40%, transparent),transparent 75%);"
                )}
              >
                <div style={css("font-size:var(--t-mini);color:var(--oro-luz);font-weight:500;")}>Escuela de Sabiduría 33</div>
                <div style={css("margin-top:6px;font-size:var(--t-head);font-weight:500;letter-spacing:-.02em;")}>
                  Te damos la bienvenida{nombre ? `, ${nombre}` : ""}
                </div>
                <div style={css("margin:18px auto 0;width:132px;height:132px;border-radius:50%;display:grid;place-items:center;position:relative;")}>
                  <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true" style={css("position:absolute;inset:0;")}>
                    <circle cx="66" cy="66" r="58" fill="none" stroke="var(--bloque-2)" strokeWidth="8" />
                    <motion.circle
                      cx="66"
                      cy="66"
                      r="58"
                      fill="none"
                      stroke="var(--oro-luz)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      transform="rotate(-90 66 66)"
                      initial={{ strokeDasharray: `0 ${2 * Math.PI * 58}` }}
                      animate={{ strokeDasharray: `${2 * Math.PI * 58 * Math.max(0.04, p.dePasos / p.dePasosMax)} ${2 * Math.PI * 58}` }}
                      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                    />
                  </svg>
                  <div>
                    <div style={css("font-weight:300;font-size:48px;letter-spacing:-.05em;line-height:1;font-variant-numeric:tabular-nums;color:var(--oro-luz);")}>{enBienvenida}</div>
                    <div style={css("font-size:var(--t-micro);color:var(--sobre-bloque-2);margin-top:4px;")}>puntos</div>
                  </div>
                </div>
                <div style={css("margin-top:12px;font-size:var(--t-body);color:var(--sobre-bloque-2);")}>
                  Nivel {p.nivel.nombre}. Ganas puntos con cada paso y cada vez que hablas en la comunidad.
                </div>
              </div>
              <div style={css("padding:22px 26px 26px;display:flex;flex-direction:column;gap:8px;")}>
                {p.pasos.slice(0, 5).map((x, i) => (
                  <motion.div
                    key={x.k}
                    initial={quieto ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
                    style={css("display:flex;align-items:center;gap:12px;font-size:var(--t-body);color:var(--text);")}
                  >
                    <span
                      aria-hidden="true"
                      style={css(
                        "flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-micro);" +
                          (x.hecho ? "background:var(--accion);color:var(--sobre-accion);" : "border:1.5px dashed var(--border-strong);")
                      )}
                    >
                      {x.hecho ? "✓" : ""}
                    </span>
                    <span style={css("flex:1;" + (x.hecho ? "color:var(--text-3);text-decoration:line-through;" : ""))}>{x.que}</span>
                    <span style={css("font-size:var(--t-mini);font-weight:600;padding:2px 9px;border-radius:var(--r-pill);background:var(--vino);color:var(--oro-luz);")}>+{x.puntos}</span>
                  </motion.div>
                ))}
                <button
                  onClick={cierraBienvenida}
                  style={css(
                    "margin-top:12px;height:50px;border:none;border-radius:var(--r-pill);cursor:pointer;font:inherit;font-size:var(--t-read);font-weight:600;" +
                      "background:var(--vino);color:var(--sobre-bloque);box-shadow:0 10px 26px color-mix(in srgb, var(--vino) 30%, transparent);"
                  )}
                >
                  Empezar a ganar puntos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
          </>,
          document.body
        )}
    </>
  );
}
