/**
 * RESERVAS Y CORREOS DE LA WEB DE IRIS — Google Apps Script
 * ------------------------------------------------------------------
 * RESERVAS. Cada vez que alguien reserva en el chat de la web:
 *   1. Guarda la reserva como una fila en la hoja de cálculo.
 *   2. Crea el evento en el Google Calendar de Iris e invita a la persona
 *      (Google le manda la invitación y se le guarda en su calendario).
 *   3. Envía un correo de confirmación a la persona y un aviso a Iris.
 * Además, el chat le pregunta a este script qué huecos tiene Iris libres de
 * verdad, en vez de inventárselos.
 *
 * CORREOS. Cada vez que alguien deja su correo en la web (la prueba gratis, la
 * lista de espera de la comunidad o un curso):
 *   4. Guarda el lead en la pestaña "Leads".
 *   5. Si viene de la prueba gratis, arranca una secuencia de correos que
 *      explica lo que ha visto y termina ofreciendo la comunidad.
 *      El texto de esa secuencia está abajo, en SECUENCIA: se edita ahí.
 *   6. Si viene de un curso o de la lista de espera, avisa a Iris.
 *
 * CÓMO SE INSTALA (una sola vez, 10 minutos)
 * ------------------------------------------------------------------
 *  1. Crea una hoja de cálculo nueva en Google Drive (será el "excel" de reservas).
 *  2. Dentro de la hoja: Extensiones → Apps Script. Borra lo que haya y pega este archivo.
 *  3. Cambia los valores de CONFIG que hay justo debajo (sobre todo IRIS_EMAIL y SECRET).
 *  4. Arriba a la izquierda, en el nombre del proyecto, ponle "Reservas web Iris".
 *  5. Configuración del proyecto (rueda dentada) → Zona horaria: Europe/Madrid.
 *  6. Implementar → Nueva implementación → tipo "Aplicación web":
 *        - Ejecutar como: Yo (la cuenta de Iris)
 *        - Quién tiene acceso: Cualquier usuario
 *     Acepta los permisos que pida (calendario, hoja y correo).
 *  7. Copia la URL que acaba en /exec y pégala en la web como APPS_SCRIPT_URL.
 *     El mismo SECRET de aquí va en APPS_SCRIPT_SECRET.
 *  8. Para que salgan los correos diarios de la secuencia: reloj (Activadores)
 *     → Añadir activador → función "enviarSecuencia", según tiempo, temporizador
 *     por días, sobre las 9:00. Con eso basta; el script decide a quién le toca.
 *
 * Cada vez que cambies este código hay que volver a Implementar → Gestionar
 * implementaciones → editar → Nueva versión, para que la URL sirva lo nuevo.
 */

var CONFIG = {
  // Correo de Iris: recibe el aviso de cada reserva y es la dueña del calendario.
  IRIS_EMAIL: 'iris@ejemplo.com',

  // 'primary' usa el calendario principal de la cuenta que despliega el script.
  // Si quieres uno aparte, crea un calendario y pega aquí su ID.
  CALENDAR_ID: 'primary',

  // Contraseña compartida con la web. Inventa una larga y pégala también en la web.
  SECRET: 'cambia-esto-por-una-clave-larga',

  // Nombres de las pestañas. Se crean solas si no existen.
  SHEET_NAME: 'Reservas',
  LEADS_SHEET_NAME: 'Leads',

  // Adónde manda la gente la secuencia de correos (la sección de la comunidad).
  WEB_URL: 'https://irissoares.com',
  COMUNIDAD_URL: 'https://irissoares.com/membresia',

  // Pon false si quieres guardar los correos pero no enviar todavía la secuencia.
  SECUENCIA_ACTIVA: true,

  // Enlace fijo de la videollamada (Meet, Zoom…). Déjalo vacío si lo mandas a mano.
  MEETING_URL: '',

  // Huecos que se ofrecen cada día laborable, en hora española.
  HOURS: ['10:00', '12:30', '16:00', '18:30'],

  // Duración de la sesión en minutos.
  DURATION_MIN: 90,

  // Cuántos días vista se ofrecen en el chat, y cuántos de margen desde hoy.
  DAYS_AHEAD: 45,
  MIN_DAYS_NOTICE: 1,

  TIMEZONE: 'Europe/Madrid'
};

