"use client";

/**
 * ============================================================================
 * LO QUE CUESTA LA PUBLICIDAD, DENTRO DE CASA
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «quiero que la plataforma en la parte de
 * métricas me muestre gastos, cuántas personas entran, quiero ver todos los
 * datos», y que lo vea también quien lleve Desórdenes Amorosos.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTO ES UNA COLECCIÓN Y NO UNA LLAMADA A META
 * ---------------------------------------------------------------------------
 * Lo natural sería que la plataforma le preguntara a Meta cada vez que alguien
 * abre la pantalla. No se puede, y el motivo no es técnico sino de permisos:
 *
 *   · La cuenta publicitaria que está gastando NO pertenece a ningún
 *     portafolio de negocio (su `business_id` viene vacío). Es una cuenta
 *     personal.
 *   · Los tokens de «usuario del sistema», que son los que no caducan, viven
 *     DENTRO de un portafolio y sólo alcanzan lo que ese portafolio posee. A
 *     esta cuenta no la alcanzan.
 *   · Lo único que quedaba era un token de usuario, que caduca cada 60 días y
 *     hay que renovar a mano. El día que caduque, esta pantalla se queda en
 *     blanco y nadie se entera hasta que alguien la mira.
 *
 * Así que el camino es el contrario: una vez al día, un proceso que SÍ tiene
 * acceso a Meta lee los números y escribe un documento aquí. La plataforma lee
 * de su propia base, como lee todo lo demás. Sin llaves en Vercel, sin nada que
 * caduque, y la pantalla sigue funcionando aunque Meta esté caído.
 *
 * LO QUE SE PIERDE A CAMBIO, y hay que saberlo: los números son de la última
 * vez que se escribieron, no del minuto. Con 10 € al día eso da igual —el gasto
 * de hoy son 10 €— pero si algún día el presupuesto sube de verdad, esto se
 * queda corto y habrá que resolver lo del token.
 *
 * ---------------------------------------------------------------------------
 * UN DOCUMENTO POR DÍA, Y EL DÍA ES LA LLAVE
 * ---------------------------------------------------------------------------
 * El identificador es la fecha en formato `2026-10-20`. No es decoración:
 * significa que escribir dos veces el mismo día PISA el dato en vez de
 * duplicarlo. Si el proceso diario falla y se repite, no quedan dos gastos de
 * martes sumándose en el total.
 *
 * ---------------------------------------------------------------------------
 * AQUÍ NO SE ESCRIBE NUNCA DESDE EL NAVEGADOR
 * ---------------------------------------------------------------------------
 * Este archivo sólo lee, y las reglas de `firebase/firestore.rules` tampoco
 * dejan otra cosa. Un número de gasto que alguien pudiera teclear desde la
 * pantalla dejaría de ser un dato de Meta para pasar a ser una opinión.
 */

import { collection, getDocs, orderBy, query, limit as topes } from "firebase/firestore";
import { nube } from "../firebase";

/**
 * Lo que se guarda de un día de campaña.
 *
 * Son las cifras que Meta da y que sirven para decidir algo. No está todo lo
 * que Meta ofrece: están las que contestan «¿cuánto me cuesta cada persona y
 * qué anuncio la trae?». Lo demás es ruido bonito.
 */
