"use client";
/**
 * ============================================================================
 * LA MESA DEL PLANO
 * ============================================================================
 *
 * Gerson, el 7 de noviembre de 2026: «debe haber alguna forma en la que se
 * pueda mover tanto el plano como la brújula, y que especifique siempre en el
 * momento de subir el plano cuál es el norte del plano, y siempre que marque
 * el norte de la brújula».
 *
 * Lo que hay sobre la mesa, de abajo arriba:
 *
 *   · EL PLANO. Se arrastra para moverlo, se acerca con los botones (o con dos
 *     dedos, o con Ctrl y la rueda) y se gira. «Norte arriba» lo deja como un
 *     mapa. Girarlo no cambia ningún cálculo: es sólo cómo se mira.
 *   · EL LUOPAN, pegado al plano: se mueve y se gira con él. Con «Mover el
 *     luopan» se arrastra a cualquier sitio (la puerta, una habitación) y se le
 *     cambia el tamaño. Su Norte va marcado con una N roja por fuera.
 *   · LAS NUEVE ZONAS, que siguen las paredes. Con «Paredes» se ajustan sus
 *     cuatro esquinas y se giran, para los planos fotografiados torcidos.
 *   · LA ROSA de arriba a la derecha: dónde está el Norte en la pantalla, en
 *     todo momento. Pulsarla pone el Norte arriba.
 *
 * AL SUBIR UN PLANO, DOS PASOS QUE NO SE SALTAN: dónde apunta el norte que
 * trae dibujado, y por qué lado está la fachada. Con eso sale la orientación
 * sin salir de casa. Si el plano no trae norte, se dice, y entonces manda la
 * medida del luopan.
 */
import { useEffect, useRef, useState } from "react";
import { css } from "@/lib/css";
import { botonPrincipal, BOTON_NORMAL, BOTON_PLANO } from "@/lib/ui";
import { ANGULO_LADO, NOMBRE_DIR, dirDe, norm, type Carta, type CartaNatal, type Casilla, type Dir, type Lado, type Mansion } from "@/lib/fengshui/calculo";
import Cuadricula, { type Marcas } from "./Cuadricula";
import Luopan from "./Luopan";
import m from "./Mesa.module.css";

export type Rejilla = { x: number; y: number; w: number; h: number };
export type PosLuopan = { x: number; y: number; d: number };
export type Paso = "norte" | "fachada" | null;
type Modo = "ver" | "paredes" | "luopan";

type Props = {
  imagen: string | null;
  rejilla: Rejilla;
  giroRejilla: number;
  alCambiarRejilla: (r: Rejilla) => void;
  alGirarRejilla: (g: number) => void;
  /** Hacia dónde mira la fachada, en grados. null = todavía no se sabe. */
  fachada: number | null;
  lado: Lado;
  alCambiarLado: (l: Lado) => void;
  /** Hacia dónde apunta el norte dibujado en la imagen (0 arriba, 90 derecha). */
  norte: number | null;
  alCambiarNorte: (n: number | null) => void;
  carta: CartaNatal | null;
  anual?: Carta | null;
  marcas?: Marcas | null;
  mansiones?: Record<Dir, Mansion> | null;
  conLuopan: boolean;
  luopan: PosLuopan | null;
  alMoverLuopan: (p: PosLuopan | null) => void;
  /** Cuánto está girado el plano en pantalla. Se guarda al soltar. */
  giroVista: number;
  alGirarVista: (g: number) => void;
  seleccion?: Casilla | null;
  alElegir?: (c: Casilla) => void;
  estancias?: Partial<Record<string, string[]>>;
  paso: Paso;
  alPaso: (p: Paso) => void;
  alSubir: () => void;
  /** Cuando el norte dibujado y la orientación guardada no coinciden: dar la
   *  razón al plano. Sólo se ofrece si hay algo que arreglar. */
  alUsarNortePlano?: () => void;
};

const RAD = Math.PI / 180;
/** Lo que ocupa el plano encajado: un poco de aire a los lados. */
const AIRE_W = 0.9;
/** Arriba, un margen; abajo, el sitio de la barra o de la tarjeta del paso,
 *  para que nunca tapen el plano. */
const MARGEN_ARRIBA = 22;
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 6;
const limita = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** Un ángulo en (−180, 180]. */
const corto = (g: number) => {
  const n = norm(g);
  return n > 180 ? n - 360 : n;
};
/** Si cae a menos de 4° de un giro recto, se queda en el recto. */
const imanRecto = (g: number) => {
  const r = Math.round(g / 90) * 90;
  return Math.abs(g - r) < 4 ? r : g;
};
const gira = (x: number, y: number, g: number) => {
  const c = Math.cos(g * RAD);
  const s = Math.sin(g * RAD);
  return { x: x * c - y * s, y: x * s + y * c };
};

