/**
 * RESERVAS DE LA WEB DE IRIS — Google Apps Script
 * ------------------------------------------------------------------
 * Este script hace tres cosas cada vez que alguien reserva en el chat de la web:
 *   1. Guarda la reserva como una fila en la hoja de cálculo.
 *   2. Crea el evento en el Google Calendar de Iris e invita a la persona
 *      (Google le manda la invitación y se le guarda en su calendario).
 *   3. Envía un correo de confirmación a la persona y un aviso a Iris.
 *
 * Además, el chat de la web le pregunta a este script qué huecos tiene Iris
 * libres de verdad, en vez de inventárselos.
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

  // Nombre de la pestaña donde se guardan las reservas. Se crea sola si no existe.
  SHEET_NAME: 'Reservas',

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

/** El chat pide aquí los huecos libres reales. */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    if (action !== 'availability') return json({ ok: false, reason: 'accion_desconocida' });
    if (!checkSecret(e && e.parameter && e.parameter.secret)) return json({ ok: false, reason: 'secret' });
    return json({ ok: true, days: getAvailability() });
  } catch (err) {
    return json({ ok: false, reason: String(err) });
  }
}

/** La web manda aquí cada reserva confirmada. */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!checkSecret(body.secret)) return json({ ok: false, reason: 'secret' });
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
