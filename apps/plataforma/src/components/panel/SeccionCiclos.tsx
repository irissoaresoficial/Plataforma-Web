"use client";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { chipStyle } from "@/lib/format";
import Carrusel from "../Carrusel";
import { KDATA } from "@/lib/kdata";
import { recorta } from "@/lib/format";
import Desglose, { type Paso } from "../Desglose";

export default function SeccionCiclos() {
  const { r, verTexto } = useApp();
  if (!r) return null;
  const CI = KDATA.ciclos || ({} as typeof KDATA.ciclos);

  const ciclos = r.ciclos.ciclos.map((cv) => ({
    ...cv,
    rango: cv.hasta === null ? "desde los " + cv.desde + " años" : cv.desde + " – " + cv.hasta + " años",
    texto: recorta((CI.ciclos || {})[cv.numero] || "", 330),
  }));
  const realizaciones = r.ciclos.realizaciones.map((x) => ({
    ...x,
    rango: x.hasta === null ? "desde los " + x.desde : x.desde + " – " + x.hasta + " años",
    texto: recorta((CI.realizaciones || {})[x.valor] || "", 230),
  }));
  const desafios = r.ciclos.desafios.map((x) => ({ ...x, texto: recorta((CI.desafios || {})[x.valor] || "", 230) }));
  const textoAnioPersonal = (CI.anioPersonal || {})[r.ciclos.anioPersonal] || "";
  const etapas = r.ciclos.etapas.map((e) => ({
    ...e,
    actual: e.n === r.ciclos.etapaActual,
    texto: recorta((CI.etapas9 || {})[e.n] || "", 260),
  }));

  // De dónde sale cada número de esta pantalla.
  const c = r.ciclos;
  const cif = (n: number | string) => String(n).split("").join("+");
  const red = (bruto: number, fin: number) => (bruto === fin ? String(fin) : `${bruto} → ${fin}`);
  const finFormacion = c.ciclos[0].hasta ?? 0;
  const R = c.realizaciones.map((x) => x.valor);
  const D = c.desafios.map((x) => x.valor);
  const pasos: Paso[] = [
    { etiqueta: "Día", operacion: `${r.fecha.dia} → ${cif(r.fecha.dia)}`, resultado: c.diaR },
    { etiqueta: "Mes", operacion: `${r.fecha.mes} → ${cif(r.fecha.mes)}`, resultado: c.mesR },
    { etiqueta: "Año", operacion: `${r.fecha.anio} → ${cif(r.fecha.anio)}`, resultado: c.anioR },
    { etiqueta: "Propósito", operacion: `${c.mesR}+${c.diaR}+${c.anioR} = ${red(c.propositoBruto, c.proposito)}`, resultado: c.proposito, final: true },
    { etiqueta: "Fin formación", operacion: `36 − ${c.proposito}`, resultado: `${finFormacion} años` },
    { etiqueta: "Formación", operacion: "el mes reducido", resultado: c.mesR },
    { etiqueta: "Evolución", operacion: "el día reducido", resultado: c.diaR },
    { etiqueta: "Cosecha", operacion: "el año reducido", resultado: c.anioR },
    { etiqueta: "Realización 1", operacion: `mes + día = ${c.mesR}+${c.diaR}`, resultado: R[0] },
    { etiqueta: "Realización 2", operacion: `día + año = ${c.diaR}+${c.anioR}`, resultado: R[1] },
    { etiqueta: "Realización 3", operacion: `1ª + 2ª = ${R[0]}+${R[1]}`, resultado: R[2] },
    { etiqueta: "Realización 4", operacion: `mes + año = ${c.mesR}+${c.anioR}`, resultado: R[3] },
    { etiqueta: "Desafío 1", operacion: `|mes − día| = |${c.mesR}−${c.diaR}|`, resultado: D[0] },
    { etiqueta: "Desafío 2", operacion: `|día − año| = |${c.diaR}−${c.anioR}|`, resultado: D[1] },
    { etiqueta: "Desafío mayor", operacion: `|1º − 2º| = |${D[0]}−${D[1]}|`, resultado: D[2] },
    { etiqueta: "Año personal", operacion: `día + mes + ${c.anioUniversal} = ${r.fecha.dia}+${r.fecha.mes}+${c.anioUniversal}`, resultado: c.anioPersonal },
    { etiqueta: "Etapa actual", operacion: `${c.edad} años ÷ 9`, resultado: `etapa ${c.etapaActual}` },
  ];

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        <div style={css("display:flex;align-items:baseline;gap:var(--gap);flex-wrap:wrap;margin-bottom:20px;")}>
          <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Ciclos vitales</span>
          <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>propósito de vida {r.ciclos.proposito}</span>
          <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>
            año {r.ciclos.anioUniversal} · <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--gold);")}>{r.ciclos.anioPersonal}</span>
          </span>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:var(--s4);")}>
          {ciclos.map((c, i) => (
            <div key={i} style={css("background:var(--surface-2);border-radius:var(--r-sm);padding:16px 18px;")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{c.nombre}</div>
              <div style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-hero);color:var(--text);line-height:1.1;margin:4px 0;")}>{c.numero}</div>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s2);")}>{c.rango}</div>
              <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{c.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <Desglose titulo="De dónde salen estos números" pasos={pasos} nota="Todos los ciclos parten de reducir a una cifra el día, el mes y el año de nacimiento; lo demás son sumas y restas entre esos tres." />

      <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        <div style={css("display:flex;align-items:baseline;gap:var(--s4);flex-wrap:wrap;margin-bottom:var(--s3);")}>
          <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>Tu año personal {r.ciclos.anioUniversal}</span>
          <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-hero);color:var(--gold);line-height:1;")}>{r.ciclos.anioPersonal}</span>
        </div>
        {/* Era un muro de veinte renglones a todo lo ancho. Se corta a una
         * medida de lectura y el texto entero sigue estando, a un clic. */}
        <p style={css("font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:0;max-width:70ch;text-wrap:pretty;")}>{recorta(textoAnioPersonal, 520)}</p>
        {textoAnioPersonal.length > 520 && (
          <button
            onClick={() => verTexto("Año personal " + r.ciclos.anioUniversal, String(r.ciclos.anioPersonal), "Dónde estás dentro de la rueda de nueve años", textoAnioPersonal)}
            style={css(chipStyle("var(--gold)") + "margin-top:var(--s4);")}
          >
            Texto completo
          </button>
        )}
      </div>

      <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
        {/* Nueve tarjetas en rejilla dejaban una fila coja con una sola
         * tarjeta suelta. En tira se recorren enteras y ocupan una franja; el
         * título va dentro del carrusel para que las flechas salgan a su
         * altura y se vea que la tira se mueve. */}
        <Carrusel
          ancho={244}
          titulo="Etapas de nueve años"
          accion={
            <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-right:var(--s2);")}>
              ahora en la etapa {r.ciclos.etapaActual} · {r.ciclos.edad} años
            </span>
          }
        >
          {etapas.map((e) => (
            <div
              key={e.n}
              style={css(
                "height:100%;border-radius:var(--r-sm);padding:13px 15px;background:var(--surface-2);border-left:2px solid " +
                  (e.actual ? "var(--gold)" : "transparent") +
                  ";"
              )}
            >
              <div style={css("display:flex;align-items:baseline;gap:var(--s2);")}>
                <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:" + (e.actual ? "var(--text)" : "var(--text-3)") + ";line-height:1;")}>{e.n}</span>
                <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>
                  {e.desde} – {e.hasta} años
                </span>
                {e.actual && <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:590;color:var(--gold);")}>ahora</span>}
              </div>
              <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:7px 0 0;")}>{e.texto}</p>
            </div>
          ))}
        </Carrusel>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:var(--gap-lg);")}>
        <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:14px;")}>Realizaciones</div>
          {realizaciones.map((r2, i) => (
            <div key={i} style={css("display:flex;gap:var(--s4);padding:11px 0;" + (i ? "border-top:1px solid var(--border);" : ""))}>
              <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-head);color:var(--gold);min-width:32px;")}>{r2.valor}</span>
              <div>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:3px;")}>
                  Realización {r2.n} · {r2.rango}
                </div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{r2.texto}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
          <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:14px;")}>Desafíos</div>
          {desafios.map((d, i) => (
            <div key={i} style={css("display:flex;gap:var(--s4);padding:11px 0;" + (i ? "border-top:1px solid var(--border);" : ""))}>
              <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-head);color:var(--red);min-width:32px;")}>{d.valor}</span>
              <div>
                <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:3px;")}>
                  {d.etiqueta} · {d.rango}
                </div>
                <p style={css("font-family:var(--font-ui);font-size:var(--t-body);line-height:1.5;color:var(--text-2);margin:0;text-wrap:pretty;")}>{d.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
