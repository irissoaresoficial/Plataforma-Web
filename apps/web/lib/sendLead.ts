/**
 * Envía un correo captado a /api/lead. Devuelve si se ha guardado de verdad,
 * para que los formularios no digan "guardado" cuando no lo está.
 */
import type { LeadSource } from './booking';

export async function sendLead(payload: {
  email: string;
  nombre?: string;
  /* Uno de los tres que el servidor conoce, y no un texto cualquiera. El motivo
     está escrito entero junto a `LEAD_SOURCES`, en `booking.ts`. */
  origen: LeadSource;
  detalle?: string;
  whatsapp?: string;
  lang?: string;
  /* El correo ya escrito para la persona. Sólo lo manda la sinergia; ver
     `correo-sinergia.ts` y el comentario del tipo `Lead` en `booking.ts`. */
  asunto?: string;
  parrafos?: string[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: 'es', nombre: '', detalle: '', whatsapp: '', ...payload }),
    });
    const data = await res.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  }
}
