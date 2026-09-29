/*
 * EL EJEMPLO RESUELTO DEL MANUAL DE LA IMAGEN DEL ALMA.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/imagen-alma-roberto.ts
 *
 * El manual «5. IMAGEN DEL ALMA», capítulo 26.2, resuelve paso a paso la carta
 * de ROBERTO LÓPEZ CASTRO, 19/07/1951. Es el único sitio de los quince
 * manuales donde esta cuenta aparece hecha de principio a fin, así que es el
 * contraste bueno para toda la sesión 3 del estudio.
 *
 * LO QUE COINCIDE (y es casi todo):
 *   · la transformación 1=7, 2=8, 3=9 → 19/07/1951 se vuelve 79/07/7957
 *   · la suma de las cifras: 51
 *   · la reducción 5+1 y la IMAGEN DEL ALMA = 6
 *   · el triple bloqueo en la casilla 7 y el bloqueo suelto en la 5
 *   · la triple ayuda en la casilla 2 y la ayuda en la casilla 10
 *   · que el 0 no cuenta como bloqueo: marca lo que la persona proyecta
 *     («donde coincide el 0, es lo que proyecta la persona de cara a los
 *     demás», dice el manual con esas palabras)
 *
 * LO QUE NO COINCIDE, Y ESTÁ SIN RESOLVER A PROPÓSITO:
 *   el manual anota DOBLE bloqueo en la casilla 9 y DOBLE ayuda en la 4; el
 *   motor da uno y uno. En las dos, exactamente una de más en el manual.
 *
 *   De 79/07/57 sólo sale un 9, así que para que fueran dos habría que contar
 *   también las cifras del siglo (79) — y entonces el 7 pasaría a cuádruple y
 *   dejaría de cuadrar el triple que el manual sí anota.
 *
 *   No se toca la fórmula por esto. El reparto de las casillas está en el
 *   manual como DIBUJO, y el texto extraído no lo trae; cambiar una cuenta sin
 *   ver el dibujo es exactamente lo que produce un estudio falso que además
 *   parece correcto. Hace falta la foto de esa página (la 171) o un segundo
 *   ejemplo resuelto. Mientras tanto queda escrito aquí y avisa el verificador.
 *
 *   Y conviene recordar que el manual se equivoca alguna vez al sumar: en
 *   `guia-ejemplos.ts` está documentado el caso de TROMBOSIS, donde anota 130 y
 *   la suma real es 128. Que el manual diga «doble» no lo convierte en verdad
 *   automáticamente — pero tampoco al revés, y por eso no se decide sin datos.
 */
import { calcula } from "@/lib/engine";

const r = calcula({ nombre: "ROBERTO", apellido1: "LOPEZ", apellido2: "CASTRO", dia: 19, mes: 7, anio: 1951, anioUniversal: 2026 }) as unknown as {
  imagenAlma: { numero: number; suma: number; bloqueos: Record<string, number>; ayudas: Record<string, number>; fechaConvertida: { anio: string; dia: string } };
};
const A = r.imagenAlma;

const filas: Array<[string, unknown, unknown]> = [
  ["día transformado", A.fechaConvertida.dia, "79"],
  ["año transformado", A.fechaConvertida.anio, "7957"],
  ["suma de las cifras", A.suma, 51],
  ["imagen del alma", A.numero, 6],
  ["bloqueo en la casilla 7", A.bloqueos["7"], 3],
  ["bloqueo en la casilla 5", A.bloqueos["5"], 1],
  ["ayuda en la casilla 2", A.ayudas["2"], 3],
  ["ayuda en la casilla 10", A.ayudas["10"], 1],
];

let fallos = 0;
for (const [q, motor, manual] of filas) {
  const ok = String(motor) === String(manual);
  if (!ok) fallos++;
  console.log(`  ${ok ? "ok  " : "FALLA"} ${q.padEnd(26)} motor=${String(motor).padEnd(6)} manual=${manual}`);
}
console.log(`\n${filas.length - fallos} de ${filas.length} coinciden`);

console.log("\n  SIN RESOLVER (hace falta la foto de la página 171 del manual):");
console.log(`    casilla 9 de bloqueos  → motor=${A.bloqueos["9"] ?? 0}  manual=2`);
console.log(`    casilla 4 de ayudas    → motor=${A.ayudas["4"] ?? 0}  manual=2`);

if (fallos) process.exitCode = 1;
