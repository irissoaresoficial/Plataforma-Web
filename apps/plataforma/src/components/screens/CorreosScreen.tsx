"use client";

/**
 * LOS CORREOS AUTOMÁTICOS, EN UNA PANTALLA (10 de noviembre de 2026).
 *
 * Gerson: «que se vea la automatización de emails en la misma plataforma.
 * Solamente que lo vea el administrador».
 *
 * Dos circuitos, y aquí se ven los dos con sus días y lo que ya ha salido:
 *
 *   1. LAS INSCRITAS A LA MASTERCLASS. Salen solos: la confirmación al
 *      apuntarse y tres recordatorios. Lo manda la web cada mañana
 *      (apps/web/app/api/recordatorios) y se apunta en cada ficha de `leads`.
 *
 *   2. LA LISTA DE MARCO. Sus clientas, con su firma, desde el correo de la
 *      escuela. Se sube aquí, se lee el correo aquí, y NO SALE NADA hasta que
 *      se enciende aquí. Los textos viven en la web (apps/web/lib/difusion.ts)
 *      y esta pantalla los enseña pidiéndoselos, para que lo que se revisa sea
 *      exactamente lo que sale.
 *
 * Sólo la abre quien tiene la llave `gestion` (app-context), y las reglas de
 * Firestore cierran `difusion` y `difusion-config` a la administración.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, deleteField, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { css } from "@/lib/css";
import { nube } from "@/lib/firebase";
import { APOYO, BOTON_NORMAL, CABECERA, CAMPO, LECTURA, NOTA, PANTALLA, TARJETA, TITULO, botonPrincipal, punto, rotulo } from "@/lib/ui";

const WEB = process.env.NEXT_PUBLIC_WEB_URL || "https://escueladesabiduria33.com";
const LISTA = "marco";
const TOPE_POR_DEFECTO = 50;

type Textos = { dia: string; asunto: string; previo: string; titular: string; cuerpo: string; boton: string };
type Envio = Textos & { id: string; aInscritas: boolean };
type Contacto = { email: string; baja: boolean; enviados: Record<string, unknown> };
type Inscrita = { email: string; baja: boolean; recordatorios: Record<string, boolean> };

/** Los recordatorios de las inscritas, con el día en que salen. Lo decide la
 *  web contando días hasta la clase (7, 1 y 0); aquí sólo se enseña. */
const RECORDATORIOS = [
  { id: "semana", dia: "2026-11-19", que: "Falta una semana" },
  { id: "manana", dia: "2026-11-25", que: "Es mañana" },
  { id: "hoy", dia: "2026-11-26", que: "Es hoy" },
];

const hoyMadrid = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
const fecha = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/** Saca los correos de un CSV, de una lista pegada o de lo que sea: cualquier
 *  cosa con forma de correo, en minúsculas y sin repetir. */
function correosDe(texto: string): string[] {
  const vistos = new Set<string>();
  for (const m of texto.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) vistos.add(m[0].toLowerCase());
  return [...vistos];
}

