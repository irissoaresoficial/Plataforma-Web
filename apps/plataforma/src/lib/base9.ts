/*
 * ============================================================================
 * BASE 9 — CASAS Y HABITANTES · «Numerología Evolutiva del Alma»
 * ============================================================================
 *
 * QUÉ ES ESTO, EN DOS FRASES
 * --------------------------
 * La base 22 lee la FECHA de nacimiento y describe cómo se COMPORTA una
 * persona. La base 9 lee el NOMBRE COMPLETO (y la fecha) y describe de qué
 * está HECHA: qué trae, qué le falta y de qué familia viene.
 *
 * El tablero son nueve CASAS —nueve áreas de la vida, numeradas del 1 al 9— y
 * en cada una vive un HABITANTE, que es sencillamente cuántas letras del
 * nombre completo valen ese número. Una casa con tres o más habitantes está
 * sobrecargada; una casa VACÍA (habitante 0) es la lección que la persona viene
 * a aprender. La lectura no es el número de la casa ni el del habitante: es la
 * relación entre los dos.
 *
 * ---------------------------------------------------------------------------
 * DE QUÉ ESCUELA ES ESTO, Y POR QUÉ IMPORTA TANTO FIJARLO
 * ---------------------------------------------------------------------------
 * De **Martine Coquatrix**, «Numerología Evolutiva del Alma» (libro madre:
 * *La numerología a la luz del Árbol de Vida y las Letras Hebraicas*, 2018,
 * ISBN 978-84-948471-5-8). Se confirmó comparando la plantilla de Iris con el
 * listado publicado del contenido de un estudio de esa escuela: coincide pieza
 * por pieza, incluida la secuencia de las cinco filas.
 *
 * HAY UNA TRAMPA GRAVE Y CONVIENE DEJARLA ESCRITA. Media web española llama
 * «Numerología Evolutiva» a la numerología TÁNTRICA de origen sij, que resume
 * a la persona en «5 factores» (alma, personalidad, don divino, destino
 * evolutivo, vida) y se calcula SÓLO con la fecha. Eso NO es este sistema. La
 * regla para filtrar una fuente: si habla de «casas y habitantes», «inclusión»,
 * «puentes» o «herencias familiares», es la escuela buena; si habla de «5
 * factores» y «don divino», es la otra y contamina el modelo.
 *
 * Consecuencia práctica de la investigación: la fila que en la foto de la
 * plantilla se leía como «Fuentes» es **PUENTES**. Cuatro fuentes independientes
 * dan la misma secuencia de cinco filas: Base · Inducción · Puente · Evolución ·
 * Inconsciente.
 *
 * ---------------------------------------------------------------------------
 * LAS TRES DIFERENCIAS CON LA BASE 22 QUE ROMPEN CÓDIGO SI SE OLVIDAN
 * ---------------------------------------------------------------------------
 * Éstas son las que se cuelan en cuanto alguien reutiliza una función del
 * archivo de al lado «porque hace lo mismo». No hace lo mismo.
 *
 *   1. AQUÍ SÍ HAY NÚMEROS MAESTROS. El 11, el 22 y el 33 no se reducen. En
 *      base 22 no existen —11 y 22 están dentro del rango— y por eso `b9()` de
 *      `base22.ts` reduce el 11 a 2. Usarlo aquí destruye los maestros. Por eso
 *      este archivo tiene su propio `red9()`.
 *
 *   2. AQUÍ EL 0 ES UN VALOR LEGÍTIMO. Una casa vacía es kármica, y un desafío
 *      0 es «el desafío de todos». `b22()` convierte el 0 en 22 y `b9()` lo
 *      convierte en 9: las dos cosas serían aquí un error silencioso, del peor
 *      tipo, porque el resultado sigue pareciendo un número razonable.
 *
 *   3. AQUÍ ENTRA EL NOMBRE. La base 22 sólo necesita día, mes y año. Ésta
 *      necesita el nombre completo de nacimiento y, para las herencias, los dos
 *      apellidos del padre y los dos de la madre.
 *
 * ---------------------------------------------------------------------------
 * QUÉ ESTÁ VERIFICADO Y QUÉ NO — LÉASE ANTES DE AÑADIR NADA
 * ---------------------------------------------------------------------------
 * Se usan las mismas tres etiquetas que en `base22.ts`:
 *
 *   - `confirmado`   → varias fuentes coinciden Y hay un ejemplo resuelto que
 *                      la fórmula reproduce. Calcula, y sale en negro.
 *   - `reconstruido` → una sola fuente lo enuncia, o la fuente es de otra
 *                      escuela. Calcula, y sale con un punto dorado de aviso.
 *   - `pendiente`    → no hay fórmula. NO CALCULA y sale en rojo.
 *
 * La verificación dura de este archivo es el nombre `GUSTAVO ANDRÉS GIORDANO`
 * (21 letras), que aparece resuelto en el material de curso del que salieron las
 * fórmulas: habitantes [5,1,1,3,3,3,2,0,3], puente de la casa 1 = 4, de la 7 = 5
 * y de la 8 = 0. Seis comprobaciones, las seis cuadran. `scripts/verifica-base9`
 * las vuelve a pasar.
 *
 * LO QUE FALTA, y no se inventa: **Inducción, Evolución, Inconsciente por casa,
 * Fuerza, Misión Cósmica e Iniciación Espiritual**. Los seis tienen nombre
 * confirmado en el temario de la escuela y fórmula desconocida. Están declarados
 * abajo como `pendiente` para que la pantalla los enseñe en rojo: una casilla que
 * dice «esto todavía no se calcula» es información; una casilla que se inventa un
 * número es un estudio equivocado firmado por Iris.
 *
 * LO MÁS RENTABLE QUE PUEDE CERRAR ESTO: **una carta suya ya resuelta a mano,
 * entera, con nombre y fecha.** Con una sola se cierran de golpe la Inducción, la
 * Evolución, el Inconsciente, la Fuerza, el método del camino de vida y el número
 * de desafíos.
 *
 * ⚠️ Y una salvedad de origen que hay que repetir: el proxy de red bloqueó todos
 * los dominios de las fuentes, así que las citas de la investigación proceden de
 * los resúmenes del buscador, no de las páginas leídas enteras. Lo que sostiene
 * este archivo no son las citas, es el ejemplo resuelto.
 */

