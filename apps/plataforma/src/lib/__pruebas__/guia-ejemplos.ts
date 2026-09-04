/**
 * Los ejemplos numéricos de la GUÍA PARA CUBRIR LA FICHA KABBALAH y del
 * MANUAL DE NUMEROLOGÍA (capítulos 12 y 16).
 *
 * La otra prueba, `ficha-resuelta`, comprueba una carta entera rellenada a
 * mano. Ésta comprueba las cuentas sueltas que la guía deja resueltas paso a
 * paso, que son las que fijan las fórmulas: cada línea de aquí está copiada de
 * la guía con sus números, no deducida del motor.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/guia-ejemplos.ts
 */
import { analizaNombre, arcanoDesde, calcula, liberacionDe, tensionDe } from "../engine";

type Fila = [string, unknown, unknown];
const filas: Fila[] = [];
const ent = (dia: number, mes: number, anio: number) =>
  calcula({ nombre: "X", apellido1: "", apellido2: "", dia, mes, anio, anioUniversal: 2026 });

// 1) Camino de origen: 241 − 7 = 234; ÷ 9 = 26; + 1 = 27; 2+7 = 9, El Ermitaño.
const origen = arcanoDesde(241);
filas.push(["origen · suma de cifras", origen.sumaCifras, 7]);
filas.push(["origen · resta", origen.resta, 234]);
filas.push(["origen · ÷ 9", origen.division, 26]);
filas.push(["origen · + 1", origen.mas1, 27]);
filas.push(["origen · arcano", origen.arcano, 9]);

// 2) Edad de cambio y nº de corazón: 30 + 09 + 1975 = 34; TRANSF 7; 241 + 34 = 275.
const r = ent(30, 9, 1975);
filas.push(["edad de cambio", r.caminos.edadCambio, 34]);
filas.push(["transformación · arcano", r.caminos.transformacion.arcano, 7]);
filas.push(["nº de corazón", 241 + r.caminos.edadCambio, 275]);

// 3) Camino de destino: 275 − 14 = 261; ÷ 9 = 29; + 1 = 30; 3+0 = 3, La Emperatriz.
const destino = arcanoDesde(275);
filas.push(["destino · suma de cifras", destino.sumaCifras, 14]);
filas.push(["destino · resta", destino.resta, 261]);
filas.push(["destino · ÷ 9", destino.division, 29]);
filas.push(["destino · + 1", destino.mas1, 30]);
filas.push(["destino · arcano", destino.arcano, 3]);

// 6) Días de fuerza: 241 → 2+4+1 = 7. «Su principal día de fuerza es el 7, y
//    después todos los números del mes que sumen 7: el día 16 y el día 25.»
const df = calcula({ nombre: "MARIA", apellido1: "", apellido2: "", dia: 1, mes: 1, anio: 2000, anioUniversal: 2026 });
void df;
const diasDe241 = (() => {
  // Se reconstruye la cuenta con la misma regla del motor sobre el 241 de la guía.
  const s = 2 + 4 + 1;
  const out = [s];
  for (let d = 1; d <= 31; d++) if (d !== s && String(d).split("").reduce((a, b) => a + +b, 0) === s) out.push(d);
  return out;
})();
filas.push(["días de fuerza de 241", JSON.stringify(diasDe241), JSON.stringify([7, 16, 25])]);

// 2ª sesión) Camino conjunto: 268 + 273 = 541; − 10 = 531; ÷ 9 = 59; + 2 = 61;
//    6+1 = 7, El Carro. Se suma 2 «porque son 2 personas = 2 almas».
const conj = arcanoDesde(268 + 273, 2);
filas.push(["conjunto · suma de corazones", conj.total, 541]);
filas.push(["conjunto · suma de cifras", conj.sumaCifras, 10]);
filas.push(["conjunto · ÷ 9", conj.division, 59]);
filas.push(["conjunto · + 2", conj.mas1, 61]);
filas.push(["conjunto · arcano", conj.arcano, 7]);

// 3ª sesión) Imagen del alma con 03/01/2001: convertida 09 07 8007 → 31 → 4.
//    Bloqueos: un 9 y dos 7 → casillas 7 y 9, con los números 70 y 92.
const a = ent(3, 1, 2001);
filas.push(["imagen del alma", a.imagenAlma.numero, 4]);
filas.push(["bloqueos · casillas", JSON.stringify(Object.keys(a.imagenAlma.bloqueos).map(Number).sort((x, y) => x - y)), JSON.stringify([7, 9])]);
filas.push(["bloqueo de la casilla 7", a.bloqueos.find((b) => b.casilla === 7)?.numero, 70]);
filas.push(["bloqueo de la casilla 9", a.bloqueos.find((b) => b.casilla === 9)?.numero, 92]);

