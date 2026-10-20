"use client";

/**
 * ============================================================================
 * TU ESPACIO, PASO A PASO — SÓLO PARA CREADORES
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «que incluya el paso a paso de lo que
 * tiene dentro de su espacio; píntalo: cada terapeuta puede montar su curso y
 * manejar su negocio aquí, con un agente de IA que conocerá tu negocio y te
 * ayudará en tu agenda, citas, pagos —una secretaria—».
 *
 * Los cinco pasos son lo que YA hay y se pulsan para ir. El agente va aparte,
 * con «Próximamente» bien grande: todavía no existe, y una pieza que lo
 * vendiera como si funcionara haría que alguien lo buscara y no lo
 * encontrara. Se anuncia, no se finge.
 */
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { TARJETA } from "@/lib/ui";
import { IcoAgenda, IcoComunidad, IcoCursos, IcoMetricas } from "../Iconos";

type Ico = (p: { size?: number }) => React.JSX.Element;

const PASOS: Array<{ n: number; titulo: string; que: string; ir: View; Ico: Ico; tono: string }> = [
  { n: 1, titulo: "Monta tu curso", que: "Módulos, lecciones con su vídeo y el material que se descarga.", ir: "cursos", Ico: IcoCursos, tono: "melocoton" },
  { n: 2, titulo: "Pide que se publique", que: "Iris lo revisa y lo publica. Tus alumnos lo ven al momento.", ir: "cursos", Ico: IcoCursos, tono: "rosa" },
  { n: 3, titulo: "Habla con tu gente", que: "En la comunidad están las personas de tus cursos.", ir: "comunidad", Ico: IcoComunidad, tono: "lavanda" },
  { n: 4, titulo: "Organiza tu agenda", que: "Tus directos, tus sesiones y tus entregas, por días.", ir: "miagenda", Ico: IcoAgenda, tono: "cielo" },
  { n: 5, titulo: "Mira tus números", que: "Quién entra a tus cursos y hasta dónde llega.", ir: "mismetricas", Ico: IcoMetricas, tono: "lima" },
];

export default function TuEspacio() {
  const { setView } = useApp();
  return (
    <section style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
      <div>
        <h2 style={css("margin:0;font-size:var(--t-head);font-weight:500;letter-spacing:-.025em;")}>Tu espacio, paso a paso</h2>
        <p style={css("margin:6px 0 0;font-size:var(--t-read);line-height:1.55;color:var(--text-2);max-width:62ch;")}>
          Aquí montas tu curso y llevas tu negocio de terapeuta, todo en un sitio.
        </p>
      </div>

      <ol style={css("list-style:none;margin:0;padding:0;display:grid;gap:var(--gap);grid-template-columns:repeat(auto-fill,minmax(220px,1fr));")}>
        {PASOS.map((p) => (
          <li key={p.n}>
            <button
              onClick={() => setView(p.ir)}
              style={css(TARJETA + "width:100%;height:100%;padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:10px;text-align:left;cursor:pointer;font:inherit;color:var(--text);")}
            >
              <span style={css("display:flex;align-items:center;justify-content:space-between;")}>
                <span style={css(`width:40px;height:40px;border-radius:var(--r);display:grid;place-items:center;background:var(--${p.tono});color:var(--${p.tono}-tx);`)}>
                  <p.Ico size={20} />
                </span>
                <span style={css("font-weight:300;font-size:34px;letter-spacing:-.04em;line-height:1;color:var(--text-4);")}>{p.n}</span>
              </span>
              <span style={css("font-size:var(--t-body);font-weight:500;")}>{p.titulo}</span>
              <span style={css("font-size:var(--t-mini);line-height:1.5;color:var(--text-3);")}>{p.que}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* ------------------------------------------ el agente, anunciado */}
      <div
        style={css(
          "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);padding:var(--pad-card);display:flex;gap:var(--gap-lg);align-items:center;flex-wrap:wrap;" +
            "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);box-shadow:var(--shadow-lg);" +
            "background-image:radial-gradient(520px 260px at 100% 0%,color-mix(in srgb, var(--oro) 35%, transparent),transparent 70%);"
        )}
      >
        <div style={css("flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:10px;")}>
          <span style={css("align-self:flex-start;font-size:var(--t-mini);font-weight:600;padding:4px 12px;border-radius:var(--r-pill);background:var(--oro-luz);color:var(--vino);")}>
            ✦ Próximamente
          </span>
          <h3 style={css("margin:0;font-weight:300;font-size:clamp(28px,3vw,40px);letter-spacing:-.03em;line-height:1.1;")}>Tu secretaria con inteligencia artificial</h3>
          <p style={css("margin:0;font-size:var(--t-body);line-height:1.6;color:var(--sobre-bloque-2);max-width:56ch;")}>
            Un agente que conocerá tu negocio y te ayudará con tu agenda, tus citas y tus cobros. Para que tú te dediques a lo tuyo: tus clientes.
          </p>
        </div>
        <ul style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;flex:0 1 260px;")}>
          {[
            ["Agenda", "Organiza tu semana y te avisa de lo que viene."],
            ["Citas", "Reserva y confirma con tus clientes por ti."],
            ["Pagos", "Cobra y lleva la cuenta de lo que entra."],
          ].map(([q, d]) => (
            <li key={q} style={css("display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:var(--r-lg);background:var(--bloque-2);border:1px solid var(--bloque-borde);")}>
              <span aria-hidden="true" style={css("color:var(--oro-luz);")}>✦</span>
              <span>
                <span style={css("display:block;font-size:var(--t-body);font-weight:500;")}>{q}</span>
                <span style={css("display:block;font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