/** El chat pide aquí los huecos libres reales, y aquí llegan también las bajas. */
function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    var action = p.action || '';

    // La baja la abre la persona desde el enlace del correo: no lleva secret, lleva firma.
    if (action === 'baja') return darDeBaja(p.e, p.t);

    if (action !== 'availability') return json({ ok: false, reason: 'accion_desconocida' });
    if (!checkSecret(p.secret)) return json({ ok: false, reason: 'secret' });
    return json({ ok: true, days: getAvailability() });
  } catch (err) {
    return json({ ok: false, reason: String(err) });
  }
}

/** La web manda aquí las reservas confirmadas y los correos captados. */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!checkSecret(body.secret)) return json({ ok: false, reason: 'secret' });

    if (body.action === 'lead') return guardarLead(body.lead || {});
    if (body.action !== 'book') return json({ ok: false, reason: 'accion_desconocida' });

    var b = body.booking || {};
    if (!b.email || !b.diaISO || !b.hora || !b.nombre) return json({ ok: false, reason: 'faltan_datos' });

    var start = toDate(b.diaISO, b.hora);
    var end = new Date(start.getTime() + CONFIG.DURATION_MIN * 60000);

    // Si alguien ha cogido ese hueco mientras la persona escribía, no se pisan las citas.
    if (isBusy(start, end)) return json({ ok: false, reason: 'taken' });

    saveRow(b, start);
    var event = createEvent(b, start, end);
    notifyClient(b, start);
    notifyIris(b, start);

    return json({ ok: true, eventId: event ? event.getId() : null });
  } catch (err) {
    return json({ ok: false, reason: String(err) });
  }
}

/* ---------------------------------------------------------------- */

function checkSecret(given) {
  if (!CONFIG.SECRET) return true;
  return String(given || '') === CONFIG.SECRET;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function calendar() {
  return CONFIG.CALENDAR_ID === 'primary'
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
}

/** "2026-10-06" + "10:00" → Date en la zona horaria del script. */
function toDate(iso, hora) {
  var d = iso.split('-');
  var h = hora.split(':');
  return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), Number(h[0]), Number(h[1]), 0, 0);
}

function fmt(date, pattern) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, pattern);
}

function isBusy(start, end) {
  var events = calendar().getEvents(start, end);
  for (var i = 0; i < events.length; i++) {
    if (!events[i].isAllDayEvent()) return true;
  }
  return false;
}

/** Días laborables con al menos un hueco libre, mirando el calendario real de Iris. */
function getAvailability() {
  var cal = calendar();
  var now = new Date();
  var from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + CONFIG.MIN_DAYS_NOTICE);
  var to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + CONFIG.DAYS_AHEAD);

  // Una sola llamada al calendario para todo el rango: mucho más rápido que día a día.
  var events = cal.getEvents(from, to).filter(function (ev) {
    return !ev.isAllDayEvent();
  });

  var days = [];
  var cursor = new Date(from.getTime());

  while (cursor < to) {
    var dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      var free = [];
      for (var i = 0; i < CONFIG.HOURS.length; i++) {
        var slotStart = toDate(fmt(cursor, 'yyyy-MM-dd'), CONFIG.HOURS[i]);
        var slotEnd = new Date(slotStart.getTime() + CONFIG.DURATION_MIN * 60000);
        if (slotStart <= now) continue;

        var collision = events.some(function (ev) {
          return ev.getStartTime() < slotEnd && ev.getEndTime() > slotStart;
        });
        if (!collision) free.push(CONFIG.HOURS[i]);
      }
      if (free.length) days.push({ iso: fmt(cursor, 'yyyy-MM-dd'), hours: free });
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
  }

  return days;
}

/** Guarda la reserva en la hoja de cálculo, creando la pestaña y las cabeceras si hace falta. */
function saveRow(b, start) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow([
      'Recibida', 'Nombre', 'Correo', 'Fecha de nacimiento',
      'Lo que se repite', 'Día de la sesión', 'Hora', 'Idioma'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    fmt(new Date(), 'dd/MM/yyyy HH:mm'),
    b.nombre || '',
    b.email || '',
    b.fecha || '',
    b.motivo || '',
    fmt(start, 'dd/MM/yyyy'),
    b.hora || '',
    (b.lang || 'es').toUpperCase()
  ]);
}