export type DiaCampana = {
  /** `2026-10-20`. Es también el identificador del documento. */
  dia: string;
  /** Euros gastados ese día. */
  gasto: number;
  /** Cuántas veces se enseñó un anuncio. */
  impresiones: number;
  /** Cuántas personas DISTINTAS lo vieron. */
  alcance: number;
  /** Clics en el enlace que lleva a la web. No incluye «me gusta» ni perfil. */
  clics: number;
  /**
   * Cuántos llegaron a CARGAR la página. Siempre son menos que los clics.
   *
   * La diferencia entre las dos cifras no habla del anuncio: habla de la web.
   * Gente que hace clic y cierra antes de que cargue. Si se pierde mucha ahí,
   * el problema es de velocidad y no de publicidad.
   */
  aterrizajes: number;
  /**
   * Cuánta gente dejó su correo ese día. Lo cuenta el proceso diario contra
   * `leads`, así que no puede discrepar de la realidad.
   *
   * ES UN RECUENTO Y NADA MÁS: ni correos, ni nombres, ni de dónde son. Aquí
   * puede leer cualquiera que esté dentro de la plataforma, incluida la
   * persona a quien Iris delegue un curso, y esa gente no tiene por qué ver la
   * lista de personas. Un número no es un dato personal; una lista sí.
   */
  apuntados: number;
  /** De esos, los que traían etiqueta de campaña. Los que costaron dinero. */
  apuntadosDePago: number;
  /**
   * Cuántas veces de media le salió el anuncio a la misma persona.
   *
   * Es el número que avisa de que el público se está quemando: por encima de
   * 2,5 la gente ya ha visto esto demasiadas veces y el coste sube solo.
   */
  frecuencia: number;
  /** Lo que ha pasado con cada vídeo, si ese día corrían vídeos. */
  video?: {
    /** Empezaron a verlo. */
    empiezan: number;
    /** Llegaron a la cuarta parte. */
    cuarto: number;
    /** Llegaron a la mitad. */
    mitad: number;
    /** Se lo vieron entero. */
    entero: number;
  };
  /** Cómo fue cada anuncio por separado ese día. */
  anuncios?: Array<{
    /** El nombre tal cual está en Meta: «V08 · Iris · Vivir la vida de otra persona». */
    nombre: string;
    gasto: number;
    clics: number;
  }>;
};

