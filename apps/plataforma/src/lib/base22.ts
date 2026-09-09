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
 * Lo formuló el numerólogo canadiense KRIS HADAR en «La numérologie à 22
 * nombres, T.1 — La connaissance de l'être» (Éditions de Mortagne, 1990). De
 * ahí pasó a las escuelas francófonas y de éstas a las hispanohablantes, y por
 * eso las siglas que se siguen usando en español son francesas: PP, NE, QE,
 * QS, RH, PES, CIS, CES, NR, NF.
 *
 * ---------------------------------------------------------------------------
 * LA ESTRUCTURA, EN DOS FRASES — ES LO QUE HAY QUE ENTENDER
 * ---------------------------------------------------------------------------
 * La mitad de arriba (LO SOCIAL) se construye SUMANDO día, mes y año. La mitad
 * de abajo —«El Espejo», o «La Máscara»— se construye RESTANDO exactamente los
 * mismos pares, mayor menos menor. Cada casilla de defensa es el reflejo
 * aritmético de su casilla social: el nudo de dolor es el nudo emocional con
 * el signo cambiado, la huida es el emersor con el signo cambiado.
 *
 * En medio, la familia: día = la madre, mes = el Yo, año = el padre.
 *
 * ---------------------------------------------------------------------------
 * LO QUE ESTÁ CONFIRMADO Y LO QUE NO — LÉASE ANTES DE TOCAR NADA
 * ---------------------------------------------------------------------------
 *
 * Este archivo distingue tres estados en cada posición, y esa distinción es lo
 * más importante que hay aquí dentro:
 *
 *   CONFIRMADO    la fórmula reproduce, número a número, la tabla que Iris
 *                 tiene hecha a mano, Y ADEMÁS hay fuente escrita publicada
 *                 que la enuncia.
 *   RECONSTRUIDO  la fórmula reproduce la tabla de Iris, pero ninguna fuente
 *                 accesible la enuncia por escrito. Es una reconstrucción
 *                 matemática: encaja al 100 % y es coherente con la regla
 *                 general del Espejo («se resta, mayor menos menor, 0 = 22»),
 *                 pero no está publicada. Son las seis casillas de defensa.
 *   PENDIENTE     no se sabe. No calcula, y en pantalla sale marcada en rojo.
 *
 * Una posición PENDIENTE no es un descuido: es una promesa de no inventar. El
 * día que alguien rellene una fórmula a ojo para «dejarlo terminado», esta
 * plataforma empieza a entregar estudios falsos a gente que ha pagado, y eso no
 * se nota hasta que es tarde. Si no se sabe, se queda en rojo.
 *
 * Y RECONSTRUIDO tampoco se disfraza de confirmado. En la pantalla se dice, con
 * esas palabras, que esa casilla cuadra con la tabla pero no tiene fuente. Es
 * la diferencia entre una escuela y un adivino.
 *
 * ---------------------------------------------------------------------------
 * LOS DOS RIESGOS QUE QUEDAN ABIERTOS
 * ---------------------------------------------------------------------------
 * 1. En la tabla de prueba DÍA = MES = 1. Eso hace matemáticamente
 *    indistinguibles «día» de «mes» en seis casillas (nudo emocional,
 *    comportamiento externo social, búsqueda espiritual, nudo de dolor,
 *    comportamiento exterior de defensa y, de rebote, madre/Yo). La elección
 *    día/mes de este archivo está tomada de FUENTE ESCRITA, no de la tabla.
 *    Una segunda tabla resuelta de alguien cuyo día y mes NO coincidan cerraría
 *    esto del todo. Es lo único que conviene pedirle a Iris.
 * 2. Las seis fórmulas del Espejo no tienen fuente literal (ver arriba).
 *
 * ---------------------------------------------------------------------------
 * LA REDUCCIÓN
 * ---------------------------------------------------------------------------
 * Se reduce SUMANDO LAS CIFRAS hasta caer en 1..22, no restando 22. Está
 * comprobado con la tabla de Iris: la búsqueda emocional le da 39, y en su
 * tabla figura un 12 (3+9). Restando 22 habría dado 17.
 *
 * Y el AÑO se reduce a ≤22, NO a un dígito. Varias webs españolas dicen «el año
 * reducido a un solo dígito»; es un calco descuidado del vocabulario de base 9
 * y la tabla lo desmiente: 1953 → 1+9+5+3 = 18, y en la tabla el mensaje del
 * padre es 18, no 9.
 *
 * No hay números maestros en base 22. El 11 y el 22 están dentro del rango de
 * trabajo, así que nunca hay ocasión de reducirlos: la excepción de base 9 aquí
 * no aplica y no se implementa.
 */

