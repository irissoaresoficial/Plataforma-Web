import type { CSSProperties } from "react";
import { css } from "@/lib/css";
import type { Resultado } from "@/lib/engine";
import { KDATA } from "@/lib/kdata";
import { COL } from "@/lib/tree";
import styles from "./Estudio.module.css";
import CuerpoPortales from "../CuerpoPortales";
import ArbolVida from "../ArbolVida";

/** Dónde cae cada portal en la escalera E/M de la ficha (pág. 2). */
const SITIO_EM: Record<number, { x: number; y: number }> = {
  2: { x: 108, y: 30 },
  3: { x: 62, y: 78 },
  1: { x: 154, y: 78 },
  4: { x: 62, y: 124 },
  10: { x: 154, y: 124 },
  5: { x: 62, y: 170 },
  9: { x: 154, y: 170 },
  6: { x: 62, y: 216 },
  8: { x: 154, y: 216 },
  7: { x: 108, y: 264 },
};

/** Ancho de la primera columna de una maqueta .split (ver Estudio.module.css). */
const col1 = (w: string) => ({ "--doc-col1": w }) as CSSProperties;

/** Versiones "documento" (fondo claro, sin animación) de los diagramas del panel. */

export function DocArbol({ r }: { r: Resultado }) {
  const camDef = [
    { k: "origen" as const, c: r.caminos.origen, etapa: "Origen", rango: "0 – " + r.caminos.edadCambio + " años" },
    { k: "transformacion" as const, c: r.caminos.transformacion, etapa: "Transformación", rango: "toda la vida" },
    { k: "destino" as const, c: r.caminos.destino, etapa: "Destino", rango: "desde los " + (r.turbulencias ? r.caminos.edadCambio + 10 : r.caminos.edadCambio) },
  ];
  return (
    <div className={styles.split} style={col1("210px")}>
      {/* En papel el árbol va quieto, con los grises del documento y la
       * tipografía del estudio, pero completo: nombres y complementarios. */}
      <ArbolVida
        r={r}
        animado={false}
        fuente="Cinzel, serif"
        tenue="#B9B2C4"
        borde="rgba(40,36,48,.35)"
        colorNombre="#6A6274"
        estilo="width:100%;height:auto;"
      />
      <div style={css("display:flex;flex-direction:column;gap:11px;")}>
        {camDef.map((d, i) => (
          <div key={i} style={css("border-left:3px solid " + COL[d.k] + ";padding-left:12px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:" + COL[d.k] + ";")}>
              {d.etapa} · {d.rango}
            </div>
            <div style={css("font-family:'Cinzel',serif;font-size:19px;line-height:1.25;color:#241F2E;")}>
              {d.c.arcano} · {d.c.carta?.nombre || ""}
            </div>
            <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:#6B6478;")}>{d.c.carta?.lema || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocEstructura({ r }: { r: Resultado }) {
  const tensiones = ([] as Array<{ nombre: string; a: number; b: number; activo: boolean; tipo: string }>)
    .concat(r.ejes.map((e) => ({ nombre: e.eje.nombre, a: e.eje.a, b: e.eje.b, activo: e.activo, tipo: "Eje" })))
    .concat(r.planosTension.map((p) => ({ nombre: p.plano.nombre, a: p.plano.a, b: p.plano.b, activo: p.activo, tipo: "Plano" })));

  return (
    <div style={css("display:grid;grid-template-columns:186px 124px 1fr;gap:16px;align-items:center;")}>
      <CuerpoPortales r={r} />
      {/* La escalera E/M de la pág. 2 de la ficha: los diez portales puestos en
       * su sitio, y cada eje como una línea que cruza de un lado al otro. Va al
       * lado de su lista y no encima: apilada, el bloque no cabía al pie de la
       * hoja y se llevaba media página en blanco. */}
      <svg viewBox="0 0 216 294" style={css("width:100%;height:auto;")}>
          <text x="62" y="12" textAnchor="middle" fontSize="11" fill="#9B93A8">E</text>
          <text x="154" y="12" textAnchor="middle" fontSize="11" fill="#9B93A8">M</text>
          {tensiones.map((l, i) => {
            const A = SITIO_EM[l.a], B = SITIO_EM[l.b];
            if (!A || !B) return null;
            return (
              <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke={l.activo ? "#B0564C" : "#C7C0D0"} strokeWidth={l.activo ? 2.2 : 1.1}
                strokeDasharray={l.tipo === "Eje" ? undefined : "5 5"} strokeLinecap="round" />
            );
          })}
          {Object.entries(SITIO_EM).map(([n, pt]) => {
            const tenso = tensiones.some((l) => l.activo && (l.a === +n || l.b === +n));
            return (
              <g key={n}>
                <circle cx={pt.x} cy={pt.y} r="15" fill="#FBF8F1" stroke={tenso ? "#B0564C" : "#C7C0D0"} strokeWidth={tenso ? 1.6 : 1.1} />
                <text x={pt.x} y={pt.y + 6} textAnchor="middle" fontFamily="Cinzel, serif" fontSize="16" fill={tenso ? "#B0564C" : "#4A4456"}>
                  {+n === 10 ? "0" : n}
                </text>
              </g>
            );
          })}
      </svg>
      <div style={css("display:flex;flex-direction:column;gap:6px;")}>
        {tensiones.map((t, i) => (
          <div
            key={i}
            style={css(
              "font-family:'Karla',sans-serif;font-size:11px;letter-spacing:.08em;padding:5px 9px;border-radius:2px;color:" +
                (t.activo ? "#8E3A2F" : "#6B6478") +
                ";background:" +
                (t.activo ? "rgba(192,87,76,.1)" : "rgba(201,168,76,.07)") +
                ";"
            )}
          >
            {t.tipo} {t.a}–{t.b} · {t.nombre} — {t.activo ? "en tensión" : "libre"}
          </div>
        ))}
      </div>
    </div>
  );
}

function celdaDoc(n: number, bloqueos: Record<number, number>, ayudas: Record<number, number>) {
  const b = bloqueos[n] || 0,
    ay = ayudas[n] || 0;
  return {
    n: n === 10 ? "10/0" : String(n),
    bloqueo: b ? String(n === 10 ? 0 : n).repeat(b) : "",
    ayuda: ay ? "●".repeat(ay) : "",
    style:
      "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:56px;border-radius:3px;border:1px solid " +
      (b ? "rgba(192,87,76,.5)" : "rgba(201,168,76,.4)") +
      ";background:" +
      (b ? "rgba(192,87,76,.12)" : "#F3EFE6") +
      ";width:100%;",
  };
}
export function DocAlma({ r }: { r: Resultado }) {
  const ia = r.imagenAlma;
  const c = (n: number) => celdaDoc(n, ia.bloqueos, ia.ayudas);
  // Mismo orden que el manual: el 1 arriba a la izquierda y el 10 abajo.
  const filas = [
    { label: "Espíritu", celdas: [c(1), c(2), c(3)] },
    { label: "Alma", celdas: [c(4), c(5), c(6)] },
    { label: "Materia", celdas: [c(7), c(8), c(9)] },
  ];
  const celda10 = c(10);
  const ROT = "font-family:'Karla',sans-serif;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#9B93A8;";
  return (
    <div className={styles.split} style={col1("230px")}>
      <div>
        <div style={css("display:grid;grid-template-columns:52px 1fr 1fr 1fr;gap:7px;margin-bottom:5px;")}>
          <span />
          {["Espíritu", "Alma", "Materia"].map((h) => (
            <span key={h} style={css(ROT + "text-align:center;")}>{h}</span>
          ))}
        </div>
        {filas.map((f, fi) => (
          <div key={fi} style={css("display:grid;grid-template-columns:52px 1fr 1fr 1fr;gap:7px;margin-bottom:7px;align-items:center;")}>
            <span style={css(ROT)}>{f.label}</span>
            {f.celdas.map((cc, ci) => (
              <div key={ci} style={css(cc.style)}>
                <span style={css("font-family:'Cinzel',serif;font-size:14px;color:#9B93A8;")}>{cc.n}</span>
                <span style={css("font-family:'Cinzel',serif;font-size:15px;color:#B0342A;")}>{cc.bloqueo}</span>
                <span style={css("font-size:9px;letter-spacing:2px;color:#3E7A4E;")}>{cc.ayuda}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={css("display:grid;grid-template-columns:52px 1fr;gap:7px;align-items:center;")}>
          <span style={css(ROT)}>Evolución</span>
          <div style={css(celda10.style)}>
            <span style={css("font-family:'Cinzel',serif;font-size:14px;color:#9B93A8;")}>10 / 0</span>
            <span style={css("font-family:'Cinzel',serif;font-size:15px;color:#B0342A;")}>{celda10.bloqueo}</span>
            <span style={css("font-size:9px;letter-spacing:2px;color:#3E7A4E;")}>{celda10.ayuda}</span>
          </div>
        </div>
      </div>
      <div style={css("font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.5;color:#4A4356;")}>
        {ia.proyeccion ? "El 0 cae en la casilla " + ia.proyeccion + ": eso es lo que proyectas de cara a los demás." : ""}
      </div>
    </div>
  );
}

const DOC_TH = "font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#9B93A8;display:flex;align-items:center;justify-content:center;padding:5px 0;";
const DOC_TD = "font-family:'Cinzel',serif;font-size:16px;color:#37323F;display:flex;align-items:center;justify-content:center;padding:8px 0;border:1px solid rgba(201,168,76,.22);border-radius:3px;background:#F3EFE6;";
const DOC_TD_TOT = DOC_TD.replace("#37323F", "#241F2E").replace("#F3EFE6", "rgba(201,168,76,.22)");

export function DocCuentas({ r }: { r: Resultado }) {
  const c = r.cuentas;
  const tabla: Array<{ v: string | number; style: string }> = [
    { v: "", style: DOC_TH }, { v: "Día", style: DOC_TH }, { v: "Mes", style: DOC_TH }, { v: "Año", style: DOC_TH }, { v: "Cuenta", style: DOC_TH },
    { v: "E", style: DOC_TH }, { v: c.espiritu.dia, style: DOC_TD }, { v: c.espiritu.mes, style: DOC_TD }, { v: c.espiritu.anio, style: DOC_TD }, { v: c.espiritu.total, style: DOC_TD_TOT },
    { v: "A", style: DOC_TH }, { v: c.alma.dia, style: DOC_TD }, { v: c.alma.mes, style: DOC_TD }, { v: c.alma.anio, style: DOC_TD }, { v: c.alma.total, style: DOC_TD_TOT },
    { v: "C", style: DOC_TH }, { v: c.cuerpo.dia, style: DOC_TD }, { v: c.cuerpo.mes, style: DOC_TD }, { v: c.cuerpo.anio, style: DOC_TD }, { v: c.cuerpo.total, style: DOC_TD_TOT },
    { v: "", style: DOC_TH }, { v: c.potenciales[0], style: DOC_TD_TOT }, { v: c.potenciales[1], style: DOC_TD_TOT }, { v: c.potenciales[2], style: DOC_TD_TOT }, { v: c.karmico, style: DOC_TD_TOT },
  ];
  const karma = [
    { label: "Nº kármico de las relaciones", valor: c.karmico },
    { label: "Nº del lema de vida", valor: c.lemaDeVida },
    { label: "Nº de efecto sanador", valor: r.vibraciones.efectoSanador },
    { label: "Nº de afinidad", valor: r.afinidad.diaMes + " · " + r.afinidad.mesAnio },
    { label: "Vibración cuerpo / alma / espíritu", valor: r.vibraciones.cuerpo + " · " + r.vibraciones.alma + " · " + r.vibraciones.espiritu },
  ];
  return (
    <div className={styles.duo}>
      <div style={css("display:grid;grid-template-columns:20px 1fr 1fr 1fr 1fr;gap:5px;")}>
        {tabla.map((cell, i) => (
          <div key={i} style={css(cell.style)}>
            {cell.v}
          </div>
        ))}
      </div>
      <div style={css("display:flex;flex-direction:column;gap:9px;")}>
        {karma.map((k, i) => (
          <div key={i} style={css("display:flex;gap:12px;align-items:baseline;border-bottom:1px solid rgba(201,168,76,.25);padding-bottom:7px;")}>
            <span style={css("font-family:'Karla',sans-serif;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#9B93A8;flex:1;")}>{k.label}</span>
            <span style={css("font-family:'Cinzel',serif;font-size:23px;color:#241F2E;")}>{k.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocCiclos({ r }: { r: Resultado }) {
  const CI = KDATA.ciclos;
  const ciclos = r.ciclos.ciclos.map((c) => ({ ...c, rango: c.hasta === null ? "desde los " + c.desde + " años" : c.desde + " – " + c.hasta + " años", texto: (CI.ciclos || {})[c.numero] || "" }));
  const realizaciones = r.ciclos.realizaciones.map((x) => ({ ...x, rango: x.hasta === null ? "desde los " + x.desde : x.desde + " – " + x.hasta + " años", texto: (CI.realizaciones || {})[x.valor] || "" }));
  const desafios = r.ciclos.desafios.map((x) => ({ ...x, texto: (CI.desafios || {})[x.valor] || "" }));
  return (
    <div style={css("display:flex;flex-direction:column;gap:16px;")}>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:14px;")}>
        {ciclos.map((c, i) => (
          <div key={i} style={css("border-top:2px solid #C9A84C;padding-top:9px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9B93A8;")}>
              {c.nombre} · {c.rango}
            </div>
            <div style={css("font-family:'Cinzel',serif;font-size:26px;color:#241F2E;line-height:1.2;")}>{c.numero}</div>
            <p style={css("font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.45;color:#4A4356;margin:3px 0 0;")}>{c.texto}</p>
          </div>
        ))}
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;")}>
        {realizaciones.map((x, i) => (
          <div key={i} style={css("border-left:2px solid #C9A84C;padding-left:12px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9B93A8;")}>
              Realización {x.n} · {x.rango}
            </div>
            <div style={css("font-family:'Cinzel',serif;font-size:22px;color:#241F2E;")}>{x.valor}</div>
            <p style={css("font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.45;color:#4A4356;margin:3px 0 0;")}>{x.texto}</p>
          </div>
        ))}
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;")}>
        {desafios.map((x, i) => (
          <div key={i} style={css("border-left:2px solid #C0574C;padding-left:12px;")}>
            <div style={css("font-family:'Karla',sans-serif;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9B93A8;")}>
              {x.etiqueta} · {x.rango}
            </div>
            <div style={css("font-family:'Cinzel',serif;font-size:22px;color:#241F2E;")}>{x.valor}</div>
            <p style={css("font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.45;color:#4A4356;margin:3px 0 0;")}>{x.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
