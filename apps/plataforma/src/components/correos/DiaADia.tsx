"use client";

/**
 * DÍA A DÍA: cómo avanza la lista, mañana por mañana (15 de noviembre de 2026).
 *
 * Ger: «me dices que salen 95, pero ¿cómo sé yo que sigue una secuencia
 * lógica?». Aquí se ve:
 *
 *   · LO QUE YA SALIÓ, con datos de verdad: cada correo enviado lleva la hora
 *     en que salió (`enviados.<id>` en `difusion`), y se agrupa por día.
 *   · LO QUE VA A SALIR, calculado con las mismas reglas que la web
 *     (apps/web/app/api/recordatorios): primero los avisos de las inscritas
 *     de ese día; después la lista, hasta llenar el tope; lo que no cabe pasa
 *     a la mañana siguiente; cuando llega el día del correo siguiente, ése
 *     sustituye al anterior. Es una previsión y lo dice: si alguien se apunta
 *     o se da de baja por el camino, cambia.
 */

import { css } from "@/lib/css";
import { NOTA } from "@/lib/ui";
import type { Conf, Contacto, Envio, Inscrita } from "./VistaCorreos";

export const RECORDATORIOS = [
  { id: "semana", dia: "2026-11-19", que: "Falta una semana" },
  { id: "manana", dia: "2026-11-25", que: "Es mañana" },
  { id: "hoy", dia: "2026-11-26", que: "Es hoy" },
];
const NOMBRE: Record<string, string> = { invitacion: "Invitación", recordatorio: "Recordatorio", "es-hoy": "Es hoy" };

type Linea = { que: string; cuantos: number; quien: "lista" | "inscritas" };
type Fila = { dia: string; lineas: Linea[]; tipo: "hecho" | "proxima" | "previsto" };

const madrid = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
const sumaDia = (iso: string, n: number) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const bonito = (iso: string) => {
  const t = new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** La hora que guarda Firestore llega como Timestamp; aquí basta con su día. */
function diaDe(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: unknown }).toDate === "function") return madrid((v as { toDate: () => Date }).toDate());
  return null;
}

export default function DiaADia({
  envios,
  contactos,
  inscritas,
  conf,
  diaRonda,
}: {
  envios: Envio[];
  contactos: Contacto[];
  inscritas: Inscrita[];
  conf: Conf;
  /** El día (en Madrid) de la próxima ronda del reloj. */
  diaRonda: string;
}) {
  const filas: Fila[] = [];

  /* ---------------------------------------------------- lo que ya salió */
  const hecho = new Map<string, Map<string, Linea>>();
  const apunta = (dia: string, l: Linea) => {
    if (!hecho.has(dia)) hecho.set(dia, new Map());
    const m = hecho.get(dia)!;
    const k = l.quien + l.que;
    m.set(k, { ...l, cuantos: (m.get(k)?.cuantos ?? 0) + l.cuantos });
  };
  for (const c of contactos)
    for (const [id, v] of Object.entries(c.enviados ?? {})) {
      const dia = diaDe(v);
      if (dia) apunta(dia, { que: NOMBRE[id] ?? id, cuantos: 1, quien: "lista" });
    }
  for (const r of RECORDATORIOS) {
    const salieron = inscritas.filter((i) => i.recordatorios?.[r.id]).length;
    if (r.dia < diaRonda && salieron) apunta(r.dia, { que: r.que, cuantos: salieron, quien: "inscritas" });
  }
  for (const dia of [...hecho.keys()].sort()) filas.push({ dia, lineas: [...hecho.get(dia)!.values()], tipo: "hecho" });

  /* ------------------------------------------------- lo que va a salir */
  const orden = [...envios].sort((a, b) => (a.dia < b.dia ? -1 : 1));
  const ultimo = [orden.at(-1)?.dia ?? "", ...RECORDATORIOS.map((r) => r.dia)].sort().at(-1) ?? "";
  const insc = new Set(inscritas.map((i) => i.email.trim().toLowerCase()));
  const activas = contactos.filter((c) => !c.baja);
  const pendientes = new Map(
    orden.map((e) => [e.id, activas.filter((c) => !c.enviados?.[e.id] && (e.aInscritas || !insc.has(c.email))).length]),
  );
  for (let dia = diaRonda, i = 0; dia <= ultimo && i < 40; dia = sumaDia(dia, 1), i++) {
    const lineas: Linea[] = [];
    let usados = 0;
    for (const r of RECORDATORIOS.filter((x) => x.dia === dia)) {
      const van = inscritas.filter((x) => !x.baja && !x.recordatorios?.[r.id]).length;
      usados += van;
      if (van) lineas.push({ que: r.que, cuantos: van, quien: "inscritas" });
    }
    const toca = orden.filter((e) => e.dia <= dia).at(-1);
    if (toca && contactos.length) {
      const quedan = pendientes.get(toca.id) ?? 0;
      const van = Math.min(quedan, Math.max(0, conf.tope - usados));
      pendientes.set(toca.id, quedan - van);
      if (van) lineas.push({ que: NOMBRE[toca.id] ?? toca.id, cuantos: van, quien: "lista" });
    }
    if (lineas.length) filas.push({ dia, lineas, tipo: dia === diaRonda ? "proxima" : "previsto" });
  }

  return (
    <section className="dia" aria-label="Día a día">
      <div className="dia-cabeza">
        <h2>Día a día</h2>
        <p>
          Cada mañana a las 8:00 se cogen, por orden, las personas que todavía no tienen el correo que toca ese día. Salen{" "}
          <b>{conf.tope} como mucho</b>, contando los avisos a las inscritas. Las que no caben, salen a la mañana siguiente.{" "}
          <b>Nadie recibe el mismo correo dos veces.</b>
        </p>
        {!conf.activa && contactos.length > 0 && (
          <p className="dia-aviso">La lista está apagada. Esto es lo que saldría si la enciendes hoy.</p>
        )}
      </div>

      <ol className="dia-lista">
        {filas.map((f) => (
          <li key={f.dia} data-tipo={f.tipo}>
            <span className="dia-fecha">{bonito(f.dia)}</span>
            <span className="dia-que">
              {f.lineas.map((l) => (
                <span key={l.quien + l.que} className="dia-chip" data-quien={l.quien}>
                  <b>{l.cuantos}</b> {l.que}
                  <span className="dia-quien">{l.quien === "lista" ? "lista" : "inscritas"}</span>
                </span>
              ))}
            </span>
            <span className="dia-estado">{f.tipo === "hecho" ? "Enviado" : f.tipo === "proxima" ? "Próxima ronda" : "Previsto"}</span>
          </li>
        ))}
        {!filas.length && <li style={css(NOTA)}>Aún no ha salido nada y no hay nada previsto.</li>}
      </ol>
      <p style={css(NOTA + "margin:0;")}>
        «Enviado» es lo que ya salió de verdad. «Previsto» es una cuenta: si alguien se apunta o se da de baja, cambia.
      </p>
      <style>{ESTILO}</style>
    </section>
  );
}

