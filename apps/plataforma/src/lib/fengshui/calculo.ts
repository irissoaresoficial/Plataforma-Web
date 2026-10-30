/**
 * ============================================================================
 * EL MOTOR DEL FENG SHUI: ESCUELA DE LA BRÚJULA
 * ============================================================================
 *
 * Gerson, el 30 de octubre de 2026: «investiga cómo se hace bien el estudio de
 * Feng Shui y luopan». Y Feng Shui hay muchos. Aquí va el de la BRÚJULA, que es
 * el único en el que el luopan pinta algo:
 *
 *   · Las OCHO MANSIONES (Ba Zhai): el número Kua de cada persona, que sale de
 *     su año de nacimiento, y sus cuatro direcciones buenas y cuatro malas.
 *   · Las ESTRELLAS VOLADORAS (Xuan Kong Fei Xing): la carta de la vivienda,
 *     que sale de hacia dónde mira la fachada —lo que se mide con el luopan—
 *     y de en qué periodo de veinte años se construyó o se reformó.
 *   · Las ESTRELLAS DEL AÑO y las tres zonas que cada año no se tocan.
 *
 * El Feng Shui «occidental», el del bagua pegado a la puerta, NO está: no usa
 * brújula, y mezclar los dos en un mismo informe es lo primero que un
 * profesional reconoce como hecho sin saber.
 *
 * TODO LO DE AQUÍ ESTÁ CONTRASTADO, y las comprobaciones viven en
 * `__pruebas__/fengshui.ts`: las cartas publicadas del periodo 8 y del 9, la
 * tabla de las ocho mansiones derivada línea a línea, y las estrellas de 2026
 * y 2027. Donde las escuelas no se ponen de acuerdo, el código elige la
 * postura de la mayoría y lo dice en el comentario, en vez de esconderlo.
 *
 * Son funciones puras: sin pantalla, sin navegador, sin fecha de hoy metida
 * por dentro. Así se pueden probar con un comando.
 */

/* ------------------------------------------------------------------------- */
/*  LAS OCHO DIRECCIONES Y EL CENTRO                                          */
/* ------------------------------------------------------------------------- */

/** Las ocho direcciones, en castellano: Sur-Oeste es SO y Oeste es O. */
export type Dir = "N" | "NE" | "E" | "SE" | "S" | "SO" | "O" | "NO";
/** Las nueve casillas de una carta: las ocho direcciones y el centro. */
export type Casilla = Dir | "C";

/** En el sentido de las agujas del reloj, empezando por el Norte. */
export const DIRS: Dir[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

export const NOMBRE_DIR: Record<Casilla, string> = {
  N: "Norte",
  NE: "Noreste",
  E: "Este",
  SE: "Sureste",
  S: "Sur",
  SO: "Suroeste",
  O: "Oeste",
  NO: "Noroeste",
  C: "Centro",
};

/** El grado del centro de cada dirección. */
export const GRADO_DIR: Record<Dir, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SO: 225, O: 270, NO: 315 };

/** El número del cuadrado Lo Shu que «vive» en cada dirección. */
export const LOSHU: Record<Casilla, number> = { N: 1, SO: 2, E: 3, SE: 4, C: 5, NO: 6, O: 7, NE: 8, S: 9 };
/** Y al revés: en qué dirección vive cada número. El 5 no tiene casa. */
export const CASA_DE: Record<number, Dir> = { 1: "N", 2: "SO", 3: "E", 4: "SE", 6: "NO", 7: "O", 8: "NE", 9: "S" };

/** Los ocho trigramas del Cielo Posterior, con su elemento. */
export const TRIGRAMA: Record<Dir, { nombre: string; hanzi: string; elemento: Elemento; lineas: [0 | 1, 0 | 1, 0 | 1] }> = {
  /* `lineas` de abajo arriba: 1 entera (yang), 0 partida (yin). */
  N: { nombre: "Kan", hanzi: "坎", elemento: "agua", lineas: [0, 1, 0] },
  NE: { nombre: "Gen", hanzi: "艮", elemento: "tierra", lineas: [0, 0, 1] },
  E: { nombre: "Zhen", hanzi: "震", elemento: "madera", lineas: [1, 0, 0] },
  SE: { nombre: "Xun", hanzi: "巽", elemento: "madera", lineas: [0, 1, 1] },
  S: { nombre: "Li", hanzi: "離", elemento: "fuego", lineas: [1, 0, 1] },
  SO: { nombre: "Kun", hanzi: "坤", elemento: "tierra", lineas: [0, 0, 0] },
  O: { nombre: "Dui", hanzi: "兌", elemento: "metal", lineas: [1, 1, 0] },
  NO: { nombre: "Qian", hanzi: "乾", elemento: "metal", lineas: [1, 1, 1] },
};