/** Cuánto nos fiamos de cada fórmula. Mismas tres etiquetas que en base 22. */
export type Certeza = "confirmado" | "reconstruido" | "pendiente";

/**
 * Lo que hace falta para levantar una carta de base 9.
 *
 * Los dos últimos son los que la base 22 no pide y aquí hacen falta para las
 * herencias familiares: el segundo apellido del padre (= abuela paterna) y el
 * segundo de la madre (= abuela materna). Van opcionales porque casi nadie los
 * trae en la primera consulta, y sin ellos todo lo demás sale igual.
 */
export type EntradaB9 = {
  nombre: string;
  apellido1: string;
  apellido2: string;
  dia: number;
  mes: number;
  anio: number;
  /** 2.º apellido del padre → linaje de la abuela paterna. */
  apellidoPadre2?: string;
  /** 2.º apellido de la madre → linaje de la abuela materna. */
  apellidoMadre2?: string;
};

/* ==========================================================================
   1 · LAS LETRAS
   ========================================================================== */

/**
 * Tabla pitagórica clásica.
 *
 *     1  2  3  4  5  6  7  8  9
 *     A  B  C  D  E  F  G  H  I
 *     J  K  L  M  N  O  P  Q  R
 *     S  T  U  V  W  X  Y  Z
 *
 * Es `((posición en el alfabeto de 26 − 1) mod 9) + 1`, y se calcula en vez de
 * escribirse a mano precisamente para que nadie pueda equivocarse copiando: una
 * de las fuentes consultadas da Z = 7, que es una errata (Z = 8).
 *
 * VERIFICADO: el ejemplo resuelto sólo cuadra con esta tabla. Con la caldea, que
 * es la otra que se usa en numerología, no cuadra ninguna casilla.
 */
export function valorLetra(c: string): number | null {
  const i = c.charCodeAt(0) - 65; // 'A' = 0
  if (i < 0 || i > 25) return null;
  return ((i % 9) + 1) as number;
}

/**
 * Deja el texto en las letras que cuentan.
 *
 * Las tildes se quitan (la Á vale lo mismo que la A: CONFIRMADO, el ejemplo
 * resuelto lleva «ANDRÉS» y su E cuenta como 5). La Ñ se convierte en N, que
 * vale 5 —PROBABLE, dos fuentes lo dicen y ninguna lo contradice, pero no hay
 * ejemplo resuelto con Ñ—. Espacios, guiones y apóstrofos no cuentan.
 *
 * ⚠️ CH y LL van como dos letras cada una, y esto es una decisión, no un dato.
 * Las fuentes de *números del nombre* dicen sumar sus componentes (LL = 3+3 = 6,
 * CH = 3+8 = 11 → 2), pero eso es inaplicable al cuadro de inclusión, donde no
 * se suma: se CUENTAN letras. Contarlas por separado es lo único coherente con
 * la mecánica del cuadro. Nadie publica cómo se concilian las dos cosas — está
 * en la lista de preguntas para Iris.
 */