const ESTILO = `
.dia { display:grid; gap:16px; padding:var(--pad-card); border-radius:var(--r-panel); background:var(--surface); border:1px solid var(--border); box-shadow:var(--nm-alto); }
.dia-cabeza { display:grid; gap:8px; max-width:78ch; }
.dia-cabeza h2 { margin:0; font-size:var(--t-title); font-weight:500; letter-spacing:-.02em; color:var(--text); }
.dia-cabeza p { margin:0; font-size:var(--t-body); line-height:1.55; color:var(--text-2); }
.dia-cabeza b { font-weight:500; color:var(--text); }
.dia-aviso { padding:10px 14px; border-radius:var(--r-sm); background:var(--accion-suave); border:1px solid var(--accion-borde); }
.dia-lista { list-style:none; margin:0; padding:0; display:grid; }
.dia-lista li { display:grid; grid-template-columns:110px 1fr auto; gap:14px; align-items:center; padding:12px 4px; border-top:1px solid var(--border); }
.dia-fecha { font-size:var(--t-body); font-weight:500; color:var(--text); font-variant-numeric:tabular-nums; }
.dia-que { display:flex; flex-wrap:wrap; gap:8px; }
.dia-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 6px 5px 12px; border-radius:var(--r-pill); font-size:var(--t-mini); color:var(--text-2); background:var(--surface-2); border:1px solid var(--border); }
.dia-chip b { font-weight:500; color:var(--text); font-variant-numeric:tabular-nums; }
.dia-quien { padding:2px 8px; border-radius:var(--r-pill); font-size:var(--t-mini); color:var(--text-3); background:var(--surface-solid); }
.dia-chip[data-quien="inscritas"] .dia-quien { color:var(--gold); }
.dia-estado { font-size:var(--t-mini); font-weight:500; padding:4px 10px; border-radius:var(--r-pill); color:var(--text-3); border:1px dashed var(--border-strong); white-space:nowrap; }
.dia-lista li[data-tipo="hecho"] .dia-estado { color:var(--text-2); border-style:solid; border-color:var(--border); background:var(--surface-2); }
.dia-lista li[data-tipo="proxima"] { background:var(--accion-suave); border-radius:var(--r-sm); border-top-color:transparent; }
.dia-lista li[data-tipo="proxima"] .dia-estado { color:var(--sobre-accion); background:var(--accion); border:1px solid var(--accion); }
@media (max-width: 640px) {
  .dia-lista li { grid-template-columns:1fr auto; }
  .dia-que { grid-column:1 / -1; order:3; }
}
`;