/** Los tres números de los que sale todo: día, mes y año de nacimiento. */
export type BaseNacimiento = { dia: number; mes: number; anio: number };

/** Cuánto nos fiamos de cada fórmula. Ver la cabecera. */
export type Certeza = "confirmado" | "reconstruido" | "pendiente";

/** En qué mitad de la carta cae. Es lo que ordena la lectura entera. */
export type Mitad = "familia" | "social" | "espejo";

export type Posicion = {
  k: string;
  /** Como lo llama la tabla. */
  nombre: string;
  /** El nombre de una palabra, para cuando la pantalla es estrecha y el largo
   *  no cabe. En el móvil es lo único que se escribe debajo del círculo. */
  corto?: string;
  /** La sigla francesa, que es la que se usa en clase. */
  sigla?: string;
  /** Dónde cae en la rejilla. Leído del diagrama de Iris. */
  fila: number;
  col: number;
  mitad: Mitad;
  certeza: Certeza;
  /** De dónde sale, dicho con palabras. Es lo que se enseña en el modo escuela. */
  de?: string;
  /** La cuenta. Si falta, la posición todavía no calcula. */
  calcula?: (b: BaseNacimiento, ya: Record<string, number>) => number;
  /** Qué significa esta posición. */
  significado?: string;
  /** La advertencia concreta de esta casilla, si la tiene. Sale en pantalla. */
  aviso?: string;
  /** Con qué otras posiciones se une por una línea en el dibujo. */
  une?: string[];
};

/**
 * Reducir a 1..22 sumando las cifras.
 *
 * El 0 no existe en esta baraja —no hay arcano 0 en el recuento de 22— así que
 * un 0 se lee como 22. Es la misma regla que usan las fuentes para el número de
 * resistencia cuando la resta da cero, y la tabla de Iris la confirma: su
 * comportamiento interior de defensa sale de |1 − 1| = 0 y en la tabla pone 22.
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

/**
 * La resta encadenada del número de resistencia.
 *
 * «Primero el nº más alto menos el 2º más alto; el resultado, restado con el
 * que queda, el mayor del menor.» Siempre en positivo, y un 0 se lee como 22.
 * Comprobado con la tabla: (18, 1, 1) → 18 − 1 = 17 → |17 − 1| = 16, y en la
 * tabla pone 16.
 */
function restaEncadenada(a: number, b: number, c: number): number {
  const [x, y, z] = [a, b, c].sort((p, q) => q - p);
  return b22(Math.abs(Math.abs(x - y) - z));
}

