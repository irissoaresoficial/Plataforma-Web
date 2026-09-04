"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipsDeFicha } from "@/lib/chips";
import { chipStyle, recorta } from "@/lib/format";
import { tarjetaCon, PAD_SM } from "@/lib/ui";
import TablaAlma from "./TablaAlma";

export default function SeccionAlma() {
  const { r, verNumero, verTexto } = useApp();
  if (!r) return null;
  // El dibujo de la tabla — orden del manual (5.1 TABLA IMAGEN DEL ALMA), con
  // la notación a mano de la ficha — vive entero en <TablaAlma />.
  const ia = r.imagenAlma;

  const bloqueos = r.bloqueos.map((b) => ({
    b,
    extracto: recorta(b.plano?.texto || "", 440),
    chips: [{ label: "Número " + b.numero, style: chipStyle("var(--gold)"), onClick: () => verNumero(b.numero) }]
      .concat(chipsDeFicha(b.ficha, verNumero))
      .concat([{ label: "Plano completo", style: chipStyle("var(--text-3)"), onClick: () => verTexto("Bloqueo " + b.casilla, b.plano?.nombre || "", "Plano de consciencia " + b.casilla, b.plano?.texto || "") }]),
  }));

  return (
    <div data-dos="">
      <div data-anclado="" style={css("position:sticky;top:78px;align-self:start;max-height:calc(100vh - 96px);overflow-y:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;margin-bottom:var(--s4);")}>
          <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Imagen del alma</span>
          <span style={css("font-family:var(--font-display);font-size:var(--t-head);font-weight:500;color:var(--gold);line-height:1;")}>{ia.numero}</span>
        </div>

        <TablaAlma ia={ia} />

        {/* El resumen que va escrito al pie de la ficha, a mano. */}
        <div style={css("display:flex;flex-direction:column;gap:var(--s2);margin-top:var(--s5);padding-top:var(--s4);border-top:1px solid var(--border);")}>
          {[
            { l: "Planos bloqueados", v: Object.keys(ia.bloqueos).map(Number).sort((a, b) => a - b), c: "#2C5D9E" },
            { l: "Ayudas espirituales", v: Object.keys(ia.ayudas).map(Number).sort((a, b) => a - b), c: "#C0392B" },
            { l: "Punto verde", v: ia.proyeccion ? [ia.proyeccion] : [], c: "#4C9A5A" },
          ].map((x) => (
            <div key={x.l} style={css("display:flex;align-items:baseline;gap:var(--s3);font-size:var(--t-body);")}>
              <span style={css("color:var(--text-3);min-width:130px;")}>{x.l}</span>
              <span style={css("font-weight:600;color:" + x.c + ";")}>{x.v.length ? x.v.map((n) => (n === 10 ? "0" : n)).join(" · ") : "ninguno"}</span>
            </div>
          ))}
          {ia.proyeccion && (
            <p style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-4);margin:var(--s2) 0 0;")}>
              El 0 cae en la casilla {ia.proyeccion}: eso es lo que proyectas de cara a los demás.
            </p>
          )}
        </div>
      </div>
      <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
        {bloqueos.map(({ b, extracto, chips }, i) => (
          <article
            key={i}
            style={css(
              tarjetaCon("var(--purple)") + PAD_SM + "opacity:0;animation:es33-rise .55s cubic-bezier(.22,1,.36,1) forwards;animation-delay:" +
                (0.18 + i * 0.13).toFixed(2) +
                "s;"
            )}
          >
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
              <span style={css("font-weight:590;font-size:var(--t-mini);color:var(--purple);")}>
                Bloqueo {b.casilla}
                {b.veces > 1 ? " · ×" + b.veces : ""}
              </span>
              <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text);")}>{b.plano?.nombre || ""}</span>
              <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>se forma con el número {b.numero}</span>
            </div>
            <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.6;color:var(--text-2);margin:12px 0 0;text-wrap:pretty;")}>{extracto}</p>
            <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s4);")}>
              {chips.map((cc, ci) => (
                <button key={ci} onClick={cc.onClick} style={css(cc.style)}>
                  {cc.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
