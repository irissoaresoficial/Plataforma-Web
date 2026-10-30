/**
 * ============================================================================
 * LO QUE SE LE DICE A LA CLIENTA
 * ============================================================================
 *
 * Los textos del estudio de Feng Shui, en castellano llano (MARCA.md §6). Dos
 * reglas que aquí pesan más que en ningún otro sitio:
 *
 *   · NADA DE «ENERGÍA». El Feng Shui está lleno de esa palabra y la marca la
 *     tiene prohibida. Y se puede decir todo sin ella: «esta zona favorece el
 *     descanso» se entiende mejor que «aquí fluye una energía de calma».
 *   · NADA DE MIEDO. Una estrella difícil no es una desgracia anunciada: es
 *     una zona que pide cuidado. Se dice qué hacer, no qué temer.
 *
 * Lo que es interpretación y no cálculo —las notas de cada zona— lo escribe
 * quien hace el estudio en la pantalla, y va al informe tal cual.
 */
import type { Casilla, Elemento, Formacion, Mansion } from "./calculo";

/** Qué significa cada estrella en el periodo 9 (2024–2043). */
export const ESTRELLA: Record<number, { nombre: string; color: string; estado: string; favorable: boolean; dice: string; remedio: string }> = {
  1: {
    nombre: "1 Blanco",
    color: "#e8e4dc",
    estado: "De futuro",
    favorable: true,
    dice: "Trabajo, nuevas oportunidades, personas que ayudan y claridad para decidir.",
    remedio: "Se refuerza con agua limpia o con metal: un cuenco de agua, objetos de metal claro.",
  },
  2: {
    nombre: "2 Negro",
    color: "#3b3536",
    estado: "De futuro, con cuidado",
    favorable: false,
    dice: "En este periodo empieza a ser de futuro, pero sigue unida a la salud: es una zona para no descuidar.",
    remedio: "Metal: latón, cobre, un calabazo de metal (wu lou). Evitar el rojo y las velas.",
  },
  3: {
    nombre: "3 Jade",
    color: "#5f8f61",
    estado: "Fuera de tiempo",
    favorable: false,
    dice: "Discusiones, malentendidos y tensiones. Mejor no poner aquí una zona de reunión.",
    remedio: "Rojo y luz cálida. Evitar plantas grandes y agua, que la refuerzan.",
  },
  4: {
    nombre: "4 Verde",
    color: "#7aa874",
    estado: "Fuera de tiempo, suave",
    favorable: true,
    dice: "Estudio, escritura y relaciones de pareja. Una buena zona para leer o estudiar.",
    remedio: "Plantas vivas y un poco de agua si se quiere favorecer el estudio.",
  },
  5: {
    nombre: "5 Amarillo",
    color: "#d9b44a",
    estado: "La más difícil",
    favorable: false,
    dice: "Imprevistos, accidentes y enfermedades. Es la zona que más cuidado pide.",
    remedio: "Metal: campana de viento de seis tubos metálicos, objetos de latón. Nada de obras ni de ruido, ni velas.",
  },
  6: {
    nombre: "6 Blanco",
    color: "#f2f0ea",
    estado: "Fuera de tiempo, suave",
    favorable: true,
    dice: "Autoridad, apoyo de personas con poder y disciplina. Sigue siendo una estrella amable.",
    remedio: "Tierra o metal: cerámica, piedra, objetos de metal.",
  },
  7: {
    nombre: "7 Rojo",
    color: "#c0504d",
    estado: "Fuera de tiempo",
    favorable: false,
    dice: "Pérdidas, robos y habladurías. Conviene una zona tranquila y bien cerrada.",
    remedio: "Agua quieta y colores azul o negro. Evitar más metal.",
  },
  8: {
    nombre: "8 Blanco",
    color: "#f6f2e8",
    estado: "Se retira",
    favorable: true,
    dice: "Fue la estrella de la prosperidad hasta 2024. Todavía es buena, pero pierde fuerza.",
    remedio: "Tierra y luz: cerámica, cristal, una lámpara.",
  },
  9: {
    nombre: "9 Púrpura",
    color: "#7a3b8f",
    estado: "La estrella de ahora",
    favorable: true,
    dice: "La más favorable del periodo 9: reconocimiento, celebraciones, alegría y lo nuevo que llega.",
    remedio: "Se activa con luz, con plantas y con vida: es una zona para usarla, no para cerrarla.",
  },
};

