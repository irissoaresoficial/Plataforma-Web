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
 * TODO LO QUE SE ENSEÑA SALE DE LO QUE YA SE GUARDA, SIN UNA SOLA CIFRA
 * APARTE. Las visitas vienen de `visitas`, el avance de `avance`, los cursos
 * de `cursos` y la gente de `usuarios`. No hay ninguna tabla de estadísticas
 * que pueda discrepar de la realidad: si no cuadra, es que la realidad es ésa.
 *
 * Y LO QUE FALTA SE DICE, NO SE INVENTA. De dónde entra la gente y por qué
 * puerta llegó NO se puede saber con lo que hay guardado: eso lo sabe el
 * servidor en el momento de la visita y nadie lo está apuntando. Antes había
 * ahí unos números de ejemplo preciosos; ahora hay un cartel explicando qué
 * hace falta para tenerlos de verdad. Un hueco honrado vale más que un dato
 * inventado que alguien va a usar para decidir dónde anuncia.
 *
 * LA LEY, PARA CUANDO SE MONTE: la ubicación se guarda por país y ciudad,
 * NUNCA la dirección de internet entera, que en Europa es un dato personal. Y
 * se escribe en la política de privacidad antes de encender nada.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CABECERA, LECTURA, NOTA, TITULO } from "@/lib/ui";
import { Barras, Linea, type Punto } from "../escuela/Grafico";
import { listaUsuarios } from "@/lib/despacho/usuarios";
import { rolesDe } from "@/lib/roles";
import { cursos as repoCursos, todosLosAvances, totalLecciones, type Avance, type Curso } from "@/lib/escuela";
import { porDia, todasLasVisitas } from "@/lib/escuela/trofeos";

type Datos = {
  dias: Punto[];
  alumnos: number;
  miembros: number;
  lecciones: number;
  /** De cada cien que empiezan un curso, cuántos lo acaban. */
  acaban: number;
  /** Por dónde se cae la gente, lección a lección. */
  caida: Array<{ etiqueta: string; valor: number }>;
};

