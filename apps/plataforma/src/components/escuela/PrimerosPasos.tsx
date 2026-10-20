"use client";

/**
 * ============================================================================
 * TUS PRIMEROS PASOS: LOS TROFEOS DE EMPEZAR
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «que puedan llenar ciertos puntos o
 * ciertos trofeos: llenar su cuenta, su foto, comentar en la escuela…». Y
 * después: «dale más contraste a eso de los puntos, que siempre se realce».
 *
 * Por eso la cabeza de la pieza es una banda dorada con los puntos en grande:
 * es lo primero que se ve al entrar, y es lo que dice «vas ganando». Cada paso
 * se tacha solo cuando se hace —se mira lo que hay, no hay un botón de «ya lo
 * he hecho»—. Los puntos se cuentan en `lib/escuela/puntos.ts`, el mismo sitio
 * que usan la cabecera y la comunidad.
 */
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { TARJETA } from "@/lib/ui";
import { misPuntos, type MisPuntos } from "@/lib/escuela/puntos";

export default function PrimerosPasos() {
  const { usuario, puede } = useSesion();
  const { setView } = useApp();
  const [p, setP] = useState<MisPuntos | null>(null);
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? Boolean(usuario.foto) : false;

  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    misPuntos(uid, foto, puede).then((x) => vivo && setP(x));
    return () => {
      vivo = false;
    };
  }, [uid, foto, puede]);

  if (!p) return null;
  const todo = p.dePasos === p.dePasosMax;

  return (
    <section style={css(TARJETA + "padding:0;overflow:hidden;display:flex;flex-direction:column;")}>
      {/* ------------------------------------------- la banda de los puntos */}
      <div
        style={css(
          "padding:var(--pad-card-sm);display:flex;align-items:center;justify-content:space-between;gap:var(--s4);flex-wrap:wrap;" +
            "background:linear-gradient(120deg,var(--oro-luz) 0%,color-mix(in srgb, var(--oro) 70%, var(--oro-luz)) 100%);color:var(--vino);"
        )}
      >
        <div style={css("min-width:0;")}>
          <div style={css("font-size:var(--t-mini);font-weight:500;")}>{todo ? "Medalla de bienvenida conseguida" : "Tus primeros pasos"}</div>
          <h2 style={css("margin:4px 0 0;font-size:var(--t-head);font-weight:500;letter-spacing:-.025em;color:var(--vino);")}>
            {todo ? "Lo has hecho todo. ¡Bien hecho!" : `Te faltan ${p.dePasosMax - p.dePasos} puntos para tu medalla`}
          </h2>
          <p style={css("margin:4px 0 0;font-size:var(--t-body);color:var(--vino);opacity:.85;")}>
            Cada paso suma. Y cada vez que hablas en la comunidad, sumas más.
          </p>
        </div>
        <div style={css("display:flex;align-items:center;gap:var(--s4);")}>
          <div style={css("text-align:right;")}>
            <div style={css("font-weight:300;font-size:clamp(48px,5vw,68px);letter-spacing:-.05em;line-height:.9;font-variant-numeric:tabular-nums;")}>{p.total}</div>
            <div style={css("font-size:var(--t-mini);font-weight:500;margin-top:4px;")}>puntos · nivel {p.nivel.nombre}</div>
          </div>
          <span
            aria-hidden="true"
            style={css(
              "width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;flex:none;" +
                (todo ? "background:var(--vino);color:var(--oro-luz);box-shadow:0 8px 22px color-mix(in srgb, var(--vino) 35%, transparent);" : "background:color-mix(in srgb, var(--vino) 12%, transparent);color:var(--vino);")
            )}
          >
            {todo ? "🏅" : "✦"}
          </span>
        </div>
      </div>
      <div style={css("height:8px;background:color-mix(in srgb, var(--oro) 25%, var(--surface));")}>
        <div style={css(`height:100%;width:${(p.dePasos / p.dePasosMax) * 100}%;background:var(--vino);transition:width var(--t-lento) var(--curva);`)} />
      </div>

      {/* --------------------------------------------------- los pasos */}
      <ul style={css("list-style:none;margin:0;padding:var(--pad-card-sm);display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));")}>
        {p.pasos.map((x) => (
          <li key={x.k}>
            <button
              onClick={() => setView(x.ir)}
              disabled={x.hecho}
              style={css(
                "width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);font:inherit;text-align:left;" +
                  (x.hecho
                    ? "background:var(--accion-suave);border:1px solid var(--accion-borde);cursor:default;"
                    : "background:var(--surface);border:1px dashed var(--border-strong);cursor:pointer;")
              )}
            >
              <span
                aria-hidden="true"
                style={css(
                  "flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-mini);" +
                    (x.hecho ? "background:var(--accion);color:var(--sobre-accion);" : "border:1.5px dashed var(--border-strong);color:var(--text-4);")
                )}
              >
                {x.hecho ? "✓" : "+"}
              </span>
              <span style={css("flex:1;min-width:0;font-size:var(--t-body);color:var(--text);" + (x.hecho ? "text-decoration:line-through;text-decoration-color:var(--text-4);" : ""))}>
                {x.que}
              </span>
              <span style={css("flex:none;font-size:var(--t-mini);font-weight:600;padding:3px 9px;border-radius:var(--r-pill);background:var(--vino);color:var(--oro-luz);")}>
                +{x.puntos}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
