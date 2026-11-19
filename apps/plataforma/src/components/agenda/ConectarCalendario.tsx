"use client";

/**
 * «CONECTAR CON MI CALENDARIO», UN BOTÓN (19 de noviembre de 2026).
 *
 * Gerson: «que el calendario se vincule con el calendario de Iris, tipo plug
 * and play, que sólo sea un botón».
 *
 * Pide a la web la dirección secreta del calendario (apps/web/lib/calendario.ts)
 * y abre Google Calendar con «¿Añadir este calendario?». Un sí y las citas de
 * la plataforma salen en su Google y en su móvil. Para el iPhone o el Mac, el
 * enlace de debajo abre el Calendario de Apple con la misma pregunta.
 *
 * Es de la plataforma hacia su calendario. Google lo refresca solo cada pocas
 * horas: una cita recién puesta puede tardar en aparecer allí.
 */

import { useState } from "react";
import { css } from "@/lib/css";
import { auth } from "@/lib/firebase";
import { BOTON_NORMAL, NOTA } from "@/lib/ui";

const WEB = (process.env.NEXT_PUBLIC_WEB_URL || "https://escueladesabiduria33.com").replace("://escueladesabiduria33.com", "://www.escueladesabiduria33.com");

type Enlaces = { google: string; webcal: string; https: string };

async function pideEnlaces(): Promise<Enlaces> {
  const yo = auth()?.currentUser;
  if (!yo) throw new Error("Hay que entrar primero.");
  const r = await fetch(`${WEB}/api/calendario`, { headers: { Authorization: `Bearer ${await yo.getIdToken()}` } });
  const j = (await r.json().catch(() => ({}))) as Partial<Enlaces> & { ok?: boolean; motivo?: string };
  if (!r.ok || !j.ok || !j.google) {
    throw new Error(j.motivo === "permiso" ? "Sólo la administradora puede conectar el calendario." : "La web no ha contestado. Prueba en un momento.");
  }
  return j as Enlaces;
}

export default function ConectarCalendario() {
  const [enlaces, setEnlaces] = useState<Enlaces | null>(null);
  const [fallo, setFallo] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function conecta() {
    setFallo("");
    /* La ventana se abre ANTES de esperar a la web: si se abre después, el
       navegador lo toma por una ventana emergente y la bloquea. */
    const v = window.open("", "_blank");
    setOcupado(true);
    try {
      const e = enlaces ?? (await pideEnlaces());
      setEnlaces(e);
      if (v) v.location.href = e.google;
      else window.location.href = e.google;
    } catch (err) {
      v?.close();
      setFallo(String((err as Error).message || err));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:12px;")}>
      <button type="button" onClick={() => void conecta()} disabled={ocupado} style={css(BOTON_NORMAL)}>
        {ocupado ? "Abriendo Google…" : enlaces ? "Conectado · abrir otra vez" : "Conectar con mi calendario"}
      </button>
      {enlaces && (
        <a href={enlaces.webcal} style={css(NOTA + "color:var(--text-2);text-decoration:underline;text-underline-offset:3px;")}>
          ¿iPhone o Mac? Toca aquí
        </a>
      )}
      {fallo && <span style={css(NOTA + "color:var(--red);")}>{fallo}</span>}
    </div>
  );
}
