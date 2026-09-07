/**
 * LA FORMA DE LO QUE SE GUARDA EN EL DESPACHO
 *
 * El despacho son las tres cosas que Iris lleva a mano y que no son un estudio:
 * las sesiones apuntadas, la gente que pasa por ellas y lo que se le factura.
 *
 * Nada de esto es un tipo nuevo por gusto. `@iris/datos` ya tenía escrita la
 * forma de una persona y la de una cita — es el contrato que comparten la web y
 * la plataforma — y se usa tal cual siempre que sirve. Aquí sólo se apartan de
 * él dos cosas, y las dos con motivo escrito debajo.
 */

import type { Cita, Consentimiento, Origen, Persona } from "@iris/datos";

export type { Cita, Consentimiento, Origen };

/** Cómo se llama cada clase de cita cuando se le enseña a Iris. */
export const TIPOS_CITA: Array<{ k: Cita["tipo"]; label: string }> = [
  { k: "sesion", label: "Sesión" },
  { k: "seguimiento", label: "Seguimiento" },
  { k: "sinergia", label: "Sinergia" },
];

/** Y cada estado. «Pedida» es la que ha entrado por la web y aún no ha mirado. */
export const ESTADOS_CITA: Array<{ k: Cita["estado"]; label: string }> = [
  { k: "pedida", label: "Pedida" },
  { k: "confirmada", label: "Confirmada" },
  { k: "hecha", label: "Hecha" },
  { k: "anulada", label: "Anulada" },
];

export const etiquetaTipo = (t: Cita["tipo"]) => TIPOS_CITA.find((x) => x.k === t)?.label ?? t;
export const etiquetaEstado = (e: Cita["estado"]) => ESTADOS_CITA.find((x) => x.k === e)?.label ?? e;

/* ------------------------------------------------------------------ */
/*  CLIENTES                                                           */
/* ------------------------------------------------------------------ */

/**
 * Una nota de Iris, con su fecha. Se apuntan después de una sesión y no se
 * pisan unas a otras: lo que se escribió en marzo sigue diciendo lo de marzo.
 */
export type Nota = {
  id: string;
  /** Cuándo se escribió, en ISO. */
  fecha: string;
  texto: string;
};

/**
 * La ficha de una persona.
 *
 * Es la `Persona` de `@iris/datos` —el mismo contrato que usa la web— con dos
 * diferencias, y las dos son a propósito:
 *
 *  · `consentimiento` puede ser `null`. En la web la persona rellena un
 *    formulario y acepta un texto concreto, así que ahí siempre hay uno. Aquí
 *    Iris apunta a alguien después de una llamada, y ese consentimiento
 *    sencillamente no existe todavía. Rellenarlo con la fecha de hoy para que
 *    el tipo cuadre sería inventarse un registro legal, que es exactamente lo
 *    que la casa no hace.
 *
 *  · `notas` es una lista con fecha en vez de un texto corrido. Lo que Iris
 *    quiere es «lo que apunté el día que la vi», no un campo que se reescribe
 *    encima de sí mismo.
 *
 * Se escribe como `Omit<Persona, …>` y no copiando los campos para que quede
 * soldado al contrato: si mañana `Persona` cambia, el compilador avisa aquí.
 */
export type Cliente = Omit<Persona, "consentimiento" | "notas"> & {
  consentimiento: Consentimiento | null;
  notas: Nota[];
  /**
   * Los datos que hacen falta para facturarle, si es que se le va a facturar.
   * Van aquí y no en la factura porque son de la persona: se escriben una vez y
   * la factura se queda una copia congelada de ellos. Pueden faltar: a un
   * particular se le puede emitir una factura sin NIF ni domicilio.
   */
  nif?: string;
  direccion?: string;
};

/* ------------------------------------------------------------------ */
/*  AVISOS                                                             */
/* ------------------------------------------------------------------ */

/**
 * UN AVISO QUE YA SE HA VISTO.
 *
 * Los avisos no se guardan: se calculan cada vez a partir de las sesiones, las
 * fichas y las facturas, que es lo único que hay. Lo que sí hay que guardar es
 * cuáles ya ha mirado Iris, o cada mañana volvería a encontrarse los mismos.
 *
 * POR QUÉ NO BASTA CON EL IDENTIFICADOR, y aquí está toda la gracia.
 *
 * «Hace tres meses que no ves a Mónica» se marca como visto un martes. El
 * miércoles la misma situación genera «hace tres meses y un día», que es otro
 * texto y el mismo aviso: si sólo se guardara el identificador y éste llevara
 * dentro los días, volvería a salir. Y si el identificador no llevara los días,
 * el aviso quedaría callado para siempre — también el día que Mónica vuelva,
 * tenga una sesión y se enfríe otra vez, que es justo cuando hay que avisar.
 *
 * Por eso se guardan dos cosas: QUÉ aviso era (`id`, estable — la persona, la
 * factura, el día) y EN QUÉ ESTADO estaba cuando se calló (`sello`). Mientras el
 * sello no cambie, el aviso sigue callado. Cuando el estado cambia de verdad
 * —Mónica tiene una sesión nueva— el sello cambia y el aviso puede volver.
 */