/** Las ocho estrellas de las mansiones, para una persona. */
export const MANSION: Record<Mansion, { nombre: string; chino: string; dice: string }> = {
  shengqi: { nombre: "Crecimiento", chino: "Sheng Qi", dice: "La mejor: éxito y empuje. Para la mesa de trabajo y mirar hacia ella." },
  tianyi: { nombre: "Salud", chino: "Tian Yi", dice: "Salud y recuperación. Buena para el cabecero de la cama." },
  yannian: { nombre: "Relaciones", chino: "Yan Nian", dice: "Pareja, familia y armonía con los demás." },
  fuwei: { nombre: "Estabilidad", chino: "Fu Wei", dice: "Calma y crecimiento personal. Buena para dormir y meditar." },
  huohai: { nombre: "Contratiempos", chino: "Huo Hai", dice: "La más suave de las difíciles: pequeños tropiezos." },
  liusha: { nombre: "Enredos", chino: "Liu Sha", dice: "Malentendidos, líos legales o de pareja." },
  wugui: { nombre: "Cinco fantasmas", chino: "Wu Gui", dice: "Robos, traiciones, habladurías." },
  jueming: { nombre: "Pérdida", chino: "Jue Ming", dice: "La más difícil. Mejor que no sea donde se duerme o se trabaja." },
};

export const FORMACION: Record<Formacion, { nombre: string; chino: string; dice: string }> = {
  wswsh: {
    nombre: "Montaña y agua en su sitio",
    chino: "Wang Shan Wang Shui",
    dice: "La mejor carta: la estrella de las personas está en el asiento y la del dinero en la fachada. Favorece la salud y la prosperidad a la vez.",
  },
  sssxs: {
    nombre: "Montaña y agua al revés",
    chino: "Shang Shan Xia Shui",
    dice: "Las dos estrellas buenas están cambiadas de sitio. Se corrige con la distribución: actividad y agua donde está la del dinero, calma y objetos pesados donde está la de las personas.",
  },
  "doble-fachada": {
    nombre: "Las dos estrellas en la fachada",
    chino: "Shuang Xing Dao Xiang",
    dice: "Favorece el dinero y las oportunidades más que la salud. Conviene dar más peso y calma a la parte de atrás de la vivienda.",
  },
  "doble-asiento": {
    nombre: "Las dos estrellas en el asiento",
    chino: "Shuang Xing Hui Zuo",
    dice: "Favorece la salud y las relaciones más que el dinero. Conviene activar la zona de atrás con movimiento y agua.",
  },
};

export const ESPECIAL: Record<string, string> = {
  "diez-montana": "Combinación de diez en las montañas: une a las personas de la casa.",
  "diez-agua": "Combinación de diez en el agua: ayuda a que lleguen oportunidades.",
  padres: "Cadena de padres: una carta que une los tres tiempos del periodo.",
  perlas: "Cadena de perlas: los números van seguidos en todas las zonas, favorece la continuidad.",
  fuyin: "El 5 vuela en orden (fu yin). Las escuelas no se ponen de acuerdo en si pesa: se anota, no se puntúa.",
  fanyin: "El 5 vuela al revés (fan yin). Las escuelas no se ponen de acuerdo en si pesa: se anota, no se puntúa.",
};

/** Las parejas de estrellas que más se citan. Sólo las contrastadas. */
export const PAREJAS: Array<{ a: number; b: number; dice: string; buena: boolean }> = [
  { a: 1, b: 4, dice: "1 y 4: estudios y pareja.", buena: true },
  { a: 1, b: 6, dice: "1 y 6: ascensos y avance en el trabajo.", buena: true },
  { a: 6, b: 8, dice: "6 y 8: prosperidad.", buena: true },
  { a: 2, b: 5, dice: "2 y 5 juntas: la combinación que más cuidado pide con la salud.", buena: false },
  { a: 2, b: 3, dice: "2 y 3: discusiones y pleitos. Se calma con rojo y metal.", buena: false },
  { a: 6, b: 7, dice: "6 y 7: «espadas cruzadas», disputas y pérdidas.", buena: false },
  { a: 2, b: 7, dice: "2 y 7: cuidado con el fuego en esta zona (cocina, aparatos).", buena: false },
  { a: 7, b: 9, dice: "7 y 9: cuidado con el fuego en esta zona (cocina, aparatos).", buena: false },
];

