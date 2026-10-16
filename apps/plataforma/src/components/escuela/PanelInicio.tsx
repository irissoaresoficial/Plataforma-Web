"use client";

/**
 * ============================================================================
 * EL PANEL DE IRIS — LO PRIMERO QUE VE AL ENTRAR
 * ============================================================================
 *
 * Gerson: «el inicio vendría siendo como un panel; aquí quiero que se vea
 * absolutamente todo en temas de gráficas».
 *
 * POR QUÉ ESTO NO LO VE UN ALUMNO. La misma dirección —el Inicio— enseña dos
 * cosas distintas según quién entre, y no es un capricho: a Iris le sirve
 * saber cuánto entra y quién se cae; a un alumno, su racha y por dónde iba. Un
 * panel de negocio en la pantalla de quien ha pagado un curso es enseñarle las
 * tripas, y además no le dice qué hacer ahora.
 *
 * LO QUE UN PANEL TIENE QUE CONTESTAR, en este orden y no en otro:
 *
 *   1. ¿VA BIEN LA COSA? — cuatro números grandes, de un vistazo.
 *   2. ¿HA PASADO ALGO HOY? — lo que entró, lo que se vendió, quién escribió.
 *   3. ¿DÓNDE ESTÁ EL PROBLEMA? — dónde se cae la gente, qué curso no acaba
 *      nadie. Es lo que de verdad cambia una decisión.
 *
 * Un panel que sólo contesta la primera es un adorno bonito que se mira dos
 * semanas y se deja de mirar.
 *
 * LOS DATOS DE AHORA SON DE PRUEBA, Y LO DICE ARRIBA.
 * ---------------------------------------------------------------------------
 * Gerson los pidió así para poder ver la pantalla antes de que haya escuela
 * que medir. Pero un número inventado que alguien usa para decidir hace más
 * daño que una pantalla vacía, así que va con su cartel encima, bien visible,
 * y el cartel se cae solo en cuanto haya datos de verdad — no hay que acordarse
 * de quitarlo.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { CABECERA, NOTA } from "@/lib/ui";
import { Barras, Columnas, Linea, type Punto } from "./Grafico";

/* ------------------------------------------------------- datos de prueba */

/* Con la forma que tiene esto de verdad: flojo entre semana, puntas cuando se
   publica algo. Una curva suave y bonita mentiría sobre cómo se comporta. */
const ENTRADAS: Punto[] = [
  11, 9, 14, 12, 8, 6, 7, 13, 19, 16, 12, 10, 9, 22, 41, 33, 24, 18, 15, 13, 11, 17, 28, 25, 19, 16, 14, 12, 21, 26,
].map((valor, i) => ({ etiqueta: `${i + 1} oct`, valor }));

const INGRESOS = [
  { etiqueta: "may", valor: 0 },
  { etiqueta: "jun", valor: 794 },
  { etiqueta: "jul", valor: 1191 },
  { etiqueta: "ago", valor: 397 },
  { etiqueta: "sep", valor: 2382 },
  { etiqueta: "oct", valor: 1588 },
];

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

const PASANDO = [
  { quien: "Carmen Aledo", que: "terminó «Los tres hilos»", cuando: "hace 20 min", tono: "lima" },
  { quien: "Lucía Ferrer", que: "compró Desórdenes Amorosos", cuando: "hace 2 h", tono: "melocoton" },
  { quien: "Marta Ortiz", que: "escribió en la comunidad", cuando: "hace 4 h", tono: "rosa" },
  { quien: "Ana Belén Ruiz", que: "se dio de alta", cuando: "ayer", tono: "cielo" },
];

/* ------------------------------------------------------------- la pantalla */

