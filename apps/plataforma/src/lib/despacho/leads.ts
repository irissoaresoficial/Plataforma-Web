"use client";

/**
 * LOS CORREOS QUE ENTRAN POR LA WEB, VISTOS DESDE AQUÍ.
 *
 * Esto cierra el círculo del proyecto. Alguien rellena un formulario en
 * irissoares.com; el servidor de la web lo guarda en Firestore antes de hacer
 * nada más; y esta plataforma lo lee de la misma base. Un dato, un sitio.
 *
 * Lo que se puede hacer y lo que no lo deciden las reglas de
 * `firebase/firestore.rules`, no este archivo:
 *
 *   · LEER, sí.
 *   · CAMBIAR el estado y anotar, sí. Es el trabajo de Iris.
 *   · CREAR, no. Un lead sólo puede nacer de que una persona real haya
 *     rellenado un formulario. Si se pudieran crear a mano, la lista dejaría de
 *     ser un registro de lo que ha pasado.
 *   · BORRAR, tampoco. Un correo que llegó, llegó. Si sobra se marca como
 *     descartado y queda el rastro de que estuvo.
 */

import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, type Timestamp } from "firebase/firestore";
import { nube } from "../firebase";

/** Por dónde entró. Son los tres formularios de la web más el chat. */
export type OrigenLead = "sinergia" | "membresia" | "curso" | "reserva";

/**
 * En qué punto está. Es lo único que mueve Iris, y por eso son cuatro y no
 * doce: un embudo con doce estados es un embudo que nadie mantiene al día, y un
 * estado que nadie mantiene miente.
 */
export type EstadoLead = "nuevo" | "contactado" | "cliente" | "descartado";

export const ESTADOS_LEAD: Array<{ k: EstadoLead; label: string; que: string }> = [
  { k: "nuevo", label: "Nuevo", que: "Ha dejado su correo y todavía no le has escrito." },
  { k: "contactado", label: "Le has escrito", que: "Ya has hablado con esta persona." },
  { k: "cliente", label: "Ya es cliente", que: "Ha reservado o ha comprado." },
  { k: "descartado", label: "Descartado", que: "No sigue adelante. Se queda apuntado, no se borra." },
];

export type Lead = {
  id: string;
  email: string;
  nombre: string;
  origen: string;
  detalle: string;
  whatsapp: string;
  lang: string;
  estado: EstadoLead;
  veces: number;
  /** Cuándo apareció por primera vez y cuándo volvió la última. */
  alta: Date | null;
  visto: Date | null;
  nota?: string;
};

/** Firestore devuelve sus propias fechas; el resto de la plataforma usa `Date`. */
function fecha(v: unknown): Date | null {
  if (!v) return null;
  const t = v as Timestamp;
  return typeof t?.toDate === "function" ? t.toDate() : null;
}

/**
 * Los últimos leads, del más reciente al más antiguo.
 *
 * Con tope, y a propósito: esta lista sólo crece, y una pantalla que se trae
 * cinco mil documentos para enseñar los veinte de arriba tarda, gasta cuota y
 * un día deja de abrirse. Doscientos son de sobra para trabajar; el día que
 * haya que buscar entre miles, se busca en el servidor y no aquí.
 */
export async function ultimosLeads(tope = 200): Promise<Lead[]> {
  const base = nube();
  if (!base) return [];
  const r = await getDocs(query(collection(base, "leads"), orderBy("visto", "desc"), limit(tope)));
  return r.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      email: x.email ?? "",
      nombre: x.nombre ?? "",
      origen: x.origen ?? "",
      detalle: x.detalle ?? "",
      whatsapp: x.whatsapp ?? "",
      lang: x.lang ?? "es",
      estado: (x.estado as EstadoLead) ?? "nuevo",
      veces: typeof x.veces === "number" ? x.veces : 1,
      alta: fecha(x.alta),
      visto: fecha(x.visto),
      nota: x.nota ?? "",
    };
  });
}

