/**
 * LOS CORREOS, POR RESEND.
 * ============================================================================
 *
 * Gerson, el 19 de octubre: «a partir de este momento todo será por Resend».
 *
 * QUÉ SE HA MOVIDO Y QUÉ NO, QUE ES LO PRIMERO QUE HAY QUE SABER.
 * De aquí salen los DOS correos de quien se apunta por la web: la confirmación
 * para la persona y el aviso para Iris. Eso es lo que recibe el tráfico de la
 * campaña de Meta, o sea lo que no puede fallar.
 *
 * Lo que sigue en el Apps Script de Google: las reservas de consulta y la
 * secuencia de cinco días de la sinergia. Mover eso pide además un reloj en
 * Vercel y es la fase dos. Y la hoja de cálculo se queda igualmente: es donde
 * Iris mira sus apuntados.
 *
 * POR QUÉ RESEND Y NO SEGUIR CON GMAIL.
 * El Apps Script manda con la cuenta de Gmail de Iris: tope de unos cien
 * correos al día, sin dominio propio en el remite —sale de @gmail.com— y sin
 * forma de saber si un correo llegó o se quedó en spam. Resend manda desde
 * `escueladesabiduria33.com`, con SPF y DKIM firmados (eso es lo que hace que
 * no caiga en «no deseado»), y deja un registro de cada envío.
 *
 * SI NO HAY CLAVE, ESTO NO ROMPE NADA. `RESEND_API_KEY` vacía significa que
 * todavía no está configurado: estas funciones devuelven `false` sin lanzar
 * ningún error, y la ruta del lead se da cuenta y deja que el Apps Script
 * mande los correos como hasta ahora. Es lo que permite desplegar el código
 * antes de tener la clave puesta en Vercel.
 */

import { createHmac } from 'node:crypto';
import { Resend } from 'resend';
import { CONTACTO } from '@/content/site';
import type { Lead } from './booking';

/* El cliente se crea una vez. Sin clave es `null`, y todo lo de abajo lo mira
   antes de intentar nada. */
const CLAVE = process.env.RESEND_API_KEY || '';
const resend = CLAVE ? new Resend(CLAVE) : null;

/* De quién sale y a dónde contesta la gente.
   `RESEND_REPLY_TO` es el Gmail donde Iris lee de verdad: quien conteste a un
   correo automático tiene que acabar en una bandeja que alguien abre, no en
   una dirección que nadie mira. */
const DE = process.env.RESEND_FROM || 'Escuela de Sabiduría 33 <hola@escueladesabiduria33.com>';
const CONTESTAR_A = process.env.RESEND_REPLY_TO || 'irissoaresoficial@gmail.com';
const PARA_IRIS = process.env.IRIS_EMAIL || CONTESTAR_A;

const WEB = process.env.NEXT_PUBLIC_SITE_URL || 'https://escueladesabiduria33.com';

/* EL GRUPO SALE DE `content/site.ts`, NO DE UNA VARIABLE DE ENTORNO NUEVA.
   Ese enlace ya vive en dos sitios —la web y el script de Google— y añadir un
   tercero es garantizar que algún día uno de los tres apunte a otro grupo.
   Aquí se lee del mismo archivo que pinta el botón de la pantalla de gracias,
   así que los dos dicen siempre lo mismo. */
const GRUPO = CONTACTO.grupo;

/* Los colores de la casa, escritos a mano y no con tokens: un correo no lee
   `var(--vino)`, y la mitad de los clientes de correo tampoco leen una hoja de
   estilos. Van los valores de MARCA.md §3. */
const VINO = '#451a25';
const TINTA = '#221d1f';
const PAPEL = '#ffffff';
const ORO = '#e2cda2';

/**
 * EL ENLACE DE BAJA, EL MISMO DE SIEMPRE.
 *
 * No se monta uno nuevo: se firma igual que lo hace el Apps Script y se apunta
 * a su página de baja, que ya existe y ya marca la casilla en la hoja. Un
 * segundo sistema de bajas sería un sitio más donde alguien puede darse de
 * baja y seguir recibiendo correos desde el otro — que es exactamente la
 * infracción que persigue la Agencia de Protección de Datos.
 *
 * La firma es HMAC-SHA256 del correo en minúsculas con el secreto compartido,
 * en base64 web-safe y cortada a dieciséis caracteres: línea por línea lo que
 * hace `tokenBaja` en reservas.gs. Si no coincidiera, el enlace diría «no es
 * válido», así que esto hay que tocarlo con cuidado.
 */
