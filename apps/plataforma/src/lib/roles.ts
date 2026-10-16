/**
 * QUIÉN ES CADA UNO Y QUÉ PUEDE TOCAR.
 *
 * Hasta hoy no había roles, y estaba bien que no los hubiera. El comentario de
 * `sesion.tsx` lo decía: «un sistema de permisos para un solo usuario no
 * protege de nada y sí complica todo (…) el día que entre una segunda persona
 * con permisos distintos, se añade — y se añadirá sabiendo qué hace falta de
 * verdad, en vez de haberlo adivinado hoy».
 *
 * Ese día es hoy, y ya sabemos qué hace falta: la escuela abre con cursos, así
 * que entran alumnos y miembros, y ninguno de los dos puede ver lo que ve Iris.
 *
 * TRES ROLES Y UN LLAVERO
 * ---------------------------------------------------------------------------
 * No son escalones. Son llaves, y una persona lleva las que lleve:
 *
 *   · `alumno`   compró uno o varios cursos. Ve los suyos y nada más.
 *   · `miembro`  tiene membresía. Ve la comunidad.
 *   · `admin`    Iris. Lo ve todo, incluido el despacho y el estudio.
 *
 * Quien compra un curso Y paga membresía lleva las dos llaves. Si esto fuera
 * un escalón —alumno < miembro < admin— habría que decidir si un miembro ve
 * los cursos que NO ha comprado, y la respuesta es que no. Con llaves no hay
 * que decidirlo: no tiene esa llave y ya está.
 *
 * EL ESTUDIO DE KÁBALA ES SOLO DE IRIS
 * ---------------------------------------------------------------------------
 * Esto no es una precaución genérica, es la regla del negocio: la lectura es
 * la herramienta con la que ella prepara los estudios de sus clientas. Un
 * alumno que paga un curso no compra acceso al método. Por eso `estudio` y
 * `despacho` piden `admin` y no «cualquiera que haya entrado».
 *
 * LAS FICHAS VIEJAS SON ADMINISTRADORAS
 * ---------------------------------------------------------------------------
 * Hay fichas en producción que se escribieron antes de que esto existiera, y
 * no tienen campo `roles`. La tentación es tratarlas como el rol más bajo
 * «por prudencia», y sería un error grave: las únicas fichas que existen hoy
 * son las de Iris y las de quien ella ya dejó entrar, y todas tienen acceso
 * completo ahora mismo. Degradarlas al publicar dejaría a Iris fuera de su
 * propia plataforma, sin nadie dentro capaz de volver a subirla.
 *
 * Así que una ficha sin `roles` se lee como administradora. No es una
 * suposición optimista: es exactamente el permiso que esa persona tiene hoy,
 * escrito de otra manera.
 */

/** Las tres llaves. */
export type Rol = "admin" | "alumno" | "miembro";

export const ROLES: readonly Rol[] = ["admin", "alumno", "miembro"] as const;

/**
 * Lo que se puede hacer, en vez de quién se es.
 *
 * Las pantallas preguntan por capacidades y no por roles a propósito. Si una
 * pantalla pregunta «¿es admin?» y mañana se parte el rol en dos —pongamos
 * `admin` y `ayudante`— hay que ir a buscar esa pregunta por todo el código.
 * Preguntando «¿puede abrir el despacho?» el cambio se hace una sola vez,
 * aquí abajo, y ninguna pantalla se entera.
 */
export type Capacidad =
  /** El despacho: clientes, leads, agenda y facturas. */
  | "despacho"
  /** La lectura de Kábala: consulta, panel, pareja y documento. Solo Iris. */
  | "estudio"
  /** Las métricas de la escuela. */
  | "metricas"
  /** Crear y publicar cursos, y dar accesos. */
  | "gestion"
  /** Ver los cursos que uno ha comprado. */
  | "cursos"
  /** Entrar en la comunidad. */
  | "comunidad"
  /**
   * Estar dentro de la escuela: el recibidor y el perfil propio.
   *
   * SE LLAMABA `recursos` y era el nombre de una pantalla que ya no existe —
   * la biblioteca común, que se deshizo cuando los archivos se metieron
   * dentro de cada curso. Lo que esta llave abría de verdad nunca fue la
   * biblioteca: era «has entrado y tienes algún tipo de acceso».
   *
   * Un permiso con el nombre de una pantalla borrada es de las cosas que más
   * tiempo hacen perder: se lee, se busca la pantalla, no está, y hay que
   * reconstruir qué significaba. Por eso se renombra en vez de dejarlo.
   */
  | "escuela";

