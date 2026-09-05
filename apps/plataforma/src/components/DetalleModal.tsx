"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { KDATA } from "@/lib/kdata";
import { chipsDeFicha } from "@/lib/chips";
// Se renombran porque aquí ya hay variables locales llamadas titulo y frase.
import { frase as enFrase, titulo as enTitulo } from "@/lib/format";

export default function DetalleModal() {
  const { detalle, cerrarDetalle, verNumero } = useApp();
  if (!detalle) return null;

  let tipo = "";
  let titulo = "";
  let subtitulo = "";
  let texto = "";
  let extras: Array<{ label: string; texto: string }> = [];
  let chips: ReturnType<typeof chipsDeFicha> = [];

  if (detalle.tipo === "numero") {
    const F = detalle.f;
    tipo = "Número " + F.n;
    titulo = F.titulo || "Número " + F.n;
    const refs: string[] = [];
    if (F.C) refs.push("cerradura " + F.C);
    if (F.R) refs.push("rango " + F.R);
    if (F.P) refs.push("primo " + F.P);
    subtitulo = "Tensión T" + F.T + " · Liberación L" + F.L + (refs.length ? " · " + refs.join(" · ") : "");
    texto = F.texto || "Este número se lee dividiéndolo de dos en dos.";
    if (F.atlante) extras.push({ label: "Significado atlante", texto: F.atlante });
    if (!F.enDiccionario && F.partes.length) F.partes.forEach((p) => extras.push({ label: "Lectura " + p.n + " · " + p.titulo, texto: p.texto }));
    chips = chipsDeFicha(F, verNumero);
  } else if (detalle.tipo === "arcano") {
    const c = KDATA.arcanos[String(detalle.a)] || ({} as (typeof KDATA.arcanos)[string]);
    tipo = "Arcano " + detalle.a;
    titulo = enTitulo(c.nombre);
    subtitulo = enFrase(c.lema);
    texto = (c.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "");
    extras = c.pareja ? [{ label: "Este camino en pareja", texto: c.pareja }] : [];
  } else {
    tipo = detalle.etiqueta || "";
    titulo = detalle.titulo || "";
    subtitulo = detalle.sub || "";
    texto = detalle.texto || "";
  }

  return (
    <div
      data-chrome="1"
      onClick={cerrarDetalle}
      style={css(
        "position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.32);backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:clamp(20px,5vw,48px) clamp(12px,3vw,24px);overflow-y:auto;animation:es33-in .25s ease both;"
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={css(
          "max-width:760px;width:100%;background:var(--surface-solid);box-shadow:var(--shadow-lg);border:1px solid var(--border-accent);border-radius:var(--r);padding:clamp(22px,3.4vw,34px) clamp(20px,3.6vw,38px) clamp(26px,4vw,40px);position:relative;"
        )}
      >
        <button
          onClick={cerrarDetalle}
          style={css("position:absolute;top:16px;right:16px;background:none;border:1px solid var(--border-accent);color:var(--gold);border-radius:980px;width:30px;height:30px;cursor:pointer;font-size:var(--t-body);line-height:1;")}
        >
          ×
        </button>
        <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s2);")}>{tipo}</div>
        <h2 style={css("font-family:var(--font-ui);font-weight:700;font-size:var(--t-head);color:var(--text);margin:0 0 6px;letter-spacing:-.022em;")}>{titulo}</h2>
        <div style={css("font-family:var(--font-ui);font-style:normal;font-size:var(--t-title);color:var(--gold);margin-bottom:var(--s5);")}>{subtitulo}</div>
        <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.68;color:var(--text-2);margin:0;text-wrap:pretty;white-space:pre-line;text-wrap:pretty;")}>{texto}</p>
        {extras.map((e, i) => (
          <div key={i} style={css("margin-top:18px;border-top:1px solid var(--border);padding-top:var(--s4);")}>
            <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--gold);margin-bottom:6px;")}>{e.label}</div>
            <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:0;text-wrap:pretty;")}>{e.texto}</p>
          </div>
        ))}
        {chips.length > 0 && (
          <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:20px;")}>
            {chips.map((c, i) => (
              <button key={i} onClick={c.onClick} style={css(c.style)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
