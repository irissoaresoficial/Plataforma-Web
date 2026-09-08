/**
 * LA FORMA DE UN DICCIONARIO DEL DOCUMENTO
 *
 * Aquí está escrito, una sola vez, qué tiene que traer cada idioma. Los tres
 * ficheros —`es.ts`, `pt.ts`, `en.ts`— cumplen este tipo, así que si a uno le
 * falta una frase el compilador lo dice antes de que salga un PDF con un hueco.
 *
 * Lo que se traduce es EL DOCUMENTO QUE SE ENTREGA, no la plataforma. Iris
 * trabaja en español y la herramienta sigue en español; lo único que cambia de
 * idioma es la hoja que se le manda a la persona.
 *
 * Dos clases de texto conviven aquí y conviene no confundirlas:
 *
 *   · `hoja` es la voz de la casa —los rótulos y las frases que explican cada
 *     apartado—. Se escribieron para alguien que no ha estudiado Kábala:
 *     directas, concretas, sin misticismo. Al traducirlas se conserva ese tono;
 *     una versión solemne las estropea aunque sea literalmente correcta.
 *
 *   · el resto —arcanos, tareas, planos, números— son LOS APUNTES de la
 *     escuela. Ahí la traducción dice exactamente lo mismo que el original: ni
 *     un matiz más ni uno menos.
 */

/** Los tres idiomas en los que puede salir el documento. `es` es el de casa. */
export type Idioma = "es" | "pt" | "en";

/** Las frases de la hoja del cliente. Las llaves —`{edad}`, `{n}`— se
 *  sustituyen por el dato que toque; hay que dejarlas tal cual en las
 *  traducciones o el hueco sale vacío. */
export type CopiaHoja = {
  /* --- cabecera --- */
  subtitulo: string;

  /* --- cómo eres --- */
  comoEres: string;
  porDentro: string;
  porDentroPie: string;
  porFuera: string;
  porFueraPie: string;

  /* --- los tres caminos --- */
  tuCamino: string;
  tuCaminoPie: string;
  origenTitulo: string;
  origenQue: string;
  /** {edad} = la edad de cambio. */
  origenCuando: string;
  transformacionTitulo: string;
  transformacionQue: string;
  transformacionCuando: string;
  destinoTitulo: string;
  destinoQue: string;
  /** {edad} = la edad a la que entra el destino. */
  destinoCuando: string;

  /* --- lo que hay que trabajar --- */
  loQueTrabajas: string;
  loQueTrabajasPie: string;
  sinTareas: string;

  /* --- lo que frena --- */
  loQueTeFrena: string;
  loQueTeFrenaPie: string;
  sinFrenos: string;

  /* --- maestrías --- */
  yaHecho: string;
  yaHechoNada: string;
  /** {n} = cuántas, {lista} = «el 1, el 4 y el 7». */
  yaHechoTexto: string;

  /* --- cuentas abiertas --- */
  porCerrar: string;
  /** {n} = el número kármico. */
  porCerrarKarmico: string;
  /** {n} = el lema de vida. */
  porCerrarLema: string;
  /** Se pega detrás del lema cuando los apuntes no traen texto para ese número. */
  porCerrarLemaSinTexto: string;

  /* --- dónde está ahora --- */
  dondeEstas: string;
  /** {edad}, {ciclo}, {desde}, {hasta}. */
  etapa: string;
  /** La misma frase para el último ciclo, que no tiene final. */
  etapaFinal: string;
  /** {n} = el año personal. */
  anioPersonal: string;
  /** {edad} = cuándo empiezan, {tipos} = «espíritu y alma». */
  turbulencias: string;

  /* --- días de fuerza --- */
  diasFuerza: string;
  diasFuerzaPie: string;

  /* --- el propósito --- */
  hilo: string;
  /** {n} = el propósito. */
  hiloPie: string;
  viveBien: string;
  seTuerce: string;

  /* --- el cierre --- */
  cierre: string;
  /** {carta} = el arcano de destino. */
  cierreVas: string;
  cierreTareaUna: string;
  /** {n} = cuántas tareas. */
  cierreTareasVarias: string;
  cierreSinTareas: string;
  cierreFinal: string;

  /* --- la ficha del pie --- */
  paraElArchivo: string;
  numTuNumero: string;
  numPorDentro: string;
  numPorFuera: string;
  numConsciencia: string;
  numPorCerrar: string;
  numConQueSalda: string;
  numHilo: string;
  pieLema: string;

  /** La conjunción de una enumeración: «1, 4 y 7». */
  y: string;

  /* --- la hoja de empresa --- */
  empresaTitulo: string;
  empValorNombre: string;
  empValorNombrePie: string;
  empEsencia: string;
  empEsenciaPie: string;
  empEgo: string;
  empEgoPie: string;
  empCifras: string;
  empCifrasPie: string;
  empLetraALetra: string;
  empCaminoOrigen: string;
  /** {n} = el número del arcano. */
  empArcano: string;
  empDiasFuerza: string;
  empDiasFuerzaPie: string;
  empImportante: string;
  empComoVibra: string;
  /** {n} = el valor del nombre. */
  empComoVibraTexto: string;
  empDentroFuera: string;
  /** {e} = esencia, {g} = ego, {cifras} = el añadido de abajo o nada. */
  empDentroFueraTexto: string;
  /** {n} = lo que suman las cifras escritas en el nombre. */
  empDentroFueraCifras: string;
  empHaciaDonde: string;
  /** {carta} = el arcano de origen. */
  empHaciaDondeTexto: string;
  empCuandoMover: string;
  /** {dias} = la lista ya montada con el separador de abajo. */
  empCuandoMoverTexto: string;
  /** Cómo se encadenan los días: en español «7, el 16, el 25». */
  separadorDias: string;
  empPieLema: string;
};

export type Diccionario = {
  codigo: Idioma;
  /** Para `toLocaleDateString`. El portugués es de PORTUGAL: es donde está la
   *  clientela de Iris. Si algún día pesa más Brasil, se cambia aquí a `pt-BR`
   *  y con eso basta para las fechas. */
  locale: string;
  hoja: CopiaHoja;
  /** Los 22 arcanos. El NOMBRE no se traduce palabra a palabra: se usa el que
   *  esa carta ya tiene en cada tradición. */
  arcanos: Record<number, { nombre: string; lema: string; texto: string }>;
  /** La lectura de cada cifra, 0 a 9. De aquí sale lo que dice un número. */
  numerologia: Record<number, { pos: string; neg: string }>;
  /** El tipo de estructura energética, 2 a 10. */
  estructuras: Record<number, string>;
  /** Los diez portales de aprendizaje. */
  tareas: Record<number, { nombre: string; comoSeTrabaja: string }>;
  /** Los diez planos de consciencia. */
  planos: Record<number, { nombre: string; texto: string }>;
  /** Los ciclos vitales, por el nombre con el que salen del motor. */
  ciclos: Record<string, string>;
  /** Las turbulencias, por el nombre con el que salen del motor. */
  turbulencias: Record<string, string>;
  /** Los números de los apuntes que puede pedir la hoja: el kármico y el lema
   *  de vida, y las partes por las que se leen cuando no figuran enteros. */
  numeros: Record<number, string>;
};
