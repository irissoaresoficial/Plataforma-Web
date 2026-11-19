/**
 * EL CALENDARIO DE IRIS, PARA SUSCRIBIRSE CON UN BOTÓN (19 de noviembre de 2026).
 *
 * Gerson: «que el calendario se vincule con el calendario de Iris, tipo plug
 * and play, que sólo sea un botón».
 *
 * Cómo: la web publica las citas de la plataforma como un calendario .ics en
 * una dirección secreta. Google Calendar, el iPhone y Outlook saben
 * suscribirse a una dirección así: un toque, «¿añadir este calendario?», sí, y
 * ya está. No hace falta dar permisos de Google ni crear nada en Google Cloud.
 *
 * LA LLAVE de la dirección no es un dato nuevo que haya que guardar en
 * Vercel: se saca del secreto que la web ya tiene (`CRON_SECRET`) con un
 * HMAC. Quien no tenga la dirección no puede leer el calendario, y si algún
 * día hay que cambiarla basta con subir `VERSION`.
 *
 * Va en un sentido: de la plataforma al calendario de Iris. Google refresca
 * los calendarios suscritos solo, cada pocas horas; no es al segundo.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const VERSION = 'calendario-iris-v1';

export function llaveCalendario(): string | null {
  const s = process.env.CRON_SECRET || process.env.DIFUSION_KEY;
  if (!s) return null;
  return createHmac('sha256', s).update(VERSION).digest('base64url').slice(0, 32);
}

export function llaveValida(k: string): boolean {
  const buena = llaveCalendario();
  if (!buena || !k || k.length !== buena.length) return false;
  return timingSafeEqual(Buffer.from(k), Buffer.from(buena));
}

const TIPO: Record<string, string> = { sesion: 'Sesión', sinergia: 'Estudio Sinergia', seguimiento: 'Seguimiento' };

/** Texto de iCalendar: escapa lo que el formato reserva y corta a 75 octetos. */
const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
function linea(l: string): string {
  const b = Buffer.from(l, 'utf8');
  if (b.length <= 75) return l;
  const trozos: string[] = [];
  let i = 0;
  while (i < b.length) {
    let fin = Math.min(i + (trozos.length ? 74 : 75), b.length);
    while (fin < b.length && (b[fin] & 0xc0) === 0x80) fin--; // no partir una letra
    trozos.push(b.subarray(i, fin).toString('utf8'));
    i = fin;
  }
  return trozos.join('\r\n ');
}
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export type CitaCal = { id: string; inicioISO: string; minutos: number; tipo: string; estado: string; quien: string };

export function ics(citas: CitaCal[]): string {
  const ahora = utc(new Date());
  const l = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Escuela de Sabiduria 33//Plataforma//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Escuela de Sabiduría 33',
    'X-WR-TIMEZONE:Europe/Madrid',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ];
  for (const c of citas) {
    const ini = new Date(c.inicioISO);
    if (Number.isNaN(ini.getTime())) continue;
    const fin = new Date(ini.getTime() + (c.minutos || 60) * 60000);
    const que = TIPO[c.tipo] ?? 'Cita';
    const porConfirmar = c.estado === 'pedida';
    l.push(
      'BEGIN:VEVENT',
      `UID:${c.id}@plataforma.escueladesabiduria33.com`,
      `DTSTAMP:${ahora}`,
      `DTSTART:${utc(ini)}`,
      `DTEND:${utc(fin)}`,
      linea(`SUMMARY:${esc(`${porConfirmar ? 'Por confirmar · ' : ''}${que}${c.quien ? ` · ${c.quien}` : ''}`)}`),
      `STATUS:${porConfirmar ? 'TENTATIVE' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }
  l.push('END:VCALENDAR');
  return l.join('\r\n') + '\r\n';
}