export const ELEMENTO: Record<Elemento, { nombre: string; cosas: string }> = {
  agua: { nombre: "Agua", cosas: "agua limpia, azul y negro, formas onduladas" },
  madera: { nombre: "Madera", cosas: "plantas vivas, verde, formas alargadas" },
  fuego: { nombre: "Fuego", cosas: "luz cálida, rojo, formas en punta" },
  tierra: { nombre: "Tierra", cosas: "cerámica, piedra, tonos tierra, formas cuadradas" },
  metal: { nombre: "Metal", cosas: "latón, cobre, blanco y dorado, formas redondas" },
};

/**
 * LO QUE SE PROPONE EN CADA ZONA, a partir de sus estrellas.
 *
 * Son reglas, no adivinanzas, y van en este orden: primero lo que pide cuidado
 * este año (no se hacen obras donde está el 5 ni donde está el Tai Sui),
 * después la carta de la casa. Quien hace el estudio lo completa a mano.
 */
export function propuestaZona(z: {
  casilla: Casilla;
  montana: number;
  agua: number;
  anual: number;
  taiSui: boolean;
  suiPo: boolean;
  sanSha: boolean;
}): string[] {
  const p: string[] = [];
  if (z.anual === 5 || z.montana === 5 || z.agua === 5) {
    p.push(
      z.taiSui
        ? "Aquí está el 5 y además el Tai Sui del año: nada de obras ni de golpes. Metal quieto, sin campanas que suenen."
        : "Aquí está el 5: evitar obras y ruido. Metal: una campana de seis tubos metálicos u objetos de latón."
    );
  }
  if (z.taiSui && z.anual !== 5) p.push("Zona del Tai Sui del año: no hacer obras aquí ni sentarse mirando hacia ella.");
  if (z.suiPo) p.push("Zona opuesta al Tai Sui: tampoco conviene remover ni hacer obras.");
  if (z.sanSha) p.push("Tres Asesinos del año: se puede tener la espalda hacia aquí, pero no sentarse mirándola. Sin obras.");
  if (z.anual === 2) p.push("El 2 del año está aquí: un poco de metal y nada de rojo.");
  if (z.casilla !== "C") {
    if (z.agua === 9 || z.agua === 1) p.push("La estrella del agua es buena: zona para el movimiento, una entrada, un salón o un recipiente con agua.");
    if (z.montana === 9 || z.montana === 1 || z.montana === 8) p.push("La estrella de la montaña es buena: zona para descansar, para un dormitorio o para muebles altos y pesados.");
  }
  for (const par of PAREJAS) {
    const hay = (x: number, y: number) => (z.montana === x && z.agua === y) || (z.montana === y && z.agua === x);
    if (hay(par.a, par.b)) p.push(par.dice);
  }
  return p;
}

/* ------------------------------------------------------------------------- */
/*  LAS ESTANCIAS: LO QUE HAY EN CADA ZONA DEL PLANO                          */
/* ------------------------------------------------------------------------- */

/**
 * Lo que se marca en el plano. Una estrella no pesa igual en un dormitorio que
 * en un baño: en el dormitorio manda la estrella de la MONTAÑA (las personas,
 * el descanso) y en la entrada, el salón o el despacho manda la del AGUA (lo
 * que entra, el movimiento). Es la regla de base de las estrellas voladoras.
 */
export const ESTANCIAS = ["Entrada", "Dormitorio principal", "Dormitorio", "Salón", "Comedor", "Cocina", "Baño", "Despacho", "Escalera", "Trastero"] as const;
export type Estancia = (typeof ESTANCIAS)[number];

const BUENAS = [9, 1, 8];
const DIFICILES = [5, 2];

