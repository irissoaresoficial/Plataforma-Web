"use client";
/**
 * ============================================================================
 * EL PLANO, CON EL LUOPAN ENCIMA
 * ============================================================================
 *
 * Lo que hace un consultor sobre la mesa: pone el luopan en el centro del
 * plano, lo orienta según la fachada medida y parte la vivienda en nueve
 * casillas iguales siguiendo sus paredes.
 *
 * Aquí, igual:
 *   · El plano se sube como imagen (foto o captura del PDF del arquitecto).
 *   · Se dice por qué lado del plano está la fachada.
 *   · La cuadrícula se ajusta a las paredes arrastrando sus dos esquinas: un
 *     plano casi nunca ocupa la imagen entera, y las casillas tienen que ser
 *     de la VIVIENDA, no del papel.
 *   · El luopan se pinta encima, girado con la orientación medida, y cada
 *     casilla dice su dirección y sus estrellas. Se pulsa una y sale su
 *     lectura.
 *
 * Sin plano también funciona: sale una vivienda en blanco con sus nueve
 * casillas, que es lo que se usa con un plano dibujado a mano en la visita.
 */
import { useRef } from "react";
import { css } from "@/lib/css";
import { ANGULO_LADO, type Carta, type CartaNatal, type Casilla, type Dir, type Lado, type Mansion } from "@/lib/fengshui/calculo";
import Cuadricula, { type Marcas } from "./Cuadricula";
import Luopan from "./Luopan";

type Rejilla = { x: number; y: number; w: number; h: number };

type Props = {
  imagen: string | null;
  rejilla: Rejilla;
  alCambiarRejilla?: (r: Rejilla) => void;
  fachada: number;
  lado: Lado;
  carta: CartaNatal | null;
  anual?: Carta | null;
  marcas?: Marcas | null;
  mansiones?: Record<Dir, Mansion> | null;
  conLuopan?: boolean;
  seleccion?: Casilla | null;
  alElegir?: (c: Casilla) => void;
  estancias?: Partial<Record<string, string[]>>;
  /** Hacia dónde apunta la flecha del norte del plano, en grados de pantalla. */
  norte?: number | null;
  alCambiarNorte?: (n: number) => void;
  papel?: boolean;
};

