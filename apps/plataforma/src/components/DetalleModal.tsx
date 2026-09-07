"use client";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { KDATA } from "@/lib/kdata";
import { chipsDeFicha } from "@/lib/chips";
// Se renombran porque aquí ya hay variables locales llamadas titulo y frase.
import { frase as enFrase, titulo as enTitulo } from "@/lib/format";

type Detalle = NonNullable<ReturnType<typeof useApp>["detalle"]>;

/**
 * LA FICHA.
 *
 * Es lo que más se abre de toda la plataforma: el diccionario de la
 * herramienta, veinte veces por consulta. Y hasta ahora atrapaba.
 *
 * Escape no la cerraba —la tecla que prueba todo el mundo sin pensar—, y
 * mientras estaba abierta el velo se comía las pulsaciones, así que el lateral
 * y las pestañas dejaban de responder: la única salida era una × de 30 px en
 * una esquina, justo donde el pulgar no llega en una tableta. Curiosamente el
 * menú de la cuenta, que importa mucho menos, sí escuchaba Escape.
 *
 * Y se iba de golpe: entraba con un fundido suave y desaparecía como si se
 * apagara la luz, porque un `return null` no puede animar su salida. Por eso el
 * componente está partido en dos — la envoltura vive siempre y `AnimatePresence`
 * ve marcharse a la hoja.
 */
export default function DetalleModal() {
  const { detalle, cerrarDetalle } = useApp();

  useEffect(() => {
    if (!detalle) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarDetalle();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [detalle, cerrarDetalle]);

  return <AnimatePresence>{detalle && <Hoja detalle={detalle} />}</AnimatePresence>;
}

function Hoja({ detalle }: { detalle: Detalle }) {
  const { cerrarDetalle, verNumero } = useApp();
  const quieto = useReducedMotion();

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
    <motion.div
      data-chrome="1"
      onClick={cerrarDetalle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        /* El velo era negro al 32 %, que sobre una plataforma blanca cae como
           un telón de teatro: apaga la pantalla entera para enseñar una ficha.
           Ahora es un velo cálido y flojo con más desenfoque: lo de detrás se
           reconoce pero queda claramente fuera de foco, que es lo que hace que
           una hoja se lea como una hoja encima y no como otra pantalla. */
        "position:fixed;inset:0;z-index:60;background:rgba(74,58,48,.22);backdrop-filter:saturate(1.2) blur(14px);-webkit-backdrop-filter:saturate(1.2) blur(14px);display:flex;align-items:flex-start;justify-content:center;padding:clamp(20px,5vw,48px) clamp(12px,3vw,24px);overflow-y:auto;"
      )}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        initial={quieto ? false : { opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={quieto ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={css(
          "max-width:760px;width:100%;background:var(--surface-solid);box-shadow:var(--shadow-lg);border:1px solid var(--border-accent);border-radius:var(--r);padding:clamp(22px,3.4vw,34px) clamp(20px,3.6vw,38px) clamp(26px,4vw,40px);position:relative;"
        )}
      >
        {/* De 30 a 44 px. Es la medida a partir de la cual un dedo acierta sin
            mirar, y ésta es la salida que más se usa de toda la plataforma. */}
        <button
          onClick={cerrarDetalle}
          aria-label="Cerrar la ficha"
          style={css("position:absolute;top:12px;right:12px;display:grid;place-items:center;background:none;border:1px solid var(--border-accent);color:var(--gold);border-radius:980px;width:44px;height:44px;cursor:pointer;font-size:var(--t-title);line-height:1;")}
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
      </motion.div>
    </motion.div>
  );
}