/** Qué conviene hacer con una estancia según las estrellas de su zona. */
export function propuestaEstancia(est: string, z: { montana: number; agua: number; anual: number }): string | null {
  const { montana: m, agua: w, anual: a } = z;
  /* Lo del año (el 5 y el 2 anuales) ya lo dice `propuestaZona` para la zona
     entera: aquí no se repite. Sólo cuenta para la cocina, que lo alimenta. */
  switch (est) {
    case "Entrada":
      if (BUENAS.includes(w)) return `Entrada sobre el agua ${w}: buena puerta. Mantenerla despejada, limpia e iluminada.`;
      if (DIFICILES.includes(w)) return `La entrada recibe el agua ${w}: metal junto a la puerta (latón, un objeto metálico) y nada de rojo.`;
      if (w === 3) return `La entrada recibe el agua 3, la de las discusiones: luz cálida o un detalle rojo en el recibidor.`;
      if (w === 7) return `La entrada recibe el agua 7: un recipiente con agua quieta y la puerta siempre bien cerrada.`;
      return `Entrada sobre el agua ${w}: neutra. Bien iluminada y sin obstáculos.`;
    case "Dormitorio principal":
    case "Dormitorio":
      if (BUENAS.includes(m)) return `${est} sobre la montaña ${m}: buen sitio para dormir.`;
      if (DIFICILES.includes(m)) return `${est} sobre la montaña ${m}: cuidado con el descanso y la salud. Metal en la habitación y, si se puede, dormir en otra zona.`;
      if (m === 3) return `${est} sobre la montaña 3: puede traer roces. Tonos cálidos o rojo suave, sin plantas grandes.`;
      if (m === 7) return `${est} sobre la montaña 7: agua quieta o tonos azules; nada de más metal.`;
      return `${est} sobre la montaña ${m}: correcto para dormir.`;
    case "Salón":
    case "Comedor":
      if (BUENAS.includes(w)) return `${est} sobre el agua ${w}: zona ideal para reunirse; cuanta más vida, mejor.`;
      if (DIFICILES.includes(w)) return `${est} sobre el agua ${w}: menos ruido y movimiento aquí; metal decorativo.`;
      if (w === 3) return `${est} sobre el agua 3: más fácil discutir. Luz cálida y algo rojo.`;
      return `${est} sobre el agua ${w}: zona tranquila para estar.`;
    case "Cocina":
      if (DIFICILES.includes(m) || DIFICILES.includes(w) || DIFICILES.includes(a))
        return "El fuego de la cocina alimenta una estrella difícil de esta zona: metal cerca (utensilios, un objeto de latón) y nada de rojo.";
      if ((m === 7 && w === 9) || (m === 9 && w === 7) || (m === 2 && w === 7) || (m === 7 && w === 2))
        return "Combinación de fuego en una cocina: especial cuidado con fogones y aparatos.";
      return `Cocina sobre montaña ${m} y agua ${w}: sin nada especial que corregir.`;
    case "Baño":
      if (BUENAS.includes(w)) return `El baño cae sobre el agua ${w}, una estrella buena que se desaprovecha: puerta cerrada, tapa bajada y una planta.`;
      if (DIFICILES.includes(w) || DIFICILES.includes(m)) return "Un baño aquí ayuda: descarga una estrella difícil.";
      return "Baño en zona neutra: ventilado y ordenado.";
    case "Despacho":
      if (BUENAS.includes(w) || (m === 1 && w === 4) || (m === 4 && w === 1)) return `Despacho sobre el agua ${w}: buena zona para trabajar. Mesa mirando hacia la dirección de crecimiento de quien la use.`;
      if (DIFICILES.includes(w)) return `Despacho sobre el agua ${w}: si se puede, trabajar en otra zona; si no, metal sobre la mesa.`;
      return `Despacho sobre el agua ${w}: correcto. Mesa mirando hacia la dirección de crecimiento de quien la use.`;
    case "Escalera":
      if (BUENAS.includes(w)) return "La escalera mueve la buena estrella del agua: favorable.";
      if (DIFICILES.includes(w)) return "La escalera mueve una estrella difícil: mejor poco uso y metal en el arranque.";
      return null;
    case "Trastero":
      if (DIFICILES.includes(w) || DIFICILES.includes(m)) return "Un trastero sobre una estrella difícil es buen sitio: zona quieta.";
      if (BUENAS.includes(w)) return "Un trastero sobre una estrella buena la desaprovecha: si se puede, usar esta zona para estar.";
      return null;
  }
  return null;
}
