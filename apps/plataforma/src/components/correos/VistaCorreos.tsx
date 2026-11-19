"use client";

/**
 * LA PANTALLA DE CORREOS, YA CONTADA: el lienzo, el panel de la derecha y la
 * barra de abajo. Recibe los datos y las acciones de CorreosScreen, que es la
 * que habla con Firestore; aquí sólo se cuenta y se pinta.
 *
 * Las cuentas de quién recibe qué son las mismas que había en la lista de
 * antes, sin tocar: a quien ya se ha inscrito no le llegan ni el recordatorio
 * ni el «es hoy», las bajas no cuentan y el tope manda.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "@/lib/css";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, CAMPO, NOTA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import Mapa, { type Estado, type Flujo, type Nodo } from "./Mapa";
import Agente, { proximaRonda, type Paso } from "./Agente";
import DiaADia from "./DiaADia";
import PersonaAPersona from "./PersonaAPersona";

export type Textos = { dia: string; asunto: string; previo: string; titular: string; cuerpo: string; boton: string };
export type Envio = Textos & { id: string; aInscritas: boolean };
export type Contacto = { email: string; baja: boolean; enviados: Record<string, unknown> };
export type Inscrita = { email: string; baja: boolean; recordatorios: Record<string, boolean> };
export type Conf = { activa: boolean; tope: number };

/** Los recordatorios de las inscritas, con el día en que salen. Lo decide la
 *  web contando días hasta la clase (7, 1 y 0); aquí sólo se enseña. */
const RECORDATORIOS = [
  { id: "semana", dia: "2026-11-19", que: "Falta una semana", linea: "Siete días antes de la clase." },
  { id: "manana", dia: "2026-11-25", que: "Es mañana", linea: "El día de antes, con la hora." },
  { id: "hoy", dia: "2026-11-26", que: "Es hoy", linea: "La mañana de la clase, con el enlace." },
];

const QUE_HACE: Record<string, string> = {
  invitacion: "Invita a la masterclass a toda la lista.",
  recordatorio: "Sólo a quien aún no se ha apuntado.",
  "es-hoy": "El último aviso, la mañana de la clase.",
};

export const hoyMadrid = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
export const fecha = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const corta = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

