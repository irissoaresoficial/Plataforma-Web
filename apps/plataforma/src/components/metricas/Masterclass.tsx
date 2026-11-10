"use client";

/**
 * LA MASTERCLASS, DE UN VISTAZO (10 de noviembre de 2026).
 *
 * Gerson, mirando el panel que se le hizo fuera: «quiero que esto mismo
 * aparezca en la parte de métricas, veo info que ahora mismo es irrelevante,
 * quítalo». Y antes: «solamente quiero que se entienda cuánto se ha gastado,
 * qué ha hecho clic, por qué no ha funcionado y qué es lo que estamos haciendo
 * para mejorar».
 *
 * Así que son cuatro cifras y una lista de decisiones:
 *   · Invertido, visitas e inscritas salen de datos de verdad: lo que la web
 *     escribe cada mañana desde Meta (`campana`) y la gente que se ha apuntado
 *     en el formulario (`leads`). Ninguna es una estimación.
 *   · «Qué hacemos a partir de ahora» se guarda en `metricas-plan/masterclass`
 *     y se edita aquí mismo. Mientras nadie lo toque, sale lo de abajo.
 */

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { css } from "@/lib/css";
import { nube } from "@/lib/firebase";
import { BOTON_NORMAL, CAMPO, NOTA, botonPrincipal } from "@/lib/ui";
import type { DiaCampana } from "@/lib/despacho/campana";
import type { Lead } from "@/lib/despacho/leads";

const WEB = process.env.NEXT_PUBLIC_WEB_URL || "https://escueladesabiduria33.com";
const DESDE = "2026-10-20";
const CLASE = new Date("2026-11-26T21:00:00+01:00");

type Tono = "hecho" | "en-marcha" | "siguiente" | "urgente";
type Decision = { etiqueta: string; tono: Tono; titulo: string; porque: string };

const POR_DEFECTO: Decision[] = [
  {
    etiqueta: "Hecho · 10 nov",
    tono: "hecho",
    titulo: "Pagamos por inscripción, no por visita",
    porque: "Las visitas baratas no se apuntaban. La campaña nueva aprende de quien se inscribe.",
  },
  {
    etiqueta: "Hecho · 10 nov",
    tono: "hecho",
    titulo: "Anuncios nuevos que hablan del dolor",
    porque: "Imágenes y vídeos con historias de pareja y de familia, en vez de mensajes genéricos.",
  },
  {
    etiqueta: "Desde el 11 nov",
    tono: "en-marcha",
    titulo: "Correos a las clientas de Marco",
    porque: "Gente que ya le conoce y confía en él. Salen 50 al día desde la plataforma.",
  },
  {
    etiqueta: "13 nov",
    tono: "siguiente",
    titulo: "Si no llegan inscripciones, formulario dentro de Instagram",
    porque: "Con unos 40 € sin inscritas, que se apunten sin salir de la app.",
  },
];

const COLOR: Record<Tono, string> = {
  hecho: "var(--green, #3c8a5a)",
  "en-marcha": "var(--oro, #a9884f)",
  siguiente: "var(--text-3)",
  urgente: "var(--red, #b3403a)",
};

const euros = (n: number, dec = 2) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + " €";
const miles = (n: number) => n.toLocaleString("es-ES");