export type Elemento = "agua" | "madera" | "fuego" | "tierra" | "metal";

/** Lleva cualquier ángulo a [0, 360). */
export const norm = (g: number) => ((g % 360) + 360) % 360;

/** La dirección (sector de 45°) en la que cae un grado. N va de 337,5 a 22,5. */
export function dirDe(grados: number): Dir {
  return DIRS[Math.floor(norm(grados + 22.5) / 45) % 8];
}

/* ------------------------------------------------------------------------- */
/*  LAS 24 MONTAÑAS                                                           */
/* ------------------------------------------------------------------------- */

export type Montana = {
  /** 0 = Ren (N1) … 23 = Hai (NO3). */
  i: number;
  pinyin: string;
  hanzi: string;
  /** «N1», «S2»…; NO y SO en castellano. */
  codigo: string;
  dir: Dir;
  /** Posición dentro de su dirección: 0 Tierra, 1 Cielo, 2 Persona. */
  pos: 0 | 1 | 2;
  /**
   * La polaridad de la Escuela de los Mutantes (Xuan Kong), que es la que
   * decide si una estrella vuela hacia delante o hacia atrás. OJO: no es la
   * misma que la del BaZi (allí Zi es agua yang). Para la carta, sólo ésta.
   */
  yang: boolean;
  elemento: Elemento;
  desde: number;
  hasta: number;
};

const M: Array<[string, string, Elemento]> = [
  ["Ren", "壬", "agua"], ["Zi", "子", "agua"], ["Gui", "癸", "agua"],
  ["Chou", "丑", "tierra"], ["Gen", "艮", "tierra"], ["Yin", "寅", "madera"],
  ["Jia", "甲", "madera"], ["Mao", "卯", "madera"], ["Yi", "乙", "madera"],
  ["Chen", "辰", "tierra"], ["Xun", "巽", "madera"], ["Si", "巳", "fuego"],
  ["Bing", "丙", "fuego"], ["Wu", "午", "fuego"], ["Ding", "丁", "fuego"],
  ["Wei", "未", "tierra"], ["Kun", "坤", "tierra"], ["Shen", "申", "metal"],
  ["Geng", "庚", "metal"], ["You", "酉", "metal"], ["Xin", "辛", "metal"],
  ["Xu", "戌", "tierra"], ["Qian", "乾", "metal"], ["Hai", "亥", "agua"],
];

/**
 * En las direcciones de número impar (N, E, S, O) la primera montaña es yang
 * y las otras dos yin; en las pares (NE, SE, SO, NO), al revés.
 */
export const MONTANAS: Montana[] = M.map(([pinyin, hanzi, elemento], i) => {
  const dir = DIRS[Math.floor(i / 3)];
  const pos = (i % 3) as 0 | 1 | 2;
  const impar = LOSHU[dir] % 2 === 1;
  const yang = impar ? pos === 0 : pos !== 0;
  const desde = norm(337.5 + 15 * i);
  return { i, pinyin, hanzi, codigo: `${dir}${pos + 1}`, dir, pos, yang, elemento, desde, hasta: norm(desde + 15) };
});

/** La montaña en la que cae un grado. Intervalos [desde, hasta). */
export function montanaDe(grados: number): Montana {
  return MONTANAS[Math.floor(norm(grados - 337.5) / 15) % 24];
}

/**
 * ¿LA MEDIDA CAE EN UNA RAYA?
 *
 * Entre montaña y montaña hay una raya, y una fachada que cae encima no tiene
 * carta fiable: es la «línea vacía» (Kong Wang). Si cae cerca pero no encima,
 * algunas escuelas usan otra carta, la de reemplazo (Ti Gua).
 *
 * Aquí NO se calcula la de reemplazo: las escuelas no se ponen de acuerdo ni en
 * el margen (3° o 4,5°) ni en qué hacer con el 5. Se avisa, que es lo honrado,
 * y quien lee decide si vuelve a medir.
 */
