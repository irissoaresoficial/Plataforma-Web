/**
 * ============================================================================
 * LA PRESENTACIÓN DE LA MASTERCLASS, DIAPOSITIVA A DIAPOSITIVA
 * ============================================================================
 *
 * Gerson, el 30 de octubre de 2026: «la presentación la quiero en un
 * subdominio, de manera interactiva y fluida, que me permita cambiar». Se ve
 * en presentacion.escueladesabiduria33.com (y en /presentacion).
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA CAMBIAR UNA DIAPOSITIVA. El
 * texto, el orden y las notas de quien presenta viven aquí; el diseño, en
 * `components/presentacion`. Cambiar una frase no obliga a tocar código.
 *
 * DOS MARCAS EN EL TEXTO:
 *   · *palabra*   sale resaltada en el color de la casa. No en cursiva: la
 *                 casa no usa cursiva en nada (MARCA.md §2).
 *   · [texto]     sale en ROJO: es algo que todavía no está decidido y hay que
 *                 rellenar antes del día 26. Nunca se inventa (MARCA.md §7).
 *
 * LO QUE YA ESTÁ EN `site.ts` NO SE REPITE AQUÍ: la fecha, quién la da y los
 * datos del curso salen de allí. Cambian en un sitio y cambian en todos —la
 * web, los correos y esta presentación—.
 *
 * ESTRUCTURA: la de una masterclass que vende sin presionar. Bienvenida y
 * promesa, quién la da, tres claves de valor con momentos para el chat y un
 * ejercicio, un caso real, la propuesta del curso y las preguntas.
 */

/** Una tarjeta de las diapositivas de tarjetas. */
export type Tarjeta = {
  rotulo?: string;
  titulo?: string;
  texto?: string;
  /** Varias frases sueltas, una debajo de otra. */
  lineas?: string[];
  /** La pieza oscura de la diapositiva. Una como mucho. */
  oscura?: boolean;
  /** Ocupa más sitio que sus compañeras. */
  grande?: boolean;
};

export type Diapo =
  | { tipo: 'portada'; nota: string }
  | { tipo: 'frase'; rotulo: string; titulo: string; texto?: string; imagen?: string; logo?: boolean; pie?: string; nota: string }
  | { tipo: 'chat'; rotulo?: string; titulo: string; texto?: string; pastillas?: string[]; nota: string }
  | { tipo: 'tarjetas'; rotulo: string; titulo: string; tarjetas: Tarjeta[]; pie?: string; nota: string }
  | {
      tipo: 'filas';
      rotulo: string;
      titulo: string;
      filas: Array<{ titulo: string; texto?: string }>;
      imagen?: string;
      pie?: string;
      /** Las filas salen de una en una, con cada pulsación. */
      pasos?: boolean;
      nota: string;
    }
  | { tipo: 'presentan'; rotulo: string; titulo: string; historias: string[]; nota: string }
  | { tipo: 'curso'; nota: string }
  | { tipo: 'precio'; nota: string };

/** El título de una diapositiva, para el índice y para quien no la ve. */
export function tituloDe(d: Diapo): string {
  switch (d.tipo) {
    case 'portada':
      return 'Portada';
    case 'curso':
      return 'El curso';
    case 'precio':
      return 'Precio';
    default:
      return d.titulo.replace(/[*[\]]/g, '');
  }
}

