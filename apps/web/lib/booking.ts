export type Booking = {
  nombre: string;
  fecha: string; // fecha de nacimiento, tal y como la escribe la persona
  motivo: string;
  dia: string; // etiqueta legible del día elegido ("lun, 6 oct")
  diaISO: string; // YYYY-MM-DD del día elegido
  hora: string; // HH:MM (hora española)
  email: string;
  lang?: string;
};

/** Huecos por defecto del día. El Apps Script usa esta misma plantilla al calcular disponibilidad. */
export const DEFAULT_HOURS = ['10:00', '12:30', '16:00', '18:30'];
export const SESSION_MINUTES = 90;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Valida y normaliza el payload que llega del chat antes de mandarlo a Google. */
export function parseBooking(input: unknown): { booking: Booking | null; error: string } {
  if (!input || typeof input !== 'object') return { booking: null, error: 'payload' };
  const raw = input as Record<string, unknown>;

  const str = (key: string, max: number) => {
    const v = raw[key];
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
  };

  const booking: Booking = {
    nombre: str('nombre', 120),
    fecha: str('fecha', 40),
    motivo: str('motivo', 800),
    dia: str('dia', 80),
    diaISO: str('diaISO', 10),
    hora: str('hora', 5),
    email: str('email', 160).toLowerCase(),
    lang: str('lang', 2) || 'es',
  };

  if (booking.nombre.length < 2) return { booking: null, error: 'nombre' };
  if (!EMAIL_RE.test(booking.email)) return { booking: null, error: 'email' };
  if (!ISO_DATE_RE.test(booking.diaISO)) return { booking: null, error: 'dia' };
  if (!TIME_RE.test(booking.hora)) return { booking: null, error: 'hora' };

  return { booking, error: '' };
}

/**
 * Un lead es cualquier correo que entra por la web. El origen decide qué pasa después:
 * los de 'sinergia' entran en la secuencia de correos; el resto solo se guardan y avisan a Iris.
 */
export type Lead = {
  email: string;
  nombre: string;
  origen: string;
  detalle: string; // resultado de la sinergia, curso al que se apunta, etc.
  whatsapp: string;
  lang: string;
};

export const LEAD_SOURCES = ['sinergia', 'membresia', 'curso'] as const;

export function parseLead(input: unknown): { lead: Lead | null; error: string } {
  if (!input || typeof input !== 'object') return { lead: null, error: 'payload' };
  const raw = input as Record<string, unknown>;
  const str = (key: string, max: number) => {
    const v = raw[key];
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
  };

  const lead: Lead = {
    email: str('email', 160).toLowerCase(),
    nombre: str('nombre', 120),
    origen: str('origen', 40),
    detalle: str('detalle', 500),
    whatsapp: str('whatsapp', 40),
    lang: str('lang', 2) || 'es',
  };

  if (!EMAIL_RE.test(lead.email)) return { lead: null, error: 'email' };
  if (!(LEAD_SOURCES as readonly string[]).includes(lead.origen)) return { lead: null, error: 'origen' };

  return { lead, error: '' };
}

export type Availability = { iso: string; hours: string[] }[];

/** Forma que devuelve el Apps Script en /availability, validada antes de dársela al chat. */
export function parseAvailability(input: unknown): Availability | null {
  const days = (input as any)?.days;
  if (!Array.isArray(days)) return null;
  const out: Availability = [];
  for (const d of days) {
    const iso = typeof d?.iso === 'string' ? d.iso : '';
    if (!ISO_DATE_RE.test(iso)) continue;
    const hours = Array.isArray(d?.hours) ? d.hours.filter((h: unknown) => typeof h === 'string' && TIME_RE.test(h)) : [];
    if (hours.length) out.push({ iso, hours });
  }
  return out;
}
