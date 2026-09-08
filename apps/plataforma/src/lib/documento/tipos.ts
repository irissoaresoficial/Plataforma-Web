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

/**
 * UNA FRASE QUE CAMBIA CON EL GÉNERO DE QUIEN LEE.
 *
 * El estudio habla de tú, y en español y en portugués eso tiene terminación:
 * «bienvenida» o «bienvenido», «fuiste nombrada» o «fuiste nombrado». En
 * inglés no la hay, así que vale también una cadena suelta: obligar al inglés
 * a escribir tres veces la misma línea sería inventarse una distinción que ese
 * idioma no hace, y a la primera corrección dos de las tres se quedarían
 * atrás.
 *
 * `n` es el neutro, y no es una tercera terminación: es una vuelta a la frase
 * que no la necesita —«te damos la bienvenida»—. Si un idioma no lo trae se
 * usa el femenino, que es exactamente lo que hacía el estudio antes de esto.
 */
export type ConGenero = string | { f: string; m: string; n?: string };

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

/**
 * Las frases del ESTUDIO COMPLETO: el documento largo, de veintitantos
 * capítulos, que sale del mismo botón que la hoja de una cara.
 *
 * Son la voz de la casa igual que las de `hoja` —los rótulos de cada capítulo,
 * las entradillas que presentan un apartado, las frases que enlazan un dato
 * con el siguiente— y se traducen con el mismo criterio: directas, concretas,
 * sin misticismo. Lo que va DENTRO de cada capítulo son los apuntes, y esos
 * salen de las tablas de más abajo.
 *
 * Las llaves —`{edad}`, `{n}`, `{lista}`— se sustituyen por el dato que toque.
 * Hay que dejarlas tal cual en las traducciones, y se pueden mover de sitio:
 * están puestas donde las pide cada idioma, no donde las pedía el español.
 */
