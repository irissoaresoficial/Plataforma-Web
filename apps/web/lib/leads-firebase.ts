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
/**
 * LA HORA ESPAÑOLA, ESCRITA DE FORMA QUE NO SE PUEDA MALINTERPRETAR.
 *
 * El chat trabaja con «el día 8 a las 12:30, hora española». Eso, guardado tal
 * cual, es ambiguo: en enero las 12:30 en Madrid son las 11:30 UTC y en julio
 * las 10:30. Si se guarda sin decir cuál, la agenda pinta la cita una hora
 * corrida durante medio año — y una agenda que se equivoca una hora es peor que
 * no tener agenda, porque nadie duda de ella hasta que alguien se planta solo
 * delante de una pantalla.
 *
 * Así que se le pega el desfase real de ESE día. El propio navegador de Node
 * sabe cuál es —Intl lleva las reglas de los husos— y no hay que mantener a
 * mano ninguna tabla de cuándo cambia la hora.
 *
 * El desfase se pregunta suponiendo primero que la hora era UTC. En la práctica
 * eso sólo se equivocaría en las dos horas exactas del cambio de hora de
 * octubre y marzo, de madrugada, que es cuando no hay sesiones.
 */
function isoConHusoDeMadrid(dia: string, hora: string): string {
  try {
    const tentativo = new Date(`${dia}T${hora}:00Z`);
    const parte = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      timeZoneName: 'longOffset',
    })
      .formatToParts(tentativo)
      .find((p) => p.type === 'timeZoneName')?.value;
    // Viene como "GMT+02:00"; en invierno en Canarias vendría "GMT" a secas.
    const desfase = (parte || '').replace('GMT', '').trim() || '+00:00';
    return `${dia}T${hora}:00${desfase}`;
  } catch {
    return `${dia}T${hora}:00+01:00`;
  }
}

/**
 * La cita en la agenda de Iris.
 *
 * Sin esto, una sesión reservada por la web llegaba a `reservas` y a `leads` y
 * NO a la agenda, que es donde Iris mira para saber qué tiene mañana. La agenda
 * decía «esa semana la tienes libre entera» con una sesión ya vendida dentro.
 *
 * Nace en estado `pedida` a propósito: la web no confirma nada por su cuenta.
 * Es exactamente para lo que existe ese estado — algo que ha entrado solo y que
 * Iris todavía no ha mirado.
 */
export async function guardaCita(
  booking: { diaISO: string; hora: string; nombre: string; motivo: string; email: string },
  personaId: string,
): Promise<ResultadoGuardado> {
  const base = db();
  if (!base) return { guardado: false, motivo: 'sin_configurar' };
  try {
    /* El identificador se construye con el hueco, no al azar: si la misma
       persona reserva dos veces el mismo día y hora —doble clic, recarga— sale
       una cita, no dos. */
    const id = `web__${booking.diaISO}__${booking.hora.replace(':', '')}__${personaId}`
      .replace(/[/\\.#$[\]]/g, '_')
      .slice(0, 380);
    await base
      .collection('citas')
      .doc(id)
      .set(
        {
          id,
          personaId,
          inicioISO: isoConHusoDeMadrid(booking.diaISO, booking.hora),
          /* 90 minutos porque es lo que el Apps Script bloquea en el calendario
             de Google. Si algún día cambia, tiene que cambiar en los dos sitios
             a la vez o la agenda y el calendario dirán cosas distintas. */
          minutos: 90,
          tipo: 'sesion',
          estado: 'pedida',
          notas: `${booking.nombre} · ${booking.email}\n${booking.motivo}`.slice(0, 900),
          creada: new Date().toISOString(),
        },
        { merge: true },
      );
    return { guardado: true };
  } catch (err) {
    console.error('[firebase] No se pudo guardar la cita:', err);
    return { guardado: false, motivo: 'error' };
  }
}

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