export function letrasDe(texto: string): string[] {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // fuera tildes y diéresis
    .toUpperCase()
    .replace(/Ñ/g, "N")
    .replace(/[^A-Z]/g, "")
    .split("");
}

/**
 * ¿Es vocal?
 *
 * ⚠️ LA Y ES UN PROBLEMA ABIERTO. Varias fuentes francesas la meten entre las
 * vocales («les voyelles A, E, I, O, U, Y»); en español lo normal es tratarla
 * como consonante salvo cuando suena vocálica, que es una regla que un programa
 * no puede aplicar sin saber pronunciar. Aquí va como CONSONANTE, que es lo
 * conservador, y la decisión está en una sola constante para que cambiarla sea
 * una línea el día que Iris lo diga.
 */
export const Y_ES_VOCAL = false;
const VOCALES = Y_ES_VOCAL ? "AEIOUY" : "AEIOU";
export function esVocal(c: string): boolean {
  return VOCALES.includes(c);
}

/* ==========================================================================
   2 · LAS DOS REDUCCIONES, QUE NO SON LA MISMA
   ========================================================================== */

/** Los maestros. No se reducen: un 11 se queda en 11. */
export const MAESTROS = [11, 22, 33];

/**
 * Reducir conservando maestros. Es LA reducción de esta base.
 *
 *     37 → 3+7 = 10 → 1+0 = 1
 *     38 → 3+8 = 11 → se para: 11 es maestro
 *
 * El 0 se devuelve tal cual, no se convierte en 9. Ver la nota 2 de la cabecera.
 */
export function red9(n: number): number {
  let x = Math.abs(Math.round(n));
  let guarda = 0;
  while (x > 9 && !MAESTROS.includes(x) && guarda++ < 12) {
    x = String(x)
      .split("")
      .reduce((s, c) => s + Number(c), 0);
  }
  return x;
}

/**
 * Reducir a un solo dígito SIN respetar maestros, y dejando vivo el 0.
 *
 * Es lo que piden los desafíos, donde el 0 es un resultado con significado
 * propio («el desafío de todos») y donde un 11 no es un maestro sino un 2.
 */
export function red1(n: number): number {
  let x = Math.abs(Math.round(n));
  let guarda = 0;
  while (x > 9 && guarda++ < 12) {
    x = String(x)
      .split("")
      .reduce((s, c) => s + Number(c), 0);
  }
  return x;
}

/* ==========================================================================
   3 · EL NÚMERO DOBLE: BRUTO Y REDUCIDO
   ========================================================================== */

/**
 * Los números kármicos. PROBABLE: los cita el Manual de Numerología Clásica y
 * son los de toda la literatura pitagórica, pero no he encontrado la lista en
 * material de Coquatrix.
 */
export const KARMICOS = [13, 14, 16, 19, 26];

/**
 * Una casilla de esta base no es un número: son dos.
 *
 * La plantilla de Iris anota, arriba a la derecha, «vocales = no reducida →
 * reducida» y «consonantes = no reducida → reducida», y el bloque de Herencias
 * Familiares tiene esas mismas dos columnas. No es adorno ni redundancia: EL
 * BRUTO ES EL QUE REVELA LOS NÚMEROS KÁRMICOS. Un 19 reducido es un 1 y el 19
 * desaparece; sin apuntar el bruto se pierde la lectura entera.
 *
 * Por eso `pasos` guarda la cadena completa —bruto, cada reducción, resultado—
 * y no sólo los extremos: la notación «13/4» de toda la vida se refiere al
 * último valor de dos cifras antes del dígito final, que es un PASO INTERMEDIO,
 * no el bruto. En `GUSTAVO ANDRÉS GIORDANO` la personalidad es 58 → 13 → 4: el
 * 13 kármico sólo se ve mirando la cadena.
 *
 * ⚠️ Queda una duda que no he podido cerrar: «no reducida» podría significar la
 * suma bruta (que es lo que hace esto, y lo habitual en la numerología francesa)
 * o el resultado tras una sola pasada de reducción. Preguntar a Iris.
 */
