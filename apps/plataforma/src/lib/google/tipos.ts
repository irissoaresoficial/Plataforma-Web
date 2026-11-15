/**
 * ============================================================================
 * LO QUE LLEGA DE GOOGLE CALENDAR — EL MOLDE, ANTES DE LA CONEXIÓN
 * ============================================================================
 *
 * La conexión con Google (botón, permisos, tokens en el servidor) la monta el
 * chat de Configuración. La Agenda sólo PINTA. Este archivo es el acuerdo
 * entre los dos: lo que devuelve el servidor y lo que la Agenda dibuja, para
 * que ninguno tenga que leer el código del otro.
 *
 * Cómo llegará, cuando exista:
 *
 *   GET /api/google/eventos?desde=<ISO>&hasta=<ISO>
 *   con la cabecera Authorization: Bearer <token de Firebase de quien está dentro>
 *   → RespuestaGoogle
 *
 * Y desde el navegador, con `eventosGoogle(desde, hasta)` en `lib/google/`.
 *
 * LO QUE NO TRAE, A PROPÓSITO: los asistentes, la descripción y el enlace de
 * la videollamada. Son datos de terceros que la Agenda no necesita para saber
 * que ese hueco está ocupado, y lo que no se trae no se puede filtrar.
 */

/** Un evento del Google Calendar de la cuenta conectada. Sólo lectura: se
 *  pinta, no se edita desde la plataforma. */
export type EventoGoogle = {
  /** El id de Google con el id del calendario delante, para que no choque
   *  con el de una cita de la plataforma. */
  id: string;
  origen: "google";
  titulo: string;
  /** ISO con zona. Si `todoElDia`, es medianoche local del primer día. */
  inicio: string;
  /** ISO con zona. Si `todoElDia`, es medianoche del día SIGUIENTE al
   *  último, como lo da Google: el final no se incluye. */
  fin: string;
  todoElDia: boolean;
  /** Del calendario del que viene: «Personal», «Trabajo»… */
  calendario: string;
  /** El color que tiene en Google, en hexadecimal. Es un dato de Google, no
   *  un color de interfaz: la Agenda decide si lo usa o lo pasa a un token. */
  colorGoogle?: string;
  /** «Libre» en Google no bloquea el hueco. */
  ocupado: boolean;
  /** Para abrirlo en Google Calendar. */
  enlace?: string;
};

export type RespuestaGoogle =
  | { estado: "conectado"; cuenta: string; eventos: EventoGoogle[] }
  /** No hay cuenta de Google conectada. La Agenda no pinta nada de Google. */
  | { estado: "sin-conectar" }
  /** Estaba conectada y Google ha retirado el permiso (lo quitó la persona en
   *  su cuenta, o caducó). Hay que volver a conectar desde Configuración. */
  | { estado: "caducado"; cuenta: string }
  /** Falla Google o falla la red. Se dice, no se pinta una semana vacía. */
  | { estado: "error"; motivo: string };
