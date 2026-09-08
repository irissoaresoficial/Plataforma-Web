/**
 * ESPAÑOL — el idioma de casa, y el que manda.
 *
 * Este fichero NO es una copia de los textos: los saca del diccionario de la
 * escuela (`kdata`), que sigue siendo la única fuente. Si mañana Iris corrige
 * un apunte, el documento en español cambia solo y aquí no hay nada que tocar.
 * Duplicar 30.000 caracteres de apuntes habría garantizado que a los seis meses
 * el panel y la hoja dijeran cosas distintas.
 *
 * Lo único escrito a mano son las frases de la hoja —los rótulos y las
 * explicaciones—, que antes vivían sueltas dentro del componente. Están aquí
 * porque son justo lo que hay que traducir, y porque teniéndolas juntas se ve
 * de un vistazo la voz del documento.
 *
 * `pt.ts` y `en.ts` son la traducción de ESTO. Cuando falte una frase en
 * cualquiera de los dos, se cae aquí: el documento sale, aunque una línea salga
 * en español. Nunca una hoja en blanco.
 */
import { KDATA } from "../kdata";
import type { CopiaHoja, Diccionario } from "./tipos";

/**
 * Los apuntes escriben el remedio de cada tarea empezando por repetir su
 * nombre —«Amar en lugar de querer tener la razón – Desarrollar los
 * atributos…»—. Lo que sirve es lo que va detrás del guion.
 *
 * Estaba dentro de HojaCliente. Se ha traído aquí porque es una manía del
 * español de los apuntes, no de la hoja: el portugués y el inglés guardan ya
 * la frase limpia y no tienen nada que recortar.
 */
function trasElGuion(t: string | undefined): string {
  const partes = String(t || "").split(/\s[–—-]\s/);
  return partes.length > 1 && partes[0].length < 80 ? partes.slice(1).join(" — ") : String(t || "");
}

/**
 * Los planos vienen rotulados «Consciencia de Activación», «Consciencia del
 * Subconsciente». En la hoja se dice sólo el nombre del plano —el apartado ya
 * dice que son consciencias— así que se quita la cabecera repetida. Mismo
 * motivo que arriba para hacerlo aquí: en los otros dos idiomas el nombre ya
 * viene corto.
 */
function nombreCorto(t: string | undefined): string {
  return String(t || "").replace(/^Consciencia (?:de la|del|de) /i, "");
}

