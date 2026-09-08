"use client";

/**
 * ============================================================================
 * UN PÁRRAFO DEL MANUAL. ENTERO, O CON LA PUERTA PARA LEERLO ENTERO.
 * ============================================================================
 *
 * QUÉ ESTABA PASANDO. El panel cortaba los textos de los manuales con puntos
 * suspensivos y, en la mayoría de los sitios, sin ninguna forma de seguir
 * leyendo. No era un detalle: de los diez diccionarios que se enseñan aquí,
 * SIETE estaban cortados en el 100 % de sus entradas. El texto del arcano 18
 * tiene 4.815 caracteres y se veían 420 — el 9 %. Las «Etapas de nueve años» y
 * las «Realizaciones» se cortaban todas, sin excepción.
 *
 * Y visto desde fuera eso no se lee como «hay más»: se lee como que el
 * programa se ha inventado media frase y la ha dejado a medias. Iris lo dijo
 * con esas palabras, y tenía razón en las dos cosas — se corta, y parece
 * inventado.
 *
 * LA REGLA, A PARTIR DE AQUÍ: el material de los manuales no se corta en
 * silencio nunca. O cabe entero, o hay un botón que lo abre entero. No hay una
 * tercera opción, y por eso esto es un componente y no una llamada suelta a
 * `recorta` repetida en catorce sitios: la próxima vez que alguien pinte un
 * texto del manual, lo hace con esta pieza y el problema no puede volver.
 *
 * POR QUÉ EL LÍMITE POR DEFECTO SON 1.000 CARACTERES. Es el número que hace que
 * NO SE CORTE NADA de lo que cabe razonablemente en una tarjeta. Medidos, los
 * textos más largos de cada diccionario son:
 *
 *     ciclos 676 · realizaciones 980 · desafíos 625 · año personal 903
 *     etapas de nueve años 935 · números 719 · hilo rojo 431 · sanador 311
 *     ejes en tensión 929 · planos en tensión 470
 *
 * Todos por debajo de 1.000: con este límite se ven ENTEROS, que es lo que se
 * pedía. Los que se siguen cortando son sólo tres, y son capítulos, no
 * párrafos — arcanos (hasta 4.815), tareas (2.810) y planos de consciencia
 * (2.682) —. Ésos meten un muro de texto en una tarjeta de tablero, así que se
 * cortan a propósito y con el botón bien visible al lado.
 */

import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipStyle, recorta } from "@/lib/format";

/** Lo que cabe entero de cualquier diccionario corto. Ver la nota de arriba. */
export const CABE_ENTERO = 1000;

export default function Parrafo({
  texto,
  limite = CABE_ENTERO,
  estilo = "",
  etiqueta,
  titulo,
  sub,
  alPulsar,
  textoBoton = "Texto completo",
}: {
  texto: string | undefined | null;
  /** Sólo se toca cuando la tarjeta es de verdad estrecha. Menos, nunca. */
  limite?: number;
  /** Lo que se le añade al párrafo: tamaño y color los pone quien lo usa. */
  estilo?: string;
  /* Los tres rótulos de la ficha que se abre. Son obligatorios a propósito:
     un texto completo que se abre sin decir de qué número es no sirve de nada
     en mitad de una consulta. */
  etiqueta: string;
  titulo: string;
  sub: string;
  /**
   * Para cuando ya existe una ficha mejor que la de sólo texto — la del
   * arcano, por ejemplo, que además del texto lleva el lema y la carta.
   *
   * Existe para que no salgan DOS botones diciendo casi lo mismo debajo del
   * mismo párrafo. Dos puertas al mismo sitio no son el doble de claras: son
   * la mitad, porque quien las ve se para a elegir.
   */
  alPulsar?: () => void;
  textoBoton?: string;
}) {
  const { verTexto } = useApp();
  const t = (texto || "").trim();
  if (!t) return null;

  const cortado = t.length > limite;

  return (
    <>
      <p
        style={css(
          "font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;" + estilo
        )}
      >
        {cortado ? recorta(t, limite) : t}
      </p>
      {/* Sólo cuando de verdad falta algo. Un botón de «texto completo» debajo
          de un texto que ya está completo enseña a no hacerle caso, y el día
          que aparezca encima del que sí está cortado tampoco se pulsará. */}
      {cortado && (
        <button
          onClick={alPulsar ?? (() => verTexto(etiqueta, titulo, sub, t))}
          style={css(chipStyle("var(--gold)") + "margin-top:var(--s3);")}
        >
          {textoBoton}
        </button>
      )}
    </>
  );
}
