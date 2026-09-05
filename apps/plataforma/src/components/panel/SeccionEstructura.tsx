"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipsDeFicha } from "@/lib/chips";
import { tarjetaCon, PAD_SM } from "@/lib/ui";
import EjesTension from "./EjesTension";
import { chipStyle, recorta } from "@/lib/format";
import CuerpoPortales from "../CuerpoPortales";
import Desglose, { type Paso } from "../Desglose";
import Carrusel from "../Carrusel";
import { PORTALES_CUERPO } from "@/lib/cuerpo";
import { KDATA, TENSIONES, type TensionEntry } from "@/lib/kdata";

/** Dónde cae cada portal sobre el cuerpo, según los apuntes (§ pág. 127). */
const LUGAR: Record<number, string> = {
  1: "Cabeza, delante · tercer ojo",
  2: "Corona",
  3: "Cabeza, detrás · nuca",
  4: "Garganta, detrás",
  5: "Pecho, detrás",
  6: "Vientre, detrás",
  7: "Raíz",
  8: "Vientre, delante",
  9: "Pecho, delante",
  10: "Garganta, delante",
};

export default function SeccionEstructura() {
  const { r, verNumero, verTexto } = useApp();
  if (!r) return null;
  const est = r.estructura;
  const fc = est.fechaConvertida;

  // Sobre la figura conviven cuatro anotaciones distintas — las mismas que
  // Iris escribe a mano en la ficha — y sin esta leyenda no hay forma de
  // saber cuál es cuál.
  const LEYENDA: Array<{ muestra: React.ReactNode; titulo: string; texto: string }> = [
    {
      muestra: (
        <span style={css("display:inline-flex;align-items:baseline;justify-content:center;width:40px;")}>
          <span style={css("font-size:var(--t-head);font-weight:700;color:var(--text);letter-spacing:-.02em;")}>7</span>
          <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--red);margin-left:1px;")}>{est.tipo}</span>
        </span>
      ),
      titulo: "Número grande y subíndice rojo",
      texto: `El grande es el portal, que está siempre en el mismo sitio del cuerpo — el décimo se rotula 0. El rojo es su número dinámico, que sí cambia de una persona a otra: el portal 1 recibe el tipo de estructura (${est.tipo}) y de ahí la cuenta sigue de uno en uno.`,
    },
    {
      muestra: (
        <span style={css("display:inline-flex;align-items:center;justify-content:center;width:40px;")}>
          <span style={css("display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:26px;padding:0 7px;border-radius:7px;background:var(--surface-solid);border:2.2px solid #2C5D9E;font-size:var(--t-body);font-weight:700;color:#2C5D9E;")}>
            {String(est.dinamicos[1]).repeat(2)}
          </span>
        </span>
      ),
      titulo: "Recuadro azul · el aprendizaje",
      texto: "La cifra de la fecha de nacimiento transformada que coincide con el dinámico de ese portal. Va escrita tantas veces como aparezca en la fecha: dos veces, aprendizaje doble.",
    },
    {
      muestra: (
        <span style={css("display:inline-flex;align-items:center;justify-content:center;width:40px;")}>
          <span style={css("width:26px;height:3.4px;border-radius:2px;background:#4C9A5A;opacity:.85;")} />
        </span>
      ),
      titulo: "Subrayado verde · maestría",
      texto: "El portal no tiene aprendizaje: viene resuelto de otras vidas y sostiene el trabajo de los demás.",
    },
    {
      muestra: (
        <span style={css("display:inline-flex;align-items:center;justify-content:center;width:40px;")}>
          <span style={css("width:28px;height:13px;background:linear-gradient(90deg,var(--gold),transparent);border-radius:2px;")} />
        </span>
      ),
      titulo: "Conos laterales · los chakras",
      texto: "Los vórtices que absorben y expulsan energía cósmica. La corona se abre hacia arriba y la raíz hacia abajo.",
    },
  ];

  // Cómo se llega al tipo de estructura, paso a paso.
  const cifras = (s: string) => s.split("").join("+");
  const pasosCalculo: Paso[] = [
    { etiqueta: "Fecha", operacion: `${r.fecha.dia} / ${r.fecha.mes} / ${r.fecha.anio}` },
    { etiqueta: "Se transforma", operacion: "0→7 · 1→6 · 2→5", resultado: `${fc.dia} / ${fc.mes} / ${fc.anio}` },
    { etiqueta: "Suma de cifras", operacion: `${cifras(fc.dia)} + ${cifras(fc.mes)} + ${cifras(fc.anio)}`, resultado: est.suma },
    { etiqueta: "Se reduce", operacion: est.pasos.join(" → "), resultado: est.tipo, final: true },
  ];

  // Cada eje/plano se acompaña de su explicación del manual (§20 y §21).
  const tensiones = ([] as Array<{ nombre: string; a: number; b: number; activo: boolean; tipo: string; info?: TensionEntry }>)
    .concat(r.ejes.map((e) => ({ nombre: e.eje.nombre, a: e.eje.a, b: e.eje.b, activo: e.activo, tipo: "Eje", info: TENSIONES.ejes[`${e.eje.a}-${e.eje.b}`] })))
    .concat(r.planosTension.map((p) => ({ nombre: p.plano.nombre, a: p.plano.a, b: p.plano.b, activo: p.activo, tipo: "Plano", info: TENSIONES.planos[`${p.plano.a}-${p.plano.b}`] })));

  // Somatizaciones de los portales con aprendizaje: van aquí, junto a la
  // estructura, porque es la energía de esos portales la que se somatiza.
  const enfermedades = r.aprendizajes
    .map((a) => ({ a, enf: a.enfermedades }))
    .filter((x): x is { a: (typeof r.aprendizajes)[number]; enf: NonNullable<(typeof r.aprendizajes)[number]["enfermedades"]> } =>
      !!x.enf && !!(x.enf.psico || x.enf.nota)
    );

  const aprendizajes = r.aprendizajes.map((a, ai) => ({
    a,
    ai,
    card:
      tarjetaCon("var(--gold)") + PAD_SM + "opacity:0;animation:es33-rise .55s cubic-bezier(.22,1,.36,1) forwards;animation-delay:" +
      (0.18 + ai * 0.13).toFixed(2) +
      "s;",
    chips: [{ label: "Número " + a.numero, style: chipStyle("var(--gold)"), onClick: () => verNumero(a.numero) }]
      .concat(chipsDeFicha(a.ficha, verNumero))
      .concat([
        {
          label: "Tarea completa",
          style: chipStyle("var(--text-3)"),
          onClick: () =>
            verTexto(
              "Aprendizaje " + a.portal,
              a.tarea?.nombre || "",
              "Tarea número " + a.portal,
              (a.tarea?.texto || "") + "\n\nHilo rojo: " + (a.tarea?.hiloRojo || "") + "\n\nNeurosis: " + (a.tarea?.neurosis || "") + "\n\nPrincipio sanador: " + (a.tarea?.sanador || "")
            ),
        },
      ]),
  }));

  return (
    <div data-dos="ancho">
      <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
        <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;margin-bottom:var(--s3);")}>
            <span style={css("font-weight:590;font-size:var(--t-mini);color:var(--text-3);")}>Estructura energética</span>
            <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-head);color:var(--gold);line-height:1;")}>tipo {est.tipo}</span>
          </div>
          <CuerpoPortales r={r} />

          {/* Qué es cada número del dibujo. Sobre la figura conviven cuatro
           * cosas distintas y sin esto no hay forma de saber cuál es cuál. */}
          <div style={css("margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--border);")}>
            <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s3);")}>Qué significa cada número del dibujo</div>
            <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
              {LEYENDA.map((l, i) => (
                <div key={i} style={css("display:grid;grid-template-columns:38px 1fr;gap:var(--s3);align-items:start;")}>
                  <span style={css("justify-self:center;margin-top:2px;")}>{l.muestra}</span>
                  <span style={css("min-width:0;")}>
                    <span style={css("display:block;font-size:var(--t-body);font-weight:590;color:var(--text);line-height:1.3;")}>{l.titulo}</span>
                    <span style={css("display:block;font-size:var(--t-body);color:var(--text-3);line-height:1.45;margin-top:2px;text-wrap:pretty;")}>{l.texto}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Desglose
          titulo="De dónde sale la estructura"
          pasos={pasosCalculo}
          nota={`El portal 1 recibe el propio tipo (${est.tipo}) y a partir de ahí la cuenta sigue de uno en uno por los diez portales hasta cerrar el círculo: ese es el número dinámico de cada portal.`}
        />

        <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <Carrusel titulo="Los diez portales" ancho={228}>
            {PORTALES_CUERPO.slice()
              .sort((a, b) => a.portal - b.portal)
              .map((p) => {
                const veces = est.aprendizajes[p.portal] || 0;
                const escudo = !!est.escudos[p.portal];
                const tarea = KDATA.tareas?.[p.portal];
                return (
                  <button
                    key={p.portal}
                    data-alza=""
                    onClick={() =>
                      verTexto(
                        "Portal " + p.etiqueta,
                        tarea?.nombre || "Portal " + p.etiqueta,
                        LUGAR[p.portal],
                        (tarea?.texto || "") +
                          (tarea?.hiloRojo ? "\n\nHilo rojo: " + tarea.hiloRojo : "") +
                          (tarea?.neurosis ? "\n\nNeurosis: " + tarea.neurosis : "") +
                          (tarea?.sanador ? "\n\nPrincipio sanador: " + tarea.sanador : "")
                      )
                    }
                    style={css(
                      "display:flex;flex-direction:column;gap:var(--s2);align-items:flex-start;text-align:left;width:100%;height:100%;padding:var(--s4);border-radius:var(--r);cursor:pointer;border:1px solid " +
                        (veces ? "var(--border-accent)" : "var(--border)") +
                        ";background:" +
                        (veces ? "var(--gold-soft)" : "var(--surface)") +
                        ";"
                    )}
                  >
                    <span style={css("display:flex;align-items:center;gap:var(--s2);width:100%;")}>
                      <span
                        style={css(
                          "flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;font-size:var(--t-body);font-weight:700;background:" +
                            (veces ? "#E5B63C" : "color-mix(in srgb, var(--text) 5%, transparent)") +
                            ";color:" +
                            (veces ? "#241F2E" : "var(--text-3)") +
                            ";border:" +
                            (escudo ? "2.5px solid var(--blue)" : "1px solid var(--border)") +
                            ";"
                        )}
                      >
                        {p.etiqueta}
                      </span>
                      <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:" + (veces ? "var(--gold-deep)" : "var(--green)") + ";white-space:nowrap;")}>
                        {veces ? "Aprendizaje" + (veces > 1 ? " ×" + veces : "") : "Maestría"}
                      </span>
                    </span>
                    <span style={css("font-size:var(--t-body);font-weight:590;color:var(--text);line-height:1.3;")}>{tarea?.nombre || "—"}</span>
                    <span style={css("font-size:var(--t-mini);color:var(--text-4);line-height:1.35;")}>
                      {LUGAR[p.portal]} · dinámico <span style={css("color:var(--red);font-weight:590;")}>{est.dinamicos[p.portal]}</span>
                      {escudo ? " · escudo" : ""}
                    </span>
                  </button>
                );
              })}
          </Carrusel>
          <p style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-4);margin:var(--s3) 0 0;text-wrap:pretty;")}>
            Los portales sin aprendizaje son maestrías: vienen resueltos y sostienen el trabajo de los demás. Pulsa cualquiera para leer su texto completo.
          </p>
        </div>

        <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <div style={css("font-weight:590;font-size:var(--t-mini);color:var(--text-3);margin-bottom:var(--s2);")}>Ejes y planos en tensión</div>
          <p style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-4);margin:0 0 var(--s4);")}>{TENSIONES.intro.ejes}</p>

          {/* La escalera E/M de la hoja, que hasta ahora sólo estaba como
           * lista: puestos los diez portales en su sitio, cada eje es una
           * línea que cruza de un lado al otro. */}
          <div style={css("padding-bottom:var(--s4);margin-bottom:var(--s4);border-bottom:1px solid var(--border);")}>
            <EjesTension r={r} />
          </div>
          <div style={css("display:flex;flex-direction:column;gap:7px;")}>
            {tensiones.map((t, idx) => (
              <button
                key={idx}
                onClick={() => t.info && verTexto(t.tipo + " " + t.a + "–" + t.b, t.info.nombre, t.activo ? "En tensión" : "Libre", t.info.texto + (t.info.tension ? "\n\nSe tensa en: " + t.info.tension : ""))}
                style={css(
                  "display:block;width:100%;text-align:left;font:inherit;cursor:pointer;" +
                    "padding:11px 13px 12px;border-radius:var(--r-sm);background:var(--surface-2);border:none;border-left:2px solid " +
                    (t.activo ? "var(--red)" : "transparent") +
                    ";"
                )}
              >
                <div style={css("display:flex;align-items:baseline;gap:var(--s2);flex-wrap:wrap;font-size:var(--t-mini);color:" + (t.activo ? "var(--red)" : "var(--text-3)") + ";")}>
                  <span>
                    {t.tipo} {t.a}–{t.b} · {t.info?.nombre || t.nombre}
                  </span>
                  <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:" + (t.activo ? "var(--red)" : "var(--text-4)") + ";")}>
                    {t.activo ? "en tensión" : "libre"}
                  </span>
                </div>
                {t.info && (
                  <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.55;color:var(--text-2);margin:7px 0 0;text-wrap:pretty;")}>
                    {recorta(t.info.texto, 300)}
                  </p>
                )}
                {t.info?.tension && (
                  <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--red);margin-top:6px;")}>Se tensa en: {t.info.tension}</div>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
        <article style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s3);")}>Estructura número {est.tipo}</div>
          <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:0;text-wrap:pretty;")}>{r.tipoEstructura?.texto || ""}</p>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--s4);margin-top:var(--s4);")}>
            <div style={css("border-left:2px solid var(--red);padding-left:12px;")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--red);margin-bottom:4px;")}>Vivido en negativo</div>
              <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{r.tipoEstructura?.negativo || ""}</p>
            </div>
            <div style={css("border-left:2px solid var(--green);padding-left:12px;")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--green);margin-bottom:4px;")}>Vivido en positivo</div>
              <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{r.tipoEstructura?.positivo || ""}</p>
            </div>
          </div>
        </article>
        {aprendizajes.map(({ a, ai, card, chips }) => (
          <article key={ai} style={css(card)}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
              <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>
                Aprendizaje {a.portal}
                {a.veces > 1 ? " · ×" + a.veces : ""}
              </span>
              <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text);")}>{a.tarea?.nombre || ""}</span>
              <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>viene del número {a.numero}</span>
            </div>
            <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.6;color:var(--text-2);margin:12px 0 0;text-wrap:pretty;")}>{recorta(a.tarea?.texto || "", 460)}</p>
            <div style={css("display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s4);")}>
              {chips.map((c, ci) => (
                <button key={ci} onClick={c.onClick} style={css(c.style)}>
                  {c.label}
                </button>
              ))}
            </div>
            <div style={css("margin-top:var(--s4);border-top:1px solid var(--border);padding-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:var(--s3);")}>
              <div>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:3px;")}>Hilo rojo</div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{recorta(a.tarea?.hiloRojo || "", 210)}</p>
              </div>
              <div>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:3px;")}>Principio sanador</div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{recorta(a.tarea?.sanador || "", 210)}</p>
              </div>
            </div>
          </article>
        ))}

        {/* Los dos bloques largos — tensiones y somatizaciones — son
         * lectura, no dibujo: van con el resto de la lectura para que la
         * columna del cuerpo no se estire el triple que ésta. */}
        {enfermedades.length > 0 && (
          <div style={css(tarjetaCon("var(--red)") + PAD_SM)}>
            <div style={css("font-weight:590;font-size:var(--t-mini);color:var(--red);margin-bottom:var(--s2);")}>Enfermedades y debilidades</div>
            <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-4);margin:0 0 12px;")}>
              Si el aprendizaje del portal no se trabaja, la energía se somatiza en los órganos que rige ese chakra.
            </p>
            <div style={css("display:flex;flex-direction:column;gap:11px;")}>
              {enfermedades.map(({ a, enf }) => (
                <div key={a.portal} style={css("border-left:2px solid var(--red);padding-left:12px;")}>
                  <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--red);margin-bottom:4px;")}>
                    Portal {a.portal} · {a.tarea?.nombre || ""}
                  </div>
                  {enf.nota ? (
                    <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{enf.nota}</p>
                  ) : (
                    <div style={css("display:flex;flex-direction:column;gap:5px;")}>
                      {([["Psicológicas", enf.psico], ["Órganos", enf.organos], ["Físicas", enf.fisicas]] as const).map(([k, v]) =>
                        v ? (
                          <div key={k}>
                            <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{k}: </span>
                            <span style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);")}>{v}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
