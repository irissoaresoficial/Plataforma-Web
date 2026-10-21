"use client";

/**
 * ============================================================================
 * «ACERCA DE ESTO»: POR QUÉ EXISTE ESTE SITIO
 * ============================================================================
 *
 * Gerson, el 21 de octubre de 2026: debajo de los primeros pasos, «un acerca
 * de esto, con un pop up bonito, donde hables muy humanamente de quién es el
 * porqué de esto. Habla siempre de querer ayudar a personas (terapeutas): que
 * hay un lugar donde todos aprendan, aportemos y nos ayudemos. Y próximamente,
 * pensando en innovar y en nuestra profesión, el asistente inteligente para
 * terapeutas: un solo lugar para crecer y expandir tu conocimiento y empresa».
 * Y lo de «secretaria», fuera: no es innovador.
 *
 * Y DESPUÉS: «habla como si Iris lo escribiera». Va en primera persona y
 * firmado por ella.
 *
 * LO QUE SE DICE DE IRIS ES LO QUE ELLA DICE DE SÍ MISMA en la web —terapeuta
 * psicosomática clínica, numeróloga transgeneracional, consulta desde 2010—.
 * Nada de cifras de alumnos ni frases que no haya dicho.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

const QUE_HACEMOS: Array<[string, string, string]> = [
  ["✦", "Aprendemos", "Cursos pensados para la consulta de verdad, de quien ya ha recorrido el camino."],
  ["◎", "Aportamos", "Lo que tú sabes vale. Compártelo en la comunidad o en tus propios cursos."],
  ["❋", "Nos ayudamos", "Una duda, un caso difícil, un mal día. Aquí siempre habrá alguien que lo entienda."],
];

export default function AcercaDe({ compacta = false }: { compacta?: boolean }) {
  const [abierta, setAbierta] = useState(false);
  const quieto = useReducedMotion();

  useEffect(() => {
    if (!abierta) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    window.addEventListener("keydown", tecla);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [abierta]);

  const muelle = quieto ? { duration: 0.15 } : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <>
      <button
        onClick={() => setAbierta(true)}
        title={compacta ? "Acerca de esto" : undefined}
        aria-label={compacta ? "Acerca de esto" : undefined}
        style={css(
          "display:flex;align-items:center;justify-content:" + (compacta ? "center" : "flex-start") + ";gap:9px;width:100%;" +
            "padding:9px 12px;border:none;border-radius:var(--r-sm);background:none;cursor:pointer;font:inherit;" +
            "font-size:var(--t-mini);font-weight:500;color:var(--text-3);"
        )}
      >
        <span
          aria-hidden
          style={css(
            "flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;" +
              "border:1.5px solid currentColor;font-size:var(--t-mini);line-height:1;"
          )}
        >
          i
        </span>
        {!compacta && "Acerca de esto"}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {abierta && (
              <motion.div
                key="velo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAbierta(false)}
                style={css(
                  "position:fixed;inset:0;z-index:80;display:flex;padding:16px;overflow-y:auto;" +
                    "background:color-mix(in srgb, var(--bloque) 55%, transparent);" +
                    "backdrop-filter:blur(10px) saturate(1.2);-webkit-backdrop-filter:blur(10px) saturate(1.2);"
                )}
              >
                <motion.article
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="acerca-titulo"
                  onClick={(e) => e.stopPropagation()}
                  initial={quieto ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={quieto ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                  transition={muelle}
                  style={css(
                    /* `margin:auto` dentro de un flex centra y, si no cabe, deja que se
                       desplace desde arriba: con `place-items:center` se cortaba la cabeza. */
                    "position:relative;margin:auto;flex:none;width:min(580px,100%);border-radius:var(--r-tarjeta);overflow:hidden;" +
                      "background:var(--surface);color:var(--text);box-shadow:0 40px 120px color-mix(in srgb, var(--bloque) 40%, transparent);"
                  )}
                >
                  {/* La cabeza: el granate de la casa con un degradado que se
                      mueve, como el bloque del asistente. */}
                  <header
                    data-acerca-cabeza=""
                    style={css(
                      "position:relative;overflow:hidden;padding:34px 30px 30px;background:var(--bloque);color:var(--sobre-bloque);"
                    )}
                  >
                    <div data-ia-aurora="" aria-hidden />
                    <div style={css("position:relative;z-index:1;display:flex;flex-direction:column;gap:14px;")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-33-blanco.png" alt="" width={56} height={56} style={css("width:56px;height:56px;")} />
                      <span style={css("font-size:var(--t-mini);font-weight:500;color:var(--oro-luz);letter-spacing:.02em;")}>
                        Escuela de Sabiduría 33
                      </span>
                      <h2
                        id="acerca-titulo"
                        style={css("margin:0;font-size:clamp(28px,4vw,36px);font-weight:300;letter-spacing:-.025em;line-height:1.1;")}
                      >
                        Un lugar para que
                        <br />
                        <span data-ia-degradado="">nadie acompañe solo.</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setAbierta(false)}
                      aria-label="Cerrar"
                      style={css(
                        "position:absolute;top:16px;right:16px;z-index:2;width:34px;height:34px;border-radius:50%;cursor:pointer;" +
                          "display:grid;place-items:center;font:inherit;font-size:var(--t-body);line-height:1;" +
                          "background:var(--bloque-2);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);"
                      )}
                    >
                      ✕
                    </button>
                  </header>

                  <div style={css("padding:28px 30px 30px;display:flex;flex-direction:column;gap:24px;")}>
                    <section style={css("display:flex;flex-direction:column;gap:10px;")}>
                      <h3 style={css("margin:0;font-size:var(--t-mini);font-weight:500;color:var(--gold);")}>Por qué he creado este lugar</h3>
                      <p style={css("margin:0;font-size:var(--t-read);line-height:1.6;")}>
                        Llevo en consulta desde 2010, y ser terapeuta puede ser muy solitario: se aprende a solas, se trabaja a solas y se
                        crece a solas. He creado esta escuela para que no tenga que ser así.
                      </p>
                      {/* Iris, en pequeño y redonda: quien está detrás, sin hacer de esto un anuncio. */}
                      <div style={css("display:flex;gap:14px;align-items:center;margin-top:6px;")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/iris.jpg"
                          alt="Iris Soares"
                          width={60}
                          height={60}
                          style={css("flex:none;width:60px;height:60px;border-radius:50%;object-fit:cover;object-position:50% 22%;box-shadow:0 0 0 2px var(--surface),0 0 0 3px var(--oro);")}
                        />
                        <p style={css("margin:0;font-size:var(--t-body);line-height:1.55;color:var(--text-3);")}>
                          Soy <strong style={css("font-weight:500;color:var(--text);")}>Iris Soares</strong>, terapeuta psicosomática clínica y
                          numeróloga transgeneracional. Lo que quiero es sencillo: ayudar a las personas que ayudan a otras.
                        </p>
                      </div>
                    </section>

                    <section style={css("display:grid;gap:10px;")}>
                      <h3 style={css("margin:0;font-size:var(--t-mini);font-weight:500;color:var(--gold);")}>Lo que quiero que encuentres aquí</h3>
                      {QUE_HACEMOS.map(([ico, que, como]) => (
                        <div
                          key={que}
                          style={css(
                            "display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-radius:var(--r);" +
                              "background:color-mix(in srgb, var(--oro) 8%, transparent);border:1px solid var(--border);"
                          )}
                        >
                          <span
                            aria-hidden
                            style={css(
                              "flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-body);" +
                                "background:var(--bloque);color:var(--oro-luz);"
                            )}
                          >
                            {ico}
                          </span>
                          <span style={css("display:flex;flex-direction:column;gap:2px;")}>
                            <strong style={css("font-size:var(--t-body);font-weight:500;")}>{que}</strong>
                            <span style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-3);")}>{como}</span>
                          </span>
                        </div>
                      ))}
                    </section>

                    <section
                      style={css(
                        "position:relative;overflow:hidden;display:flex;flex-direction:column;gap:10px;padding:20px;border-radius:var(--r-lg);" +
                          "background:var(--bloque);color:var(--sobre-bloque);"
                      )}
                    >
                      <div data-ia-aurora="" aria-hidden />
                      <span
                        style={css(
                          "position:relative;z-index:1;align-self:flex-start;display:inline-flex;align-items:center;gap:7px;font-size:var(--t-mini);font-weight:500;" +
                            "padding:4px 11px;border-radius:var(--r-pill);color:var(--oro-luz);border:1px solid var(--bloque-borde);"
                        )}
                      >
                        <span data-ia-pronto="" style={css("width:6px;height:6px;border-radius:50%;background:var(--oro-luz);")} />
                        Próximamente
                      </span>
                      <h3 style={css("position:relative;z-index:1;margin:0;font-size:var(--t-read);font-weight:500;letter-spacing:-.015em;")}>
                        Un asistente inteligente para terapeutas
                      </h3>
                      <p style={css("position:relative;z-index:1;margin:0;font-size:var(--t-body);line-height:1.6;color:var(--sobre-bloque-2);")}>
                        Lo estamos preparando pensando en nuestra profesión, no adaptado de otra. Te ayudará a organizar tu consulta, a
                        preparar lo que enseñas y a entender cómo crece tu trabajo. Un solo lugar para crecer y expandir tu conocimiento y tu
                        empresa.
                      </p>
                    </section>

                    {/* La firma: lo escribe ella. */}
                    <p style={css("margin:0;font-size:var(--t-read);line-height:1.5;")}>
                      Gracias por estar aquí.
                      <br />
                      <span style={css("color:var(--gold);font-weight:500;")}>Iris</span>
                    </p>

                    <button
                      onClick={() => setAbierta(false)}
                      style={css(
                        "align-self:stretch;padding:14px 20px;border-radius:var(--r-pill);border:none;cursor:pointer;font:inherit;" +
                          "font-size:var(--t-body);font-weight:500;background:var(--accion);color:var(--sobre-accion);"
                      )}
                    >
                      Seguir
                    </button>
                  </div>
                </motion.article>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