export type Raya = { tipo: "ninguna" | "cerca" | "vacia"; distancia: number; entreDirecciones: boolean };
export function raya(grados: number, vacia = 1.5, cerca = 3): Raya {
  const d = norm(grados - 7.5) % 15;
  const distancia = Math.min(d, 15 - d);
  /* La raya más cercana: ¿es de las que separan dos direcciones (22,5°, 67,5°…)? */
  const borde = norm(Math.round((grados - 7.5) / 15) * 15 + 7.5);
  const entreDirecciones = Math.abs(norm(borde - 22.5) % 45) < 1e-6;
  const tipo = distancia <= vacia ? "vacia" : distancia <= cerca ? "cerca" : "ninguna";
  return { tipo, distancia, entreDirecciones };
}

/* ------------------------------------------------------------------------- */
/*  LAS LECTURAS DEL LUOPAN                                                   */
/* ------------------------------------------------------------------------- */

/**
 * La media de varias lecturas de brújula. NO la media normal: la de 359° y
 * 1° es 0°, no 180°. Se hace con senos y cosenos.
 */
export function mediaCircular(grados: number[]): number | null {
  if (!grados.length) return null;
  let s = 0;
  let c = 0;
  for (const g of grados) {
    s += Math.sin((g * Math.PI) / 180);
    c += Math.cos((g * Math.PI) / 180);
  }
  if (Math.abs(s) < 1e-9 && Math.abs(c) < 1e-9) return null;
  return norm((Math.atan2(s, c) * 180) / Math.PI);
}

/** Lo que se separa la lectura más lejana de la media. Más de 5° = repetir. */
export function dispersion(grados: number[]): number {
  const m = mediaCircular(grados);
  if (m === null) return 0;
  return Math.max(0, ...grados.map((g) => {
    const d = Math.abs(norm(g - m));
    return Math.min(d, 360 - d);
  }));
}

/* ------------------------------------------------------------------------- */
/*  EL AÑO SOLAR: EMPIEZA EN LI CHUN, NO EL 1 DE ENERO                        */
/* ------------------------------------------------------------------------- */

/**
 * EL INSTANTE EN QUE EMPIEZA CADA AÑO SOLAR, de 1930 a 2030.
 *
 * Li Chun es cuando el Sol llega a 315° de longitud: cae el 3, el 4 o el 5 de
 * febrero según el año. Calculado con efemérides y contrastado con los valores
 * publicados (2017, 2021, 2024, 2025, 2026). Hora de Pekín (UTC+8): se resta 8
 * para pasarla a hora universal. Formato: [día de febrero, hora, minuto].
 */
const LI_CHUN: Record<number, [number, number, number]> = {
  1930: [4, 20, 51], 1931: [5, 2, 41], 1932: [5, 8, 29], 1933: [4, 14, 9], 1934: [4, 20, 4], 1935: [5, 1, 49],
  1936: [5, 7, 29], 1937: [4, 13, 26], 1938: [4, 19, 15], 1939: [5, 1, 11], 1940: [5, 7, 8], 1941: [4, 12, 50],
  1942: [4, 18, 49], 1943: [5, 0, 40], 1944: [5, 6, 23], 1945: [4, 12, 19], 1946: [4, 18, 4], 1947: [4, 23, 50],
  1948: [5, 5, 42], 1949: [4, 11, 23], 1950: [4, 17, 21], 1951: [4, 23, 14], 1952: [5, 4, 53], 1953: [4, 10, 46],
  1954: [4, 16, 31], 1955: [4, 22, 18], 1956: [5, 4, 12], 1957: [4, 9, 55], 1958: [4, 15, 49], 1959: [4, 21, 42],
  1960: [5, 3, 23], 1961: [4, 9, 22], 1962: [4, 15, 17], 1963: [4, 21, 8], 1964: [5, 3, 5], 1965: [4, 8, 46],
  1966: [4, 14, 38], 1967: [4, 20, 31], 1968: [5, 2, 7], 1969: [4, 7, 59], 1970: [4, 13, 46], 1971: [4, 19, 26],
  1972: [5, 1, 20], 1973: [4, 7, 4], 1974: [4, 13, 0], 1975: [4, 18, 59], 1976: [5, 0, 40], 1977: [4, 6, 33],
  1978: [4, 12, 27], 1979: [4, 18, 12], 1980: [5, 0, 9], 1981: [4, 5, 55], 1982: [4, 11, 45], 1983: [4, 17, 40],
  1984: [4, 23, 19], 1985: [4, 5, 12], 1986: [4, 11, 8], 1987: [4, 16, 52], 1988: [4, 22, 43], 1989: [4, 4, 27],
  1990: [4, 10, 14], 1991: [4, 16, 8], 1992: [4, 21, 48], 1993: [4, 3, 37], 1994: [4, 9, 31], 1995: [4, 15, 13],
  1996: [4, 21, 8], 1997: [4, 3, 2], 1998: [4, 8, 57], 1999: [4, 14, 57], 2000: [4, 20, 40], 2001: [4, 2, 29],
  2002: [4, 8, 24], 2003: [4, 14, 5], 2004: [4, 19, 56], 2005: [4, 1, 43], 2006: [4, 7, 27], 2007: [4, 13, 18],
  2008: [4, 19, 0], 2009: [4, 0, 50], 2010: [4, 6, 48], 2011: [4, 12, 33], 2012: [4, 18, 22], 2013: [4, 0, 13],
  2014: [4, 6, 3], 2015: [4, 11, 58], 2016: [4, 17, 46], 2017: [3, 23, 34], 2018: [4, 5, 29], 2019: [4, 11, 14],
  2020: [4, 17, 3], 2021: [3, 22, 59], 2022: [4, 4, 51], 2023: [4, 10, 43], 2024: [4, 16, 27], 2025: [3, 22, 10],
  2026: [4, 4, 2], 2027: [4, 9, 46], 2028: [4, 15, 31], 2029: [3, 21, 21], 2030: [4, 3, 8],
};

