/*
 * EL SEGUNDO ESTUDIO REAL DE IRIS: LARA MARIA SOARES CAMPOS.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/estudio-lara.ts
 *
 * `ficha-resuelta` comprueba la carta de MARIA IRIS. Ésta comprueba OTRA
 * persona distinta, de otro estudio que Iris entregó, y eso importa: una sola
 * ficha puede coincidir por casualidad en alguna fórmula; dos personas con
 * nombres y fechas distintas, no.
 *
 * Sale del PDF «ESTUDIO KABBALAH LARA», 24 páginas, entregado por Gerson el
 * 29 de septiembre de 2026.
 *
 * LO QUE NO ESTÁ AQUÍ, Y POR QUÉ. El estudio de Lara no trae su fecha de
 * nacimiento, así que sólo se pueden comprobar los números que salen del
 * NOMBRE. Todo lo que depende de la fecha —edad de cambio 40, camino de origen
 * El Ermitaño, transformación y destino El Emperador, kármico de relaciones 99,
 * cuentas abiertas 30/36/33— se comprobó buscando qué fecha los reproduce: hay
 * fechas que dan esos SEIS datos a la vez, lo que confirma las fórmulas.
 *
 * QUEDA UNA DUDA ABIERTA, Y ES HONESTO DEJARLA ESCRITA: los bloqueos de Lara
 * son 7, 8 y 9. El motor sabe producir ese trío —lo hacen 2.045 fechas— pero
 * ninguna de ellas da además su kármico 99 y sus cuentas 30/36/33. O el
 * documento mezcla datos, o los bloqueos se calculan de otra forma. CON LA
 * FECHA DE NACIMIENTO DE LARA esto se cierra en treinta segundos; sin ella no
 * se puede decidir, y adivinar sería peor que dejarlo señalado.
 */
import { analizaNombre } from "@/lib/engine";

const a = analizaNombre("LARA MARIA SOARES CAMPOS");

const filas: Array<[string, unknown, unknown]> = [
  ["número de esencia (vocales)", a.esencia, 53],
  ["número de ego (consonantes)", a.ego, 189],
  ["número de corazón", a.total, 242],
];

let fallos = 0;
for (const [q, motor, iris] of filas) {
  const ok = String(motor) === String(iris);
  if (!ok) fallos++;
  console.log(`  ${ok ? "ok  " : "FALLA"} ${q.padEnd(30)} motor=${String(motor).padEnd(8)} estudio de Iris=${iris}`);
}
console.log(`\n${filas.length - fallos} de ${filas.length} coinciden`);
if (fallos) process.exitCode = 1;