export type CopiaEstudio = {
  /* --- la portada --- */
  portadaPersonal: string;
  portadaEmpresa: string;
  /** Debajo del nombre, donde en una persona va la fecha de nacimiento. */
  portadaSinFecha: string;

  /* --- LAS SECCIONES ---------------------------------------------------
   * Salen arriba a la derecha de cada página. Además deciden dónde empieza
   * hoja nueva: lo que va DELANTE del «·» es la sesión, y dos capítulos de la
   * misma sesión fluyen uno detrás de otro. Al traducir hay que conservar el
   * «·» y que el trozo de delante sea el mismo en los capítulos hermanos, o
   * el documento cambia de paginación. */
  secBienvenida: string;
  secArbol: string;
  secCaminos: string;
  secNumeros: string;
  secAprendizajes: string;
  secSomatizaciones: string;
  secAlma: string;
  secCierre: string;

  /* --- bienvenida --- */
  bienvenidaKicker: string;
  bienvenidaTitulo: ConGenero;
  /** {nombrado} = la frase de aquí abajo, que sí lleva género. */
  bienvenidaLead: string;
  bienvenidaNombrado: ConGenero;
  bienvenidaHabla: string;
  bienvenidaViaje: string;
  bienvenidaMapa: string;
  bienvenidaArbol: string;
  bienvenidaCita: string;

  /* --- el árbol de la vida --- */
  arbolKicker: string;
  arbolTitulo: string;
  arbolIntro: string;
  arbolEdadLabel: string;
  /** {edad}, {tipos} = «espíritu y alma», {destino} = cuándo entra el destino. */
  arbolEdadTurbulencias: string;
  /** {edad} */
  arbolEdadSinTurbulencias: string;

  /* --- los tres caminos --- */
  caminosKicker: string;
  origenTitulo: string;
  /** {edad} = la edad de cambio. */
  origenIntro: string;
  transformacionTitulo: string;
  transformacionIntro: string;
  destinoTitulo: string;
  /** Cuando el destino repite la carta de la transformación. */
  destinoIntroMismaCarta: string;
  destinoIntro: string;
  caminoPareja: string;
  /** {nombre} y {sendero} salen de los apuntes del camino evolutivo. */
  caminoEvolutivo: string;

  /* --- el número de corazón --- */
  corazonKicker: string;
  /** {n} */
  corazonTitulo: string;
  corazonLead: string;
  /** {nombre} + {edad} = {total}. */
  corazonCuenta: string;
  /** {n} = la cifra, {titulo} = cómo la llaman los apuntes. */
  corazonNumero: string;
  /** {partes} = «41 y 23». */
  corazonPartes: string;

  /* --- esencia, ego y días de fuerza --- */
  valoresKicker: string;
  valoresTitulo: string;
  esenciaLabel: string;
  esenciaSinFicha: string;
  egoLabel: string;
  /** {partes} = «41. La fuerza · 23. El talento». */
  egoSinFicha: string;
  fuerzaLabel: string;
  /** {esencia}, {ego}, {valor}, {base}, {primero}. */
  fuerzaTexto: string;

  /* --- la estructura energética --- */
  aprendizajesKicker: string;
  /** {n} = el tipo de estructura. */
  estructuraTitulo: string;

  /* --- los aprendizajes --- */
  aprendizajesTituloVacio: string;
  aprendizajesVacio: string;
  /** {portal}, {veces} = lo de aquí abajo o nada, {nombre}, {numero}. */
  aprendizajeCabecera: string;
  /** {n} = cuántas veces se repite el portal. */
  aprendizajeVeces: string;
  /** {i} de {n}. */
  aprendizajesTitulo: string;
  refHiloRojo: string;
  refNeurosis: string;
  refSanador: string;

  /* --- lo que se somatiza --- */
  somatizacionesKicker: string;
  somatizacionesTitulo: string;
  somatizacionesLead: string;
  /** {n} = el portal, {nombre} = la tarea. */
  somatizacionesPunto: string;
  /** {psico}, {organos}, {fisicas}. */
  somatizacionesFicha: string;

  /* --- la imagen del alma --- */
  almaKicker: string;
  almaTitulo: string;
  almaLead: string;
  almaLabel: string;
  almaTexto: string;
  /** {casilla}, {i} de {n}. */
  bloqueoTitulo: string;
  /** {nombre}, {veces} = lo de aquí abajo o nada, {numero}. */
  bloqueoCabecera: string;
  /** {n} = cuántas veces se repite la casilla. */
  bloqueoVeces: string;

  /* --- el karma --- */
  karmaKicker: string;
  karmaTitulo: string;
  karmaLead: string;
  karmicoLabel: string;
  karmicoTexto: string;
  lemaLabel: string;
  lemaTexto: string;

  /* --- CÓMO SE ROTULA UN NÚMERO SUELTO --------------------------------
   * Cuatro rótulos y no uno con trozos pegados: el número puede venir con una
   * aclaración de dónde sale —«día 8 + mes 2»— o sin ella, y puede figurar en
   * los apuntes o no. Cada combinación es una frase entera, para que cada
   * idioma la ordene como le pida su gramática.
   * {n} = la cifra, {titulo} = cómo la llaman los apuntes, {aclara} = de dónde
   * sale, {partes} = «41 y 23». */
  numeroEnApuntes: string;
  numeroEnApuntesAclara: string;
  numeroSinApuntes: string;
  numeroSinApuntesAclara: string;

  /* --- los números de afinidad --- */
  /** {a} y {b}. */
  afinidadTitulo: string;
  afinidadLead: string;
  /** {dia}, {mes}. */
  afinidadDiaMes: string;
  /** {mes}, {anio}. */
  afinidadMesAnio: string;

  /* --- los ciclos --- */
  ciclosKicker: string;
  ciclosTitulo: string;
  /** {proposito}, {anioUniversal}, {anioPersonal}. */
  ciclosIntro: string;
  etapasTitulo: string;
  /** {edad}, {etapa}. */
  etapasLead: string;
  /** {n}, {desde}, {hasta}, {actual} = lo de aquí abajo o nada. */
  etapaCabecera: string;
  etapaActual: string;
  /** {n} = el año personal. */
  anioTitulo: string;
  /** {n} = el año en curso. */
  anioLabel: string;
  anioSinTexto: string;

  /* --- todos los números juntos --- */
  resumenKicker: string;
  resumenTitulo: string;
  resumenLead: string;
  cifCorazon: string;
  cifCorazonPie: string;
  cifEsencia: string;
  cifEsenciaPie: string;
  cifEgo: string;
  cifEgoPie: string;
  cifEdadCambio: string;
  cifEdadCambioPie: string;
  cifEstructura: string;
  cifEstructuraPie: string;
  cifAlma: string;
  cifAlmaPie: string;
  cifKarmico: string;
  cifKarmicoPie: string;
  cifLema: string;
  cifLemaPie: string;
  cifProposito: string;
  cifPropositoPie: string;
  cifAnio: string;
  /** {n} = el año en curso. */
  cifAnioPie: string;
  resumenCita: string;

  /* --- lo importante, la última página --- */
  cierreKicker: string;
  cierreTitulo: string;
  cierreLead: string;
  cHaciaDondeLabel: string;
  /** {carta}, {lema}. */
  cHaciaDondeTexto: string;
  cQueTrabajarLabel: string;
  cQueTrabajarNada: string;
  /** {n} = 1, {lista} = la tarea. */
  cQueTrabajarUno: string;
  /** {n}, {lista}. */
  cQueTrabajarVarios: string;
  /** {n} = el portal, cuando la tarea no tiene nombre en los apuntes. */
  cPortalSinNombre: string;
  cQueDesatascarLabel: string;
  cQueDesatascarNada: string;
  /** {lista} */
  cQueDesatascarTexto: string;
  /** {n} = la casilla, cuando el plano no tiene nombre en los apuntes. */
  cCasillaSinNombre: string;
  cQueCerrarLabel: string;
  /** {karmico}, {lema}. */
  cQueCerrarTexto: string;
  cDondeEstasLabel: string;
  /** {anioUniversal}, {anioPersonal}, {proposito}. */
  cDondeEstasTexto: string;
  cCuandoMoverLabel: string;
  /** {dias} = la lista ya montada con `separadorDias`. */
  cCuandoMoverTexto: string;
  cierreCita: string;

  /* --- LO QUE SALE DENTRO DE LOS DIBUJOS ------------------------------- */
  /** Los tres caminos, al lado del árbol. */
  digOrigen: string;
  digTransformacion: string;
  digDestino: string;
  /** {edad} = la edad de cambio. */
  digOrigenRango: string;
  digTransformacionRango: string;
  /** {edad} = cuándo entra el destino. */
  digDestinoRango: string;
  /** La escalera de los diez portales: qué cruza con qué. */
  digEje: string;
  digPlano: string;
  digEnTension: string;
  digLibre: string;
  /** La tabla de la imagen del alma. */
  digEspiritu: string;
  digAlma: string;
  digMateria: string;
  digEvolucion: string;
  /** {n} = la casilla donde cae el 0. */
  digProyeccion: string;
  /** La tabla de las cuentas abiertas. */
  digDia: string;
  digMes: string;
  digAnio: string;
  digCuenta: string;
  digKarmico: string;
  digLema: string;
  digSanador: string;
  digAfinidad: string;
  digVibraciones: string;
  /** Los ciclos vitales. {desde}, {hasta}. */
  digRango: string;
  /** El último ciclo, que no tiene final. {desde}. */
  digRangoFinal: string;
  /** Igual, pero para las realizaciones, que en español lo dicen sin «años». */
  digRangoAbierto: string;
  /** {n} = cuál de las cuatro. */
  digRealizacion: string;
  /** Los tres desafíos salen del motor con su nombre en español; aquí está su
   *  traducción, indexada por ese nombre. */
  digDesafios: Record<string, string>;
  /** Y sus tramos, igual. */
  digRangosDesafio: Record<string, string>;
  /** LOS NOMBRES DE LAS DIEZ SEFIROT, tal como se escriben en el árbol.
   *  Indexados por la grafía española, que es la que trae la geometría. El
   *  español pone J donde el portugués y el inglés ponen Ch —Jesed / Chesed,
   *  Netsaj / Netzach—, y los textos de los apuntes ya usan esa segunda grafía:
   *  si el dibujo se queda con la primera, el mismo documento nombra la misma
   *  sefirá de dos maneras. */
  sefirot: Record<string, string>;
  /** Los dos polos de una lectura. */
  digEnNegativo: string;
  digEnPositivo: string;
  /** Los bloques de tensión y liberación de un número. {n} = la cifra. */
  refTensa: string;
  refLibera: string;
  refSinFicha: string;

  /* --- EL ESTUDIO DE UNA EMPRESA -------------------------------------- */
  empSecNumeros: string;
  empSecEsencia: string;
  empSecEgo: string;
  empSecOrigen: string;
  empNombreKicker: string;
  empNombreTitulo: string;
  /** {nombre}, {n}. */
  empLead: string;
  empSoloNombre: string;
  empCifValor: string;
  empCifValorPie: string;
  empCifEsencia: string;
  empCifEsenciaPie: string;
  empCifEgo: string;
  empCifEgoPie: string;
  empCifCifras: string;
  empCifCifrasPie: string;
  empCifOrigen: string;
  empComoSeCuenta: string;
  /** {palabras}, {total} = lo de abajo o nada, {esencia}, {ego}, {cifras} =
   *  el añadido de abajo o nada. */
  empCuenta: string;
  /** {palabra} vale {n}. */
  empCuentaPalabra: string;
  /** Cómo se encadenan: en español «CASA vale 10; VERDE vale 33». */
  empCuentaSeparador: string;
  /** {n} = el valor del nombre entero, sólo si hay más de una palabra. */
  empCuentaTotal: string;
  /** {cifras}, {esencia}, {ego}, {valor}. */
  empCuentaCifras: string;
  empValorKicker: string;
  /** {n} */
  empValorTitulo: string;
  empValorTexto: string;
  empEsenciaKicker: string;
  /** {n} */
  empEsenciaTitulo: string;
  empEsenciaTexto: string;
  empEgoKicker: string;
  /** {n} */
  empEgoTitulo: string;
  empEgoTexto: string;
  /** {n} = el número del arcano. */
  empArcanoKicker: string;
  empOrigenLabel: string;
  /** {valor}, {sumaCifras}, {resta}, {division}, {mas1}, {arcano}. */
  empOrigenCuenta: string;
  empOrigenNota: string;
  empCierreKicker: string;
  empCierreTitulo: string;
  empCierreLead: string;
  empCVibraLabel: string;
  /** {n} */
  empCVibraTexto: string;
  empCDentroFueraLabel: string;
  /** {esencia}, {ego}. */
  empCDentroFueraTexto: string;
  empCHaciaDondeLabel: string;
  /** {carta}, {lema}. */
  empCHaciaDondeTexto: string;
  empCCuandoMoverLabel: string;
  /** {dias} */
  empCCuandoMoverTexto: string;
  empCierreCita: string;
};

export type Diccionario = {
  codigo: Idioma;
  /** Para `toLocaleDateString`. El portugués es de PORTUGAL: es donde está la
   *  clientela de Iris. Si algún día pesa más Brasil, se cambia aquí a `pt-BR`
   *  y con eso basta para las fechas. */
  locale: string;
  hoja: CopiaHoja;
  /** Las frases del estudio completo. Las del cliente y las de la empresa: es
   *  el mismo documento, sólo que de una empresa hay menos que decir. */
  estudio: CopiaEstudio;
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
