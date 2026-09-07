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
 * POR DÓNDE LLEGÓ A LA WEB. NO ES LO MISMO QUE EL FORMULARIO, Y HACEN FALTA LAS DOS.
 *
 * `origen` dice por qué formulario entró —la prueba gratis, un curso, la lista—
 * y lo pone la web sola. Eso contesta «qué pidió», no «de dónde salió». Y «de
 * dónde salió» es la pregunta que decide dónde invierte Iris su tiempo: si la
 * mitad de la gente viene de una palabra suelta en Instagram, la campaña de pago
 * sobra.
 *
 * Esto NO lo puede saber el sistema. No hay UTM que aguante: la gente busca el
 * nombre en Google después de ver un reel, entra desde una historia guardada, o
 * la manda una amiga por WhatsApp. Lo sabe Iris, y lo sabe hablando con la
 * persona. Así que es un campo que se rellena a mano, y por eso son SEIS
 * opciones y no quince: una lista larga se rellena mal o no se rellena.
 *
 * «NO LO SÉ» EXISTE Y ES EL ESTADO INICIAL. Es la respuesta honesta para la
 * mayoría de los leads, y tenerla evita lo único que rompería este dato: que
 * Iris elija cualquier cosa por quitarse el hueco de encima. Un recuento con la
 * mitad en «no lo sé» sigue sirviendo; uno con la mitad mal puesta, no.
 */
export type CanalLead = "nose" | "instagram" | "boca" | "campana" | "google" | "taller";

export const CANALES_LEAD: Array<{ k: CanalLead; label: string; corto: string }> = [
  { k: "instagram", label: "Instagram", corto: "Instagram" },
  /* «Te la mandó alguien» y no «recomendación»: es lo que Iris diría en voz
     alta, y cubre igual a una clienta suya que a una amiga de una clienta. */
  { k: "boca", label: "Te la mandó alguien", corto: "Boca a boca" },
  { k: "campana", label: "Campaña de pago", corto: "Campaña" },
  { k: "google", label: "Buscando en Google", corto: "Google" },
  /* «Taller o evento» y no «un curso»: «Un curso» ya es el nombre de uno de los
     formularios de la web, y dos cosas distintas con el mismo nombre en la misma
     tarjeta serían imposibles de leer. Esto es haberla conocido en persona. */
  { k: "taller", label: "Un taller o un evento", corto: "Taller" },
  { k: "nose", label: "No lo sé", corto: "" },
];

/**
 * El canal de un lead, tolerando que no lo tenga.
 *
 * Los leads que ya están en Firestore se guardaron antes de que este campo
 * existiera y no lo llevan; los que entran por la web tampoco, porque la web no
 * sabe esto. Ausente, vacío o con un valor que aquí ya no existe se leen igual:
 * «no lo sé». Así no hace falta migrar nada ni escribir en documentos que nadie
 * ha tocado.
 */
export const canalDe = (v: unknown): CanalLead =>
  CANALES_LEAD.some((c) => c.k === v) ? (v as CanalLead) : "nose";

export const etiquetaCanal = (k: CanalLead) => CANALES_LEAD.find((c) => c.k === k)?.label ?? "No lo sé";

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
  /** Por dónde llegó a la web. Lo pone Iris; nunca falta, porque «no lo sé» es
   *  un valor. Ver `CanalLead`. */
  canal: CanalLead;
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
      canal: canalDe(x.canal),
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

/**
 * Decir por dónde llegó esta persona. Mismo patrón que `mueveLead`: un campo,
 * una escritura, y la pantalla ya se ha pintado antes de que vuelva.
 *
 * «No lo sé» se ESCRIBE, no se borra el campo. Son dos cosas distintas: un lead
 * sin campo es uno que nadie ha mirado, y uno con «nose» es uno que Iris miró y
 * no pudo saberlo. Las dos se leen igual en pantalla —no hay nada que enseñar—
 * pero borrar el campo dejaría sin marcha atrás a quien se equivoca de pastilla.
 */
export async function ponCanal(id: string, canal: CanalLead): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { canal });
}

/** Apuntar algo sobre un lead — lo que se dijo al llamarle, por ejemplo. */
export async function anotaLead(id: string, nota: string): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { nota: nota.slice(0, 2000) });
}