/** El instante de Li Chun en hora universal, o el 4 de febrero a mediodía si
 *  el año se sale de la tabla. */
export function liChunUTC(anio: number): Date {
  const t = LI_CHUN[anio];
  if (!t) return new Date(Date.UTC(anio, 1, 4, 12, 0));
  return new Date(Date.UTC(anio, 1, t[0], t[1] - 8, t[2]));
}

/**
 * EL AÑO SOLAR DE UNA FECHA DE NACIMIENTO.
 *
 * Quien nace antes de Li Chun pertenece, en Feng Shui, al año anterior: una
 * persona nacida el 20 de enero de 1990 es del año solar 1989.
 *
 * La hora de nacimiento casi nunca se sabe, y sólo importa el día exacto del
 * cambio. Ese día se resuelve suponiendo las 12:00 de España y se marca como
 * DUDOSO, para que quien lee pregunte la hora en vez de dar por buena una
 * suposición. `desfase` es la diferencia con la hora universal en invierno:
 * +1 en la península, 0 en Canarias.
 */
export function anioSolar(dia: number, mes: number, anio: number, desfase = 1): { anio: number; dudoso: boolean } {
  const lc = liChunUTC(anio);
  /* El día de Li Chun en hora local. */
  const local = new Date(lc.getTime() + desfase * 3600_000);
  const diaLc = local.getUTCDate();
  const mesLc = local.getUTCMonth() + 1;
  const antes = mes < mesLc || (mes === mesLc && dia < diaLc);
  const mismo = mes === mesLc && dia === diaLc;
  if (mismo) {
    const mediodia = Date.UTC(anio, mes - 1, dia, 12 - desfase, 0);
    return { anio: mediodia < lc.getTime() ? anio - 1 : anio, dudoso: true };
  }
  return { anio: antes ? anio - 1 : anio, dudoso: false };
}

/* ------------------------------------------------------------------------- */
/*  EL NÚMERO KUA Y LAS OCHO MANSIONES                                        */
/* ------------------------------------------------------------------------- */

const de1a9 = (n: number) => {
  const r = ((n % 9) + 9) % 9;
  return r === 0 ? 9 : r;
};

/**
 * EL NÚMERO KUA.
 *
 * Las fórmulas de siempre —«10 menos la suma de las dos últimas cifras» para
 * un hombre nacido en el siglo XX, y sus variantes— son la misma cuenta
 * escrita de cuatro formas. Aquí va de una sola:
 *
 *   fórmula masculina = (11 − año) mod 9      (0 → 9)
 *   fórmula femenina  = (año + 4) mod 9       (0 → 9)
 *
 * El 5 no tiene dirección propia: en la fórmula masculina pasa a 2 y en la
 * femenina a 8. Es igual en todas las fuentes.
 *
 * La fórmula es binaria porque así es el método clásico. Quien lee el estudio
 * elige cuál aplica a cada persona; la plataforma no lo deduce del género.
 */
