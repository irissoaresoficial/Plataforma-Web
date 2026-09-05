"use client";
import { css } from "@/lib/css";
import type { ResultadoEmpresa } from "@/lib/engine";
import { paraCliente } from "@/lib/estudio";
import { frase, recorta, sinPunto, titulo } from "@/lib/format";
import { COL } from "@/lib/tree";
import styles from "./Estudio.module.css";

const ROTULO = "font-size:9px;font-weight:600;color:#9A7F32;letter-spacing:.02em;";
const DATO = "font-family:var(--font-display);font-size:26px;font-weight:500;color:#241F2E;line-height:1;letter-spacing:-.012em;";
const CUERPO = "font-size:10.5px;line-height:1.5;color:#3A3546;margin:3px 0 0;";

/**
 * La hoja que se entrega de un estudio de empresa.
 *
 * Misma idea que la de una persona —una sola cara, sin fórmulas ni claves de la
 * escuela— pero con lo que un nombre da de sí: sus tres números, el camino de
 * origen, los días de fuerza y, al pie, lo importante que hay que retener.
 */
export default function HojaClienteEmpresa({ re, marca }: { re: ResultadoEmpresa; marca: string }) {
  const carta = re.origen.carta;

  const cifras = [
    { l: "Valor del nombre", v: re.valorNombre, p: "Cómo vibra la empresa" },
    { l: "Esencia", v: re.esencia.valor, p: "Lo que ha venido a ser" },
    { l: "Ego", v: re.ego.valor, p: "Cómo la ven" },
    ...(re.nombre.cifras ? [{ l: "Cifras", v: re.nombre.cifras, p: "Los números del nombre" }] : []),
  ];

  const importante = [
    { l: "Cómo vibra", t: `El nombre suma ${re.valorNombre}: es el tono de fondo, lo que la empresa transmite antes de decir nada.` },
    {
      l: "Dentro y fuera",
      t: `Esencia ${re.esencia.valor} y ego ${re.ego.valor}${re.nombre.cifras ? `, más ${re.nombre.cifras} de las cifras` : ""}. Cuanto más se parecen, más se muestra la empresa como es; cuanto más se separan, más distancia hay entre lo que quiere ser y lo que aparenta.`,
    },
    { l: "Hacia dónde", t: `El camino de origen es ${sinPunto(titulo(carta?.nombre))}: la dirección de fondo del proyecto.` },
    { l: "Cuándo mover", t: `Los días de fuerza son el ${re.diasFuerza.dias.join(", el ")}. Para firmar, abrir y presentar.` },
  ];

  return (
    <section className={`${styles.page} ${styles.interior} ${styles.abreSeccion}`} style={css("display:flex;flex-direction:column;gap:13px;")}>
      <header style={css("display:flex;align-items:flex-end;gap:14px;border-bottom:1px solid rgba(154,127,50,.3);padding-bottom:11px;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="" style={css("width:38px;height:38px;border-radius:50%;object-fit:cover;flex:none;")} />
        <div style={css("min-width:0;")}>
          <div style={css(ROTULO)}>{marca}</div>
          <h1 style={css("font-family:var(--font-display);font-size:25px;font-weight:500;letter-spacing:-.014em;color:#241F2E;margin:2px 0 0;line-height:1.15;overflow-wrap:anywhere;")}>
            {titulo(re.nombre.texto)}
          </h1>
        </div>
        <div style={css("margin-left:auto;text-align:right;font-size:10px;color:#7A7288;white-space:nowrap;")}>Estudio de empresa</div>
      </header>

      <div style={css("display:grid;grid-template-columns:repeat(" + cifras.length + ",1fr);gap:9px;")}>
        {cifras.map((x) => (
          <div key={x.l} style={css("border:1px solid rgba(154,127,50,.22);border-radius:9px;padding:9px 11px;background:rgba(201,168,76,.05);")}>
            <div style={css(ROTULO)}>{x.l}</div>
            <div style={css(DATO + "margin-top:3px;")}>{x.v}</div>
            <div style={css("font-size:9.5px;color:#7A7288;margin-top:2px;")}>{x.p}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:6px;")}>El nombre, letra a letra</div>
        <div style={css("display:flex;flex-wrap:wrap;gap:10px;")}>
          {re.nombre.palabras.map((w, wi) => (
            <div key={wi} style={css("font-size:10.5px;color:#3A3546;")}>
              <span style={css("font-weight:600;color:#241F2E;")}>{w.palabra}</span> · {w.total}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:6px;")}>El camino de origen</div>
        <div style={css("border-left:2.5px solid " + COL.origen + ";padding:2px 0 2px 10px;")}>
          <div style={css("display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;")}>
            <span style={css("font-size:9px;font-weight:600;color:" + COL.origen + ";")}>Arcano {re.origen.arcano}</span>
            <span style={css("font-family:var(--font-display);font-size:14px;font-weight:500;color:#241F2E;")}>{titulo(carta?.nombre)}</span>
          </div>
          <p style={css(CUERPO)}>
            {recorta(paraCliente(frase(carta?.lema) + ". " + (carta?.texto || "").replace(/^[“"][^”"]*[”"]\.?\s*/, "")), 300)}
          </p>
        </div>
      </div>

      <div>
        <div style={css(ROTULO + "margin-bottom:5px;")}>Días de fuerza</div>
        <div style={css("display:flex;gap:6px;")}>
          {re.diasFuerza.dias.map((d, i) => (
            <span
              key={d}
              style={css(
                "display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:50%;font-size:12px;font-weight:600;border:1px solid rgba(154,127,50,.35);color:#241F2E;background:" +
                  (i === 0 ? "rgba(201,168,76,.22)" : "transparent") +
                  ";"
              )}
            >
              {d}
            </span>
          ))}
        </div>
        <p style={css(CUERPO)}>Del más fuerte al menos fuerte. Para firmas, aperturas y decisiones.</p>
      </div>

      {/* Lo que hay que retener, al pie: es lo que se relee cuando la hoja
       * lleva meses en un cajón. */}
      <div style={css("border-top:1px solid rgba(154,127,50,.3);padding-top:10px;")}>
        <div style={css(ROTULO + "margin-bottom:6px;")}>Lo importante que hay que tener en cuenta</div>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;")}>
          {importante.map((x) => (
            <div key={x.l}>
              <div style={css("font-size:10px;font-weight:600;color:#241F2E;")}>{x.l}</div>
              <p style={css(CUERPO + "margin:1px 0 0;")}>{x.t}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={css("margin-top:auto;padding-top:11px;border-top:1px solid rgba(0,0,0,.08);display:flex;align-items:baseline;gap:10px;")}>
        <span style={css("font-size:9.5px;color:#8A8296;")}>{marca}</span>
        <span style={css("margin-left:auto;font-size:9.5px;color:#8A8296;font-style:italic;")}>El nombre es la contraseña</span>
      </div>
    </section>
  );
}
