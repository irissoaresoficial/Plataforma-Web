"use client";
import { css } from "@/lib/css";

/**
 * LA CARA DE ALGUIEN, O SU INICIAL.
 *
 * Un solo componente para la cabecera, el perfil, la comunidad y Gestión: si
 * cada pantalla dibujara su círculo, a los dos meses habría cuatro tamaños de
 * borde y tres colores de inicial para la misma persona.
 */
export default function Foto({
  foto,
  nombre,
  tam = 36,
  iris = false,
}: {
  foto?: string;
  nombre: string;
  tam?: number;
  /** Iris lleva el filo dorado: en la comunidad es la que saluda. */
  iris?: boolean;
}) {
  const borde = iris ? "box-shadow:0 0 0 2px var(--surface),0 0 0 3.5px var(--oro);" : "";
  if (foto) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={foto}
        alt=""
        width={tam}
        height={tam}
        style={css(`flex:none;width:${tam}px;height:${tam}px;border-radius:50%;object-fit:cover;${borde}`)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={css(
        `flex:none;display:grid;place-items:center;width:${tam}px;height:${tam}px;border-radius:50%;` +
          `font-weight:500;font-size:${Math.round(tam * 0.4)}px;` +
          (iris ? "background:var(--gold-soft);color:var(--gold-deep);" : "background:var(--rosa);color:var(--rosa-tx);") +
          borde
      )}
    >
      {(nombre.trim()[0] || "·").toUpperCase()}
    </span>
  );
}