export default function MetricasScreen() {
  const [d, setD] = useState<Datos | null>(null);
  const [roto, setRoto] = useState(false);
  const [tabla, setTabla] = useState(false);
  const quieto = useReducedMotion();

  const carga = useCallback(async () => {
    setRoto(false);
    try {
      const [gente, cursos, avances, visitas] = await Promise.all([
        listaUsuarios(),
        repoCursos.listar(),
        todosLosAvances(),
        todasLasVisitas(),
      ]);
      setD(calcula(gente, cursos, avances, visitas));
    } catch {
      setRoto(true);
    }
  }, []);

  useEffect(() => {
    void carga();
  }, [carga]);

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
    "box-shadow:var(--nm);padding:var(--s4);";

  const cifra = (que: string, valor: string, i: number, tono: string) => (
    <motion.div
      key={que}
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={css(tarjeta + "position:relative;overflow:hidden;")}
    >
      {/* Un filo de color arriba, no la tarjeta entera pintada. Cuatro tarjetas
          de cuatro colores saturados compiten y ninguna gana; un filo las
          distingue y deja que el número siga siendo lo que se lee. */}
      <span
        aria-hidden
        style={css(`position:absolute;inset:0 0 auto;height:3px;background:var(--${tono}-tx);opacity:.55;`)}
      />
      <div style={css(NOTA)}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(28px,3.6vw,40px);font-weight:650;" +
            "line-height:1.05;margin-top:8px;color:var(--text);font-variant-numeric:tabular-nums;letter-spacing:-.03em;"
        )}
      >
        {valor}
      </div>
    </motion.div>
  );

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      {/* Debajo del título, PARA QUÉ SIRVE. Un cuadro de mando sin esta línea
          obliga a deducir qué hacer con cada dibujo, y lo que se deduce cambia
          según el día que se tenga. */}
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  const vacio = d && d.dias.every((x) => x.valor === 0) && d.lecciones === 0;

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:1060px;")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Métricas</h1>
        <span style={css(NOTA)}>últimos 30 días</span>
        {d && !vacio && (
          <button onClick={() => setTabla((x) => !x)} style={css(BOTON_NORMAL + "margin-left:auto;")}>
            {tabla ? "Ver los gráficos" : "Ver los números"}
          </button>
        )}
      </div>

      {d === null && !roto && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {roto && (
        <p style={css(NOTA + "margin:0;")}>
          No se han podido leer las métricas. Mira la conexión y vuelve a entrar.
        </p>
      )}

      {/* Una escuela recién abierta no tiene métricas, y eso no es un fallo.
          Decirlo evita que cuatro ceros se lean como que algo está roto. */}
      {vacio && (
        <div style={css(tarjeta + "max-width:620px;")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Todavía no hay nada que medir</h2>
          <p style={css(LECTURA + "margin:0;")}>
            Los números salen de lo que hace la gente: los días que entran, las lecciones que terminan. En cuanto
            empiece a entrar alguien, esta pantalla se llena sola.
          </p>
        </div>
      )}

      {d && !vacio && !tabla && (
        <>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));")}>
            {cifra("Alumnos", `${d.alumnos}`, 0, "melocoton")}
            {cifra("Miembros", `${d.miembros}`, 1, "rosa")}
            {cifra("Lecciones terminadas", `${d.lecciones}`, 2, "cielo")}
            {cifra("Acaban el curso", `${d.acaban} %`, 3, "lima")}
          </div>

          {bloque(
            "Cuánta gente entra",
            "Personas distintas que abrieron la escuela cada día. Para ver si lo que publicaste la semana pasada movió algo.",
            <Linea datos={d.dias} />
          )}

          {d.caida.length > 0 &&
            bloque(
              "Dónde se cae la gente",
              "De cada cien que empiezan, cuántos llegan a cada lección. El dato más incómodo y el más útil: una caída grande entre dos lecciones señala la que hay que rehacer.",
              <Barras datos={d.caida} sufijo=" %" />
            )}

          {/*
            EL HUECO HONRADO.

            Gerson pidió por su nombre saber de dónde entra la gente. No se
            puede con lo que hay guardado: el país lo sabe el servidor en el
            momento de la visita, y nadie lo está apuntando. Decirlo cuesta
            menos que inventarlo y vale infinitamente más.
          */}
          <section style={css(tarjeta)}>
            <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>De dónde entran</h2>
            <p style={css(LECTURA + "margin:var(--s3) 0 0;max-width:66ch;")}>
              Esto todavía no se mide. Para saber el país y la ciudad hay que apuntarlo en el momento en que alguien
              entra —el servidor lo sabe, pero ahora mismo no lo guarda nadie—. Es un trabajo de medio día.
            </p>
            <p style={css(NOTA + "margin:var(--s3) 0 0;max-width:66ch;line-height:1.55;")}>
              Cuando se monte, se guardará <strong>sólo el país y la ciudad</strong>, nunca la dirección de internet
              entera: en Europa eso es un dato personal y hay que escribirlo en la política de privacidad antes de
              encender nada.
            </p>
          </section>
        </>
      )}

      {d && !vacio && tabla && (
        <section style={css(tarjeta)}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Los números</h2>
          <div style={css("overflow-x:auto;")}>
            <table style={css("width:100%;border-collapse:collapse;font-size:var(--t-body);")}>
              <caption style={css(NOTA + "text-align:left;margin-bottom:10px;")}>
                Personas distintas que entraron cada día.
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={css("text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-3);font-weight:600;")}>
                    Día
                  </th>
                  <th scope="col" style={css("text-align:right;padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-3);font-weight:600;")}>
                    Personas
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.dias.map((x) => (
                  <tr key={x.etiqueta}>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);")}>{x.etiqueta}</td>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);text-align:right;font-variant-numeric:tabular-nums;")}>
                      {x.valor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- la cuenta */

/**
 * Los números, sacados de lo que ya hay guardado.
 *
 * Está aparte del componente a propósito: es la parte que se puede equivocar
 * —sumas, porcentajes, divisiones entre cero— y separada se puede leer entera
 * de un vistazo y comprobar sin montar una pantalla.
 */
function calcula(
  gente: Array<{ roles?: string[] }>,
  cursos: Curso[],
  avances: Avance[],
  visitas: Array<{ uid: string; dias: string[] }>
): Datos {
  const rol = (r: string) => gente.filter((p) => rolesDe(p as never).includes(r as never)).length;

  /* Las lecciones hechas, contando SÓLO LAS QUE SIGUEN EXISTIENDO. Si Iris
     borra una lección que alguien terminó, su id se queda en el avance; sin
     este filtro el total subiría por encima de las lecciones que hay. */
  const vivas = new Set(cursos.flatMap((c) => c.modulos.flatMap((m) => m.lecciones.map((l) => l.id))));
  const lecciones = avances.reduce((n, a) => n + a.hechas.filter((id) => vivas.has(id)).length, 0);

  /* Cuántos de los que empezaron un curso lo acabaron. Se mira curso a curso y
     se promedia sobre los que TIENEN lecciones: un curso vacío daría una
     división entre cero, y un 100 % por no tener nada que hacer sería la
     métrica más halagadora y más falsa de la pantalla. */
  let empezados = 0;
  let acabados = 0;
  for (const c of cursos) {
    const total = totalLecciones(c);
    if (total === 0) continue;
    const suyos = avances.filter((a) => a.cursoId === c.id);
    for (const a of suyos) {
      const hechas = a.hechas.filter((id) => vivas.has(id)).length;
      if (hechas === 0) continue;
      empezados += 1;
      if (hechas >= total) acabados += 1;
    }
  }

  /* Dónde se cae la gente: del curso con más alumnos, cuántos llegan a cada
     lección. Se coge uno solo porque mezclar varios no señala ninguna lección
     concreta, y señalar la lección concreta es para lo que sirve el gráfico. */
  let caida: Array<{ etiqueta: string; valor: number }> = [];
  const conGente = cursos
    .map((c) => ({ c, n: avances.filter((a) => a.cursoId === c.id).length }))
    .sort((a, b) => b.n - a.n)[0];
  if (conGente && conGente.n > 0 && totalLecciones(conGente.c) > 0) {
    const suyos = avances.filter((a) => a.cursoId === conGente.c.id);
    const base = suyos.length;
    let i = 0;
    for (const m of conGente.c.modulos) {
      for (const l of m.lecciones) {
        i += 1;
        const cuantos = suyos.filter((a) => a.hechas.includes(l.id)).length;
        caida.push({
          etiqueta: `${i}. ${l.titulo || "Sin nombre"}`,
          valor: Math.round((cuantos / base) * 100),
        });
      }
    }
    caida = caida.slice(0, 12);
  }

  return {
    dias: porDia(visitas, 30),
    alumnos: rol("alumno"),
    miembros: rol("miembro"),
    lecciones,
    acaban: empezados === 0 ? 0 : Math.round((acabados / empezados) * 100),
    caida,
  };
}