/** Crea el evento en el calendario de Iris e invita a la persona. */
function createEvent(b, start, end) {
  var descripcion =
    'Sesión individual (hora y media).\n\n' +
    'Nombre: ' + (b.nombre || '') + '\n' +
    'Fecha de nacimiento: ' + (b.fecha || '—') + '\n' +
    'Lo que se le repite: ' + (b.motivo || '—') + '\n' +
    'Correo: ' + (b.email || '') +
    (CONFIG.MEETING_URL ? '\n\nEnlace: ' + CONFIG.MEETING_URL : '');

  return calendar().createEvent('Sesión · ' + (b.nombre || 'Reserva web'), start, end, {
    description: descripcion,
    location: CONFIG.MEETING_URL || 'Videollamada',
    guests: b.email,
    sendInvites: true
  });
}

function diaLargo(start) {
  var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return dias[start.getDay()] + ' ' + start.getDate() + ' de ' + meses[start.getMonth()];
}

function notifyClient(b, start) {
  var nombre = (b.nombre || '').split(' ')[0];
  var cuando = diaLargo(start) + ' a las ' + fmt(start, 'HH:mm');
  var html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0c;line-height:1.6">' +
    '<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8f6b18;margin:0 0 6px">Sesión reservada</p>' +
    '<h1 style="font-size:24px;margin:0 0 16px">Nos vemos el ' + cuando + '.</h1>' +
    '<p>Hola ' + nombre + ', soy Iris. Ya tengo tu día apuntado y voy a preparar tu historia familiar antes de que nos veamos, así que llegaré con el trabajo hecho.</p>' +
    '<p><b>Cuándo:</b> ' + cuando + ' (hora española)<br><b>Duración:</b> hora y media, por videollamada' +
    (CONFIG.MEETING_URL ? '<br><b>Enlace:</b> <a href="' + CONFIG.MEETING_URL + '">' + CONFIG.MEETING_URL + '</a>' : '') +
    '</p>' +
    '<p>Te ha llegado también la invitación del calendario: acéptala y la cita se te guarda sola.</p>' +
    '<p>Si te surge algo y necesitas cambiar el día, respóndeme a este correo.</p>' +
    '<p style="font-size:12px;color:#8a8a92;margin-top:24px">Las sesiones no son un tratamiento médico ni psicológico y no sustituyen a ninguno.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: b.email,
    name: 'Iris Soares',
    replyTo: CONFIG.IRIS_EMAIL,
    subject: 'Tu sesión con Iris — ' + cuando,
    htmlBody: html
  });
}

function notifyIris(b, start) {
  var html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0c;line-height:1.6">' +
    '<h2 style="margin:0 0 12px">Nueva reserva: ' + (b.nombre || '') + '</h2>' +
    '<p><b>Cuándo:</b> ' + diaLargo(start) + ' a las ' + fmt(start, 'HH:mm') + '<br>' +
    '<b>Correo:</b> ' + (b.email || '') + '<br>' +
    '<b>Fecha de nacimiento:</b> ' + (b.fecha || '—') + '<br>' +
    '<b>Idioma de la web:</b> ' + ((b.lang || 'es').toUpperCase()) + '</p>' +
    '<p><b>Lo que se le repite:</b><br>' + (b.motivo || '—') + '</p>' +
    '<p style="color:#6b6b72">Ya está en tu calendario y la persona tiene su invitación. La fila también se ha guardado en la hoja de reservas.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: CONFIG.IRIS_EMAIL,
    name: 'Reservas web',
    replyTo: b.email,
    subject: 'Reserva: ' + (b.nombre || '') + ' — ' + fmt(start, 'dd/MM') + ' ' + fmt(start, 'HH:mm'),
    htmlBody: html
  });
}

/* ==================================================================
 *  CORREOS CAPTADOS Y SECUENCIA DE VENTA
 * ================================================================== */

