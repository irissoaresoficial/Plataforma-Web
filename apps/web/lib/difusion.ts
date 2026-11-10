/**
 * LOS CORREOS A LA LISTA DE MARCO (10 de noviembre de 2026).
 *
 * Gerson: «esto no va a salir desde el Gmail de Marco, va a salir directamente
 * desde el Gmail de la plataforma […] hazlo como si lo estuviese enviando
 * Marco, a su base de datos». Marco ha autorizado que la escuela escriba a sus
 * clientas en su nombre.
 *
 * Es una lista distinta de `leads`: aquí no hay nadie que se haya apuntado,
 * son personas que pasaron por la consulta de Marco. Por eso:
 *   · viven en su propia colección (`difusion`), que sólo ve la administración;
 *   · cada correo dice por qué le llega y lleva su enlace de baja, y la baja
 *     las marca aquí también (`/baja`);
 *   · el recordatorio y el «es hoy» NO van a quien ya se apuntó: esas ya
 *     reciben los recordatorios automáticos de las inscritas, y dos correos
 *     el mismo día por lo mismo es la forma más rápida de conseguir una baja.
 *
 * NO SALE NADA HASTA QUE ALGUIEN LO ENCIENDE. El interruptor es el documento
 * `difusion-config/marco` (`activa: true`), que se toca desde la pantalla
 * «Correos» de la plataforma. Apagado, el reloj diario se lo salta entero.
 *
 * Los textos viven aquí y sólo aquí: la plataforma los enseña pidiéndoselos a
 * `/api/difusion/vista`, para que lo que se revisa sea exactamente lo que sale.
 */

import { MASTERCLASS } from '@/content/site';
import { boton, marco } from '@/lib/correo';

const WEB = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export type IdEnvio = 'invitacion' | 'recordatorio' | 'es-hoy';

export type Envio = {
  id: IdEnvio;
  /** Día en que empieza a salir, en hora de Madrid (AAAA-MM-DD). */
  dia: string;
  asunto: string;
  /** La línea que se lee en la bandeja antes de abrir. */
  previo: string;
  titular: string;
  /** Si va también a quien ya se apuntó a la masterclass. */
  aInscritas: boolean;
};

export const ENVIOS: Envio[] = [
  {
    id: 'invitacion',
    dia: '2026-11-11',
    asunto: '¿Por qué vuelve siempre la misma historia?',
    previo: 'Una clase gratis con Iris Soares, el jueves 26 de noviembre a las 21:00.',
    titular: '¿Por qué vuelve siempre la misma historia?',
    aInscritas: true,
  },
  {
    id: 'recordatorio',
    dia: '2026-11-23',
    asunto: 'Este jueves: la historia que repites sin saberlo',
    previo: '¿A qué edad se emparejó tu madre? ¿Y tú?',
    titular: 'La historia que repites sin saberlo',
    aInscritas: false,
  },
  {
    id: 'es-hoy',
    dia: '2026-11-26',
    asunto: `Hoy a las 21:00 · ${MASTERCLASS.titulo}`,
    previo: 'Esta noche, gratis y en directo. Todavía puedes reservar tu plaza.',
    titular: 'Es esta noche',
    aInscritas: false,
  },
];

export const LISTA = 'marco';
export const COLECCION = 'difusion';
export const CONFIG = 'difusion-config';
/** Cincuenta al día, decidido por Gerson el 10 de noviembre: la lista se
 *  reparte en mañanas seguidas. Cuenta también los recordatorios del día. */
export const TOPE_POR_DEFECTO = 50;

const enlace = (contenido: IdEnvio) =>
  `${WEB}/masterclass?utm_source=email&utm_medium=correo&utm_campaign=masterclass-desordenes&utm_content=marco-${contenido}`;

const P = (t: string) => `<p style="margin:0 0 14px">${t}</p>`;

