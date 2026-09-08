/**
 * ============================================================================
 * NUMEROLOGÍA BASE 22 — LA REJILLA
 * ============================================================================
 *
 * Diecinueve posiciones colocadas en una rejilla, cada una con su número, que
 * salen todas de la fecha de nacimiento. Es el sistema que se enseña como
 * «numerología psico-emocional en base 22»: viene de los 22 senderos del árbol
 * de la vida, las 22 letras hebreas y los 22 arcanos mayores, que es la misma
 * raíz de la que ya cuelga la parte de Kábala de esta plataforma.
 *
 * ---------------------------------------------------------------------------
 * LO QUE ESTÁ CONFIRMADO Y LO QUE NO — LÉASE ANTES DE TOCAR NADA
 * ---------------------------------------------------------------------------
 *
 * Este archivo distingue tres estados en cada posición, y esa distinción es lo
 * más importante que hay aquí dentro:
 *
 *   CONFIRMADO  la fórmula reproduce, número a número, la tabla que Iris tiene
 *               hecha a mano. Se ha comprobado con un script.
 *   PROBABLE    la fórmula viene de una fuente publicada pero no se ha podido
 *               contrastar contra la tabla de Iris.
 *   PENDIENTE   no se sabe. No calcula, y en pantalla sale marcada.
 *
 * Una posición PENDIENTE no es un descuido: es una promesa de no inventar. El
 * día que alguien rellene una fórmula a ojo para «dejarlo terminado», esta
 * plataforma empieza a entregar estudios falsos a gente que ha pagado, y eso no
 * se nota hasta que es tarde. Si no se sabe, se queda en rojo.
 *
 * ---------------------------------------------------------------------------
 * LA REDUCCIÓN
 * ---------------------------------------------------------------------------
 * Se reduce SUMANDO LAS CIFRAS hasta caer en 1..22, no restando 22. Está
 * comprobado con la tabla de Iris: la búsqueda emocional le da 39, y en su
 * tabla figura un 12 (3+9). Restando 22 habría dado 17.
 */

/** Los tres números de los que sale todo: día, mes y año de nacimiento. */
export type BaseNacimiento = { dia: number; mes: number; anio: number };

/** Cuánto nos fiamos de cada fórmula. Ver la cabecera. */
export type Certeza = "confirmado" | "probable" | "pendiente";

export type Posicion = {
  k: string;
  /** Como lo llama la tabla, en mayúsculas y todo. */
  nombre: string;
  /** Dónde cae en la rejilla. Leído del diagrama de Iris. */
  fila: number;
  col: number;
  certeza: Certeza;
  /** De dónde sale, dicho con palabras. Es lo que se enseña en el modo escuela. */
  de?: string;
  /** La cuenta. Si falta, la posición todavía no calcula. */
  calcula?: (b: BaseNacimiento, ya: Record<string, number>) => number;
  /** Qué significa esta posición. Lo rellena el material de la escuela. */
  significado?: string;
  /** Con qué otras posiciones se une por una línea en el dibujo. */
  une?: string[];
};

/**
 * Reducir a 1..22 sumando las cifras.
 *
 * El 0 no existe en esta baraja —no hay arcano 0 en el recuento de 22— así que
 * un 0 se lee como 22. Es la misma regla que usan las fuentes para el número de
 * resistencia cuando la resta da cero.
 */
export function b22(n: number): number {
  let x = Math.abs(Math.round(n));
  while (x > 22) x = String(x).split("").reduce((s, c) => s + Number(c), 0);
  return x === 0 ? 22 : x;
}

/** Reducir a 1..9, que es la otra lectura de la misma tabla. */
export function b9(n: number): number {
  let x = Math.abs(Math.round(n));
  while (x > 9) x = String(x).split("").reduce((s, c) => s + Number(c), 0);
  return x === 0 ? 9 : x;
}

/*
 * ============================================================================
 * LAS DIECINUEVE POSICIONES
 * ============================================================================
 *
 * La rejilla es de cinco filas. Las columnas van de 0 a 4 y se reparten así,
 * leído del diagrama que mandó Iris:
 *
 *   fila 0                EMERSOR      PERS.EXT.SOCIAL     BÚSQ. ARMONÍA
 *   fila 1        COMPORT.INT.SOCIAL  NUDO EMOC.  COMPORT.EXT.SOCIAL  BÚSQ.EMOC.
 *   fila 2   RESISTENCIA  MADRE   YO   PADRE   PERS.PROFUNDA   BÚSQ.ESPIRITUAL
 *   fila 3                        NUDO DE DOLOR
 *   fila 4        COMPORT.INT.DEF   PERS.EXT.DEF   COMPORT.EXT.DEF   BÚSQ.SALIDA
 *   fila 5                        HUIDA
 *
 * Arriba, lo social: lo que la persona enseña fuera. Abajo, lo espejado: la
 * defensa. Y en medio la familia —madre, yo, padre— de la que sale todo.
 */
