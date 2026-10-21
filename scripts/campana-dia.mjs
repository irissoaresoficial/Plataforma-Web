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
  /* Cuántos llegaron a CARGAR la página. Siempre son menos que los clics:
     hay quien se arrepiente o cierra antes de que cargue. La diferencia entre
     clics y aterrizajes mide lo lenta que va la web, no lo malo que es el
     anuncio. */
  aterrizajes: n(d.aterrizajes),
  frecuencia: n(d.frecuencia),
  escrito: new Date().toISOString(),
};
/*
 * LA PREVISIÓN: cuánta gente se espera apuntar en toda la campaña.
 *
 * La escribe quien lleva la publicidad, con los números delante, y la pantalla
 * de métricas enseña la más reciente. Es lo que Iris y quien lleve un curso
 * ven en vez del aviso de problemas, que es cosa del chat y no de ellas.
 *
 * Va como rango, nunca como número exacto: depende de qué porcentaje de los
 * que entran se apunta, y eso no se sabe hasta que entra gente. Un número
 * redondo sería una suposición disfrazada de dato.
 */
if (d.prevision) {
  doc.prevision = { min: n(d.prevision.min), max: n(d.prevision.max) };
}
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
const base = getFirestore();

/*
 * LOS APUNTADOS SE CUENTAN AQUÍ, NO SE PASAN POR LA ENTRADA.
 *
 * Y es a propósito. Este número —cuánta gente dejó su correo ese día— es la
 * mitad que convierte el gasto en una decisión: sin él sólo se sabe lo que
 * cuesta un clic, que no es lo que se compra. Si se pasara a mano, el día que
 * alguien se equivocara al teclearlo el coste por persona saldría mal y nadie
 * lo notaría, porque no hay con qué compararlo.
 *
 * Contándolo contra `leads` no hay forma de que discrepe de la realidad: la
 * realidad es `leads`.
 *
 * SE GUARDA EL NÚMERO Y NADA MÁS. Ni correos, ni nombres, ni de dónde son. En
 * `campana` puede leer cualquiera que esté dentro de la plataforma —incluida
 * la persona a quien Iris delegue un curso— y esa gente no tiene por qué ver
 * la lista de personas. Un recuento no es un dato personal; una lista sí.
 */
const desde = new Date(`${d.dia}T00:00:00.000Z`);
const hasta = new Date(`${d.dia}T23:59:59.999Z`);
let apuntados = 0;
let dePago = 0;
try {
  const r = await base.collection("leads").get();
  for (const x of r.docs) {
    const v = x.data();
    /* `alta` puede ser marca de tiempo de Firestore o texto, según por dónde
       entrara el lead. Las dos formas tienen que contar igual. */
    const t = v.alta?.toDate ? v.alta.toDate() : v.alta ? new Date(v.alta) : null;
    if (!t || t < desde || t > hasta) continue;
    apuntados += 1;
    if (v.campana?.source) dePago += 1;
  }
} catch (e) {
  /* Si no se puede contar, se dice y se escribe el resto. Un gasto apuntado
     sin su recuento vale más que no apuntar nada. */
  console.error("Aviso: no se han podido contar los apuntados:", e.message);
}
doc.apuntados = apuntados;
doc.apuntadosDePago = dePago;

await base.collection("campana").doc(d.dia).set(doc);
console.log(
  `Apuntado el ${d.dia}: ${doc.gasto} €, ${doc.clics} clics, ${doc.aterrizajes} aterrizajes, ` +
    `${doc.alcance} personas, ${apuntados} apuntados (${dePago} de la campaña).`,
);
if (doc.clics >= 25 && apuntados === 0) {
  console.warn(
    "\n  OJO: hubo clics y CERO apuntados. O la gente no rellena el formulario,\n" +
      "  o el formulario no está guardando en Firestore. Hay que comprobarlo\n" +
      "  antes de seguir gastando.",
  );
}
process.exit(0);
