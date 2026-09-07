"use client";

/**
 * LAS PIEZAS QUE COMPARTEN LAS TRES PANTALLAS DEL DESPACHO
 *
 * La cabecera, el aviso de que esto vive en un navegador y la pastilla de
 * estado salen igual en la agenda, en los clientes y en las facturas. Están
 * escritas una vez para que las tres se abran de la misma manera: si cada
 * pantalla se escribe su propio título, en un mes hay tres tamaños de título.
 *
 * Todo sale del vocabulario de `lib/ui.ts`. Aquí no se decide ningún color ni
 * ningún cuerpo de letra nuevo.
 */

import { useEffect, useRef } from "react";
import { css } from "@/lib/css";
import { CABECERA, APOYO, NOTA, PAD, tarjetaCon, rotulo } from "@/lib/ui";

/**
 * En pantalla ancha la lista y la ficha están una al lado de la otra, así que
 * al elegir a alguien se ve el cambio. Apiladas —en un móvil— la ficha aparece
 * DEBAJO de la lista y fuera de la pantalla: se toca un nombre y no pasa nada
 * visible. Esto lleva la vista hasta ella.
 *
 * El corte son los mismos 900 px a los que `[data-dos]` se queda en una columna,
 * en `globals.css`. Y sólo baja cuando hay algo abierto: si no, movería la
 * página sola nada más entrar.
 */
export function useLlevaAlDetalle(abierto: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    // Un fotograma de margen: el detalle se acaba de pintar y sin él se mide
    // contra la maqueta anterior.
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => window.clearTimeout(t);
  }, [abierto]);
  return ref;
}

/** El título de la pantalla y la línea que dice para qué sirve. */
export function Cabecera({ titulo, pie }: { titulo: string; pie: string }) {
  return (
    <div style={css("margin-bottom:var(--gap-lg);")}>
      <h1 style={css(CABECERA + "margin:0;")}>{titulo}</h1>
      <p style={css(APOYO + "margin:6px 0 0;max-width:64ch;")}>{pie}</p>
    </div>
  );
}

/**
 * DÓNDE VIVE ESTO, DICHO EN LA PANTALLA.
 *
 * Es la misma voz que ya usa la consulta debajo de los estudios guardados
 * («Los estudios viven sólo en este navegador…»), a propósito: si cada
 * pantalla lo cuenta con otras palabras, deja de leerse como una condición de
 * la plataforma y empieza a leerse como un fallo de esa pantalla.
 *
 * En `tono="aviso"` va en una tarjeta con la raya roja al canto, para lo que no
 * se puede perder — las facturas. El color marca; no rellena.
 */
export function AvisoNavegador({ que, tono = "nota" }: { que: string; tono?: "nota" | "aviso" }) {
  const texto = `${que} viven sólo en este navegador. Todavía no hay servidor: si se borran los datos del navegador o cambias de ordenador, se pierden.`;

  if (tono === "nota") {
    return <p style={css(NOTA + "line-height:1.5;margin:var(--gap) 0 0;")}>{texto}</p>;
  }

  return (
    <div style={css(tarjetaCon("var(--red)") + PAD)}>
      <div style={css(rotulo("var(--red)") + "margin-bottom:var(--s2);")}>Guarda esto en otro sitio</div>
      <p style={css(APOYO + "margin:0;")}>
        {texto} Hasta que lo haya, apunta en papel lo que no puedas perder.
      </p>
    </div>
  );
}

/** Una pastilla que dice en qué estado está algo. Gris siempre; del color sólo
 *  la letra, como los chips del resto de la plataforma. */
export function Estado({ texto, color = "var(--text-3)" }: { texto: string; color?: string }) {
  return (
    <span
      style={css(
        "display:inline-flex;align-items:center;flex:none;background:color-mix(in srgb, var(--text) 5%, transparent);" +
          "border-radius:999px;padding:4px 10px;font-size:var(--t-micro);font-weight:590;white-space:nowrap;color:" +
          color +
          ";"
      )}
    >
      {texto}
    </span>
  );
}

/**
 * Lo que se dice cuando no hay nada. Nunca «sin datos»: siempre qué hacer a
 * continuación, que es lo único que le sirve a quien está mirando un hueco.
 */
export function Vacio({ children }: { children: React.ReactNode }) {
  return <p style={css(APOYO + "margin:0;max-width:48ch;")}>{children}</p>;
}
