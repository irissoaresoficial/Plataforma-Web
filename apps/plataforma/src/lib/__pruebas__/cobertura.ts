/*
 * ¿QUEDA ALGÚN NÚMERO SIN EXPLICAR EN UN ESTUDIO?
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/cobertura.ts
 *
 * El motor calcula bien —79 comprobaciones contra el material de Iris entre
 * `ficha-resuelta` y `guia-ejemplos`—, pero calcular no es explicar. Esta
 * prueba recorre 4.704 fichas repartidas por todo el siglo y comprueba que
 * cada número que sale acabe diciéndole algo a quien lee.
 *
 * ESTADO CONOCIDO AL ESCRIBIRLA: un solo hueco, el 62. El diccionario tiene el
 * 60, el 61, el 63 y el 64, y le falta el 62 — un agujero en mitad de una
 * serie continua, que es la forma que tiene una omisión al transcribir de
 * parecerse a una decisión. Hasta que Iris dé ese texto, quien tenga esencia o
 * ego 62 se queda sin esa lectura.
 *
 * HISTORIA, PORQUE AHORRA REPETIRLA: la primera versión de esto contó 320
 * números «sin ficha» y era un falso positivo. `ficha()` descompone los
 * números de tres o más cifras en sus partes —298 se lee por el 98 y el 29—
 * que es como se leen en Kábala. Lo que hay que comprobar no es si el número
 * está en el diccionario, sino si la persona ACABA LEYENDO ALGO.
 *
 * La primera pasada contó 320 números «sin ficha» y era un falso positivo:
 * `ficha()` está diseñada para descomponer los números grandes en sus partes
 * —298 se lee por el 98 y el 29— que es como se leen en Kábala.
 *
 * Así que lo que hay que comprobar no es si el número está en el diccionario,
 * sino si LA PERSONA ACABA LEYENDO ALGO: texto propio, o texto de sus partes.
 * Un número que no tiene ni lo uno ni lo otro es un hueco de verdad en el
 * estudio, y ésos son los que hay que encontrar.
 */
import { calcula, ficha } from "@/lib/engine";
import { KDATA as K } from "@/lib/kdata";

const NOMBRES = ["MARIA IRIS", "ANA", "JUAN CARLOS", "CARMEN", "JOSE LUIS", "LUCIA", "MIGUEL ANGEL", "PILAR", "FRANCISCO", "MONTSERRAT", "ROSA", "ANTONIO"];
const AP1 = ["SOARES", "GARCIA", "FERNANDEZ", "MUÑOZ", "DE LA TORRE", "SILVA", "JIMENEZ"];
const AP2 = ["CAMPOS", "LOPEZ", "RODRIGUEZ", "PEÑA", "SANTOS", "", "IGLESIAS"];
const FECHAS = [[24, 2, 1983], [7, 7, 1957], [30, 11, 1996], [3, 5, 2004], [29, 2, 1980], [1, 1, 1970], [31, 12, 1999], [15, 6, 2000]] as const;

/** ¿Se acaba leyendo algo de este número? Directo o por sus partes. */
function seExplica(n: number): "directo" | "arcano" | "partes" | "NADA" {
  const util = (t?: string | null) => (t || "").trim().length > 3;
  /* DEL 1 AL 22 MANDA EL ARCANO, no la lista de numeros. El diccionario de
     numeros empieza en el 10 a proposito: por debajo de 22, lo que se lee en
     Kabala es la carta, y esas estan todas con su texto largo. Sin esto la
     prueba daba por huecos el 2, el 6, el 8 y el 9, que tienen entre 3.400 y
     4.600 letras de lectura cada uno. */
  const arc = (K.arcanos as Record<string, { texto?: string; nombre?: string }>)[String(n)];
  if (n >= 1 && n <= 22 && arc && (util(arc.texto) || util(arc.nombre))) return "arcano";
  const f = ficha(n);
  if (!f) return "NADA";
  if (f.enDiccionario && (util(f.texto) || util(f.titulo))) return "directo";
  const buenas = (f.partes || []).filter((p) => util(p.texto) || util(p.titulo));
  if (buenas.length) return "partes";
  return "NADA";
}

const huecos = new Map<string, Set<number>>();
const porPartes = new Map<string, number>();
const anota = (m: Map<string, Set<number>>, k: string, n: number) => {
  if (!m.has(k)) m.set(k, new Set());
  m.get(k)!.add(n);
};

let fichas = 0, revisados = 0;
for (const nom of NOMBRES)
  for (const a1 of AP1)
    for (const a2 of AP2)
      for (const [d, m, y] of FECHAS) {
        const R = calcula({ nombre: nom, apellido1: a1, apellido2: a2, dia: d, mes: m, anio: y, anioUniversal: 2026 }) as unknown as {
          corazon: { valor: number }; nombre: { esencia: number; ego: number };
          cuentas: { cuentas: number[]; potenciales: number[]; karmico: number; lemaDeVida: number };
          vibraciones: { cuerpo: number; alma: number; espiritu: number; efectoSanador: number };
          afinidad: { diaMes: number; mesAnio: number };
        };
        fichas++;

        const mirar: Array<[string, number]> = [
          ["número de corazón", R.corazon.valor],
          ["esencia", R.nombre.esencia],
          ["ego", R.nombre.ego],
          ["número kármico", R.cuentas.karmico],
          ["lema de vida", R.cuentas.lemaDeVida],
          ["afinidad día+mes", R.afinidad.diaMes],
          ["afinidad mes+año", R.afinidad.mesAnio],
          ...R.cuentas.cuentas.map((n) => ["cuenta abierta", n] as [string, number]),
          ...R.cuentas.potenciales.map((n) => ["potencial arcaico", n] as [string, number]),
          ...Object.entries(R.vibraciones).map(([k, n]) => ["vibración " + k, n] as [string, number]),
        ];

        for (const [tipo, n] of mirar) {
          revisados++;
          const q = seExplica(n);
          if (q === "NADA") anota(huecos, tipo, n);
          else if (q !== "directo") porPartes.set(tipo + " (" + q + ")", (porPartes.get(tipo + " (" + q + ")") || 0) + 1);
        }
      }

console.log(`═══ ${fichas} fichas · ${revisados} números revisados ═══\n`);

console.log("SE EXPLICAN POR OTRA VÍA (normal en Kábala):");
for (const [t, n] of [...porPartes].sort((a, b) => b[1] - a[1])) console.log(`   ${String(n).padStart(5)} × ${t}`);

console.log("\nHUECOS DE VERDAD — ni texto propio ni texto de partes:");
if (huecos.size === 0) {
  console.log("   ✓ Ninguno. Todo número que sale en un estudio tiene algo que decir.");
} else {
  let total = 0;
  for (const [tipo, ns] of [...huecos].sort((a, b) => b[1].size - a[1].size)) {
    const l = [...ns].sort((a, b) => a - b);
    total += l.length;
    console.log(`   ❌ ${tipo.padEnd(22)} ${String(l.length).padStart(3)} distintos → ${l.slice(0, 26).join(", ")}${l.length > 26 ? " …" : ""}`);
  }
  console.log(`\n   ${total} números distintos se quedan sin nada que decir.`);
}
console.log(`\nDiccionario: ${Object.keys(K.numeros).length} números · ${Object.keys(K.arcanos).length} arcanos.`);
