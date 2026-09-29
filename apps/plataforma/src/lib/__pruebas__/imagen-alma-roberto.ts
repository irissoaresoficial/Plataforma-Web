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
 *   EL DIBUJO YA SE HA LEÍDO —se renderizó la página 171 como imagen— y lo que
 *   confirma es el reparto de las diez casillas, que el motor genera igual, y
 *   que la proyección cae donde el manual dice. La diferencia del 9 sigue sin
 *   regla limpia que la explique: de 79/07/57 sale un solo 9, y contar también
 *   el siglo para conseguir el segundo convertiría el triple 7 en cuádruple,
 *   rompiendo lo que el manual sí afirma dos veces, en texto y en dibujo.
 *
 *   Así que no se toca. Cambiar la cuenta para cuadrar un dato rompiendo otro
 *   es exactamente lo que produce un estudio falso que además parece correcto.
 *
 *   Y conviene recordar que el manual se equivoca alguna vez al sumar: en
 *   `guia-ejemplos.ts` está documentado el caso de TROMBOSIS, donde anota 130 y
 *   la suma real es 128. Que el manual diga «doble» no lo convierte en verdad
 *   automáticamente — pero tampoco al revés, y por eso no se decide sin datos.
 */
import { calcula } from "@/lib/engine";

const r = calcula({ nombre: "ROBERTO", apellido1: "LOPEZ", apellido2: "CASTRO", dia: 19, mes: 7, anio: 1951, anioUniversal: 2026 }) as unknown as {
  imagenAlma: { numero: number; suma: number; proyeccion: number; moviles: Record<string, number>; bloqueos: Record<string, number>; ayudas: Record<string, number>; fechaConvertida: { anio: string; dia: string } };
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
  ["la proyección cae en la casilla", A.proyeccion, 5],
];

/*
 * EL MAPA DE LAS CASILLAS, LEÍDO DEL DIBUJO DE LA PÁGINA 171.
 *
 * Cada casilla del cuadro lleva dos números: el grande, que la nombra, y uno
 * pequeño al lado. Ese pequeño es el que mueve la estructura según la imagen
 * del alma — con un 6, la casilla 1 lleva el 6, la 2 el 7, y así girando.
 *
 * El dibujo no venía en el texto extraído del PDF; se leyó renderizando la
 * página como imagen. Y confirma el reparto entero: el motor lo genera igual,
 * las diez casillas.
 */
const DIBUJO: Record<string, number> = { "1": 6, "2": 7, "3": 8, "4": 9, "5": 0, "6": 1, "7": 2, "8": 3, "9": 4, "10": 5 };
for (const casilla of Object.keys(DIBUJO)) {
  filas.push([`casilla ${casilla} lleva el`, (A as unknown as { moviles: Record<string, number> }).moviles?.[casilla], DIBUJO[casilla]]);
}

let fallos = 0;
for (const [q, motor, manual] of filas) {
  const ok = String(motor) === String(manual);
  if (!ok) fallos++;
  console.log(`  ${ok ? "ok  " : "FALLA"} ${q.padEnd(26)} motor=${String(motor).padEnd(6)} manual=${manual}`);
}
console.log(`\n${filas.length - fallos} de ${filas.length} coinciden`);

console.log("\n  SIN RESOLVER (el dibujo ya está leído; ver la cabecera):");
console.log(`    casilla 9 de bloqueos  → motor=${A.bloqueos["9"] ?? 0}  manual=2`);
console.log(`    casilla 4 de ayudas    → motor=${A.ayudas["4"] ?? 0}  manual=2`);

if (fallos) process.exitCode = 1;