/*
 * ============================================================================
 * LAS DIECINUEVE POSICIONES
 * ============================================================================
 *
 * La rejilla, leída del diagrama que mandó Iris:
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
     Las tres de las que cuelga la tabla entera. */
  {
    k: "madre",
    nombre: "Mensaje de la madre",
    corto: "Madre",
    fila: 2,
    col: 1,
    mitad: "familia",
    certeza: "confirmado",
    de: "El día de nacimiento",
    calcula: (b) => b.dia,
    significado:
      "El número del alma: cómo es la persona por dentro, antes de actuar. Va ligado a la madre —la Luna, cuyo recorrido marca el día dentro del mes—, que es quien acoge y encuadra al niño. Se lee como el mensaje que viene del lado materno: el proyecto, el mandato y las expectativas que la persona trae incorporados sin haberlos elegido.",
    une: ["yo", "resistencia", "comportIntSocial", "comportIntDefensa"],
  },
  {
    k: "yo",
    nombre: "El Yo",
    corto: "Yo",
    fila: 2,
    col: 2,
    mitad: "familia",
    certeza: "confirmado",
    de: "El mes de nacimiento",
    calcula: (b) => b.mes,
    significado:
      "La identidad y el carácter nuclear: el Yo virgen del recién nacido, lo que la persona es antes de que la vida la moldee. Ocupa el sitio del niño entre el padre y la madre, y por eso en la tabla está físicamente entre los dos. Es el punto de referencia desde el que se leen todas las demás casillas.",
    une: ["madre", "padre", "nudoEmocional", "nudoDolor"],
  },
  {
    k: "padre",
    nombre: "Mensaje del padre",
    corto: "Padre",
    fila: 2,
    col: 3,
    mitad: "familia",
    certeza: "confirmado",
    de: "El año de nacimiento, reducido a 22 o menos (1953 → 1+9+5+3 = 18)",
    calcula: (b) => b.anio,
    significado:
      "La energía que rige la vida de la persona y la fuerza interna de la que dispone. Corresponde al padre —el Sol, cuyo recorrido marca el año—. Algunas escuelas lo llaman número del don o regalo divino: el poder con el que se viene equipado. Como mensaje del padre se lee como el permiso o la prohibición que viene de la línea paterna.",
    une: ["yo", "persProfunda", "comportExtSocial", "comportExtDefensa"],
  },

  /* -------------------------------------------------------- LO SOCIAL --
     Todo lo de esta mitad se SUMA. */
  {
    k: "persProfunda",
    nombre: "Personalidad profunda",
    corto: "PP",
    sigla: "PP",
    fila: 2,
    col: 4,
    mitad: "social",
    certeza: "confirmado",
    de: "Día + mes + año",
    calcula: (b) => b22(b.dia + b.mes + b.anio),
    significado:
      "El pilar más importante de la carta: lo que la persona es en el fondo y ha venido a ser. Es la esencia, con sus deseos internos, sus miedos y sus habilidades escondidas. Funciona como el mapa de la vida, y es el número que más veces se combina con otros —de él salen las tres búsquedas—. Si sólo se pudiera leer una casilla, sería ésta.",
    une: ["padre", "busqEspiritual", "busqEmocional", "busqArmonia", "busqSalida"],
  },
  {
    k: "nudoEmocional",
    nombre: "Nudo emocional",
    corto: "NE",
    sigla: "NE",
    fila: 1,
    col: 2,
    mitad: "social",
    certeza: "confirmado",
    de: "Día + año — la madre y el padre, sin el Yo en medio",
    calcula: (b) => b22(b.dia + b.anio),
    significado:
      "El punto frágil: por dónde le atraviesa la emoción a esta persona. Dice cómo vibra emocionalmente y, muy en concreto, cómo siente —o cómo no siente— el amor de los demás. Es la herida por la que se entra en terapia. Une a la madre con el padre, es decir, el nudo se forma en la relación entre las dos figuras. Cuando está bloqueado, se entra por la búsqueda emocional.",
    une: ["yo", "persExtSocial", "busqEmocional", "comportIntSocial", "comportExtSocial"],
  },
  {
    k: "busqEmocional",
    nombre: "Búsqueda emocional",
    corto: "QE",
    sigla: "QE",
    fila: 1,
    col: 4,
    mitad: "social",
    certeza: "confirmado",
    de: "Personalidad profunda + nudo emocional",
    calcula: (_b, ya) => b22(ya.persProfunda + ya.nudoEmocional),
    significado:
      "La puerta de entrada a las emociones cuando el nudo emocional está cerrado. Dice qué necesita la persona por dentro y por dónde hay que entrarle: es el «cómo se le habla» a alguien que tiene la emoción bloqueada. Nace de sumar lo que es en esencia con su punto frágil, así que señala qué recurso propio puede mover frente a su propia herida.",
    une: ["nudoEmocional", "persProfunda", "busqArmonia"],
  },
  {
    k: "comportIntSocial",
    nombre: "Comportamiento interno social",
    corto: "CIS",
    sigla: "CIS",
    fila: 1,
    col: 1,
    mitad: "social",
    certeza: "confirmado",
    de: "Día + mes — la madre y el Yo",
    calcula: (b) => b22(b.dia + b.mes),
    significado:
      "Cómo se comporta la persona dentro de su familia y de su círculo íntimo. Y un matiz que las fuentes repiten: no es sólo cómo se comporta, es cómo le está PROPUESTO comportarse en su familia. No es conducta, es papel asignado. Va ligado a la madre, porque es a partir de ella como uno se construye por dentro. Es el registro de casa.",
    une: ["emersor", "madre", "nudoEmocional", "persExtSocial"],
  },
  {
    k: "comportExtSocial",
    nombre: "Comportamiento externo social",
    corto: "CES",
    sigla: "CES",
    fila: 1,
    col: 3,
    mitad: "social",
    certeza: "confirmado",
    de: "Mes + año — el Yo y el padre",
    calcula: (b) => b22(b.mes + b.anio),
    significado:
      "Cómo es la persona fuera de su familia: con los amigos, en el trabajo, cuando sale, de vacaciones. Va ligado al padre y representa lo que las escuelas llaman el nido ampliado: el círculo que ya no es la casa pero todavía no es la vida profesional formal. Junto con el comportamiento interno, alimenta la personalidad externa.",
    une: ["nudoEmocional", "padre", "busqEmocional", "persExtSocial"],
  },
  {
    k: "persExtSocial",
    nombre: "Personalidad externa social-profesional",
    corto: "PES",
    sigla: "PES",
    fila: 0,
    col: 2,
    mitad: "social",
    certeza: "confirmado",
    de: "Comportamiento interno social + comportamiento externo social",
    calcula: (_b, ya) => b22(ya.comportIntSocial + ya.comportExtSocial),
    significado:
      "La identidad exterior y el tono profesional: quién es la persona cuando está fuera, cómo se afirma en sociedad, qué papel juega trabajando. Es la síntesis de las dos conductas sociales, y por eso funciona como la cara que se le enseña al mundo. Es la contraparte de la personalidad profunda: buena parte del trabajo terapéutico consiste en armonizar el ser con el parecer.",
    une: ["emersor", "nudoEmocional", "busqArmonia", "comportIntSocial", "comportExtSocial"],
  },
  {
    k: "busqArmonia",
    nombre: "Búsqueda de armonía",
    corto: "RH",
    sigla: "RH",
    fila: 0,
    col: 4,
    mitad: "social",
    certeza: "confirmado",
    de: "Personalidad externa social + personalidad profunda",
    calcula: (_b, ya) => b22(ya.persExtSocial + ya.persProfunda),
    significado:
      "Lo que le recarga las pilas. Las fuentes lo llaman literalmente «el medicamento»: son las características que la persona necesita encontrar EN LOS DEMÁS para estar bien consigo misma. Marca qué gente y qué clima le devuelven el equilibrio, y por tanto qué le falta cuando está agotada o irritable. Al nacer del parecer más el ser, es el punto donde los dos se reconcilian.",
    une: ["persExtSocial", "busqEmocional", "persProfunda"],
  },
  {
    k: "busqEspiritual",
    nombre: "Búsqueda espiritual",
    corto: "QS",
    sigla: "QS",
    fila: 2,
    col: 5,
    mitad: "social",
    certeza: "confirmado",
    de: "Mes + personalidad profunda — el Yo puesto al servicio de la esencia",
    calcula: (b, ya) => b22(b.mes + ya.persProfunda),
    significado:
      "Cómo se dirige la persona para expresar lo que piensa de forma natural y abrir su espíritu. Es su vía de acceso al conocimiento y al sentido. Las fuentes la describen en clave muy práctica: cuando el sistema se atasca, ésta es la palanca que lo desatasca —volver al estudio, a un libro, a un seminario, a lo que le apasiona intelectualmente—.",
    une: ["persProfunda"],
  },
  {
    k: "resistencia",
    nombre: "Número de resistencia",
    corto: "NR",
    sigla: "NR",
    fila: 2,
    col: 0,
    mitad: "social",
    certeza: "confirmado",
    de: "Día, mes y año restados de mayor a menor, encadenando (18 − 1 = 17; 17 − 1 = 16)",
    calcula: (b) => restaEncadenada(b.dia, b.mes, b.anio),
    significado:
      "El nivel de aguante: cuánto puede soportar la persona antes de romperse, y por dónde rompe. Es la contraparte exacta de la personalidad profunda —donde aquélla suma los tres datos de la fecha, ésta los resta—, así que expresa la tensión entre madre, Yo y padre en vez de su síntesis. Es una casilla bisagra: alimenta el emersor arriba y el número de huida abajo.",
    une: ["madre", "comportIntSocial", "comportIntDefensa", "emersor", "huida"],
  },
  {
    k: "emersor",
    nombre: "Emersor",
    corto: "Emersor",
    sigla: "NE·",
    fila: 0,
    col: 0,
    mitad: "social",
    certeza: "confirmado",
    de: "Número de resistencia + personalidad externa social",
    calcula: (_b, ya) => b22(ya.resistencia + ya.persExtSocial),
    significado:
      "El recurso de emergencia: lo que le permite a la persona salir a flote cuando ya lo ha intentado todo y nada ha funcionado. Las fuentes lo llaman «el último pilar antes de caer en la máscara». Si el emersor funciona, la persona se recompone; si falla, se desploma a la mitad de abajo de la tabla y empiezan la defensa y la huida. Es la casilla clave para aconsejar en crisis.",
    une: ["comportIntSocial", "persExtSocial", "resistencia"],
  },

  /* --------------------------------------------------------- EL ESPEJO --
     La mitad de la máscara. Aquí todo se RESTA: mayor menos menor, y un 0 se
     lee como 22. Cada casilla es el reflejo aritmético de su casilla social.

     LAS SEIS SON RECONSTRUCCIÓN. Cuadran al cien por cien con la tabla de
     Iris, y el principio general («el espejo se calcula restando») sí está
     documentado, pero ninguna fuente accesible enuncia la fórmula concreta de
     cada casilla: la lección que las explicaría está detrás de un muro de pago.
     Por eso salen marcadas en pantalla y no se venden como confirmadas. */
  {
    k: "nudoDolor",
    nombre: "Nudo de dolor",
    corto: "Dolor",
    fila: 3,
    col: 2,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Día − año, el mayor menos el menor — el mismo par que el nudo emocional, pero restado",
    calcula: (b) => b22(Math.abs(b.dia - b.anio)),
    significado:
      "La contraparte exacta del nudo emocional: el mismo par —madre y padre—, restado en vez de sumado. Ocupa el centro geométrico de la carta, y las escuelas leen eso como que todo el sistema pivota sobre él. Es el dolor estructural: la herida antigua, casi siempre de origen familiar, alrededor de la cual se organizan todas las defensas de abajo. Donde el nudo emocional dice cómo siente, éste dice qué le duele.",
    aviso:
      "Algunas escuelas la llaman «nudo de defensa» en vez de nudo de dolor. Parece ser la misma casilla, pero no hay tabla de equivalencias publicada.",
    une: ["yo", "persExtDefensa"],
  },
  {
    k: "comportIntDefensa",
    nombre: "Comportamiento interior de defensa",
    corto: "CID",
    sigla: "CID",
    fila: 4,
    col: 1,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Día − mes, el mayor menos el menor — el reflejo del comportamiento interno social",
    calcula: (b) => b22(Math.abs(b.dia - b.mes)),
    significado:
      "Cómo se comporta la persona dentro de su familia y de su círculo íntimo CUANDO ESTÁ MAL. Donde el comportamiento interno social describe la conducta doméstica normal, ésta describe la conducta doméstica bajo presión: el repliegue, la coraza o la reacción que aparece en casa cuando uno se siente atacado. Se activa en el eje madre-Yo.",
    une: ["madre", "persExtDefensa", "huida", "resistencia"],
  },
  {
    k: "comportExtDefensa",
    nombre: "Comportamiento exterior de defensa",
    corto: "CED",
    sigla: "CED",
    fila: 4,
    col: 3,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Mes − año, el mayor menos el menor — el reflejo del comportamiento externo social",
    calcula: (b) => b22(Math.abs(b.mes - b.anio)),
    significado:
      "Cómo se comporta la persona fuera de la familia —con amigos, en el trabajo, en público— cuando está en dificultad. Es la protección en el terreno social ampliado: la retirada, la agresividad, la fachada o la sobreadaptación que salen ante los demás cuando no puede sostener su registro de siempre. Sale del eje Yo-padre, el mundo de lo público y lo laboral.",
    une: ["padre", "persExtDefensa", "busqSalida"],
  },
  {
    k: "persExtDefensa",
    nombre: "Personalidad exterior de defensa",
    corto: "PED",
    sigla: "PED",
    fila: 4,
    col: 2,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Comportamiento interior de defensa − comportamiento exterior de defensa, el mayor menos el menor",
    calcula: (_b, ya) => b22(Math.abs(ya.comportIntDefensa - ya.comportExtDefensa)),
    significado:
      "La cara que la persona pone ante el mundo cuando está en modo defensa: la máscara propiamente dicha, el personaje que se fabrica para que los demás no vean que está mal. Igual que la personalidad externa social sintetiza las dos conductas sociales, ésta sintetiza las dos de defensa, pero por diferencia. Es la casilla que explica el desfase entre lo que alguien aparenta y lo que le pasa.",
    aviso:
      "Es la única casilla cuyo valor NO figura en la tabla de Iris: no se pudo comprobar de frente. Su valor queda fijado por tres caminos que coinciden —la fórmula del espejo, los numeritos del diagrama y el hecho de que sólo ese valor hace cuadrar a la vez la búsqueda de salida y la huida—, pero conviene que Iris lea ese círculo y lo confirme.",
    une: ["nudoDolor", "comportIntDefensa", "comportExtDefensa"],
  },
  {
    k: "busqSalida",
    nombre: "Búsqueda de salida exterior",
    corto: "Salida",
    fila: 4,
    col: 4,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Personalidad profunda − personalidad exterior de defensa, el mayor menos el menor",
    calcula: (_b, ya) => b22(Math.abs(ya.persProfunda - ya.persExtDefensa)),
    significado:
      "Por dónde busca salir la persona cuando ya está instalada en la defensa: a qué se agarra, dónde busca alivio, antes de llegar al extremo de la huida. Se construye enfrentando la esencia con la máscara, o sea, mide la distancia entre lo que uno es y el personaje que ha montado. Esa distancia es justo lo que sale a buscar fuera.",
    aviso: "Otras escuelas la llaman «nudo de escape» o «búsqueda de escape».",
    une: ["comportExtDefensa", "persProfunda"],
  },
  {
    k: "huida",
    nombre: "Número de huida",
    corto: "Huida",
    sigla: "NF",
    fila: 5,
    col: 1,
    mitad: "espejo",
    certeza: "reconstruido",
    de: "Número de resistencia − personalidad exterior de defensa, el mayor menos el menor",
    calcula: (_b, ya) => b22(Math.abs(ya.resistencia - ya.persExtDefensa)),
    significado:
      "El fondo del pozo de la carta: por dónde huye la persona cuando el aguante ya no da más y sólo queda la máscara. Es la conducta de escape extrema —desaparecer, la fuga hacia adelante, el hundimiento, la adicción, el abandono—, según el arcano que caiga. Es la imagen especular del emersor: aquél suma para salir a flote, éste resta para hundirse. Leídos juntos dicen las dos salidas de una crisis: emerger o huir.",
    une: ["comportIntDefensa", "resistencia"],
  },
];

