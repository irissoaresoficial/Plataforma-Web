"use client";

/**
 * EL MAPA DE LOS CORREOS: cajas unidas por flechas (15 de noviembre de 2026).
 *
 * Ger: «quiero que se vea como el flujo de las cosas, como los diagramas».
 * La referencia es un editor de flujos —lienzo de puntos, cajas redondeadas
 * con su icono, líneas con flecha, zoom abajo—, pasado a la casa de Iris.
 *
 * Esto sólo DIBUJA. No sabe de Firestore ni de la web: recibe los flujos ya
 * contados (CorreosScreen) y avisa de qué caja se ha tocado. Así el dibujo se
 * puede revisar con datos de prueba sin tocar la base, y la cuenta de quién
 * recibe qué sigue en un único sitio.
 *
 * En el móvil el flujo se pone de pie: una caja debajo de otra y la flecha
 * hacia abajo. Seis cajas en fila no caben en 390 px ni con zoom.
 */

import { css } from "@/lib/css";

export type Tipo = "disparador" | "condicion" | "correo";
export type Estado = "hecho" | "saliendo" | "programado" | "parado" | "falta" | "siempre";

export type Nodo = {
  id: string;
  tipo: Tipo;
  icono: keyof typeof ICONOS;
  /** El rótulo pequeño de arriba: «Desde el 11 nov», «Al apuntarse». */
  cuando: string;
  titulo: string;
  /** Una línea de qué hace. */
  linea: string;
  estado: Estado;
  /** Lo que se lee en la pastilla de abajo: «12 salieron · 30 faltan». */
  cifra: string;
  /** La etiqueta de la flecha que sale de esta caja hacia la siguiente. */
  salida?: string;
  /** Una salida hacia abajo: la rama del «sí». */
  rama?: { etiqueta: string; texto: string };
};

export type Flujo = {
  id: string;
  titulo: string;
  firma: string;
  encendido: boolean;
  /** Si corre de verdad: encendido y con algo que mandar. Sólo entonces
   *  las flechas llevan el pulso que viaja de una caja a la siguiente. */
  vivo: boolean;
  estado: string;
  nodos: Nodo[];
};

/* ------------------------------------------------------------------ iconos
   Del mismo trazo que Iconos.tsx: 1,5 de grosor, puntas redondas, y cada uno
   dibuja la cosa que es. */
const T = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...T}>
    {children}
  </svg>
);
export const ICONOS = {
  lista: (
    <Svg>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r=".9" />
      <circle cx="4" cy="12" r=".9" />
      <circle cx="4" cy="18" r=".9" />
    </Svg>
  ),
  interruptor: (
    <Svg>
      <path d="M12 3.5v8" />
      <path d="M7.2 6.6a7 7 0 1 0 9.6 0" />
    </Svg>
  ),
  correo: (
    <Svg>
      <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.4" />
      <path d="m4.2 7 7.8 6 7.8-6" />
    </Svg>
  ),
  pregunta: (
    <Svg>
      <path d="M12 3 21 12 12 21 3 12Z" />
      <path d="M10.2 10.2a1.9 1.9 0 1 1 2.6 1.8c-.6.3-.8.7-.8 1.3" />
      <circle cx="12" cy="15.6" r=".5" />
    </Svg>
  ),
  web: (
    <Svg>
      <rect x="3" y="4.5" width="18" height="15" rx="2.6" />
      <path d="M3 9h18" />
      <path d="m9.5 14.5 1.8 1.8 3.6-3.8" />
    </Svg>
  ),
  confirmacion: (
    <Svg>
      <path d="M20 12.5a8 8 0 0 1-11.7 7.1L4 20.5l1-4.1A8 8 0 1 1 20 12.5Z" />
      <path d="m8.8 12.4 2.2 2.2 4.4-4.6" />
    </Svg>
  ),
  reloj: (
    <Svg>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  ),
};

/* El color de la pastilla de estado. Lo que está saliendo ahora es lo único
   que lleva el verde: es lo que hay que mirar. */
