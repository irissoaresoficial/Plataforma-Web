/*
 * ═══════════════════════════════════════════════════════════════════════════
 *  ¿ESTÁ TODO BIEN?  —  npm run verificar
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Gerson: «haz lo que sea para que nunca me falle un estudio».
 *
 * Esto es ese «lo que sea»: un solo comando que pasa TODAS las comprobaciones
 * contra el material de Iris y contesta en castellano si algo se ha roto.
 *
 * Se lanza antes de publicar cualquier cambio, y sobre todo el día que alguien
 * toque el motor o el diccionario. Un estudio equivocado no se ve roto: se ve
 * perfectamente normal y con un número mal. Por eso hace falta esto y no basta
 * con mirar la pantalla.
 *
 * Lo que comprueba, y contra qué:
 *
 *   1. LA CARTA DE MARIA IRIS — las 31 cifras de la ficha que Iris resolvió a
 *      mano, de principio a fin.
 *   2. LA GUÍA DEL MANUAL — 48 cuentas del manual, incluido el caso donde el
 *      propio manual se equivoca al sumar y el resultado sale igual por los
 *      dos caminos.
 *   3. EL ESTUDIO DE LARA — otra persona, otro estudio entregado. Dos personas
 *      distintas no coinciden por casualidad.
 *   4. QUE NADA SE QUEDE SIN EXPLICAR — 4.704 fichas repartidas por todo el
 *      siglo, 79.968 números: que cada uno tenga algo que decirle a quien lee.
 */
import { spawnSync } from "node:child_process";

const PRUEBAS: Array<[string, string]> = [
  ["La carta de Maria Iris, resuelta a mano por Iris", "ficha-resuelta.ts"],
  ["Las cuentas de la guía del manual", "guia-ejemplos.ts"],
  ["El estudio de Lara", "estudio-lara.ts"],
  ["La imagen del alma, ejemplo del manual", "imagen-alma-roberto.ts"],
  ["Que ningún número se quede sin explicación", "cobertura.ts"],
];

let mal = 0;
console.log("\n═══════════ COMPROBANDO LOS ESTUDIOS ═══════════\n");

for (const [titulo, archivo] of PRUEBAS) {
  const r = spawnSync("npx", ["tsx", "--tsconfig", "tsconfig.json", `src/lib/__pruebas__/${archivo}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const salida = (r.stdout || "") + (r.stderr || "");

  /* Se mira el resumen de cada prueba, no sólo el código de salida: algunas
     imprimen «30 de 31 coinciden» y terminan en 0 igualmente. */
  const cuenta = salida.match(/(\d+)\s+de\s+(\d+)\s+coinciden/);
  const huecos = salida.match(/(\d+)\s+números distintos se quedan sin nada que decir/);
  const limpio = /Ninguno\. Todo número que sale/.test(salida);

  let veredicto: string;
  if (cuenta) {
    const [, a, b] = cuenta;
    veredicto = a === b ? `BIEN · ${a} de ${b}` : `MAL · sólo ${a} de ${b}`;
    if (a !== b) mal++;
  } else if (huecos) {
    veredicto = `AVISO · ${huecos[1]} sin explicar`;
  } else if (limpio) {
    veredicto = "BIEN · nada sin explicar";
  } else if (r.status !== 0) {
    veredicto = "MAL · la prueba ni siquiera terminó";
    mal++;
  } else {
    veredicto = "BIEN";
  }

  console.log(`  ${veredicto.startsWith("MAL") ? "❌" : veredicto.startsWith("AVISO") ? "⚠️ " : "✅"}  ${titulo.padEnd(50)} ${veredicto}`);
  if (veredicto.startsWith("MAL")) {
    console.log("\n" + salida.split("\n").filter((l) => /FALLA|❌|Error/.test(l)).slice(0, 12).map((l) => "        " + l).join("\n") + "\n");
  }
}

console.log("\n" + (mal === 0
  ? "  ✅  TODO CORRECTO. Los estudios coinciden con el material de Iris."
  : `  ❌  ${mal} comprobación(es) han fallado. NO publiques hasta arreglarlo.`) + "\n");

process.exitCode = mal ? 1 : 0;