/* ------------------------------------------------------------- LOS ICONOS */
const Ico = ({ d, children }: { d?: string; children?: React.ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d ? <path d={d} /> : children}
  </svg>
);
const IcoMenos = () => <Ico d="M5 12h14" />;
const IcoMas = () => <Ico d="M12 5v14M5 12h14" />;
const IcoEncajar = () => <Ico d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />;
const IcoGiraIzq = () => <Ico d="M4 4v6h6M4.6 15a8 8 0 1 0 1.9-8.3L4 10" />;
const IcoGiraDer = () => <Ico d="M20 4v6h-6M19.4 15a8 8 0 1 1-1.9-8.3L20 10" />;
const IcoParedes = () => (
  <Ico>
    <rect x="4" y="4" width="16" height="16" rx="1.5" />
    <path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" opacity=".55" />
  </Ico>
);
const IcoLuopan = () => (
  <Ico>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 5.5l2 6.5h-4z" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" />
  </Ico>
);

export default function MesaPlano(p: Props) {
  const { imagen, rejilla, giroRejilla: beta, fachada, lado, norte, paso } = p;
  const escenario = useRef<HTMLDivElement>(null);
  const [caja, setCaja] = useState({ w: 0, h: 0 });
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [vista, setVista] = useState({ x: 0, y: 0, s: 1 });
  const [giro, setGiro] = useState(p.giroVista);
  const [modo, setModo] = useState<Modo>("ver");
  const [borrador, setBorrador] = useState(norte ?? 0);
  const [arrastrando, setArrastrando] = useState(false);

  /* El tamaño de la mesa, siempre al día: la ventana cambia, el panel se
     pliega, el móvil se gira. */
  useEffect(() => {
    const el = escenario.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCaja({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* La proporción de la imagen: un plano vertical no se encaja igual que uno
     apaisado. Sin plano, una hoja de 4 por 3. */
  useEffect(() => {
    if (!imagen) return;
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imagen;
  }, [imagen]);
  const ar = imagen && nat ? nat.w / nat.h : 4 / 3;
  const enPaso = paso !== null;
  const reserva = enPaso ? (caja.w < 560 ? 250 : 196) : 74;
  /** El hueco donde se encaja el plano y cuánto se sube su centro. */
  const altoUtil = Math.max(120, caja.h - reserva - MARGEN_ARRIBA);
  const SUBE = (MARGEN_ARRIBA - reserva) / 2;

  /* El plano encajado, sin girar ni acercar. Todo lo demás se mide contra él. */
  let bw = 0;
  let bh = 0;
  if (caja.w && caja.h) {
    const W = caja.w * AIRE_W;
    const H = altoUtil;
    if (W / H > ar) {
      bh = H;
      bw = H * ar;
    } else {
      bw = W;
      bh = W / ar;
    }
  }
  /** Cuánto hay que alejar para que el plano girado quepa entero. */
  const encaje = (g: number) => {
    if (!bw) return 1;
    const c = Math.abs(Math.cos(g * RAD));
    const s = Math.abs(Math.sin(g * RAD));
    return Math.min(1, (caja.w * AIRE_W) / (bw * c + bh * s), altoUtil / (bw * s + bh * c));
  };

  /* La rejilla y el luopan, en píxeles del plano encajado. */
  const R = { x: (rejilla.x / 100) * bw, y: (rejilla.y / 100) * bh, w: (rejilla.w / 100) * bw, h: (rejilla.h / 100) * bh };
  const centroRejilla = { x: R.x + R.w / 2, y: R.y + R.h / 2 };
  const L = p.luopan
    ? { x: (p.luopan.x / 100) * bw, y: (p.luopan.y / 100) * bh, d: (p.luopan.d / 100) * bw }
    : { x: centroRejilla.x, y: centroRejilla.y, d: Math.min(R.w, R.h) };

  /*
   * EL NORTE QUE SE PINTA. El del luopan, que es el que usan las zonas: sale
   * de la orientación de la fachada. Si todavía no hay orientación, el que
   * trae dibujado el plano. Va en grados de la imagen (0 = arriba de la foto).
   */
  const norteLuopan = fachada !== null ? norm(ANGULO_LADO[lado] + beta - fachada) : norte;
  const separados = norte !== null && norteLuopan !== null && Math.abs(corto(norte - norteLuopan)) > 10;
  const norteEnPantalla = norteLuopan === null ? null : norm(norteLuopan + giro);

  /* ------------------------------------------------- DE LA PANTALLA AL PLANO */
  const aPlano = (cx: number, cy: number) => {
    const r = escenario.current!.getBoundingClientRect();
    const vx = (cx - (r.left + r.width / 2 + vista.x)) / vista.s;
    const vy = (cy - (r.top + r.height / 2 + SUBE + vista.y)) / vista.s;
    const u = gira(vx, vy, -giro);
    return { x: u.x + bw / 2, y: u.y + bh / 2 };
  };

  /* -------------------------------------------------- MOVER, ACERCAR, GIRAR */
  const commitGiro = (g: number) => {
    const n = corto(imanRecto(g));
    setGiro(n);
    p.alGirarVista(n);
    return n;
  };
  const vaA = (g: number) => {
    const n = commitGiro(g);
    setVista({ x: 0, y: 0, s: encaje(n) });
  };
  const acerca = (f: number, cx?: number, cy?: number) => {
    setVista((v) => {
      const s = limita(v.s * f, ZOOM_MIN, ZOOM_MAX);
      if (cx === undefined || cy === undefined || !escenario.current) return { ...v, s };
      /* Se acerca hacia el punto del ratón: ese punto no se mueve. */
      const r = escenario.current.getBoundingClientRect();
      const qx = cx - (r.left + r.width / 2);
      const qy = cy - (r.top + r.height / 2 + SUBE);
      return { s, x: qx - (qx - v.x) * (s / v.s), y: qy - (qy - v.y) * (s / v.s) };
    });
  };

  /* Ctrl + rueda (y el pellizco del trackpad, que llega igual) acerca. La
     rueda sola baja la página como siempre: la mesa no secuestra el scroll. */
  const acercaRef = useRef(acerca);
  useEffect(() => {
    acercaRef.current = acerca;
  });
  useEffect(() => {
    const el = escenario.current;
    if (!el) return;
    const rueda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      acercaRef.current(Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", rueda, { passive: false });
    return () => el.removeEventListener("wheel", rueda);
  }, []);

  /* Al entrar en el paso del norte, el plano se pone recto y entero: la aguja
     se compara con la flecha dibujada tal como está en el papel. */
  const pasoAntes = useRef<Paso>(null);
  useEffect(() => {
    if (paso === "norte" && pasoAntes.current !== "norte") {
      setGiro(0);
      setVista({ x: 0, y: 0, s: 1 });
      setBorrador(norte ?? 0);
      setModo("ver");
    }
    pasoAntes.current = paso;
  }, [paso, norte]);

  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<
    | null
    | { tipo: "mover"; x0: number; y0: number; vx: number; vy: number; movido: boolean; tactil: boolean }
    | { tipo: "pinza"; d0: number; a0: number; mx: number; my: number; v: { x: number; y: number; s: number }; g0: number }
    | { tipo: "aguja" }
  >(null);
  const hubo = useRef(false);

  const anguloPantalla = (cx: number, cy: number) => {
    const r = escenario.current!.getBoundingClientRect();
    return norm((Math.atan2(cx - (r.left + r.width / 2), -(cy - (r.top + r.height / 2 + SUBE))) * 180) / Math.PI);
  };

  const empieza = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-quieto]")) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (paso === "norte") {
      e.currentTarget.setPointerCapture(e.pointerId);
      gesto.current = { tipo: "aguja" };
      setBorrador(Math.round(anguloPantalla(e.clientX, e.clientY) * 2) / 2);
      return;
    }
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      for (const id of punteros.current.keys()) {
        try {
          e.currentTarget.setPointerCapture(id);
        } catch {
          /* El dedo ya se ha levantado. */
        }
      }
      setArrastrando(true);
      gesto.current = { tipo: "pinza", d0: Math.hypot(b.x - a.x, b.y - a.y), a0: Math.atan2(b.y - a.y, b.x - a.x), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, v: vista, g0: giro };
      return;
    }
    gesto.current = { tipo: "mover", x0: e.clientX, y0: e.clientY, vx: vista.x, vy: vista.y, movido: false, tactil: e.pointerType === "touch" };
  };

  const mueve = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;
    if (g.tipo === "aguja") {
      setBorrador(Math.round(anguloPantalla(e.clientX, e.clientY) * 2) / 2);
      return;
    }
    if (g.tipo === "pinza" && punteros.current.size >= 2) {
      const [a, b] = [...punteros.current.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const s = limita(g.v.s * (d / Math.max(1, g.d0)), ZOOM_MIN, ZOOM_MAX);
      const r = escenario.current!.getBoundingClientRect();
      const qx = g.mx - (r.left + r.width / 2);
      const qy = g.my - (r.top + r.height / 2 + SUBE);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      setVista({ s, x: qx - (qx - g.v.x) * (s / g.v.s) + (mx - g.mx), y: qy - (qy - g.v.y) * (s / g.v.s) + (my - g.my) });
      setGiro(g.g0 + ((ang - g.a0) * 180) / Math.PI);
      hubo.current = true;
      return;
    }
    if (g.tipo === "mover") {
      /* Con un dedo en el móvil, la página baja: el plano se mueve con dos. */
      if (g.tactil) return;
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (!g.movido) {
        if (Math.hypot(dx, dy) < 5) return;
        g.movido = true;
        hubo.current = true;
        setArrastrando(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      setVista((v) => ({ ...v, x: g.vx + dx, y: g.vy + dy }));
    }
  };

  const suelta = (e: React.PointerEvent<HTMLDivElement>) => {
    punteros.current.delete(e.pointerId);
    const g = gesto.current;
    if (g?.tipo === "pinza") commitGiro(giro);
    if (punteros.current.size === 0) {
      gesto.current = null;
      setArrastrando(false);
    } else if (g?.tipo === "pinza") {
      gesto.current = null;
      setArrastrando(false);
    }
  };

  /* -------------------------------------------- LAS ASAS DE LAS PAREDES */
  const asa = useRef<{ tipo: "esquina"; sx: number; sy: number } | { tipo: "giro" } | null>(null);
  const empiezaAsa = (e: React.PointerEvent, a: NonNullable<typeof asa.current>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    asa.current = a;
  };
  const mueveAsa = (e: React.PointerEvent) => {
    const a = asa.current;
    if (!a || !bw) return;
    const P = aPlano(e.clientX, e.clientY);
    const C = centroRejilla;
    if (a.tipo === "giro") {
      const g = (Math.atan2(P.x - C.x, -(P.y - C.y)) * 180) / Math.PI;
      const n = Math.abs(g) < 0.6 ? 0 : limita(g, -45, 45);
      p.alGirarRejilla(Math.round(n * 10) / 10);
      return;
    }
    /* La esquina contraria se queda quieta; ésta sigue al dedo, en los ejes
       de la cuadrícula, que pueden estar girados. */
    const fija = gira((-a.sx * R.w) / 2, (-a.sy * R.h) / 2, beta);
    const A = { x: C.x + fija.x, y: C.y + fija.y };
    const d = gira(P.x - A.x, P.y - A.y, -beta);
    const MIN = 30;
    const W = Math.max(MIN, a.sx * d.x);
    const H = Math.max(MIN, a.sy * d.y);
    const medio = gira((a.sx * W) / 2, (a.sy * H) / 2, beta);
    const nc = { x: A.x + medio.x, y: A.y + medio.y };
    const r1 = (n: number) => Math.round(n * 10) / 10;
    p.alCambiarRejilla({ x: r1(((nc.x - W / 2) / bw) * 100), y: r1(((nc.y - H / 2) / bh) * 100), w: r1((W / bw) * 100), h: r1((H / bh) * 100) });
  };
  const sueltaAsa = () => {
    asa.current = null;
  };

  /* ---------------------------------------------- MOVER EL LUOPAN */
  const luo = useRef<{ tipo: "mover"; dx: number; dy: number } | { tipo: "tamano" } | null>(null);
  const empiezaLuopan = (e: React.PointerEvent, tipo: "mover" | "tamano") => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const P = aPlano(e.clientX, e.clientY);
    luo.current = tipo === "mover" ? { tipo, dx: P.x - L.x, dy: P.y - L.y } : { tipo };
  };
  const mueveLuopan = (e: React.PointerEvent) => {
    const l = luo.current;
    if (!l || !bw) return;
    const P = aPlano(e.clientX, e.clientY);
    const r1 = (n: number) => Math.round(n * 10) / 10;
    if (l.tipo === "mover") {
      p.alMoverLuopan({ x: r1(((P.x - l.dx) / bw) * 100), y: r1(((P.y - l.dy) / bh) * 100), d: r1((L.d / bw) * 100) });
    } else {
      const d = limita(2 * Math.hypot(P.x - L.x, P.y - L.y), 60, Math.max(bw, bh) * 2);
      p.alMoverLuopan({ x: r1((L.x / bw) * 100), y: r1((L.y / bh) * 100), d: r1((d / bw) * 100) });
    }
  };
  const sueltaLuopan = () => {
    luo.current = null;
  };

  /* ---------------------------------------------------------------- VISTA */
  const capa = `position:absolute;left:50%;top:50%;width:${bw}px;height:${bh}px;transform:translate(-50%,-50%) translate(${vista.x}px,${vista.y + SUBE}px) rotate(${giro}deg) scale(${vista.s});transform-origin:50% 50%;` + (arrastrando ? "" : "transition:transform 260ms cubic-bezier(.22,1,.36,1);");
  const contraEscala = `scale(${1 / vista.s})`;
  const verLuopan = p.conLuopan && fachada !== null;
  const editaLuopan = modo === "luopan" && verLuopan;

  /* Un asa redonda, del mismo tamaño en pantalla se acerque lo que se acerque. */
  const estiloAsa = (izq: string, arr: string, extra = "") =>
    `position:absolute;left:${izq};top:${arr};width:26px;height:26px;border-radius:50%;transform:translate(-50%,-50%) ${contraEscala};touch-action:none;background:var(--accion);border:3px solid var(--surface);box-shadow:0 2px 8px rgb(0 0 0 / .28);z-index:6;` + extra;

  return (
    <div
      ref={escenario}
      className={m.escenario}
      data-arrastrando={arrastrando ? "1" : undefined}
      onPointerDown={empieza}
      onPointerMove={mueve}
      onPointerUp={suelta}
      onPointerCancel={suelta}
      onClickCapture={(e) => {
        /* Un arrastre no es un toque: al soltar no se abre la zona de debajo. */
        if (hubo.current) {
          e.stopPropagation();
          e.preventDefault();
          hubo.current = false;
        }
      }}
      style={css(paso === "norte" ? "touch-action:none;cursor:crosshair;" : "")}
    >
      {bw > 0 && (
        <div style={css(capa)}>
          {imagen ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imagen} alt="Plano de la vivienda" draggable={false} style={css("display:block;width:100%;height:100%;border-radius:4px;box-shadow:var(--shadow);pointer-events:none;")} />
          ) : (
            <div style={css("width:100%;height:100%;border-radius:4px;background:var(--surface);box-shadow:var(--shadow);")} />
          )}

          {/* EL LUOPAN. Debajo de las zonas para que se puedan pulsar; encima
              cuando se está moviendo. */}
          {verLuopan && (
            <div
              data-quieto={editaLuopan ? "1" : undefined}
              onPointerDown={editaLuopan ? (e) => empiezaLuopan(e, "mover") : undefined}
              onPointerMove={editaLuopan ? mueveLuopan : undefined}
              onPointerUp={sueltaLuopan}
              onPointerCancel={sueltaLuopan}
              style={css(
                `position:absolute;left:${L.x}px;top:${L.y}px;width:${L.d}px;height:${L.d}px;transform:translate(-50%,-50%);` +
                  (editaLuopan ? "z-index:5;cursor:move;touch-action:none;filter:drop-shadow(0 10px 24px rgb(0 0 0 / .22));" : "z-index:1;pointer-events:none;")
              )}
            >
              <Luopan grados={fachada!} haciaPantalla={ANGULO_LADO[lado] + beta} sobrePlano norteMarcado etiqueta="Luopan sobre el plano" />
              {editaLuopan && (
                <span
                  role="slider"
                  aria-label="Tamaño del luopan"
                  aria-valuenow={Math.round(L.d)}
                  data-quieto="1"
                  onPointerDown={(e) => empiezaLuopan(e, "tamano")}
                  onPointerMove={mueveLuopan}
                  onPointerUp={sueltaLuopan}
                  onPointerCancel={sueltaLuopan}
                  style={css(estiloAsa("85.4%", "85.4%", "cursor:nwse-resize;"))}
                />
              )}
            </div>
          )}

          {/* LAS NUEVE ZONAS, que siguen las paredes. */}
          <div
            style={css(
              `position:absolute;left:${rejilla.x}%;top:${rejilla.y}%;width:${rejilla.w}%;height:${rejilla.h}%;transform:rotate(${beta}deg);transform-origin:50% 50%;z-index:2;` +
                (imagen ? "" : "border:2px solid var(--text-3);border-radius:4px;") +
                (paso === "norte" ? "opacity:.35;pointer-events:none;" : "")
            )}
          >
            <Cuadricula
              carta={p.carta}
              fachada={fachada ?? 180}
              lado={lado}
              anual={p.anual}
              marcas={p.marcas}
              mansiones={p.mansiones}
              seleccion={p.seleccion}
              alElegir={enPaso || modo !== "ver" ? undefined : p.alElegir}
              estancias={p.estancias}
              modo="plano"
              giroTexto={giro + beta}
            />

            {/* La fachada, por fuera del lado en el que está. */}
            {!enPaso && (
              <span
                aria-hidden
                style={css(
                  "position:absolute;z-index:3;padding:3px 10px;border-radius:var(--r-pill);background:var(--red);color:var(--surface);font-size:var(--t-micro);font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;pointer-events:none;" +
                    /* Por FUERA del borde, no encima: encima tapaba los números
                       de las zonas de ese lado. */
                    (lado === "abajo"
                      ? `left:50%;top:100%;transform:translate(-50%,-50%) translateY(${14 / vista.s}px) ${contraEscala};`
                      : lado === "arriba"
                        ? `left:50%;top:0;transform:translate(-50%,-50%) translateY(${-14 / vista.s}px) ${contraEscala};`
                        : lado === "izquierda"
                          ? `left:0;top:50%;transform:translate(-50%,-50%) translateX(${-14 / vista.s}px) rotate(-90deg) ${contraEscala};`
                          : `left:100%;top:50%;transform:translate(-50%,-50%) translateX(${14 / vista.s}px) rotate(90deg) ${contraEscala};`)
                )}
              >
                Fachada{fachada !== null ? ` · ${fachada.toFixed(1).replace(".", ",")}°` : ""}
              </span>
            )}

            {/* PASO 2: un botón en cada lado. */}
            {paso === "fachada" &&
              (["arriba", "derecha", "abajo", "izquierda"] as Lado[]).map((l) => {
                const pos = { arriba: ["50%", "0"], derecha: ["100%", "50%"], abajo: ["50%", "100%"], izquierda: ["0", "50%"] }[l];
                const elegido = l === lado;
                return (
                  <button
                    key={l}
                    type="button"
                    data-quieto="1"
                    onClick={() => p.alCambiarLado(l)}
                    aria-pressed={elegido}
                    style={css(
                      `position:absolute;left:${pos[0]};top:${pos[1]};z-index:7;transform:translate(-50%,-50%) rotate(${-(giro + beta)}deg) ${contraEscala};` +
                        "padding:9px 16px;border-radius:var(--r-pill);font-size:var(--t-mini);font-weight:650;white-space:nowrap;cursor:pointer;box-shadow:var(--shadow-lg);" +
                        (elegido ? "background:var(--red);color:var(--surface);border:2px solid var(--surface);" : "background:var(--vidrio-denso);color:var(--text);border:1px solid var(--border-strong);")
                    )}
                  >
                    {elegido ? "Fachada" : "Aquí"}
                  </button>
                );
              })}

            {/* MODO PAREDES: cuatro esquinas y el giro. */}
            {modo === "paredes" && !enPaso && (
              <>
                <span aria-hidden style={css("position:absolute;inset:0;border:2px solid var(--accion);pointer-events:none;z-index:5;")} />
                <span aria-hidden style={css(`position:absolute;left:50%;top:0;width:2px;height:34px;transform:translate(-50%,-100%) scaleY(${1 / vista.s});transform-origin:50% 100%;background:var(--accion);z-index:5;`)} />
                {(
                  [
                    [-1, -1, "0", "0", "Esquina de arriba a la izquierda"],
                    [1, -1, "100%", "0", "Esquina de arriba a la derecha"],
                    [1, 1, "100%", "100%", "Esquina de abajo a la derecha"],
                    [-1, 1, "0", "100%", "Esquina de abajo a la izquierda"],
                  ] as Array<[number, number, string, string, string]>
                ).map(([sx, sy, izq, arr, nombre]) => (
                  <span
                    key={nombre}
                    role="slider"
                    aria-label={nombre}
                    aria-valuenow={0}
                    data-quieto="1"
                    onPointerDown={(e) => empiezaAsa(e, { tipo: "esquina", sx, sy })}
                    onPointerMove={mueveAsa}
                    onPointerUp={sueltaAsa}
                    onPointerCancel={sueltaAsa}
                    style={css(estiloAsa(izq, arr, sx === sy ? "cursor:nwse-resize;" : "cursor:nesw-resize;"))}
                  />
                ))}
                <span
                  role="slider"
                  aria-label="Girar la cuadrícula"
                  aria-valuenow={beta}
                  data-quieto="1"
                  onPointerDown={(e) => empiezaAsa(e, { tipo: "giro" })}
                  onPointerMove={mueveAsa}
                  onPointerUp={sueltaAsa}
                  onPointerCancel={sueltaAsa}
                  style={css(
                    `position:absolute;left:50%;top:0;width:30px;height:30px;border-radius:50%;transform:translate(-50%,-50%) translateY(${-34 / vista.s}px) ${contraEscala};touch-action:none;cursor:grab;z-index:6;display:grid;place-items:center;background:var(--surface);color:var(--accion);border:2px solid var(--accion);box-shadow:0 2px 8px rgb(0 0 0 / .22);`
                  )}
                >
                  <IcoGiraDer />
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* PASO 1: LA AGUJA DEL NORTE, sobre toda la mesa. */}
      {paso === "norte" && caja.w > 0 && (
        <svg
          aria-hidden
          viewBox="-100 -100 200 200"
          style={css(
            `position:absolute;left:50%;top:calc(50% + ${SUBE}px);width:${Math.min(caja.w, caja.h) * 0.62}px;height:${Math.min(caja.w, caja.h) * 0.62}px;transform:translate(-50%,-50%) rotate(${borrador}deg);pointer-events:none;z-index:7;transition:transform 120ms ease-out;`
          )}
        >
          <circle r="96" style={{ fill: "none", stroke: "var(--red)", strokeWidth: 1.2, strokeDasharray: "3 5", opacity: 0.6 }} />
          <path d="M0 -92 L13 -50 L3 -54 L3 70 L-3 70 L-3 -54 L-13 -50 Z" style={{ fill: "var(--red)", opacity: 0.92 }} />
          <circle r="7" style={{ fill: "var(--surface)", stroke: "var(--red)", strokeWidth: 3 }} />
          <g transform="translate(0 -96)">
            <circle r="13" style={{ fill: "var(--red)", stroke: "var(--surface)", strokeWidth: 2.5 }} />
            <text y="1" textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--surface)", fontSize: 14, fontWeight: 700 }}>
              N
            </text>
          </g>
        </svg>
      )}

      {/* LAS TARJETAS DE LOS DOS PASOS. */}
      {paso === "norte" && (
        <div data-quieto="1" className={`${m.paso} ${m.cristal}`}>
          <span style={css("font-size:var(--t-micro);font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);")}>Paso 1 de 2 · El norte del plano</span>
          <span style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-2);")}>
            Busca en el plano la flecha con la <strong>N</strong> y gira la aguja roja hasta que apunte igual. Arrastra en cualquier parte del plano.
          </span>
          <div style={css("display:flex;flex-wrap:wrap;gap:6px;align-items:center;")}>
            {(
              [
                [0, "Arriba"],
                [90, "Derecha"],
                [180, "Abajo"],
                [270, "Izquierda"],
              ] as Array<[number, string]>
            ).map(([g, t]) => (
              <button key={g} type="button" onClick={() => setBorrador(g)} aria-pressed={borrador === g} style={css((borrador === g ? BOTON_NORMAL + "border-color:var(--accion);color:var(--accion);" : BOTON_PLANO) + "padding:7px 13px;font-size:var(--t-mini);")}>
                {t}
              </button>
            ))}
            <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-3);font-variant-numeric:tabular-nums;")}>{borrador.toFixed(1).replace(".", ",")}°</span>
          </div>
          <div style={css("display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;")}>
            <button
              type="button"
              onClick={() => {
                p.alCambiarNorte(null);
                p.alPaso("fachada");
              }}
              style={css(BOTON_PLANO + "font-size:var(--t-mini);")}
            >
              Mi plano no trae norte
            </button>
            <button
              type="button"
              onClick={() => {
                p.alCambiarNorte(borrador);
                p.alPaso("fachada");
              }}
              style={css(botonPrincipal())}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {paso === "fachada" && (
        <div data-quieto="1" className={`${m.paso} ${m.cristal}`}>
          <span style={css("font-size:var(--t-micro);font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);")}>Paso 2 de 2 · La fachada</span>
          <span style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-2);")}>
            Toca el lado del plano por el que está la fachada: la cara principal de la casa, la que da a la calle o a lo más abierto.
          </span>
          <div style={css("display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;")}>
            <button type="button" onClick={() => p.alPaso("norte")} style={css(BOTON_PLANO + "font-size:var(--t-mini);")}>
              Volver al norte
            </button>
            <button type="button" onClick={() => p.alPaso(null)} style={css(botonPrincipal())}>
              Listo
            </button>
          </div>
        </div>
      )}

      {/* SIN PLANO: la invitación a subirlo, en el centro de la mesa. */}
      {!imagen && !enPaso && (
        <div data-quieto="1" className={`${m.paso} ${m.cristal}`} style={css("top:50%;bottom:auto;transform:translate(-50%,-50%);align-items:center;text-align:center;width:min(380px,calc(100% - 28px));")}>
          <span style={css("font-size:var(--t-read);font-weight:650;color:var(--text);")}>Sube el plano de la vivienda</span>
          <span style={css("font-size:var(--t-mini);line-height:1.5;color:var(--text-3);")}>Una foto o una captura del plano del arquitecto. Las nueve zonas se colocan solas.</span>
          <button type="button" onClick={p.alSubir} style={css(botonPrincipal())}>
            Subir el plano
          </button>
        </div>
      )}

      {/* AVISOS Y AYUDA DEL MODO, arriba a la izquierda. */}
      {!enPaso && imagen && (norte === null || separados || modo !== "ver") && (
        <div data-quieto="1" className={`${m.aviso} ${m.cristal}`} role={norte === null || separados ? "alert" : undefined}>
          {modo === "paredes" ? (
            <span>Arrastra las cuatro esquinas hasta las paredes de fuera. Si el plano está torcido, gira con el botón de arriba.</span>
          ) : modo === "luopan" ? (
            <span>Arrastra el luopan donde quieras. El punto del borde cambia su tamaño.</span>
          ) : norte === null ? (
            <span style={css("color:var(--red);font-weight:590;")}>{fachada === null ? "Falta marcar el norte del plano." : "El plano no tiene el norte marcado: manda la medida del luopan."}</span>
          ) : (
            <span style={css("color:var(--red);font-weight:590;")}>El norte del plano y el del luopan no coinciden.</span>
          )}
          {modo === "ver" && norte !== null && separados && p.alUsarNortePlano && (
            <button type="button" onClick={p.alUsarNortePlano} style={css(BOTON_NORMAL + "padding:6px 12px;font-size:var(--t-mini);")}>
              Usar el del plano
            </button>
          )}
          {modo === "ver" && norte === null && (
            <button type="button" onClick={() => p.alPaso("norte")} style={css(BOTON_NORMAL + "padding:6px 12px;font-size:var(--t-mini);")}>
              Marcar el norte
            </button>
          )}
          {modo === "luopan" && p.luopan && (
            <button type="button" onClick={() => p.alMoverLuopan(null)} style={css(BOTON_PLANO + "padding:6px 12px;font-size:var(--t-mini);")}>
              Volver al centro
            </button>
          )}
        </div>
      )}

      {/* LA ROSA: dónde está el norte en la pantalla. Pulsarla lo pone arriba. */}
      {!enPaso && (
        <button
          type="button"
          data-quieto="1"
          className={`${m.rosa} ${m.cristal}`}
          disabled={norteEnPantalla === null}
          onClick={() => norteLuopan !== null && vaA(-norteLuopan)}
          aria-label={norteEnPantalla === null ? "Sin norte" : "Poner el norte arriba"}
          title={norteEnPantalla === null ? "Sin norte todavía" : "Poner el norte arriba"}
          style={css(norteEnPantalla === null ? "opacity:.6;cursor:default;" : "")}
        >
          <svg viewBox="-40 -40 80 80" width="58" height="58" aria-hidden style={{ transform: `rotate(${norteEnPantalla ?? 0}deg)`, transition: "transform 260ms cubic-bezier(.22,1,.36,1)" }}>
            <circle r="35" style={{ fill: "none", stroke: "var(--border-strong)", strokeWidth: 1 }} />
            <path d="M0 -24 L7 2 L0 -2 L-7 2 Z" style={{ fill: norteEnPantalla === null ? "var(--text-4)" : "var(--red)" }} />
            <path d="M0 24 L7 -2 L0 2 L-7 -2 Z" style={{ fill: "var(--text-3)", opacity: 0.45 }} />
            <text x="0" y="-28" textAnchor="middle" dominantBaseline="middle" style={{ fill: norteEnPantalla === null ? "var(--text-4)" : "var(--red)", fontSize: 11, fontWeight: 800 }}>
              N
            </text>
          </svg>
        </button>
      )}

      {/* LA BARRA DE ABAJO. */}
      {!enPaso && (
        <div data-quieto="1" className={`${m.barra} ${m.cristal}`} role="toolbar" aria-label="Mover y girar el plano">
          <button type="button" className={`${m.boton} ${m.solo}`} onClick={() => acerca(1 / 1.3)} aria-label="Alejar" title="Alejar">
            <IcoMenos />
          </button>
          <button type="button" className={`${m.boton} ${m.solo}`} onClick={() => acerca(1.3)} aria-label="Acercar" title="Acercar">
            <IcoMas />
          </button>
          <button type="button" className={`${m.boton} ${m.solo}`} onClick={() => setVista({ x: 0, y: 0, s: encaje(giro) })} aria-label="Ver el plano entero" title="Ver el plano entero">
            <IcoEncajar />
          </button>
          <span className={m.raya} aria-hidden />
          <button type="button" className={`${m.boton} ${m.solo}`} onClick={() => vaA(Math.round((giro - 90) / 90) * 90)} aria-label="Girar a la izquierda" title="Girar a la izquierda">
            <IcoGiraIzq />
          </button>
          <button type="button" className={m.boton} disabled={norteLuopan === null} onClick={() => norteLuopan !== null && vaA(-norteLuopan)} aria-pressed={norteEnPantalla !== null && Math.abs(corto(norteEnPantalla)) < 0.5} aria-label="Norte arriba" title="Norte arriba">
            <span style={css("font-weight:800;color:inherit;")}>N</span>
            <span className={m.texto}>Norte arriba</span>
          </button>
          <button type="button" className={`${m.boton} ${m.solo}`} onClick={() => vaA(Math.round((giro + 90) / 90) * 90)} aria-label="Girar a la derecha" title="Girar a la derecha">
            <IcoGiraDer />
          </button>
          <span className={m.raya} aria-hidden />
          <button type="button" className={m.boton} aria-pressed={modo === "paredes"} onClick={() => setModo(modo === "paredes" ? "ver" : "paredes")} aria-label={modo === "paredes" ? "Listo con las paredes" : "Paredes"} title="Ajustar las zonas a las paredes">
            <IcoParedes />
            <span className={m.texto}>{modo === "paredes" ? "Listo" : "Paredes"}</span>
          </button>
          <button type="button" className={m.boton} aria-pressed={modo === "luopan"} disabled={!verLuopan} onClick={() => setModo(modo === "luopan" ? "ver" : "luopan")} aria-label={modo === "luopan" ? "Listo con el luopan" : "Mover luopan"} title="Mover el luopan">
            <IcoLuopan />
            <span className={m.texto}>{modo === "luopan" ? "Listo" : "Mover luopan"}</span>
          </button>
        </div>
      )}

      {/* Para lectores de pantalla: dónde queda el norte ahora mismo. */}
      <span aria-live="polite" style={css("position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);")}>
        {norteEnPantalla === null ? "" : `El norte está hacia ${NOMBRE_DIR[dirDe(-norteEnPantalla)] ?? ""} de la pantalla.`}
      </span>
    </div>
  );
}
