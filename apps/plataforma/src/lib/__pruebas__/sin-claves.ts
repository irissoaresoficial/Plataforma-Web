/**
 * Que no se cuele ninguna clave de escuela en el documento del cliente.
 *
 * Los apuntes traen intercaladas las claves de trabajo —«2/33-3/22-6/11-M15-
 * M51-C11-T11-L77-P313»—. A Iris le sirven y en el panel siguen estando; en
 * las treinta páginas que se lleva la persona no pintan nada.
 *
 * Se revisan varios estudios enteros, bloque a bloque, porque el fallo no
 * estaba en el filtro sino en los sitios que se lo saltaban: tres bloques de
 * referencias se construían a mano y no pasaban por él.
 *
 * Y al revés: hay letras con número que NO son claves y tienen que quedarse.
 * «Lumbares L1 y L2», «Cervicales C3, C4 y C5» son vértebras, y salen en los
 * órganos y las disfunciones de cada portal. Una regla que barriese «letra +
 * número» dejaba «Lumbares y».
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/sin-claves.ts
 */
import { calcula, calculaEmpresa } from "../engine";
import { construyeCapitulos, construyeCapitulosEmpresa, type Capitulo } from "../estudio";
import { sinClavesEscuela } from "../format";

const PERSONAS: Array<[string, string, string, number, number, number]> = [
  ["MARIA IRIS", "SOARES", "CAMPOS", 24, 2, 1983],
  ["ROBERTO", "LOPEZ", "CASTRO", 19, 7, 1951],
  ["ANA", "RUIZ", "SANZ", 1, 1, 1999],
  ["JOSE ANTONIO", "FERNANDEZ", "RODRIGUEZ", 29, 11, 1978],
  ["ELENA", "TORRES", "VIDAL", 19, 7, 2001],
  ["MARIA DEL CARMEN", "GONZALEZ", "MARTINEZ", 28, 12, 1966],
];

/** Una cadena de claves: dos o más piezas unidas por guiones. */
const CADENA = /(?:\d+\/\d+|[A-ZÁÉÍÓÚ]\d+)(?:\s*[-–]\s*(?:\d+\/\d+|[A-ZÁÉÍÓÚ]\d+))+/g;
/** Un divisor que abre frase, que es como los apuntes rotulan un número. */
const DIVISOR = /(?:^|[.:;]\s+)\d+\/\d+\s/g;

function textosDe(caps: Capitulo[]): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const cap of caps) {
    out.push([`${cap.id}·título`, cap.titulo]);
    for (const b of cap.bloques) {
      if (b.tipo === "p" || b.tipo === "lead") out.push([`${cap.id}·${b.tipo}`, b.textoDef]);
      else if (b.tipo === "dato") out.push([`${cap.id}·dato`, b.textoDef + " " + b.label]);
      else if (b.tipo === "h" || b.tipo === "cita") out.push([`${cap.id}·${b.tipo}`, b.texto]);
      else if (b.tipo === "polos") out.push([`${cap.id}·polos`, b.negDef + " " + b.posDef]);
      else if (b.tipo === "refs") b.items.forEach((i) => out.push([`${cap.id}·refs`, i.label + " " + i.texto]));
      else if (b.tipo === "cifras") b.filas.forEach((f) => out.push([`${cap.id}·cifras`, `${f.label} ${f.pie}`]));
    }
  }
  return out;
}

let revisados = 0;
const fallos: string[] = [];
const mira = (quien: string, caps: Capitulo[]) => {
  for (const [donde, texto] of textosDe(caps)) {
    revisados++;
    for (const m of texto.match(CADENA) || []) fallos.push(`${quien} · ${donde}: cadena «${m}»`);
    for (const m of texto.match(DIVISOR) || []) fallos.push(`${quien} · ${donde}: divisor «${m.trim()}»`);
  }
};

for (const [n, a1, a2, d, m, y] of PERSONAS) {
  mira(n, construyeCapitulos(calcula({ nombre: n, apellido1: a1, apellido2: a2, dia: d, mes: m, anio: y, anioUniversal: 2026 })));
}
mira("SABIDURIA 33 SL", construyeCapitulosEmpresa(calculaEmpresa({ nombre: "SABIDURIA 33 SL", anioUniversal: 2026 })));

// Lo que tiene que sobrevivir al filtro, no desaparecer con él.
const conserva: Array<[string, string]> = [
  ["Órganos: Dorsales. Lumbares L1 y L2. Coxis. Sacro.", "Órganos: Dorsales. Lumbares L1 y L2. Coxis. Sacro."],
  ["Cervicales C3, C4 y C5. Dorsal D7.", "Cervicales C3, C4 y C5. Dorsal D7."],
  ["Atreverse a cosas nuevas. Es 2/43 el número del pionero.", "Atreverse a cosas nuevas. Es 2/43 el número del pionero."],
];
for (const [entra, espera] of conserva) {
  revisados++;
  const sale = sinClavesEscuela(entra);
  if (sale !== espera) fallos.push(`el filtro se llevó algo que no era clave:\n      entra: ${entra}\n      sale : ${sale}`);
}

console.log(`textos revisados: ${revisados}`);
if (fallos.length) {
  console.log(`\n${fallos.length} problemas:`);
  fallos.slice(0, 25).forEach((f) => console.log("  ✘ " + f));
  process.exitCode = 1;
} else {
  console.log("✔ ninguna clave de escuela en el documento, y las vértebras siguen en su sitio");
}
