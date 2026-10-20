/**
 * ============================================================================
 * QUÉ ES UN CURSO, EN DATOS
 * ============================================================================
 *
 * La regla que manda sobre todo lo demás: IRIS TIENE QUE PODER HACER ESTO SOLA.
 * Si para añadir una lección hay que tocar código, la escuela se para el día
 * que yo no esté, y una escuela que depende de que alguien conteste el teléfono
 * no es una escuela: es un favor.
 *
 * De ahí sale la forma de lo que hay aquí abajo. Nada de esto guarda un dato
 * que haya que calcular en otro sitio, nada pide un identificador que haya que
 * copiar de ningún lado, y no hay un solo campo que Iris no pueda rellenar
 * mirando la pantalla.
 *
 * UN CURSO ES UN SOLO DOCUMENTO, con sus módulos y sus lecciones dentro.
 *
 * Lo normal en una base de datos sería partirlo en tres colecciones —cursos,
 * módulos, lecciones— y en una escuela con miles de cursos sería lo correcto.
 * Aquí no, y el motivo es concreto:
 *
 *   · SE LEE DE UNA VEZ. Abrir un curso es UNA lectura, no una por módulo más
 *     una por lección. Con cobro por lectura, eso es la diferencia entre
 *     céntimos y euros al mes, y sobre todo entre abrir al instante o esperar.
 *   · SE GUARDA ENTERO O NO SE GUARDA. Reordenar tres módulos partido en
 *     colecciones son tres escrituras que pueden fallar a la mitad y dejar el
 *     curso con dos módulos en la posición 2. Aquí es una escritura: o entra
 *     todo o no entra nada.
 *   · REORDENAR ES MOVER UN ELEMENTO DE UN ARRAY. Partido, hay que mantener un
 *     campo `orden` en cada documento y reescribirlos todos.
 *
 * EL LÍMITE QUE HAY QUE CONOCER: un documento de Firestore no pasa de 1 MB. Un
 * curso con cien lecciones, cada una con su título, su enlace y un párrafo,
 * anda por los 60 KB. Hay sitio de sobra. Lo que NO cabe aquí —y por eso no
 * está— es el texto largo de cada lección si algún día son capítulos enteros:
 * ese día las lecciones se parten en su propia colección y el resto se queda
 * como está.
 *
 * LO QUE NO ESTÁ AQUÍ, y dónde está:
 *
 *   · QUIÉN HA COMPRADO QUÉ → `Inscripcion`, aparte. Si estuviera dentro del
 *     curso, cada alumno nuevo sería una escritura sobre el documento que leen
 *     todos, y con cien alumnos apuntándose a la vez se pisarían unos a otros.
 *   · POR DÓNDE VA CADA UNO → `Avance`, aparte y por lo mismo: es de la
 *     persona, no del curso, y cambia cada vez que alguien termina un vídeo.
 */

/** Una lección: un vídeo y lo que lo acompaña. */
export type Leccion = {
  id: string;
  titulo: string;
  /**
   * EL ENLACE DEL VÍDEO, pegado tal cual de donde esté subido.
   *
   * Se guarda la dirección entera y no un identificador suelto a propósito:
   * un identificador obliga a saber de qué plataforma es para reconstruir el
   * enlace, y eso es exactamente lo que no puede saber quien lo pega. Iris
   * copia la barra de direcciones y funciona.
   *
   * Vacío = la lección existe pero todavía no tiene vídeo. Es un estado
   * legítimo: se monta el esqueleto del curso primero y se graban después.
   */
  video: string;
  /** Lo que se lee al lado del vídeo. Puede estar vacío. */
  texto: string;
  /**
   * Cuánto dura, en minutos. 0 = no se dice.
   *
   * No se saca del vídeo porque para eso habría que pedírselo a la plataforma
   * donde esté, y eso ata la escuela a esa plataforma. Lo escribe Iris, que lo
   * sabe porque acaba de grabarlo.
   */
  minutos: number;
};

/** Un módulo: un puñado de lecciones que van juntas. */
export type Modulo = {
  id: string;
  titulo: string;
  lecciones: Leccion[];
};

/**
 * UN RECURSO: UN ARCHIVO QUE SE BAJA.
 *
 * El PDF del manual, la plantilla de la ficha, el audio de la meditación. Lo
 * que acompaña a un curso y no es un vídeo de clase.
 *
 * VIVE DENTRO DEL CURSO, y eso cambió el 16 de octubre de 2026. Antes había
 * una colección `recursos` aparte y una pantalla «Recursos» en el menú, con
 * todo mezclado. Gerson: «el apartado de recursos y demás, pues esto iría
 * como tal dentro de los cursos. Cada curso tiene sus recursos, entonces es
 * irrelevante colocarlo allí».
 *
 * Y es la forma correcta, no sólo la que se pidió: una biblioteca común
 * obliga a decidir quién puede bajar qué archivo, y la respuesta siempre iba
 * a ser «quien tenga el curso del que es». Puesto dentro, esa pregunta ya
 * está contestada por la inscripción y no hay una segunda lista de permisos
 * que mantener.
 *
 * LA FICHA VIVE AQUÍ, EL ARCHIVO NO. Un documento de Firestore no pasa de
 * 1 MB, así que el archivo se sube al almacén y aquí queda su dirección. Eso
 * arrastra una cosa que hay que saber: quitar el recurso de esta lista NO
 * borra el archivo. Son dos borrados, y el orden está elegido en
 * `recursos.ts`.
 */