export type Doble = {
  /** La suma tal cual, antes de tocarla. */
  bruto: number;
  /** El resultado, con los maestros conservados. */
  reducido: number;
  /** Bruto, cada reducción intermedia, y el resultado. */
  pasos: number[];
  /** El kármico que aparece en la cadena, si aparece. */
  karmico: number | null;
  /** Si el reducido es 11, 22 o 33. */
  maestro: boolean;
};

export function doble(bruto: number): Doble {
  const pasos = [bruto];
  let x = Math.abs(Math.round(bruto));
  let guarda = 0;
  while (x > 9 && !MAESTROS.includes(x) && guarda++ < 12) {
    x = String(x)
      .split("")
      .reduce((s, c) => s + Number(c), 0);
    pasos.push(x);
  }
  return {
    bruto,
    reducido: x,
    pasos,
    karmico: pasos.find((p) => KARMICOS.includes(p)) ?? null,
    maestro: MAESTROS.includes(x),
  };
}

/* ==========================================================================
   4 · EL CUADRO DE INCLUSIÓN — CASAS, HABITANTES Y PUENTES
   ========================================================================== */

/** Una casa del cuadro, con quien la habita y su puente. */
export type Casa = {
  /** 1..9. */
  casa: number;
  /** Cuántas letras del nombre valen este número. Puede ser 0. */
  habitante: number;
  /** |habitante − casa|, con la excepción del 0. */
  puente: number;
  /** Sin nadie dentro: casa kármica, la lección que se viene a aprender. */
  vacia: boolean;
  /** Tres o más: energía sobrerrepresentada. */
  dominante: boolean;
};

/**
 * Qué área de la vida es cada casa.
 *
 * PROBABLE, y con una advertencia doble: estas descripciones son de la Escuela
 * Sistémica Jaume Valls, no de Coquatrix, así que podrían no ser las que enseña
 * Iris; y la de la casa 8 no la he encontrado en ninguna fuente accesible. No me
 * la invento: se queda vacía y la pantalla lo dice.
 */
export const AREAS: Record<number, string | null> = {
  1: "Yo, el padre, mi parte masculina",
  2: "La madre, mi parte femenina, mis sentimientos",
  3: "El hijo, mi parte infantil, divertida, comunicativa",
  4: "Mi mundo físico, mi cuerpo, mis responsabilidades, mi trabajo",
  5: "Mi independencia, la capacidad de defenderme y de ser yo mismo",
  6: "Mi amor, la capacidad de amar y ser amado",
  7: "Mis conocimientos, mi sabiduría — manda el análisis mental",
  8: null,
  9: "Espiritualidad profunda, compasión, entrega — aquí manda el corazón",
};

/**
 * El puente de una casa.
 *
 * «Es la diferencia entre el Habitante de Base y el Número de la Casa, siempre
 * partiendo del Mayor hacia el menor. En su casa 1 se encuentra el Habitante 5,
 * entonces 5 − 1 = 4. La casa 7 tiene un Habitante 2, entonces 7 − 2 = 5. En el
 * caso de las casas con 0, el puente también es 0.»
 *
 * CONFIRMADO: fórmula enunciada por la fuente Y verificada contra las tres
 * casillas del ejemplo resuelto, incluida la excepción del 0.
 *
 * ⚠️ LA EXCEPCIÓN DEL 0 NO ES `|0 − casa|`. Una casa vacía tiene puente 0, no
 * puente igual al número de la casa. Es explícita en la fuente y está verificada
 * en la casa 8 del ejemplo. Es exactamente el tipo de detalle que se pierde al
 * «simplificar» la función.
 */
export function puenteDe(habitante: number, casa: number): number {
  if (habitante === 0) return 0;
  return Math.abs(habitante - casa);
}

/**
 * El cuadro de inclusión de base: el recuento de letras por valor.
 *
 * SÓLO EL NOMBRE COMPLETO DE NACIMIENTO, no la fecha. Es lo único verificado: el
 * ejemplo resuelto cuadra usando sólo el nombre. Hay una escuela francesa que
 * sostiene que a la inclusión «le falta la corriente evolutiva» y propone sumarle
 * el camino de vida a cada casilla — pero eso no es rellenar la base con la
 * fecha, es una fila derivada, y podría ser justamente la fila Evolución que aquí
 * está pendiente.
 *
 * Los nueve habitantes suman siempre el número de letras. Es la comprobación
 * aritmética que hay que tener a mano, y la devuelve `totalLetras`.
 */
