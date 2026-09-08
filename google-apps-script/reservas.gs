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
 *  1. Abre la hoja de cálculo "Datos" (su ID ya está puesto abajo, en SPREADSHEET_ID).
 *     Las pestañas "Reservas" y "Leads" se crean solas con sus cabeceras la
 *     primera vez que entre un dato: no hay que preparar nada a mano.
 *  2. Dentro de la hoja: Extensiones → Apps Script. Borra lo que haya y pega este archivo.
 *  3. Configuración del proyecto (rueda dentada) → Propiedades de la secuencia
 *     de comandos → Añadir propiedad: SECRET = la misma cadena larga que pongas
 *     en Vercel como APPS_SCRIPT_SECRET. NO se escribe en el código: si
 *     estuviera aquí, la próxima vez que se pegue este archivo se borraría.
 *     Los demás valores de CONFIG sí van abajo (sobre todo IRIS_EMAIL).
 *  4. Arriba a la izquierda, en el nombre del proyecto, ponle "Reservas web Iris".
 *  5. Configuración del proyecto (rueda dentada) → Zona horaria: Europe/Madrid.
 *  6. Implementar → Nueva implementación → tipo "Aplicación web":
 *        - Ejecutar como: Yo (la cuenta de Iris)
 *        - Quién tiene acceso: Cualquier usuario
 *     Acepta los permisos que pida (calendario, hoja y correo).
 *  7. Copia la URL que acaba en /exec y pégala en la web como APPS_SCRIPT_URL.
 *  8. Para que salgan los correos diarios de la secuencia: reloj (Activadores)
 *     → Añadir activador → función "enviarSecuencia", según tiempo, temporizador
 *     por días, sobre las 9:00. Con eso basta; el script decide a quién le toca.
 *
 * Cada vez que cambies este código hay que volver a Implementar → Gestionar
 * implementaciones → editar → Nueva versión, para que la URL sirva lo nuevo.
 */

/**
 * Un ajuste guardado en las Propiedades del script.
 *
 * Va envuelto en `try` porque `PropertiesService` puede fallar mientras se
 * están dando los permisos por primera vez, y un error aquí arriba tumbaría el
 * archivo entero antes de llegar a ninguna función.
 */
function propiedad(clave) {
  try {
    return PropertiesService.getScriptProperties().getProperty(clave) || '';
  } catch (e) {
    return '';
  }
}