/*
 * ============================================================================
 * LA CUENTA, PARA PODER ENSEÑARLA
 * ============================================================================
 *
 * Cada casilla sabe hacer su número, pero para una escuela eso no basta: hay
 * que poder ENSEÑAR la cuenta, con sus sumandos, su resultado bruto y su
 * reducción. «19 + 20 = 39 → 12» explica en una línea lo que tres párrafos no.
 *
 * Por eso aquí se declara de qué sale cada casilla y con qué operación. Es
 * información de presentación —la cuenta de verdad la hace `calcula`— y por
 * eso está aparte: repetirla dentro de cada posición invita a que las dos se
 * separen sin que nadie se entere.
 *
 * Y PARA QUE NO SE SEPAREN, HAY UNA COMPROBACIÓN. El script de verificación
 * rehace cada casilla a partir de este mapa y exige que dé lo mismo que
 * `calcula`. Si alguien toca una fórmula y se olvida de este mapa, salta.
 */
type Desglose = { de: string[]; op: "+" | "−" | "" };

const CUENTA: Record<string, Desglose> = {
  madre: { de: ["dia"], op: "" },
  yo: { de: ["mes"], op: "" },
  padre: { de: ["anio"], op: "" },
  persProfunda: { de: ["dia", "mes", "anio"], op: "+" },
  nudoEmocional: { de: ["dia", "anio"], op: "+" },
  busqEmocional: { de: ["persProfunda", "nudoEmocional"], op: "+" },
  comportIntSocial: { de: ["dia", "mes"], op: "+" },
  comportExtSocial: { de: ["mes", "anio"], op: "+" },
  persExtSocial: { de: ["comportIntSocial", "comportExtSocial"], op: "+" },
  busqArmonia: { de: ["persExtSocial", "persProfunda"], op: "+" },
  busqEspiritual: { de: ["mes", "persProfunda"], op: "+" },
  resistencia: { de: ["dia", "mes", "anio"], op: "−" },
  emersor: { de: ["resistencia", "persExtSocial"], op: "+" },
  nudoDolor: { de: ["dia", "anio"], op: "−" },
  comportIntDefensa: { de: ["dia", "mes"], op: "−" },
  comportExtDefensa: { de: ["mes", "anio"], op: "−" },
  persExtDefensa: { de: ["comportIntDefensa", "comportExtDefensa"], op: "−" },
  busqSalida: { de: ["persProfunda", "persExtDefensa"], op: "−" },
  huida: { de: ["resistencia", "persExtDefensa"], op: "−" },
};