export function inclusion(nombreCompleto: string): {
  casas: Casa[];
  totalLetras: number;
  cuadra: boolean;
} {
  const letras = letrasDe(nombreCompleto);
  const cuenta: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const c of letras) {
    const v = valorLetra(c);
    if (v !== null) cuenta[v] += 1;
  }
  const casas: Casa[] = [];
  for (let i = 1; i <= 9; i++) {
    const h = cuenta[i];
    casas.push({
      casa: i,
      habitante: h,
      puente: puenteDe(h, i),
      vacia: h === 0,
      dominante: h >= 3,
    });
  }
  const suma = casas.reduce((s, c) => s + c.habitante, 0);
  return { casas, totalLetras: letras.length, cuadra: suma === letras.length };
}

/**
 * El punto de equilibrio: cuántas letras «tocarían» por casa.
 *
 * PROBABLE. Por encima de esta media se lee exceso y por debajo defecto. Es una
 * sola fuente francesa, pero es aritmética evidente y no compromete nada.
 */
export function puntoDeEquilibrio(totalLetras: number): number {
  return totalLetras / 9;
}

/* ==========================================================================
   5 · LAS CINCO FILAS DE LA PLANTILLA
   ========================================================================== */

/**
 * Una fila del cuadro. Las que no tienen `calcula` no calculan, y eso es
 * intencionado: la pantalla las pinta en rojo con su motivo.
 */
export type Fila = {
  k: string;
  nombre: string;
  certeza: Certeza;
  /** De dónde sale, dicho con palabras. Es lo que se enseña en modo escuela. */
  de: string;
  /** Qué significa la fila. */
  significado: string;
  /** Por qué no calcula, cuando no calcula. Sale literal en pantalla. */
  falta?: string;
  /** La cuenta, casa a casa. */
  calcula?: (casas: Casa[], i: number) => number;
};

export const FILAS: Fila[] = [
  {
    k: "base",
    nombre: "Base",
    certeza: "confirmado",
    de: "Cuántas letras del nombre completo valen ese número",
    significado:
      "Cómo somos al nacer. Una casa llena es energía de sobra en esa área; una casa vacía es la lección que se viene a aprender.",
    calcula: (casas, i) => casas[i].habitante,
  },
  {
    k: "induccion",
    nombre: "Inducción",
    certeza: "pendiente",
    de: "Se deriva del cuadro de base — la operación no está publicada",
    significado:
      "La lectura transgeneracional del cuadro: cómo se vive cada área en relación con lo que viene de la familia.",
    falta:
      "El temario de la escuela la titula «Inducción de la inclusión de base», así que sale del propio cuadro y no de datos nuevos, y sus casillas van reducidas. La operación no aparece en ninguna fuente, ni en español ni en francés. Es el mismo hueco que dejó abierto la base 22.",
  },
  {
    k: "puente",
    nombre: "Puente",
    certeza: "confirmado",
    de: "La diferencia entre el habitante y su casa, del mayor al menor. Casa vacía → puente 0",
    significado:
      "El camino alternativo. Es lo que hay que atravesar para equilibrar los miedos o los excesos del habitante de base.",
    calcula: (casas, i) => casas[i].puente,
  },
  {
    k: "evolucion",
    nombre: "Evolución",
    certeza: "pendiente",
    de: "Suma de habitantes de otras casas — no se sabe cuáles",
    significado:
      "Lo que se viene a aprender en cada área. Se activa a partir de los treinta años.",
    falta:
      "La fuente dice «sumando los habitantes de otras casas al habitante de base», y ahí se corta: no dice qué casas ni en qué orden. Sin eso no hay fórmula. Lo único firme es el dato interpretativo: esta fila empieza a leerse a los 30.",
  },
  {
    k: "inconsciente",
    nombre: "Inconsciente",
    certeza: "pendiente",
    de: "Sin fórmula por casa",
    significado: "Lo que se trae de otras vidas, y la primera reacción ante lo que llega de golpe.",
    falta:
      "Lo único con forma de fórmula que existe publicado es el inconsciente GLOBAL —9 menos el número de casas vacías—, que es un solo número y no una fila de nueve. Ese sí se calcula, aparte. La fila de nueve columnas de la plantilla no tiene fórmula conocida; hay una pista suelta de que se construye a partir de los ceros del cuadro, sin decir cómo.",
  },
];