export const POSICIONES: Posicion[] = [
  /* ---------------------------------------------------------- LA FAMILIA --
     Las tres de las que cuelga la tabla entera, y las tres confirmadas contra
     la tabla de Iris (día 1, mes 1, año 18 → madre 1, yo 1, padre 18). */
  {
    k: "madre",
    nombre: "Mensaje de la madre",
    fila: 2,
    col: 1,
    certeza: "confirmado",
    de: "El día de nacimiento",
    calcula: (b) => b22(b.dia),
    une: ["yo", "resistencia", "comportIntSocial", "comportIntDefensa"],
  },
  {
    k: "yo",
    nombre: "El Yo",
    fila: 2,
    col: 2,
    certeza: "confirmado",
    de: "El mes de nacimiento",
    calcula: (b) => b22(b.mes),
    une: ["madre", "padre", "nudoEmocional", "nudoDolor"],
  },
  {
    k: "padre",
    nombre: "Mensaje del padre",
    fila: 2,
    col: 3,
    certeza: "confirmado",
    de: "El año de nacimiento, reducido",
    calcula: (b) => b22(b.anio),
    une: ["yo", "persProfunda", "comportExtSocial", "comportExtDefensa"],
  },

  /* -------------------------------------------------- EL EJE EMOCIONAL --
     Las tres que se han podido comprobar además de la familia. */
  {
    k: "persProfunda",
    nombre: "Personalidad profunda",
    fila: 2,
    col: 4,
    certeza: "confirmado",
    de: "Día + mes + año",
    calcula: (b) => b22(b.dia + b.mes + b.anio),
    une: ["padre", "busqEspiritual", "busqEmocional"],
  },
  {
    k: "nudoEmocional",
    nombre: "Nudo emocional",
    fila: 1,
    col: 2,
    certeza: "confirmado",
    de: "Día + año — la madre y el padre, sin el Yo en medio",
    calcula: (b) => b22(b.dia + b.anio),
    une: ["yo", "persExtSocial", "busqEmocional"],
  },
  {
    k: "busqEmocional",
    nombre: "Búsqueda emocional",
    fila: 1,
    col: 4,
    certeza: "confirmado",
    de: "Personalidad profunda + nudo emocional",
    calcula: (_b, ya) => b22(ya.persProfunda + ya.nudoEmocional),
    une: ["nudoEmocional", "persProfunda", "busqArmonia"],
  },

  /* ------------------------------------------------------- LO SOCIAL -- */
  { k: "emersor", nombre: "Emersor", fila: 0, col: 0, certeza: "pendiente", une: ["comportIntSocial", "persExtSocial"] },
  { k: "persExtSocial", nombre: "Personalidad externa social-profesional", fila: 0, col: 2, certeza: "pendiente", une: ["emersor", "nudoEmocional", "busqArmonia"] },
  { k: "busqArmonia", nombre: "Búsqueda de armonía", fila: 0, col: 4, certeza: "pendiente", une: ["persExtSocial", "busqEmocional"] },
  { k: "comportIntSocial", nombre: "Comportamiento interno social", fila: 1, col: 1, certeza: "pendiente", une: ["emersor", "madre", "nudoEmocional"] },
  { k: "comportExtSocial", nombre: "Comportamiento externo social", fila: 1, col: 3, certeza: "pendiente", une: ["nudoEmocional", "padre", "busqEmocional"] },

  /* ------------------------------------------------------ LOS EXTREMOS -- */
  { k: "resistencia", nombre: "Número de resistencia", fila: 2, col: 0, certeza: "pendiente", une: ["madre", "comportIntSocial", "comportIntDefensa"] },
  { k: "busqEspiritual", nombre: "Búsqueda espiritual", fila: 2, col: 5, certeza: "pendiente", une: ["persProfunda"] },

  /* --------------------------------------------------- EL NUDO DE DOLOR -- */
  { k: "nudoDolor", nombre: "Nudo de dolor", fila: 3, col: 2, certeza: "pendiente", une: ["yo", "persExtDefensa"] },

  /* -------------------------------------------------------- LA DEFENSA --
     El espejo de arriba: lo que se monta para protegerse. */
  { k: "comportIntDefensa", nombre: "Comportamiento interior de defensa", fila: 4, col: 1, certeza: "pendiente", une: ["madre", "persExtDefensa", "huida"] },
  { k: "persExtDefensa", nombre: "Personalidad exterior de defensa", fila: 4, col: 2, certeza: "pendiente", une: ["nudoDolor", "comportIntDefensa", "comportExtDefensa"] },
  { k: "comportExtDefensa", nombre: "Comportamiento exterior de defensa", fila: 4, col: 3, certeza: "pendiente", une: ["padre", "persExtDefensa", "busqSalida"] },
  { k: "busqSalida", nombre: "Búsqueda de salida exterior", fila: 4, col: 4, certeza: "pendiente", une: ["comportExtDefensa"] },
  { k: "huida", nombre: "Número de huida", fila: 5, col: 1, certeza: "pendiente", une: ["comportIntDefensa"] },
];

export type Calculada = Posicion & { valor: number | null; valor9: number | null };

/**
 * Calcular la tabla entera.
 *
 * Se recorre en el orden en que están escritas, y cada posición recibe lo ya
 * calculado: así la búsqueda emocional puede pedir la personalidad profunda sin
 * repetir su cuenta. Las que no tienen fórmula devuelven `null`, que es lo que
 * la pantalla pinta como pendiente.
 */
export function calculaBase22(b: BaseNacimiento): Calculada[] {
  const ya: Record<string, number> = {};
  return POSICIONES.map((p) => {
    let valor: number | null = null;
    if (p.calcula) {
      try {
        valor = p.calcula(b, ya);
        ya[p.k] = valor;
      } catch {
        /* Una fórmula que pide algo que todavía no se calcula no rompe la
           tabla: esa posición se queda pendiente como las demás. */
        valor = null;
      }
    }
    return { ...p, valor, valor9: valor === null ? null : b9(valor) };
  });
}

/** Cuántas calculan de verdad, para poder decirlo en pantalla sin mentir. */
export function cuantasCalculan(): { listas: number; total: number } {
  return { listas: POSICIONES.filter((p) => p.calcula).length, total: POSICIONES.length };
}