export default function PanelInicio({ nombre }: { nombre: string }) {
  const quieto = useReducedMotion();

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
    "box-shadow:var(--nm);padding:var(--s4);";

  const cifra = (que: string, valor: string, cambio: number, i: number, tono: string) => (
    <motion.div
      key={que}
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={css(tarjeta + "position:relative;overflow:hidden;")}
    >
      <span
        aria-hidden
        style={css(`position:absolute;inset:0 0 auto;height:3px;background:var(--${tono}-tx);opacity:.55;`)}
      />
      <div style={css(NOTA)}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(26px,3.4vw,38px);font-weight:650;" +
            "line-height:1.05;margin-top:8px;color:var(--text);font-variant-numeric:tabular-nums;letter-spacing:-.03em;"
        )}
      >
        {valor}
      </div>
      {/* La flecha ADEMÁS del signo, no sólo el color: una de cada doce
          personas no distingue el rojo del verde, y un porcentaje que sólo se
          entiende por su tono no se entiende. */}
      <div style={css(NOTA + "margin-top:7px;display:flex;align-items:center;gap:5px;")}>
        <span aria-hidden>{cambio >= 0 ? "↑" : "↓"}</span>
        <span>
          {Math.abs(cambio)} % {cambio >= 0 ? "más" : "menos"} que el mes pasado
        </span>
      </div>
    </motion.div>
  );

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode, ancho = false) => (
    <section style={css(tarjeta + (ancho ? "grid-column:1/-1;" : ""))}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      {/* Debajo del título, PARA QUÉ SIRVE. Un panel sin esta línea obliga a
          deducir qué hacer con cada dibujo, y lo que se deduce cambia según el
          día que se tenga. */}
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s5);")}>
      <header>
        <h1
          style={css(
            "font-family:var(--font-display);font-size:var(--t-title);font-weight:650;" +
              "letter-spacing:-.026em;line-height:1.14;margin:0;color:var(--text);"
          )}
        >
          {nombre ? `Hola, ${nombre}` : "Tu escuela"}
        </h1>
        <p style={css(NOTA + "margin:9px 0 0;")}>Cómo va la escuela hoy</p>
      </header>

      {/* El cartel. Arriba del todo y no al pie: al pie se lee después de
          habérselos creído, que es tarde. */}
      <p
        role="note"
        style={css(
          "display:flex;gap:10px;align-items:flex-start;margin:0;padding:12px 15px;" +
            "border-radius:var(--r-sm);border:1px dashed var(--border-strong);" +
            "background:color-mix(in srgb, var(--text) 3%, transparent);" +
            NOTA +
            "line-height:1.55;"
        )}
      >
        <span aria-hidden style={css("flex:none;color:var(--gold-deep, var(--text-3));")}>◻</span>
        <span>
          <strong style={css("color:var(--text-2);")}>Todos los números de esta pantalla son inventados.</strong> Están
          para que veas cómo queda el panel antes de que haya escuela que medir. En cuanto entre gente de verdad, se
          cambian por los suyos y este aviso desaparece.
        </span>
      </p>

      {/* ----------------------------------------------- 1. ¿va bien la cosa? */}
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(180px,1fr));")}>
        {cifra("Alumnos", "37", 23, 0, "melocoton")}
        {cifra("Ingresos del mes", "1.588 €", 18, 1, "lima")}
        {cifra("Lecciones terminadas", "286", 9, 2, "cielo")}
        {cifra("Acaban el curso", "31 %", -4, 3, "rosa")}
      </div>

      {/* ----------------------------------------------- 2. ¿qué ha pasado? */}
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));")}>
        {bloque(
          "Cuánta gente entra",
          "Personas distintas cada día. Las puntas suelen ser el día siguiente a publicar algo.",
          <Linea datos={ENTRADAS} />
        )}
        {bloque(
          "Lo que entra al mes",
          "Lo cobrado por cursos y membresías. Sirve para ver si un mes flojo fue el mes o fuiste tú.",
          <Columnas datos={INGRESOS} sufijo=" €" />
        )}
      </div>

      {/* ---------------------------------------------- lo que está pasando */}
      <section style={css(tarjeta)}>
        <h2 style={css(CABECERA + "margin:0 0 var(--s4);font-size:var(--t-head);")}>Lo último</h2>
        <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
          {PASANDO.map((x, i) => (
            <motion.div
              key={x.quien + x.que}
              initial={quieto ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={css("display:flex;align-items:center;gap:12px;")}
            >
              <span
                aria-hidden
                style={css(
                  "flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;" +
                    `background:var(--${x.tono});color:var(--${x.tono}-tx);font-weight:600;font-size:var(--t-mini);`
                )}
              >
                {x.quien.trim()[0]}
              </span>
              <span style={css("flex:1;min-width:0;font-size:var(--t-body);color:var(--text-2);")}>
                <strong style={css("color:var(--text);font-weight:600;")}>{x.quien}</strong> {x.que}
              </span>
              <span style={css(NOTA + "flex:none;")}>{x.cuando}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------ 3. ¿dónde está el problema? */}
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));")}>
        {bloque(
          "De dónde entran",
          "Decide a qué hora publicas. Si la mitad está en México, las ocho de la tarde de Madrid es la madrugada de alguien.",
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
        "De cada cien que empiezan, cuántos llegan a cada lección. El dato más incómodo y el más útil: una caída grande entre dos lecciones señala la que hay que rehacer.",
        <Barras datos={CAIDA} sufijo=" %" />
      )}
    </div>
  );
}
