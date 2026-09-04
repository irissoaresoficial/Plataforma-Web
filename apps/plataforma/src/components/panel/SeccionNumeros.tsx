"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipsDeFicha } from "@/lib/chips";
import { chipStyle, cuentaDiasFuerza } from "@/lib/format";
import Desglose from "../Desglose";
import Cifra from "../Cifra";

export default function SeccionNumeros() {
  const { r, verNumero } = useApp();
  if (!r) return null;

  const nDef = [
    { id: "corazon", label: "Número de corazón", o: r.corazon, desc: "el número pin del alma, cómo vibra" },
    { id: "esencia", label: "Número de esencia", o: r.esencia, desc: "los valores internos más profundos" },
    { id: "ego", label: "Número de ego", o: r.ego, desc: "la conexión que tiene con las personas" },
  ];

  return (
    <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
      {nDef.map((d, i) => {
        const chips = chipsDeFicha(d.o.ficha, verNumero).concat(
          d.o.ficha && d.o.ficha.enDiccionario ? [{ label: "Significado " + d.o.valor, style: chipStyle("var(--gold)"), onClick: () => verNumero(d.o.valor) }] : []
        );
        return (
          <article key={i} style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--gap);flex-wrap:wrap;")}>
              <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{d.label}</span>
              <Cifra id={d.id} valor={d.o.valor} tam={42} />
              <span style={css("font-family:var(--font-ui);font-style:normal;font-size:var(--t-read);color:var(--text-3);")}>{d.desc}</span>
            </div>
            <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--s4);margin-top:var(--s4);")}>
              <div style={css("border-left:2px solid var(--red);padding:2px 0 2px 12px;")}>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--red);margin-bottom:4px;")}>En negativo</div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.55;color:var(--text-2);margin:0;text-wrap:pretty;")}>{d.o.lectura.negativo}</p>
              </div>
              <div style={css("border-left:2px solid var(--green);padding:2px 0 2px 12px;")}>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--green);margin-bottom:4px;")}>En positivo</div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.55;color:var(--text-2);margin:0;text-wrap:pretty;")}>{d.o.lectura.positivo}</p>
              </div>
            </div>
            <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s4);")}>
              {chips.map((c, ci) => (
                <button key={ci} onClick={c.onClick} style={css(c.style)}>
                  {c.label}
                </button>
              ))}
            </div>
          </article>
        );
      })}

      <Desglose
        titulo="De dónde salen estos números"
        pasos={[
          { etiqueta: "Valor del nombre", operacion: r.nombre.palabras.map((w) => w.total).join(" + "), resultado: r.valorNombre },
          { etiqueta: "Edad de cambio", operacion: `${r.fecha.dia} + ${r.fecha.mes} + ${r.fecha.anio}, sumando cifras`, resultado: r.caminos.edadCambio },
          { etiqueta: "Número de corazón", operacion: `${r.valorNombre} + ${r.caminos.edadCambio}`, resultado: r.corazon.valor, final: true },
          { etiqueta: "Esencia", operacion: "sólo las vocales", resultado: r.esencia.valor },
          { etiqueta: "Ego", operacion: "sólo las consonantes", resultado: r.ego.valor },
          { etiqueta: "Días de fuerza", operacion: cuentaDiasFuerza(r.valorNombre, r.diasFuerza.primeraSuma, r.diasFuerza.base), resultado: r.diasFuerza.dias.join(" · ") },
        ]}
        nota={`El valor del nombre sale del nombre solo, y es la esencia más el ego: ${r.esencia.valor} + ${r.ego.valor} = ${r.valorNombre}. De ahí salen los días de fuerza. El número de corazón necesita además la fecha, porque le suma la edad de cambio.`}
      />

      <article style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s3);")}>Tus días de fuerza</div>
        <div style={css("display:flex;gap:var(--s3);align-items:center;flex-wrap:wrap;")}>
          {r.diasFuerza.dias.map((n, i) => (
            <span
              key={i}
              style={css(
                "display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:52px;border-radius:50%;font-family:var(--font-ui);font-weight:600;font-size:" +
                  (i === 0 ? 26 : 20) +
                  "px;border:1px solid " +
                  (i === 0 ? "var(--gold)" : "var(--border-accent)") +
                  ";background:" +
                  (i === 0 ? "var(--border)" : "color-mix(in srgb, var(--text) 4%, transparent)") +
                  ";color:" +
                  (i === 0 ? "var(--text)" : "var(--text-3)") +
                  ";"
              )}
            >
              {n}
            </span>
          ))}
          <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.5;color:var(--text-3);margin:0 0 0 8px;flex:1;min-width:240px;")}>
            Van del más fuerte al menos fuerte. Aprovecha estos días del mes para firmas y decisiones relevantes.
          </p>
        </div>
      </article>
    </div>
  );
}
