/*
 * Contraste del motor con una ficha resuelta a mano de principio a fin:
 * MARIA IRIS SOARES CAMPOS, 24/2/1983 (NUEVA_FICHA_KABBALAH_IMPRIMIR.pdf).
 *
 * No es un test de unidad de una función suelta: es la comprobación de que
 * lo que sale por pantalla es lo mismo que Iris escribiría en el papel. Si
 * algún día una fórmula se toca, esto tiene que seguir dando 30 de 30.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/ficha-resuelta.ts
 */
import { calcula } from "@/lib/engine";

const r = calcula({ nombre: "MARIA IRIS", apellido1: "SOARES", apellido2: "CAMPOS", dia: 24, mes: 2, anio: 1983, anioUniversal: 2026 });

const esperado: Array<[string, unknown, unknown]> = [
  ["valor del nombre", r.valorNombre, 269],
  ["Nº corazón", r.corazon.valor, 298],
  ["valor vocales", r.nombre.esencia, 71],
  ["valor consonantes", r.nombre.ego, 198],
  ["edad de cambio", r.caminos.edadCambio, 29],
  ["arcano origen", r.caminos.origen.arcano, 11],
  ["arcano transformación", r.caminos.transformacion.arcano, 11],
  ["arcano destino", r.caminos.destino.arcano, 5],
  ["días de fuerza · 1ª suma", r.diasFuerza.primeraSuma, 17],
  // La hoja anota «17, 26, 8»: el conjunto es {8,17,26} y el principal —el
  // que va primero, y el que se dice en la lectura— es el 17, la primera suma.
  ["días de fuerza · conjunto", JSON.stringify([...r.diasFuerza.dias].sort((a, b) => a - b)), JSON.stringify([8,17,26])],
  ["días de fuerza · principal", r.diasFuerza.dias[0], 17],
  ["estructura · suma", r.estructura.suma, 40],
  ["estructura · tipo", r.estructura.tipo, 4],
  ["dinámicos", JSON.stringify([1,2,3,4,5,6,7,8,9,10].map((p) => r.estructura.dinamicos[p])), JSON.stringify([4,5,6,7,8,9,0,1,2,3])],
  ["aprendizajes (portales)", JSON.stringify(Object.keys(r.estructura.aprendizajes).map(Number).sort((a,b)=>a-b)), JSON.stringify([1,2,5,10])],
  ["aprendizaje portal 2 · veces", r.estructura.aprendizajes[2], 2],
  ["maestrías (portales)", JSON.stringify(r.estructura.maestrias), JSON.stringify([3,4,6,7,8,9])],
  ["escudos (portales)", JSON.stringify(Object.keys(r.estructura.escudos).map(Number).sort((a,b)=>a-b)), JSON.stringify([3,4,5,8])],
  ["imagen del alma", r.imagenAlma.numero, 8],
  ["cuentas · fila espíritu", JSON.stringify([r.cuentas.espiritu.dia, r.cuentas.espiritu.mes, r.cuentas.espiritu.anio, r.cuentas.espiritu.total]), JSON.stringify([6,2,11,19])],
  ["cuentas · fila alma", JSON.stringify([r.cuentas.alma.dia, r.cuentas.alma.mes, r.cuentas.alma.anio, r.cuentas.alma.total]), JSON.stringify([12,8,17,37])],
  ["cuentas · fila materia", JSON.stringify([r.cuentas.cuerpo.dia, r.cuentas.cuerpo.mes, r.cuentas.cuerpo.anio, r.cuentas.cuerpo.total]), JSON.stringify([9,5,11,25])],
  ["potenciales arcaicos", JSON.stringify(r.cuentas.potenciales), JSON.stringify([27,15,39])],
  ["Nº kármico", r.cuentas.karmico, 81],
  ["lema de vida", r.cuentas.lemaDeVida, 117],
  ["vibración cuerpo", r.vibraciones.cuerpo, 40],
  ["vibración alma", r.vibraciones.alma, 53],
  ["vibración espíritu", r.vibraciones.espiritu, 29],
  ["efecto sanador", r.vibraciones.efectoSanador, 122],
  ["afinidad día+mes", r.afinidad.diaMes, 26],
  ["afinidad mes+año", r.afinidad.mesAnio, 85],
];

let fallos = 0;
for (const [k, got, want] of esperado) {
  const ok = String(got) === String(want);
  if (!ok) fallos++;
  console.log(`${ok ? "  ok " : "FALLA"}  ${k.padEnd(30)} motor=${String(got).padEnd(28)} ficha=${want}`);
}
console.log(`\n${esperado.length - fallos} de ${esperado.length} coinciden`);
if (fallos > 0) process.exit(1);
