"use client";

/**
 * EL AGENTE DE CORREOS: la cabeza visible del sistema (15 de noviembre de 2026).
 *
 * Ger: «que se vea más agéntico, más IA, más tecnología». Lo que hace que algo
 * parezca un agente no es un brillo: es que diga qué va a hacer, cuándo y por
 * qué. Esta pieza lo dice, contado con los datos de verdad:
 *
 *   · la cuenta atrás a la próxima ronda (el reloj de Vercel, 7:00 UTC, que
 *     es las 8:00 en Madrid en invierno);
 *   · el plan de esa ronda, con las mismas reglas que la web
 *     (apps/web/app/api/recordatorios): primero los recordatorios de las
 *     inscritas que toquen ese día, y la lista de Marco con lo que quede del
 *     tope. Si está apagada o falta la lista, lo dice.
 *
 * Es la pieza granate de la pantalla (--bloque): una por pantalla.
 */

import { useEffect, useState } from "react";
import { css } from "@/lib/css";

export type Paso = { tipo: "sale" | "espera" | "parado"; texto: React.ReactNode };

/** La próxima ronda del reloj: hoy a las 7:00 UTC si aún no ha pasado, si no mañana. */
export function proximaRonda(ahora = new Date()): Date {
  const r = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 7, 0, 0));
  if (r.getTime() <= ahora.getTime()) r.setUTCDate(r.getUTCDate() + 1);
  return r;
}

const dosCifras = (n: number) => String(n).padStart(2, "0");

export default function Agente({ activo, plan, cargando }: { activo: boolean; plan: Paso[]; cargando: boolean }) {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    const t0 = setTimeout(() => setAhora(new Date()), 0);
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  const ronda = proximaRonda(ahora ?? new Date(0));
  const falta = ahora ? Math.max(0, ronda.getTime() - ahora.getTime()) : 0;
  const h = Math.floor(falta / 3.6e6);
  const m = Math.floor((falta % 3.6e6) / 6e4);
  const s = Math.floor((falta % 6e4) / 1e3);
  const largo = ahora
    ? ronda.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }) +
      " · " +
      ronda.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })
    : "";
  const cuando = largo.charAt(0).toUpperCase() + largo.slice(1);

  return (
    <section className="agente" aria-label="Agente de correos" data-activo={activo ? "" : undefined}>
      <div className="agente-cabeza">
        <span className="agente-nucleo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.2 13.6 8.4 18.8 10 13.6 11.6 12 16.8 10.4 11.6 5.2 10 10.4 8.4Z" />
            <path d="M18.4 15.6 19.1 17.7 21.2 18.4 19.1 19.1 18.4 21.2 17.7 19.1 15.6 18.4 17.7 17.7Z" />
          </svg>
        </span>
        <span style={css("display:grid;gap:3px;min-width:0;")}>
          <span className="agente-nombre">Agente de correos</span>
          <span className="agente-estado">
            <span className="agente-punto" />
            {activo ? "Activo · trabaja solo cada mañana" : "En espera · no hay nada encendido"}
          </span>
        </span>
      </div>

      <div className="agente-reloj">
        <span className="agente-rotulo">Próxima ronda</span>
        <span className="agente-cifra" aria-live="off">
          {ahora ? `${dosCifras(h)}:${dosCifras(m)}:${dosCifras(s)}` : "--:--:--"}
        </span>
        <span className="agente-cuando">{cuando}</span>
      </div>

      <div className="agente-plan">
        <span className="agente-rotulo">Lo que va a hacer</span>
        <ol>
          {cargando ? (
            <li data-tipo="espera">
              <span className="agente-marca" />
              Leyendo la lista y las inscritas…
            </li>
          ) : (
            plan.map((p, i) => (
              <li key={i} data-tipo={p.tipo} style={{ animationDelay: `${i * 70}ms` }}>
                <span className="agente-marca" />
                <span>{p.texto}</span>
              </li>
            ))
          )}
        </ol>
      </div>
      <style>{ESTILO}</style>
    </section>
  );
}

/*
 * Lo único que se mueve solo es lo que está vivo: el punto del agente cuando
 * está activo. MARCA.md dice que en cristal nada se mueve solo; esto es la
 * excepción que pidió Ger y significa algo («está trabajando»). Con
 * «reducir movimiento» se queda quieto.
 */
