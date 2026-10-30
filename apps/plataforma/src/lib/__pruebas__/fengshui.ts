/*
 * EL FENG SHUI, CONTRA LO PUBLICADO.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/fengshui.ts
 *
 * Una carta de estrellas mal calculada se ve exactamente igual que una bien
 * calculada: nueve casillas con tres números cada una. Nadie lo nota mirando.
 * Por eso cada pieza del motor se compara aquí con un resultado que alguien
 * publicó antes, no con lo que el propio motor dice:
 *
 *   1. LAS DOS CARTAS DE EJEMPLO, casilla por casilla: periodo 9 con la
 *      fachada al Sur (S2) y periodo 8 con la fachada al Norte (N2).
 *   2. LA FORMACIÓN DE LAS 48 CARTAS de los periodos 8 y 9, contra la tabla
 *      que publican Skillon y fengshuied (doble asiento, doble fachada…).
 *   3. EL NÚMERO KUA de los ejemplos del curso de Lillian Too, y el cambio de
 *      año en Li Chun.
 *   4. LAS OCHO MANSIONES, derivadas a mano cambiando líneas del trigrama.
 *   5. LAS ESTRELLAS DE 2026 Y 2027, con sus tres zonas que no se tocan.
 */
import {
  BA_ZHAI,
  DIRS,
  MANSIONES,
  TRIGRAMA,
  anioFengShui,
  anioSolar,
  cartaNatal,
  casillaEnPlano,
  dirDe,
  encerrada,
  kua,
  mediaCircular,
  montanaDe,
  periodoDe,
  raya,
  type Casilla,
  type Dir,
  type Mansion,
} from "@/lib/fengshui/calculo";

let bien = 0;
let total = 0;
const mira = (que: string, sale: unknown, espera: unknown) => {
  total++;
  const a = JSON.stringify(sale);
  const b = JSON.stringify(espera);
  if (a === b) bien++;
  else console.log(`  ❌ FALLA ${que}: sale ${a}, se esperaba ${b}`);
};

/* ---- 1. LAS DOS CARTAS DE EJEMPLO ------------------------------------- */
type Fila = [Casilla, number, number, number]; // casilla, base, montaña, agua
const P9_S2: Fila[] = [
  ["SE", 8, 6, 3], ["S", 4, 1, 8], ["SO", 6, 8, 1],
  ["E", 7, 7, 2], ["C", 9, 5, 4], ["O", 2, 3, 6],
  ["NE", 3, 2, 7], ["N", 5, 9, 9], ["NO", 1, 4, 5],
];
const P8_N2: Fila[] = [
  ["SE", 7, 4, 3], ["S", 3, 8, 8], ["SO", 5, 6, 1],
  ["E", 6, 5, 2], ["C", 8, 3, 4], ["O", 1, 1, 6],
  ["NE", 2, 9, 7], ["N", 4, 7, 9], ["NO", 9, 2, 5],
];
for (const [titulo, periodo, grados, filas] of [
  ["periodo 9, fachada S2", 9, 180, P9_S2],
  ["periodo 8, fachada N2", 8, 0, P8_N2],
] as const) {
  const c = cartaNatal(periodo, grados);
  for (const [k, b, m, w] of filas) mira(`${titulo} · ${k}`, [c.base[k], c.montana[k], c.agua[k]], [b, m, w]);
  mira(`${titulo} · formación`, c.formacion, "doble-asiento");
}
mira("periodo 9 S2 es «fan yin» de la montaña", cartaNatal(9, 180).especiales.includes("fanyin"), true);

/* ---- 2. LA FORMACIÓN DE LAS 48 CARTAS --------------------------------- */
const F: Record<string, string> = { DF: "doble-fachada", DS: "doble-asiento", WS: "wswsh", SS: "sssxs" };
const TABLA: Record<number, Record<string, string>> = {
  8: {
    Ren: "DF", Zi: "DS", Gui: "DS", Chou: "WS", Gen: "SS", Yin: "SS", Jia: "DF", Mao: "DS", Yi: "DS",
    Chen: "SS", Xun: "WS", Si: "WS", Bing: "DS", Wu: "DF", Ding: "DF", Wei: "WS", Kun: "SS", Shen: "SS",
    Geng: "DS", You: "DF", Xin: "DF", Xu: "SS", Qian: "WS", Hai: "WS",
  },
  9: {
    Ren: "DS", Zi: "DF", Gui: "DF", Chou: "DS", Gen: "DF", Yin: "DF", Jia: "DS", Mao: "DF", Yi: "DF",
    Chen: "DF", Xun: "DS", Si: "DS", Bing: "DF", Wu: "DS", Ding: "DS", Wei: "DF", Kun: "DS", Shen: "DS",
    Geng: "DF", You: "DS", Xin: "DS", Xu: "DS", Qian: "DF", Hai: "DF",
  },
};
for (const p of [8, 9]) {
  for (let i = 0; i < 24; i++) {
    const grados = 337.5 + 15 * i + 7.5;
    const m = montanaDe(grados);
    mira(`periodo ${p} · fachada ${m.codigo} ${m.pinyin}`, cartaNatal(p, grados).formacion, F[TABLA[p][m.pinyin]]);
  }
}
/* Las especiales que la tabla publicada nombra. */
mira("periodo 8 NE1 Chou: combinación de diez (agua)", cartaNatal(8, 30).especiales.includes("diez-agua"), true);
mira("periodo 8 SE1 Chen: cadena de perlas", cartaNatal(8, 120).especiales.includes("perlas"), true);
mira("periodo 8 NE2 Gen: cadena de padres", cartaNatal(8, 45).especiales.includes("padres"), true);
mira("periodo 9 NO2 Qian: combinación de diez (agua)", cartaNatal(9, 315).especiales.includes("diez-agua"), true);
mira("periodo 8 NO2 encerrada en el 9 (agua)", encerrada(cartaNatal(8, 315), 9), "agua");

