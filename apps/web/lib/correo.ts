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
 * SI NO HAY CLAVE, NO SE ROMPE NADA — PERO NO LLEGA NINGÚN CORREO.
 * `RESEND_API_KEY` vacía significa que todavía no está configurado: estas
 * funciones devuelven `false` sin lanzar ningún error, el lead se guarda igual
 * y la persona ve su pantalla de gracias. Lo que no hay es correo.
 *
 * ESTO DECÍA ANTES que «el Apps Script manda los correos como hasta ahora», y
 * era falso desde el 19 de octubre: ese mismo día se le quitó al script hasta
 * el último `MailApp.sendEmail`. No hay red debajo. Si Resend no está puesto,
 * quien se apunta no recibe ni la confirmación ni el enlace del grupo, y el
 * único rastro es una línea en los registros de Vercel que nadie abre.
 *
 * Por eso `/api/diagnostico` comprueba Resend desde el 25 de octubre: es la
 * única forma de enterarse sin tener que apuntarse uno mismo.
 */

import { createHmac } from 'node:crypto';
import { Resend } from 'resend';
import { CONTACTO, MASTERCLASS } from '@/content/site';
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
 * EL SOBRE: LA LÍNEA QUE SE LEE ANTES DE ABRIR.
 *
 * En la bandeja de entrada, debajo del asunto, el cliente de correo enseña un
 * trozo del principio del mensaje. Si no se le da nada, saca «Hola Gerson,» o
 * peor, un cacho de código. Es la segunda cosa que decide si alguien abre, y
 * casi nadie la escribe.
 *
 * Se mete en un párrafo escondido: invisible al abrir, visible en la lista.
 * Los caracteres invisibles del final son para que el cliente no rellene el
 * hueco con lo siguiente que encuentre.
 */