const ESTILO = `
.agente { position:relative; overflow:hidden; display:grid; grid-template-columns:minmax(220px,.9fr) auto minmax(280px,1.6fr); gap:clamp(18px,2.4vw,36px); align-items:center;
  padding:clamp(18px,2vw,26px) clamp(18px,2.2vw,30px); border-radius:var(--r-panel); background:var(--bloque); color:var(--sobre-bloque);
  box-shadow:0 18px 44px color-mix(in srgb, var(--vino) 26%, transparent); }
.agente::before { content:""; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(60% 120% at 0% 0%, color-mix(in srgb, var(--oro-luz) 16%, transparent), transparent 60%),
             radial-gradient(40% 90% at 100% 100%, color-mix(in srgb, var(--oro-luz) 9%, transparent), transparent 70%); }
.agente::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.35;
  background-image:radial-gradient(circle, color-mix(in srgb, var(--sobre-bloque) 22%, transparent) 1px, transparent 1.5px); background-size:18px 18px;
  mask-image:linear-gradient(90deg, transparent, #000 70%); -webkit-mask-image:linear-gradient(90deg, transparent, #000 70%); }
.agente > * { position:relative; z-index:1; }
.agente-cabeza { display:flex; align-items:center; gap:14px; min-width:0; }
.agente-nucleo { width:52px; height:52px; flex:none; display:grid; place-items:center; border-radius:var(--r-medio); color:var(--oro-luz);
  background:color-mix(in srgb, var(--sobre-bloque) 8%, transparent); border:1px solid color-mix(in srgb, var(--oro-luz) 34%, transparent);
  box-shadow:inset 0 0 18px color-mix(in srgb, var(--oro-luz) 14%, transparent); }
.agente-nombre { font-size:var(--t-title); font-weight:500; letter-spacing:-.02em; }
.agente-estado { display:inline-flex; align-items:center; gap:8px; font-size:var(--t-mini); color:color-mix(in srgb, var(--sobre-bloque) 84%, transparent); }
.agente-punto { position:relative; width:8px; height:8px; border-radius:50%; background:color-mix(in srgb, var(--sobre-bloque) 45%, transparent); }
.agente[data-activo] .agente-punto { background:var(--oro-luz); }
.agente[data-activo] .agente-punto::after { content:""; position:absolute; inset:-4px; border-radius:50%; border:1.5px solid var(--oro-luz); animation:agente-late 2s var(--curva) infinite; }
@keyframes agente-late { from { transform:scale(.5); opacity:.9; } to { transform:scale(1.8); opacity:0; } }

.agente-rotulo { font-size:var(--t-mini); font-weight:500; color:var(--oro-luz); }
.agente-reloj { display:grid; gap:2px; padding:0 clamp(0px,2vw,28px); border-left:1px solid color-mix(in srgb, var(--sobre-bloque) 16%, transparent); border-right:1px solid color-mix(in srgb, var(--sobre-bloque) 16%, transparent); }
.agente-cifra { font-size:calc(var(--t-head) * 1.5); font-weight:300; letter-spacing:-.02em; line-height:1.05; font-variant-numeric:tabular-nums; }
.agente-cuando { font-size:var(--t-mini); color:color-mix(in srgb, var(--sobre-bloque) 84%, transparent); }

.agente-plan { display:grid; gap:8px; min-width:0; }
.agente-plan ol { list-style:none; margin:0; padding:0; display:grid; gap:7px; }
.agente-plan li { display:flex; align-items:flex-start; gap:10px; font-size:var(--t-body); line-height:1.4; color:var(--sobre-bloque); animation:agente-entra 320ms var(--curva) both; }
.agente-plan li b { font-weight:500; color:var(--oro-luz); }
.agente-marca { width:14px; height:14px; margin-top:3px; flex:none; border-radius:50%; border:1.5px solid var(--oro-luz); }
.agente-plan li[data-tipo="sale"] .agente-marca { background:var(--oro-luz); box-shadow:0 0 10px color-mix(in srgb, var(--oro-luz) 55%, transparent); }
.agente-plan li[data-tipo="parado"] { color:color-mix(in srgb, var(--sobre-bloque) 84%, transparent); }
.agente-plan li[data-tipo="parado"] .agente-marca { border-style:dashed; }
@keyframes agente-entra { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

@media (max-width: 1100px) {
  .agente { grid-template-columns:1fr auto; }
  .agente-plan { grid-column:1 / -1; }
  .agente-reloj { border-right:none; }
}
@media (max-width: 560px) {
  .agente { grid-template-columns:1fr; }
  .agente-reloj { border:none; padding:14px 0; border-top:1px solid color-mix(in srgb, var(--sobre-bloque) 16%, transparent); border-bottom:1px solid color-mix(in srgb, var(--sobre-bloque) 16%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .agente-punto::after, .agente-plan li { animation:none !important; }
}
`;