const COLOR: Record<Estado, string> = {
  hecho: "var(--text-4)",
  saliendo: "var(--green)",
  programado: "var(--gold)",
  parado: "var(--red)",
  falta: "var(--red)",
  siempre: "var(--green)",
};

function Caja({ n, paso, elegido, onElige }: { n: Nodo; paso: number; elegido: boolean; onElige: (id: string) => void }) {
  const vivo = n.estado === "saliendo" || n.estado === "siempre";
  return (
    <button
      type="button"
      className="mapa-caja"
      data-tipo={n.tipo}
      data-vivo={vivo ? "" : undefined}
      style={{ animationDelay: `${paso * 45}ms` }}
      data-elegido={elegido ? "" : undefined}
      aria-pressed={elegido}
      onClick={() => onElige(n.id)}
    >
      <span className="mapa-arriba">
        <span className="mapa-ico" aria-hidden="true">
          {ICONOS[n.icono]}
        </span>
        <span className="mapa-num" aria-hidden="true">
          {String(paso + 1).padStart(2, "0")}
        </span>
      </span>
      <span className="mapa-texto">
        <span className="mapa-cuando">{n.cuando}</span>
        <span className="mapa-titulo">{n.titulo}</span>
        <span className="mapa-linea">{n.linea}</span>
        <span className="mapa-cifra">
          <span className="mapa-led" style={css("background:" + COLOR[n.estado] + ";color:" + COLOR[n.estado] + ";")} />
          {n.cifra}
        </span>
      </span>
    </button>
  );
}

function Flecha({ etiqueta }: { etiqueta?: string }) {
  return (
    <span className="mapa-flecha" aria-hidden="true">
      <span className="mapa-raya" />
      {etiqueta && <span className="mapa-etiqueta">{etiqueta}</span>}
    </span>
  );
}

