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
 * LOS TEXTOS SE EDITAN DESDE LA PLATAFORMA. Aquí está la versión original;
 * lo que se cambie en «Correos» se guarda en `difusion-config/marco.textos` y
 * manda sobre esto, tanto al enviar como en la vista previa
 * (`/api/difusion/vista`), así que lo que se revisa es exactamente lo que sale.
 *
 * El cuerpo se escribe como texto llano, que es lo que se puede editar sin
 * romper nada: una línea en blanco separa párrafos, **así** va en negrita y
 * una línea con [botón] dice dónde va el botón de reservar.
 */

import { MASTERCLASS } from '@/content/site';
import { boton, marco } from '@/lib/correo';
import type { db } from '@/lib/firebase';

const WEB = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

export type IdEnvio = 'invitacion' | 'recordatorio' | 'es-hoy';

/** Lo que se puede cambiar desde la plataforma. */
export type Textos = {
  /** Día en que empieza a salir, en hora de Madrid (AAAA-MM-DD). */
  dia: string;
  asunto: string;
  /** La línea que se lee en la bandeja antes de abrir. */
  previo: string;
  titular: string;
  /** Texto llano: párrafos separados por una línea en blanco, **negrita**, [botón]. */
  cuerpo: string;
  boton: string;
};

export type Envio = Textos & {
  id: IdEnvio;
  /** Si va también a quien ya se apuntó a la masterclass. */
  aInscritas: boolean;
};

/*
 * EN PORTUGUÉS DE PORTUGAL (10 de noviembre de 2026). Gerson: «las clientas
 * de Marco, los correos deben ir en portugués». De usted («você» implícito,
 * en tercera persona), que es como se le escribe a una paciente. La hora va
 * primero en la de Portugal, que es la suya, y entre paréntesis la de España.
 */
export const ENVIOS: Envio[] = [
  {
    id: 'invitacion',
    dia: '2026-11-11',
    asunto: 'Porque é que a mesma história se repete sempre?',
    previo: 'Uma aula gratuita com a Iris Soares, quinta-feira, 26 de novembro, às 20h00.',
    titular: 'Porque é que a mesma história se repete sempre?',
    boton: 'Reservar o meu lugar grátis',
    aInscritas: true,
    cuerpo: `Olá,

Escrevo-lhe porque, em algum momento, passou pela minha consulta.

Há algo que vejo uma e outra vez: muda de parceiro, mas volta **a mesma discussão, o mesmo tipo de pessoa e o mesmo final**.

Quase nunca é azar. Muitas vezes é um padrão que começou na sua família antes de ter nascido.

Na **quinta-feira, 26 de novembro, às 20h00** (hora de Portugal; 21h00 em Espanha), dou com a Iris Soares uma masterclass **gratuita e em direto** sobre isto: como se herdam os padrões no amor e o que se pode fazer com eles. Dura uma hora e, no fim, há tempo para perguntas.

[botón]

Se conhece alguém a quem isto possa ajudar, reencaminhe-lhe este e-mail.

Um abraço,`,
  },
  {
    id: 'recordatorio',
    dia: '2026-11-23',
    asunto: 'Esta quinta-feira: a história que repete sem saber',
    previo: 'Com que idade a sua mãe se casou ou foi viver com alguém? E você?',
    titular: 'A história que repete sem saber',
    boton: 'Reservar o meu lugar grátis',
    aInscritas: false,
    cuerpo: `Olá,

Uma pergunta: **com que idade a sua mãe se casou ou foi viver com alguém? E você?**

Faça as contas. Muitas vezes dá a mesma idade, ou quase. Nas famílias repetem-se as idades, o tipo de parceiro e a forma como a história acaba. Ver isso é o primeiro passo para deixar de o repetir.

É disso que a Iris e eu falamos esta **quinta-feira, 26 de novembro, às 20h00** (hora de Portugal; 21h00 em Espanha), na masterclass gratuita **${MASTERCLASS.titulo}**.

[botón]

Um abraço,`,
  },
  {
    id: 'es-hoy',
    dia: '2026-11-26',
    asunto: `Hoje às 20h00 · ${MASTERCLASS.titulo}`,
    previo: 'Esta noite, gratuita e em direto. Ainda pode reservar o seu lugar.',
    titular: 'É esta noite',
    boton: 'Reservar o meu lugar',
    aInscritas: false,
    cuerpo: `Olá,

Esta noite, às **20h00** (hora de Portugal; 21h00 em Espanha), a Iris e eu damos a masterclass **${MASTERCLASS.titulo}**. É gratuita, em direto e dura uma hora.

Se alguma vez se perguntou porque é que a mesma história volta, mesmo quando a pessoa muda, esta aula é para si.

[botón]

Até logo à noite,`,
  },
];

