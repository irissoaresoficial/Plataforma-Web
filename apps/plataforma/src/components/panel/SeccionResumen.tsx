"use client";
import { css } from "@/lib/css";
import { BOTON_NORMAL } from "@/lib/ui";
import { useApp } from "@/lib/app-context";
import { COL } from "@/lib/tree";
import { frase, recorta, titulo } from "@/lib/format";
import Cifra from "../Cifra";
import ArbolVida from "../ArbolVida";

const TARJETA = "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);";
const ROTULO = "font-size:var(--t-mini);font-weight:590;color:var(--text-3);";


/**
 * Portada del panel: un vistazo a todo el estudio antes de entrar en cada
 * sección. Cada pieza es un atajo — al pulsarla se abre la sección de la que
 * salen esos números.
 */
export default function SeccionResumen() {
  const { r, setSeccion, setView, verNumero, verArcano } = useApp();
  if (!r) return null;

  const c = r.ciclos;
  const nombreCorto = titulo(r.nombre.texto).split(" ")[0];

  const caminos = [
    { k: "origen" as const, etapa: "Origen", d: r.caminos.origen, rango: `0 – ${r.caminos.edadCambio} años` },
    { k: "transformacion" as const, etapa: "Transformación", d: r.caminos.transformacion, rango: "toda la vida" },
    { k: "destino" as const, etapa: "Destino", d: r.caminos.destino, rango: `desde los ${r.turbulencias ? r.caminos.edadCambio + 10 : r.caminos.edadCambio} años` },
  ];

  // Los números que resumen la lectura. El primero va destacado, como la cifra
  // principal de un cuadro de mandos. La edad de cambio estaba sólo en la tira
  // de la cabecera —que no sale en el resumen— y es de lo primero que se mira:
  // marca cuándo se pasa del camino de origen al de destino.
  const cifras = [
    { label: "Número de esencia", valor: r.esencia.valor, pie: "Lo que has venido a ser", n: r.esencia.valor, destacada: true },
    { label: "Número de ego", valor: r.ego.valor, pie: "Cómo te ven los demás", n: r.ego.valor },
    { label: "Edad de cambio", valor: r.caminos.edadCambio, pie: "Cuándo entras en tu destino", ir: "arbol" as const },
    { label: "Lema de vida", valor: r.cuentas.lemaDeVida, pie: "La vibración de tu propósito", ir: "cuentas" as const },
    { label: "Estructura energética", valor: r.estructura.tipo, pie: `${r.aprendizajes.length} aprendizajes abiertos`, ir: "estructura" as const },
    { label: "Imagen del alma", valor: r.imagenAlma.numero, pie: `${r.bloqueos.length} bloqueos en los planos`, ir: "alma" as const },
  ];

  // Posición dentro del ciclo vital en curso: la misma idea que una barra de
  // consumo, pero medida en años vividos de esa etapa.
  const cicloActual = c.ciclos.find((x) => c.edad >= x.desde && (x.hasta === null || c.edad <= x.hasta)) || c.ciclos[c.ciclos.length - 1];
  const finCiclo = cicloActual.hasta ?? cicloActual.desde + 27;
  const avance = Math.min(100, Math.max(0, ((c.edad - cicloActual.desde) / (finCiclo - cicloActual.desde)) * 100));

  const maxEtapa = 9;

  return (
    <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
      <div>
        <h2 style={css("font-size:clamp(23px,3.4vw,30px);font-weight:700;letter-spacing:-.026em;color:var(--text);margin:0;text-wrap:balance;")}>
          Aquí tienes a {nombreCorto}, Iris
        </h2>
        <p style={css("font-size:var(--t-read);line-height:1.5;color:var(--text-3);margin:var(--s2) 0 0;max-width:62ch;text-wrap:pretty;")}>
          Todo el estudio de un vistazo. Pulsa cualquier bloque para abrirlo entero, y cualquier número para corregirlo si en esta carta lo lees distinto.
        </p>
      </div>

      {/* Aquí las dos columnas son tarjetas del mismo peso, no un cuadro y su
       * lectura: se reparten a partes iguales. */}
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:var(--gap);align-items:start;")}>
        {/* ------------------------------------------------ columna izquierda */}
        <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
          {/* El polvo dorado se queda para los dibujos y la pantalla de
           * entrada. Detrás de un texto no se lee como polvo: se lee como
           * suciedad en la tarjeta. */}
          <section style={css(TARJETA + "padding:var(--pad-card);")}>
            <div>
            <div style={css(ROTULO)}>Número de corazón</div>
            <div style={css("margin-top:var(--s1);line-height:1.05;")}>
              <Cifra id="corazon" valor={r.corazon.valor} tam={50} />
            </div>
            <div style={css("font-size:var(--t-body);color:var(--text-3);margin-top:2px;")}>
              Esencia {r.esencia.valor} · Ego {r.ego.valor}
            </div>
            <div style={css("display:flex;gap:var(--s2);margin-top:var(--s5);flex-wrap:wrap;")}>
              <button
                onClick={() => setView("estudio")}
                style={css("flex:1;min-width:130px;padding:12px 18px;border:none;border-radius:980px;cursor:pointer;font-size:var(--t-body);font-weight:600;letter-spacing:-.01em;color:#fff;background:linear-gradient(180deg,#3A3244,#241F2E);box-shadow:0 1px 2px rgba(0,0,0,.14),0 8px 18px rgba(36,31,46,.24);")}
              >
                Ver el estudio
              </button>
              <button
                onClick={() => setView("pareja")}
                style={css("flex:1;min-width:130px;padding:12px 18px;border:1px solid var(--border-strong);border-radius:980px;cursor:pointer;font-size:var(--t-body);font-weight:590;letter-spacing:-.01em;color:var(--text-2);background:color-mix(in srgb, var(--surface-solid) 70%, transparent);")}
              >
                Comparar pareja
              </button>
            </div>

            <div style={css("margin-top:var(--s5);padding-top:var(--s4);border-top:1px solid var(--border);")}>
              <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:var(--s3);")}>
                <span style={css(ROTULO)}>Tus tres caminos</span>
                {/* Los tres rangos se miden desde aquí: sin este número las
                 * tres cartas no dicen cuándo empieza cada una. */}
                <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-4);")}>
                  edad de cambio · <span style={css("font-weight:600;color:var(--gold);")}>{r.caminos.edadCambio}</span>
                </span>
              </div>
              <div data-cascada="" style={css("display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s2);")}>
                {caminos.map((x) => (
                  <button
                    key={x.k}
                    data-alza=""
                    onClick={() => verArcano(x.d.arcano)}
                    style={css(
                      "text-align:left;padding:var(--s3);border-radius:var(--r-sm);cursor:pointer;border:none;background:var(--surface-2);border-top:2px solid " +
                        COL[x.k] +
                        ";"
                    )}
                  >
                    <div style={css("font-size:var(--t-mini);font-weight:590;color:" + COL[x.k] + ";")}>{x.etapa}</div>
                    <div style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.1;margin-top:3px;")}>{x.d.arcano}</div>
                    <div style={css("font-size:var(--t-mini);color:var(--text-4);margin-top:2px;line-height:1.25;")}>{recorta(titulo(x.d.carta?.nombre), 18)}</div>
                  </button>
                ))}
              </div>
            </div>
            </div>
          </section>

          <section style={css(TARJETA + "padding:var(--pad-card-sm);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);")}>
              <span style={css(ROTULO)}>Ciclo vital en curso</span>
              <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-4);")}>{c.edad} años</span>
            </div>
            <div style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);margin-top:6px;")}>
              {cicloActual.nombre} · {cicloActual.numero}
            </div>
            <div style={css("height:9px;border-radius:980px;background:color-mix(in srgb, var(--text) 10%, transparent);overflow:hidden;margin-top:var(--s3);")}>
              <div style={css("height:100%;width:" + avance.toFixed(1) + "%;border-radius:980px;background:linear-gradient(90deg,#C9A84C,#9A7B2E);")} />
            </div>
            <div style={css("display:flex;justify-content:space-between;font-size:var(--t-mini);color:var(--text-4);margin-top:7px;")}>
              <span>{cicloActual.desde} años</span>
              <span>{cicloActual.hasta === null ? "en adelante" : cicloActual.hasta + " años"}</span>
            </div>
            <button
              onClick={() => setSeccion("ciclos")}
              style={css(BOTON_NORMAL + "margin-top:var(--s4);")}
            >
              Ver ciclos vitales
            </button>
          </section>

          <section style={css(TARJETA + "padding:var(--pad-card-sm);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:4px;")}>
              <span style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);")}>Aprendizajes abiertos</span>
              <button
                onClick={() => setSeccion("estructura")}
                style={css("margin-left:auto;background:none;border:none;padding:0;cursor:pointer;font-size:var(--t-body);font-weight:590;color:var(--gold);")}
              >
                Ver todos
              </button>
            </div>
            {r.aprendizajes.length === 0 && <p style={css("font-size:var(--t-body);color:var(--text-4);margin:8px 0 0;")}>No hay portales con aprendizaje en esta estructura.</p>}
            {r.aprendizajes.slice(0, 5).map((a, i) => (
              <button
                key={i}
                onClick={() => setSeccion("estructura")}
                style={css("display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:11px 0;border:none;border-top:1px solid var(--border);background:none;cursor:pointer;")}
              >
                <span style={css("flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:var(--gold-soft);color:var(--gold-deep);font-size:var(--t-body);font-weight:600;")}>{a.portal}</span>
                <span style={css("flex:1;min-width:0;")}>
                  <span style={css("display:block;font-size:var(--t-body);font-weight:590;color:var(--text);line-height:1.25;")}>{frase(a.tarea?.nombre) || "Portal " + a.portal}</span>
                  <span style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:1px;")}>viene del número {a.numero}</span>
                </span>
                <span style={css("flex:none;font-size:var(--t-mini);font-weight:590;color:var(--gold);")}>Portal {a.portal}</span>
              </button>
            ))}
          </section>
        </div>

        {/* --------------------------------------------------- columna derecha */}
        <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
          <div data-cascada="" style={css("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s4);")}>
            {cifras.map((x, i) => (
              <button
                key={i}
                data-alza=""
                onClick={() => (x.ir ? setSeccion(x.ir) : verNumero(x.n!))}
                style={css(
                  "text-align:left;padding:17px 18px;cursor:pointer;border-radius:var(--r);" +
                    (x.destacada
                      ? "border:1px solid var(--gold-deep);color:var(--sobre-oro);background:var(--gold-deep);"
                      : TARJETA)
                )}
              >
                <div style={css("font-size:var(--t-mini);font-weight:590;color:" + (x.destacada ? "color-mix(in srgb, var(--sobre-oro) 82%, transparent)" : "var(--text-3)") + ";")}>{x.label}</div>
                <div style={css("font-size:var(--t-hero);font-weight:700;letter-spacing:-.028em;line-height:1.1;margin-top:6px;color:" + (x.destacada ? "var(--sobre-oro)" : "var(--text)") + ";")}>{x.valor}</div>
                <div style={css("font-size:var(--t-mini);margin-top:3px;line-height:1.3;color:" + (x.destacada ? "color-mix(in srgb, var(--sobre-oro) 72%, transparent)" : "var(--text-4)") + ";")}>{x.pie}</div>
              </button>
            ))}
          </div>

          <section style={css(TARJETA + "padding:var(--pad-card-sm);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
              <div>
                <div style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);")}>Año personal {c.anioPersonal}</div>
                <div style={css("font-size:var(--t-body);color:var(--text-3);margin-top:2px;")}>Dónde estás dentro de la rueda de nueve años</div>
              </div>
              <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:var(--gold);background:var(--gold-soft);border-radius:980px;padding:5px 12px;")}>Etapa {c.etapaActual}</span>
            </div>

            {/* Rueda de nueve años: la barra encendida es el año en curso. */}
            <div style={css("display:grid;grid-template-columns:repeat(9,1fr);gap:clamp(4px,1vw,9px);align-items:end;height:130px;margin-top:20px;")}>
              {Array.from({ length: maxEtapa }, (_, i) => i + 1).map((n) => {
                const on = n === c.anioPersonal;
                return (
                  <div key={n} style={css("display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end;")}>
                    <div
                      style={css(
                        "width:100%;border-radius:7px 7px 3px 3px;height:" +
                          Math.round(28 + (n / maxEtapa) * 72) +
                          "%;background:" +
                          (on ? "linear-gradient(180deg,#C9A84C,#8A6A1B)" : "color-mix(in srgb, var(--text) 10%, transparent)") +
                          ";"
                      )}
                    />
                    <span style={css("font-size:var(--t-mini);font-weight:590;color:" + (on ? "var(--gold-deep)" : "var(--text-4)") + ";")}>{n}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* El mismo árbol que en su sección — con nombres, complementarios y
           * animación — sólo que más contenido de alto para que no estire la
           * columna. Va a la derecha porque es la tarjeta más alta de las dos
           * columnas y aquí compensa el bloque de cifras y la rueda. */}
          <section style={css(TARJETA + "padding:var(--pad-card-sm);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);margin-bottom:6px;")}>
              <span style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);")}>Árbol de la Vida</span>
              <button
                onClick={() => setSeccion("arbol")}
                style={css("margin-left:auto;background:none;border:none;padding:0;cursor:pointer;font-size:var(--t-body);font-weight:590;color:var(--gold);")}
              >
                Abrir
              </button>
            </div>
            <ArbolVida r={r} estilo="width:100%;max-width:390px;height:auto;display:block;margin:6px auto 0;" />
          </section>
        </div>
      </div>
    </div>
  );
}