/* ---- 3. EL NÚMERO KUA Y EL AÑO SOLAR ---------------------------------- */
mira("Kua fórmula masculina, 2002", kua(2002, "m"), 7);
mira("Kua fórmula femenina, 2004", kua(2004, "f"), 1);
mira("Kua fórmula masculina, 1999", kua(1999, "m"), 1);
mira("Kua fórmula femenina, 1999 (5 → 8)", kua(1999, "f"), 8);
mira("Kua fórmula masculina, 1995 (5 → 2)", kua(1995, "m"), 2);
mira("Kua fórmula femenina, 1990 (5 → 8)", kua(1990, "f"), 8);
mira("Kua fórmula masculina, 1990", kua(1990, "m"), 1);
mira("nacida el 20 de enero de 1990 es del año solar 1989", anioSolar(20, 1, 1990).anio, 1989);
mira("nacida el 5 de febrero de 1990 es del año solar 1990", anioSolar(5, 2, 1990), { anio: 1990, dudoso: false });
mira("nacida el 4 de febrero de 1990 es día dudoso", anioSolar(4, 2, 1990).dudoso, true);
mira("en España, Li Chun de 2026 cayó el 3 de febrero por la noche", anioSolar(3, 2, 2026).dudoso, true);
mira("periodo de 2026", periodoDe(2026), 9);
mira("periodo de 2010", periodoDe(2010), 8);
mira("periodo de 1995", periodoDe(1995), 7);

/* ---- 4. LAS OCHO MANSIONES, CAMBIANDO LÍNEAS -------------------------- */
const porLineas = new Map(DIRS.map((d) => [TRIGRAMA[d].lineas.join(""), d]));
const ORDEN: Array<[number, Mansion]> = [
  [2, "shengqi"], [1, "wugui"], [0, "yannian"], [1, "liusha"], [2, "huohai"], [1, "tianyi"], [0, "jueming"], [1, "fuwei"],
];
for (const k of [1, 2, 3, 4, 6, 7, 8, 9]) {
  const casa = DIRS.find((d) => TRIGRAMA[d].lineas && ({ N: 1, SO: 2, E: 3, SE: 4, NO: 6, O: 7, NE: 8, S: 9 } as Record<Dir, number>)[d] === k)!;
  let l = [...TRIGRAMA[casa].lineas];
  const derivada = {} as Record<Mansion, Dir>;
  for (const [linea, estrella] of ORDEN) {
    l = l.map((v, i) => (i === linea ? 1 - v : v)) as typeof l;
    derivada[estrella] = porLineas.get(l.join(""))!;
  }
  for (const m of MANSIONES) mira(`Kua ${k} · ${m}`, BA_ZHAI[k][m], derivada[m]);
}

/* ---- 5. EL AÑO -------------------------------------------------------- */
const a26 = anioFengShui(2026);
mira("2026 se llama", a26.nombre, "Caballo de Fuego");
mira("2026 · estrellas", DIRS.map((d) => a26.carta[d]).concat(a26.carta.C), [6, 4, 8, 9, 5, 7, 3, 2, 1]);
mira("2026 · Tai Sui", a26.taiSui.codigo, "S2");
mira("2026 · Sui Po", a26.suiPo.codigo, "N2");
mira("2026 · Tres Asesinos", a26.sanSha, "N");
mira("2026 · 5 amarillo", a26.cincoAmarillo, "S");
mira("2026 · 2 negro", a26.dosNegro, "NO");
const a27 = anioFengShui(2027);
mira("2027 se llama", a27.nombre, "Cabra de Fuego");
mira("2027 · estrellas", DIRS.map((d) => a27.carta[d]).concat(a27.carta.C), [5, 3, 7, 8, 4, 6, 2, 1, 9]);
mira("2027 · Tai Sui", a27.taiSui.codigo, "SO1");
mira("2027 · Sui Po", a27.suiPo.codigo, "NE1");
mira("2027 · Tres Asesinos", a27.sanSha, "O");
mira("2027 · 5 amarillo", a27.cincoAmarillo, "N");

/* ---- Y LAS PIEZAS PEQUEÑAS ------------------------------------------- */
mira("359° y 1° dan una media de 0°", Math.round(mediaCircular([359, 1])! * 10) / 10 % 360, 0);
mira("N2 Zi va de 352,5 a 7,5", [montanaDe(352.5).pinyin, montanaDe(7.49).pinyin, montanaDe(7.5).pinyin], ["Zi", "Zi", "Gui"]);
mira("22,4° es N; 22,5° es NE", [dirDe(22.4), dirDe(22.5)], ["N", "NE"]);
mira("180° no cae en raya", raya(180).tipo, "ninguna");
mira("172° cae en la línea vacía", raya(172).tipo, "vacia");
mira("170° está cerca de una raya", raya(170).tipo, "cerca");
mira("fachada al SE (150°) abajo en el plano: arriba es NO", casillaEnPlano(0, 150, "abajo"), "NO");
mira("fachada al SE (150°) abajo en el plano: a la derecha, NE", casillaEnPlano(90, 150, "abajo"), "NE");

console.log(`\n  ${bien} de ${total} coinciden\n`);
process.exit(bien === total ? 0 : 1);
