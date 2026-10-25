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

    if (body.action === 'lead') return guardarLead(body.lead || {}, body.sinCorreo === true);
    if (body.action !== 'book') return json({ ok: false, reason: 'accion_desconocida' });

    var b = body.booking || {};
    if (!b.email || !b.diaISO || !b.hora || !b.nombre) return json({ ok: false, reason: 'faltan_datos' });

    var start = toDate(b.diaISO, b.hora);
    var end = new Date(start.getTime() + CONFIG.DURATION_MIN * 60000);

    // Si alguien ha cogido ese hueco mientras la persona escribía, no se pisan las citas.
    if (isBusy(start, end)) return json({ ok: false, reason: 'taken' });

    saveRow(b, start);
    var event = createEvent(b, start, end);
    // Aqui salian dos correos: la confirmacion a la persona y el aviso a Iris.
    // Desde el 19 de octubre el correo es cosa de Resend (apps/web/lib/correo.ts).
    // La invitacion del evento la sigue mandando Google Calendar al crear la
    // cita, que no es un correo de este script sino del propio calendario.
    //
    // OJO: hoy esto no lo dispara nadie. `/api/booking` solo lo llamaba el chat
    // de la web, y el chat se borro entero. Si vuelven las reservas hay que
    // escribir sus dos correos en `lib/correo.ts` ANTES de volver a encender el
    // boton, o se reservara sin que nadie reciba nada.

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



/* ==================================================================
 *  CORREOS CAPTADOS Y SECUENCIA DE VENTA
 * ================================================================== */

/**
 * La secuencia que recibe quien prueba la calculadora gratis.
 * 'dia' son los días que pasan desde que dejó el correo (el día 0 es el resultado).
 * Cambia los textos a tu gusto: {nombre} se sustituye solo.
 * El orden está pensado para explicar primero y ofrecer al final.
 */
/* El texto de los cinco correos vive ahora en secuencia-5-dias.md. */


/**
 * APUNTA EN LA HOJA EL CORREO QUE LLEGA DE LA WEB. Y NADA MAS.
 *
 * ESTA FUNCION YA NO MANDA NINGUN CORREO, y es el cambio del 19 de octubre.
 * Gerson: «lo de Google (correos) borralo todo, a partir de este momento en
 * cuestion de correos sera con Resend».
 *
 * De aqui salian tres: la confirmacion de quien se apunta, el aviso a Iris y
 * el resultado de la sinergia. Los tres los manda ahora la web por Resend,
 * desde escueladesabiduria33.com y con SPF y DKIM firmados — que es lo que
 * decide si un correo entra en la bandeja o en «no deseado». El Gmail de Iris
 * no podia hacer ninguna de las dos cosas, y ademas tiene tope de unos cien
 * envios al dia: con una campana de Meta detras, eso se alcanza en una tarde.
 *
 * ENTONCES, ¿PARA QUE SIGUE EXISTIENDO ESTO?
 * Para la hoja de calculo. Es donde Iris mira sus apuntados, y Resend no
 * guarda listas: manda correos. Asi que la web hace dos llamadas por cada
 * persona —Resend para el correo, este script para la fila— y cada uno hace
 * lo que sabe hacer.
 *
 * El parametro `sinCorreo` que llegaba de la web ya no hace falta: existia
 * para que este script se callara cuando Resend habia mandado, y ahora se
 * calla siempre. La web puede seguir mandandolo; aqui se ignora.
 */
function guardarLead(lead) {
  if (!lead.email) return json({ ok: false, reason: 'faltan_datos' });
  saveLeadRow(lead);
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
 * LA SECUENCIA DE CINCO DIAS: APAGADA, NO BORRADA.
 *
 * Gerson, el 19 de octubre: «lo de Google (correos) borralo todo». Esta
 * funcion es la unica que no se ha quitado del archivo, y hay un motivo
 * practico: en la cuenta de Iris hay un ACTIVADOR DIARIO que la llama. Si se
 * borra, ese activador falla cada manana y Google empieza a mandar correos de
 * error a Iris — o sea, borrar el envio de correos acabaria generando correos.
 *
 * Asi que se queda, y no hace nada. El orden correcto para cerrarlo del todo
 * es: primero esto (ya hecho), despues borrar el activador a mano desde el
 * editor de Apps Script (el icono del reloj -> los tres puntos -> Eliminar), y
 * entonces si se puede quitar esta funcion.
 *
 * EL TEXTO DE LOS CINCO CORREOS NO SE HA PERDIDO: esta entero en
 * `google-apps-script/secuencia-5-dias.md`, listo para volver a montarlo sobre
 * Resend. Eso pide dos cosas que hoy no existen —un reloj en Vercel y guardar
 * en Firestore por que paso va cada persona— y se hara cuando la comunidad
 * abra de verdad.
 */
function enviarSecuencia() {
  Logger.log('La secuencia ya no sale de aqui: el correo es cosa de Resend desde el 19 de octubre. Puedes borrar este activador.');
}









function tokenBaja(email) {
  var firma = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), CONFIG.SECRET);
  return Utilities.base64EncodeWebSafe(firma).substring(0, 16);
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
