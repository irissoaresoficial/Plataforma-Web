/**
 * Envía un correo captado a /api/lead. Devuelve si se ha guardado de verdad,
 * para que los formularios no digan "guardado" cuando no lo está.
 *
 * Y LE PEGA LA CAMPAÑA, SIN QUE NINGÚN FORMULARIO TENGA QUE ACORDARSE.
 *
 * Es el único sitio por el que sale un lead de esta web —la masterclass, la
 * lista de la comunidad y la sinergia pasan los tres por aquí—, así que es el
 * único sitio donde hay que acordarse. Si la etiqueta se pegara en cada
 * formulario, el día que se añada el cuarto alguien se olvidaría, y quedaría
 * un agujero en las métricas del que nadie se enteraría hasta ver que los
 * números de Meta y los de casa no cuadran.
 *
 * De dónde sale la etiqueta y por qué no vive en una cookie: `campana.ts`.
 */
import { hayCampana, leeCampana } from './campana';
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
  const campana = leeCampana();
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'es',
        nombre: '',
        detalle: '',
        whatsapp: '',
        ...payload,
        /* Sin etiquetas no se manda el bloque: un lead que llegó por su cuenta
           no tiene por qué escribir seis campos vacíos en la base de datos. */
        ...(hayCampana(campana) ? { campana } : {}),
      }),
    });
    const data = await res.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  }
}