/**
 * El inconsciente global: 9 menos las casas vacías.
 *
 * RECONSTRUIDO, y con una precisión importante: esto NO es la fila «Inconsciente»
 * de la plantilla, que tiene nueve columnas. Es el número suelto que la
 * numerología clásica llama «impulsión subconsciente». Se calcula porque la
 * fórmula está publicada y es útil, y se enseña con su nombre propio para que
 * nadie lo confunda con la fila.
 */
export function inconscienteGlobal(casas: Casa[]): number {
  return 9 - casas.filter((c) => c.vacia).length;
}

/* ==========================================================================
   6 · LOS NÚMEROS DEL NOMBRE
   ========================================================================== */

function sumaLetras(texto: string, filtro?: (c: string) => boolean): number {
  return letrasDe(texto)
    .filter((c) => (filtro ? filtro(c) : true))
    .reduce((s, c) => s + (valorLetra(c) ?? 0), 0);
}

/** Todas las letras. «Cómo nos ven los demás». CONFIRMADO. */
export function expresion(nombreCompleto: string): Doble {
  return doble(sumaLetras(nombreCompleto));
}

/** Las vocales. Lo que uno desea de verdad. CONFIRMADO. */
export function alma(nombreCompleto: string): Doble {
  return doble(sumaLetras(nombreCompleto, esVocal));
}

/**
 * Las consonantes. La imagen que se proyecta. CONFIRMADO en la fórmula.
 *
 * ⚠️ CHOQUE DE NOMBRES, no de fórmula. En francés clásico esta misma suma se
 * llama «nombre de réalisation», y «personnalité» a veces es otra cosa; y el
 * temario de Coquatrix glosa la EXPRESIÓN como «cómo nos ven los demás», que es
 * justo la definición que el español divulgativo da de la PERSONALIDAD. Si Iris
 * usa la nomenclatura francesa, el estudio saldría con las etiquetas cruzadas.
 * Preguntar antes de redactar textos sobre estas dos.
 */
export function personalidad(nombreCompleto: string): Doble {
  return doble(sumaLetras(nombreCompleto, (c) => !esVocal(c)));
}

/**
 * Las iniciales de todos los nombres y apellidos. RECONSTRUIDO.
 *
 * «Representa los valores que te permiten recuperar toda tu vitalidad en caso de
 * dificultad.» La fórmula es de fuente francesa genérica, NO de Coquatrix: la
 * plantilla de Iris tiene su círculo «Equilibrio» y la escuela lo lista entre sus
 * cálculos, pero nadie publica cómo lo calcula ella.
 */
export function equilibrio(partes: string[]): Doble {
  const bruto = partes
    .map((p) => letrasDe(p)[0])
    .filter(Boolean)
    .reduce((s, c) => s + (valorLetra(c) ?? 0), 0);
  return doble(bruto);
}

/* ==========================================================================
   7 · LOS NÚMEROS DE LA FECHA
   ========================================================================== */

/**
 * El camino de vida — Y AQUÍ HAY UN RIESGO REAL QUE NO SE PUEDE TAPAR.
 *
 * Las fuentes dan DOS métodos incompatibles:
 *
 *   a) POR PARTES: reducir día, mes y año por separado, sumarlos y reducir.
 *   b) DE CORRIDO: sumar todas las cifras de la fecha y reducir al final.
 *
 * No dan lo mismo en cuanto entran maestros. Esta escuela usa maestros, y el
 * método por partes es el que los preserva, así que es el que se toma por bueno
 * —pero NO está confirmado para Coquatrix, y es el número más leído de toda la
 * carta.
 *
 * Por eso esto devuelve LOS DOS y avisa cuando discrepan, en vez de elegir en
 * silencio. Cuando `discrepa` es cierto, la pantalla tiene que decirlo: es la
 * única forma honesta de enseñar un número del que no estamos seguros.
 */
export function caminoDeVida(e: { dia: number; mes: number; anio: number }): {
  porPartes: Doble;
  deCorrido: Doble;
  valor: number;
  discrepa: boolean;
} {
  const porPartes = doble(red9(e.dia) + red9(e.mes) + red9(e.anio));
  const cifras = `${e.dia}${e.mes}${e.anio}`
    .split("")
    .reduce((s, c) => s + Number(c), 0);
  const deCorrido = doble(cifras);
  return {
    porPartes,
    deCorrido,
    valor: porPartes.reducido,
    discrepa: porPartes.reducido !== deCorrido.reducido,
  };
}