/**
 * La secuencia que recibe quien prueba la calculadora gratis.
 * 'dia' son los días que pasan desde que dejó el correo (el día 0 es el resultado).
 * Cambia los textos a tu gusto: {nombre} se sustituye solo.
 * El orden está pensado para explicar primero y ofrecer al final.
 */
var SECUENCIA = [
  {
    dia: 1,
    asunto: 'Por qué se te repite',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Ayer viste dos números y lo que se activa entre esa persona y tú. Hoy te cuento de dónde sale eso.</p>' +
      '<p>En todas las familias hay algo que no se habló: una deuda, alguien que se fue, una muerte temprana, un negocio que se hundió. Nadie lo cuenta, pero se hereda igual. Y no se hereda en forma de historia, sino de conducta: prisa por irte, miedo a pedir, dificultad para quedarte donde estás bien.</p>' +
      '<p>Por eso cambias de trabajo, de ciudad o de pareja y a los seis meses estás en el mismo punto. No es tu carácter. Es una historia que sigue abierta y que se resuelve sola en cada generación hasta que alguien la mira.</p>' +
      '<p>Mañana te cuento qué pasa cuando alguien la mira.</p>'
  },
  {
    dia: 2,
    asunto: 'El mismo mes malo, tres generaciones seguidas',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Una mujer vino porque cada octubre se le hundía el negocio. Lo había probado todo: cambiar de proveedor, de local, de precios. Cada octubre, lo mismo.</p>' +
      '<p>Levantamos su línea familiar. Su padre perdió la empresa un octubre. Su abuelo perdió la casa otro octubre. Nadie se lo había contado nunca con esas palabras: en su casa eso era "la mala racha de otoño".</p>' +
      '<p>No hizo falta nada mágico. Lo vio, entendió qué parte era suya y qué parte no, y ese año hizo algo distinto en octubre a propósito. Ya van dos octubres seguidos sin caída.</p>' +
      '<p>Lo que cambia no es la fecha. Es que dejas de repetir a ciegas.</p>'
  },
  {
    dia: 3,
    asunto: 'Entenderlo no es cambiarlo',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Te voy a decir algo que va contra mi propio interés: entender de dónde viene lo tuyo, por sí solo, no te cambia la vida.</p>' +
      '<p>Lo he visto muchas veces. La persona sale de la sesión con todo clarísimo, y a los tres meses está otra vez en lo mismo. Porque un patrón que lleva tres generaciones funcionando no se desmonta en una tarde. Se desmonta a base de mirarlo por partes, una cada vez, durante meses.</p>' +
      '<p>Por eso estoy abriendo un grupo pequeño: cada mes miramos una parte de tu historia familiar y sueltas algo concreto. Un paso al mes, no un curso de seis meses que se acaba.</p>' +
      '<p><a href="{comunidad}">Aquí puedes ver de qué va</a>. Si no es tu momento, no pasa nada: los correos de estos días son tuyos igualmente.</p>'
  },
  {
    dia: 5,
    asunto: 'Las diez primeras',
    cuerpo:
      '<p>Hola {nombre},</p>' +
      '<p>Te escribo por última vez sobre esto.</p>' +
      '<p>El grupo abre con diez personas y las diez primeras se quedan con el precio de lanzamiento mientras sigan dentro. No es una prisa inventada: es un grupo pequeño porque cada mes se revisa un caso en voz alta, y con cuarenta personas eso no se puede hacer.</p>' +
      '<p><b>Para quién no es:</b> si lo que buscas es que te digan qué va a pasar, esto no es para ti. Aquí se trabaja con lo que ya está pasando.</p>' +
      '<p><b>Para quién sí:</b> si llevas años viendo el mismo final y ya te has cansado de explicártelo con la fuerza de voluntad.</p>' +
      '<p><a href="{comunidad}">Guardar mi sitio</a></p>'
  }
];

// Tope por tanda: Gmail gratuito permite unos 100 correos al día.
// Lo que no salga hoy sale mañana, sin perderse.
var MAX_POR_TANDA = 80;

