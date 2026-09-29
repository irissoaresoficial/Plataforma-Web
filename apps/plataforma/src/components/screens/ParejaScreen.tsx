"use client";
import { css } from "@/lib/css";
import { botonPrincipal } from "@/lib/ui";
import { titulo } from "@/lib/format";
import { useExportar, AVISO_SIN_DIALOGO } from "@/lib/imprimir";
import GuiaApple from "../GuiaApple";
import { useApp, valida } from "@/lib/app-context";
import { KDATA } from "@/lib/kdata";
import Particulas from "../Particulas";
import Pendiente from "../panel/Pendiente";

export default function ParejaScreen() {
  const { r, re, p, setP, comparar, pr, comp } = useApp();
  /* Va aquí arriba, antes del `return` de más abajo: un hook no puede quedarse
     sin llamar según lo que haya en pantalla. */
  const { exporta, sinDialogo, trasPulsar, ayuda, guiaApple, cierraGuia, enApp, aSafari } = useExportar();
  // La comparativa cruza estructuras, planos y cuentas, y todo eso sale de la
  // fecha de nacimiento. Una empresa no la tiene, así que no hay nada que
  // cruzar: mejor decirlo que dejar la pantalla en blanco.
  if (!r && re)
    return (
      <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
        <Pendiente
          titulo="La comparativa es de personas"
          pie="Se cruzan los portales, los planos de consciencia y las cuentas abiertas de los dos, y todo eso sale de la fecha de nacimiento. Un estudio de empresa se lee sólo del nombre, así que no hay nada que comparar."
        />
      </main>
    );
  if (!r) return null;

  const errP = valida(p);
  const listo = !errP;
  const K = KDATA.parejas;

  const campo = (label: string, key: "nombre" | "ap1" | "ap2" | "dia" | "mes" | "anio", numeric?: boolean) => (
    <label style={css("display:flex;flex-direction:column;gap:6px;min-width:0;")}>
      <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{label}</span>
      <input
        size={4}
        value={p[key]}
        onChange={(e) => setP(key, numeric ? e.target.value.replace(/\D/g, "").slice(0, key === "anio" ? 4 : 2) : e.target.value)}
        inputMode={numeric ? "numeric" : undefined}
        style={css("width:100%;min-width:0;padding:12px 14px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-read);")}
      />
    </label>
  );

  let comparativa: Array<{ titulo: string; items: Array<{ clave: string | number; texto: string }> }> = [];
  if (comp && pr) {
    const caminos = [{ clave: "Arcano " + comp.caminoConjunto, texto: titulo(comp.cartaConjunta?.nombre) + ". " + (comp.cartaConjunta?.pareja || "") }];
    ([
      ["Origen", r.caminos.origen, pr.caminos.origen],
      ["Transformación", r.caminos.transformacion, pr.caminos.transformacion],
      ["Destino", r.caminos.destino, pr.caminos.destino],
    ] as const).forEach(([et, x, y]) => {
      caminos.push({
        clave: et,
        texto: `${titulo(x.carta?.nombre)} (${x.arcano}) · ${titulo(y.carta?.nombre)} (${y.arcano})` + (x.arcano === y.arcano ? " — mismo camino: gran comprensión mutua en este plano." : ""),
      });
    });

    const estr = [{ clave: `${r.estructura.tipo} · ${pr.estructura.tipo}`, texto: comp.textoEstructura }];
    comp.portalesComunes.forEach((port) => estr.push({ clave: "Portal " + port, texto: K.portales?.[port] || "" }));
    if (comp.portalesComunes.includes(1) && comp.portalesComunes.includes(7)) estr.push({ clave: "Portal 1 + 7", texto: K.combinaciones?.["1+7"] || "" });

    /*
     * SI NO HAY PLANOS COMPARTIDOS, SE DICE. NO SE BORRA LA SECCIÓN.
     *
     * Esto devolvía una lista vacía y el `.filter` de abajo hacía desaparecer
     * el apartado entero. El resultado: la introducción promete cuatro cosas
     * —camino, estructura, planos y cuentas— y en el papel salían tres, sin
     * que nada explicara dónde estaba la cuarta.
     *
     * Para quien lee eso no es «no comparten ningún plano»: es «aquí falta un
     * trozo», que es literalmente la queja que llegó del PDF. Y además el dato
     * de que NO comparten bloqueos es información de la lectura, no un hueco:
     * dos personas que no se bloquean en los mismos planos se sostienen donde
     * la otra flojea.
     *
     * Las cuentas abiertas ya lo hacían bien desde el principio. Ahora los
     * cuatro apartados se comportan igual.
     */
    const planos = comp.planosComunes.length
      ? comp.planosComunes.map((pl) => ({ clave: "Plano " + pl, texto: K.planos?.[pl] || "Bloqueo compartido en el plano " + pl + "." }))
      : [{ clave: "—", texto: "No tenéis ningún plano de consciencia bloqueado a la vez. Donde uno se traba, el otro suele estar libre." }];

    const cuentas: Array<{ clave: string | number; texto: string }> = [];
    const vistos: Record<string, boolean> = {};
    (comp.coincidencias || []).forEach((x) => {
      const key = x.tipo + x.valor;
      if (vistos[key]) return;
      vistos[key] = true;
      cuentas.push({ clave: x.valor, texto: x.texto });
    });
    if (comp.afinidadIgual) cuentas.push({ clave: "Afinidad", texto: K.cuentas?.afinidad || "" });

    comparativa = [
      { titulo: "Caminos", items: caminos },
      { titulo: "Estructura energética y portales", items: estr },
      { titulo: "Imagen del alma · planos compartidos", items: planos },
      { titulo: "Cuentas abiertas y afinidad", items: cuentas.length ? cuentas : [{ clave: "—", texto: "No hay coincidencias en cuentas abiertas, potenciales arcaicos ni números de afinidad." }] },
    ].filter((s) => s.items.length > 0);
  }

  return (
    <main style={css("max-width:1120px;margin:0 auto;padding:var(--s7) var(--gutter) var(--s8);")}>
      <div style={css("text-align:center;margin-bottom:30px;")}>
        <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s3);")}>Comparativa</div>
        <h1 style={css("font-family:var(--font-ui);font-weight:700;font-size:clamp(21px,3.4vw,30px);letter-spacing:-.022em;color:var(--text);margin:0;line-height:1.2;overflow-wrap:anywhere;")}>
          {/*
              AQUÍ PONÍA «& su pareja», LITERAL, con el nombre de la otra
              persona ya calculado dos líneas más abajo.

              O sea que el documento que se le entrega a un cliente abría con
              «Maria Iris Soares Campos & su pareja» mientras el cuadro de
              debajo decía «Joao Silva Santos» con todos sus números. No es un
              detalle de estilo: en una entrega de pago, un titular que no sabe
              el nombre de medio documento se lee como una plantilla sin
              rellenar.

              Se mantiene «su pareja» sólo mientras la segunda persona no está
              puesta, que es cuando de verdad no hay nombre que escribir.
          */}
          {titulo(r.nombre.texto)} &amp; {pr ? titulo(pr.nombre.texto) : "su pareja"}
        </h1>
        <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:var(--s4) auto 0;max-width:62ch;text-wrap:pretty;")}>
          La comparativa no juzga si una pareja funciona: enseña qué traen los dos en común y qué les toca aprender juntos. Se
          miran cuatro cosas — el camino que forman entre los dos, si comparten estructura y portales, qué planos de consciencia
          tienen bloqueados a la vez, y si arrastran las mismas cuentas abiertas.
        </p>
      </div>

      <section data-chrome="1" style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);margin-bottom:var(--s5);")}>
        <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s5);")}>Datos de la segunda persona</div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,130px),1fr));gap:var(--s3);align-items:end;")}>
          {campo("Nombre", "nombre")}
          {campo("Primer apellido", "ap1")}
          {campo("Segundo apellido", "ap2")}
          {campo("Día", "dia", true)}
          {campo("Mes", "mes", true)}
          {campo("Año", "anio", true)}
        </div>
        <button
          onClick={comparar}
          disabled={!listo}
          style={css(
botonPrincipal(listo) + "margin-top:20px;"
          )}
        >
          Comparar
        </button>
        {/*
            EL BOTÓN GRIS AHORA DICE POR QUÉ ESTÁ GRIS.

            `errP` se calculaba arriba y no se pintaba en ninguna parte: con el
            formulario a medias, el botón se quedaba apagado y en la pantalla no
            aparecía ni una palabra. Desde fuera eso no se distingue de una
            herramienta colgada, y quien lo ve se queda mirando sin saber si le
            falta un dato o si hay que recargar.

            La pantalla de entrada sí lo hace bien —«Falta el nombre.», «El día
            debe estar entre 1 y 31.»—. Aquí faltaba enseñar el mensaje que ya
            estaba escrito.
        */}
        {errP && (
          <p style={css("margin:var(--s3) 0 0;font-size:var(--t-body);color:var(--text-3);")} role="status">
            {errP}
          </p>
        )}
      </section>

      {comp && pr && (
        <div data-cascada="" style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
          {/* La comparativa también se entrega: se imprime como el estudio, y
           * al imprimir desaparecen el formulario y la navegación. */}
          <div data-chrome="1" style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
            <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>{ayuda}</span>
            <button
              onClick={exporta}
              style={css(
                /* Granate: es EL botón de esta pantalla, y en una pantalla
                   blanca sólo hay uno. Levantado del papel como las tarjetas. */
                "margin-left:auto;background:var(--accion);border:1px solid var(--accion);color:var(--sobre-accion);border-radius:var(--r-pill);padding:10px 22px;font-weight:590;font-size:var(--t-body);cursor:pointer;box-shadow:var(--nm-alto);"
              )}
            >
              Exportar PDF
            </button>
            {/* Después del botón y en su propia línea: si sale, es porque se ha
                pulsado y no ha pasado nada, y ahí hace falta leerlo entero. */}
            {sinDialogo && (
              <span role="alert" style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--red);")}>
                {AVISO_SIN_DIALOGO}
              </span>
            )}
            {trasPulsar && (
              <span role="status" style={css("flex-basis:100%;font-size:var(--t-mini);color:var(--text-3);")}>
                {trasPulsar}
              </span>
            )}
            {guiaApple && <GuiaApple alCerrar={cierraGuia} enApp={enApp} aSafari={aSafari} />}
          </div>
          <div
            style={css(
              "position:relative;overflow:hidden;isolation:isolate;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:var(--gap);align-items:center;justify-items:center;text-align:center;background:var(--surface);border:1px solid var(--border);border-left:2px solid var(--gold);border-radius:var(--r);padding:var(--pad-card);"
            )}
          >
            <div style={css("position:absolute;inset:0;z-index:0;pointer-events:none;")}>
              <Particulas cantidad={28} />
            </div>
            <div style={css("text-align:right;position:relative;z-index:1;")}>
              <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text);line-height:1.25;")}>{titulo(r.nombre.texto)}</div>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-top:4px;")}>
                corazón {r.corazon.valor} · estructura {r.estructura.tipo}
              </div>
            </div>
            <div style={css("text-align:center;padding:0 var(--s3);position:relative;z-index:1;")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Camino conjunto</div>
              <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-hero);color:var(--gold);line-height:1.1;")}>{comp.caminoConjunto}</div>
              <div style={css("font-family:var(--font-ui);font-style:normal;font-size:var(--t-body);color:var(--text-3);")}>{titulo(comp.cartaConjunta?.nombre)}</div>
              {/* La cuenta entera, como está impresa en la ficha: se suman los
                * dos corazones, se les resta la suma de sus cifras, se divide
                * entre nueve y se suma 2 «porque son 2 personas = 2 almas». */}
              <div style={css("font-size:var(--t-mini);color:var(--text-4);margin-top:6px;line-height:1.45;")}>
                ({r.corazon.valor} + {pr.corazon.valor} − {comp.calcConjunto.sumaCifras}) ÷ 9 + 2 = {comp.calcConjunto.mas1}
                {comp.calcConjunto.mas1 > 21 ? ` → ${comp.caminoConjunto}` : ""}
              </div>
            </div>
            <div style={css("position:relative;z-index:1;")}>
              <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text);line-height:1.25;")}>{titulo(pr.nombre.texto)}</div>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-top:4px;")}>
                corazón {pr.corazon.valor} · estructura {pr.estructura.tipo}
              </div>
            </div>
          </div>
          {comparativa.map((sec, si) => (
            <article key={si} style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s3);")}>{sec.titulo}</div>
              {sec.items.map((it, ii) => (
                <div key={ii} style={css("display:flex;gap:var(--s3);padding:8px 0;border-top:1px solid var(--border);")}>
                  <span style={css("font-family:var(--font-ui);font-weight:590;font-size:var(--t-body);color:var(--gold);min-width:96px;")}>{it.clave}</span>
                  <p style={css("font-family:var(--font-ui);font-size:var(--t-read);line-height:1.55;color:var(--text-2);margin:0;text-wrap:pretty;flex:1;")}>{it.texto}</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