export default function CorreosScreen() {
  const [envios, setEnvios] = useState<Envio[] | null>(null);
  const [contactos, setContactos] = useState<Contacto[] | null>(null);
  const [inscritas, setInscritas] = useState<Inscrita[] | null>(null);
  const [conf, setConf] = useState<{ activa: boolean; tope: number }>({ activa: false, tope: TOPE_POR_DEFECTO });
  const [viendo, setViendo] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [fallo, setFallo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  /* Qué correo se está editando y su borrador. La vista previa se recarga
     con `version` cada vez que se guarda. */
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Textos | null>(null);
  const [version, setVersion] = useState(0);

  const carga = useCallback(async () => {
    const base = nube();
    if (!base) return setFallo("No hay conexión con la base de datos.");
    try {
      const [c, l, k] = await Promise.all([
        getDocs(query(collection(base, "difusion"), where("lista", "==", LISTA))),
        getDocs(query(collection(base, "leads"), where("origen", "==", "curso"))),
        getDoc(doc(base, "difusion-config", LISTA)),
      ]);
      setContactos(c.docs.map((d) => ({ email: d.get("email") ?? "", baja: !!d.get("baja"), enviados: d.get("enviados") ?? {} })));
      setInscritas(l.docs.map((d) => ({ email: d.get("email") ?? "", baja: !!d.get("baja"), recordatorios: d.get("recordatorios") ?? {} })));
      const x = k.data();
      setConf({ activa: !!x?.activa, tope: TOPE_POR_DEFECTO });
    } catch (e) {
      setFallo("No se han podido leer los correos: " + String(e).slice(0, 140));
    }
  }, []);

  const cargaEnvios = useCallback(() => {
    fetch(`${WEB}/api/difusion/vista`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setEnvios(j.envios ?? []))
      .catch(() => setFallo("No se ha podido leer la lista de correos de la web."));
  }, []);

  /* Fuera del pintado: `carga` puede avisar de un fallo al momento, y eso no
     puede ocurrir dentro del propio efecto. */
  useEffect(() => {
    const t = setTimeout(() => {
      void carga();
      cargaEnvios();
    }, 0);
    return () => clearTimeout(t);
  }, [carga, cargaEnvios]);

  async function guardaTextos(id: string, t: Textos | null) {
    const base = nube();
    if (!base) return;
    setOcupado(true);
    setFallo("");
    try {
      await setDoc(
        doc(base, "difusion-config", LISTA),
        { textos: { [id]: t ? { ...t } : deleteField() }, cambiado: serverTimestamp() },
        { merge: true },
      );
      setEditando(null);
      setBorrador(null);
      setAviso(t ? "Guardado. Es lo que saldrá a partir de ahora." : "Vuelto al texto original.");
      cargaEnvios();
      setVersion((v) => v + 1);
    } catch (e) {
      setFallo("No se ha podido guardar el correo: " + String(e).slice(0, 140));
    } finally {
      setOcupado(false);
    }
  }

  const hoy = hoyMadrid();
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

  /* Los días que tarda la lista entera con el tope. Cuenta corta y honrada:
     si un día salen recordatorios, ese día caben menos. */
  const dias = (faltan: number) => Math.max(1, Math.ceil(faltan / Math.max(1, conf.tope)));

  async function sube(archivo: File) {
    const base = nube();
    if (!base) return;
    setOcupado(true);
    setAviso("");
    setFallo("");
    try {
      const correos = correosDe(await archivo.text());
      if (!correos.length) throw new Error("el archivo no tiene ningún correo");
      for (let i = 0; i < correos.length; i += 400) {
        const lote = writeBatch(base);
        for (const email of correos.slice(i, i + 400)) {
          /* `merge`: subir la lista otra vez no borra lo ya enviado ni las bajas. */
          lote.set(doc(base, "difusion", email.replace(/\//g, "_")), { email, lista: LISTA, subido: serverTimestamp() }, { merge: true });
        }
        await lote.commit();
      }
      setAviso(`Subidos ${correos.length} correos. Los que ya estaban conservan lo enviado y sus bajas.`);
      await carga();
    } catch (e) {
      setFallo("No se ha podido subir la lista: " + String(e).slice(0, 140));
    } finally {
      setOcupado(false);
    }
  }

  async function guarda(cambio: Partial<{ activa: boolean; tope: number }>) {
    const base = nube();
    if (!base) return;
    if (cambio.activa) {
      const e = (envios ?? []).filter((x) => x.dia <= hoy).pop() ?? envios?.[0];
      const ok = window.confirm(
        `Vas a encender los correos de Marco.\n\nCada mañana a las 8:00 saldrán hasta ${conf.tope} correos` +
          (e ? `, empezando por «${e.asunto}» el ${fecha(e.dia > hoy ? e.dia : hoy)}` : "") +
          ".\n\n¿Has leído el correo y está bien?",
      );
      if (!ok) return;
    }
    setOcupado(true);
    try {
      const nuevo = { ...conf, ...cambio };
      await setDoc(doc(base, "difusion-config", LISTA), { ...nuevo, cambiado: serverTimestamp() }, { merge: true });
      setConf(nuevo);
    } catch (e) {
      setFallo("No se ha podido guardar: " + String(e).slice(0, 140));
    } finally {
      setOcupado(false);
    }
  }

  const cargando = contactos === null || inscritas === null;
  const vivas = (inscritas ?? []).filter((i) => !i.baja).length;

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);max-width:1040px;")}>
      <header style={css("display:grid;gap:6px;")}>
        <p style={css(rotulo() + "margin:0;")}>Sólo administración</p>
        <h1 style={css(TITULO + "margin:0;")}>Correos automáticos</h1>
        <p style={css(LECTURA + "margin:0;max-width:62ch;")}>
          Qué sale, a quién y qué día. Todo lo manda la web sola cada mañana a las <b>8:00</b> (hora de España), desde{" "}
          <b>hola@escueladesabiduria33.com</b>.
        </p>
      </header>

      {fallo && <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>{fallo}</p>}
      {aviso && <p role="status" style={css(NOTA + "margin:0;color:var(--text-2);")}>{aviso}</p>}
      {cargando && !fallo && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {/* ---------------------------------------------------------- MARCO */}
      <section style={css(TARJETA + "padding:var(--pad-card);display:grid;gap:18px;")} id="lista-marco">
        <div style={css("display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;")}>
          <div style={css("display:grid;gap:4px;min-width:0;")}>
            <h2 style={css(CABECERA + "margin:0;")}>Clientas de Marco</h2>
            <p style={css(APOYO + "margin:0;")}>Firmados por Marco Célio Sousa. A quien ya se ha apuntado no le llegan ni el recordatorio ni el «es hoy».</p>
          </div>
          <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap;")}>
            <span style={css("display:inline-flex;align-items:center;gap:8px;" + APOYO)}>
              <span style={css(punto(conf.activa ? "var(--green, #3c8a5a)" : "var(--text-4)"))} />
              {conf.activa ? "Encendido" : "Apagado: no sale nada"}
            </span>
            <button
              type="button"
              disabled={ocupado || !n.total}
              onClick={() => void guarda({ activa: !conf.activa })}
              style={css(conf.activa ? BOTON_NORMAL : botonPrincipal(!ocupado && n.total > 0))}
            >
              {conf.activa ? "Pausar envíos" : "Encender envíos"}
            </button>
          </div>
        </div>

        <div data-kpis="" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;")}>
          {[
            [n.total, "en la lista"],
            [n.yaInscritas, "ya inscritas"],
            [n.bajas, "se dieron de baja"],
            [conf.tope, "correos al día como máximo"],
          ].map(([v, q]) => (
            <div key={String(q)} style={css("padding:14px 16px;border-radius:var(--r-sm);background:color-mix(in srgb, var(--text) 4%, transparent);")}>
              <div style={css("font-size:var(--t-head);font-weight:500;color:var(--text);")}>{cargando ? "—" : v}</div>
              <div style={css(NOTA)}>{q}</div>
            </div>
          ))}
        </div>

        <ol style={css("list-style:none;margin:0;padding:0;display:grid;gap:0;")}>
          {(envios ?? []).map((e) => {
            const enviados = n.enviados(e.id);
            const faltan = n.faltan(e);
            const ya = e.dia <= hoy;
            const estado = !n.total
              ? "Falta subir la lista"
              : faltan === 0 && enviados > 0
                ? `Enviado a ${enviados}`
                : !conf.activa
                  ? `Parado · ${faltan} pendientes`
                  : ya
                    ? `Saliendo · ${enviados} enviados, ${faltan} pendientes (${dias(faltan)} ${dias(faltan) === 1 ? "mañana" : "mañanas"})`
                    : `Programado · ${faltan} destinatarias`;
            return (
              <li key={e.id} style={css("display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;padding:14px 0;border-top:1px solid var(--border);")}>
                <span style={css("font-weight:500;color:var(--text);text-transform:capitalize;")}>{fecha(e.dia)}</span>
                <span style={css("display:grid;gap:2px;min-width:0;")}>
                  <span style={css("color:var(--text);font-weight:500;")}>{e.asunto}</span>
                  <span style={css(NOTA)}>{estado}</span>
                </span>
                <span style={css("display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;")}>
                  <button type="button" style={css(BOTON_NORMAL)} onClick={() => setViendo(viendo === e.id ? null : e.id)}>
                    {viendo === e.id ? "Cerrar" : "Ver"}
                  </button>
                  <button
                    type="button"
                    style={css(BOTON_NORMAL)}
                    onClick={() => {
                      if (editando === e.id) return setEditando(null);
                      setEditando(e.id);
                      setViendo(e.id);
                      setBorrador({ dia: e.dia, asunto: e.asunto, previo: e.previo, titular: e.titular, cuerpo: e.cuerpo, boton: e.boton });
                    }}
                  >
                    {editando === e.id ? "Cancelar" : "Editar"}
                  </button>
                </span>
                {editando === e.id && borrador && (
                  <div style={css("grid-column:1/-1;display:grid;gap:12px;padding:16px;border-radius:var(--r-sm);background:color-mix(in srgb, var(--text) 4%, transparent);")}>
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
                        rows={14}
                        onChange={(ev) => setBorrador({ ...borrador, cuerpo: ev.target.value })}
                        style={css(CAMPO + "resize:vertical;line-height:1.55;")}
                      />
                    </label>
                    <span style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
                      <button type="button" disabled={ocupado} style={css(botonPrincipal(!ocupado))} onClick={() => void guardaTextos(e.id, borrador)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        disabled={ocupado}
                        style={css(BOTON_NORMAL)}
                        onClick={() => window.confirm("¿Volver al texto original de este correo?") && void guardaTextos(e.id, null)}
                      >
                        Volver al original
                      </button>
                    </span>
                  </div>
                )}
                {viendo === e.id && (
                  <iframe
                    key={`${e.id}-${version}`}
                    title={e.asunto}
                    src={`${WEB}/api/difusion/vista?id=${e.id}`}
                    style={css("grid-column:1/-1;width:100%;height:760px;border:1px solid var(--border);border-radius:var(--r-sm);background:#f1ede4;")}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div style={css("display:flex;gap:12px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:16px;")}>
          <label style={css(BOTON_NORMAL + "cursor:pointer;")}>
            {n.total ? "Volver a subir la lista" : "Subir la lista (CSV)"}
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              style={css("display:none;")}
              disabled={ocupado}
              onChange={(ev) => {
                const f = ev.target.files?.[0];
                if (f) void sube(f);
                ev.target.value = "";
              }}
            />
          </label>
          <span style={css(APOYO)}>Salen 50 al día, contando los recordatorios de las inscritas de ese día.</span>
        </div>
      </section>

      {/* ------------------------------------------------------- INSCRITAS */}
      <section style={css(TARJETA + "padding:var(--pad-card);display:grid;gap:14px;")} id="inscritas">
        <div style={css("display:grid;gap:4px;")}>
          <h2 style={css(CABECERA + "margin:0;")}>Inscritas a la masterclass</h2>
          <p style={css(APOYO + "margin:0;")}>
            Siempre encendido. Firmados por Iris. {cargando ? "" : `${vivas} inscritas reciben estos correos.`}
          </p>
        </div>
        <ol style={css("list-style:none;margin:0;padding:0;")}>
          <li style={css("display:grid;grid-template-columns:96px 1fr;gap:14px;padding:12px 0;border-top:1px solid var(--border);")}>
            <span style={css("font-weight:500;color:var(--text);")}>Al apuntarse</span>
            <span style={css("display:grid;gap:2px;")}>
              <span style={css("color:var(--text);font-weight:500;")}>Confirmación y enlace al grupo de WhatsApp</span>
              <span style={css(NOTA)}>Sale en el momento, una por inscrita</span>
            </span>
          </li>
          {RECORDATORIOS.map((r) => {
            const salieron = (inscritas ?? []).filter((i) => i.recordatorios?.[r.id]).length;
            return (
              <li key={r.id} style={css("display:grid;grid-template-columns:96px 1fr;gap:14px;padding:12px 0;border-top:1px solid var(--border);")}>
                <span style={css("font-weight:500;color:var(--text);text-transform:capitalize;")}>{fecha(r.dia)}</span>
                <span style={css("display:grid;gap:2px;")}>
                  <span style={css("color:var(--text);font-weight:500;")}>{r.que}</span>
                  <span style={css(NOTA)}>{r.dia > hoy ? "Programado" : `Enviado a ${salieron}`}</span>
                </span>
              </li>
            );
          })}
          <li style={css("display:grid;grid-template-columns:96px 1fr;gap:14px;padding:12px 0;border-top:1px solid var(--border);")}>
            <span style={css("font-weight:500;color:var(--text);")}>26 nov, 20:00</span>
            <span style={css("display:grid;gap:2px;")}>
              <span style={css("color:var(--text);font-weight:500;")}>«Empezamos en una hora»</span>
              <span style={css(NOTA)}>No es automático: lo manda Iris por el grupo de WhatsApp</span>
            </span>
          </li>
        </ol>
      </section>
    </div>
  );
}