export const LISTA = 'marco';
export const COLECCION = 'difusion';
export const CONFIG = 'difusion-config';
/** Cincuenta al día, decidido por Gerson el 10 de noviembre: la lista se
 *  reparte en mañanas seguidas. Cuenta también los recordatorios del día. */
export const TOPE_POR_DEFECTO = 50;

const CAMPOS: Array<keyof Textos> = ['dia', 'asunto', 'previo', 'titular', 'cuerpo', 'boton'];

/**
 * Los envíos con lo editado en la plataforma encima. Un campo vacío o con
 * forma rara se ignora y queda el original: un correo no puede salir sin
 * asunto porque alguien borró la casilla.
 */
export function conCambios(cambios?: Record<string, Partial<Textos>> | null): Envio[] {
  return ENVIOS.map((e) => {
    const c = cambios?.[e.id] ?? {};
    const x = { ...e };
    for (const k of CAMPOS) {
      const v = c[k];
      if (typeof v !== 'string' || !v.trim()) continue;
      if (k === 'dia' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) continue;
      x[k] = v.slice(0, k === 'cuerpo' ? 6000 : 300);
    }
    return x;
  });
}

/** Lee de Firestore lo editado en la plataforma. Sin base, los originales. */
export async function enviosActuales(base: ReturnType<typeof db>): Promise<Envio[]> {
  if (!base) return ENVIOS;
  try {
    const d = (await base.collection(CONFIG).doc(LISTA).get()).data() as { textos?: Record<string, Partial<Textos>> } | undefined;
    return conCambios(d?.textos);
  } catch {
    return ENVIOS;
  }
}

const enlace = (contenido: IdEnvio) =>
  `${WEB}/masterclass?utm_source=email&utm_medium=correo&utm_campaign=masterclass-desordenes&utm_content=marco-${contenido}`;

const limpio = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** El texto llano, a HTML de correo. Se escapa todo antes de poner negritas. */
function cuerpoHtml(e: Envio): string {
  const partes = e.cuerpo.replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  let conBoton = false;
  const html = partes.map((p) => {
    if (/^\[bot[oó]n\]$/i.test(p)) {
      conBoton = true;
      return boton(enlace(e.id), limpio(e.boton));
    }
    const t = limpio(p).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    return `<p style="margin:0 0 14px">${t}</p>`;
  });
  if (!conBoton) html.push(boton(enlace(e.id), limpio(e.boton)));
  return html.join('');
}

/** El correo tal cual sale. `email` sólo se usa para su enlace de baja. */
export function correoDifusion(e: Envio, email: string): { asunto: string; html: string } {
  return {
    asunto: e.asunto,
    html: marco({
      previo: limpio(e.previo),
      titular: limpio(e.titular),
      email,
      cuerpo: cuerpoHtml(e),
      firma: { nombre: 'Marco Célio Sousa', cargo: 'Psicólogo e terapeuta psicossomático clínico' },
      motivo:
        'Recebe este e-mail porque passou pela consulta de Marco Célio Sousa. É enviado, com a autorização dele, pela Escuela de Sabiduría 33, onde dá aulas.',
      pie: {
        baja: 'Cancelar a subscrição',
        aviso:
          'Os estudos de gestão emocional e numerologia transgeracional não são um tratamento médico nem psicológico e não substituem nenhum.',
      },
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
 * ella, y así hasta que llega el día del siguiente, que la sustituye.
 * Pasado el último día no toca ninguno.
 */
export function envioDeHoy(envios: Envio[], hoy = hoyEnMadrid()): Envio | null {
  const orden = [...envios].sort((a, b) => (a.dia < b.dia ? -1 : 1));
  if (hoy > orden[orden.length - 1].dia) return null;
  let toca: Envio | null = null;
  for (const e of orden) if (e.dia <= hoy) toca = e;
  return toca;
}

/** El identificador del documento de cada persona: su correo, en minúsculas. */
export function idContacto(email: string): string {
  return email.trim().toLowerCase().replace(/\//g, '_');
}
