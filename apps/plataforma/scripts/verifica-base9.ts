/*
 * ============================================================================
 * LA BASE 9, CONTRA EL ÚNICO EJEMPLO RESUELTO QUE HAY
 * ============================================================================
 *
 * Toda la base 9 se sostiene sobre un solo caso publicado: `GUSTAVO ANDRÉS
 * GIORDANO`, que aparece resuelto en el material de curso del que salieron las
 * fórmulas (Clase 3, «Inclusión de Base», y Clase 4, «Puente, Evolución,
 * Inconsciente»). Son seis casillas comprobables, y son las seis que separan
 * «esto está verificado» de «esto me lo he creído».
 *
 * Se ejecuta con:  npx tsx scripts/verifica-base9.ts
 *
 * Y hay una comprobación más que no viene del ejemplo sino de la aritmética: los
 * nueve habitantes tienen que sumar exactamente el número de letras del nombre.
 * Esa se pasa además sobre nombres al azar, porque es la que caza los fallos de
 * normalización —una tilde que no se quita, una Ñ que se pierde— que el ejemplo
 * no puede ver.
 */

import {
  calculaBase9,
  inclusion,
  letrasDe,
  valorLetra,
  red9,
  red1,
  doble,
  puenteDe,
} from "../src/lib/base9";

let fallos = 0;
function comprueba(que: string, obtenido: unknown, esperado: unknown) {
  const bien = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!bien) fallos++;
  console.log(
    `${bien ? "  ok  " : " FALLA"}  ${que.padEnd(52)} ${JSON.stringify(obtenido)}${
      bien ? "" : `   ← se esperaba ${JSON.stringify(esperado)}`
    }`
  );
}

console.log("\n══ EL EJEMPLO RESUELTO · GUSTAVO ANDRÉS GIORDANO ══\n");

const NOMBRE = "GUSTAVO ANDRÉS GIORDANO";
const inc = inclusion(NOMBRE);
const hab = inc.casas.map((c) => c.habitante);

comprueba("total de letras", inc.totalLetras, 21);
comprueba("los nueve habitantes", hab, [5, 1, 1, 3, 3, 3, 2, 0, 3]);
comprueba("suman el total de letras", inc.cuadra, true);

/* Las tres casillas de puente que el material publica. La tercera es la
   importante: casa vacía → puente 0, que NO es |0 − 8| = 8. */
comprueba("puente de la casa 1 (habitante 5)", inc.casas[0].puente, 4);
comprueba("puente de la casa 7 (habitante 2)", inc.casas[6].puente, 5);
comprueba("puente de la casa 8 (VACÍA → 0)", inc.casas[7].puente, 0);

console.log("\n══ LOS NÚMEROS DEL NOMBRE ══\n");

const r = calculaBase9({
  nombre: "GUSTAVO",
  apellido1: "ANDRÉS",
  apellido2: "GIORDANO",
  dia: 16,
  mes: 2,
  anio: 1987,
});

/* Calculados a mano letra a letra al escribir el módulo:
   GUSTAVO 7+3+1+2+1+4+6 = 24 · ANDRES 1+5+4+9+5+1 = 25 · GIORDANO
   7+9+6+9+4+1+5+6 = 47 · total 96. */
comprueba("expresión (todas las letras), bruto", r.expresion.bruto, 96);
comprueba("expresión, reducida", r.expresion.reducido, 6);
comprueba("alma (vocales), bruto", r.alma.bruto, 38);
comprueba("alma, reducida → MAESTRO 11", r.alma.reducido, 11);
comprueba("alma, marcada como maestro", r.alma.maestro, true);
comprueba("personalidad (consonantes), bruto", r.personalidad.bruto, 58);
comprueba("personalidad, reducida", r.personalidad.reducido, 4);
comprueba("personalidad, kármico en la cadena", r.personalidad.karmico, 13);
comprueba("alma + personalidad = expresión", r.alma.bruto + r.personalidad.bruto, r.expresion.bruto);
comprueba("equilibrio (iniciales G+A+G)", r.equilibrio.reducido, 6);
comprueba("inconsciente global (9 − casas vacías)", r.inconscienteGlobal, 8);

/* El camino de vida, las realizaciones y los desafíos se comprobaban aquí y ya
   no: los calcula engine.ts desde el manual de Iris, y tenerlos dos veces hizo
   que las dos copias se separaran (cuatro desafíos aquí, tres allí). */

console.log("\n══ LAS DOS REDUCCIONES, QUE NO SON LA MISMA ══\n");

comprueba("red9(37) = 1", red9(37), 1);
comprueba("red9(38) = 11, el maestro aguanta", red9(38), 11);
comprueba("red9(22) = 22", red9(22), 22);
comprueba("red9(33) = 33", red9(33), 33);
comprueba("red9(0) = 0, no 9", red9(0), 0);
comprueba("red1(38) = 2, sin maestros", red1(38), 2);
comprueba("red1(0) = 0", red1(0), 0);
comprueba("cadena de la personalidad", doble(58).pasos, [58, 13, 4]);

console.log("\n══ LA TABLA DE LETRAS ══\n");

comprueba("A = 1", valorLetra("A"), 1);
comprueba("I = 9", valorLetra("I"), 9);
comprueba("J = 1", valorLetra("J"), 1);
comprueba("R = 9", valorLetra("R"), 9);
comprueba("S = 1", valorLetra("S"), 1);
comprueba("Z = 8, no 7 (la errata de una fuente)", valorLetra("Z"), 8);
comprueba("la Ñ cuenta como N", letrasDe("ÑOÑO"), ["N", "O", "N", "O"]);
comprueba("las tildes se caen", letrasDe("ANDRÉS"), ["A", "N", "D", "R", "E", "S"]);
comprueba("la diéresis también", letrasDe("AGÜERO"), ["A", "G", "U", "E", "R", "O"]);
/* JOSE(4) + MARIA(5) + DEL(3) + PINO(4) = 16. El guion y los dos espacios se
   caen; si alguno contara, saldrían 17, 18 o 19. */
comprueba("espacios y guiones no cuentan", letrasDe("JOSÉ-MARÍA DEL PINO").length, 16);
comprueba("puente con casa vacía", puenteDe(0, 8), 0);
comprueba("puente normal", puenteDe(2, 7), 5);

console.log("\n══ LA ARITMÉTICA, SOBRE NOMBRES AL AZAR ══");
console.log("   (los nueve habitantes tienen que sumar el total de letras)\n");

const PIEZAS = [
  "MARÍA",
  "JOSÉ",
  "NÚÑEZ",
  "IRIS",
  "SOARES",
  "GERSON",
  "AGREDO",
  "ÑANDÚ",
  "GUZMÁN",
  "D'ANGELO",
  "SAN JOSÉ",
  "LLULL",
  "CHACÓN",
  "WŁADEK",
];
let malos = 0;
let probados = 0;
for (let i = 0; i < PIEZAS.length; i++) {
  for (let j = 0; j < PIEZAS.length; j++) {
    for (let k = 0; k < PIEZAS.length; k++) {
      const n = `${PIEZAS[i]} ${PIEZAS[j]} ${PIEZAS[k]}`;
      const x = inclusion(n);
      probados++;
      if (!x.cuadra) {
        malos++;
        if (malos < 4) console.log(`  FALLA  ${n}`);
      }
    }
  }
}
comprueba(`${probados} nombres, todos cuadran`, malos, 0);

console.log(
  `\n${fallos === 0 ? "✅ TODO CUADRA" : `❌ ${fallos} COMPROBACIÓN(ES) FALLAN`}\n`
);
process.exit(fallos === 0 ? 0 : 1);