export type Formula = "m" | "f";
export function kua(anioSolarNacimiento: number, formula: Formula): number {
  const n = formula === "m" ? de1a9(11 - anioSolarNacimiento) : de1a9(anioSolarNacimiento + 4);
  if (n === 5) return formula === "m" ? 2 : 8;
  return n;
}

export type Grupo = "este" | "oeste";
export const grupoDe = (k: number): Grupo => ([1, 3, 4, 9].includes(k) ? "este" : "oeste");

/** Las ocho estrellas de las mansiones, de la mejor a la peor. */
export type Mansion = "shengqi" | "tianyi" | "yannian" | "fuwei" | "huohai" | "liusha" | "wugui" | "jueming";
export const MANSIONES: Mansion[] = ["shengqi", "tianyi", "yannian", "fuwei", "huohai", "liusha", "wugui", "jueming"];
export const MANSION_BUENA: Record<Mansion, boolean> = {
  shengqi: true, tianyi: true, yannian: true, fuwei: true,
  huohai: false, liusha: false, wugui: false, jueming: false,
};

/**
 * LA TABLA DE LAS OCHO MANSIONES.
 *
 * Contrastada contra la derivación clásica (cambiar las líneas del trigrama
 * en el orden de Da You Nian) y contra la columna de Sing Tao. Ojo: algunas
 * webs en inglés intercambian Liu Sha y Jue Ming en los Kua 7 y 8; esta es la
 * versión clásica.
 */
export const BA_ZHAI: Record<number, Record<Mansion, Dir>> = {
  1: { shengqi: "SE", tianyi: "E", yannian: "S", fuwei: "N", huohai: "O", wugui: "NE", liusha: "NO", jueming: "SO" },
  2: { shengqi: "NE", tianyi: "O", yannian: "NO", fuwei: "SO", huohai: "E", wugui: "SE", liusha: "S", jueming: "N" },
  3: { shengqi: "S", tianyi: "N", yannian: "SE", fuwei: "E", huohai: "SO", wugui: "NO", liusha: "NE", jueming: "O" },
  4: { shengqi: "N", tianyi: "S", yannian: "E", fuwei: "SE", huohai: "NO", wugui: "SO", liusha: "O", jueming: "NE" },
  6: { shengqi: "O", tianyi: "NE", yannian: "SO", fuwei: "NO", huohai: "SE", wugui: "E", liusha: "N", jueming: "S" },
  7: { shengqi: "NO", tianyi: "SO", yannian: "NE", fuwei: "O", huohai: "N", wugui: "S", liusha: "SE", jueming: "E" },
  8: { shengqi: "SO", tianyi: "NO", yannian: "O", fuwei: "NE", huohai: "S", wugui: "N", liusha: "E", jueming: "SE" },
  9: { shengqi: "E", tianyi: "SE", yannian: "N", fuwei: "S", huohai: "NE", wugui: "O", liusha: "SO", jueming: "NO" },
};

/** Qué estrella de las mansiones cae en cada dirección para un número. */
export function mansionesPorDir(k: number): Record<Dir, Mansion> {
  const t = BA_ZHAI[k];
  const out = {} as Record<Dir, Mansion>;
  for (const m of MANSIONES) out[t[m]] = m;
  return out;
}

/**
 * LA CASA TAMBIÉN TIENE SU NÚMERO, y se lo da la dirección en la que SE
 * SIENTA —la espalda, lo contrario de la fachada—. Algunos libros populares
 * la nombran por la puerta; los textos clásicos, por el asiento.
 */
export function kuaDeCasa(gradosFachada: number): number {
  return LOSHU[dirDe(gradosFachada + 180)];
}

/* ------------------------------------------------------------------------- */
/*  LAS ESTRELLAS VOLADORAS                                                   */
/* ------------------------------------------------------------------------- */

/** El camino del vuelo: centro, NO, O, NE, S, N, SO, E, SE. */
export const VUELO: Casilla[] = ["C", "NO", "O", "NE", "S", "N", "SO", "E", "SE"];
export type Carta = Record<Casilla, number>;