/** Guarda el correo que llega de la web y arranca lo que toque según el origen. */
function guardarLead(lead) {
  if (!lead.email) return json({ ok: false, reason: 'faltan_datos' });

  var yaEstaba = saveLeadRow(lead);

  if (lead.origen === 'sinergia') {
    if (!yaEstaba) correoResultado(lead);
  } else {
    notificarIrisLead(lead);
  }
  return json({ ok: true });
}

// Columnas de la pestaña Leads (empezando en 0).
var COL = { ALTA: 0, EMAIL: 1, NOMBRE: 2, WHATSAPP: 3, ORIGEN: 4, DETALLE: 5, IDIOMA: 6, ULTIMO: 7, BAJA: 8 };

/** Añade el lead a la pestaña "Leads". Devuelve true si ese correo ya estaba con ese origen. */
function saveLeadRow(lead) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.LEADS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.LEADS_SHEET_NAME);
    sheet.appendRow(['Alta', 'Correo', 'Nombre', 'WhatsApp', 'Origen', 'Detalle', 'Idioma', 'Último correo enviado', 'Baja']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var datos = sheet.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][COL.EMAIL]).toLowerCase() === lead.email && String(datos[i][COL.ORIGEN]) === lead.origen) return true;
  }

  sheet.appendRow([
    new Date(),
    lead.email,
    lead.nombre || '',
    lead.whatsapp || '',
    lead.origen || '',
    lead.detalle || '',
    (lead.lang || 'es').toUpperCase(),
    lead.origen === 'sinergia' ? 0 : '',
    ''
  ]);
  return false;
}

/**
 * Manda a cada lead el correo de la secuencia que le toque hoy.
 * Se ejecuta sola una vez al día con el activador (paso 8 de la instalación).
 */
function enviarSecuencia() {
  if (!CONFIG.SECUENCIA_ACTIVA) return;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.LEADS_SHEET_NAME);
  if (!sheet) return;

  var datos = sheet.getDataRange().getValues();
  var hoy = new Date();
  var enviados = 0;

  for (var i = 1; i < datos.length && enviados < MAX_POR_TANDA; i++) {
    var fila = datos[i];
    var alta = fila[COL.ALTA], email = fila[COL.EMAIL], nombre = fila[COL.NOMBRE], origen = fila[COL.ORIGEN];
    var ultimo = Number(fila[COL.ULTIMO]) || 0, baja = fila[COL.BAJA];

    if (origen !== 'sinergia' || baja || !email || !(alta instanceof Date)) continue;

    var dias = Math.floor((hoy - alta) / 86400000);

    // Solo el siguiente paso pendiente: un correo por persona y día como mucho.
    for (var p = 0; p < SECUENCIA.length; p++) {
      var paso = SECUENCIA[p];
      if (paso.dia <= dias && paso.dia > ultimo) {
        try {
          enviarPaso(email, nombre, paso);
          sheet.getRange(i + 1, COL.ULTIMO + 1).setValue(paso.dia);
          enviados++;
        } catch (err) {
          Logger.log('No se pudo enviar a ' + email + ': ' + err);
        }
        break;
      }
    }
  }
  Logger.log('Secuencia: ' + enviados + ' correos enviados.');
}

function enviarPaso(email, nombre, paso) {
  var cuerpo = paso.cuerpo
    .replace(/{nombre}/g, primerNombre(nombre))
    .replace(/{comunidad}/g, CONFIG.COMUNIDAD_URL);
  MailApp.sendEmail({
    to: email,
    name: 'Iris Soares',
    replyTo: CONFIG.IRIS_EMAIL,
    subject: paso.asunto,
    htmlBody: plantilla(cuerpo, email)
  });
}

/** Día 0: el resultado de la calculadora, nada más dejar el correo. */
function correoResultado(lead) {
  var cuerpo =
    '<p>Hola ' + primerNombre(lead.nombre) + ',</p>' +
    '<p>Aquí tienes lo que ha salido:</p>' +
    '<p style="background:#f5f4f0;border-radius:12px;padding:16px;font-size:16px">' + (lead.detalle || '') + '</p>' +
    '<p>Esto es una foto de lo que se activa entre vosotros dos. Explica el roce, pero no de dónde viene: eso está en tu línea familiar, y hace falta mirarla entera.</p>' +
    '<p>Mañana te escribo para contarte por qué se repite. Si prefieres que no lo haga, te puedes borrar abajo en un clic.</p>';
  MailApp.sendEmail({
    to: lead.email,
    name: 'Iris Soares',
    replyTo: CONFIG.IRIS_EMAIL,
    subject: 'Tu resultado',
    htmlBody: plantilla(cuerpo, lead.email)
  });
}

