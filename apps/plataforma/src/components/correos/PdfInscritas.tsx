"use client";

/**
 * «PDF DE INSCRITAS», UN BOTÓN (19 de noviembre de 2026).
 *
 * Gerson: «dame un PDF con las personas que están inscritas (si hay forma de
 * saber que están en el grupo, mejor)».
 *
 * Abre una hoja limpia con las inscritas —la masterclass y la formación por
 * separado— y el diálogo de imprimir, que es como se guarda el PDF.
 *
 * EL GRUPO DE WHATSAPP NO SE PUEDE SABER DESDE AQUÍ: WhatsApp no le cuenta a
 * nadie quién está en un grupo. Lo honrado es poner el WhatsApp que dejó cada
 * una al apuntarse (si lo dejó) y una casilla para marcarlo a mano mirando el
 * grupo. No se inventa un «está en el grupo» que nadie ha comprobado.
 */

import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { BOTON_NORMAL } from "@/lib/ui";
import { css } from "@/lib/css";

type Fila = { nombre: string; email: string; whatsapp: string; alta: string; baja: boolean };

const escapa = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

function fecha(v: unknown): string {
  const d =
    v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: unknown }).toDate === "function"
      ? (v as { toDate: () => Date }).toDate()
      : v
        ? new Date(String(v))
        : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })
    : "";
}

function tabla(titulo: string, filas: Fila[]): string {
  const cuerpo = filas
    .map(
      (f, i) => `<tr${f.baja ? ' class="baja"' : ""}><td class="n">${i + 1}</td><td>${escapa(f.nombre)}</td><td>${escapa(f.email)}</td><td>${escapa(f.whatsapp) || "—"}</td><td class="f">${escapa(f.alta)}</td><td class="c"><span></span></td></tr>`,
    )
    .join("");
  return `<h2>${escapa(titulo)} <small>${filas.length}</small></h2>
  <table><thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>WhatsApp que dejó</th><th>Se apuntó</th><th>En el grupo</th></tr></thead><tbody>${cuerpo || '<tr><td colspan="6">Nadie todavía.</td></tr>'}</tbody></table>`;
}

export default function PdfInscritas() {
  const [fallo, setFallo] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function genera() {
    setFallo("");
    /* La ventana se abre dentro del clic: si se abre después de esperar a la
       base, el navegador la bloquea como emergente. */
    const v = window.open("", "_blank");
    if (!v) return setFallo("El navegador ha bloqueado la ventana. Permite las ventanas emergentes y vuelve a pulsar.");
    v.document.write("<p style='font-family:sans-serif;padding:24px'>Preparando la lista…</p>");
    setOcupado(true);
    try {
      const base = nube();
      if (!base) throw new Error("sin base");
      const r = await getDocs(query(collection(base, "leads"), where("origen", "==", "curso")));
      const todas = r.docs.map((d) => {
        const x = d.data() as Record<string, unknown>;
        const t = x.alta as { toMillis?: () => number } | undefined;
        return {
          fila: {
            nombre: String(x.nombre ?? ""),
            email: String(x.email ?? ""),
            whatsapp: String(x.whatsapp ?? ""),
            alta: fecha(x.alta),
            baja: Boolean(x.baja),
          } as Fila,
          formacion: String(x.detalle ?? "").startsWith("Formación: "),
          orden: typeof t?.toMillis === "function" ? t.toMillis() : 0,
        };
      });
      todas.sort((a, b) => a.orden - b.orden);
      const mc = todas.filter((x) => !x.formacion).map((x) => x.fila);
      const fm = todas.filter((x) => x.formacion).map((x) => x.fila);
      const hoy = new Date().toLocaleString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
      v.document.open();
      v.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Inscritas · Escuela de Sabiduría 33</title>
<style>
@page { size: A4; margin: 14mm; }
body { font-family: "Instrument Sans", system-ui, sans-serif; color: #221d1f; margin: 0; font-style: normal; }
header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #451a25; padding-bottom:10px; margin-bottom:18px; }
h1 { font-size: 22px; font-weight: 500; margin: 0; color:#451a25; }
header p { margin: 4px 0 0; font-size: 12px; color:#574c49; }
h2 { font-size: 16px; font-weight: 500; margin: 22px 0 8px; color:#451a25; }
h2 small { font-size: 12px; color:#7d5f1e; font-weight: 500; margin-left: 6px; }
table { width:100%; border-collapse: collapse; font-size: 11px; }
th { text-align:left; font-weight:500; color:#574c49; border-bottom:1px solid #e9e5df; padding:6px 6px; }
td { border-bottom:1px solid #e9e5df; padding:6px 6px; vertical-align:middle; }
td.n { color:#7d5f1e; width:22px; } td.f { white-space:nowrap; color:#574c49; }
td.c span { display:inline-block; width:12px; height:12px; border:1.5px solid #a9884f; border-radius:3px; }
tr.baja td { color:#9b9192; text-decoration: line-through; }
.nota { margin-top: 18px; font-size: 11px; color:#574c49; line-height:1.5; }
tr { break-inside: avoid; }
</style></head><body>
<header><div><h1>Inscritas</h1><p>Escuela de Sabiduría 33 · sacado de la plataforma el ${escapa(hoy)}</p></div></header>
${tabla("Masterclass «Desórdenes Amorosos» · jueves 26 de noviembre", mc)}
${tabla("Formación «Numerología Transgeneracional» · 22 y 28 de noviembre", fm)}
<p class="nota"><b>En el grupo:</b> WhatsApp no deja saber quién está dentro de un grupo, así que esta casilla se marca a mano mirando el grupo. La columna «WhatsApp que dejó» sólo tiene número si la persona lo puso al apuntarse. Las tachadas se dieron de baja de los correos. Documento con datos personales: no se reenvía ni se publica.</p>
<script>setTimeout(function(){window.print()},300)</script>
</body></html>`);
      v.document.close();
    } catch (e) {
      v.close();
      setFallo("No se ha podido leer la lista: " + String(e).slice(0, 120));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div style={css("display:flex;flex-wrap:wrap;align-items:center;gap:10px;")}>
      <button type="button" onClick={() => void genera()} disabled={ocupado} style={css(BOTON_NORMAL)}>
        {ocupado ? "Preparando…" : "PDF de inscritas"}
      </button>
      {fallo && <span style={css("font-size:var(--t-mini);color:var(--red);")}>{fallo}</span>}
    </div>
  );
}