var CONFIG = {
  // Correo de Iris: recibe el aviso de cada reserva y es la dueña del calendario.
  IRIS_EMAIL: 'irissoaresoficial@gmail.com',

  // 'primary' usa el calendario principal de la cuenta que despliega el script.
  // Si quieres uno aparte, crea un calendario y pega aquí su ID.
  CALENDAR_ID: 'primary',

  /*
   * LA CONTRASEÑA NO SE ESCRIBE AQUÍ. Y ES POR UN MOTIVO CONCRETO.
   *
   * Estaba escrita en esta línea, con el texto de ejemplo puesto. Funcionaba
   * hasta el día en que hubo que cambiar el código: se copió este archivo del
   * repositorio, se pegó encima del script… y con él se pegó el texto de
   * ejemplo, que borró la contraseña buena. A partir de ese momento la web y el
   * script dejaron de entenderse y no salió ni un correo, sin que nada
   * pareciera roto por ningún lado: la reserva se guardaba, la cita aparecía en
   * la agenda, y el correo simplemente no llegaba.
   *
   * Un archivo que hay que acordarse de editar a mano DESPUÉS de pegarlo es una
   * trampa, y las trampas se pisan. Así que la contraseña vive donde pegar
   * código no la toca: en las Propiedades del script.
   *
   *   Configuración del proyecto (la rueda dentada de la izquierda)
   *     → Propiedades de la secuencia de comandos
   *     → Añadir propiedad
   *         Propiedad: SECRET
   *         Valor:     la misma cadena larga que hay en Vercel
   *
   * Se hace UNA vez. A partir de ahí este archivo se puede pegar encima las
   * veces que haga falta sin romper nada.
   */
  SECRET: propiedad('SECRET'),

  // La hoja de cálculo donde se guarda todo. Es el trozo largo de la URL de la
  // hoja, el que va entre /d/ y /edit. Ya está puesto el de la hoja "Datos".
  // Si lo dejas vacío, el script escribe en la hoja a la que esté pegado.
  SPREADSHEET_ID: '10Y0-trXMFklashg_TBAicQe9GOPKqtChxznWo6418LY',

  // Nombres de las pestañas dentro de esa hoja. Se crean solas si no existen.
  SHEET_NAME: 'Reservas',
  LEADS_SHEET_NAME: 'Leads',

  /*
   * ADÓNDE MANDA LA GENTE LA SECUENCIA DE CORREOS.
   *
   * Apuntaban a irissoares.com, que es el WordPress ANTERIOR. Los enlaces
   * funcionaban —no daban error— y por eso el fallo era peor: cada correo
   * automático que salía llevaba a la gente a la web vieja, con otros precios y
   * otra oferta, sin que nada pareciera roto.
   *
   * Cuando esté el dominio definitivo se cambian estas dos líneas y se vuelve a
   * implementar. Es lo único de aquí que habrá que tocar ese día.
   */
  WEB_URL: 'https://escueladesabiduria33.com',
  COMUNIDAD_URL: 'https://escueladesabiduria33.com/membresia',

  // Pon false si quieres guardar los correos pero no enviar todavía la secuencia.
  SECUENCIA_ACTIVA: true,

  // Enlace fijo de la videollamada (Meet, Zoom…). Déjalo vacío si lo mandas a mano.
  MEETING_URL: '',

  /*
   * ENLACE DE PAGO DE LA SESIÓN (el «payment link» de Stripe).
   *
   * Iris lo pidió así: «cuando hagan la reserva ya tienen que hacer el pago»,
   * porque sin pago por delante la gente falla a última hora y esa hora ya no
   * se le puede dar a nadie.
   *
   * MIENTRAS ESTÉ VACÍO, el correo de confirmación no habla de pagar. Es a
   * propósito: prometer un enlace que no llega es peor que no prometer nada —
   * quien lo lea se pondrá a buscar un correo que no existe. En cuanto se pegue
   * aquí el enlace de Stripe, el bloque de pago sale solo en todas las
   * confirmaciones, sin tocar nada más.
   */
  PAGO_URL: '',

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

/**
 * SIN CONTRASEÑA CONFIGURADA NO SE PASA. ANTES SÍ SE PASABA.
 *
 * Decía `if (!CONFIG.SECRET) return true`: sin contraseña puesta, el script
 * aceptaba a cualquiera. La idea era «que funcione mientras se instala», y el
 * problema es que una instalación a medias no avisa de nada — se queda
 * funcionando, se olvida, y lo que queda es una dirección pública que escribe
 * en el calendario de Iris y manda correos en su nombre a quien la encuentre.
 *
 * Ahora, sin contraseña, se rechaza y se dice por qué. Es un paso más al
 * instalar y es el correcto: fallar ruidoso mientras se monta algo es barato;
 * quedarse abierto en silencio, no.
 */
function checkSecret(given) {
  if (!CONFIG.SECRET) return false;
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

/**
 * La hoja de cálculo donde escribimos. Usa SPREADSHEET_ID si está puesto, y si
 * no, la hoja a la que esté pegado el script. Así da igual dónde lo pegues.
 */
function libro() {
  return CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

/** Guarda la reserva en la hoja de cálculo, creando la pestaña y las cabeceras si hace falta. */
function saveRow(b, start) {
  var ss = libro();
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
    /*
     * EL PAGO, EN UN RECUADRO Y CON SU BOTÓN.
     *
     * En medio de un párrafo se pasa por alto. Y si no hay enlace todavía, no
     * se dice nada de pagar: ver «PAGO_URL» arriba.
     */
    (CONFIG.PAGO_URL
      ? '<div style="border:1px solid #e6e0d6;border-radius:14px;padding:18px 20px;margin:22px 0">' +
        '<p style="margin:0 0 10px"><b>Falta un paso: el pago de la sesión.</b> Tu hora queda cerrada en cuanto lo hagas; hasta entonces sigue disponible para otra persona.</p>' +
        '<p style="margin:0"><a href="' + CONFIG.PAGO_URL + '" style="display:inline-block;background:#6b1f2e;color:#fff;text-decoration:none;border-radius:999px;padding:11px 24px;font-weight:600">Pagar mi sesión</a></p>' +
        '</div>'
      : '') +
    /*
     * LA REGLA DE LAS 24 HORAS, DICHA AQUÍ Y NO SÓLO EN EL AVISO LEGAL.
     *
     * Es de Iris, con estas palabras: «si no hacemos unas condiciones de
     * cancelación, se la pasan por el forro». Este correo es lo que la persona
     * tiene guardado el día que le surge algo, así que es donde tiene que
     * estar escrito. Se dice ofreciendo el cambio primero y la condición
     * después: es la misma información y no suena a amenaza.
     */
    '<p><b>¿Te surge algo?</b> Puedes cambiar el día respondiendo a este correo, siempre que me avises con <b>24 horas de antelación</b>. Con menos de 24 horas ya no puedo darle esa hora a nadie, así que se da por dada.</p>' +
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
    // Su acuse de recibo ES el resultado, y detrás va la secuencia de 5 días.
    if (!yaEstaba) correoResultado(lead);
  } else {
    // A la persona, su confirmación — sólo la primera vez, para que apuntarse
    // dos veces por si acaso no le llene la bandeja.
    if (!yaEstaba) acuseDeRecibo(lead);
    // Y a Iris, siempre: que alguien insista es en sí una señal.
    notificarIrisLead(lead);
  }
  return json({ ok: true });
}

// Columnas de la pestaña Leads (empezando en 0).
var COL = { ALTA: 0, EMAIL: 1, NOMBRE: 2, WHATSAPP: 3, ORIGEN: 4, DETALLE: 5, IDIOMA: 6, ULTIMO: 7, BAJA: 8 };

/** Añade el lead a la pestaña "Leads". Devuelve true si ese correo ya estaba con ese origen. */
function saveLeadRow(lead) {
  var ss = libro();
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

  var sheet = libro().getSheetByName(CONFIG.LEADS_SHEET_NAME);
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
  /*
   * EL TEXTO VIENE ESCRITO DE LA WEB. AQUÍ SÓLO SE ENVUELVE.
   *
   * Antes este correo pegaba `lead.detalle` tal cual dentro de una caja gris:
   *
   *     «Mi madre: Iris 3 · Iris 3 · juntos 6 (Espejo) · 5 repeticiones»
   *
   * Eso está bien escrito para Iris —es su ficha de un vistazo antes de una
   * llamada— y no dice absolutamente nada a quien acaba de dejar su correo por
   * primera vez: no sabe qué es un 3, ni un 6, ni un Espejo. Y es el momento
   * más caro de todo el embudo: esa persona ha escrito el nombre de su madre en
   * una web y ha esperado un correo. Está abierta. Lo que recibía era una línea
   * de base de datos.
   *
   * Ahora la web manda los párrafos ya escritos, con cada número explicado (ver
   * `lib/correo-sinergia.ts`). Van como texto y no como HTML a propósito: así
   * este archivo no puede romperse por lo que llegue de fuera, y el envoltorio
   * —tipografía, ancho, el pie con la baja— lo sigue poniendo la plantilla de
   * aquí.
   *
   * Si por lo que sea no llegan párrafos —una versión vieja de la web— se cae al
   * texto de antes en vez de mandar un correo vacío.
   */
  var cuerpo;
  var asunto;

  if (lead.parrafos && lead.parrafos.length) {
    cuerpo = '';
    for (var i = 0; i < lead.parrafos.length; i++) {
      cuerpo += '<p style="font-size:16px;line-height:1.6;margin:0 0 16px">' + escapaSalvoSaltos(lead.parrafos[i]) + '</p>';
    }
    asunto = lead.asunto || 'Lo que se repite';
  } else {
    cuerpo =
      '<p>Hola ' + primerNombre(lead.nombre) + ',</p>' +
      '<p>Aquí tienes lo que ha salido:</p>' +
      '<p style="background:#f5f4f0;border-radius:12px;padding:16px;font-size:16px">' + (lead.detalle || '') + '</p>' +
      '<p>Esto es una foto de lo que se activa entre vosotros dos. Explica el roce, pero no de dónde viene: eso está en tu línea familiar, y hace falta mirarla entera.</p>';
    asunto = 'Tu resultado';
  }

  MailApp.sendEmail({
    to: lead.email,
    name: 'Iris Soares',
    replyTo: CONFIG.IRIS_EMAIL,
    subject: asunto,
    htmlBody: plantilla(cuerpo, lead.email)
  });
}

/**
 * Deja el texto a salvo de convertirse en etiquetas, pero conserva el único
 * trozo de HTML que sí lleva —el salto de línea de la firma—. Escapar del todo
 * dejaría un «<br>» escrito a la vista al final del correo; no escapar nada
 * dejaría que un nombre con un signo raro rompiera el mensaje entero.
 */
function escapaSalvoSaltos(t) {
  return String(t || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;br&gt;/g, '<br>');
}

/**
 * ACUSE DE RECIBO, DISTINTO SEGÚN DE DÓNDE VENGA.
 *
 * El que se apunta a la lista de espera o a un curso no recibía NADA. Se avisaba
 * a Iris y a la persona se le dejaba en silencio, mirando un formulario que le
 * había dicho «listo» y ya. En un lanzamiento eso es lo peor que puede pasar:
 * la persona no tiene ni una prueba de que se apuntó, así que a los tres días
 * no se acuerda, y si le llega el correo de apertura le suena a publicidad de
 * alguien a quien no le dio permiso.
 *
 * Y NO es el mismo correo para los dos. Quien pide la sinergia entra en la
 * secuencia de cinco días y lo primero que recibe es su resultado; a ése no hay
 * que darle la bienvenida dos veces. Quien reserva su precio en la membresía
 * necesita que le confirmen exactamente qué ha reservado y cuándo va a saber
 * algo. Y quien se apunta a un curso, en qué fecha es.
 *
 * Son tres situaciones distintas y mandar el mismo «gracias por suscribirte» a
 * las tres es la manera más rápida de que esto parezca un boletín automático en
 * vez de la consulta de una persona.
 */
function acuseDeRecibo(lead) {
  var textos = {
    membresia: {
      asunto: 'Tu sitio está guardado',
      cuerpo:
        '<p>Hola {nombre},</p>' +
        '<p>Ya tienes tu sitio en la lista. <b>Hoy no se te cobra nada.</b></p>' +
        '<p>La comunidad abre el <b>7 de noviembre</b> y entra con diez personas. ' +
        'Las diez primeras se quedan con el precio de lanzamiento mientras sigan dentro, ' +
        'y tú estás en esa lista.</p>' +
        '<p>Te escribo yo cuando abra, con tu precio guardado. No tienes que hacer nada más.</p>'
    },
    curso: {
      asunto: 'Apuntada al curso',
      cuerpo:
        '<p>Hola {nombre},</p>' +
        '<p>Te tengo apuntada. Antes del curso te escribo con la hora, el sitio y lo que tienes que llevar.</p>' +
        '<p>Si te surge cualquier duda, contesta a este correo: lo leo yo.</p>'
    }
  };
  var t = textos[lead.origen];
  if (!t) return; // Un origen nuevo no manda nada hasta que se le escriba su texto.

  MailApp.sendEmail({
    to: lead.email,
    name: 'Iris Soares',
    replyTo: CONFIG.IRIS_EMAIL,
    subject: t.asunto,
    htmlBody: plantilla(t.cuerpo.replace(/{nombre}/g, primerNombre(lead.nombre)), lead.email)
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

  var sheet = libro().getSheetByName(CONFIG.LEADS_SHEET_NAME);
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