/**
 * Las cuatro realizaciones (pináculos). RECONSTRUIDO.
 *
 * Es la fórmula pitagórica estándar, no verificada para Coquatrix. Y hay un
 * problema abierto encima: la escuela habla de TRES ciclos —formación, producción
 * y cosecha— y de tres desafíos estructurales, no de cuatro. Puede que su esquema
 * no sea el de los cuatro pináculos. Se calculan porque la fórmula es sólida en
 * la tradición de la que sale esta escuela, y se marcan.
 *
 * La primera dura `36 − caminoDeVida` años; la segunda y la tercera, nueve cada
 * una; la cuarta, hasta el final.
 */
export function realizaciones(e: { dia: number; mes: number; anio: number }, camino: number) {
  const d = red9(e.dia);
  const m = red9(e.mes);
  const a = red9(e.anio);
  const r1 = red9(m + d);
  const r2 = red9(d + a);
  const r3 = red9(r1 + r2);
  const r4 = red9(m + a);
  const finPrimera = 36 - camino;
  return [
    { n: 1, valor: r1, desde: 0, hasta: finPrimera },
    { n: 2, valor: r2, desde: finPrimera, hasta: finPrimera + 9 },
    { n: 3, valor: r3, desde: finPrimera + 9, hasta: finPrimera + 18 },
    { n: 4, valor: r4, desde: finPrimera + 18, hasta: null as number | null },
  ];
}

/**
 * Los cuatro desafíos. RECONSTRUIDO.
 *
 * Restas, no sumas, y **el 0 es un resultado válido y significativo**: es «el
 * desafío de todos». Por eso aquí se usa `red1` y no `red9` — `red9` respetaría
 * un maestro que en una resta no significa nada, y ninguna de las dos puede
 * convertir el 0 en 9.
 *
 * ⚠️ Coquatrix habla de TRES desafíos. Esto calcula los cuatro clásicos. Sin
 * resolver.
 */
export function desafios(e: { dia: number; mes: number; anio: number }) {
  const d = red9(e.dia);
  const m = red9(e.mes);
  const a = red9(e.anio);
  const d1 = red1(Math.abs(d - m));
  const d2 = red1(Math.abs(a - d));
  const d3 = red1(Math.abs(d1 - d2));
  const d4 = red1(Math.abs(a - m));
  return [
    { n: 1, valor: d1 },
    { n: 2, valor: d2 },
    { n: 3, valor: d3 },
    { n: 4, valor: d4 },
  ];
}

/* ==========================================================================
   8 · LAS HERENCIAS FAMILIARES
   ========================================================================== */

/**
 * La marca de los cuatro linajes, leída en los apellidos.
 *
 * Es LA innovación de Coquatrix respecto de la numerología clásica: «aparte de
 * usar la fecha, el nombre y los apellidos, también usamos los dos apellidos del
 * padre y los dos apellidos de la madre… Incluir los apellidos de las abuelas
 * representa la energía femenina en la historia familiar».
 *
 * El mapa (PROBABLE, una sola fuente):
 *
 *   1.º apellido mío   → del padre  → abuelo paterno  → linaje masculino
 *   2.º apellido mío   → de la madre → abuelo materno → linaje masculino
 *   2.º del padre      → abuela paterna              → linaje femenino
 *   2.º de la madre    → abuela materna              → linaje femenino
 *
 * Cada uno se calcula sumando todas sus letras y anotando bruto y reducido — que
 * es exactamente por lo que la plantilla tiene ahí dos columnas.
 *
 * ⚠️ LAS SEIS SIGLAS DE LA PLANTILLA (MPP, NCE, EJE, MF, MG, MFG) NO SE
 * CORRESPONDEN CON NADA PUBLICADO, en ningún idioma, y tampoco cuadra la cuenta:
 * el sistema documentado usa cuatro apellidos y la plantilla tiene seis filas.
 * Puede que sean cuatro apellidos más dos síntesis (línea paterna y línea
 * materna), o abreviaturas propias de Iris. Es la primera pregunta de la lista
 * para ella. Aquí se calculan los cuatro linajes documentados y nada más.
 */
export type Linaje = {
  k: string;
  nombre: string;
  linaje: "masculino" | "femenino";
  apellido: string;
  valor: Doble | null;
};

