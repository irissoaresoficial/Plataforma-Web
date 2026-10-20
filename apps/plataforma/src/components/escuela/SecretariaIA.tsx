"use client";

/**
 * ============================================================================
 * TU EMPRESA, CONECTADA: LA SECRETARIA CON IA (PRÓXIMAMENTE)
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «esto debe aparecer en todos los
 * apartados, pero como diagramas conectados: la idea es que los terapeutas
 * puedan tener su empresa aquí; quiero algo que se vea innovador, como
 * conectándose, y coloca próximamente algo guapo».
 *
 * EL DIBUJO DICE LA IDEA SIN LEERLA: todo lo que el terapeuta ya tiene aquí
 * —cursos, comunidad, agenda, métricas— y lo que viene —citas y pagos— son
 * nodos que llegan por líneas vivas a un mismo centro, el agente. Por las
 * líneas corre luz hacia dentro: es la información de su negocio llegando a
 * quien la va a ordenar.
 *
 * Y ES «PRÓXIMAMENTE», Y LO PARECE. La pastilla brilla, los nodos que todavía
 * no existen (citas y pagos) van con el borde punteado, y nada de esto se
 * pulsa como si funcionara. Se anuncia, no se finge.
 *
 * SEGUNDA VERSIÓN, el mismo día: «que se vea más premium, sutil, de primera,
 * y comunícalo mejor, muy profesional». Fuera el brillo de la pastilla, el
 * halo que latía y la luz en cada línea: filetes finos, una sola luz que
 * recorre las líneas de una en una y mucho aire. Y el texto deja de anunciar
 * «un agente de IA»: dice qué trabajo le quita de encima, en tres líneas.
 *
 * TERCERA, con la foto. Gerson trajo la referencia: unas manos con el móvil
 * en penumbra, la app en la pantalla. La entera lleva esa foto a sangre por
 * la derecha (en el móvil, arriba), fundida con el granate; el diagrama se
 * queda en la compacta, que es la que sale al pie de cada apartado.
 *
 * SÓLO PARA CREADORES. Con `compacta` sale en la parte de abajo de cada una de
 * sus pantallas; entera, en su inicio.
 */
import { useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

const NODOS: Array<{ k: string; lado: -1 | 1; fila: 0 | 1 | 2; ya: boolean }> = [
  { k: "Agenda", lado: -1, fila: 0, ya: true },
  { k: "Cursos", lado: -1, fila: 1, ya: true },
  { k: "Comunidad", lado: -1, fila: 2, ya: true },
  { k: "Métricas", lado: 1, fila: 0, ya: true },
  { k: "Citas", lado: 1, fila: 1, ya: false },
  { k: "Cobros", lado: 1, fila: 2, ya: false },
];

/**
 * Dos medidas del mismo dibujo. En el móvil se encoge el lienzo, no la letra:
 * escalado entero a 390 px, el de escritorio dejaba los rótulos en 8 px.
 */
const MEDIDAS = {
  ancho: { ancho: 520, alto: 300, chip: 112, r: 30, margen: 14, aura: 96, anillo: 70, paso: 88 },
  estrecho: { ancho: 340, alto: 240, chip: 100, r: 22, margen: 2, aura: 64, anillo: 46, paso: 78 },
};
const VUELTA = 7.2; // segundos que tarda la luz en pasar por las seis líneas

/** Lo que hará, dicho como trabajo que deja de ser suyo. */
const HARA: Array<[string, string]> = [
  ["Da las citas", "Contesta a quien pide sesión y la cuadra con tu agenda."],
  ["Confirma y recuerda", "Avisa el día antes y recoloca el hueco si alguien cancela."],
  ["Lleva los cobros", "Envía el pago con la cita y te dice cuándo ha entrado."],
];

function Diagrama({ medida, tope, solo = false }: { medida: keyof typeof MEDIDAS; tope: number; solo?: boolean }) {
  const quieto = useReducedMotion();
  const { ancho: ANCHO, alto: ALTO, chip: CHIP, r: R, margen, aura, anillo, paso } = MEDIDAS[medida];
  const CX = ANCHO / 2;
  const CY = ALTO / 2;
  const filaY = (f: number) => CY + (f - 1) * paso;
  return (
    <svg
      data-ia-diagrama={solo ? undefined : medida}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label="Agenda, cursos, comunidad y métricas, que ya tienes, y citas y cobros, que llegarán, conectados a tu asistente"
      style={css(`width:100%;height:auto;max-height:${tope}px;`)}
    >
      <defs>
        <radialGradient id={`ia-aura-${medida}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--oro-luz)" stopOpacity=".22" />
          <stop offset="100%" stopColor="var(--oro-luz)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r={aura} fill={`url(#ia-aura-${medida})`} />
      <circle cx={CX} cy={CY} r={anillo} fill="none" stroke="var(--bloque-borde)" strokeWidth=".75" />

      {/* Filetes de cada nodo al centro: salen del borde de la ficha, no la cruzan. */}
      {NODOS.map((n, i) => {
        const y = filaY(n.fila);
        const x0 = CX + n.lado * (ANCHO / 2 - margen - CHIP);
        const x1 = CX + n.lado * (R + 6);
        const m = (x0 + x1) / 2;
        const d = `M ${x0} ${y} C ${m} ${y}, ${m} ${CY}, ${x1} ${CY}`;
        const paso = VUELTA / NODOS.length;
        return (
          <g key={n.k}>
            <path d={d} fill="none" stroke="var(--oro-luz)" strokeOpacity={n.ya ? 0.34 : 0.2} strokeWidth=".9" strokeDasharray={n.ya ? undefined : "2 5"} />
            {!quieto && (
              <circle r="2.2" fill="var(--oro-luz)" opacity="0">
                <animateMotion dur={`${paso * 1.6}s`} begin={`${i * paso}s`} repeatCount="indefinite" path={d} keyPoints="0;1;1" keyTimes="0;.62;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;.95;.95;0;0" keyTimes="0;.12;.55;.62;1" dur={`${paso * 1.6}s`} begin={`${i * paso}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* El asistente: un disco con filete dorado y la estrella de la casa. */}
      <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="var(--oro-luz)" strokeOpacity=".28" strokeWidth=".75" />
      <circle cx={CX} cy={CY} r={R} fill="var(--bloque)" stroke="var(--oro-luz)" strokeOpacity=".8" strokeWidth="1" />
      <path d={`M ${CX} ${CY - 10} l 2.8 7.2 7.2 2.8 -7.2 2.8 -2.8 7.2 -2.8 -7.2 -7.2 -2.8 7.2 -2.8 z`} fill="var(--oro-luz)" />

      {/* Las fichas: lo que ya hay, llenas; lo que llega, con el borde punteado. */}
      {NODOS.map((n) => {
        const x = n.lado < 0 ? margen : ANCHO - margen - CHIP;
        const y = filaY(n.fila);
        return (
          <g key={`n-${n.k}`} opacity={n.ya ? 1 : 0.78}>
            <rect
              x={x}
              y={y - 17}
              width={CHIP}
              height="34"
              rx="17"
              fill={n.ya ? "var(--bloque-2)" : "none"}
              stroke="var(--oro-luz)"
              strokeOpacity={n.ya ? 0.22 : 0.45}
              strokeWidth=".9"
              strokeDasharray={n.ya ? undefined : "2.5 3.5"}
            />
            <circle cx={x + 16} cy={y} r="2.6" fill={n.ya ? "var(--oro-luz)" : "none"} stroke="var(--oro-luz)" strokeWidth=".9" />
            <text x={x + 27} y={y + 4.4} fill="var(--sobre-bloque)" fontSize="13" fontWeight="400" fontFamily="var(--font-ui)">
              {n.k}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SecretariaIA({ compacta = false }: { compacta?: boolean }) {
  return (
    <section
      data-ia={compacta ? "" : "foto"}
      style={css(
        "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);display:grid;align-items:center;" +
          (compacta ? "gap:var(--gap);padding:var(--pad-card-sm);" : "gap:var(--gap-lg);padding:var(--pad-card);") +
          "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);box-shadow:var(--shadow-lg);"
      )}
    >
      <div style={css("min-width:0;display:flex;flex-direction:column;gap:" + (compacta ? "12px" : "18px") + ";")}>
        <span
          style={css(
            "align-self:flex-start;display:inline-flex;align-items:center;gap:8px;font-size:var(--t-mini);font-weight:500;letter-spacing:.02em;" +
              "padding:5px 12px;border-radius:var(--r-pill);color:var(--oro-luz);border:1px solid var(--bloque-borde);"
          )}
        >
          <span data-ia-pronto="" style={css("width:6px;height:6px;border-radius:50%;background:var(--oro-luz);")} />
          Próximamente
        </span>
        <h2 style={css("margin:0;font-weight:300;letter-spacing:-.025em;line-height:1.1;" + (compacta ? "font-size:clamp(23px,2.3vw,30px);" : "font-size:clamp(28px,3.1vw,42px);"))}>
          Una secretaria
          <br />
          que ya conoce tu consulta.
        </h2>
        <p style={css("margin:0;font-size:var(--t-body);line-height:1.65;color:var(--sobre-bloque-2);max-width:46ch;")}>
          {compacta
            ? "Un asistente que trabaja con tu agenda, tus cursos y tus números para que tú sólo atiendas."
            : "Un asistente que trabaja con lo que ya tienes aquí —tu agenda, tus cursos, tu comunidad y tus números— para que tú sólo atiendas."}
        </p>
        {!compacta && (
          <dl style={css("margin:6px 0 0;display:grid;border-top:1px solid var(--bloque-borde);max-width:52ch;")}>
            {HARA.map(([que, como]) => (
              <div key={que} data-ia-fila="" style={css("display:grid;gap:4px 20px;padding:13px 0;border-bottom:1px solid var(--bloque-borde);")}>
                <dt style={css("font-size:var(--t-body);font-weight:500;color:var(--sobre-bloque);")}>{que}</dt>
                <dd style={css("margin:0;font-size:var(--t-body);line-height:1.5;color:var(--sobre-bloque-2);")}>{como}</dd>
              </div>
            ))}
          </dl>
        )}
        {!compacta && (
          <p style={css("margin:0;font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>Cuando esté listo, lo activarás desde aquí. No tienes que preparar nada.</p>
        )}
      </div>
      {compacta ? (
        /* Siempre el lienzo estrecho: a 190 px de alto, el ancho dejaba la letra en 8. */
        <Diagrama medida="estrecho" tope={230} solo />
      ) : (
        <div data-ia-foto="" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escuela/secretaria.webp" alt="" width={896} height={1120} loading="lazy" />
        </div>
      )}
    </section>
  );
}
