/**
 * ============================================================================
 * EL CONTADOR DEL EMBUDO. SIN COOKIES Y SIN SABER QUIÉN ERES.
 * ============================================================================
 *
 * POR QUÉ HIZO FALTA ESTO. El 22 de octubre se añadieron dos medidores al
 * formulario —`FormularioVisto` y `FormularioEmpezado`— para saber en qué
 * escalón se cae la gente. Van por el píxel de Meta, y el píxel sólo se
 * enciende cuando alguien acepta el cartel de cookies. Casi nadie lo acepta:
 * el 23 de octubre Meta contó 304 llegadas a la página y el píxel registró 6.
 * O sea que el medidor medía al 2 % de la gente, y el 2 % no contesta nada.
 *
 * Entre el 24 y el 26 de octubre entraron 214 personas de verdad desde los
 * anuncios y no se apuntó ninguna. El anuncio trae gente y la web carga; lo
 * que falla está entre aterrizar y dejar el correo, y no se puede ver.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTO SÍ ES LEGAL SIN PEDIR PERMISO, Y POR QUÉ ESO NO ES UNA EXCUSA
 * ---------------------------------------------------------------------------
 * Lo que exige consentimiento previo es guardar algo en el aparato de la
 * persona —una cookie, el almacenamiento del navegador— o tratar un dato que
 * permita identificarla. Esto no hace ninguna de las dos cosas:
 *
 *   · NO escribe nada en el navegador. Ni cookie, ni localStorage, ni
 *     sessionStorage. Lo único que recuerda es una variable en memoria que
 *     muere al cerrar la pestaña, para no contar dos veces lo mismo.
 *   · NO manda ni el correo, ni la IP, ni el navegador, ni de dónde viene.
 *     Manda una palabra de tres posibles.
 *   · NO se guarda una fila por persona. Se suma uno a un contador del día.
 *     Al otro lado no hay forma de separar a nadie del montón, ni habiéndolo
 *     querido: lo único que existe es «hoy, 149».
 *
 * Un recuento agregado y anónimo no es un dato personal, así que no hay nada
 * que consentir. Y aun así se escribe aquí el porqué, porque «es legal» dicho
 * de palabra no vale: tiene que poder comprobarlo cualquiera leyendo esto.
 *
 * ESTO NO SUSTITUYE AL PÍXEL NI LO ESQUIVA. El píxel sigue detrás del cartel
 * y sigue sin encenderse para quien dice que no — eso no cambia. Esto es otra
 * cosa: contar cuánta gente pasa por cada escalón, que es lo que hace falta
 * para decidir, y resulta que para eso no hacía falta saber quién era nadie.
 */

/** Los tres escalones. Ni uno más: la ruta rechaza cualquier otra palabra. */
export type Paso = 'llega' | 've-formulario' | 'escribe';

/* Lo ya contado en ESTA carga de la página. Una recarga vuelve a contar, y
   está bien: lo que se mira son proporciones entre escalones, y una recarga
   entra por el primero igual que una visita. */
const contados = new Set<Paso>();

export function marcaPaso(paso: Paso): void {
  if (typeof window === 'undefined' || contados.has(paso)) return;
  contados.add(paso);

  const cuerpo = JSON.stringify({ paso });
  try {
    /* `sendBeacon` sale aunque la persona cierre la pestaña en ese instante, y
       no retrasa nada de lo que está haciendo. Es exactamente para esto. */
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/paso', new Blob([cuerpo], { type: 'application/json' }));
      return;
    }
    void fetch('/api/paso', { method: 'POST', body: cuerpo, headers: { 'content-type': 'application/json' }, keepalive: true });
  } catch {
    /* Un contador que rompe la página sería mucho peor que un contador que
       pierde una cuenta. */
  }
}