const limita = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function Plano({ imagen, rejilla, alCambiarRejilla, fachada, lado, carta, anual, marcas, mansiones, conLuopan = true, seleccion, alElegir, estancias, norte = null, alCambiarNorte, papel }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ esquina: "a" | "b"; id: number } | null>(null);
  const rosa = useRef<HTMLSpanElement>(null);
  const girando = useRef(false);

  /* LA FLECHA DEL NORTE: se gira con el dedo hasta que apunte como la del
     plano. Todo lo demás —la orientación de la fachada, la carta— sale de
     ahí. */
  const giraNorte = (e: React.PointerEvent) => {
    if (!girando.current || !alCambiarNorte || !rosa.current) return;
    const r = rosa.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    const g = (Math.atan2(x, -y) * 180) / Math.PI;
    alCambiarNorte(Math.round((((g % 360) + 360) % 360) * 2) / 2);
  };

  const mueve = (e: React.PointerEvent) => {
    if (!arrastre.current || !alCambiarRejilla || !caja.current) return;
    const r = caja.current.getBoundingClientRect();
    const px = limita(((e.clientX - r.left) / r.width) * 100, 0, 100);
    const py = limita(((e.clientY - r.top) / r.height) * 100, 0, 100);
    const { x, y, w, h } = rejilla;
    if (arrastre.current.esquina === "a") {
      const nx = Math.min(px, x + w - 12);
      const ny = Math.min(py, y + h - 12);
      alCambiarRejilla({ x: nx, y: ny, w: x + w - nx, h: y + h - ny });
    } else {
      alCambiarRejilla({ x, y, w: Math.max(12, px - x), h: Math.max(12, py - y) });
    }
  };

  const asa = (esquina: "a" | "b") => (
    <span
      role="slider"
      aria-label={esquina === "a" ? "Esquina superior izquierda de la vivienda" : "Esquina inferior derecha de la vivienda"}
      aria-valuenow={Math.round(esquina === "a" ? rejilla.x : rejilla.x + rejilla.w)}
      tabIndex={0}
      data-chrome="1"
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        arrastre.current = { esquina, id: e.pointerId };
      }}
      onPointerMove={mueve}
      onPointerUp={() => (arrastre.current = null)}
      onPointerCancel={() => (arrastre.current = null)}
      style={css(
        "position:absolute;z-index:4;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;cursor:nwse-resize;touch-action:none;" +
          "background:var(--accion);border:3px solid var(--surface);box-shadow:0 2px 8px rgba(0,0,0,.25);" +
          (esquina === "a" ? `left:${rejilla.x}%;top:${rejilla.y}%;` : `left:${rejilla.x + rejilla.w}%;top:${rejilla.y + rejilla.h}%;`)
      )}
    />
  );

  return (
    <div
      ref={caja}
      style={css(
        "position:relative;width:100%;overflow:hidden;" +
          (papel ? "border:0.75px solid #c9bfa9;" : "border-radius:var(--r-tarjeta);border:1px solid var(--border);box-shadow:var(--nm-alto);") +
          (imagen ? "" : "aspect-ratio:4/3;background:repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in srgb, var(--text) 5%, transparent) 23px 24px),repeating-linear-gradient(90deg, var(--surface) 0 23px, color-mix(in srgb, var(--text) 5%, transparent) 23px 24px);")
      )}
    >
      {imagen && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={imagen} alt="Plano de la vivienda" style={css("display:block;width:100%;height:auto;")} draggable={false} />
      )}

      {/* La vivienda: la cuadrícula y, centrado en ella, el luopan. */}
      <div
        style={css(
          `position:absolute;left:${rejilla.x}%;top:${rejilla.y}%;width:${rejilla.w}%;height:${rejilla.h}%;` +
            (imagen ? "" : "border:2px solid var(--text-3);border-radius:4px;")
        )}
      >
        {conLuopan && (
          <div style={css("position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:1;container-type:size;")}>
            <div style={css("width:min(100cqw,100cqh);aspect-ratio:1;")}>
              <Luopan grados={fachada} haciaPantalla={ANGULO_LADO[lado]} sobrePlano etiqueta="Luopan orientado sobre el plano" />
            </div>
          </div>
        )}
        <div style={css("position:absolute;inset:0;z-index:2;")}>
          <Cuadricula carta={carta} fachada={fachada} lado={lado} anual={anual} marcas={marcas} mansiones={mansiones} seleccion={seleccion} alElegir={alElegir} estancias={estancias} modo="plano" />
        </div>
        {/* La flecha de la fachada, por fuera de la casilla del centro de ese lado. */}
        <span
          aria-hidden
          style={css(
            "position:absolute;z-index:3;padding:3px 10px;border-radius:var(--r-pill);background:var(--red);color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;" +
              (lado === "abajo"
                ? "left:50%;bottom:-11px;transform:translateX(-50%);"
                : lado === "arriba"
                  ? "left:50%;top:-11px;transform:translateX(-50%);"
                  : lado === "izquierda"
                    ? "top:50%;left:-11px;transform:translate(-30%,-50%) rotate(-90deg);"
                    : "top:50%;right:-11px;transform:translate(30%,-50%) rotate(90deg);")
          )}
        >
          Fachada · {fachada.toFixed(1)}°
        </span>
      </div>

      {alCambiarRejilla && asa("a")}
      {alCambiarRejilla && asa("b")}

      {(alCambiarNorte || norte !== null) && (
        <span
          ref={rosa}
          role={alCambiarNorte ? "slider" : undefined}
          aria-label="Flecha del norte del plano"
          aria-valuenow={norte ?? undefined}
          tabIndex={alCambiarNorte ? 0 : undefined}
          onPointerDown={(e) => {
            if (!alCambiarNorte) return;
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            girando.current = true;
            giraNorte(e);
          }}
          onPointerMove={giraNorte}
          onPointerUp={() => (girando.current = false)}
          onPointerCancel={() => (girando.current = false)}
          onKeyDown={(e) => {
            if (!alCambiarNorte) return;
            const paso = e.shiftKey ? 5 : 0.5;
            if (e.key === "ArrowRight") alCambiarNorte((((norte ?? 0) + paso) % 360 + 360) % 360);
            if (e.key === "ArrowLeft") alCambiarNorte((((norte ?? 0) - paso) % 360 + 360) % 360);
          }}
          style={css(
            "position:absolute;z-index:5;top:12px;right:12px;width:74px;height:74px;border-radius:50%;display:grid;place-items:center;" +
              (papel ? "background:#fffdf8;border:0.75px solid #c9bfa9;" : "background:var(--vidrio-denso);backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);border:1px solid var(--vidrio-borde);box-shadow:var(--shadow);") +
              (alCambiarNorte ? "cursor:grab;touch-action:none;" : "") +
              (norte === null ? "opacity:.75;" : "")
          )}
        >
          <svg viewBox="-40 -40 80 80" width="62" height="62" aria-hidden style={{ transform: `rotate(${norte ?? 0}deg)`, transition: girando.current ? "none" : "transform 160ms ease-out" }}>
            <path d="M0 -21 L8 5 L0 0 L-8 5 Z" style={{ fill: "var(--red)" }} />
            <path d="M0 28 L8 2 L0 7 L-8 2 Z" style={{ fill: "var(--text-3)", opacity: 0.55 }} />
            <text x="0" y="-25" textAnchor="middle" style={{ fill: "var(--red)", fontSize: 12, fontWeight: 800 }}>
              N
            </text>
          </svg>
        </span>
      )}
    </div>
  );
}
