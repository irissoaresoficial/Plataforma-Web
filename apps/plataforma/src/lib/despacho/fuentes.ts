/**
 * DE DÓNDE LLEGA CADA PERSONA, DICHO COMO SE DICE.
 *
 * Gerson, el 20 de octubre de 2026: «ahora mismo sólo vienen de la web:
 * publicidad y redes sociales». Así que la pregunta no es por qué formulario
 * entró —todos son de la web— sino qué la llevó a la web.
 *
 * Se lee de la etiqueta del enlace (utm) que la web guarda con cada persona.
 * Si no trae etiqueta, se mira lo que Iris haya apuntado a mano en la ficha.
 * Si tampoco, «Directo a la web»: escribió la dirección o la buscó.
 */
import { etiquetaCanal, type Lead } from "./leads";

export function fuenteDe(l: Lead): string {
  const s = (l.campana?.source || "").toLowerCase();
  const m = (l.campana?.medium || "").toLowerCase();
  const pago = /cpc|paid|ads|ppc|pago/.test(m) || /ads/.test(s);
  if (/facebook|fb|instagram|ig|meta/.test(s)) return pago ? "Publicidad en Instagram y Facebook" : "Instagram y Facebook";
  if (/tiktok/.test(s)) return pago ? "Publicidad en TikTok" : "TikTok";
  if (/google/.test(s)) return pago ? "Publicidad en Google" : "Google";
  if (/youtube|yt/.test(s)) return "YouTube";
  if (/whatsapp|wa/.test(s)) return "WhatsApp";
  if (s) return s.charAt(0).toUpperCase() + s.slice(1);
  if (l.canal && l.canal !== "nose") return etiquetaCanal(l.canal);
  return "Directo a la web";
}