/** Pone `inicio` en el centro y lo hace volar, sumando o restando uno. */
export function vuela(inicio: number, adelante: boolean): Carta {
  const c = {} as Carta;
  VUELO.forEach((k, i) => {
    c[k] = de1a9(inicio + (adelante ? i : -i));
  });
  return c;
}

/**
 * LOS PERIODOS DE VEINTE AÑOS. El 9 va del 4 de febrero de 2024 al 3 de
 * febrero de 2044. (Hay quien defiende que el 9 empezó más tarde; es una
 * postura minoritaria y no se sigue.)
 */
export function periodoDe(anioSolar: number): number {
  return (Math.floor((anioSolar - 1864) / 20) % 9 + 9) % 9 + 1;
}

export type Formacion = "wswsh" | "sssxs" | "doble-fachada" | "doble-asiento";

export type CartaNatal = {
  periodo: number;
  fachada: Montana;
  asiento: Montana;
  base: Carta;
  montana: Carta;
  agua: Carta;
  formacion: Formacion;
  /** Formaciones especiales, que sólo se nombran: no se puntúan. */
  especiales: Array<"diez-montana" | "diez-agua" | "padres" | "perlas" | "fuyin" | "fanyin">;
};

/** ¿Hacia dónde vuela un número que llega al centro desde una montaña? */
function haciaDelante(n: number, desde: Montana): boolean {
  /* El 5 no tiene trigrama: toma la polaridad de la propia montaña. */
  if (n === 5) return desde.yang;
  const casa = CASA_DE[n];
  return MONTANAS.find((m) => m.dir === casa && m.pos === desde.pos)!.yang;
}

/**
 * LA CARTA NATAL DE LA VIVIENDA.
 *
 * 1. El número del periodo va al centro y vuela hacia delante: es la carta
 *    base.
 * 2. El número que la base deja en la fachada va al centro como ESTRELLA DEL
 *    AGUA (dinero, oportunidades). El que deja en el asiento va como ESTRELLA
 *    DE LA MONTAÑA (salud, relaciones, las personas).
 * 3. Cada una vuela hacia delante o hacia atrás según la polaridad de la
 *    montaña que le corresponde.
 */
export function cartaNatal(periodo: number, gradosFachada: number): CartaNatal {
  const fachada = montanaDe(gradosFachada);
  const asiento = MONTANAS[(fachada.i + 12) % 24];
  const base = vuela(periodo, true);
  const w0 = base[fachada.dir];
  const m0 = base[asiento.dir];
  const agua = vuela(w0, haciaDelante(w0, fachada));
  const montana = vuela(m0, haciaDelante(m0, asiento));

  const P = periodo;
  let formacion: Formacion;
  if (montana[asiento.dir] === P && agua[fachada.dir] === P) formacion = "wswsh";
  else if (montana[fachada.dir] === P && agua[asiento.dir] === P) formacion = "sssxs";
  else if (montana[fachada.dir] === P && agua[fachada.dir] === P) formacion = "doble-fachada";
  else formacion = "doble-asiento";

  const especiales: CartaNatal["especiales"] = [];
  const todas = VUELO;
  if (todas.every((k) => base[k] + montana[k] === 10)) especiales.push("diez-montana");
  if (todas.every((k) => base[k] + agua[k] === 10)) especiales.push("diez-agua");
  const familia = (n: number) => n % 3;
  if (todas.every((k) => familia(base[k]) === familia(montana[k]) && familia(base[k]) === familia(agua[k]))) especiales.push("padres");
  /* Tres seguidos en cada casilla, dando la vuelta: 8-9-1 y 9-1-2 valen. */
  const seguidos = (t: number[]) =>
    new Set(t).size === 3 && [1, 2, 3, 4, 5, 6, 7, 8, 9].some((x) => [x, de1a9(x + 1), de1a9(x + 2)].every((n) => t.includes(n)));
  if (todas.every((k) => seguidos([base[k], montana[k], agua[k]]))) especiales.push("perlas");
  if (montana.C === 5 || agua.C === 5) {
    const c = montana.C === 5 ? montana : agua;
    if (DIRS.every((d) => c[d] === LOSHU[d])) especiales.push("fuyin");
    if (DIRS.every((d) => c[d] + LOSHU[d] === 10)) especiales.push("fanyin");
  }
  return { periodo, fachada, asiento, base, montana, agua, formacion, especiales };
}