export type Recurso = {
  id: string;
  nombre: string;
  /** Una línea de qué es. */
  que: string;
  tipo: "pdf" | "audio" | "plantilla" | "video";
  /** Dónde está el archivo, para bajarlo. */
  url: string;
  /** Su sitio exacto en el almacén, que es lo que hace falta para borrarlo.
   *  No se saca de la `url`: esa lleva una llave dentro y parsearla sería
   *  atarse a un formato que Google puede cambiar. */
  ruta: string;
  /** En bytes. Se enseña en humano; se guarda en crudo para poder sumarlo. */
  peso: number;
  creado: string;
};

export type Curso = {
  id: string;
  titulo: string;
  /** De qué va, para quien está decidiendo si entra. */
  descripcion: string;
  /**
   * La portada. Un enlace a una imagen o a un vídeo corto.
   *
   * Vacío = sale un fondo liso con la inicial del curso. No se rompe nada por
   * no tener portada, y eso importa: obligar a tener una imagen antes de poder
   * crear un curso es lo que hace que un curso se quede sin crear.
   */
  portada: string;
  /**
   * BORRADOR O PUBLICADO, y esto no es un detalle: es lo que permite trabajar.
   *
   * Un curso se monta en varios ratos. Sin este campo, o se monta entero de una
   * sentada o los alumnos ven un curso con dos lecciones y tres huecos. Con él,
   * Iris lo deja a medias el martes y nadie se entera hasta que ella diga.
   *
   * Lo comprueban las reglas de Firestore además de la pantalla: un borrador no
   * se puede leer aunque alguien adivine su dirección.
   */
  publicado: boolean;
  /**
   * QUIÉN LO MONTA: el `uid` de su creador. Vacío o ausente = es de Iris, que
   * es lo que son todos los cursos que existían antes del 20 de octubre de
   * 2026. Las reglas de Firestore lo usan para que cada creador toque los
   * suyos y ninguno más, y no se puede cambiar una vez puesto.
   */
  autor?: string;
  /** El nombre del creador, copiado al crear, para que Iris sepa de quién es
   *  sin ir a buscarlo. */
  autorNombre?: string;
  /**
   * EL CREADOR PIDE QUE SE PUBLIQUE. Un creador no publica: marca esto, e Iris
   * lo ve en su lista con la etiqueta «Pide publicar» y decide. Al publicarlo
   * ella, se apaga.
   */
  revision?: boolean;
  modulos: Modulo[];
  /**
   * Los archivos que se bajan: el manual, la plantilla, el audio.
   *
   * Opcional porque los cursos creados antes de que esto existiera no lo
   * traen, y al faltar se lee como una lista vacía. Nada se rompe y no hay
   * que ir a tocar ningún documento a mano.
   */
  recursos?: Recurso[];
  /** Cuándo se creó y cuándo se tocó por última vez. ISO. */
  creado: string;
  tocado: string;
};

/**
 * QUIÉN TIENE ACCESO A QUÉ CURSO.
 *
 * Hoy la pone Iris a mano cuando alguien le paga. Cuando entre Stripe, la
 * escribirá el cobro — y nada más cambia, porque todo lo que lee cursos
 * pregunta por esto y no por cómo se pagó.
 *
 * El identificador es `uid__cursoId` y no uno al azar. Así no puede haber dos
 * inscripciones de la misma persona al mismo curso: no hace falta comprobarlo
 * antes de escribir, lo impide la forma del dato.
 */
export type Inscripcion = {
  id: string;
  uid: string;
  cursoId: string;
  /** Desde cuándo. ISO. */
  desde: string;
  /** Cómo entró: a mano por Iris, o pagando. Para las cuentas de después. */
  via: "mano" | "pago";
};

/** Por dónde va una persona en un curso. */
export type Avance = {
  /** `uid__cursoId`, por lo mismo que arriba. */
  id: string;
  uid: string;
  cursoId: string;
  /** Las lecciones terminadas, por su id. */
  hechas: string[];
  tocado: string;
};

/* ------------------------------------------------------------------ cuentas */

/** Cuántas lecciones tiene un curso en total. */
export function totalLecciones(c: Curso): number {
  return c.modulos.reduce((n, m) => n + m.lecciones.length, 0);
}

/**
 * Cuánto lleva hecho alguien, de 0 a 1.
 *
 * Un curso sin lecciones vale 0 y no `NaN`: dividir entre cero aquí pintaría
 * una barra de progreso rota en la pantalla de un alumno, que es de las cosas
 * que más cara de desconfianza ponen.
 */
export function progreso(c: Curso, a: Avance | null): number {
  const total = totalLecciones(c);
  if (total === 0 || !a) return 0;
  /* Se cuentan sólo las hechas QUE SIGUEN EXISTIENDO. Si Iris borra una
     lección que alguien ya había terminado, su id se queda en `hechas` y sin
     esto el progreso diría 11 de 10. */
  const vivas = new Set(c.modulos.flatMap((m) => m.lecciones.map((l) => l.id)));
  const hechas = a.hechas.filter((id) => vivas.has(id)).length;
  return Math.min(1, hechas / total);
}

/** La primera lección sin terminar: por donde se sigue. */
export function porDondeIba(c: Curso, a: Avance | null): Leccion | null {
  const hechas = new Set(a?.hechas ?? []);
  for (const m of c.modulos) {
    for (const l of m.lecciones) {
      if (!hechas.has(l.id)) return l;
    }
  }
  return null;
}
