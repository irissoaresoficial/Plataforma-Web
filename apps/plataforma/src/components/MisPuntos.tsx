"use client";
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { misPuntos, type MisPuntos as Puntos } from "@/lib/escuela/puntos";

/**
 * LOS PUNTOS, EN LA CABECERA DE TODAS LAS PANTALLAS.
 *
 * Gerson: «que siempre se realce en cada apartado». Una pastilla dorada con
 * los puntos y el nivel, a la vista mientras se navega, para que participar
 * se note en el momento y no sólo al ir a mirarlo. Pulsarla lleva al inicio,
 * donde están los pasos que faltan.
 *
 * Iris no la lleva: es la anfitriona y no compite.
 */
export default function MisPuntos() {
  const { usuario, puede, esAdmin } = useSesion();
  const { setView } = useApp();
  const [p, setP] = useState<Puntos | null>(null);
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? Boolean(usuario.foto) : false;

  useEffect(() => {
    if (!uid || esAdmin) return;
    let vivo = true;
    misPuntos(uid, foto, puede).then((x) => vivo && setP(x)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [uid, foto, puede, esAdmin]);

  if (!p || esAdmin) return null;
  return (
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
      <span style={css("font-size:var(--t-body);font-weight:600;font-variant-numeric:tabular-nums;")}>{p.total}</span>
      <span data-agente-texto="" style={css("font-size:var(--t-mini);font-weight:500;")}>
        puntos · {p.nivel.nombre}
      </span>
    </button>
  );
}