function cuerpo(id: IdEnvio): string {
  if (id === 'invitacion') {
    return [
      P('Hola,'),
      P('Te escribo porque en algún momento pasaste por mi consulta.'),
      P('Hay algo que veo una y otra vez: cambias de pareja, pero vuelve <b>la misma discusión, el mismo tipo de persona y el mismo final</b>.'),
      P('Casi nunca es mala suerte. Muchas veces es un patrón que empezó en tu familia antes de que tú llegaras.'),
      P(`El <b>jueves 26 de noviembre, a las 21:00</b> (hora de España), doy con Iris Soares una masterclass <b>gratuita y en directo</b> sobre esto: cómo se heredan los patrones en el amor y qué se puede hacer con ellos. Dura una hora y al final hay tiempo para preguntas.`),
      boton(enlace('invitacion'), 'Reservar mi plaza gratis'),
      `<p style="margin:18px 0 0">Si conoces a alguien a quien le pueda servir, reenvíale este correo.</p>`,
      `<p style="margin:14px 0 0">Un abrazo,</p>`,
    ].join('');
  }
  if (id === 'recordatorio') {
    return [
      P('Hola,'),
      P('Una pregunta: <b>¿a qué edad se emparejó tu madre? ¿Y tú?</b>'),
      P('Haz la cuenta. Muchas veces sale la misma edad, o casi. En las familias se repiten las edades, el tipo de pareja y cómo acaba la historia. Verlo es el primer paso para dejar de repetirlo.'),
      P(`De eso hablamos Iris y yo este <b>jueves 26 de noviembre, a las 21:00</b> (hora de España), en la masterclass gratuita <b>${MASTERCLASS.titulo}</b>.`),
      boton(enlace('recordatorio'), 'Reservar mi plaza gratis'),
      `<p style="margin:14px 0 0">Un abrazo,</p>`,
    ].join('');
  }
  return [
    P('Hola,'),
    P(`Esta noche, a las <b>21:00</b> (hora de España), Iris y yo damos la masterclass <b>${MASTERCLASS.titulo}</b>. Es gratis, en directo y dura una hora.`),
    P('Si alguna vez te has preguntado por qué vuelve la misma historia aunque cambie la persona, esta clase es para ti.'),
    boton(enlace('es-hoy'), 'Reservar mi plaza'),
    `<p style="margin:14px 0 0">Nos vemos esta noche,</p>`,
  ].join('');
}

/** El correo tal cual sale. `email` sólo se usa para su enlace de baja. */
export function correoDifusion(id: IdEnvio, email: string): { asunto: string; html: string } {
  const e = ENVIOS.find((x) => x.id === id)!;
  return {
    asunto: e.asunto,
    html: marco({
      previo: e.previo,
      titular: e.titular,
      email,
      cuerpo: cuerpo(id),
      firma: { nombre: 'Marco Célio Sousa', cargo: 'Psicólogo y terapeuta psicosomático clínico' },
      motivo:
        'Recibes este correo porque pasaste por la consulta de Marco Célio Sousa. Te lo envía, con su autorización, la Escuela de Sabiduría 33, donde da clase.',
    }),
  };
}

/** El día de hoy en Madrid, como AAAA-MM-DD. */
export function hoyEnMadrid(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
}

/**
 * Qué envío toca hoy. Es el último cuyo día ya ha llegado: si el tope diario
 * deja a alguien sin la invitación el día 11, al día siguiente se sigue con
 * ella, y así hasta que llega el día del recordatorio, que la sustituye.
 * Pasada la masterclass no toca ninguno.
 */
export function envioDeHoy(hoy = hoyEnMadrid()): Envio | null {
  if (hoy > ENVIOS[ENVIOS.length - 1].dia) return null;
  let toca: Envio | null = null;
  for (const e of ENVIOS) if (e.dia <= hoy) toca = e;
  return toca;
}

/** El identificador del documento de cada persona: su correo, en minúsculas. */
export function idContacto(email: string): string {
  return email.trim().toLowerCase().replace(/\//g, '_');
}
