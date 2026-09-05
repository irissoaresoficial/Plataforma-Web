"use client";
import { motion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipsDeFicha } from "@/lib/chips";
import { chipStyle, cuentaDiasFuerza, frase, titulo } from "@/lib/format";
import { esCifra, esVocal } from "@/lib/engine";
import { TARJETA, PAD, PAD_SM, rotulo, TITULO, LECTURA, APOYO, NOTA, RAYA, FILA_TITULO } from "@/lib/ui";
import { COL } from "@/lib/tree";
import Cifra from "../Cifra";
import Desglose from "../Desglose";

/**
 * El panel de un estudio de empresa.
 *
 * Una empresa se lee sólo de su nombre, así que aquí cabe todo en una pantalla:
 * el nombre letra a letra, sus tres números —valor, esencia y ego— con su
 * lectura, el camino de origen y los días de fuerza. No hay siete secciones
 * como en el estudio de una persona porque no hay fecha de la que sacarlas.
 */
export default function SeccionEmpresa() {
  const { re, setView, verNumero, verArcano } = useApp();
  if (!re) return null;

  const numeros = [
    { id: "valor", label: "Valor del nombre", o: re.valor, desc: "cómo vibra la empresa entera", destacado: true },
    { id: "esencia", label: "Número de esencia", o: re.esencia, desc: "lo que ha venido a ser, en las vocales" },
    { id: "ego", label: "Número de ego", o: re.ego, desc: "cómo la ven, en las consonantes" },
  ];

  const carta = re.origen.carta;

  return (
    <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
      <div>
        <h2 style={css("font-size:clamp(23px,3.4vw,30px);font-weight:700;letter-spacing:-.026em;color:var(--text);margin:0;text-wrap:balance;")}>
          Aquí tienes a {titulo(re.nombre.texto)}, Iris
        </h2>
        <p style={css(APOYO + "margin:var(--s2) 0 0;max-width:62ch;")}>
          De una empresa se lee el nombre y nada más: no hay fecha de nacimiento de la que sacar la estructura, los planos ni los
          ciclos. Esto es todo lo que el nombre dice por sí solo.
        </p>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:var(--gap);align-items:start;")}>
        {/* ------------------------------------------------ columna izquierda */}
        <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
          <section style={css(TARJETA + PAD)}>
            <div style={css(rotulo())}>Valor del nombre</div>
            <div style={css("margin-top:var(--s1);line-height:1.05;")}>
              <Cifra id="valor" valor={re.valor.valor} tam={50} />
            </div>
            <div style={css(APOYO + "margin-top:2px;")}>
              Esencia {re.esencia.valor} · Ego {re.ego.valor}
              {re.nombre.cifras ? ` · Cifras ${re.nombre.cifras}` : ""}
            </div>
            <button
              onClick={() => setView("estudio")}
              style={css(
                "width:100%;margin-top:var(--s5);padding:12px 18px;border:none;border-radius:980px;cursor:pointer;font-size:var(--t-body);font-weight:600;letter-spacing:-.01em;color:#fff;background:linear-gradient(180deg,#3A3244,#241F2E);box-shadow:0 1px 2px rgba(0,0,0,.14),0 8px 18px rgba(36,31,46,.24);"
              )}
            >
              Ver el estudio
            </button>

            {/* El camino de origen es el único de los tres que no necesita la
             * edad de cambio: sale del valor del nombre. */}
            <div style={css("margin-top:var(--s5);padding-top:var(--s4);" + RAYA)}>
              <div style={css(rotulo() + "margin-bottom:var(--s3);")}>Camino de origen</div>
              <button
                onClick={() => verArcano(re.origen.arcano)}
                style={css(
                  "display:block;width:100%;text-align:left;padding:var(--s4);border-radius:var(--r-sm);cursor:pointer;border:none;background:var(--surface-2);border-top:2px solid " +
                    COL.origen +
                    ";"
                )}
              >
                <div style={css("font-size:var(--t-mini);font-weight:590;color:" + COL.origen + ";")}>Arcano {re.origen.arcano}</div>
                <div style={css(TITULO + "margin-top:3px;")}>{titulo(carta?.nombre)}</div>
                {carta?.lema && <div style={css(NOTA + "margin-top:4px;line-height:1.35;")}>{frase(carta.lema)}</div>}
              </button>
            </div>
          </section>

          <section style={css(TARJETA + PAD_SM)}>
            <div style={css(rotulo() + "margin-bottom:var(--s3);")}>Días de fuerza</div>
            <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);")}>
              {re.diasFuerza.dias.map((d, i) => (
                <span
                  key={d}
                  style={css(
                    "display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;border-radius:50%;font-size:var(--t-read);font-weight:600;border:1px solid var(--border-accent);color:var(--text);background:" +
                      (i === 0 ? "var(--gold-soft)" : "transparent") +
                      ";"
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
            <p style={css(APOYO + "margin:var(--s3) 0 0;")}>
              Del más fuerte al menos fuerte. Son los días buenos para firmar, abrir y decidir.
            </p>
          </section>

          <section style={css(TARJETA + PAD_SM)}>
            <div style={css(FILA_TITULO + "margin-bottom:var(--s4);")}>
              <span style={css(TITULO)}>El nombre, letra a letra</span>
              <span style={css(NOTA + "margin-left:auto;")}>
                vocales en dorado{re.nombre.cifras ? ", cifras en morado" : ""}
              </span>
            </div>
            <div style={css("display:flex;flex-wrap:wrap;gap:var(--s4);")}>
              {re.nombre.palabras.map((w, wi) => (
                <div key={wi} style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
                  <div style={css("display:flex;flex-wrap:wrap;gap:4px;")}>
                    {w.letras.map((l, li) => (
                      <motion.div
                        key={li}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.28, delay: li * 0.015 }}
                        style={css(
                          "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:26px;padding:5px 4px;border-radius:var(--r-xs);border:1px solid " +
                            (esCifra(l.g) ? "var(--purple)" : esVocal(l.g) ? "var(--border-accent)" : "var(--border)") +
                            ";background:" +
                            (esCifra(l.g) ? "color-mix(in srgb, var(--purple) 12%, transparent)" : esVocal(l.g) ? "var(--gold-soft)" : "color-mix(in srgb, var(--text) 4%, transparent)") +
                            ";color:" +
                            (esCifra(l.g) ? "var(--purple)" : esVocal(l.g) ? "var(--gold-deep)" : "var(--text-3)") +
                            ";"
                        )}
                      >
                        <span style={css("font-size:var(--t-body);line-height:1;")}>{l.g}</span>
                        <span style={css("font-size:var(--t-micro);font-weight:590;opacity:.7;")}>{l.v}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div style={css(NOTA + "font-weight:590;")}>
                    {w.palabra} · {w.total}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Desglose
            titulo="De dónde salen estos números"
            pasos={[
              { etiqueta: "Valor del nombre", operacion: re.nombre.palabras.map((w) => w.total).join(" + "), resultado: re.valorNombre, final: true },
              { etiqueta: "Esencia", operacion: "sólo las vocales", resultado: re.esencia.valor },
              { etiqueta: "Ego", operacion: "sólo las consonantes", resultado: re.ego.valor },
              ...(re.nombre.cifras
                ? [{ etiqueta: "Cifras", operacion: "los números del nombre, por su valor", resultado: re.nombre.cifras }]
                : []),
              { etiqueta: "Camino de origen", operacion: `(${re.valorNombre} − ${re.origen.calculo.sumaCifras}) ÷ 9 + 1`, resultado: re.origen.arcano },
              { etiqueta: "Días de fuerza", operacion: cuentaDiasFuerza(re.valorNombre, re.diasFuerza.primeraSuma, re.diasFuerza.base), resultado: re.diasFuerza.dias.join(" · ") },
            ]}
          />
        </div>

        {/* --------------------------------------------------- columna derecha */}
        <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>

          {numeros.map((d) => {
            const chips = chipsDeFicha(d.o.ficha, verNumero).concat(
              d.o.ficha && d.o.ficha.enDiccionario
                ? [{ label: "Significado " + d.o.valor, style: chipStyle("var(--gold)"), onClick: () => verNumero(d.o.valor) }]
                : []
            );
            return (
              <article key={d.id} style={css(TARJETA + PAD_SM)}>
                <div style={css(FILA_TITULO)}>
                  <span style={css(rotulo())}>{d.label}</span>
                  <Cifra id={d.id} valor={d.o.valor} tam={36} />
                  <span style={css(APOYO)}>{d.desc}</span>
                </div>
                <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:var(--s4);margin-top:var(--s4);")}>
                  <div style={css("border-left:2px solid var(--red);padding:2px 0 2px 12px;")}>
                    <div style={css(rotulo("var(--red)") + "margin-bottom:4px;")}>En negativo</div>
                    <p style={css(LECTURA + "margin:0;")}>{d.o.lectura.negativo}</p>
                  </div>
                  <div style={css("border-left:2px solid var(--green);padding:2px 0 2px 12px;")}>
                    <div style={css(rotulo("var(--green)") + "margin-bottom:4px;")}>En positivo</div>
                    <p style={css(LECTURA + "margin:0;")}>{d.o.lectura.positivo}</p>
                  </div>
                </div>
                {chips.length > 0 && (
                  <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s4);")}>
                    {chips.map((c, ci) => (
                      <button key={ci} onClick={c.onClick} style={css(c.style)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}

        </div>
      </div>
    </div>
  );
}