/** Mover a alguien de estado. Es la única acción del embudo. */
export async function mueveLead(id: string, estado: EstadoLead): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { estado });

  /*
   * PASAR A «CLIENTE» TIENE QUE CREARLE LA FICHA. SI NO, LA PALABRA MIENTE.
   *
   * Antes, mover a alguien a esa columna sólo cambiaba una palabra dentro del
   * documento del lead. En Clientes no aparecía nadie. Es decir: la pantalla
   * decía que esa persona era clienta y la pantalla de clientes no la conocía —
   * y Iris tenía que volver a escribir su nombre, su correo y de dónde venía a
   * mano, con la ficha original a la vista, para tener el mismo dato dos veces.
   * Copiar a mano lo que el sistema ya sabe es la señal más clara de que dos
   * partes no están habladas.
   *
   * Se hace aquí y no en la pantalla porque es una regla del dato, no del
   * botón: cualquier pantalla futura que mueva un lead a cliente la hereda sin
   * enterarse.
   */
  if (estado === "cliente") await abreFichaDeCliente(id);
}

/**
 * Crea la ficha en `clientes` a partir del lead, si no la tenía ya.
 *
 * NO PISA NADA. Si esa persona ya tiene ficha —porque vino por dos sitios, o
 * porque Iris la creó a mano antes— se deja como está: lo que hay en Clientes
 * es trabajo de Iris y siempre vale más que lo que rellenó un formulario.
 *
 * NO INVENTA EL CONSENTIMIENTO. Queda a `null` a propósito, aunque el tipo
 * permitiera rellenarlo. Un consentimiento es un registro legal de que alguien
 * aceptó un texto concreto un día concreto: escribir la fecha de hoy porque es
 * el día en que Iris pulsó un botón sería fabricar una prueba. Si esa persona
 * aceptó algo, se guardará el día que lo acepte de verdad.
 *
 * Y falla en silencio. Esto es un extra sobre el movimiento del lead, que ya
 * está hecho: si Firestore rechaza la escritura, lo que NO puede pasar es que
 * la tarjeta rebote a su columna anterior y parezca que no se movió nada.
 */
async function abreFichaDeCliente(idLead: string): Promise<void> {
  const base = nube();
  if (!base) return;
  try {
    const l = await getDoc(doc(base, "leads", idLead));
    if (!l.exists()) return;
    const d = l.data() as Record<string, unknown>;
    const email = String(d.email || "").toLowerCase();
    if (!email) return;

    /* El identificador se construye con el correo, no al azar: mover a la misma
       persona a «cliente» dos veces —o que vuelva a entrar por otro sitio— tiene
       que dar la misma ficha, no dos. */
    const idCliente = email.replace(/[/\\.#$[\]]/g, "_").slice(0, 380);
    const ref = doc(base, "clientes", idCliente);
    if ((await getDoc(ref)).exists()) return;

    const ahora = new Date().toISOString();
    await setDoc(ref, {
      id: idCliente,
      nombre: String(d.nombre || "").trim() || email,
      email,
      telefono: String(d.whatsapp || ""),
      origen: ORIGEN_DE_LEAD[String(d.origen || "")] || "web-chat",
      /* La etiqueta guarda de dónde salió, que es lo que Iris quiere saber al
         abrir la ficha dentro de tres meses. */
      etiquetas: [String(d.origen || "web")].filter(Boolean),
      consentimiento: null,
      notas: [],
      creada: ahora,
      actualizada: ahora,
    });
  } catch {
    /* Ver el comentario de arriba: el lead ya se movió y eso es lo que importa. */
  }
}

/** De dónde vino, traducido al vocabulario de las fichas. */
const ORIGEN_DE_LEAD: Record<string, string> = {
  sinergia: "web-sinergia",
  membresia: "web-membresia",
  curso: "web-curso",
  reserva: "web-cita",
};

/** Apuntar algo sobre un lead — lo que se dijo al llamarle, por ejemplo. */
export async function anotaLead(id: string, nota: string): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { nota: nota.slice(0, 2000) });
}
