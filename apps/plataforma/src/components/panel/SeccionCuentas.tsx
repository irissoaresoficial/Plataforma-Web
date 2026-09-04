"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipsDeFicha } from "@/lib/chips";
import { ficha } from "@/lib/engine";
import { frase, recorta, chipStyle } from "@/lib/format";
import Desglose, { type Paso } from "../Desglose";

const TH = "font-size:var(--t-mini);font-weight:590;color:var(--text-4);display:flex;align-items:center;justify-content:center;padding:6px 0;";
const TD = "font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text-2);display:flex;align-items:center;justify-content:center;padding:11px 0;border:1px solid var(--gold-soft);border-radius:var(--r-sm);background:color-mix(in srgb, var(--text) 4%, transparent);";
const TD_TOT = TD.replace("var(--text-2)", "var(--text)").replace("color-mix(in srgb, var(--text) 4%, transparent)", "var(--border)");

export default function SeccionCuentas() {
  const { r, verNumero, verTexto } = useApp();
  if (!r) return null;
  const c = r.cuentas;

  const tabla: Array<{ v: string | number; style: string }> = [
    { v: "", style: TH }, { v: "Día", style: TH }, { v: "Mes", style: TH }, { v: "Año", style: TH }, { v: "Cuenta", style: TH },
    { v: "E", style: TH }, { v: c.espiritu.dia, style: TD }, { v: c.espiritu.mes, style: TD }, { v: c.espiritu.anio, style: TD }, { v: c.espiritu.total, style: TD_TOT },
    { v: "A", style: TH }, { v: c.alma.dia, style: TD }, { v: c.alma.mes, style: TD }, { v: c.alma.anio, style: TD }, { v: c.alma.total, style: TD_TOT },
    { v: "C", style: TH }, { v: c.cuerpo.dia, style: TD }, { v: c.cuerpo.mes, style: TD }, { v: c.cuerpo.anio, style: TD }, { v: c.cuerpo.total, style: TD_TOT },
    { v: "", style: TH }, { v: c.potenciales[0], style: TD_TOT }, { v: c.potenciales[1], style: TD_TOT }, { v: c.potenciales[2], style: TD_TOT }, { v: c.karmico, style: TD_TOT },
  ];

  // De dónde sale cada número de esta pantalla (manual §29 a §35).
  const pasos: Paso[] = [
    { etiqueta: "Fila espíritu", operacion: `${c.espiritu.dia} + ${c.espiritu.mes} + ${c.espiritu.anio}`, resultado: c.espiritu.total },
    { etiqueta: "Fila alma", operacion: `${c.alma.dia} + ${c.alma.mes} + ${c.alma.anio}`, resultado: c.alma.total },
    { etiqueta: "Fila materia", operacion: `${c.cuerpo.dia} + ${c.cuerpo.mes} + ${c.cuerpo.anio}`, resultado: c.cuerpo.total },
    { etiqueta: "Potenciales", operacion: "suma de cada columna", resultado: c.potenciales.join(" · ") },
    { etiqueta: "Número kármico", operacion: `${c.espiritu.total} + ${c.alma.total} + ${c.cuerpo.total}`, resultado: c.karmico, final: true },
    {
      etiqueta: "Lema de vida",
      operacion: c.lemaEnApuntes
        ? `la liberación del ${c.karmico} según los apuntes (${c.karmico} + ${c.tensionKarmico})`
        : `${c.karmico} no figura en los apuntes: se calcula ${c.karmico} + ${c.tensionKarmico}`,
      resultado: c.lemaDeVida,
      final: true,
    },
    {
      etiqueta: "Efecto sanador",
      operacion: `cuerpo + alma + espíritu = ${r.vibraciones.cuerpo}+${r.vibraciones.alma}+${r.vibraciones.espiritu}`,
      resultado: r.vibraciones.efectoSanador,
    },
    { etiqueta: "Afinidad", operacion: `día+mes y mes+año`, resultado: `${r.afinidad.diaMes} · ${r.afinidad.mesAnio}` },
  ];

  /**
   * La lectura de un número: lo que dice de él el diccionario. Estas cuatro
   * tarjetas enseñaban la cifra y una frase de qué es cada cosa, pero no lo
   * que el número significa en esta carta — que es justamente lo que Iris
   * necesita leer. Los de afinidad no traían ni chips: son dos números, así
   * que llevan dos lecturas.
   */
  const lectura = (n: number, aclara?: string) => {
    const F = ficha(n);
    // Un número de tres o cuatro cifras no siempre está en los apuntes. Cuando
    // no está, el manual lo lee por sus partes — el 102 por el 2 y el 10 — y
    // eso es lo que hay que enseñar, no una tarjeta con la cifra y nada más.
    if (F && !F.texto && F.partes.length) {
      const dice = F.partes.map((x) => x.n).join(" y ");
      return F.partes.map((x, i) => ({
        n: x.n,
        aclara: i === 0 ? (aclara ? aclara + " · " : "") + `el ${n} no está en los apuntes: se lee por sus partes, ${dice}` : undefined,
        titulo: frase(x.titulo || ""),
        texto: recorta(x.texto || "", 300),
        completo: x.texto || "",
        f: x,
        parte: true,
      }));
    }
    return [
      {
        n,
        aclara,
        titulo: frase(F?.titulo || ""),
        texto: recorta(F?.texto || "", 320),
        completo: F?.texto || "",
        f: F,
        parte: false,
      },
    ];
  };

  const tarjetas = [
    {
      label: "Número kármico de las relaciones",
      valor: c.karmico,
      desc: "Dónde fallaste en tus relaciones en vidas pasadas y qué se repite en esta.",
      f: r.cuentasFichas.karmico,
      lecturas: lectura(c.karmico),
    },
    {
      label: "Número del lema de vida",
      valor: c.lemaDeVida,
      desc: "El propósito de tu alma: la vibración que te permite llevar a cabo tu plan.",
      f: r.cuentasFichas.lema,
      lecturas: lectura(c.lemaDeVida),
    },
    {
      label: "Número de efecto sanador",
      valor: r.vibraciones.efectoSanador,
      desc: `Cuerpo ${r.vibraciones.cuerpo} + alma ${r.vibraciones.alma} + espíritu ${r.vibraciones.espiritu}.`,
      f: r.efectoSanadorFicha,
      lecturas: lectura(r.vibraciones.efectoSanador),
    },
    {
      label: "Números de afinidad",
      valor: `${r.afinidad.diaMes} · ${r.afinidad.mesAnio}`,
      desc: "Visión global de tus procesos kármicos: qué has venido a hacer en esta encarnación. Son dos, y cada uno mira una mitad de la vida.",
      f: null,
      mistica: true,
      lecturas: [
        ...lectura(r.afinidad.diaMes, `día ${r.fecha.dia} + mes ${r.fecha.mes}`),
        ...lectura(r.afinidad.mesAnio, `mes ${r.fecha.mes} + año ${String(r.fecha.anio).slice(2)}`),
      ],
    },
  ];

  const notaLema = c.lemaEnApuntes
    ? "El lema de vida no es un número independiente: es el número de liberación del kármico, tomado tal cual de los apuntes."
    : `El ${c.karmico} no está en los apuntes, así que su liberación se ha calculado con la regla de tensión. Conviene comprobarlo a mano.`;

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      <div data-dos="">
      {/* La tabla acompaña la lectura mientras se baja: es a lo que hay que
       * volver todo el rato para saber de qué fila sale cada número. */}
      <div data-anclado="" style={css("position:sticky;top:78px;align-self:start;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:16px;")}>Cuentas abiertas</div>
        <div style={css("display:grid;grid-template-columns:26px 1fr 1fr 1fr 1fr;gap:6px;")}>
          {tabla.map((cell, i) => (
            <div key={i} style={css(cell.style)}>
              {cell.v}
            </div>
          ))}
        </div>
        <div style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.55;color:var(--text-3);margin-top:var(--s4);")}>
          Cada potencial arcaico ayuda a cerrar la cuenta abierta de su fila: {c.potenciales[0]}→{c.cuentas[0]}, {c.potenciales[1]}→{c.cuentas[1]}, {c.potenciales[2]}→{c.cuentas[2]}.
        </div>
      </div>
      <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
        {tarjetas.map((k, i) => (
          <article
            key={i}
            style={css(
              "background:var(--surface);border:1px solid var(--border);" +
                (k.mistica ? "border-left:2px solid var(--gold);" : "") +
                "border-radius:var(--r);padding:var(--pad-card-sm);"
            )}
          >
            <div>
              <div style={css("display:flex;align-items:baseline;gap:var(--s3);")}>
                <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{k.label}</span>
                <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-hero);color:var(--text);line-height:1;margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap;")}>{k.valor}</span>
              </div>
              <p style={css("font-size:var(--t-body);line-height:1.55;color:var(--text-3);margin:var(--s2) 0 0;text-wrap:pretty;")}>{k.desc}</p>

              {/* La lectura del número, que es a lo que se viene. Cuando la
               * tarjeta lleva dos —los de afinidad— van una debajo de otra,
               * cada una con su cifra y de dónde sale. */}
              {k.lecturas.filter((l) => l.texto).map((l, li) => (
                <div
                  key={li}
                  style={css("margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--border);")}
                >
                  <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
                    {(k.lecturas.length > 1 || l.parte) && (
                      <span style={css("font-weight:600;font-size:var(--t-title);color:var(--gold);line-height:1;font-variant-numeric:tabular-nums;")}>{l.n}</span>
                    )}
                    <span style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.012em;line-height:1.2;color:var(--text);")}>{l.titulo}</span>
                  </div>
                  {l.aclara && <div style={css("font-size:var(--t-mini);color:var(--text-4);margin-top:3px;")}>{l.aclara}</div>}
                  <p style={css("font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:var(--s3) 0 0;text-wrap:pretty;")}>{l.texto}</p>
                  <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3);")}>
                    {chipsDeFicha(l.f, verNumero).map((cc, ci) => (
                      <button key={ci} onClick={cc.onClick} style={css(cc.style)}>
                        {cc.label}
                      </button>
                    ))}
                    {l.completo.length > 320 && (
                      <button
                        onClick={() => verTexto("Número " + l.n, l.titulo, k.label, l.completo)}
                        style={css(chipStyle("var(--text-3)"))}
                      >
                        Texto completo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      </div>
      {/* La derivación va a todo lo ancho: encajada en la columna estrecha
       * partía cada operación en tres renglones. */}
      <Desglose titulo="De dónde salen estos números" pasos={pasos} nota={notaLema} />
    </div>
  );
}
