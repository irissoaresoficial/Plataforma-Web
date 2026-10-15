"use client";

/**
 * ============================================================================
 * MÉTRICAS — EL CUADRO DE MANDO DE LA ESCUELA
 * ============================================================================
 *
 * Sólo lo ve Iris. Sirve para una cosa y hay que repetirla porque es fácil
 * perderla de vista: DECIDIR. Dónde anuncia, qué curso repite, qué lección
 * rehace. Todo número que no ayude a decidir ninguna de esas cosas sobra, por
 * interesante que sea.
 *
 * De ahí el orden de la pantalla, que no es casual:
 *
 *   1. CUATRO NÚMEROS GRANDES, lo que se mira de reojo cada mañana.
 *   2. CUÁNTA GENTE ENTRA, para ver si lo de la semana pasada funcionó.
 *   3. DE DÓNDE ENTRAN, que es lo que Gerson pidió por su nombre: saber el
 *      sitio. Decide en qué idioma se escribe y a qué hora se publica.
 *   4. DÓNDE SE CAE LA GENTE DENTRO DEL CURSO. El más incómodo y el más útil:
 *      señala la lección concreta que hay que rehacer.
 *
 * LO QUE NO HAY, y es tan importante como lo que hay:
 *
 *   · NADA DE «USUARIOS ACTIVOS MENSUALES» ni medidas de ésas. Suenan a
 *     empresa grande y no se puede hacer nada con ellas.
 *   · NI UN SOLO GRÁFICO DE QUESO. Comparar trozos de tarta es comparar
 *     ángulos, que es justo lo que el ojo hace peor. Barras.
 *   · NINGÚN GRÁFICO CON DOS EJES. Ver más abajo, en `Grafico.tsx`.
 *
 * LA LEY, Y ESTO NO ES OPCIONAL: la ubicación se guarda por país y ciudad,
 * NUNCA la dirección de internet entera, que en Europa es un dato personal. El
 * día que esto se conecte, eso se respeta y se escribe en la política de
 * privacidad antes de encender nada.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CABECERA, NOTA, TITULO } from "@/lib/ui";
import { Barras, Linea, type Punto } from "../escuela/Grafico";
import Muestra from "../escuela/Muestra";

/* Treinta días de ejemplo, con la forma que tiene esto de verdad: flojo entre
   semana, puntas cuando se publica algo. Una línea suave y bonita sería mentir
   sobre cómo se comporta el dato. */
const DIAS: Punto[] = [
  11, 9, 14, 12, 8, 6, 7, 13, 19, 16, 12, 10, 9, 22, 41, 33, 24, 18, 15, 13, 11, 17, 28, 25, 19, 16, 14, 12, 21, 26,
].map((valor, i) => ({ etiqueta: `${i + 1} oct`, valor }));

const SITIOS = [
  { etiqueta: "España", detalle: "Madrid, Barcelona, Valencia", valor: 184 },
  { etiqueta: "México", detalle: "Ciudad de México, Guadalajara", valor: 97 },
  { etiqueta: "Argentina", detalle: "Buenos Aires, Córdoba", valor: 61 },
  { etiqueta: "Colombia", detalle: "Bogotá, Medellín", valor: 44 },
  { etiqueta: "Portugal", detalle: "Lisboa, Oporto", valor: 23 },
];

const PUERTAS = [
  { etiqueta: "Instagram", valor: 212 },
  { etiqueta: "Búsqueda en Google", valor: 118 },
  { etiqueta: "Enlace directo", valor: 54 },
  { etiqueta: "Correo", valor: 25 },
];

const CAIDA = [
  { etiqueta: "1.1 · Lo que nadie cerró", valor: 100 },
  { etiqueta: "1.2 · Los tres hilos", valor: 86 },
  { etiqueta: "1.3 · La fecha que se repite", valor: 71 },
  { etiqueta: "2.1 · Leer la primera carta", valor: 38 },
  { etiqueta: "2.2 · Cuando no cuadra", valor: 31 },
];