export default function VistaCorreos({
  web,
  envios,
  contactos,
  inscritas,
  conf,
  ocupado,
  aviso,
  fallo,
  version,
  hoy = hoyMadrid(),
  onSube,
  onGuarda,
  onGuardaTextos,
}: {
  web: string;
  envios: Envio[] | null;
  contactos: Contacto[] | null;
  inscritas: Inscrita[] | null;
  conf: Conf;
  ocupado: boolean;
  aviso: string;
  fallo: string;
  version: number;
  hoy?: string;
  onSube: (f: File) => void;
  onGuarda: (cambio: Partial<Conf>) => void;
  onGuardaTextos: (id: string, t: Textos | null) => Promise<boolean>;
}) {
  const [elegido, setElegido] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Textos | null>(null);
  const [zoom, setZoom] = useState(1);
  const lienzo = useRef<HTMLDivElement>(null);
  const subir = useRef<HTMLInputElement>(null);

  const cargando = contactos === null || inscritas === null;

  const n = useMemo(() => {
    const c = contactos ?? [];
    const activas = c.filter((x) => !x.baja);
    const insc = new Set((inscritas ?? []).map((i) => i.email.trim().toLowerCase()));
    return {
      total: c.length,
      bajas: c.length - activas.length,
      yaInscritas: activas.filter((x) => insc.has(x.email)).length,
      enviados: (id: string) => c.filter((x) => x.enviados?.[id]).length,
      faltan: (e: Envio) => activas.filter((x) => !x.enviados?.[e.id] && (e.aInscritas || !insc.has(x.email))).length,
    };
  }, [contactos, inscritas]);
  const vivas = (inscritas ?? []).filter((i) => !i.baja).length;
  const dias = (faltan: number) => Math.max(1, Math.ceil(faltan / Math.max(1, conf.tope)));
  const guion = (s: string) => (cargando ? "—" : s);

  /* ------------------------------------------------------------ los flujos */
  const flujos: Flujo[] = useMemo(() => {
    const correoLista = (e: Envio): Nodo => {
      const enviados = n.enviados(e.id);
      const faltan = n.faltan(e);
      let estado: Estado, cifra: string;
      if (!n.total) [estado, cifra] = ["falta", "Falta subir la lista"];
      else if (faltan === 0 && enviados > 0) [estado, cifra] = ["hecho", `Salió a ${enviados}`];
      else if (!conf.activa) [estado, cifra] = ["parado", `Parado · ${faltan} faltan`];
      else if (e.dia <= hoy) [estado, cifra] = ["saliendo", `${enviados} salieron · ${faltan} faltan`];
      else [estado, cifra] = ["programado", `Programado · ${faltan}`];
      return {
        id: e.id,
        tipo: "correo",
        icono: "correo",
        cuando: e.id === "invitacion" ? `Desde el ${corta(e.dia)}` : `El ${corta(e.dia)}`,
        titulo: e.asunto,
        linea: QUE_HACE[e.id] ?? "Correo de la lista.",
        estado,
        cifra: guion(cifra),
      };
    };
    const [inv, ...resto] = envios ?? [];
    const marco: Nodo[] = [
      {
        id: "lista",
        tipo: "disparador",
        icono: "lista",
        cuando: "Empieza aquí",
        titulo: "Se sube la lista",
        linea: "Un CSV con los correos.",
        estado: n.total ? "hecho" : "falta",
        cifra: guion(n.total ? `${n.total} correos · ${n.bajas} bajas` : "Aún no hay lista"),
      },
      {
        id: "interruptor",
        tipo: "condicion",
        icono: "interruptor",
        cuando: "Cada mañana, 8:00",
        titulo: "Interruptor",
        linea: `Si está encendido, salen hasta ${conf.tope} al día.`,
        estado: conf.activa ? "saliendo" : "parado",
        cifra: conf.activa ? "Encendido" : "Apagado: no sale nada",
      },
      ...(inv ? [correoLista(inv)] : []),
      ...(inv
        ? [
            {
              id: "inscrita",
              tipo: "condicion" as const,
              icono: "pregunta" as const,
              cuando: "Antes de cada aviso",
              titulo: "¿Se inscribió?",
              linea: "Mira si ya se apuntó a la masterclass.",
              estado: "siempre" as const,
              cifra: guion(`${n.yaInscritas} ya inscritas`),
              salida: "no",
              rama: { etiqueta: "sí", texto: "Ya está apuntada: sale de esta lista y le llegan los correos de inscritas." },
            },
          ]
        : []),
      ...resto.map(correoLista),
    ];

    const reco = (r: (typeof RECORDATORIOS)[number]): Nodo => {
      const salieron = (inscritas ?? []).filter((i) => i.recordatorios?.[r.id]).length;
      const [estado, cifra]: [Estado, string] =
        r.dia > hoy ? ["programado", `Programado · ${vivas} inscritas`] : r.dia === hoy ? ["saliendo", `Hoy · ${salieron} salieron`] : ["hecho", `Salió a ${salieron}`];
      return { id: r.id, tipo: "correo", icono: "reloj", cuando: `El ${corta(r.dia)}`, titulo: r.que, linea: r.linea, estado, cifra: guion(cifra) };
    };
    const inscritasF: Nodo[] = [
      {
        id: "apunta",
        tipo: "disparador",
        icono: "web",
        cuando: "Empieza aquí",
        titulo: "Se apunta en la web",
        linea: "El formulario de la masterclass.",
        estado: "siempre",
        cifra: guion(`${vivas} inscritas`),
      },
      {
        id: "confirmacion",
        tipo: "correo",
        icono: "confirmacion",
        cuando: "Al momento",
        titulo: "Confirmación + grupo de WhatsApp",
        linea: "Una por inscrita, en cuanto se apunta.",
        estado: "siempre",
        cifra: "Sale sola al apuntarse",
      },
      ...RECORDATORIOS.map(reco),
    ];

    return [
      {
        id: "marco",
        titulo: "Lista subida",
        encendido: conf.activa,
        vivo: conf.activa && n.total > 0,
        estado: conf.activa ? "Encendido" : "Apagado",
        nodos: marco,
      },
      {
        id: "inscritas",
        titulo: "Inscritas a la masterclass",
        encendido: true,
        vivo: true,
        estado: "Siempre encendido",
        nodos: inscritasF,
      },
    ];
  }, [envios, n, conf, hoy, inscritas, vivas, cargando]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------- el plan de la ronda
     Las mismas reglas que la web, en el mismo orden: primero los
     recordatorios de las inscritas que toquen ese día; después la lista de
     Marco con lo que quede del tope. */
  const plan: Paso[] = useMemo(() => {
    const dia = proximaRonda().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
    const pasos: Paso[] = [];
    let usados = 0;
    for (const r of RECORDATORIOS.filter((x) => x.dia === dia)) {
      const van = (inscritas ?? []).filter((i) => !i.baja && !i.recordatorios?.[r.id]).length;
      usados += van;
      pasos.push({ tipo: "sale", texto: <>Mandará «{r.que}» a <b>{van}</b> {van === 1 ? "inscrita" : "inscritas"}.</> });
    }
    const orden = [...(envios ?? [])].sort((a, b) => (a.dia < b.dia ? -1 : 1));
    const toca = orden.length && dia <= orden[orden.length - 1].dia ? orden.filter((e) => e.dia <= dia).pop() ?? null : null;
    if (!conf.activa) pasos.push({ tipo: "parado", texto: "Lista subida: apagada. No mandará nada hasta que la enciendas." });
    else if (!n.total) pasos.push({ tipo: "parado", texto: "Lista subida: todavía no hay ninguna lista." });
    else if (!toca) {
      const sig = orden.find((e) => e.dia > dia);
      pasos.push({ tipo: "espera", texto: sig ? `Lista subida: ese día no toca ningún correo. El siguiente, «${sig.asunto}», sale el ${corta(sig.dia)}.` : "Lista subida: ya salieron todos los correos." });
    } else {
      const faltan = n.faltan(toca);
      const van = Math.min(faltan, Math.max(0, conf.tope - usados));
      pasos.push(
        faltan
          ? { tipo: "sale", texto: <>Mandará «{toca.asunto}» a <b>{van}</b> personas de la lista{faltan > van ? `. Las otras ${faltan - van} lo recibirán las mañanas siguientes` : ""}.</> }
          : { tipo: "espera", texto: `Lista subida: «${toca.asunto}» ya le llegó a todo el mundo.` },
      );
    }
    pasos.push({ tipo: "espera", texto: "Saltará a quien se dio de baja. Todos llevan su enlace para darse de baja." });
    return pasos;
  }, [envios, inscritas, conf, n]);

  const nodo = flujos.flatMap((f) => f.nodos).find((x) => x.id === elegido) ?? null;
  const envio = (envios ?? []).find((e) => e.id === elegido) ?? null;

  /* ------------------------------------------------------- ajustar el zoom
     Al abrir, el flujo más largo cabe entero en el lienzo. No baja de 0,6: más
     pequeño ya no se lee y es mejor desplazar. */
  const ajusta = () => {
    const el = lienzo.current;
    if (!el) return;
    const pista = el.firstElementChild as HTMLElement | null;
    if (!pista) return;
    const ancho = pista.scrollWidth / zoom;
    const cabe = (el.clientWidth - 56) / ancho;
    setZoom(Math.max(0.6, Math.min(1, Math.round(cabe * 20) / 20)));
  };
  useEffect(() => {
    const t = setTimeout(ajusta, 0);
    return () => clearTimeout(t);
  }, [envios === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const panel = useRef<HTMLElement>(null);
  const elige = (id: string) => {
    setEditando(false);
    setBorrador(null);
    setElegido(elegido === id ? null : id);
  };
  /* En el móvil el panel sale encima del mapa: se baja hasta él. */
  useEffect(() => {
    if (elegido && window.matchMedia("(max-width: 760px)").matches) panel.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [elegido]);

  const encender = (
    <button
      type="button"
      disabled={ocupado || !n.total}
      onClick={() => onGuarda({ activa: !conf.activa })}
      style={css(conf.activa ? BOTON_NORMAL : botonPrincipal(!ocupado && n.total > 0))}
    >
      {conf.activa ? "Pausar envíos" : "Encender envíos"}
    </button>
  );
  const botonSubir = (
    <button type="button" disabled={ocupado} style={css(BOTON_NORMAL)} onClick={() => subir.current?.click()}>
      {n.total ? "Volver a subir la lista" : "Subir la lista (CSV)"}
    </button>
  );

  return (
    <div className="correos" style={css("display:flex;flex-direction:column;gap:var(--gap);padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      <input
        ref={subir}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        style={css("display:none;")}
        onChange={(ev) => {
          const f = ev.target.files?.[0];
          if (f) onSube(f);
          ev.target.value = "";
        }}
      />

      <header style={css("display:flex;gap:16px 24px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;")}>
        <div style={css("display:grid;gap:6px;min-width:0;")}>
          <p style={css(rotulo() + "margin:0;")}>Sólo administración</p>
          <h1 style={css(TITULO + "margin:0;")}>Correos automáticos</h1>
          <p style={css(APOYO + "margin:0;max-width:60ch;")}>
            Cada caja es un paso. Toca un correo para leerlo tal como llega y cambiar su texto.
          </p>
        </div>
        <div style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
          {botonSubir}
          {encender}
        </div>
      </header>

      <Agente activo={conf.activa || vivas > 0} plan={plan} cargando={cargando} />

      {fallo && <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>{fallo}</p>}
      {aviso && <p role="status" style={css(NOTA + "margin:0;color:var(--text-2);")}>{aviso}</p>}

      <div className="correos-mesa" data-abierto={nodo ? "" : undefined}>
        <div className="correos-lienzo" ref={lienzo}>
          <Mapa flujos={flujos} elegido={elegido} onElige={elige} zoom={zoom} />
        </div>

        {nodo && (
          <aside ref={panel} className="correos-panel" data-corto={envio || ["confirmacion", "semana", "manana", "hoy"].includes(nodo.id) ? undefined : ""} aria-label={nodo.titulo}>
            <div style={css("display:flex;align-items:flex-start;gap:12px;")}>
              <div style={css("display:grid;gap:4px;min-width:0;flex:1;")}>
                <span style={css(rotulo("var(--gold)"))}>{envio ? fecha(envio.dia) : nodo.cuando}</span>
                <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;line-height:1.2;color:var(--text);")}>{nodo.titulo}</h2>
                <span style={css(NOTA)}>{nodo.cifra}</span>
              </div>
              <button type="button" aria-label="Cerrar" style={css(BOTON_PLANO + "padding:8px 12px;")} onClick={() => setElegido(null)}>
                Cerrar
              </button>
            </div>

            {envio && !editando && (
              <>
                <div style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
                  <button
                    type="button"
                    style={css(BOTON_NORMAL)}
                    onClick={() => {
                      setEditando(true);
                      setBorrador({ dia: envio.dia, asunto: envio.asunto, previo: envio.previo, titular: envio.titular, cuerpo: envio.cuerpo, boton: envio.boton });
                    }}
                  >
                    Editar el texto
                  </button>
                </div>
                <iframe
                  key={`${envio.id}-${version}`}
                  title={envio.asunto}
                  src={`${web}/api/difusion/vista?id=${envio.id}`}
                  className="correos-vista"
                />
                <p style={css(NOTA + "margin:0;")}>Es el correo tal cual sale, con un enlace de baja de ejemplo.</p>
              </>
            )}

            {envio && editando && borrador && (
              <div style={css("display:grid;gap:12px;")}>
                {(
                  [
                    ["dia", "Día que sale", "date"],
                    ["asunto", "Asunto", "text"],
                    ["previo", "Lo que se lee en la bandeja", "text"],
                    ["titular", "Título dentro del correo", "text"],
                    ["boton", "Texto del botón", "text"],
                  ] as Array<[keyof Textos, string, string]>
                ).map(([k, q, tipo]) => (
                  <label key={k} style={css("display:grid;gap:6px;")}>
                    <span style={css(NOTA)}>{q}</span>
                    <input type={tipo} value={borrador[k]} onChange={(ev) => setBorrador({ ...borrador, [k]: ev.target.value })} style={css(CAMPO)} />
                  </label>
                ))}
                <label style={css("display:grid;gap:6px;")}>
                  <span style={css(NOTA)}>Texto · una línea en blanco separa párrafos, **así** va en negrita y [botón] marca dónde va el botón</span>
                  <textarea
                    value={borrador.cuerpo}
                    rows={12}
                    onChange={(ev) => setBorrador({ ...borrador, cuerpo: ev.target.value })}
                    style={css(CAMPO + "resize:vertical;line-height:1.55;")}
                  />
                </label>
                <span style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
                  <button
                    type="button"
                    disabled={ocupado}
                    style={css(botonPrincipal(!ocupado))}
                    onClick={async () => {
                      if (await onGuardaTextos(envio.id, borrador)) setEditando(false);
                    }}
                  >
                    Guardar
                  </button>
                  <button type="button" disabled={ocupado} style={css(BOTON_NORMAL)} onClick={() => setEditando(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={ocupado}
                    style={css(BOTON_PLANO)}
                    onClick={async () => {
                      if (window.confirm("¿Volver al texto original de este correo?") && (await onGuardaTextos(envio.id, null))) setEditando(false);
                    }}
                  >
                    Volver al original
                  </button>
                </span>
              </div>
            )}

            {nodo.id === "lista" && (
              <div style={css("display:grid;gap:12px;")}>
                <p style={css(APOYO + "margin:0;")}>
                  Sube un CSV (una hoja de cálculo guardada como CSV). Se cogen todos los correos que haya, sin repetir. Si la vuelves a subir, no se pierde lo ya enviado ni las bajas.
                </p>
                <div>{botonSubir}</div>
              </div>
            )}
            {nodo.id === "interruptor" && (
              <div style={css("display:grid;gap:12px;")}>
                <p style={css(APOYO + "margin:0;")}>
                  Mientras esté apagado no sale nada. Encendido, la web manda cada mañana a las <b>8:00</b> hasta <b>{conf.tope}</b> correos, contando los recordatorios de las inscritas de ese día.
                </p>
                {!cargando && n.total > 0 && conf.activa && (envios ?? []).length > 0 && (
                  <p style={css(NOTA + "margin:0;")}>
                    Con lo que falta de la invitación, son unas {dias(n.faltan((envios ?? [])[0]))} mañanas más.
                  </p>
                )}
                <div>{encender}</div>
              </div>
            )}
            {nodo.id === "inscrita" && (
              <p style={css(APOYO + "margin:0;")}>
                Antes de mandar el recordatorio y el «es hoy», se mira si esa persona ya se ha apuntado a la masterclass. Si ya está apuntada, no se le manda: ya le llegan los correos de las inscritas.
              </p>
            )}
            {nodo.id === "apunta" && (
              <p style={css(APOYO + "margin:0;")}>
                Cuando alguien se apunta a la masterclass desde la web, entra aquí. Si se da de baja, deja de recibir estos correos.
              </p>
            )}
            {["confirmacion", "semana", "manana", "hoy"].includes(nodo.id) && (
              <>
                <iframe title={nodo.titulo} src={`${web}/api/difusion/vista?id=${nodo.id}`} className="correos-vista" />
                <p style={css(NOTA + "margin:0;")}>
                  Así le llega a cada inscrita (aquí con un nombre de ejemplo). Este texto todavía no se puede cambiar desde aquí.
                </p>
              </>
            )}
          </aside>
        )}

        <div className="correos-barra">
          <span className="correos-reloj">
            <span style={css("width:7px;height:7px;border-radius:50%;background:var(--green);")} />
            <span>
              Sale cada mañana a las <b>8:00</b> (hora de España), desde hola@escueladesabiduria33.com
            </span>
          </span>
          <span className="correos-zoom" role="group" aria-label="Zoom">
            <button type="button" aria-label="Alejar" onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}>
              −
            </button>
            <span style={css("min-width:48px;text-align:center;")}>{Math.round(zoom * 100)} %</span>
            <button type="button" aria-label="Acercar" onClick={() => setZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}>
              +
            </button>
            <button type="button" onClick={ajusta} style={css("padding:0 12px;width:auto;")}>
              Ajustar
            </button>
          </span>
        </div>
      </div>

      {!cargando && envios && (
        <DiaADia
          envios={envios}
          contactos={contactos ?? []}
          inscritas={inscritas ?? []}
          conf={conf}
          diaRonda={proximaRonda().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" })}
        />
      )}

      {!cargando && envios && (contactos ?? []).length > 0 && <PersonaAPersona envios={envios} contactos={contactos ?? []} />}

      <style>{ESTILO}</style>
    </div>
  );
}

const ESTILO = `
.correos-mesa { position:relative; display:flex; flex-direction:column; border-radius:var(--r-panel); overflow:hidden;
  background:var(--surface); border:1px solid var(--border); box-shadow:var(--nm-alto); height:max(560px, calc(100dvh - 270px)); }
.correos-lienzo { flex:1; overflow:auto; padding:28px;
  background-image:radial-gradient(circle, color-mix(in srgb, var(--text) 17%, transparent) 1.1px, transparent 1.6px);
  background-size:22px 22px; background-position:11px 11px; }
.correos-mesa[data-abierto] .correos-lienzo { padding-right:452px; }
.correos-panel { position:absolute; top:14px; right:14px; bottom:72px; width:420px; overflow:auto; display:flex; flex-direction:column; gap:16px;
  padding:20px; border-radius:var(--r-medio); background:var(--surface-solid); border:1px solid var(--border);
  box-shadow:var(--nm-alto), 0 24px 54px color-mix(in srgb, var(--text) 16%, transparent); animation:correos-entra var(--t-normal) var(--curva); }
/* Sin correo dentro, el panel mide lo que lleva: no un folio vacío. */
.correos-panel[data-corto] { bottom:auto; max-height:calc(100% - 86px); }
@keyframes correos-entra { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:none; } }
@media (prefers-reduced-motion: reduce) { .correos-panel { animation:none; } }
.correos-vista { width:100%; flex:1; min-height:520px; border:1px solid var(--border); border-radius:var(--r-sm); background:var(--surface-solid); }
.correos-barra { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 16px; border-top:1px solid var(--border); background:var(--surface-solid); }
.correos-reloj { display:inline-flex; align-items:center; gap:8px; font-size:var(--t-mini); color:var(--text-2); }
.correos-zoom { display:inline-flex; align-items:center; gap:4px; padding:4px; border-radius:var(--r-pill); background:var(--surface-2); border:1px solid var(--border); font-size:var(--t-mini); font-weight:500; color:var(--text-2); }
.correos-zoom button { height:30px; width:30px; border:none; border-radius:var(--r-pill); background:transparent; color:var(--text); font-family:var(--font-ui); font-size:var(--t-body); cursor:pointer; }
.correos-zoom button:hover { background:var(--surface-solid); }
@media (max-width: 760px) {
  .correos-mesa { height:auto; overflow:visible; }
  .correos-lienzo, .correos-mesa[data-abierto] .correos-lienzo { padding:18px 16px; overflow:visible; }
  /* En el móvil el panel no flota: va encima del mapa, dentro de la mesa, y
     la pantalla baja hasta él. Fijo a la ventana se quedaba cortado, porque
     la ventana de cristal es la que se desplaza. */
  .correos-panel { position:static; order:-1; width:auto; margin:12px; animation:none; }
  .correos-vista { min-height:480px; }
  .correos-zoom { display:none; }
}
`;
