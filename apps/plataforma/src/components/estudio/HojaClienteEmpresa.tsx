"use client";
import { css } from "@/lib/css";
import type { ResultadoEmpresa } from "@/lib/engine";
import { paraCliente } from "@/lib/estudio";
import { diccionario, rellena, type Idioma } from "@/lib/documento";
import { frase, recorta, sinPunto, titulo } from "@/lib/format";
import { COL } from "@/lib/tree";
import styles from "./Estudio.module.css";

const ROTULO = "font-size:9px;font-weight:600;color:#9A7F32;letter-spacing:.02em;";
const DATO = "font-family:var(--font-display);font-size:26px;font-weight:500;color:#2B1119;line-height:1;letter-spacing:-.012em;";
const CUERPO = "font-size:10.5px;line-height:1.5;color:#3A3546;margin:3px 0 0;";

/**
 * La hoja que se entrega de un estudio de empresa.
 *
 * Misma idea que la de una persona —una sola cara, sin fórmulas ni claves de la
 * escuela— pero con lo que un nombre da de sí: sus tres números, el camino de
 * origen, los días de fuerza y, al pie, lo importante que hay que retener.
 *
 * Sale en los tres idiomas por el mismo camino que la hoja de una persona: las
 * frases vienen de `lib/documento` y aquí no hay ninguna escrita.
 */
export default function HojaClienteEmpresa({ re, marca, idioma = "es" }: { re: ResultadoEmpresa; marca: string; idioma?: Idioma }) {
  const D = diccionario(idioma);
  const T = D.hoja;
  const carta = D.arcanos[re.origen.arcano];
  const nombreCarta = sinPunto(titulo(carta?.nombre));

  const cifras = [
    { l: T.empValorNombre, v: re.valorNombre, p: T.empValorNombrePie },
    { l: T.empEsencia, v: re.esencia.valor, p: T.empEsenciaPie },
    { l: T.empEgo, v: re.ego.valor, p: T.empEgoPie },
    ...(re.nombre.cifras ? [{ l: T.empCifras, v: re.nombre.cifras, p: T.empCifrasPie }] : []),
  ];

  const importante = [
    { l: T.empComoVibra, t: rellena(T.empComoVibraTexto, { n: re.valorNombre }) },
    {
      l: T.empDentroFuera,
      t: rellena(T.empDentroFueraTexto, {
        e: re.esencia.valor,
        g: re.ego.valor,
        cifras: re.nombre.cifras ? rellena(T.empDentroFueraCifras, { n: re.nombre.cifras }) : "",
      }),
    },
    { l: T.empHaciaDonde, t: rellena(T.empHaciaDondeTexto, { carta: nombreCarta }) },
    { l: T.empCuandoMover, t: rellena(T.empCuandoMoverTexto, { dias: re.diasFuerza.dias.join(T.separadorDias) }) },
  ];

  return (
    <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion}`} style={css("display:flex;flex-direction:column;gap:13px;")}>
      <header style={css("display:flex;align-items:flex-end;gap:14px;border-bottom:1px solid rgba(154,127,50,.3);padding-bottom:11px;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="" style={css("width:38px;height:38px;border-radius:50%;object-fit:cover;flex:none;")} />
        <div style={css("min-width:0;")}>
          <div style={css(ROTULO)}>{marca}</div>
          <h1 style={css("font-family:var(--font-display);font-size:25px;font-weight:500;letter-spacing:-.014em;color:#2B1119;margin:2px 0 0;line-height:1.15;overflow-wrap:anywhere;")}>
            {titulo(re.nombre.texto)}
          </h1>
        </div>
        <div style={css("margin-left:auto;text-align:right;font-size:10px;color:#7A7288;white-space:nowrap;")}>{T.empresaTitulo}</div>
      </header>

      <div style={css("display:grid;grid-template-columns:repeat(" + cifras.length + ",1fr);gap:9px;")}>
        {cifras.map((x) => (
          <div key={x.l} style={css("border:1px solid rgba(154,127,50,.22);border-radius:var(--r);padding:9px 11px;background:rgba(201,168,76,.05);")}>
            <div style={css(ROTULO)}>{x.l}</div>
            <div style={css(DATO + "margin-top:3px;")}>{x.v}</div>
            <div style={css("font-size:9.5px;color:#7A7288;margin-top:2px;")}>{x.p}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:6px;")}>{T.empLetraALetra}</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:10px;")}>
          {re.nombre.palabras.map((w, wi) => (
            <div key={wi} style={css("font-size:10.5px;color:#3A3546;")}>
              <span style={css("font-weight:600;color:#2B1119;")}>{w.palabra}</span> · {w.total}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:6px;")}>{T.empCaminoOrigen}</div>
        <div style={css("border-left:2.5px solid " + COL.origen + ";padding:2px 0 2px 10px;")}>
          <div style={css("display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;")}>
            <span style={css("font-size:9px;font-weight:600;color:" + COL.origen + ";")}>{rellena(T.empArcano, { n: re.origen.arcano })}</span>
            <span style={css("font-family:var(--font-display);font-size:14px;font-weight:500;color:#2B1119;")}>{titulo(carta?.nombre)}</span>
          </div>
          {/* El apunte en español empieza repitiendo el lema entre comillas y se
              le quita; en los otros dos idiomas el texto ya viene sin él, así
              que la limpieza no encuentra nada que quitar y no molesta. */}
          <p style={css(CUERPO)}>
            {recorta(paraCliente(frase(carta?.lema) + ". " + (carta?.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "")), 300)}
          </p>
        </div>
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:5px;")}>{T.empDiasFuerza}</div>
        <div style={css("display:flex;gap:6px;")}>
          {re.diasFuerza.dias.map((d, i) => (
            <span
              key={d}
              style={css(
                "display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:600;border:1px solid rgba(154,127,50,.35);color:#2B1119;background:" +
                  (i === 0 ? "rgba(201,168,76,.22)" : "transparent") +
                  ";"
              )}
            >
              {d}
            </span>
          ))}
        </div>
        <p style={css(CUERPO)}>{T.empDiasFuerzaPie}</p>
      </div>

      {/* Lo que hay que retener, al pie: es lo que se relee cuando la hoja
       * lleva meses en un cajón. */}
      <div style={css("border-top:1px solid rgba(154,127,50,.3);padding-top:10px;")}>
        <div style={css(ROTULO + "margin-bottom:6px;")}>{T.empImportante}</div>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;")}>
          {importante.map((x) => (
            <div key={x.l}>
              <div style={css("font-size:10px;font-weight:600;color:#2B1119;")}>{x.l}</div>
              <p style={css(CUERPO + "margin:1px 0 0;")}>{x.t}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={css("margin-top:auto;padding-top:11px;border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:baseline;gap:10px;")}>
        <span style={css("font-size:9.5px;color:#8A8296;")}>{marca}</span>
        <span style={css("margin-left:auto;font-size:9.5px;color:#8A8296;font-style:italic;")}>{T.empPieLema}</span>
      </div>
    </section>
  );
}
