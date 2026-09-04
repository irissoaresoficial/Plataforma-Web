/**
 * LA COPIA DE SEGURIDAD DE LOS ESTUDIOS
 *
 * Hoy los estudios de la plataforma viven sólo en el `localStorage` del
 * navegador donde se hicieron. No hay servidor, no hay copia, y no hay forma de
 * llevárselos a otro ordenador. Si Iris borra los datos del navegador, o cambia
 * de portátil, desaparecen: los suyos y los de sus clientas.
 *
 * Este archivo es lo primero que se arregla, y está escrito para servir dos
 * veces. La forma que se guarda en el fichero es la misma que subirá a la base
 * de datos cuando la haya, así que el día de la mudanza no hay que traducir
 * nada: se lee el respaldo y se escribe. Por eso vive en el paquete compartido
 * y no dentro de la plataforma.
 *
 * Dos decisiones que parecen detalles y no lo son:
 *
 *  - Al importar se FUNDE, no se sustituye. Traer un fichero viejo no puede
 *    borrar los estudios que se hicieron después de hacerlo.
 *  - Nada se da por bueno sin mirarlo. Un fichero cambiado a mano, recortado o
 *    de otro programa se rechaza entero y con un motivo en castellano, en vez
 *    de entrar a medias y dejar el historial roto.
 */

/** Sube de número sólo si un respaldo viejo deja de poder leerse. */
export const RESPALDO_VERSION = 1;

/** La marca del fichero. Sirve para no tragarse un JSON cualquiera. */
export const RESPALDO_FORMATO = 'es33.respaldo';

/**
 * Los datos con los que se levantó un estudio. Los guardados antes de que
 * existieran las empresas no traen `tipo` ni `genero`; al faltar se leen como
 * persona, que es lo que eran.
 */
export type FichaGuardada = {
  tipo?: string;
  nombre: string;
  ap1: string;
  ap2: string;
  dia: string;
  mes: string;
  anio: string;
  genero?: string;
};

export type EstudioGuardado = {
  id: string;
  nombre: string;
  /** Cuándo se hizo el estudio, como lo guarda la plataforma. */
  fecha: string;
  corazon: number;
  f: FichaGuardada;
};

/**
 * Las correcciones que Iris escribe encima del texto automático, por estudio y
 * por bloque. Es trabajo suyo, a mano, y es lo que más duele perder.
 */
export type Correcciones = Record<string, Record<string, string>>;

export type Respaldo = {
  formato: typeof RESPALDO_FORMATO;
  version: number;
  /** Cuándo se hizo la copia, en ISO. */
  creado: string;
  estudios: EstudioGuardado[];
  correcciones: Correcciones;
};

export type Lectura =
  | { ok: true; respaldo: Respaldo }
  | { ok: false; motivo: string };

/** Nombre de fichero con la fecha dentro, para que no se pisen entre ellos. */
export function nombreDeRespaldo(fecha = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `estudios-${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}.json`;
}

export function creaRespaldo(estudios: EstudioGuardado[], correcciones: Correcciones): Respaldo {
  return {
    formato: RESPALDO_FORMATO,
    version: RESPALDO_VERSION,
    creado: new Date().toISOString(),
    estudios,
    correcciones,
  };
}

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function fichaValida(v: unknown): v is FichaGuardada {
  if (!esObjeto(v)) return false;
  for (const k of ['nombre', 'ap1', 'ap2', 'dia', 'mes', 'anio']) {
    if (typeof v[k] !== 'string') return false;
  }
  return true;
}

function estudioValido(v: unknown): v is EstudioGuardado {
  return (
    esObjeto(v) &&
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.nombre === 'string' &&
    typeof v.fecha === 'string' &&
    typeof v.corazon === 'number' &&
    fichaValida(v.f)
  );
}

function correccionesValidas(v: unknown): v is Correcciones {
  if (!esObjeto(v)) return false;
  for (const porEstudio of Object.values(v)) {
    if (!esObjeto(porEstudio)) return false;
    for (const texto of Object.values(porEstudio)) {
      if (typeof texto !== 'string') return false;
    }
  }
  return true;
}