export type AvisoVisto = {
  id: string;
  sello: string;
  /** Cuándo se marcó, en ISO. Sólo sirve para poder limpiar lo viejo. */
  cuando: string;
};

/* ------------------------------------------------------------------ */
/*  FACTURAS                                                           */
/* ------------------------------------------------------------------ */

/** Los datos que la ley pide de las dos partes de una factura. */
export type DatosFiscales = {
  /** Nombre y apellidos, o la razón social. */
  nombre: string;
  /** NIF o CIF. */
  nif: string;
  /** Domicilio fiscal completo. */
  direccion: string;
};

export type LineaFactura = {
  concepto: string;
  cantidad: number;
  /** Precio por unidad, sin IVA. */
  precio: number;
};

/**
 * Tres estados y ni uno más:
 *
 *  · `borrador` — todavía no es una factura. No tiene número y se puede
 *    cambiar y tirar a la basura sin que pase nada.
 *  · `emitida` — ya es un documento. Tiene número y no se toca.
 *  · `anulada` — se emitió y se ha dejado sin efecto. Conserva su número y su
 *    sitio en la serie: por eso anular NO es lo mismo que borrar.
 */
export type EstadoFactura = "borrador" | "emitida" | "anulada";

export type Factura = {
  id: string;
  /**
   * La serie es el año. Dentro de cada año la numeración empieza en 1 y sube de
   * uno en uno, que es como se numeran las facturas en España.
   */
  serie: string;
  /** Correlativo dentro de la serie. Vale 0 mientras es un borrador: el número
   *  no se reserva al empezar a escribir, se asigna al emitir. */
  numero: number;
  /** Fecha de la factura, AAAA-MM-DD. */
  fecha: string;
  estado: EstadoFactura;

  /**
   * A quién se factura y quién factura, COPIADOS al emitir y no enlazados.
   *
   * Una factura es un documento, no una ventana a la ficha del cliente. Si la
   * persona se muda el año que viene, la factura del año pasado tiene que
   * seguir diciendo la dirección que tenía entonces; si se enlazara a la ficha,
   * cambiaría sola y dejaría de valer como documento.
   */
  cliente: DatosFiscales;
  /** La ficha de la que salió, para poder volver a ella. Puede no haberla. */
  clienteId: string | null;
  /** Nulo mientras es borrador: al emitir se congela el emisor de ese momento. */
  emisor: DatosFiscales | null;

  lineas: LineaFactura[];
  /** Tipo de IVA aplicado, en tanto por ciento. */
  iva: number;
  /** Lo que Iris quiera añadir al pie: forma de pago, número de cuenta… */
  notas: string;

  creada: string;
  /** Cuándo se emitió, en ISO. Sólo lo tienen las emitidas y las anuladas. */
  emitida?: string;
  /** Por qué se anuló. Una anulación sin motivo no se sostiene. */
  motivoAnulacion?: string;
};

/** El número tal y como se lee y se escribe: «2026/003». */
export function numeroDe(f: Factura): string {
  return f.numero > 0 ? `${f.serie}/${String(f.numero).padStart(3, "0")}` : "Sin número";
}

export type Totales = { base: number; cuota: number; total: number };

/**
 * Los totales se calculan, no se guardan. Guardar un total es guardar dos veces
 * el mismo dato: el día que no cuadre con las líneas, ninguno de los dos sirve.
 */
export function totales(f: Pick<Factura, "lineas" | "iva">): Totales {
  const base = f.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  // Se redondea a céntimos aquí y no al pintar: si cada sitio redondea por su
  // cuenta, la base y el total acaban discrepando en un céntimo.
  const redondea = (n: number) => Math.round(n * 100) / 100;
  const b = redondea(base);
  const cuota = redondea((b * f.iva) / 100);
  return { base: b, cuota, total: redondea(b + cuota) };
}

/** «80,00 €», que es como se escribe en castellano. */
export function euros(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}
