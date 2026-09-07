/**
 * DONDE CAEN LOS LEADS, Y CÓMO.
 *
 * Un sitio y una función. Todo lo que entra por la web —la lista de espera de
 * la comunidad, un curso, el estudio de sinergia y las reservas del chat—
 * aterriza en la misma colección, `leads`, con la misma forma. Esto no es
 * pereza: es lo que hace que el panel de Iris pueda enseñar una sola lista
 * ordenada por fecha en vez de cuatro listas que hay que juntar a mano.
 */

import type { Lead } from './booking';
import { db, FieldValue } from './firebase';

/** El identificador de un lead: su correo y de dónde vino. */
function idDe(email: string, origen: string): string {
  /*
   * El id se construye, no se deja al azar, y con eso sale gratis lo que si no
   * habría que programar: que la misma persona apuntándose dos veces a lo mismo
   * no salga dos veces en la lista. `set` con `merge` sobre un id que ya existe
   * actualiza; sobre uno que no, crea.
   *
   * Y lleva el origen dentro a propósito: la misma persona puede pedir la
   * sinergia Y apuntarse al curso, y eso son dos cosas distintas que Iris
   * necesita ver por separado, no una que pisa a la otra.
   *
   * Firestore no admite `/` en un id y hay correos raros, así que se limpia.
   */
  return `${origen}__${email}`.replace(/[/\\.#$[\]]/g, '_').slice(0, 380);
}

export type ResultadoGuardado = { guardado: boolean; motivo?: string };

/**
 * Guarda el lead. Nunca lanza: si esto falla, lo que NO puede pasar es que se
 * caiga la petición y la persona vea un error por algo que no es culpa suya.
 * Devuelve si se guardó, y quien llama decide qué contarle.
 */
export async function guardaLead(lead: Lead, extra?: Record<string, unknown>): Promise<ResultadoGuardado> {
  const base = db();
  if (!base) return { guardado: false, motivo: 'sin_configurar' };

  try {
    await base
      .collection('leads')
      .doc(idDe(lead.email, lead.origen))
      .set(
        {
          ...lead,
          ...extra,
          /*
           * Dos fechas, y las dos hacen falta. `alta` es cuándo apareció esta
           * persona por primera vez y NO se toca nunca más — por eso va con
           * `serverTimestamp` sólo si el documento es nuevo, cosa que
           * `merge:true` respeta porque el campo ya existiría. `visto` es la
           * última vez que ha vuelto, y ésa sí se pisa: saber que alguien ha
           * pedido dos cosas en una semana es una señal de venta.
           */
          alta: FieldValue.serverTimestamp(),
          visto: FieldValue.serverTimestamp(),
          /* Cuántas veces ha entrado por este mismo sitio. */
          veces: FieldValue.increment(1),
          /*
           * Todo lo que entra por la web empieza aquí. Es el estado que va a
           * mover Iris en el panel: nuevo → contactado → cliente.
           *
           * Va con `merge` y sin condición a propósito NO: si ya estaba en
           * «contactado» y vuelve a pedir algo, no queremos devolverlo a
           * «nuevo» y perder el trabajo de Iris. Por eso el estado se escribe
           * sólo al crear, más abajo.
           */
        },
        { merge: true },
      );

    /*
     * El estado, sólo si el documento no lo tenía. `merge` no sabe hacer
     * «escribe esto únicamente si falta», así que se mira antes. Son dos
     * lecturas en vez de una, y a este volumen —decenas de leads al mes— eso no
     * es nada al lado de borrarle a Iris el trabajo de haber contactado a
     * alguien porque esa persona volvió a rellenar un formulario.
     */
    const ref = base.collection('leads').doc(idDe(lead.email, lead.origen));
    const doc = await ref.get();
    if (!doc.get('estado')) await ref.set({ estado: 'nuevo' }, { merge: true });

    return { guardado: true };
  } catch (err) {
    console.error('[firebase] No se pudo guardar el lead:', lead.email, lead.origen, err);
    return { guardado: false, motivo: 'error' };
  }
}

/**
 * Guarda una reserva del chat. Va en su propia colección porque una reserva
 * tiene día y hora y una lista de espera no, y mezclarlas obligaría a que la
 * mitad de los campos estuvieran vacíos en la mitad de los documentos.
 *
 * Aun así, la persona que reserva TAMBIÉN entra en `leads`: es alguien que ha
 * dejado su correo, y en la lista de Iris tiene que aparecer como todos los
 * demás. Eso lo hace quien llama.
 */
export async function guardaReserva(datos: Record<string, unknown>): Promise<ResultadoGuardado> {
  const base = db();
  if (!base) return { guardado: false, motivo: 'sin_configurar' };
  try {
    await base.collection('reservas').add({ ...datos, alta: FieldValue.serverTimestamp() });
    return { guardado: true };
  } catch (err) {
    console.error('[firebase] No se pudo guardar la reserva:', err);
    return { guardado: false, motivo: 'error' };
  }
}