/**
 * Lee el contenido de un fichero y decide si es un respaldo de verdad.
 *
 * Devuelve el motivo en castellano y en cristiano, porque quien va a leerlo no
 * es un programador: es Iris delante de un fichero que no entra.
 */
export function leeRespaldo(texto: string): Lectura {
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'El fichero no es una copia de la plataforma: no se puede leer su contenido.' };
  }

  if (!esObjeto(crudo)) {
    return { ok: false, motivo: 'El fichero no tiene la forma de una copia de la plataforma.' };
  }
  if (crudo.formato !== RESPALDO_FORMATO) {
    return { ok: false, motivo: 'Ese fichero no es una copia de los estudios. Busca uno que empiece por «estudios-» y acabe en «.json».' };
  }
  if (typeof crudo.version !== 'number' || crudo.version > RESPALDO_VERSION) {
    return {
      ok: false,
      motivo: 'La copia se hizo con una versión más nueva de la plataforma. Actualiza la plataforma y vuelve a intentarlo.',
    };
  }
  if (!Array.isArray(crudo.estudios) || !crudo.estudios.every(estudioValido)) {
    return { ok: false, motivo: 'La copia está dañada: alguno de los estudios no tiene los datos completos. No se ha tocado nada.' };
  }
  if (crudo.correcciones !== undefined && !correccionesValidas(crudo.correcciones)) {
    return { ok: false, motivo: 'La copia está dañada: las correcciones escritas a mano no se pueden leer. No se ha tocado nada.' };
  }

  return {
    ok: true,
    respaldo: {
      formato: RESPALDO_FORMATO,
      version: crudo.version,
      creado: typeof crudo.creado === 'string' ? crudo.creado : new Date().toISOString(),
      estudios: crudo.estudios,
      correcciones: (crudo.correcciones as Correcciones) ?? {},
    },
  };
}

export type Fusion = {
  estudios: EstudioGuardado[];
  correcciones: Correcciones;
  /** Cuántos estudios del fichero no estaban aquí. */
  nuevos: number;
  /** Cuántos ya estaban, con el mismo identificador. */
  repetidos: number;
  /** Cuántos estudios de los de aquí no venían en el fichero, y se quedan. */
  conservados: number;
};

/**
 * Junta lo que hay en este navegador con lo que trae el fichero.
 *
 * Ante el mismo identificador manda lo que ya había aquí, no lo del fichero:
 * una copia es por definición más vieja que lo que está vivo, y traer una de
 * hace un mes no puede deshacer el trabajo de esta semana. Lo del fichero que
 * no exista aquí se añade; lo de aquí que no venga en el fichero se queda.
 */
export function fusiona(
  aqui: { estudios: EstudioGuardado[]; correcciones: Correcciones },
  fichero: { estudios: EstudioGuardado[]; correcciones: Correcciones }
): Fusion {
  const porId = new Map<string, EstudioGuardado>();
  for (const e of aqui.estudios) porId.set(e.id, e);

  let nuevos = 0;
  let repetidos = 0;
  for (const e of fichero.estudios) {
    if (porId.has(e.id)) repetidos++;
    else {
      porId.set(e.id, e);
      nuevos++;
    }
  }

  // Las correcciones se juntan bloque a bloque, no estudio a estudio: si el
  // fichero trae una corrección de un párrafo que aquí no está tocado, entra;
  // si el párrafo está tocado en los dos sitios, se queda el de aquí.
  const correcciones: Correcciones = {};
  for (const id of new Set([...Object.keys(fichero.correcciones), ...Object.keys(aqui.correcciones)])) {
    correcciones[id] = { ...(fichero.correcciones[id] ?? {}), ...(aqui.correcciones[id] ?? {}) };
  }

  return {
    estudios: [...porId.values()].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    correcciones,
    nuevos,
    repetidos,
    conservados: aqui.estudios.length,
  };
}