/**
 * «ESTRELLA ENCERRADA» (Ru Qiu): el número del periodo en curso, en el centro
 * de la carta como agua o como montaña. Una casa del periodo 8 con un 9 de
 * agua en el centro, por ejemplo, tiene el dinero encerrado en el periodo 9.
 */
export function encerrada(c: CartaNatal, periodoActual: number): "agua" | "montana" | null {
  if (c.agua.C === periodoActual) return "agua";
  if (c.montana.C === periodoActual) return "montana";
  return null;
}

/* ------------------------------------------------------------------------- */
/*  EL AÑO: ESTRELLAS ANUALES Y LAS ZONAS QUE NO SE TOCAN                     */
/* ------------------------------------------------------------------------- */

const ANIMALES = ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"];
const TRONCOS: Elemento[] = ["madera", "madera", "fuego", "fuego", "tierra", "tierra", "metal", "metal", "agua", "agua"];
const ELEMENTO_NOMBRE: Record<Elemento, string> = { agua: "Agua", madera: "Madera", fuego: "Fuego", tierra: "Tierra", metal: "Metal" };

export type Anio = {
  anio: number;
  nombre: string;
  carta: Carta;
  /** La montaña del año: no se le hace frente ni se hacen obras en ella. */
  taiSui: Montana;
  /** La opuesta: tampoco se remueve. */
  suiPo: Montana;
  /** Los Tres Asesinos: una dirección entera. Se le da la espalda, no la cara. */
  sanSha: Dir;
  /** Dónde cae el 5 amarillo y el 2 negro ese año. */
  cincoAmarillo: Dir;
  dosNegro: Dir;
};

export function anioFengShui(anio: number): Anio {
  const rama = ((anio - 4) % 12 + 12) % 12;
  const tronco = ((anio - 4) % 10 + 10) % 10;
  const carta = vuela(de1a9(11 - anio), true);
  const taiSui = MONTANAS[(2 * rama + 1) % 24];
  const suiPo = MONTANAS[(taiSui.i + 12) % 24];
  /* Rata-Dragón-Mono → Sur; Buey-Serpiente-Gallo → Este;
     Tigre-Caballo-Perro → Norte; Conejo-Cabra-Cerdo → Oeste. */
  const sanSha: Dir = (["S", "E", "N", "O"] as Dir[])[rama % 4];
  const donde = (n: number) => DIRS.find((d) => carta[d] === n) ?? "N";
  return {
    anio,
    nombre: `${ANIMALES[rama]} de ${ELEMENTO_NOMBRE[TRONCOS[tronco]]}`,
    carta,
    taiSui,
    suiPo,
    sanSha,
    cincoAmarillo: donde(5),
    dosNegro: donde(2),
  };
}

/* ------------------------------------------------------------------------- */
/*  LA CUADRÍCULA SOBRE EL PLANO                                              */
/* ------------------------------------------------------------------------- */

/** El lado del plano por el que mira la fachada. */
export type Lado = "abajo" | "arriba" | "izquierda" | "derecha";
export const ANGULO_LADO: Record<Lado, number> = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 };

/** Las ocho casillas exteriores de la cuadrícula, por su ángulo en pantalla. */
export const CELDAS: Array<{ fila: number; col: number; angulo: number | null }> = [
  { fila: 0, col: 0, angulo: 315 }, { fila: 0, col: 1, angulo: 0 }, { fila: 0, col: 2, angulo: 45 },
  { fila: 1, col: 0, angulo: 270 }, { fila: 1, col: 1, angulo: null }, { fila: 1, col: 2, angulo: 90 },
  { fila: 2, col: 0, angulo: 225 }, { fila: 2, col: 1, angulo: 180 }, { fila: 2, col: 2, angulo: 135 },
];

/**
 * QUÉ DIRECCIÓN LE TOCA A CADA CASILLA DEL PLANO.
 *
 * La vivienda se parte en nueve casillas iguales siguiendo sus paredes (el
 * método de la cuadrícula, el habitual en estrellas voladoras), y la casilla
 * del centro de la fachada se lleva la dirección en la que cae la fachada.
 * Las demás siguen alrededor, de 45 en 45.
 */
export function casillaEnPlano(angulo: number | null, gradosFachada: number, lado: Lado): Casilla {
  if (angulo === null) return "C";
  return dirDe(gradosFachada + (angulo - ANGULO_LADO[lado]));
}
