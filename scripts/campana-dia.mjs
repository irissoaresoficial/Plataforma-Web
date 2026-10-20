/**
 * ============================================================================
 * APUNTA UN DÍA DE CAMPAÑA EN FIRESTORE
 * ============================================================================
 *
 * La mitad de fuera del puente que explica `lib/despacho/campana.ts`: la
 * plataforma no puede preguntarle a Meta en directo —la cuenta publicitaria no
 * está en ningún portafolio y no hay token que no caduque—, así que alguien con
 * acceso lee los números y los deja aquí una vez al día.
 *
 * SE USA ASÍ, pasándole el JSON por la entrada:
 *
 *   node scripts/campana-dia.mjs <<< '{"dia":"2026-10-20","gasto":4.12,...}'
 *
 * LA LLAVE NO ESTÁ EN EL REPOSITORIO Y NO PUEDE ESTARLO. Se lee de
 * GOOGLE_APPLICATION_CREDENTIALS, que apunta a un archivo fuera del proyecto.
 * Si no está, el script se para y lo dice: es preferible a escribir en la base
 * equivocada o a fallar con un mensaje de Google que no explica nada.
 *
 * EL DÍA ES EL NOMBRE DEL DOCUMENTO, a propósito. Correrlo dos veces el mismo
 * día pisa el dato en vez de duplicarlo, así que un reintento tras un fallo es
 * seguro y no deja dos gastos del martes sumándose en el total.
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const llave = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!llave) {
  console.error("Falta GOOGLE_APPLICATION_CREDENTIALS: la ruta al archivo de la cuenta de servicio.");
  process.exit(1);
}

const crudo = readFileSync(0, "utf8").trim();
if (!crudo) {
  console.error("No ha llegado nada por la entrada. Se espera el JSON de un día.");
  process.exit(1);
}

let d;
try {
  d = JSON.parse(crudo);
} catch (e) {
  console.error("El JSON no se entiende:", e.message);
  process.exit(1);
}

/* El día manda: sin él no se sabe dónde va el documento, y escribirlo en un
   sitio inventado sería peor que no escribirlo. */
if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dia || "")) {
  console.error('Falta "dia" o no tiene la forma 2026-10-20.');
  process.exit(1);
}

const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

/* Se escribe campo a campo y no el objeto tal cual: así un JSON con una clave
   de más —o con una errata— no mete basura en la colección, y lo que llega a
   la pantalla tiene siempre la forma que la pantalla espera. */
const doc = {
  dia: d.dia,
  gasto: n(d.gasto),
  impresiones: n(d.impresiones),
  alcance: n(d.alcance),
  clics: n(d.clics),
  frecuencia: n(d.frecuencia),
  escrito: new Date().toISOString(),
};
if (d.video) {
  doc.video = {
    empiezan: n(d.video.empiezan),
    cuarto: n(d.video.cuarto),
    mitad: n(d.video.mitad),
    entero: n(d.video.entero),
  };
}
if (Array.isArray(d.anuncios) && d.anuncios.length) {
  doc.anuncios = d.anuncios.map((a) => ({
    nombre: String(a.nombre || "").slice(0, 200),
    gasto: n(a.gasto),
    clics: n(a.clics),
  }));
}

initializeApp({ credential: cert(JSON.parse(readFileSync(llave, "utf8"))) });
await getFirestore().collection("campana").doc(d.dia).set(doc);
console.log(`Apuntado el ${d.dia}: ${doc.gasto} €, ${doc.clics} clics, ${doc.alcance} personas.`);
process.exit(0);