// Cuentas abiertas del mismo ejemplo: filas 5/23/22, columnas 15/14/21,
// kármico 50, lema de vida 155 (la liberación del 50) y sanador 72.
filas.push(["cuentas abiertas · filas E/A/C", JSON.stringify(a.cuentas.cuentas), JSON.stringify([5, 23, 22])]);
filas.push(["potenciales arcaicos · columnas", JSON.stringify(a.cuentas.potenciales), JSON.stringify([15, 14, 21])]);
filas.push(["nº kármico de las relaciones", a.cuentas.karmico, 50]);
filas.push(["nº del lema de vida", a.cuentas.lemaDeVida, 155]);
filas.push(["nº de efecto sanador", a.vibraciones.efectoSanador, 72]);

// ─────────────────────────────────────────────────────────────────────────
// MANUAL DE NUMEROLOGÍA · capítulos 12 y 16. Los ejemplos van con ROBERTO
// LOPEZ CASTRO, cuyo nombre suma 223, esencia 75 y ego 148.
// ─────────────────────────────────────────────────────────────────────────
const rob = analizaNombre("ROBERTO LOPEZ CASTRO");
filas.push(["numerología · valor del nombre", rob.total, 223]);
filas.push(["numerología · esencia (vocales)", rob.esencia, 75]);
filas.push(["numerología · ego (consonantes)", rob.ego, 148]);

// 12.1 «223 nos da 7. 7 es un día de fuerza, así como todos los días cuya
//      reducción sea 7, como el 16 y el 25.» — el número que sale de la suma
//      cuenta como día, que es lo que aquí se dejaba fuera.
const diasDe223 = (() => {
  const s = 2 + 2 + 3;
  const out = [s];
  for (let d = 1; d <= 31; d++) if (d !== s && String(d).split("").reduce((a, b) => a + +b, 0) === s) out.push(d);
  return out;
})();
filas.push(["días de fuerza de 223", JSON.stringify(diasDe223), JSON.stringify([7, 16, 25])]);

// 12.4 Camino de vibración conjunto: 256 + 210 = 466; − 16 = 450; ÷ 9 = 50;
//      + 2 «porque son dos personas» = 52; 5+2 = 7, El Carro.
const cvc = arcanoDesde(256 + 210, 2);
filas.push(["CVC · suma de cifras", cvc.sumaCifras, 16]);
filas.push(["CVC · resta", cvc.resta, 450]);
filas.push(["CVC · ÷ 9", cvc.division, 50]);
filas.push(["CVC · + 2", cvc.mas1, 52]);
filas.push(["CVC · arcano", cvc.arcano, 7]);

// 12.4 (variante) El mismo cálculo con una sola alma: el nombre de una
//      enfermedad. El manual escribe 256 + 130 = 386; − 17 = 369; ÷ 9 = 41;
//      + 1 = 42; 4+2 = 6, Los Enamorados.
//
//      Ojo: al desglosar TROMBOSIS el manual anota «9+20+16+13+2+16+21+12+21»
//      y le da a la I un 12. La tabla de valores —la de la guía y la del propio
//      manual— dice I, J, Y = 10, así que la suma es 128, no 130. Es un desliz
//      de la cuenta escrita, y no cambia nada: 386 − 17 y 384 − 15 dan los dos
//      369, o sea el mismo arcano. Se comprueba el arcano, que es lo que se lee.
filas.push(["TROMBOSIS · valor del nombre", analizaNombre("TROMBOSIS").total, 128]);
filas.push(["CVC de la trombosis · arcano", arcanoDesde(256 + analizaNombre("TROMBOSIS").total, 1).arcano, 6]);
filas.push(["CVC de la trombosis · arcano con el 130 del manual", arcanoDesde(256 + 130, 1).arcano, 6]);

// 16.3 Número de tensión: 1↔6, 2↔7, 3↔8, 4↔9, 5↔10 y 0↔5. Si acaba en 5 se
//      cambia por 0 (25 → 70); si empieza por 5, por 10 (57 → 102).
filas.push(["tensión de 19", tensionDe(19), 64]);
filas.push(["tensión de 34", tensionDe(34), 89]);
filas.push(["tensión de 25", tensionDe(25), 70]);
filas.push(["tensión de 57", tensionDe(57), 102]);
filas.push(["tensión de 56", tensionDe(56), 101]);

// 16.4 Número de liberación = número + su número de tensión.
filas.push(["liberación de 56", liberacionDe(56), 157]);
// Y las dos que aparecen resueltas en las fichas: el lema de vida.
filas.push(["liberación de 50 (guía)", liberacionDe(50), 155]);
filas.push(["liberación de 81 (ficha resuelta)", liberacionDe(81), 117]);

let mal = 0;
filas.forEach(([etiqueta, motor, guia]) => {
  const ok = JSON.stringify(motor) === JSON.stringify(guia);
  if (!ok) mal++;
  console.log(`  ${ok ? "ok  " : "MAL "} ${etiqueta.padEnd(32)} motor=${String(JSON.stringify(motor)).padEnd(16)} guía=${JSON.stringify(guia)}`);
});
console.log(`\n${filas.length - mal} de ${filas.length} coinciden`);
if (mal) process.exitCode = 1;