/** Cómo se llama cada pieza de la cuenta cuando se escribe en pantalla. */
const NOMBRE_PIEZA: Record<string, string> = { dia: "día", mes: "mes", anio: "año" };

export type Paso = { k: string; label: string; valor: number };
/** La cuenta de una casilla, lista para pintar: piezas, signo, bruto y final. */
export type Cuenta = { pasos: Paso[]; op: "+" | "−" | ""; bruto: number; valor: number; redujo: boolean };

/**
 * Rehacer la cuenta de una casilla a partir del mapa de arriba.
 *
 * Con la resta se ordena de mayor a menor y se encadena, que es la regla del
 * sistema. `bruto` es lo que da antes de reducir: es justo lo que hay que
 * enseñar, porque la reducción («39 → 12») es la parte que la gente falla.
 */
export function cuentaDe(k: string, tabla: Calculada[], base: BaseNacimiento): Cuenta | null {
  const d = CUENTA[k];
  if (!d) return null;
  const valorDe = (pieza: string): number | null => {
    if (pieza === "dia") return base.dia;
    if (pieza === "mes") return base.mes;
    if (pieza === "anio") return base.anio;
    return tabla.find((p) => p.k === pieza)?.valor ?? null;
  };
  const pasos: Paso[] = [];
  for (const pieza of d.de) {
    const v = valorDe(pieza);
    if (v === null) return null;
    pasos.push({ k: pieza, label: NOMBRE_PIEZA[pieza] ?? tabla.find((p) => p.k === pieza)?.nombre ?? pieza, valor: v });
  }
  let bruto: number;
  if (d.op === "+") bruto = pasos.reduce((s, p) => s + p.valor, 0);
  else if (d.op === "−") {
    const orden = [...pasos].sort((a, b) => b.valor - a.valor);
    bruto = orden.reduce((acc, p, i) => (i === 0 ? p.valor : Math.abs(acc - p.valor)), 0);
    /* La resta se enseña en el orden en que se hace, que no es el orden en que
       están escritas las piezas: primero la mayor. */
    pasos.length = 0;
    pasos.push(...orden);
  } else bruto = pasos[0].valor;
  const valor = b22(bruto);
  return { pasos, op: d.op, bruto, valor, redujo: valor !== bruto };
}