export const DIAPOSITIVAS: Diapo[] = [
  /* ---------------------------------------------------------- BIENVENIDA */
  {
    tipo: 'portada',
    nota: 'Pantalla de espera. Ponla 10 minutos antes de las 21:00 con música suave. Empieza a las 21:02 como tarde: quien llega puntual no espera a quien llega tarde.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Antes de empezar',
    titulo: 'Tres cosas para aprovechar esta hora',
    tarjetas: [
      { titulo: 'Usa el chat', texto: 'Vamos a hacerte preguntas. Contesta aunque sea con una palabra.' },
      { titulo: 'Papel y boli', texto: 'Hay un ejercicio con fechas de nacimiento. Vas a querer apuntarlo.' },
      { titulo: 'Hasta el final', texto: 'En los últimos minutos contestamos tus preguntas en directo.' },
    ],
    nota: 'Minuto 0 a 2 · Iris. Saluda con nombre propio a las primeras personas que escriban en el chat. Di que dura una hora y que al final hay preguntas. No prometas nada que no esté decidido (grabación, regalos).',
  },
  {
    tipo: 'chat',
    titulo: 'Escribe desde dónde nos ves',
    texto: 'Y del 1 al 10: ¿cuánto se repite tu historia en el amor?',
    nota: 'Minuto 2 a 4. Lee en voz alta ciudades y números. Si alguien pone 9 o 10, nómbralo: «Hoy esta clase es para ti».',
  },
  {
    tipo: 'filas',
    rotulo: 'Lo que te llevas hoy',
    titulo: 'En una hora vas a ver tres cosas',
    pasos: true,
    filas: [
      { titulo: 'Por qué se repite', texto: 'Cambias de persona y vuelve la misma historia. No es mala suerte.' },
      { titulo: 'De dónde viene', texto: 'El patrón tiene historia: se hereda dentro de la familia.' },
      { titulo: 'Qué hacer con él', texto: 'Lo primero es verlo. Hoy te enseñamos cómo.' },
    ],
    nota: 'Minuto 4 a 5 · Iris. Es la promesa de la clase. Cada pulsación saca una de las tres: dila despacio antes de pasar a la siguiente.',
  },

  /* ------------------------------------------------------- QUIÉN LA DA */
  {
    tipo: 'presentan',
    rotulo: 'Quién da la clase',
    titulo: 'Marco e Iris',
    historias: [
      '[Su historia en dos líneas: qué ve en consulta que le llevó a este tema]',
      '[Su historia en dos líneas: por qué empezó a leer patrones familiares]',
    ],
    nota: 'Minuto 5 a 9. Un minuto cada uno como mucho. Una historia personal corta vale más que un currículum. Lo que sale en rojo hay que rellenarlo con datos reales antes del día 26.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Por qué juntos',
    titulo: 'Dos miradas sobre el mismo patrón',
    tarjetas: [
      { rotulo: 'La psicología · Marco', titulo: 'Cómo lo vives hoy', texto: 'Lo que sientes, lo que repites y lo que el cuerpo avisa.' },
      { rotulo: 'La numerología transgeneracional · Iris', titulo: 'De dónde viene', texto: 'Lo que se repite en tu familia, leído a partir de las fechas de nacimiento.', oscura: true },
    ],
    nota: 'Minuto 9 a 10. Una frase cada uno. Explica por qué la clase la dan dos personas y prepara la venta del curso, que también es de los dos.',
  },

  /* --------------------------------------------------------- CLAVE 1 */
  {
    tipo: 'frase',
    rotulo: 'Clave 1 · Marco',
    titulo: 'No es mala suerte. *Es un patrón.*',
    nota: 'Minuto 10 a 17 · Marco. Dos segundos de silencio antes de hablar. Esta frase es la tesis de toda la clase.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Clave 1',
    titulo: 'Cambias de persona y vuelve la misma historia',
    tarjetas: [
      { rotulo: 'La misma', titulo: 'persona, con otra cara' },
      { rotulo: 'La misma', titulo: 'discusión, por el mismo motivo' },
      { rotulo: 'El mismo', titulo: 'final, aunque cambie todo lo demás' },
    ],
    pie: 'Mientras no lo ves, lo vuelves a elegir sin darte cuenta.',
    nota: 'Marco. Un ejemplo de consulta, sin nombres ni nada que identifique a nadie. La frase de abajo es la que tiene que quedarse.',
  },
  {
    tipo: 'chat',
    titulo: '¿Qué frase se repite en tus relaciones?',
    texto: 'Escríbela en el chat. Leemos algunas en voz alta, sin nombres.',
    nota: 'Deja 60 segundos. Lee tres o cuatro frases y únelas: «Distintas personas, la misma frase». Así nadie se siente sola.',
  },

  /* --------------------------------------------------------- CLAVE 2 */
  {
    tipo: 'frase',
    rotulo: 'Clave 2 · Iris',
    titulo: 'El patrón tiene historia. *Se hereda.*',
    imagen: '/images/generaciones.png',
    nota: 'Minuto 17 a 28 · Iris. Empieza la parte de numerología transgeneracional: lo que diferencia esta clase de cualquier charla de pareja.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Clave 2',
    titulo: 'La misma historia en tres generaciones',
    tarjetas: [
      { rotulo: 'La abuela', titulo: 'Aguantó y no dijo nada' },
      { rotulo: 'La madre', titulo: 'Eligió al mismo tipo de hombre' },
      { rotulo: 'La hija', titulo: 'Jura que ella no lo repetirá', oscura: true },
    ],
    pie: 'Lo que se mira: la edad a la que cada una se emparejó, el tipo de persona que eligió y cómo acabó.',
    nota: 'Iris. Son patrones, no culpables: no se habla mal de la familia de nadie. La abuela y la madre hicieron lo que pudieron con lo que tenían.',
  },
  {
    tipo: 'filas',
    rotulo: 'Ejercicio en directo',
    titulo: 'Tus tres fechas',
    pasos: true,
    imagen: '/images/la-cuenta.jpg',
    filas: [{ titulo: 'Tu fecha de nacimiento' }, { titulo: 'La de tu madre' }, { titulo: 'La de tu pareja, o la de tu última pareja' }],
    pie: '[Iris: el cálculo concreto que enseña en directo y qué hay que buscar en las tres fechas]',
    nota: 'El momento más valioso: la gente se lleva algo hecho con sus manos. Dos minutos para que escriban; que pongan «lo tengo» en el chat. Con permiso de alguien, una lectura rápida de ejemplo.',
  },

  /* --------------------------------------------------------- CLAVE 3 */
  {
    tipo: 'frase',
    rotulo: 'Clave 3 · Marco',
    titulo: 'El amor que *no deja marchar*',
    nota: 'Minuto 28 a 37 · Marco. Es el tema que más interesó en la campaña: 8 de cada 100 personas que vieron el vídeo de la madre araña pincharon. Dale tiempo.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Clave 3',
    titulo: 'El síndrome de la madre araña',
    tarjetas: [
      {
        oscura: true,
        grande: true,
        titulo: 'Hay madres que no dejan marchar. *No con gritos: con culpa.*',
        texto: 'Y el hijo o la hija acaba eligiendo parejas que nunca terminan de encajar.',
      },
      {
        rotulo: 'Cómo se reconoce',
        lineas: ['[Señal 1, la que más ve Marco en consulta]', '[Señal 2]', '[Señal 3]'],
      },
    ],
    nota: 'Marco. Las tres señales con ejemplos sencillos. Cuidado con el tono: la madre no es la mala de la historia. También repite algo que aprendió.',
  },
  {
    tipo: 'frase',
    rotulo: 'Clave 3 · Lo que dice el cuerpo',
    titulo: 'El cuerpo también avisa',
    texto: 'La ansiedad, el insomnio, el cansancio que no se va. Mucho de lo que llega a consulta *empieza en una relación.*',
    nota: 'Marco, desde su experiencia de consulta. Une la clase con lo que la gente siente en el cuerpo. No hagas diagnósticos a nadie del chat.',
  },
  {
    tipo: 'chat',
    titulo: '¿En qué clave te has reconocido?',
    pastillas: ['1 · Es un patrón', '2 · Se hereda', '3 · No deja marchar'],
    texto: 'Escribe 1, 2 o 3 en el chat.',
    nota: 'Minuto 36 a 37. Lee cuántos ponen cada número: te dice qué parte del curso destacar en la venta.',
  },

  /* -------------------------------------------------------- UN CASO */
  {
    tipo: 'tarjetas',
    rotulo: 'Un caso real',
    titulo: '[Nombre cambiado], [edad] años',
    tarjetas: [
      { rotulo: 'Lo que se repetía', texto: '[Qué le pasaba en sus relaciones]' },
      { rotulo: 'Lo que vimos', texto: '[Qué salió en las fechas de su familia]' },
      { rotulo: 'Lo que cambió', texto: '[Qué es distinto hoy, contado por ella]', oscura: true },
    ],
    pie: 'Se cuenta con su permiso y sin ningún dato que permita reconocerla.',
    nota: 'Minuto 37 a 40. Sólo un caso real y con permiso por escrito. Si no hay ninguno, se quita esta diapositiva: un caso inventado no se cuenta nunca.',
  },

  /* ----------------------------------------------------- LA PROPUESTA */
  {
    tipo: 'frase',
    rotulo: 'Y ahora',
    titulo: 'Verlo es el primer paso. *Cambiarlo lleva más de una hora.*',
    nota: 'Minuto 40 · Iris. La transición a la venta. Pide permiso: «¿Os puedo contar cómo seguimos trabajando esto con quien quiere ir más allá?». Que alguien diga sí en el chat.',
  },
  {
    tipo: 'curso',
    nota: 'Minuto 41 a 43. Los datos salen de la ficha del curso en la web (content/site.ts). Lo que sale en rojo está sin decidir: hay que cerrarlo antes del 26.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Qué incluye',
    titulo: 'Lo que trabajamos en el curso',
    tarjetas: [
      { rotulo: 'Módulo 1', texto: '[Nombre y qué se ve]' },
      { rotulo: 'Módulo 2', texto: '[Nombre y qué se ve]' },
      { rotulo: 'Módulo 3', texto: '[Nombre y qué se ve]' },
      { rotulo: 'Módulo 4', texto: '[Nombre y qué se ve]' },
    ],
    pie: '[Dónde quedan las clases y qué más incluye: sólo lo que sea real]',
    nota: 'Minuto 43 a 45. Habla de lo que cambia en la vida de la persona, no del número de horas. Si un módulo responde a la clave más votada en el chat, dilo en voz alta.',
  },
  {
    tipo: 'tarjetas',
    rotulo: 'Para quién es',
    titulo: 'Para que lo decidas con calma',
    tarjetas: [
      {
        oscura: true,
        titulo: 'Es para ti si',
        lineas: ['Cambias de pareja y vuelve la misma historia.', 'Sientes que vives la vida de otra persona.', 'Quieres entender de dónde viene, no sólo aguantarlo.'],
      },
      {
        titulo: 'No es para ti si',
        lineas: ['Buscas una solución mágica en una semana.', 'No quieres mirar tu historia familiar.', 'Esperas que cambie la otra persona y no tú.'],
      },
    ],
    nota: 'Minuto 45 a 46. Decir para quién NO es da confianza. Con calma y sin presión.',
  },
  {
    tipo: 'precio',
    nota: 'Minuto 46 a 48. Di el precio una vez, claro, y calla dos segundos. Sin tachar un precio al que no se haya vendido de verdad en los últimos 30 días (Ley 7/1996, art. 20). Sin plazas limitadas ni cuentas atrás que no sean verdad.',
  },
  {
    tipo: 'filas',
    rotulo: 'Cómo apuntarte',
    titulo: 'Tres pasos',
    filas: [{ titulo: 'Entra en [enlace corto]' }, { titulo: 'Elige cómo pagar [opciones]' }, { titulo: 'Te llega el acceso por correo' }],
    pie: 'El enlace también lo dejamos ahora en el chat y en el grupo de WhatsApp.',
    nota: 'Minuto 48 a 50. Pega el enlace en el chat mientras hablas, y que alguien del equipo lo pegue en el grupo de WhatsApp. Deja esta diapositiva puesta mientras contestas preguntas.',
  },

  /* ------------------------------------------------------ PREGUNTAS */
  {
    tipo: 'chat',
    rotulo: 'Preguntas en directo',
    titulo: 'Tu turno. Pregunta lo que quieras.',
    texto: 'Escribe tu pregunta en el chat. Contestamos todas las que dé tiempo.',
    nota: 'Minuto 50 a 58. Primero las preguntas sobre el curso (precio, fechas, si le sirve), después las demás. Cada respuesta sobre el curso termina recordando el enlace.',
  },
  {
    tipo: 'frase',
    rotulo: 'Escuela de Sabiduría 33',
    titulo: 'Gracias por *quedarte*',
    texto: 'Seguimos en el grupo de WhatsApp de la masterclass.',
    logo: true,
    nota: 'Minuto 58 a 60. Despedida corta y cálida. Recuerda el enlace una última vez. Cierra a la hora.',
  },
];