/**
 * Qué llave abre qué puerta.
 *
 * Se lee de un vistazo, que es justo lo que tiene que pasar con una tabla de
 * permisos: si hay que seguir un hilo de condiciones para saber si alguien
 * entra, tarde o temprano alguien se equivoca.
 */
const ABRE: Record<Capacidad, readonly Rol[]> = {
  despacho: ["admin"],
  estudio: ["admin"],
  metricas: ["admin"],
  gestion: ["admin"],
  cursos: ["admin", "alumno"],
  comunidad: ["admin", "miembro"],
  escuela: ["admin", "alumno", "miembro"],
};

/** Lo mínimo que hace falta saber de alguien para decidir si pasa. */
export type ConRoles = { roles?: Rol[] | null };

/**
 * Los roles de una ficha, ya resueltos.
 *
 * Aquí vive la compatibilidad con las fichas viejas, y vive en UN SOLO SITIO:
 * todo lo demás llama a esta función y nadie más mira el campo `roles` en
 * crudo. El día que se quiera dejar de ser indulgente con las fichas sin rol
 * —cuando estén todas migradas— se cambia esta función y nada más.
 */
export function rolesDe(ficha: ConRoles | null | undefined): Rol[] {
  /*
   * NO TENER FICHA NO ES SER UNA FICHA VIEJA, y confundirlo es un agujero.
   *
   * La indulgencia de abajo existe para una ficha que EXISTE y a la que le
   * falta el campo `roles`. Si se aplicara también a `null`, cualquier sitio
   * que preguntara por alguien que no ha entrado —o cuya ficha no se pudo
   * leer— recibiría «administradora» de vuelta. Lo cazó la prueba de
   * `__pruebas__/roles.ts` en cuanto se escribió, y es exactamente la clase
   * de fallo que no se ve mirando la pantalla.
   */
  if (!ficha) return [];

  const r = ficha.roles;
  if (!Array.isArray(r) || r.length === 0) return ["admin"];
  const limpios = r.filter((x): x is Rol => ROLES.includes(x as Rol));
  // Una ficha con roles escritos pero ninguno reconocible no es una ficha
  // vieja: es una ficha rota. Ahí no se regala administración — se deja sin
  // llaves, que es lo seguro, y la persona ve que no puede y lo dice.
  return limpios;
}

/** ¿Puede esta persona hacer esto? */
export function puede(ficha: ConRoles | null | undefined, que: Capacidad): boolean {
  if (!ficha) return false;
  const mios = rolesDe(ficha);
  return ABRE[que].some((r) => mios.includes(r));
}

/** Atajo para lo que se pregunta a todas horas. */
export function esAdmin(ficha: ConRoles | null | undefined): boolean {
  return rolesDe(ficha).includes("admin");
}

/**
 * Cómo se llama cada rol en pantalla.
 *
 * En singular y en minúscula, porque se usa dentro de frases («Ana · alumna»)
 * y no como etiqueta suelta a gritos.
 */
export const NOMBRE_ROL: Record<Rol, string> = {
  admin: "administradora",
  alumno: "alumno",
  miembro: "miembro",
};

/**
 * Qué roles se pueden quitar sin dejar la casa vacía.
 *
 * El mismo cuidado que ya tienen las reglas de Firestore con `activo`: nadie
 * puede dejarse a sí mismo sin administración. Si Iris se quita el rol por
 * error, no queda una sola persona capaz de devolvérselo y hay que entrar a
 * mano en la consola de Firebase. Con una sola administradora viva, ese error
 * es irreversible desde dentro.
 */
export function puedeQuitarseAdmin(uidPropio: string, uidQueSeCambia: string): boolean {
  return uidPropio !== uidQueSeCambia;
}
