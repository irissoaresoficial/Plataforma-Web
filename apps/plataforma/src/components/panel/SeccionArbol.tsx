"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { arbolGeometria } from "@/lib/arbol";
import { COL } from "@/lib/tree";
import { frase, recorta, titulo } from "@/lib/format";
import Particulas from "../Particulas";
import { tarjetaCon, PAD_SM, BOTON_PLANO } from "@/lib/ui";
import Lienzo from "../Lienzo";
import ArbolVida from "../ArbolVida";

export default function SeccionArbol() {
  const { r, verArcano } = useApp();
  if (!r) return null;
  // Sólo para la leyenda: el dibujo lo arma <ArbolVida /> por su cuenta.
  const { rotulosComp } = arbolGeometria(r);

  const camDef = [
    { k: "origen" as const, etapa: "Origen", c: r.caminos.origen, rango: "0 – " + r.caminos.edadCambio + " años" },
    { k: "transformacion" as const, etapa: "Transformación", c: r.caminos.transformacion, rango: "toda la vida" },
    { k: "destino" as const, etapa: "Destino", c: r.caminos.destino, rango: "desde los " + (r.turbulencias ? r.caminos.edadCambio + 10 : r.caminos.edadCambio) + " años" },
  ];

  const caminos = camDef.map((d) => {
    const carta = d.c.carta || ({} as NonNullable<typeof d.c.carta>);
    return { ...d, nombre: titulo(carta.nombre), lema: frase(carta.lema), extracto: recorta((carta.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, ""), 420) };
  });

  return (
    <div data-dos="ancho">
      <Lienzo anclado>
        <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:var(--s2);")}>
          <span style={css("font-size:var(--t-read);font-weight:600;letter-spacing:-.022em;color:var(--text);")}>Árbol de la Vida</span>
        </div>
        <div style={css("position:relative;")}>
          <Particulas cantidad={20} />
          <ArbolVida r={r} estilo="position:relative;width:100%;height:auto;display:block;" />
        </div>

        <div style={css("display:flex;flex-direction:column;gap:var(--s2);margin-top:var(--s4);border-top:1px solid var(--border);padding-top:var(--s4);")}>
          {camDef.map((d, i) => (
            <div key={i} style={css("display:flex;align-items:center;gap:var(--s3);font-size:var(--t-body);color:var(--text-3);")}>
              <span style={css("width:24px;height:3px;border-radius:2px;flex:none;background:" + COL[d.k] + ";")} />
              {d.etapa} · arcano {d.c.arcano}
            </div>
          ))}
          {rotulosComp.length > 0 && (
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);font-size:var(--t-body);color:var(--text-3);")}>
              <span style={css("width:24px;height:0;flex:none;margin-top:8px;border-top:3px dashed var(--text-4);")} />
              <span>Complementarios · {rotulosComp.map((c) => c.nombre).join(" · ")}</span>
            </div>
          )}
        </div>
      </Lienzo>

      <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
        {caminos.map((c, ci) => (
          <article
            key={ci}
            data-alza=""
            style={css(
              tarjetaCon(COL[c.k]) + PAD_SM
            )}
          >
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
              <span style={css("font-size:var(--t-mini);font-weight:590;color:" + COL[c.k] + ";")}>{c.etapa}</span>
              <span style={css("font-family:var(--font-display);font-weight:500;font-size:var(--t-head);line-height:1.25;color:var(--text);letter-spacing:-.022em;")}>
                {c.c.arcano} · {c.nombre}
              </span>
              <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-4);")}>{c.rango}</span>
            </div>
            <div style={css("font-size:var(--t-read);color:var(--gold);margin-top:var(--s2);line-height:1.4;")}>{c.lema}</div>
            <p style={css("font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:var(--s3) 0 0;text-wrap:pretty;")}>{c.extracto}</p>
            <button
              onClick={() => verArcano(c.c.arcano)}
              style={css(BOTON_PLANO + "margin-top:var(--s3);")}
            >
              Texto completo
            </button>
          </article>
        ))}

        {r.turbulencias && (
          <article style={css(tarjetaCon("var(--red)") + PAD_SM)}>
            <div style={css("font-weight:590;font-size:var(--t-body);color:var(--red);margin-bottom:var(--s3);")}>
              Años de turbulencias · {r.turbulencias.desde} – {r.turbulencias.hasta} años
            </div>
            {r.turbulencias.lista.map((t, i) => (
              <div key={i} style={css("margin-bottom:var(--s3);")}>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--red);margin-bottom:2px;")}>
                  Turbulencias en {t.tipo} · {t.causa}
                </div>
                <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-2);margin:0;text-wrap:pretty;")}>{t.texto}</p>
              </div>
            ))}
          </article>
        )}
      </div>
    </div>
  );
}