export default function Masterclass({ dias, leads }: { dias: DiaCampana[]; leads: Lead[] }) {
  const [plan, setPlan] = useState<Decision[]>(POR_DEFECTO);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Decision[]>([]);
  const [fallo, setFallo] = useState("");

  useEffect(() => {
    const base = nube();
    if (!base) return;
    getDoc(doc(base, "metricas-plan", "masterclass"))
      .then((r) => {
        const x = r.data()?.decisiones;
        if (Array.isArray(x) && x.length) setPlan(x as Decision[]);
      })
      .catch(() => {
        /* Sin permiso o sin red: se queda lo de por defecto. */
      });
  }, []);

  const n = useMemo(() => {
    const suyos = dias.filter((x) => x.dia >= DESDE);
    const gasto = suyos.reduce((a, x) => a + (x.gasto || 0), 0);
    const visitas = suyos.reduce((a, x) => a + (x.aterrizajes || 0), 0);
    const clics = suyos.reduce((a, x) => a + (x.clics || 0), 0);
    /* Inscritas: quien dejó su correo en el formulario de la masterclass,
       una vez por persona aunque se apuntara dos veces. */
    const correos = new Set(
      leads
        .filter((l) => l.origen === "curso" && /masterclass/i.test(l.detalle) && l.alta && l.alta.toISOString().slice(0, 10) >= DESDE)
        .map((l) => l.email.trim().toLowerCase()),
    );
    const inscritas = correos.size;
    const ultimo = suyos.map((x) => x.dia).sort().pop() ?? "";
    return { gasto, visitas, clics, inscritas, ultimo };
  }, [dias, leads]);

  const quedan = Math.max(0, Math.ceil((CLASE.getTime() - Date.now()) / 86400000));

  async function guarda() {
    const base = nube();
    if (!base) return;
    const limpio = borrador
      .map((d) => ({ ...d, etiqueta: d.etiqueta.trim(), titulo: d.titulo.trim(), porque: d.porque.trim() }))
      .filter((d) => d.titulo);
    try {
      await setDoc(doc(base, "metricas-plan", "masterclass"), { decisiones: limpio, cambiado: serverTimestamp() });
      setPlan(limpio.length ? limpio : POR_DEFECTO);
      setEditando(false);
      setFallo("");
    } catch (e) {
      setFallo("No se ha podido guardar: " + String(e).slice(0, 120));
    }
  }

  const caja =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);padding:clamp(18px,2.4vw,var(--pad-card));";
  const cifra = (q: string, v: string, pie: string, oscura = false) => (
    <div
      style={css(
        caja +
          "display:grid;gap:6px;align-content:start;" +
          (oscura ? "background:var(--bloque);color:var(--sobre-bloque);border-color:var(--bloque-borde);" : ""),
      )}
    >
      <span style={css(NOTA + (oscura ? "color:var(--sobre-bloque-2);" : "color:var(--text-3);"))}>{q}</span>
      <span
        style={css(
          "font-family:var(--font-display);font-size:clamp(26px,3vw,42px);font-weight:650;line-height:1;white-space:nowrap;" +
            "font-variant-numeric:tabular-nums;letter-spacing:-.04em;color:inherit;",
        )}
      >
        {v}
      </span>
      <span style={css(NOTA + (oscura ? "color:var(--sobre-bloque-2);" : "color:var(--text-3);"))}>{pie}</span>
    </div>
  );

  const enlaces: Array<[string, string, boolean]> = [
    ["Landing", `${WEB}/masterclass`, true],
    ["Presentación", `${WEB}/masterclass/clase`, true],
    ["Correos", "/correos", false],
    ["Ads Manager", "https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=289692277", true],
  ];

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
      {/* --------------------------------------------------------- cabecera */}
      <section
        style={css(
          caja +
            "background:var(--bloque);color:var(--sobre-bloque);border-color:var(--bloque-borde);box-shadow:var(--shadow-lg);" +
            "display:grid;gap:14px;",
        )}
      >
        <span style={css(NOTA + "color:var(--sobre-bloque-2);")}>
          Masterclass · jueves 26 nov · 21:00{n.ultimo ? ` · datos de Meta hasta el ${n.ultimo.slice(8)}/${n.ultimo.slice(5, 7)}` : ""}
        </span>
        <h2 style={css("margin:0;font-family:var(--font-display);font-size:clamp(30px,3.6vw,46px);font-weight:650;letter-spacing:-.03em;line-height:1.1;color:inherit;")}>
          Desórdenes Amorosos
        </h2>
        <p style={css("margin:0;font-size:var(--t-body);line-height:1.5;color:var(--sobre-bloque-2);")}>
          Quedan <b style={css("color:var(--sobre-bloque);")}>{quedan} días</b>.
        </p>
        <div style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
          {enlaces.map(([q, href, fuera]) => (
            <a
              key={q}
              href={href}
              {...(fuera ? { target: "_blank", rel: "noreferrer" } : {})}
              style={css(
                "padding:9px 16px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:500;text-decoration:none;" +
                  "border:1px solid var(--bloque-borde);color:var(--sobre-bloque);background:color-mix(in srgb, var(--sobre-bloque) 8%, transparent);",
              )}
            >
              {q}
            </a>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- cifras */}
      <div style={css("display:grid;gap:var(--gap);grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));")}>
        {cifra("Invertido en Meta", euros(n.gasto), "desde el 20 oct, todas las campañas")}
        {cifra("Visitas a la landing", miles(n.visitas), n.visitas ? `a ${euros(n.gasto / n.visitas)} cada una` : "todavía ninguna")}
        {cifra("Inscritas", miles(n.inscritas), "se apuntaron en el formulario")}
        {cifra(
          "Coste por inscrita",
          n.inscritas ? euros(n.gasto / n.inscritas, 0) : "—",
          n.inscritas ? "lo que hay que bajar" : "nadie se ha apuntado aún",
          true,
        )}
      </div>

      {/* ----------------------------------------------------- qué hacemos */}
      <section style={css(caja + "display:grid;gap:16px;")}>
        <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;")}>
          <h2 style={css("margin:0;font-family:var(--font-display);font-size:var(--t-head);font-weight:620;letter-spacing:-.02em;color:var(--text);")}>
            Qué hacemos a partir de ahora
          </h2>
          {!editando && (
            <button type="button" style={css(BOTON_NORMAL)} onClick={() => { setBorrador(plan.map((d) => ({ ...d }))); setEditando(true); }}>
              Editar
            </button>
          )}
        </div>
        {fallo && <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>{fallo}</p>}

        {!editando && (
          <div style={css("display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));")}>
            {plan.map((d, i) => (
              <article
                key={i}
                style={css(
                  "display:grid;gap:8px;align-content:start;padding:18px;border-radius:var(--r-sm);" +
                    "border:1px solid " + (d.tono === "urgente" ? COLOR.urgente : "var(--border)") + ";",
                )}
              >
                <span
                  style={css(
                    "justify-self:start;padding:3px 10px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:500;" +
                      `color:${COLOR[d.tono] || COLOR.siguiente};border:1px solid ${COLOR[d.tono] || COLOR.siguiente};`,
                  )}
                >
                  {d.etiqueta}
                </span>
                <h3 style={css("margin:0;font-size:var(--t-body);font-weight:600;color:var(--text);line-height:1.3;")}>{d.titulo}</h3>
                <p style={css("margin:0;font-size:var(--t-body);line-height:1.5;color:var(--text-2);")}>{d.porque}</p>
              </article>
            ))}
          </div>
        )}

        {editando && (
          <div style={css("display:grid;gap:12px;")}>
            {borrador.map((d, i) => {
              const cambia = (k: keyof Decision, v: string) =>
                setBorrador(borrador.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
              return (
                <div key={i} style={css("display:grid;gap:8px;padding:14px;border-radius:var(--r-sm);background:color-mix(in srgb, var(--text) 4%, transparent);")}>
                  <div style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
                    <input value={d.etiqueta} placeholder="Cuándo (p. ej. Hecho · 10 nov)" onChange={(e) => cambia("etiqueta", e.target.value)} style={css(CAMPO + "flex:1;min-width:160px;")} />
                    <select value={d.tono} onChange={(e) => cambia("tono", e.target.value)} style={css(CAMPO + "width:auto;")}>
                      <option value="hecho">Hecho</option>
                      <option value="en-marcha">En marcha</option>
                      <option value="siguiente">Siguiente</option>
                      <option value="urgente">Urgente</option>
                    </select>
                    <button type="button" style={css(BOTON_NORMAL)} onClick={() => setBorrador(borrador.filter((_, j) => j !== i))}>
                      Quitar
                    </button>
                  </div>
                  <input value={d.titulo} placeholder="Qué hacemos" onChange={(e) => cambia("titulo", e.target.value)} style={css(CAMPO)} />
                  <textarea value={d.porque} rows={2} placeholder="Por qué, en una frase" onChange={(e) => cambia("porque", e.target.value)} style={css(CAMPO + "resize:vertical;")} />
                </div>
              );
            })}
            <div style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
              <button type="button" style={css(BOTON_NORMAL)} onClick={() => setBorrador([...borrador, { etiqueta: "", tono: "siguiente", titulo: "", porque: "" }])}>
                Añadir decisión
              </button>
              <button type="button" style={css(botonPrincipal(true))} onClick={() => void guarda()}>
                Guardar
              </button>
              <button type="button" style={css(BOTON_NORMAL)} onClick={() => setEditando(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