export default function MetricasScreen() {
  const [tabla, setTabla] = useState(false);
  const quieto = useReducedMotion();

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
    "box-shadow:var(--nm);padding:var(--s4);";

  /**
   * Un número grande con su palabra y cómo va respecto al mes pasado.
   *
   * El cambio lleva su flecha ADEMÁS del color, y no sólo el color: una de
   * cada doce personas no distingue el rojo del verde, y un porcentaje que
   * sólo se entiende por su tono no se entiende.
   */
  const cifra = (que: string, valor: string, cambio: number, i: number, tono: string) => (
    <motion.div
      key={que}
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={css(tarjeta + "position:relative;overflow:hidden;")}
    >
      {/* Un filo de color arriba, no la tarjeta entera pintada. Cuatro tarjetas
          de cuatro colores saturados compiten entre ellas y ninguna gana; un
          filo las distingue y deja que el número siga siendo lo que se lee. */}
      <span
        aria-hidden
        style={css(`position:absolute;inset:0 0 auto;height:3px;background:var(--${tono}-tx);opacity:.55;`)}
      />
      <div style={css(NOTA)}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(28px,3.6vw,40px);font-weight:500;" +
            "line-height:1.05;margin-top:8px;color:var(--text);font-variant-numeric:tabular-nums;"
        )}
      >
        {valor}
      </div>
      <div style={css(NOTA + "margin-top:7px;display:flex;align-items:center;gap:5px;")}>
        <span aria-hidden>{cambio >= 0 ? "↑" : "↓"}</span>
        <span>
          {Math.abs(cambio)} % {cambio >= 0 ? "más" : "menos"} que el mes pasado
        </span>
      </div>
    </motion.div>
  );

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      {/* Debajo del título, PARA QUÉ SIRVE ESTE GRÁFICO. Un cuadro de mando sin
          esta línea obliga a deducir qué hacer con cada dibujo, y lo que se
          deduce cambia según el día que se tenga. */}
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:1060px;")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Métricas</h1>
        <span style={css(NOTA)}>últimos 30 días</span>
        {/* Los mismos datos en números, para quien use lector de pantalla y
            para cuando hay que copiar una cifra exacta a otro sitio. */}
        <button onClick={() => setTabla((x) => !x)} style={css(BOTON_NORMAL + "margin-left:auto;")}>
          {tabla ? "Ver los gráficos" : "Ver los números"}
        </button>
      </div>

      <Muestra falta="Al conectarla saldrán las visitas de verdad. La ubicación se guardará por país y ciudad, nunca la dirección de internet entera — lo exige la ley europea." />

      {tabla ? (
        <section style={css(tarjeta)}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Los números</h2>
          <div style={css("overflow-x:auto;")}>
            <table style={css("width:100%;border-collapse:collapse;font-size:var(--t-body);")}>
              <caption style={css(NOTA + "text-align:left;margin-bottom:10px;")}>
                De dónde entra la gente, y cuántos.
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={css("text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-3);font-weight:600;")}>
                    Sitio
                  </th>
                  <th scope="col" style={css("text-align:right;padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-3);font-weight:600;")}>
                    Personas
                  </th>
                </tr>
              </thead>
              <tbody>
                {SITIOS.map((s) => (
                  <tr key={s.etiqueta}>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);")}>
                      {s.etiqueta} <span style={css(NOTA)}>{s.detalle}</span>
                    </td>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);text-align:right;font-variant-numeric:tabular-nums;")}>
                      {s.valor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));")}>
            {cifra("Personas que entraron", "409", 18, 0, "cielo")}
            {cifra("Alumnos nuevos", "12", 33, 1, "rosa")}
            {cifra("Lecciones terminadas", "286", 9, 2, "melocoton")}
            {cifra("Terminan el curso", "31 %", -4, 3, "lima")}
          </div>

          {bloque(
            "Cuánta gente entra",
            "Para ver si lo que publicaste la semana pasada movió algo. Las puntas suelen ser el día siguiente a un reel.",
            <Linea datos={DIAS} />
          )}

          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(320px,1fr));")}>
            {bloque(
              "De dónde entran",
              "Decide en qué horario publicas y a qué país hablas. Si la mitad está en México, las ocho de la tarde de Madrid es la madrugada de alguien.",
              <Barras datos={SITIOS} />
            )}
            {bloque(
              "Por qué puerta llegaron",
              "Dónde merece la pena el esfuerzo. Si el correo trae veinticinco y te cuesta una tarde, ya lo sabes.",
              <Barras datos={PUERTAS} />
            )}
          </div>

          {bloque(
            "Dónde se cae la gente",
            "El dato más incómodo y el más útil: de cada cien que empiezan, cuántos llegan a cada lección. Una caída grande entre dos lecciones señala la que hay que rehacer.",
            <Barras datos={CAIDA} sufijo=" %" />
          )}
        </>
      )}
    </div>
  );
}