/** Los leads que no son de la prueba gratis los tiene que atender Iris a mano. */
function notificarIrisLead(lead) {
  var nombres = {
    'membresia': 'lista de espera de la membresía',
    'curso': 'un curso'
  };
  var que = nombres[lead.origen] || lead.origen;
  MailApp.sendEmail({
    to: CONFIG.IRIS_EMAIL,
    name: 'Web de Iris',
    replyTo: lead.email,
    subject: 'Nuevo apuntado: ' + que,
    htmlBody:
      '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6">' +
      '<p><b>' + (lead.nombre || 'Sin nombre') + '</b> se ha apuntado a: ' + que + '</p>' +
      '<p>Correo: <a href="mailto:' + lead.email + '">' + lead.email + '</a>' +
      (lead.whatsapp ? '<br>WhatsApp: ' + lead.whatsapp : '') +
      (lead.detalle ? '<br>Detalle: ' + lead.detalle : '') + '</p>' +
      '<p style="color:#6b6b72">Está guardado en la pestaña Leads.</p></div>'
  });
}

function primerNombre(nombre) {
  return String(nombre || '').trim().split(/\s+/)[0] || 'hola';
}

/** Marco común de los correos, con el pie y el enlace de baja obligatorio. */
function plantilla(cuerpoHtml, email) {
  return (
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0c;line-height:1.65;font-size:16px;max-width:520px">' +
    cuerpoHtml +
    '<p style="margin-top:28px">Iris</p>' +
    '<hr style="border:none;border-top:1px solid #e3e2dd;margin:24px 0">' +
    '<p style="font-size:12px;color:#8a8a92;line-height:1.6">' +
    'Recibes esto porque dejaste tu correo en ' + CONFIG.WEB_URL + '. ' +
    '<a href="' + urlBaja(email) + '" style="color:#8a8a92">Darme de baja</a>.<br>' +
    'Los estudios de gestión emocional y numerología transgeneracional no son un tratamiento médico ni psicológico y no sustituyen a ninguno.' +
    '</p></div>'
  );
}

function tokenBaja(email) {
  var firma = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), CONFIG.SECRET);
  return Utilities.base64EncodeWebSafe(firma).substring(0, 16);
}

function urlBaja(email) {
  return ScriptApp.getService().getUrl() + '?action=baja&e=' + encodeURIComponent(email) + '&t=' + encodeURIComponent(tokenBaja(email));
}

/** Marca la baja en la hoja. El token evita que nadie dé de baja a otro. */
function darDeBaja(email, token) {
  var pagina = function (mensaje) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:460px;margin:80px auto;line-height:1.6;color:#0a0a0c">' +
      '<h2 style="font-weight:700">' + mensaje + '</h2>' +
      '<p><a href="' + CONFIG.WEB_URL + '" style="color:#8f6b18">Volver a la web</a></p></div>'
    );
  };

  if (!email || token !== tokenBaja(email)) return pagina('Ese enlace no es válido.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.LEADS_SHEET_NAME);
  if (!sheet) return pagina('Listo, no recibirás más correos.');

  var datos = sheet.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][COL.EMAIL]).toLowerCase() === String(email).toLowerCase()) {
      sheet.getRange(i + 1, COL.BAJA + 1).setValue('SÍ');
    }
  }
  return pagina('Listo, no recibirás más correos.');
}

/**
 * Ejecuta esta función una vez desde el editor (botón Ejecutar) para aceptar los permisos
 * y comprobar que el calendario y la hoja responden antes de conectar la web.
 */
function probar() {
  var days = getAvailability();
  Logger.log('Días con hueco: ' + days.length);
  Logger.log(JSON.stringify(days.slice(0, 3), null, 2));
  Logger.log('Calendario: ' + calendar().getName());
}
