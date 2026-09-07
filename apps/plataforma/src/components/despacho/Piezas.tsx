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

import { useEffect, useRef, useState } from "react";
import { css } from "@/lib/css";
import { CABECERA, APOYO, NOTA, PAD, tarjetaCon, rotulo } from "@/lib/ui";
import { guardadoEnLaNube } from "@/lib/despacho";

/**
 * ¿ESTAMOS EN UNA PANTALLA ESTRECHA?
 *
 * Hay dos maquetas que no se pueden resolver con CSS: el tablero de clientes
 * —que en ancho son cinco columnas y en estrecho una sola con sus pestañas— y
 * la rejilla de la semana —que en estrecho pasa a ser un día—. En los dos casos
 * lo que cambia no es cómo se coloca lo mismo, sino QUÉ se pinta, y eso lo
 * decide React.
 *
 * Arranca siempre en `false` y no en lo que mida la ventana, a propósito: estas
 * páginas se generan en el servidor, donde no hay ventana. Si el primer render
 * dependiera del ancho, el HTML del servidor y el del navegador no coincidirían
 * y React tiraría el árbol entero. Se mide después de montar.
 */
export function useEstrecho(px = 860): boolean {
  const [estrecho, setEstrecho] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px}px)`);
    const mide = () => setEstrecho(mq.matches);
    mide();
    mq.addEventListener("change", mide);
    return () => mq.removeEventListener("change", mide);
  }, [px]);
  return estrecho;
}

/**
 * LA CARA DE ALGUIEN, CUANDO NO HAY FOTO.
 *
 * El tablero pide una tira de caras arriba y una cara en cada tarjeta, y aquí
 * no hay ninguna foto: la ficha de una persona guarda su nombre, su correo y su
 * teléfono, y pedirle a Iris que suba doscientas fotos no va a pasar. Así que
 * la cara es la inicial, que es lo que de verdad sirve para reconocer un nombre
 * de un vistazo en una columna.
 *
 * Un círculo por persona y todos del mismo color: teñir cada inicial de un
 * color sacado del nombre —lo que hace medio internet— llenaría la pantalla de
 * quince colores que no significan nada, justo lo que la casa no hace.
 */
export function Avatar({ nombre, tamano = 34 }: { nombre: string; tamano?: number }) {
  // Dos iniciales cuando hay apellido; una cuando no. Tres ya no se leen a 34
  // píxeles y convierten el círculo en una mancha.
  const iniciales = (nombre || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toLocaleUpperCase("es"))
    .join("");

  return (
    <span
      aria-hidden="true"
      style={css(
        "display:inline-grid;place-items:center;flex:none;border-radius:50%;" +
          `width:${tamano}px;height:${tamano}px;` +
          /* El hueco de la casa: la inicial va hundida en el papel, como los
             campos. Es lo que la separa de una pegatina de color. */
          "background:var(--surface-2);border:1px solid var(--border);box-shadow:var(--nm-hondo);" +
          `color:var(--text-3);font-size:${Math.round(tamano * 0.38)}px;font-weight:600;letter-spacing:0;`
      )}
    >
      {iniciales || "?"}
    </span>
  );
}

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
  /*
   * CON NUBE, ESTE AVISO NO SE ENSEÑA. NO SE SUAVIZA: DESAPARECE.
   *
   * Decía «viven sólo en este navegador… si cambias de ordenador se pierden», y
   * desde que el despacho guarda en Firestore eso es sencillamente falso. Un
   * cartel de alarma que miente hace un daño concreto y difícil de deshacer:
   * enseña a no leer los carteles. El día que haya uno de verdad —y lo habrá—
   * ya nadie lo mirará.
   *
   * Se decide con el mismo dato que decide dónde se guarda, no a mano. Un aviso
   * que hay que acordarse de quitar es un aviso que acabará mintiendo en una de
   * las dos direcciones.
   */
  if (guardadoEnLaNube) return null;

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
