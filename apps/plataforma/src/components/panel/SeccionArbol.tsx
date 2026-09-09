"use client";
import { useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { arbolGeometria, arcosDe } from "@/lib/arbol";
import { COL, COL_TX } from "@/lib/tree";
import { KDATA } from "@/lib/kdata";
import { frase, titulo } from "@/lib/format";
import Particulas from "../Particulas";
import Parrafo from "./Parrafo";
import { tarjetaCon, PAD_SM, NOTA } from "@/lib/ui";
import Lienzo from "../Lienzo";
import ArbolVida from "../ArbolVida";
import FichaGrafico, { type Contenido } from "./FichaGrafico";

const ETAPA = { origen: "camino de origen", transformacion: "camino de transformación", destino: "camino de destino" } as const;

export default function SeccionArbol() {
  const { r, verArcano } = useApp();
  /* Qué sendero se está mirando. Los 22 senderos del árbol son los 22 arcanos,
     así que esto es, literalmente, «qué carta está abierta». */
  const [sendero, setSendero] = useState<number | null>(null);
  if (!r) return null;
  // Sólo para la leyenda: el dibujo lo arma <ArbolVida /> por su cuenta.
  const { rotulosComp } = arbolGeometria(r);

  const camDef = [
    { k: "origen" as const, etapa: "Origen", c: r.caminos.origen, rango: "0 – " + r.caminos.edadCambio + " años" },
    { k: "transformacion" as const, etapa: "Transformación", c: r.caminos.transformacion, rango: "toda la vida" },
    { k: "destino" as const, etapa: "Destino", c: r.caminos.destino, rango: "desde los " + (r.turbulencias ? r.turbulencias.hasta : r.caminos.edadCambio) + " años" },
  ];

  const caminos = camDef.map((d) => {
    const carta = d.c.carta || ({} as NonNullable<typeof d.c.carta>);
    /* Entero. Se cortaba a 420 caracteres de unos textos que llegan a 4.815:
       se veía el 9 % de la carta. Ahora corta el componente —a 1.000— y el
       botón de siempre sigue abriendo la ficha completa del arcano, que
       además del texto trae el lema y el dibujo. */
    return { ...d, nombre: titulo(carta.nombre), lema: frase(carta.lema), texto: (carta.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "") };
  });

  /* Qué caminos de esta persona pasan por cada sendero. Es lo que permite que
     la ficha de un arcano diga «y además éste es tu camino de destino» en vez
     de soltar la carta a secas, igual para todo el mundo. */
  const arcos = arcosDe(r);

  const fichaDe = (n: number): Contenido => {
    const c = KDATA.arcanos[String(n)] || ({} as (typeof KDATA.arcanos)[string]);
    const roles = arcos[n] || [];
    const bloques: Contenido["bloques"] = [];
    if (roles.length) {
      bloques.push({
        label: "En esta carta",
        tono: "oro",
        texto: "Este sendero lleva tu " + roles.map((x) => ETAPA[x]).join(" y tu ") + ".",
      });
    }
    if (c.pareja) bloques.push({ label: "Este camino en pareja", texto: c.pareja });
    return {
      k: "arcano" + n,
      etiqueta: roles.length ? "Sendero del árbol · uno de los tuyos" : "Sendero del árbol",
      titulo: titulo(c.nombre) || "Arcano " + n,
      apunte: "Arcano " + n,
      valor: n,
      lema: frase(c.lema),
      cuerpo: (c.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, ""),
      bloques,
      color: roles.length ? COL[roles[0]] : undefined,
    };
  };

  return (
    <div data-dos="ancho">
      <Lienzo anclado>
        <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:var(--s2);")}>
          <span style={css("font-size:var(--t-read);font-weight:600;letter-spacing:-.022em;color:var(--text);")}>Árbol de la Vida</span>
        </div>
        <div style={css("position:relative;")}>
          <Particulas cantidad={20} />
          <ArbolVida
            r={r}
            estilo="position:relative;width:100%;height:auto;display:block;"
            alElegirSendero={setSendero}
          />
        </div>
        <p style={css(NOTA + "margin:var(--s3) 0 0;")}>
          Toca cualquier sendero: los veintidós son los veintidós arcanos, y se abre el suyo.
        </p>

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
              <span style={css("font-size:var(--t-mini);font-weight:590;color:" + COL_TX[c.k] + ";")}>{c.etapa}</span>
              <span style={css("font-family:var(--font-display);font-weight:500;font-size:var(--t-head);line-height:1.25;color:var(--text);letter-spacing:-.022em;")}>
                {c.c.arcano} · {c.nombre}
              </span>
              <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-4);")}>{c.rango}</span>
            </div>
            <div style={css("font-size:var(--t-read);color:var(--gold);margin-top:var(--s2);line-height:1.4;")}>{c.lema}</div>
            <Parrafo
              texto={c.texto}
              estilo="font-size:var(--t-read);line-height:1.62;margin:var(--s3) 0 0;"
              etiqueta={"Arcano " + c.c.arcano}
              titulo={c.nombre}
              sub={c.etapa}
              alPulsar={() => verArcano(c.c.arcano)}
            />
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

      {/* La misma hoja de cristal que usa la rejilla de base 22. Los dos
          gráficos de la plataforma se explican igual y se recorren igual: aquí
          las flechas pasan de un arcano al siguiente sin cerrar. */}
      <FichaGrafico
        contenido={sendero === null ? null : fichaDe(sendero)}
        alCerrar={() => setSendero(null)}
        alAnterior={() => setSendero((n) => ((n ?? 0) + 21) % 22)}
        alSiguiente={() => setSendero((n) => ((n ?? 0) + 1) % 22)}
        posicion={sendero === null ? undefined : { i: sendero + 1, total: 22 }}
      />
    </div>
  );
}
