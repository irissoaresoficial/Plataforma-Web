"use client";
import { motion } from "framer-motion";
import { css } from "@/lib/css";
import Copia from "../Copia";
import { botonPrincipal } from "@/lib/ui";
import { useApp, valida } from "@/lib/app-context";
import { analizaNombre, esCifra, esVocal } from "@/lib/engine";
import Particulas from "../Particulas";

function saludo(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 14) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}

const TARJETA =
  "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--pad-card);";
const ROTULO = "font-size:var(--t-mini);font-weight:590;color:var(--gold);";

export default function ConsultaScreen() {
  const { f, set, calcular, hist, abrir, borrar } = useApp();

  const empresa = f.tipo === "empresa";
  // De una empresa se lee el nombre comercial entero; no tiene apellidos. Y si
  // lleva números —«Sabiduría 33»— también cuentan, cosa que en el nombre de
  // una persona no pasa.
  const n = analizaNombre((empresa ? [f.nombre] : [f.nombre, f.ap1, f.ap2]).filter(Boolean).join(" "), empresa);
  const err = valida(f);
  const listo = !err;

  const campo = (label: string, key: "nombre" | "ap1" | "ap2" | "dia" | "mes" | "anio", numeric?: boolean) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{label}</span>
      <input
        size={4}
        value={f[key]}
        onChange={(e) => set(key, numeric ? e.target.value.replace(/\D/g, "").slice(0, key === "anio" ? 4 : 2) : e.target.value)}
        inputMode={numeric ? "numeric" : undefined}
        style={css(
          "width:100%;min-width:0;background:color-mix(in srgb, var(--text) 6%, transparent);border:1px solid transparent;border-radius:var(--r-sm);padding:11px 14px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-read);"
        )}
      />
    </label>
  );

  // Sin cabecera arriba, la entrada se centra en la ventana: queda el
  // formulario y nada más, que es lo único que hay que hacer aquí.
  // Las fichas de letras se achican cuando el nombre es largo. Con un nombre
  // compuesto y dos apellidos salen cincuenta letras: a tamaño fijo no cabían
  // y las de los apellidos quedaban fuera sin que se notara.
  const totalLetras = n.palabras.reduce((s, w) => s + w.letras.length, 0);
  const fichas =
    totalLetras > 42
      ? { ancho: 21, pad: "4px 3px", letra: "var(--t-body)" }
      : totalLetras > 26
        ? { ancho: 24, pad: "5px 4px", letra: "var(--t-body)" }
        : { ancho: 28, pad: "6px 5px", letra: "var(--t-read)" };

  return (
    <main
      style={css(
        "position:relative;min-height:100vh;display:flex;flex-direction:column;max-width:1140px;margin:0 auto;padding:clamp(28px,4vh,56px) var(--gutter);"
      )}
    >
      {/* El polvo cubre la pantalla entera, no una tarjeta: es la puerta de
       * entrada al estudio y se lee mejor como atmósfera que como adorno. */}
      <div style={css("position:absolute;inset:0;z-index:0;pointer-events:none;")}>
        <Particulas cantidad={42} />
      </div>

      {/* margin:auto en vez de justify-content:center: si el contenido pasa
       * de la ventana, el centrado con flex recorta por arriba y se pierde la
       * marca; con margen automático se apoya arriba y baja. */}
      <div style={css("position:relative;z-index:1;margin:auto 0;width:100%;")}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          data-entrada-hero=""
          style={css("text-align:center;max-width:660px;margin:0 auto var(--s6);")}
        >
          {/* La marca en una sola línea: sin cabecera arriba hace falta, pero
           * apilada se comía la mitad de la pantalla y dejaba el formulario
           * por debajo del borde. */}
          <div data-entrada-marca="" style={css("display:inline-flex;align-items:center;gap:11px;margin-bottom:var(--s5);")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpeg"
              alt="Escuela de Sabiduría 33"
              style={css("width:42px;height:42px;flex:none;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px rgba(201,168,76,.4),0 0 24px var(--border-accent);")}
            />
            <div style={css("text-align:left;")}>
              <div style={css("font-family:var(--font-display);font-weight:500;font-size:var(--t-read);letter-spacing:-.008em;color:var(--text);line-height:1.15;")}>Escuela de Sabiduría 33</div>
              <div style={css("font-size:var(--t-mini);color:var(--text-4);margin-top:1px;")}>Kábala · Feng Shui · Numerología</div>
            </div>
          </div>
          <h1 style={css("font-size:clamp(28px,3.8vw,40px);line-height:1.08;letter-spacing:-.018em;color:var(--text);margin:0 0 var(--s3);")}>
            {empresa ? "¿Qué empresa estudiamos hoy?" : "¿A quién estudiamos hoy?"}
          </h1>
          <p style={css("font-size:var(--t-read);line-height:1.5;color:var(--text-3);margin:0 auto;max-width:56ch;")}>
            <span style={css("color:var(--gold);font-weight:590;")}>{saludo()}, Iris.</span>{" "}
            {empresa
              ? "Dime el nombre comercial completo y te dejo el estudio listo para imprimir. De una empresa se lee el nombre, nada más."
              : "Dime el nombre de la partida de nacimiento y la fecha exacta, y te dejo el estudio listo para imprimir."}
          </p>
        </motion.div>

        <div data-entrada="" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:var(--gap-lg);align-items:start;")}>
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:var(--r);padding:var(--pad-card);position:relative;"
            )}
          >
            {/* De quién es el estudio. Una empresa se lee igual que una
             * persona, pero su nombre completo es el nombre comercial y la
             * fecha es la de constitución. */}
            <div style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:980px;padding:3px;margin-bottom:var(--s4);")}>
              {([
                ["persona", "Persona"],
                ["empresa", "Nombre para empresas"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("tipo", k)}
                  style={css(
                    "flex:1;padding:8px 12px;border-radius:980px;border:none;cursor:pointer;font-size:var(--t-body);font-weight:590;white-space:nowrap;transition:all .2s;background:" +
                      (f.tipo === k ? "var(--surface-solid)" : "transparent") +
                      ";box-shadow:" +
                      (f.tipo === k ? "0 2px 6px rgba(0,0,0,.09)" : "none") +
                      ";color:" +
                      (f.tipo === k ? "var(--text)" : "var(--text-3)") +
                      ";"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={css(ROTULO + "margin-bottom:var(--s4);")}>{empresa ? "Datos de la empresa" : "Datos de nacimiento"}</div>

            <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
              {campo(empresa ? "Nombre de la empresa" : "Nombre", "nombre")}
              {!empresa && (
                <div style={css("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s3);")}>
                  {campo("Primer apellido", "ap1")}
                  {campo("Segundo apellido", "ap2")}
                </div>
              )}
              {/* La empresa se lee entera de su nombre: no se le pide fecha
               * porque no entra en ningún cálculo. */}
              {!empresa && (
                <div style={css("display:flex;flex-direction:column;gap:5px;")}>
                  <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Fecha de nacimiento</span>
                  <div style={css("display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s3);")}>
                    {campo("Día", "dia", true)}
                    {campo("Mes", "mes", true)}
                    {campo("Año", "anio", true)}
                  </div>
                </div>
              )}
              {empresa && (
                <p style={css("margin:0;font-size:var(--t-body);line-height:1.5;color:var(--text-4);border-left:2px solid var(--border-accent);padding-left:var(--s3);")}>
                  El estudio de empresa se lee entero del nombre: su valor, la esencia, el ego, el camino de origen y los días de fuerza. No se pide fecha porque no interviene.
                </p>
              )}

              {/* El estudio se dirige a la persona en segunda persona —
               * «bienvenida», «fuiste nombrada» — así que necesita saber cómo
               * tratarla. No entra en ningún cálculo. Una empresa va siempre
               * en neutro, así que no se pregunta. */}
              <div style={css("display:" + (empresa ? "none" : "flex") + ";align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
                <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Se dirige a</span>
                <div style={css("margin-left:auto;display:flex;gap:2px;background:color-mix(in srgb, var(--text) 6%, transparent);border-radius:980px;padding:3px;width:fit-content;max-width:100%;")}>
                  {([
                    ["f", "Ella"],
                    ["m", "Él"],
                    ["n", "Neutro"],
                  ] as const).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set("genero", k)}
                      style={css(
                        "flex:none;padding:6px 15px;border-radius:980px;border:none;cursor:pointer;font-size:var(--t-body);font-weight:590;white-space:nowrap;transition:all .2s;background:" +
                          (f.genero === k ? "var(--surface-solid)" : "transparent") +
                          ";box-shadow:" +
                          (f.genero === k ? "0 2px 6px rgba(0,0,0,.09)" : "none") +
                          ";color:" +
                          (f.genero === k ? "var(--text)" : "var(--text-3)") +
                          ";"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              onClick={calcular}
              disabled={!listo}
              whileTap={listo ? { scale: 0.98 } : undefined}
              style={css(
botonPrincipal(listo) + "width:100%;margin-top:var(--s5);"
              )}
            >
              Generar el estudio
            </motion.button>
            <p style={css("margin:var(--s3) 0 0;font-size:var(--t-mini);color:var(--text-4);line-height:1.45;text-align:center;")}>
              {err ||
                (empresa
                  ? "Se usa la razón social tal y como está registrada."
                  : "Se usa el nombre inscrito en el Registro Civil, sin diminutivos.")}
            </p>
          </motion.section>

          <div data-entrada-lado="" data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
            <div style={css(TARJETA)}>
              <div style={css(ROTULO + "margin-bottom:var(--s4);")}>Valor del nombre</div>
              {n.palabras.length === 0 ? (
                <p style={css("font-size:var(--t-body);line-height:1.55;color:var(--text-4);margin:0;")}>
                  Cada letra tiene su valor. En cuanto escribas el nombre verás aquí el desglose letra a letra.
                </p>
              ) : (
                <div
                  data-letras=""
                  style={css("display:flex;flex-wrap:wrap;gap:var(--s4);min-height:0;overflow-y:auto;scrollbar-width:none;")}
                >
                  {n.palabras.map((w, wi) => (
                    <div key={wi} style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
                      <div style={css("display:flex;flex-wrap:wrap;gap:4px;")}>
                        {w.letras.map((l, li) => (
                          <motion.div
                            key={li}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.28, delay: li * 0.015 }}
                            style={css(
                              "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:" +
                                fichas.ancho +
                                "px;padding:" +
                                fichas.pad +
                                ";border-radius:var(--r-xs);border:1px solid " +
                                (esCifra(l.g) ? "var(--purple)" : esVocal(l.g) ? "var(--border-accent)" : "var(--border)") +
                                ";background:" +
                                (esCifra(l.g) ? "color-mix(in srgb, var(--purple) 12%, transparent)" : esVocal(l.g) ? "var(--gold-soft)" : "color-mix(in srgb, var(--text) 4%, transparent)") +
                                ";color:" +
                                (esCifra(l.g) ? "var(--purple)" : esVocal(l.g) ? "var(--gold-deep)" : "var(--text-3)") +
                                ";"
                            )}
                          >
                            <span style={css("font-size:" + fichas.letra + ";line-height:1;")}>{l.g}</span>
                            <span style={css("font-size:var(--t-micro);font-weight:590;opacity:.7;")}>{l.v}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-4);")}>
                        {w.palabra} · {w.total}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={css("display:flex;align-items:baseline;gap:var(--s3);border-top:1px solid var(--border);margin-top:var(--s5);padding-top:var(--s4);")}>
                <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Valor del nombre</span>
                <span data-cifras="" style={css("font-weight:600;font-size:var(--t-hero);color:var(--gold);line-height:1;margin-left:auto;letter-spacing:-.028em;")}>{n.total || 0}</span>
              </div>
              <div style={css("display:flex;gap:var(--s6);margin-top:var(--s3);")}>
                {[
                  { l: "Esencia", v: n.esencia },
                  { l: "Ego", v: n.ego },
                  ...(n.cifras ? [{ l: "Cifras", v: n.cifras }] : []),
                ].map((x) => (
                  <div key={x.l} style={css("display:flex;flex-direction:column;gap:2px;")}>
                    <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-4);")}>{x.l}</span>
                    <span data-cifras="" style={css("font-weight:600;font-size:var(--t-title);color:var(--text-3);")}>{x.v || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={css(TARJETA)}>
              <div style={css(ROTULO + "margin-bottom:var(--s4);")}>Estudios guardados</div>
              {hist.length === 0 ? (
                <p style={css("font-size:var(--t-body);line-height:1.55;color:var(--text-4);margin:0;")}>Todavía no hay estudios guardados. Los que generes se quedan aquí, en este equipo.</p>
              ) : (
                <div style={css("display:flex;flex-direction:column;gap:var(--s2);max-height:320px;overflow-y:auto;")}>
                  {hist.map((h) => (
                    <div
                      key={h.id}
                      data-alza=""
                      style={css("display:flex;align-items:center;gap:var(--s3);padding:11px 13px;border:1px solid var(--border);border-radius:var(--r-sm);background:color-mix(in srgb, var(--text) 4%, transparent);")}
                    >
                      <button onClick={() => abrir(h)} style={css("flex:1;min-width:0;text-align:left;background:none;border:none;padding:0;cursor:pointer;color:var(--text);")}>
                        <div style={css("font-size:var(--t-read);line-height:1.25;color:var(--text);overflow-wrap:anywhere;")}>{h.nombre}</div>
                        <div style={css("font-size:var(--t-mini);color:var(--text-4);margin-top:2px;")}>
                          {h.f.tipo === "empresa" ? `Empresa · valor del nombre ${h.corazon}` : `${h.fecha} · corazón ${h.corazon}`}
                        </div>
                      </button>
                      <button
                        onClick={() => borrar(h)}
                        title="Eliminar"
                        style={css("flex:none;background:none;border:1px solid var(--red-border);color:var(--red);border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:var(--t-body);line-height:1;")}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Copia />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