export type Calculada = Posicion & { valor: number | null; valor9: number | null };

/**
 * Calcular la tabla entera.
 *
 * Primero se reducen los tres datos de la fecha —el año a ≤22, no a un dígito—
 * y a partir de ahí ya se trabaja siempre con los reducidos: es lo que hace que
 * `día + mes + año` dé 20 y no 1955. Después se recorren las posiciones en el
 * orden en que están escritas, y cada una recibe lo ya calculado, así que la
 * búsqueda emocional puede pedir la personalidad profunda sin repetir su cuenta.
 *
 * El orden de la lista NO es casual: una posición sólo puede pedir las que
 * están por encima de ella. Si se mueve una, hay que comprobarlo.
 */
export function baseReducida(b: BaseNacimiento): BaseNacimiento {
  return { dia: b22(b.dia), mes: b22(b.mes), anio: b22(b.anio) };
}

export function calculaBase22(b: BaseNacimiento): Calculada[] {
  const base = baseReducida(b);
  const ya: Record<string, number> = {};
  return POSICIONES.map((p) => {
    let valor: number | null = null;
    if (p.calcula) {
      try {
        valor = p.calcula(base, ya);
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

/**
 * El recuento, para poder decirlo en pantalla sin mentir: cuántas calculan,
 * cuántas de ésas tienen fuente escrita y cuántas son reconstrucción.
 */
export function cuantasCalculan(): {
  listas: number;
  total: number;
  confirmadas: number;
  reconstruidas: number;
} {
  return {
    listas: POSICIONES.filter((p) => p.calcula).length,
    total: POSICIONES.length,
    confirmadas: POSICIONES.filter((p) => p.certeza === "confirmado").length,
    reconstruidas: POSICIONES.filter((p) => p.certeza === "reconstruido").length,
  };
}