/** Un número que puede venir como texto, como número o no venir. */
function num(x: unknown): number {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const n = Number(x);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/**
 * Traduce un documento crudo a un día de campaña.
 *
 * Es tolerante a propósito. Lo escribe un proceso de fuera, y un día que
 * llegue con un campo de menos —porque ese día no corrían vídeos, por
 * ejemplo— tiene que leerse igual, con cero, y no tumbar la pantalla entera.
 */
function leeDia(id: string, d: Record<string, unknown>): DiaCampana {
  const v = d.video as Record<string, unknown> | undefined;
  const as = Array.isArray(d.anuncios) ? (d.anuncios as Array<Record<string, unknown>>) : [];
  return {
    dia: typeof d.dia === "string" ? d.dia : id,
    gasto: num(d.gasto),
    impresiones: num(d.impresiones),
    alcance: num(d.alcance),
    clics: num(d.clics),
    aterrizajes: num(d.aterrizajes),
    apuntados: num(d.apuntados),
    apuntadosDePago: num(d.apuntadosDePago),
    frecuencia: num(d.frecuencia),
    video: v
      ? {
          empiezan: num(v.empiezan),
          cuarto: num(v.cuarto),
          mitad: num(v.mitad),
          entero: num(v.entero),
        }
      : undefined,
    anuncios: as.length
      ? as.map((a) => ({
          nombre: typeof a.nombre === "string" ? a.nombre : "",
          gasto: num(a.gasto),
          clics: num(a.clics),
        }))
      : undefined,
  };
}

/**
 * Los últimos días de campaña, del más antiguo al más nuevo.
 *
 * Vienen ordenados al revés desde Firestore —los más nuevos primero, que es lo
 * que hace barato el `limit`— y se le da la vuelta aquí, porque un gráfico de
 * líneas se lee de izquierda a derecha y en orden de tiempo.
 *
 * SIN NUBE DEVUELVE LISTA VACÍA, NO EXPLOTA. La pantalla de métricas tiene que
 * poder pintarse aunque esto no esté: lo de la campaña es un bloque más, y un
 * bloque que falta no puede llevarse por delante los alumnos y los cursos.
 */
export async function ultimosDias(cuantos = 60): Promise<DiaCampana[]> {
  const base = nube();
  if (!base) return [];
  try {
    const r = await getDocs(query(collection(base, "campana"), orderBy("dia", "desc"), topes(cuantos)));
    return r.docs.map((x) => leeDia(x.id, x.data() as Record<string, unknown>)).reverse();
  } catch {
    /* Sin permiso o sin red: el bloque se queda sin datos y lo dice en
       pantalla. Es mejor que una pantalla en blanco sin explicación. */
    return [];
  }
}

/** Lo que suman varios días. Lo que se enseña arriba del todo. */
export type TotalCampana = {
  gasto: number;
  impresiones: number;
  alcance: number;
  clics: number;
  aterrizajes: number;
  apuntados: number;
  apuntadosDePago: number;
  /** Lo que cuesta cada persona apuntada por la campaña. Cero si no hay. */
  porApuntado: number;
  /** De cada cien que cargan la página, cuántas dejan el correo. */
  convierte: number;
  /** Lo que cuesta cada clic. Cero si todavía no hay clics. */
  porClic: number;
  /** De cada cien que ven el anuncio, cuántas hacen clic. */
  ctr: number;
  /** La frecuencia del último día con datos, que es la que importa hoy. */
  frecuencia: number;
  /** Desde cuándo y hasta cuándo hay datos. Vacío si no hay ninguno. */
  desde: string;
  hasta: string;
};

/**
 * Suma los días.
 *
 * EL ALCANCE NO SE SUMA Y ES LA TRAMPA DE TODO ESTO. Si el lunes el anuncio
 * llegó a 500 personas y el martes a 500, el total NO es 1.000: son casi las
 * mismas personas dos días seguidos. Sumarlo daría un número grande y falso que
 * además haría parecer baratísimo el coste por persona.
 *
 * Así que se coge el mayor de los días, que es lo único honrado que se puede
 * decir sin preguntarle a Meta por el alcance del periodo entero. Se queda
 * corto —el alcance real del mes es mayor que el del mejor día— y quedarse
 * corto en un número que se usa para decidir es el lado bueno del que
 * equivocarse.
 */
export function suma(dias: DiaCampana[]): TotalCampana {
  const t = dias.reduce(
    (a, d) => ({
      gasto: a.gasto + d.gasto,
      impresiones: a.impresiones + d.impresiones,
      alcance: Math.max(a.alcance, d.alcance),
      clics: a.clics + d.clics,
      aterrizajes: a.aterrizajes + d.aterrizajes,
      apuntados: a.apuntados + d.apuntados,
      apuntadosDePago: a.apuntadosDePago + d.apuntadosDePago,
    }),
    { gasto: 0, impresiones: 0, alcance: 0, clics: 0, aterrizajes: 0, apuntados: 0, apuntadosDePago: 0 },
  );
  const conDatos = dias.filter((d) => d.impresiones > 0);
  /* El denominador son los aterrizajes y no los clics: de los que hacen clic,
     una parte no llega a ver la página nunca, y cobrarle a la página una
     conversión que no tuvo ocasión de hacer la hace parecer peor de lo que es. */
  const base = t.aterrizajes > 0 ? t.aterrizajes : t.clics;
  return {
    ...t,
    porApuntado: t.apuntadosDePago > 0 ? t.gasto / t.apuntadosDePago : 0,
    convierte: base > 0 ? (t.apuntadosDePago / base) * 100 : 0,
    porClic: t.clics > 0 ? t.gasto / t.clics : 0,
    ctr: t.impresiones > 0 ? (t.clics / t.impresiones) * 100 : 0,
    frecuencia: conDatos.length ? conDatos[conDatos.length - 1].frecuencia : 0,
    desde: dias.length ? dias[0].dia : "",
    hasta: dias.length ? dias[dias.length - 1].dia : "",
  };
}
