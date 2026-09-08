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
import type { CopiaEstudio, CopiaHoja, Diccionario } from "./tipos";

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
    "A los {edad} empiezan {anios} años movidos en {tipos}: el cambio de camino no es de golpe, se cuece durante ese tiempo.",

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

/**
 * EL ESTUDIO COMPLETO.
 *
 * Todo esto vivía suelto dentro de `lib/estudio.ts`, mezclado con el código
 * que arma los capítulos: rótulos, entradillas y frases de enlace escritas a
 * pelo entre corchetes. Salían en español dentro de los estudios en portugués
 * y en inglés, y no había forma de corregir una coma sin tocar el programa.
 *
 * Está copiado LETRA A LETRA de donde estaba. Si algo aquí suena raro, sonaba
 * raro antes: esto no es el sitio para arreglarlo, porque el español que se
 * imprime hoy tiene que seguir siendo el mismo mañana.
 */
const ESTUDIO: CopiaEstudio = {
  portadaPersonal: "Estudio de Kábala personal",
  portadaEmpresa: "Estudio de Kábala empresarial",
  portadaSinFecha: "Leído del nombre",

  secBienvenida: "Bienvenida",
  secArbol: "Árbol de la Vida",
  secCaminos: "Sesión 1 · Caminos",
  secNumeros: "Sesión 1 · Números",
  secAprendizajes: "Sesión 2 · Aprendizajes",
  secSomatizaciones: "Sesión 2 · Somatizaciones",
  secAlma: "Sesión 3 · Imagen del alma",
  secCierre: "Cierre",

  bienvenidaKicker: "Tu mapa de luz",
  bienvenidaTitulo: {
    f: "Bienvenida a tu estudio",
    m: "Bienvenido a tu estudio",
    n: "Te damos la bienvenida a tu estudio",
  },
  bienvenidaLead:
    "Acepta este estudio no como un diagnóstico rígido, sino como una guía viva. La Kábala nos enseña que el día y la hora en que naciste, junto con el nombre con el que {nombrado}, constituyen una contraseña única de acceso a tu potencial supremo.",
  bienvenidaNombrado: { f: "fuiste nombrada", m: "fuiste nombrado", n: "te nombraron" },
  bienvenidaHabla:
    "Todo lo que leerás en las siguientes páginas habla de ti: de lo que ya has conquistado, de lo que aún está por despertar y de los aprendizajes que han venido a impulsarte. Léelo con apertura, amor y la certeza de que posees la fuerza para transformar cada aspecto de tu vida.",
  bienvenidaViaje: "Un viaje de retorno a tu esencia",
  bienvenidaMapa:
    "Este estudio es una hoja de ruta para comprender la arquitectura de tu ser. A través de la Kábala desciframos los códigos de tu nacimiento para ofrecerte claridad, sentido y dirección: tus dones, las virtudes y herramientas con las que viniste a habitar el mundo; tus desafíos de evolución, esos bloqueos o patrones repetitivos transformados en tu mayor fuente de sabiduría; y tu propósito, la dirección hacia donde orientar tu energía para vivir en plenitud.",
  bienvenidaArbol:
    "El árbol de la vida, con sus diez sefirot y sus veintidós senderos, es también el mapa evolutivo que recorren los veintidós arcanos mayores del Tarot: cada camino que tu alma ha elegido tiene, además de su lectura kabalística, una historia arquetípica —la del Loco que empieza a andar y, al final del recorrido, vuelve a cruzar el mismo abismo, pero ya transformado—. En este estudio encontrarás ambas lecturas entretejidas.",
  bienvenidaCita:
    "El estudio de Kábala no adivina tu destino; desvela la luz que ya habita en ti para que aprendas a guiar tu propio camino con conciencia, amor y libertad.",

  arbolKicker: "Tus tres energías",
  arbolTitulo: "Tu Árbol de la Vida",
  arbolIntro:
    "Tu alma elige tres caminos en el árbol de la vida: tres energías que has venido a aprender, a manejar y a comprender. El camino de origen te acompaña desde que naces hasta tu edad de cambio y es lo que sabes de otras vidas. El camino de transformación nace y muere contigo: es tu manera de vivir. El camino de destino es hacia dónde quiere llevarte tu alma.",
  arbolEdadLabel: "Edad de cambio",
  arbolEdadTurbulencias:
    "A los {edad} años comienzan {anios} años de turbulencias en {tipos}. No tomarás el camino de destino hasta los {destino} años.",
  arbolEdadSinTurbulencias: "A los {edad} años se produce el cambio que te lleva a tomar tu camino de destino.",

  caminosKicker: "Sesión 1 · Tus caminos",
  origenTitulo: "Tu camino de origen",
  origenIntro:
    "Te habla de esa cualidad que traes de serie: el camino de origen es lo que vienes a recordar y a compartir con otros en esta existencia. En tu caso, desde tu nacimiento hasta los {edad} años, que es tu edad de cambio.",
  transformacionTitulo: "Tu camino de transformación",
  transformacionIntro:
    "Nace y muere contigo: es tu manera de vivir. Debes vivir con esta predisposición y actuar como te indique este camino ante cualquier situación o conflicto que se presente en tu vida. Será muy bueno para lograr el éxito.",
  destinoTitulo: "Tu camino de destino",
  destinoIntroMismaCarta:
    "Una energía nueva que tu alma quiere aprender. En tu caso la continúas desde tu camino de transformación.",
  destinoIntro: "Una energía nueva que tu alma quiere aprender. Se alcanza cuando llega el momento del cambio.",
  caminoPareja: "Este camino en pareja",
  caminoEvolutivo: "El camino evolutivo de {nombre} · {sendero}",

  corazonKicker: "El pin de tu alma",
  corazonTitulo: "Tu número de corazón: {n}",
  corazonLead:
    "Es el número pin de tu alma, cómo vibras. Sabiendo que los números son vibración, entendemos que nos dan la información de la energía que generamos y el tipo de aprendizaje con los demás.",
  corazonCuenta: "Sale del valor de tu nombre ({nombre}) más tu edad de cambio ({edad}): {nombre} + {edad} = {total}.",
  corazonNumero: "Número {n} · {titulo}",
  corazonPartes: "En Kábala los números de tres cifras se dividen de dos en dos: {partes}",

  valoresKicker: "Tus valores y tu expresión",
  valoresTitulo: "Esencia, ego y días de fuerza",
  esenciaLabel: "Esencia",
  esenciaSinFicha: "Este número habla de tus valores internos, de los más profundos.",
  egoLabel: "Ego",
  egoSinFicha: "Habla de la conexión que tienes con las personas. Se lee de dos en dos: {partes}",
  fuerzaLabel: "Fuerza",
  fuerzaTexto:
    "Salen del valor de tu nombre, que es la esencia más el ego: {esencia} + {ego} = {valor}, y sumando sus cifras, {base}. Van del más fuerte al menos fuerte: aprovecha el día {primero} del mes para firmas y temas relevantes en tu vida, y después el resto.",

  aprendizajesKicker: "Sesión 2 · Tus aprendizajes",
  estructuraTitulo: "Tu estructura energética: número {n}",

  aprendizajesTituloVacio: "Tus aprendizajes",
  aprendizajesVacio: "Tu alma no ha marcado más aprendizajes en esta encarnación.",
  aprendizajeCabecera: "Aprendizaje {portal}{veces} · {nombre} — viene del número {numero}",
  aprendizajeVeces: " (×{n})",
  aprendizajesTitulo: "Tus aprendizajes · {i} de {n}",
  refHiloRojo: "Hilo rojo",
  refNeurosis: "Neurosis asociada",
  refSanador: "Principio sanador",

  somatizacionesKicker: "Cuerpo y emoción",
  somatizacionesTitulo: "Enfermedades y debilidades",
  somatizacionesLead:
    "Si no llevas a cabo estos aprendizajes, la energía no trabajada se somatiza. Conocer dónde se manifiesta te permite anticiparte y trabajarlo desde la conciencia.",
  somatizacionesPunto: "Punto {n} · {nombre}",
  somatizacionesFicha: "Disfunciones psicológicas: {psico} Órganos: {organos} Disfunciones físicas: {fisicas}",

  almaKicker: "Sesión 3 · La imagen del alma",
  almaTitulo: "Tus bloqueos y tus ayudas",
  almaLead:
    "Te da información de todos los procesos kármicos que te impiden crecer y avanzar. Es una mochila cargada de rutinas heredadas, patrones familiares y maneras de actuar de otras vidas que estás repitiendo en esta. Al conocerla vas a quitarle peso.",
  almaLabel: "Imagen del alma",
  almaTexto:
    "Es la cifra que abre la tabla: de ella salen los números móviles de cada casilla, y con ellos los planos que traes bloqueados y las ayudas con las que cuentas.",
  bloqueoTitulo: "Bloqueo {casilla} · {i} de {n}",
  bloqueoCabecera: "{nombre}{veces} — se forma con el número {numero}",
  bloqueoVeces: " · ×{n}",

  karmaKicker: "Cuentas abiertas y karma",
  karmaTitulo: "Tu karma",
  karmaLead:
    "Las cuentas abiertas son la base del sentimiento de culpa, donde tu alma siente que más ha fallado: situaciones no resueltas que continúas cargando. Cada potencial arcaico te ayuda a cerrar la cuenta abierta de su fila.",
  karmicoLabel: "Kármico",
  karmicoTexto: "Dónde falló tu alma en sus relaciones en vidas pasadas y qué se repite en esta.",
  lemaLabel: "Lema de vida",
  lemaTexto: "El propósito de tu alma: la vibración que te permite llevar a cabo tu plan.",

  numeroEnApuntes: "{n} · {titulo}",
  numeroEnApuntesAclara: "{n} · {titulo} — {aclara}",
  numeroSinApuntes: "{n} — no figura en los apuntes: se lee por sus partes, {partes}",
  numeroSinApuntesAclara: "{n} · {aclara} — no figura en los apuntes: se lee por sus partes, {partes}",

  afinidadTitulo: "Tus números de afinidad: {a} y {b}",
  afinidadLead:
    "Son la visión más amplia de la carta: qué has venido a hacer en esta encarnación. Van en pareja, y cada uno mira una mitad — el primero sale del día y el mes de nacimiento; el segundo, del mes y el año.",
  afinidadDiaMes: "día {dia} + mes {mes}",
  afinidadMesAnio: "mes {mes} + año {anio}",

  ciclosKicker: "Ciclos vitales",
  ciclosTitulo: "Tus ciclos de vida",
  ciclosIntro:
    "Tu propósito de vida vibra en el {proposito}. Los tres grandes ciclos —formación, evolución y cosecha— y las cuatro realizaciones marcan el ritmo de tu existencia; los desafíos son las fricciones que te afinan en cada etapa. Tu año personal actual ({anioUniversal}) es el {anioPersonal}.",
  etapasTitulo: "Tus etapas de nueve años",
  etapasLead:
    "La vida se recorre además en etapas de nueve años, cada una con su propia lección. Ahora mismo, con {edad} años, estás en la etapa {etapa}.",
  etapaCabecera: "Etapa {n} · de los {desde} a los {hasta} años{actual}",
  etapaActual: " — tu etapa actual",
  anioTitulo: "Tu año personal: {n}",
  anioLabel: "Año {n}",
  anioSinTexto: "Se calcula sumando tu día y tu mes de nacimiento al año en curso.",

  resumenKicker: "Tu estudio en una mirada",
  resumenTitulo: "Tus números, todos juntos",
  resumenLead:
    "Estas son las cifras sobre las que se ha construido todo lo que acabas de leer. Guárdalas: cada una abre una puerta distinta y ninguna se lee sola.",
  cifCorazon: "Corazón",
  cifCorazonPie: "El número pin del alma, cómo vibra",
  cifEsencia: "Esencia",
  cifEsenciaPie: "Lo que has venido a ser",
  cifEgo: "Ego",
  cifEgoPie: "Cómo te ven los demás",
  cifEdadCambio: "Edad de cambio",
  cifEdadCambioPie: "Cuándo entras en tu camino de destino",
  cifEstructura: "Estructura",
  cifEstructuraPie: "La figura de tus diez portales",
  cifAlma: "Imagen del alma",
  cifAlmaPie: "Los diez planos de consciencia",
  cifKarmico: "Kármico",
  cifKarmicoPie: "Lo que traes por cerrar",
  cifLema: "Lema de vida",
  cifLemaPie: "La vibración que te permite llevarlo a cabo",
  cifProposito: "Propósito",
  cifPropositoPie: "El hilo que recorre toda la vida",
  cifAnio: "Año personal",
  cifAnioPie: "Dónde estás en {n}",
  resumenCita: "Que este mapa te acompañe. La luz que buscas ya habita en ti.",

  cierreKicker: "Antes de cerrar",
  cierreTitulo: "Lo importante que has de tener en cuenta",
  cierreLead:
    "Si de todo el estudio sólo te quedas con una página, que sea esta. Son los seis puntos que conviene tener presentes en el día a día.",
  cHaciaDondeLabel: "Hacia dónde",
  cHaciaDondeTexto:
    "Tu camino de destino es {carta}. {lema} Es la dirección de fondo: cuando una decisión te aleje de ahí, lo notarás como desgaste.",
  cQueTrabajarLabel: "Qué trabajar",
  cQueTrabajarNada: "No traes portales con aprendizaje: tu estructura viene resuelta y el trabajo es sostenerla.",
  cQueTrabajarUno:
    "Tienes {n} aprendizaje abierto: {lista}. No son defectos: son las tareas que has venido a hacer, y se trabajan de una en una.",
  cQueTrabajarVarios:
    "Tienes {n} aprendizajes abiertos: {lista}. No son defectos: son las tareas que has venido a hacer, y se trabajan de una en una.",
  cPortalSinNombre: "portal {n}",
  cQueDesatascarLabel: "Qué desatascar",
  cQueDesatascarNada: "No hay planos de consciencia bloqueados: la imagen del alma viene limpia.",
  cQueDesatascarTexto:
    "Los planos bloqueados son {lista}. Son los sitios donde la energía se te queda parada; reconocerlos ya es media parte.",
  cCasillaSinNombre: "casilla {n}",
  cQueCerrarLabel: "Qué cerrar",
  cQueCerrarTexto:
    "El número kármico {karmico} es la cuenta que traes de atrás. Tu lema de vida, el {lema}, es la vibración con la que se salda.",
  cDondeEstasLabel: "Dónde estás",
  cDondeEstasTexto:
    "En {anioUniversal} estás en el año personal {anioPersonal} de una rueda de nueve, dentro del ciclo de {proposito} que marca tu propósito. Lo que toca este año no es lo que tocará el que viene.",
  cCuandoMoverLabel: "Cuándo mover",
  cCuandoMoverTexto:
    "Tus días de fuerza son el {dias}, de más a menos. Guárdalos para firmar, empezar y decidir; lo que arranques esos días viene con el viento a favor.",
  cierreCita: "Nada de esto es un destino cerrado. Es el mapa; el camino lo andas tú.",

  digOrigen: "Origen",
  digTransformacion: "Transformación",
  digDestino: "Destino",
  digOrigenRango: "0 – {edad} años",
  digTransformacionRango: "toda la vida",
  digDestinoRango: "desde los {edad}",
  digEje: "Eje",
  digPlano: "Plano",
  digEnTension: "en tensión",
  digLibre: "libre",
  digEspiritu: "Espíritu",
  digAlma: "Alma",
  digMateria: "Materia",
  digEvolucion: "Evolución",
  digProyeccion: "El 0 cae en la casilla {n}: eso es lo que proyectas de cara a los demás.",
  digDia: "Día",
  digMes: "Mes",
  digAnio: "Año",
  digCuenta: "Cuenta",
  digKarmico: "Nº kármico de las relaciones",
  digLema: "Nº del lema de vida",
  digSanador: "Nº de efecto sanador",
  digAfinidad: "Nº de afinidad",
  digVibraciones: "Vibración cuerpo / alma / espíritu",
  digRango: "{desde} – {hasta} años",
  digRangoFinal: "desde los {desde} años",
  digRangoAbierto: "desde los {desde}",
  digRealizacion: "Realización {n}",
  digDesafios: {
    "Primer desafío menor": "Primer desafío menor",
    "Segundo desafío menor": "Segundo desafío menor",
    "Desafío mayor": "Desafío mayor",
  },
  digRangosDesafio: {
    "hasta los 42 años aprox.": "hasta los 42 años aprox.",
    "de los 42 años en adelante": "de los 42 años en adelante",
    "toda la vida": "toda la vida",
  },
  sefirot: {
    Keter: "Keter",
    Hokmah: "Hokmah",
    Binah: "Binah",
    Jesed: "Jesed",
    Gevurah: "Gevurah",
    Tiphereth: "Tiphereth",
    Netsaj: "Netsaj",
    Hod: "Hod",
    Yesod: "Yesod",
    Malkut: "Malkut",
  },
  digEnNegativo: "En negativo",
  digEnPositivo: "En positivo",
  refTensa: "Lo que te tensa · {n}",
  refLibera: "Lo que te libera · {n}",
  refSinFicha: "Se lee dividiéndolo de dos en dos.",

  empSecNumeros: "Los números del nombre",
  empSecEsencia: "Los números del nombre · Esencia",
  empSecEgo: "Los números del nombre · Ego",
  empSecOrigen: "El camino de origen",
  empNombreKicker: "El nombre de la empresa",
  empNombreTitulo: "Qué dice este nombre",
  empLead:
    "La Kábala lee el nombre como una contraseña: cada letra tiene un valor y la suma de todas dice cómo vibra lo que ese nombre designa. {nombre} suma {n}.",
  empSoloNombre:
    "Este estudio se hace sólo con el nombre. De una persona se leen además la estructura energética, los planos de consciencia, las cuentas abiertas y los ciclos vitales, pero todo eso sale de la fecha de nacimiento; una empresa no la tiene, y lo que no se puede calcular no se inventa. Lo que sigue es, íntegro, lo que el nombre dice por sí solo.",
  empCifValor: "Valor del nombre",
  empCifValorPie: "Cómo vibra la empresa entera",
  empCifEsencia: "Esencia",
  empCifEsenciaPie: "Lo que ha venido a ser, en las vocales",
  empCifEgo: "Ego",
  empCifEgoPie: "Cómo la ven, en las consonantes",
  empCifCifras: "Cifras",
  empCifCifrasPie: "Los números que lleva el nombre",
  empCifOrigen: "Camino de origen",
  empComoSeCuenta: "Cómo se cuenta",
  empCuenta:
    "Se suma el valor de cada letra: {palabras}{total}. Las vocales aparte dan la esencia, {esencia}; las consonantes, el ego, {ego}.{cifras}",
  empCuentaPalabra: "{palabra} vale {n}",
  empCuentaSeparador: "; ",
  empCuentaTotal: ", y en total {n}",
  empCuentaCifras:
    " Y si el nombre lleva números, cuentan por lo que valen: aquí suman {cifras}. Un número no es vocal ni consonante, así que va aparte, y el valor del nombre es la suma de los tres: {esencia} + {ego} + {cifras} = {valor}.",
  empValorKicker: "Valor del nombre",
  empValorTitulo: "El {n}: cómo vibra",
  empValorTexto:
    "Es el número de la empresa entera, la suma de todas sus letras. Marca el tono de fondo de lo que hace y de cómo se la percibe.",
  empEsenciaKicker: "Esencia",
  empEsenciaTitulo: "El {n}: lo que ha venido a ser",
  empEsenciaTexto:
    "Sale sólo de las vocales. Es el impulso interno del proyecto: aquello a lo que tiende cuando nadie la mira.",
  empEgoKicker: "Ego",
  empEgoTitulo: "El {n}: cómo la ven",
  empEgoTexto:
    "Sale sólo de las consonantes. Es la cara que la empresa pone hacia fuera: lo que perciben clientes y proveedores antes de tratarla.",
  empArcanoKicker: "Arcano {n}",
  empOrigenLabel: "Origen",
  empOrigenCuenta:
    "Se saca del valor del nombre: {valor} menos la suma de sus cifras ({sumaCifras}) da {resta}, que entre nueve son {division}, más uno, {mas1}. Reducido a los veintiún arcanos, el {arcano}.",
  empOrigenNota:
    "En una persona este es el primero de tres caminos —origen, transformación y destino—, pero los otros dos se apoyan en la edad de cambio, que sale de la fecha de nacimiento. En una empresa sólo hay este, y por eso pesa: es todo el arco de la carta.",
  empCierreKicker: "Antes de cerrar",
  empCierreTitulo: "Lo importante que hay que tener en cuenta",
  empCierreLead:
    "Si de todo el estudio sólo se retiene una página, que sea esta. Son los cuatro puntos que conviene tener presentes.",
  empCVibraLabel: "Cómo vibra",
  empCVibraTexto: "El nombre suma {n}. Es el tono de fondo: lo que la empresa transmite antes de decir nada.",
  empCDentroFueraLabel: "Dentro y fuera",
  empCDentroFueraTexto:
    "La esencia es {esencia} y el ego {ego}. Cuando los dos se parecen, la empresa se muestra como es; cuando se separan mucho, hay distancia entre lo que quiere ser y lo que aparenta, y esa distancia se paga en confianza.",
  empCHaciaDondeLabel: "Hacia dónde",
  empCHaciaDondeTexto: "El camino de origen es {carta}. {lema} Es la dirección de fondo del proyecto.",
  empCCuandoMoverLabel: "Cuándo mover",
  empCCuandoMoverTexto:
    "Los días de fuerza son el {dias}, de más a menos. Guárdalos para firmar contratos, abrir y presentar.",
  empCierreCita: "El nombre es la contraseña: lo que se nombra bien, se sostiene.",
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
  estudio: ESTUDIO,
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
