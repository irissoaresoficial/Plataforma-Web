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
 * SÓLO PARA CREADORES. Con `compacta` sale en la parte de abajo de cada una de
 * sus pantallas; entera, en su inicio.
 */
import { useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

const NODOS: Array<{ k: string; x: number; y: number; ya: boolean }> = [
  { k: "Cursos", x: 70, y: 60, ya: true },
  { k: "Comunidad", x: 70, y: 150, ya: true },
  { k: "Agenda", x: 70, y: 240, ya: true },
  { k: "Métricas", x: 410, y: 60, ya: true },
  { k: "Citas", x: 410, y: 150, ya: false },
  { k: "Pagos", x: 410, y: 240, ya: false },
];
const CX = 240;
const CY = 150;

function Diagrama({ alto }: { alto: number }) {
  const quieto = useReducedMotion();
  return (
    <svg data-ia-diagrama="" viewBox="0 0 480 300" width="100%" height={alto} role="img" aria-label="Cursos, comunidad, agenda, métricas, citas y pagos, conectados a tu agente de IA" style={css("display:block;overflow:visible;")}>
      <defs>
        <radialGradient id="ia-nucleo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--oro-luz)" stopOpacity="1" />
          <stop offset="60%" stopColor="var(--oro)" stopOpacity=".9" />
          <stop offset="100%" stopColor="var(--oro)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ia-linea" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--oro-luz)" stopOpacity=".15" />
          <stop offset="100%" stopColor="var(--oro-luz)" stopOpacity=".7" />
        </linearGradient>
      </defs>

      {/* Las líneas: curvas suaves de cada nodo al centro, con luz que corre. */}
      {NODOS.map((n, i) => {
        const medio = (n.x + CX) / 2;
        const d = `M ${n.x} ${n.y} C ${medio} ${n.y}, ${medio} ${CY}, ${CX} ${CY}`;
        return (
          <g key={n.k}>
            <path d={d} fill="none" stroke="var(--bloque-borde)" strokeWidth="1.2" />
            <path data-ia-flujo="" d={d} fill="none" stroke="url(#ia-linea)" strokeWidth="1.6" strokeDasharray="4 10" style={css(`animation-delay:${-i * 0.4}s;`)} />
            {!quieto && (
              <circle r="3" fill="var(--oro-luz)">
                <animateMotion dur={`${2.6 + i * 0.25}s`} repeatCount="indefinite" path={d} begin={`${i * 0.35}s`} />
                <animate attributeName="opacity" values="0;1;1;0" dur={`${2.6 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
              </circle>
            )}
          </g>
        );
      })}

      {/* El centro: el agente, latiendo. */}
      <circle data-ia-halo="" cx={CX} cy={CY} r="58" fill="url(#ia-nucleo)" opacity=".35" />
      <circle cx={CX} cy={CY} r="44" fill="none" stroke="var(--oro-luz)" strokeOpacity=".35" strokeWidth="1" />
      <circle cx={CX} cy={CY} r="34" fill="var(--vino)" stroke="var(--oro-luz)" strokeWidth="1.5" />
      <path
        d={`M ${CX} ${CY - 13} l 3.6 9.4 9.4 3.6 -9.4 3.6 -3.6 9.4 -3.6 -9.4 -9.4 -3.6 9.4 -3.6 z`}
        fill="var(--oro-luz)"
      />

      {/* Los nodos: lo que ya hay, sólido; lo que viene, punteado. */}
      {NODOS.map((n) => (
        <g key={`n-${n.k}`}>
          <rect
            x={n.x - 52}
            y={n.y - 17}
            width="104"
            height="34"
            rx="17"
            fill={n.ya ? "var(--bloque-2)" : "transparent"}
            stroke={n.ya ? "var(--bloque-borde)" : "var(--oro-luz)"}
            strokeOpacity={n.ya ? 1 : 0.55}
            strokeDasharray={n.ya ? undefined : "3 4"}
          />
          <circle cx={n.x - 36} cy={n.y} r="3.5" fill={n.ya ? "var(--oro-luz)" : "transparent"} stroke="var(--oro-luz)" strokeWidth="1" />
          <text x={n.x - 26} y={n.y + 4.5} fill="var(--sobre-bloque)" fontSize="13" fontFamily="var(--font-ui)">
            {n.k}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function SecretariaIA({ compacta = false }: { compacta?: boolean }) {
  return (
    <section
      data-ia=""
      style={css(
        "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);display:grid;gap:var(--gap-lg);align-items:center;" +
          (compacta ? "padding:var(--pad-card-sm);" : "padding:var(--pad-card);") +
          "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);box-shadow:var(--shadow-lg);" +
          "background-image:radial-gradient(600px 320px at 85% 50%,color-mix(in srgb, var(--oro) 28%, transparent),transparent 70%);"
      )}
    >
      <div style={css("min-width:0;display:flex;flex-direction:column;gap:12px;")}>
        <span data-ia-pronto="" style={css("align-self:flex-start;font-size:var(--t-mini);font-weight:600;padding:6px 14px;border-radius:var(--r-pill);color:var(--vino);")}>
          ✦ Próximamente
        </span>
        <h2 style={css("margin:0;font-weight:300;letter-spacing:-.03em;line-height:1.08;" + (compacta ? "font-size:clamp(24px,2.4vw,32px);" : "font-size:clamp(30px,3.4vw,46px);"))}>
          Tu empresa de terapeuta, conectada
        </h2>
        <p style={css("margin:0;font-size:var(--t-body);line-height:1.6;color:var(--sobre-bloque-2);max-width:52ch;")}>
          Tus cursos, tu comunidad, tu agenda y tus números ya viven aquí. Muy pronto, un agente de IA que conocerá tu negocio los unirá y será tu secretaria: te
          ordenará la agenda, confirmará tus citas y llevará tus cobros.
        </p>
        {!compacta && (
          <div style={css("display:flex;gap:16px;flex-wrap:wrap;font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>
            <span style={css("display:flex;align-items:center;gap:8px;")}>
              <span style={css("width:9px;height:9px;border-radius:50%;background:var(--oro-luz);")} /> Ya lo tienes
            </span>
            <span style={css("display:flex;align-items:center;gap:8px;")}>
              <span style={css("width:9px;height:9px;border-radius:50%;border:1px dashed var(--oro-luz);")} /> Llega con el agente
            </span>
          </div>
        )}
      </div>
      <Diagrama alto={compacta ? 200 : 300} />
    </section>
  );
}