function sobre(texto: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${texto}${'&#847;&zwnj;&nbsp;'.repeat(60)}</div>`;
}

/**
 * EL MARCO DE TODOS LOS CORREOS QUE VAN A UNA PERSONA.
 *
 * Una cabecera granate con el nombre de la escuela en dorado, un filete fino,
 * el cuerpo sobre blanco, la firma, y el pie con el motivo por el que se
 * recibe el correo, la baja y el descargo legal. Esos tres de abajo no son
 * adorno: el motivo y la baja los pide el artículo 21 del RGPD y el descargo
 * lo pide la ley de publicidad sanitaria.
 *
 * TODO CON ESTILOS ESCRITOS EN CADA ETIQUETA, y sin una sola imagen. Gmail
 * borra las hojas de estilo, y la mitad de los clientes no bajan las imágenes
 * hasta que se les pide: un correo que necesita una foto para verse bien es un
 * correo que la mitad de la gente ve roto. Aquí el aspecto lo hace la
 * tipografía y el color, que llegan siempre.
 */
function marco(opciones: { previo: string; titular: string; cuerpo: string; email: string }): string {
  return `${sobre(opciones.previo)}<div style="margin:0;padding:28px 12px;background:#f1ede4">
  <div style="max-width:560px;margin:0 auto;background:${PAPEL};border-radius:16px;overflow:hidden;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">

    <div style="background:${VINO};padding:20px 30px">
      <span style="font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:${ORO}">Escuela de Sabiduría 33</span>
    </div>

    <div style="padding:34px 30px 30px;color:${TINTA}">
      <h1 style="margin:0 0 20px;font-size:27px;line-height:1.2;font-weight:600;letter-spacing:-.02em;color:${TINTA}">${opciones.titular}</h1>
      <div style="font-size:16px;line-height:1.65;color:${TINTA}">${opciones.cuerpo}</div>
      <div style="margin:30px 0 0;padding-top:20px;border-top:1px solid #ece8e0">
        <p style="margin:0;font-size:16px;line-height:1.6;color:${TINTA}">Iris</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b6564">Escuela de Sabiduría 33</p>
      </div>
    </div>

    <div style="padding:0 30px 26px">
      <p style="margin:0;font-size:12px;line-height:1.65;color:#6b6564">
        Recibes esto porque dejaste tu correo en <a href="${WEB}" style="color:#6b6564">${WEB.replace(/^https?:\/\//, '')}</a>.
        <a href="${enlaceDeBaja(opciones.email)}" style="color:#6b6564">Darme de baja</a>.<br>
        Los estudios de gestión emocional y numerología transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
      </p>
    </div>

  </div>
</div>`;
}

/** Un botón. Se dibuja con un `<a>` y relleno, no con un `<button>`: los
 *  botones de verdad no se pintan en la mitad de los clientes de correo. */
function boton(href: string, texto: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px"><tr><td style="background:${VINO};border-radius:999px">
    <a href="${href}" style="display:inline-block;padding:15px 30px;color:${PAPEL};text-decoration:none;font-weight:600;font-size:16px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">${texto}</a>
  </td></tr></table>`;
}

/**
 * LOS PASOS NUMERADOS.
 *
 * Es el bloque que más cambia el correo, y no por bonito: quien acaba de dejar
 * su correo tiene UNA duda —«¿y ahora qué?»— y un párrafo no la contesta tan
 * rápido como dos líneas numeradas. Saber que son dos pasos y que el segundo
 * lo hacemos nosotros es lo que quita la sensación de haberse apuntado a algo
 * que no se sabe en qué consiste.
 *
 * El número va en una celda aparte y no como lista `<ol>`: Outlook le pone a
 * las listas unos márgenes propios que no hay forma de quitar.
 */
function pasos(lista: { que: string; detalle: string }[]): string {
  const filas = lista
    .map(
      (p, i) => `<tr>
      <td style="width:30px;vertical-align:top;padding:0 12px 16px 0">
        <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:999px;background:#f1ede4;color:${VINO};font-size:13px;font-weight:700">${i + 1}</span>
      </td>
      <td style="vertical-align:top;padding:0 0 16px">
        <div style="font-size:16px;font-weight:600;color:${TINTA};line-height:1.4">${p.que}</div>
        <div style="font-size:15px;line-height:1.55;color:#55504f;margin-top:3px">${p.detalle}</div>
      </td>
    </tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;width:100%">${filas}</table>`;
}

/**
 * LA CONFIRMACIÓN DE QUIEN SE APUNTA A LA MASTERCLASS.
 *
 * LO QUE TIENE QUE HACER ESTE CORREO, y no es «confirmar»:
 * quien lo abre acaba de dejar sus datos a alguien que no conoce, por un
 * anuncio, para una clase que todavía no tiene fecha. Lo que siente no es duda
 * sobre si llegó el formulario — es «¿y ahora qué?, ¿cuándo?, ¿tengo que hacer
 * algo?». Un correo que sólo dice «recibido» deja esas tres preguntas abiertas
 * y por eso no sostiene a nadie tres semanas.
 *
 * Así que: el titular confirma, el primer párrafo dice lo único que de verdad
 * no se sabe —que es en directo, a qué hora y en qué huso—, los dos pasos
 * numerados dicen qué pasa ahora y quién lo hace, y el botón es lo único que
 * se le pide.
 *
 * NI «GRATUITA» NI «GRATIS». Regla de marca de Gerson, del 22 de octubre: se
 * dice «masterclass en directo». Se quitó ese día de la web y de los anuncios
 * y este correo se quedó atrás — lo dijo hasta el 25 de octubre. Nadie lo vio
 * porque un correo no se revisa: se manda.
 */
function correoDeCurso(lead: Lead): { asunto: string; html: string } {
  const conGrupo = Boolean(GRUPO);

  const lospasos = conGrupo
    ? pasos([
        {
          que: 'Entra al grupo de WhatsApp',
          detalle: 'Ahí contesto dudas antes de la clase y aviso si algo cambia. Puedes salirte cuando quieras.',
        },
        {
          que: 'El día de la clase te mando el enlace',
          detalle: 'Por el grupo y por correo. Tú no tienes que hacer nada más.',
        },
      ])
    : pasos([
        { que: 'Te mando el enlace el día de la clase', detalle: 'A este mismo correo, un rato antes de empezar.' },
        { que: 'Tú no tienes que hacer nada más', detalle: 'Guarda este correo y ya está.' },
      ]);

  return {
    /* EL ASUNTO LLEVA LA FECHA. Quien se apunta hoy abre este correo dentro de
       cinco semanas buscando a qué hora era: que la fecha esté en el asunto le
       ahorra abrirlo, y de paso el correo se encuentra buscando «noviembre». */
    asunto: `Tu plaza para el ${MASTERCLASS.corto} · ${MASTERCLASS.titulo}`,
    html: marco({
      previo: conGrupo
        ? `Es ${MASTERCLASS.cuando}. El siguiente paso es entrar al grupo de WhatsApp.`
        : `Es ${MASTERCLASS.cuando}. Te mando el enlace ese mismo día.`,
      titular: 'Ya tienes tu plaza',
      email: lead.email,
      cuerpo:
        /* NI «QUEDA GRABADA» NI «NO HACE FALTA SABER NADA». Las dos se han
           caído el 19 de octubre, y conviene saber por qué no vuelven: una
           prometía algo del producto que no está decidido, y la otra contesta
           una objeción que esta persona ya no tiene —acaba de apuntarse—. Lo
           que sí necesita saber es lo único que de verdad no sabe: que la
           fecha todavía no existe y que se la vamos a mandar nosotros. */
        `<p style="margin:0 0 14px">Hola ${primerNombre(lead.nombre)}, gracias por apuntarte a <b>${MASTERCLASS.titulo}</b>.</p>
         <p style="margin:0 0 14px">Es <b>${MASTERCLASS.cuando}</b>, ${MASTERCLASS.zona}. Es una <b>masterclass en directo</b>.</p>
         <p style="margin:0;font-size:15px;color:#55504f">Apúntatelo ahora en el calendario: es lo único que de verdad evita que se te pase.</p>
         ${lospasos}
         ${conGrupo ? boton(GRUPO, 'Entrar al grupo de WhatsApp') : ''}
         <p style="margin:18px 0 0">Si te surge cualquier duda, contesta a este correo: lo leo yo.</p>`,
    }),
  };
}

/** La confirmación de quien reserva su sitio en la lista de la comunidad. */
function correoDeMembresia(lead: Lead): { asunto: string; html: string } {
  return {
    asunto: 'Tu sitio está guardado',
    html: marco({
      previo: 'Tu sitio en la lista está guardado. Hoy no se te cobra nada.',
      titular: 'Tu sitio está guardado',
      email: lead.email,
      cuerpo:
        `<p style="margin:0 0 14px">Hola ${primerNombre(lead.nombre)}, ya estás en la lista.</p>
         <p style="margin:0"><b>Hoy no se te cobra nada.</b> Reservar el sitio no es pagar: es que el día que abra tengas el precio de lanzamiento guardado.</p>
         ${pasos([
           { que: 'Te aviso yo cuando abra', detalle: 'A este correo, con tu precio guardado.' },
           { que: 'Tú no tienes que hacer nada', detalle: 'Ni apuntarte otra vez ni estar pendiente.' },
         ])}
         <p style="margin:14px 0 0">Si te surge cualquier duda, contesta a este correo: lo leo yo.</p>`,
    }),
  };
}

/**
 * EL RESULTADO DE LA SINERGIA.
 *
 * El texto NO se escribe aquí: llega ya compuesto desde la web, en
 * `lead.parrafos`, que es donde vive la numerología (`lib/correo-sinergia.ts`).
 * Este archivo sólo le pone el sobre. Es la misma separación que tenía el
 * script de Google y es la correcta: la plantilla no tiene que saber qué es un
 * número de camino de vida, y la numerología no tiene que saber de HTML.
 *
 * Sin párrafos no se manda nada. Un correo de resultado vacío es peor que
 * ninguno: la persona lo abre esperando SU resultado y encuentra un saludo.
 */
function correoDeSinergia(lead: Lead): { asunto: string; html: string } | null {
  if (!lead.parrafos?.length) return null;
  const cuerpo = lead.parrafos
    .map((x) => `<p style="margin:0 0 15px">${limpio(x).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return {
    asunto: lead.asunto || 'Lo que se repite entre vosotros',
    html: marco({
      previo: 'Aquí tienes lo que sale de vuestras dos fechas.',
      titular: 'Lo que ha salido',
      email: lead.email,
      cuerpo: `${cuerpo}<p style="margin:18px 0 0">Si quieres mirarlo entero —de dónde viene y a quién pertenece—, contesta a este correo y te cuento cómo se hace.</p>`,
    }),
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

/** Qué plantilla le toca a cada origen. Un origen sin plantilla no manda nada
 *  en vez de mandar algo genérico: ver `LEAD_SOURCES` en lib/booking.ts. */
function plantillaDe(lead: Lead): { asunto: string; html: string } | null {
  if (lead.origen === 'curso') return correoDeCurso(lead);
  if (lead.origen === 'membresia') return correoDeMembresia(lead);
  if (lead.origen === 'sinergia') return correoDeSinergia(lead);
  return null;
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
/**
 * EL ENLACE DEL GRUPO, SUELTO.
 *
 * Para cuando hay que mandarle el grupo a alguien que ya se apuntó: porque el
 * enlace cambió —pasó el 25 de octubre— o porque no llegó a entrar.
 *
 * CORTO A PROPÓSITO, Y ESO ES LO DIFÍCIL. Esta persona ya dijo que sí: no hay
 * que convencerla de nada, no hay que recordarle de qué va la clase y no hay
 * que explicarle quién es Iris. Sólo tiene que pulsar un botón. Cada frase de
 * más es una oportunidad de cerrar el correo antes de llegar a él.
 *
 * NO PIDE PERDÓN NI HABLA DE NINGÚN ENLACE ANTERIOR. A lo mejor el viejo le
 * funcionaba. Decirle «el que te mandé estaba mal» siembra una duda sobre si
 * esto está bien montado, justo en la gente que ya confió.
 *
 * LA HORA DE PORTUGAL VA ESCRITA. De las tres primeras personas apuntadas, dos
 * son portuguesas. Una clase a las 21:00 «hora de España» es a las 20:00 en
 * Oporto, y quien no lo sepa se la pierde por una línea que no escribimos.
 */
export function correoGrupoWhatsapp(nombre: string): { asunto: string; html: string } {
  return {
    asunto: `Tu grupo de ${MASTERCLASS.titulo}`,
    html: marco({
      previo: 'El enlace del grupo de WhatsApp, por si no estás dentro todavía.',
      titular: 'Tu grupo de WhatsApp',
      email: '',
      cuerpo: `<p style="margin:0 0 14px">Hola ${primerNombre(nombre)}, te dejo el enlace del grupo de <b>${MASTERCLASS.titulo}</b>, por si todavía no estás dentro.</p>
         ${boton(GRUPO, 'Entrar al grupo')}
         <p style="margin:22px 0 0">Ahí aviso de todo y contesto dudas antes de la clase.</p>
         <p style="margin:14px 0 0">Es el <b>jueves 26 de noviembre a las 21:00</b>, hora de España. Si me lees desde Portugal, para ti son las 20:00.</p>
         <p style="margin:14px 0 0">Nos vemos.</p>`,
    }),
  };
}

export function vistaPreviaDeLead(lead: Lead): { asunto: string; html: string } | null {
  return plantillaDe(lead);
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

  const paraLaPersona = plantillaDe(lead);

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
