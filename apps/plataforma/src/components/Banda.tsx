"use client";
import type { ReactNode } from "react";
import { css } from "@/lib/css";

/**
 * LA CABECERA CON FOTO de las pantallas grandes: Personas, Cursos.
 *
 * Gerson: «eso arriba de personas, su diseño está feo; quiero una imagen,
 * algo más lindo; lo mismo en cursos». Un título suelto sobre el fondo no
 * dice dónde se está; una foto de la casa con el nombre encima sí, y da a
 * cada pantalla su cara.
 *
 * Las cifras van a la derecha y son las que se le pasan: esta pieza no se
 * inventa ninguna.
 */
export default function Banda({
  foto,
  titulo,
  sub,
  cifras = [],
  accion,
  encuadre = "50% 50%",
  fotoALaDerecha = false,
}: {
  foto: string;
  titulo: string;
  sub?: string;
  cifras?: Array<{ n: string | number; que: string }>;
  accion?: ReactNode;
  encuadre?: string;
  /** La foto lleva a alguien a la derecha (sin cifras encima): el velo sólo
   *  oscurece el lado del título y la deja verse. */
  fotoALaDerecha?: boolean;
}) {
  return (
    <header
      style={css(
        "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);min-height:200px;margin-bottom:var(--gap);" +
          "display:flex;align-items:flex-end;background:var(--bloque);box-shadow:var(--nm-alto);"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={foto} alt="" style={css(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${encuadre};`)} />
      {/* El velo vuelve a oscurecer a la derecha, que es donde van las cifras:
          acababa en .25 y los rótulos dorados quedaban a 3,2:1 encima de la
          foto de los cristales. */}
      <span
        aria-hidden="true"
        style={css(
          "position:absolute;inset:0;background:" +
            (fotoALaDerecha
              ? "linear-gradient(90deg,rgba(34,29,31,.9) 0%,rgba(34,29,31,.7) 32%,rgba(34,29,31,.1) 62%,rgba(34,29,31,0) 100%);"
              : "linear-gradient(90deg,rgba(34,29,31,.88) 0%,rgba(34,29,31,.6) 50%,rgba(34,29,31,.72) 100%);")
        )}
      />
      <div
        style={css(
          "position:relative;width:100%;padding:var(--pad-card);display:flex;align-items:flex-end;justify-content:space-between;gap:var(--gap-lg);flex-wrap:wrap;"
        )}
      >
        <div style={css("min-width:0;display:flex;flex-direction:column;gap:8px;")}>
          <h1 style={css("margin:0;font-weight:300;font-size:clamp(34px,4.2vw,54px);letter-spacing:-.035em;line-height:1;color:var(--sobre-bloque);")}>{titulo}</h1>
          {sub && <p style={css("margin:0;font-size:var(--t-body);color:var(--sobre-bloque-2);max-width:52ch;")}>{sub}</p>}
          {accion && <div style={css("margin-top:8px;")}>{accion}</div>}
        </div>
        {/* Con la persona a la derecha, las cifras irían encima de ella. */}
        {cifras.length > 0 && !fotoALaDerecha && (
          <dl style={css("margin:0;display:flex;gap:clamp(18px,3vw,40px);")}>
            {cifras.map((c) => (
              <div key={c.que} style={css("display:flex;flex-direction:column;gap:4px;")}>
                <dd style={css("margin:0;font-weight:300;font-size:clamp(32px,3.6vw,48px);letter-spacing:-.04em;line-height:1;color:var(--sobre-bloque);font-variant-numeric:tabular-nums;")}>
                  {c.n}
                </dd>
                <dt style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>{c.que}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