export default function Mapa({
  flujos,
  elegido,
  onElige,
  zoom,
}: {
  flujos: Flujo[];
  elegido: string | null;
  onElige: (id: string) => void;
  zoom: number;
}) {
  return (
    <div className="mapa-pista" style={{ zoom }}>
      {flujos.map((f) => (
        <section key={f.id} className="mapa-flujo" data-vivo={f.vivo ? "" : undefined} aria-label={f.titulo}>
          <header className="mapa-cabeza">
            <span className="mapa-nombre">{f.titulo}</span>
            <span className="mapa-chip" data-encendido={f.encendido ? "" : undefined}>
              <span style={css("width:7px;height:7px;border-radius:50%;background:" + (f.encendido ? "var(--green)" : "var(--red)") + ";")} />
              {f.estado}
            </span>
            <span className="mapa-firma">{f.firma}</span>
          </header>
          <ol className="mapa-fila">
            {f.nodos.map((n, i) => (
              <li key={n.id} className="mapa-paso">
                <span className="mapa-columna">
                  <Caja n={n} paso={i} elegido={elegido === n.id} onElige={onElige} />
                  {n.rama && (
                    <span className="mapa-rama">
                      <span className="mapa-bajada" aria-hidden="true">
                        <span className="mapa-etiqueta">{n.rama.etiqueta}</span>
                      </span>
                      <span className="mapa-fin">{n.rama.texto}</span>
                    </span>
                  )}
                </span>
                {i < f.nodos.length - 1 && <Flecha etiqueta={n.salida} />}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <style>{ESTILO}</style>
    </div>
  );
}

/*
 * Las medidas, en un sitio. La flecha va a la altura del centro del icono
 * (relleno 16 + medio icono 22 = 38), que es donde la referencia une las
 * cajas: se lee «de esto sale esto», no «una caja al lado de otra».
 */
const ESTILO = `
.mapa-pista { display:grid; gap:clamp(26px,3vw,44px); width:max-content; min-width:100%; }
.mapa-flujo { display:grid; gap:16px; }
.mapa-cabeza { display:flex; align-items:center; gap:10px 14px; flex-wrap:wrap; }
.mapa-nombre { font-family:var(--font-display); font-size:var(--t-title); font-weight:500; letter-spacing:-.02em; color:var(--text); }
.mapa-chip { display:inline-flex; align-items:center; gap:7px; padding:5px 11px; border-radius:var(--r-pill); font-size:var(--t-mini); font-weight:500; color:var(--text-2); background:var(--surface-2); border:1px solid var(--border); }
.mapa-firma { font-size:var(--t-mini); color:var(--text-3); }
.mapa-fila { list-style:none; margin:0; padding:0; display:flex; align-items:flex-start; }
.mapa-paso { display:flex; align-items:flex-start; }
.mapa-columna { display:flex; flex-direction:column; align-items:center; }

.mapa-caja {
  width:172px; display:flex; flex-direction:column; align-items:flex-start; gap:12px; text-align:left;
  padding:16px; border-radius:var(--r-medio); cursor:pointer; color:var(--text);
  font-family:var(--font-ui); background:var(--surface-solid); border:1px solid var(--border);
  box-shadow:var(--nm-alto), 0 10px 26px color-mix(in srgb, var(--text) 9%, transparent);
  transition:transform var(--t-rapido) var(--curva), border-color var(--t-normal), box-shadow var(--t-normal);
}
.mapa-caja:hover { border-color:var(--accion-borde); }
.mapa-caja:active { transform:scale(.97); }
.mapa-caja:focus-visible { outline:2px solid var(--accion); outline-offset:3px; }
.mapa-caja[data-elegido] { border-color:var(--accion); box-shadow:0 0 0 3px var(--accion-suave), 0 12px 30px color-mix(in srgb, var(--text) 14%, transparent); }

.mapa-caja { animation:mapa-entra 300ms var(--curva) both; }
@keyframes mapa-entra { from { opacity:0; transform:translateY(8px) scale(.98); } to { opacity:1; transform:none; } }
.mapa-arriba { width:100%; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.mapa-num { font-size:var(--t-mini); font-weight:500; font-variant-numeric:tabular-nums; letter-spacing:.04em; color:var(--text-4); padding:3px 8px; border-radius:var(--r-pill); background:var(--surface-2); }
.mapa-caja[data-vivo] .mapa-ico { box-shadow:0 0 0 4px var(--accion-suave), 0 6px 18px color-mix(in srgb, var(--accion) 22%, transparent); }
.mapa-led { position:relative; width:7px; height:7px; border-radius:50%; flex:none; }
.mapa-caja[data-vivo] .mapa-led::after { content:""; position:absolute; inset:-4px; border-radius:50%; border:1.5px solid currentColor; animation:mapa-late 2s var(--curva) infinite; }
@keyframes mapa-late { from { transform:scale(.5); opacity:.9; } to { transform:scale(1.7); opacity:0; } }
.mapa-ico { width:44px; height:44px; border-radius:var(--r-sm); display:grid; place-items:center; flex:none; }
.mapa-caja[data-tipo="disparador"] .mapa-ico { background:var(--accion); color:var(--sobre-accion); }
.mapa-caja[data-tipo="correo"] .mapa-ico { background:var(--accion-suave); color:var(--accion); border:1px solid var(--accion-borde); }
.mapa-caja[data-tipo="condicion"] .mapa-ico { background:transparent; color:var(--gold); border:1.5px dashed var(--gold); }

.mapa-texto { display:grid; gap:4px; min-width:0; }
.mapa-cuando { font-size:var(--t-mini); font-weight:500; color:var(--gold); }
.mapa-titulo { font-size:var(--t-body); font-weight:500; line-height:1.25; color:var(--text); }
.mapa-linea { font-size:var(--t-mini); line-height:1.4; color:var(--text-3); }
.mapa-cifra { margin-top:6px; display:inline-flex; align-items:center; gap:7px; font-size:var(--t-mini); font-weight:500; color:var(--text-2); }

.mapa-flecha { position:relative; width:46px; height:2px; margin-top:38px; flex:none; }
.mapa-raya { position:absolute; inset:0; background:color-mix(in srgb, var(--text) 30%, transparent); border-radius:2px; }
.mapa-raya::after { content:""; position:absolute; right:-1px; top:50%; width:8px; height:8px; border-top:2px solid color-mix(in srgb, var(--text) 30%, transparent); border-right:2px solid color-mix(in srgb, var(--text) 30%, transparent); transform:translateY(-50%) rotate(45deg); border-radius:1px; }
.mapa-etiqueta { position:absolute; left:50%; top:-26px; transform:translateX(-50%); padding:2px 8px; border-radius:var(--r-pill); font-size:var(--t-mini); font-weight:500; color:var(--text-2); background:var(--surface-solid); border:1px solid var(--border); white-space:nowrap; }

/* El pulso: una luz que viaja por la flecha, sólo en el flujo que corre. Se
   lee «de aquí pasa a aquí» sin decir nada. */
.mapa-flujo[data-vivo] .mapa-raya { overflow:visible; background:linear-gradient(90deg, color-mix(in srgb, var(--accion) 45%, transparent), color-mix(in srgb, var(--accion) 70%, transparent)); }
.mapa-flujo[data-vivo] .mapa-raya::before { content:""; position:absolute; top:50%; left:0; width:10px; height:10px; margin-top:-5px; border-radius:50%;
  background:var(--accion); box-shadow:0 0 0 3px var(--accion-suave), 0 0 12px var(--accion); animation:mapa-viaja 1.8s var(--curva) infinite; }
@keyframes mapa-viaja { 0% { left:0; opacity:0; } 15% { opacity:1; } 85% { opacity:1; } 100% { left:calc(100% - 10px); opacity:0; } }
.mapa-flujo:not([data-vivo]) .mapa-raya { background:repeating-linear-gradient(90deg, color-mix(in srgb, var(--text) 30%, transparent) 0 6px, transparent 6px 11px); }
.mapa-rama { display:flex; flex-direction:column; align-items:center; }
.mapa-bajada { position:relative; width:2px; height:44px; background:color-mix(in srgb, var(--text) 30%, transparent); }
.mapa-bajada .mapa-etiqueta { top:50%; left:12px; transform:translateY(-50%); }
.mapa-fin { max-width:172px; padding:9px 13px; border-radius:var(--r-sm); font-size:var(--t-mini); line-height:1.4; color:var(--text-2); background:var(--surface-2); border:1px dashed var(--border-strong); text-align:center; }

/* De pie, en el móvil: una caja bajo otra y la flecha hacia abajo. */
@media (max-width: 760px) {
  .mapa-pista { width:100%; zoom:1 !important; }
  .mapa-fila, .mapa-paso { flex-direction:column; align-items:stretch; }
  .mapa-columna { align-items:stretch; }
  .mapa-caja { position:relative; width:100%; flex-direction:row; align-items:flex-start; gap:14px; padding-right:52px; }
  .mapa-arriba { width:auto; }
  .mapa-num { position:absolute; top:14px; right:14px; }
  .mapa-flecha { width:2px; height:36px; margin:0 0 0 37px; }
  .mapa-raya::after { right:auto; top:auto; bottom:-1px; left:50%; transform:translateX(-50%) rotate(135deg); }
  .mapa-flujo[data-vivo] .mapa-raya { background:linear-gradient(180deg, color-mix(in srgb, var(--accion) 45%, transparent), color-mix(in srgb, var(--accion) 70%, transparent)); }
  .mapa-flujo[data-vivo] .mapa-raya::before { left:50%; margin:0 0 0 -5px; animation-name:mapa-baja; }
  .mapa-flujo:not([data-vivo]) .mapa-raya { background:repeating-linear-gradient(180deg, color-mix(in srgb, var(--text) 30%, transparent) 0 6px, transparent 6px 11px); }
  .mapa-etiqueta { top:50%; left:14px; transform:translateY(-50%); }
  .mapa-rama { align-items:flex-start; padding-left:37px; }
  .mapa-bajada { height:30px; }
  .mapa-fin { max-width:none; margin-left:-37px; margin-bottom:4px; text-align:left; }
}
@keyframes mapa-baja { 0% { top:0; opacity:0; } 15% { opacity:1; } 85% { opacity:1; } 100% { top:calc(100% - 10px); opacity:0; } }
@media (prefers-reduced-motion: reduce) {
  .mapa-caja, .mapa-led::after, .mapa-raya::before { animation:none !important; }
}
`;