export function herencias(e: EntradaB9): Linaje[] {
  const filas: Array<Omit<Linaje, "valor">> = [
    { k: "abuelo_p", nombre: "Abuelo paterno", linaje: "masculino", apellido: e.apellido1 },
    { k: "abuelo_m", nombre: "Abuelo materno", linaje: "masculino", apellido: e.apellido2 },
    { k: "abuela_p", nombre: "Abuela paterna", linaje: "femenino", apellido: e.apellidoPadre2 || "" },
    { k: "abuela_m", nombre: "Abuela materna", linaje: "femenino", apellido: e.apellidoMadre2 || "" },
  ];
  return filas.map((f) => ({
    ...f,
    valor: letrasDe(f.apellido).length ? doble(sumaLetras(f.apellido)) : null,
  }));
}

/* ==========================================================================
   9 · LA CARTA ENTERA
   ========================================================================== */

export type ResultadoB9 = {
  nombreCompleto: string;
  casas: Casa[];
  totalLetras: number;
  /** Los nueve habitantes suman el total de letras. Si esto es falso, hay un bug. */
  cuadra: boolean;
  equilibrioDelCuadro: number;
  filas: Fila[];
  expresion: Doble;
  alma: Doble;
  personalidad: Doble;
  equilibrio: Doble;
  camino: ReturnType<typeof caminoDeVida>;
  realizaciones: ReturnType<typeof realizaciones>;
  desafios: ReturnType<typeof desafios>;
  inconscienteGlobal: number;
  herencias: Linaje[];
  /** Cálculos con nombre confirmado en el temario y fórmula desconocida. */
  sinFormula: Array<{ nombre: string; falta: string }>;
};

/**
 * Las que están en el temario de la escuela y nadie publica cómo se calculan.
 *
 * Van en el resultado, y no en un comentario, para que la pantalla pueda
 * enseñarlas en rojo. Una casilla que dice «esto todavía no se calcula» le sirve
 * a Iris para saber qué preguntar; una casilla que no está, no.
 */
const SIN_FORMULA = [
  {
    nombre: "Fuerza",
    falta:
      "Aparece en el módulo 1 del temario de Coquatrix («Camino de Vida y Fuerza») y en todas las listas de cálculos de la escuela. Ninguna fuente accesible dice cómo se calcula, y «nombre de force» tampoco existe como término estándar en la numerología francesa.",
  },
  {
    nombre: "Misión Cósmica",
    falta:
      "Figura con ese nombre exacto entre los cálculos de la escuela. Sin fórmula publicada. La hipótesis genérica sería camino de vida + expresión, pero no hay ni una fuente que lo diga para esta escuela, así que no se implementa.",
  },
  {
    nombre: "Iniciación Espiritual",
    falta:
      "Igual que la anterior: nombre confirmado en el temario, fórmula desconocida. En la plantilla aparece dentro del triángulo, junto a lo que se leyó como «Medio de Búsqueda» y que podría ser en realidad «Misión Cósmica».",
  },
  {
    nombre: "Esquema psicoenergético",
    falta:
      "Se lee como las fortalezas y debilidades en el cuerpo físico según las energías de los linajes paterno y materno. Concepto documentado, fórmula no.",
  },
];

export function calculaBase9(e: EntradaB9): ResultadoB9 {
  const nombreCompleto = [e.nombre, e.apellido1, e.apellido2].filter(Boolean).join(" ");
  const { casas, totalLetras, cuadra } = inclusion(nombreCompleto);
  const camino = caminoDeVida(e);
  return {
    nombreCompleto,
    casas,
    totalLetras,
    cuadra,
    equilibrioDelCuadro: puntoDeEquilibrio(totalLetras),
    filas: FILAS,
    expresion: expresion(nombreCompleto),
    alma: alma(nombreCompleto),
    personalidad: personalidad(nombreCompleto),
    equilibrio: equilibrio([e.nombre, e.apellido1, e.apellido2]),
    camino,
    realizaciones: realizaciones(e, camino.valor),
    desafios: desafios(e),
    inconscienteGlobal: inconscienteGlobal(casas),
    herencias: herencias(e),
    sinFormula: SIN_FORMULA,
  };
}

/** Cuántas de las cinco filas calculan hoy. Es lo que enseña la barra de estado. */
export function cuantasCalculanB9(): {
  total: number;
  confirmadas: number;
  pendientes: string[];
} {
  return {
    total: FILAS.length,
    confirmadas: FILAS.filter((f) => f.certeza === "confirmado").length,
    pendientes: FILAS.filter((f) => f.certeza === "pendiente").map((f) => f.nombre),
  };
}