const HOJA: CopiaHoja = {
  subtitulo: "Tu estudio en una hoja",

  comoEres: "Cómo eres",
  porDentro: "Por dentro",
  porDentroPie: "Lo que has venido a ser, lo veas o no.",
  porFuera: "Por fuera",
  porFueraPie: "Lo que la gente ve de ti.",

  tuCamino: "Tu camino",
  tuCaminoPie: "Tres tramos que van a la vez; lo que cambia es cuánto pesa cada uno.",
  origenTitulo: "De dónde vienes",
  origenQue: "Lo que ya sabías hacer al llegar",
  origenCuando: "hasta los {edad}",
  transformacionTitulo: "Cómo atraviesas la vida",
  transformacionQue: "Tu manera de estar en el mundo",
  transformacionCuando: "siempre",
  destinoTitulo: "Hacia dónde vas",
  destinoQue: "El sitio al que te lleva la vida",
  destinoCuando: "desde los {edad}",

  loQueTrabajas: "Lo que has venido a trabajar",
  loQueTrabajasPie: "No son defectos: son las tareas de esta vida, y se hacen de una en una.",
  sinTareas: "Ninguna pendiente: tu trabajo es sostener lo que ya traes hecho.",

  loQueTeFrena: "Lo que te frena",
  loQueTeFrenaPie: "Los sitios donde se te queda la energía parada. Verlos ya es media parte.",
  sinFrenos: "Nada se te queda parado: la energía te circula limpia.",

  yaHecho: "Lo que ya traes hecho",
  yaHechoNada: "Todo está por trabajar en esta vida.",
  yaHechoTexto:
    "{n} de los diez puntos de tu carta vienen resueltos de antes: el {lista}. Es tu suelo firme, en lo que te puedes apoyar cuando lo demás cuesta.",

  porCerrar: "Lo que traes por cerrar",
  porCerrarKarmico: "La cuenta que vienes a saldar es el {n}",
  porCerrarLema: "Se salda con el {n}",
  porCerrarLemaSinTexto: ", que es la vibración que te lo permite.",

  dondeEstas: "Dónde estás ahora",
  etapa: "{edad} años: etapa de {ciclo}, de los {desde} a los {hasta}.",
  /* El último ciclo no tiene final, y antes se escribía «de los 54 a los el
     final»: la frase salía rota en cuanto la persona pasaba de los cincuenta y
     tantos, que es media consulta. Al tener que decirlo en tres idiomas no
     había forma de arrastrar el fallo, así que el último tramo tiene su propia
     frase. */
  etapaFinal: "{edad} años: etapa de {ciclo}, de los {desde} en adelante.",
  anioPersonal:
    "Dentro de ella vas por el año {n} de una rueda que se repite cada nueve. Lo que toca este año no es lo que tocará el siguiente: por eso la carta se mira de vez en cuando, no una sola vez.",
  turbulencias:
    "A los {edad} empiezan diez años movidos en {tipos}: el cambio de camino no es de golpe, se cuece durante esa década.",

  diasFuerza: "Tus días de fuerza",
  diasFuerzaPie:
    "Los días del mes que te acompañan, empezando por el más fuerte. Son los buenos para firmar, empezar algo o decidir.",

  hilo: "El hilo de toda tu vida",
  hiloPie: "Tu propósito es el {n}, y no cambia de etapa: es el fondo sobre el que pasa todo lo demás.",
  viveBien: "Cuando lo vives bien",
  seTuerce: "Cuando se tuerce",

  cierre: "Si sólo te quedas con una cosa",
  cierreVas: "Que vas hacia {carta}",
  cierreTareaUna: ", y que el camino pasa por la tarea de aquí arriba, de una en una y sin prisa",
  cierreTareasVarias: ", y que el camino pasa por las {n} tareas de aquí arriba, de una en una y sin prisa",
  cierreSinTareas: ", y que tu trabajo es sostener lo que ya traes hecho",
  cierreFinal: ". Nada de esto está cerrado ni decidido de antemano: es el mapa, y el camino lo andas tú.",

  paraElArchivo: "Tus números, para el archivo",
  numTuNumero: "Tu número",
  numPorDentro: "Por dentro",
  numPorFuera: "Por fuera",
  numConsciencia: "Tu consciencia",
  numPorCerrar: "Lo que traes por cerrar",
  numConQueSalda: "Con qué se salda",
  numHilo: "El hilo de toda tu vida",
  pieLema: "El nombre es la contraseña del alma",

  y: "y",

  empresaTitulo: "Estudio de empresa",
  empValorNombre: "Valor del nombre",
  empValorNombrePie: "Cómo vibra la empresa",
  empEsencia: "Esencia",
  empEsenciaPie: "Lo que ha venido a ser",
  empEgo: "Ego",
  empEgoPie: "Cómo la ven",
  empCifras: "Cifras",
  empCifrasPie: "Los números del nombre",
  empLetraALetra: "El nombre, letra a letra",
  empCaminoOrigen: "El camino de origen",
  empArcano: "Arcano {n}",
  empDiasFuerza: "Días de fuerza",
  empDiasFuerzaPie: "Del más fuerte al menos fuerte. Para firmas, aperturas y decisiones.",
  empImportante: "Lo importante que hay que tener en cuenta",
  empComoVibra: "Cómo vibra",
  empComoVibraTexto: "El nombre suma {n}: es el tono de fondo, lo que la empresa transmite antes de decir nada.",
  empDentroFuera: "Dentro y fuera",
  empDentroFueraTexto:
    "Esencia {e} y ego {g}{cifras}. Cuanto más se parecen, más se muestra la empresa como es; cuanto más se separan, más distancia hay entre lo que quiere ser y lo que aparenta.",
  empDentroFueraCifras: ", más {n} de las cifras",
  empHaciaDonde: "Hacia dónde",
  empHaciaDondeTexto: "El camino de origen es {carta}: la dirección de fondo del proyecto.",
  empCuandoMover: "Cuándo mover",
  empCuandoMoverTexto: "Los días de fuerza son el {dias}. Para firmar, abrir y presentar.",
  separadorDias: ", el ",
  empPieLema: "El nombre es la contraseña",
};

/* ------------------------------------------------------------------ apuntes
 * De aquí para abajo no hay texto escrito: se lee del diccionario de la
 * escuela y se le aplica la misma limpieza que hacía la hoja. */

const arcanos: Diccionario["arcanos"] = {};
for (const [k, a] of Object.entries(KDATA.arcanos || {})) {
  arcanos[Number(k)] = { nombre: a.nombre, lema: a.lema, texto: a.texto || "" };
}

const numerologia: Diccionario["numerologia"] = {};
for (const [k, v] of Object.entries(KDATA.numerologia || {})) {
  numerologia[Number(k)] = { pos: v.pos, neg: v.neg };
}

const estructuras: Diccionario["estructuras"] = {};
for (const [k, v] of Object.entries(KDATA.estructuras || {})) {
  estructuras[Number(k)] = v.texto || "";
}

const tareas: Diccionario["tareas"] = {};
for (const [k, t] of Object.entries(KDATA.tareas || {})) {
  tareas[Number(k)] = { nombre: t.nombre, comoSeTrabaja: trasElGuion(t.sanador || t.texto) };
}

const planos: Diccionario["planos"] = {};
for (const [k, p] of Object.entries(KDATA.planos_conciencia?.planos || {})) {
  planos[Number(k)] = { nombre: nombreCorto(p.nombre), texto: p.texto || "" };
}

const numeros: Diccionario["numeros"] = {};
for (const [k, f] of Object.entries(KDATA.numeros || {})) {
  numeros[Number(k)] = f.texto || "";
}

export const ES: Diccionario = {
  codigo: "es",
  locale: "es-ES",
  hoja: HOJA,
  arcanos,
  numerologia,
  estructuras,
  tareas,
  planos,
  /* Los ciclos y las turbulencias salen del motor con su nombre en español
   * —«Formación», «Espíritu»—, así que ese nombre es la llave. En la hoja se
   * dicen dentro de una frase y en minúscula. */
  ciclos: { "Formación": "formación", "Evolución": "evolución", "Cosecha": "cosecha" },
  turbulencias: { "Espíritu": "espíritu", "Alma": "alma", "Materia": "materia" },
  numeros,
};