function enlaceDeBaja(email: string): string {
  const url = process.env.APPS_SCRIPT_URL || '';
  const secreto = process.env.APPS_SCRIPT_SECRET || '';
  if (!url || !secreto) return `mailto:${CONTESTAR_A}?subject=Quiero%20darme%20de%20baja`;
  const firma = createHmac('sha256', secreto)
    .update(email.toLowerCase())
    .digest('base64url')
    .slice(0, 16);
  return `${url}?action=baja&e=${encodeURIComponent(email)}&t=${encodeURIComponent(firma)}`;
}

/** Lo mínimo para que un `<`, un `&` o unas comillas en un nombre no rompan el
 *  HTML del correo ni dejen meter etiquetas por el formulario. */
function limpio(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function primerNombre(nombre: string): string {
  return limpio(String(nombre || '').trim().split(/\s+/)[0] || 'hola');
}

/**
 * EL MARCO DE TODOS LOS CORREOS QUE VAN A UNA PERSONA.
 *
 * Una cabecera granate con el nombre de la escuela, el cuerpo sobre blanco, y
 * el pie con el motivo por el que se recibe el correo, la baja y el descargo
 * legal. Esos tres de abajo no son adorno: el motivo y la baja los pide el
 * artículo 21 del RGPD y el descargo lo pide la ley de publicidad sanitaria.
 *
 * Todo con estilos escritos en cada etiqueta. Gmail borra las hojas de estilo.
 */
function marco(cuerpo: string, email: string): string {
  return `<div style="margin:0;padding:24px 12px;background:#f1ede4">
  <div style="max-width:560px;margin:0 auto;background:${PAPEL};border-radius:14px;overflow:hidden;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
    <div style="background:${VINO};padding:18px 26px">
      <span style="font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${ORO}">Escuela de Sabiduría 33</span>
    </div>
    <div style="padding:26px;color:${TINTA};font-size:16px;line-height:1.65">
      ${cuerpo}
      <p style="margin:28px 0 0">Iris</p>
    </div>
    <div style="padding:0 26px 24px">
      <hr style="border:none;border-top:1px solid #e3e2dd;margin:0 0 16px">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6b6564">
        Recibes esto porque dejaste tu correo en <a href="${WEB}" style="color:#6b6564">${WEB.replace(/^https?:\/\//, '')}</a>.
        <a href="${enlaceDeBaja(email)}" style="color:#6b6564">Darme de baja</a>.<br>
        Los estudios de gestión emocional y numerología transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
      </p>
    </div>
  </div>
</div>`;
}

/** Un botón. Se dibuja con un `<a>` y relleno, no con un `<button>`: los
 *  botones de verdad no se pintan en la mitad de los clientes de correo. */
function boton(href: string, texto: string): string {
  return `<p style="margin:22px 0 10px">
    <a href="${href}" style="display:inline-block;background:${VINO};color:${PAPEL};text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:600;font-size:16px">${texto}</a>
  </p>`;
}

/**
 * LA CONFIRMACIÓN DE QUIEN SE APUNTA A LA MASTERCLASS.
 *
 * Dice lo mismo que la pantalla de gracias y en el mismo orden, y eso es a
 * propósito: quien acaba de verla reconoce el correo en un segundo en vez de
 * tener que leerlo entero para saber qué es.
 */
function correoDeCurso(lead: Lead): { asunto: string; html: string } {
  const grupo = GRUPO
    ? `<p style="margin:0 0 4px">Lo siguiente es entrar al grupo de WhatsApp de la masterclass.
         Ahí aviso de la fecha, mando el enlace el día de la clase y contesto dudas antes.</p>
       ${boton(GRUPO, 'Entrar al grupo de WhatsApp')}
       <p style="margin:0;font-size:13px;color:#6b6564">Puedes salirte del grupo cuando quieras.</p>`
    : `<p style="margin:0">Te escribo yo en cuanto haya fecha, con el enlace para entrar. No tienes que hacer nada más.</p>`;

  return {
    asunto: 'Gracias — ya tienes tu plaza',
    html: marco(
      `<p style="margin:0 0 14px">Hola ${primerNombre(lead.nombre)},</p>
       <p style="margin:0 0 14px">Gracias por apuntarte. <b>Ya tienes tu plaza guardada</b>, y es totalmente gratuita.</p>
       ${grupo}
       <p style="margin:18px 0 0">Si te surge cualquier duda, contesta a este correo: lo leo yo.</p>`,
      lead.email,
    ),
  };
}

/** La confirmación de quien reserva su sitio en la lista de la comunidad. */
function correoDeMembresia(lead: Lead): { asunto: string; html: string } {
  return {
    asunto: 'Tu sitio está guardado',
    html: marco(
      `<p style="margin:0 0 14px">Hola ${primerNombre(lead.nombre)},</p>
       <p style="margin:0 0 14px">Ya tienes tu sitio en la lista. <b>Hoy no se te cobra nada.</b></p>
       <p style="margin:0">Te escribo yo cuando abra, con tu precio guardado. No tienes que hacer nada más.</p>`,
      lead.email,
    ),
  };
}

/**
 * EL AVISO PARA IRIS. Sin marco ni colores: no es un correo de marca, es una
 * ficha para trabajar. Lo que importa es que de un vistazo se vea quién es,
 * cómo contestarle y de dónde salió — y que al darle a «responder» se escriba
 * a esa persona, que es lo que hace `replyTo`.
 */
function avisoParaIris(lead: Lead): { asunto: string; html: string } {
  const de: Record<string, string> = {
    curso: 'la masterclass',
    membresia: 'la lista de espera de la comunidad',
    sinergia: 'la prueba de sinergia',
  };
  const que = de[lead.origen] || lead.origen;
  return {
    asunto: `Nuevo apuntado: ${que}`,
    html: `<div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:${TINTA}">
      <p><b>${limpio(lead.nombre) || 'Sin nombre'}</b> se ha apuntado a: ${que}</p>
      <p>Correo: <a href="mailto:${limpio(lead.email)}">${limpio(lead.email)}</a>
      ${lead.whatsapp ? `<br>WhatsApp: ${limpio(lead.whatsapp)}` : ''}
      ${lead.detalle ? `<br>Detalle: ${limpio(lead.detalle)}` : ''}</p>
      <p style="color:#6b6564;font-size:13px">Está guardado en Firebase y en la hoja de cálculo.</p>
    </div>`,
  };
}

/**
 * EL CORREO, SIN MANDARLO.
 *
 * Devuelve el asunto y el HTML que recibiría esa persona. Existe para poder
 * MIRAR un correo antes de que lo vea nadie: se abre en un navegador, se
 * comprueba que el botón está, que el nombre sale bien y que no hay un hueco
 * donde debería ir el enlace del grupo.
 *
 * Un correo roto no se puede arreglar después de mandarlo, y es la única
 * pieza de esta web que no se puede volver a desplegar.
 */
export function vistaPreviaDeLead(lead: Lead): { asunto: string; html: string } | null {
  if (lead.origen === 'curso') return correoDeCurso(lead);
  if (lead.origen === 'membresia') return correoDeMembresia(lead);
  return null;
}

/** El aviso de Iris, también sin mandarlo. */
export function vistaPreviaDeAviso(lead: Lead): { asunto: string; html: string } {
  return avisoParaIris(lead);
}

/**
 * MANDA LOS DOS CORREOS DE UN LEAD.
 *
 * Devuelve `true` sólo si salió el de la persona, que es el que no se puede
 * perder: si ése falla, la ruta deja que el Apps Script haga su trabajo de
 * siempre y nadie se queda sin confirmación.
 *
 * El aviso a Iris va aparte y a propósito: que no llegue es molesto, pero no
 * es motivo para mandarle a la persona el correo dos veces por dos caminos.
 *
 * Y NO LANZA NUNCA. Una excepción aquí dejaría la petición en error después de
 * haber guardado el lead, o sea que la persona vería «no se ha podido» después
 * de haberse apuntado de verdad.
 */
export async function enviaCorreosDeLead(lead: Lead): Promise<{ enviado: boolean; motivo?: string }> {
  if (!resend) return { enviado: false, motivo: 'sin_clave' };

  const paraLaPersona =
    lead.origen === 'curso' ? correoDeCurso(lead)
    : lead.origen === 'membresia' ? correoDeMembresia(lead)
    /* La sinergia manda su propio correo con el resultado desde el Apps
       Script, que es quien sabe componerlo. Aquí no se toca. */
    : null;

  if (!paraLaPersona) return { enviado: false, motivo: 'origen_sin_plantilla' };

  let enviado = false;
  try {
    const r = await resend.emails.send({
      from: DE,
      to: lead.email,
      replyTo: CONTESTAR_A,
      subject: paraLaPersona.asunto,
      html: paraLaPersona.html,
    });
    if (r.error) console.error('[correo] Resend rechazó el de la persona:', r.error);
    else enviado = true;
  } catch (e) {
    console.error('[correo] No se pudo mandar el de la persona:', e);
  }

  try {
    const aviso = avisoParaIris(lead);
    await resend.emails.send({
      from: DE,
      to: PARA_IRIS,
      replyTo: lead.email,
      subject: aviso.asunto,
      html: aviso.html,
    });
  } catch (e) {
    console.error('[correo] No se pudo avisar a Iris:', e);
  }

  return enviado ? { enviado: true } : { enviado: false, motivo: 'rechazado' };
}
