/*
 * ============================================================================
 * PUBLICAR LAS REGLAS, SIN EL CLI DE FIREBASE
 * ============================================================================
 *
 * Aquí había `firebase deploy --only firestore:rules,storage` y parecía lo
 * obvio. No funciona con la clave que tiene este proyecto, y conviene dejar
 * escrito por qué para que nadie lo "arregle" volviendo a ponerlo.
 *
 * ANTES DE DESPLEGAR NADA, el CLI pregunta a `serviceusage.googleapis.com`
 * si las APIs de Firestore y de Storage están activadas. La cuenta de
 * servicio del SDK de administrador —la que se genera en Configuración del
 * proyecto → Cuentas de servicio, que es la que hay— NO TIENE PERMISO PARA
 * ESA PREGUNTA, así que el CLI se para antes de empezar:
 *
 *     Permission denied to get service [firestore.googleapis.com]
 *
 * Y la pregunta no aportaba nada: las dos APIs llevan meses activadas,
 * porque la plataforma las está usando ahora mismo.
 *
 * Se podría arreglar dándole a esa cuenta el rol «Consumidor de Service
 * Usage» en Google Cloud. Son cinco clics en una consola distinta de la de
 * Firebase, y hay que acordarse de repetirlos el día que se genere otra
 * clave. Hablar con la API de reglas directamente —que es lo que hace el CLI
 * por debajo en cuanto termina de comprobar cosas— no necesita nada de eso.
 *
 * SON DOS PASOS:
 *
 *   1. Se sube el texto y Google devuelve un «ruleset», que es una versión
 *      guardada. AQUÍ ES DONDE SE VALIDA: Google compila las reglas en su
 *      servidor y rechaza lo que no entiende. Si están mal, esto falla ahora
 *      y no se publica nada a medias.
 *
 *   2. Se apunta la «release» a ese ruleset. `cloud.firestore` para la base
 *      de datos y `firebase.storage/<bucket>` para el almacén — que son DOS
 *      reglas distintas en dos sitios distintos, el error más común de toda
 *      la instalación y la razón de que esto exista.
 *
 * Se ejecuta solo en cada subida a `main` que toque `firebase/`. A mano:
 *
 *     GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/la/clave.json \
 *       node firebase/publicar-reglas.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const PROYECTO = process.env.FIREBASE_PROYECTO || "plataforma-d3c55";
const BUCKET = process.env.FIREBASE_BUCKET || `${PROYECTO}.firebasestorage.app`;
const AQUI = dirname(fileURLToPath(import.meta.url));

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"],
});
const cliente = await auth.getClient();

/**
 * CUANDO NO COMPILAN, DECIR DÓNDE.
 *
 * Al crear un ruleset, Google contesta con una sola frase: «The Ruleset
 * provided does not compile». Ni la línea, ni la columna, ni qué esperaba.
 * Con quinientas líneas de reglas eso no es un error, es una búsqueda.
 *
 * Pero hay otra puerta, `:test`, que sí devuelve la lista de problemas con su
 * posición exacta. No se usa para validar —ya valida la de arriba, que además
 * es la que publica— sino sólo cuando algo ha fallado, para poder contarlo:
 *
 *     firestore.rules línea 43, columna 24: Unexpected '{'.
 *
 * Si esta segunda llamada también falla, se calla y se deja el mensaje
 * genérico: estamos ya dentro de un error, y un error dentro de otro solo
 * tapa el primero.
 *
 * Y HOY SE CALLA SIEMPRE, que conviene saberlo antes de borrar esto pensando
 * que no sirve. Probado contra el proyecto de verdad: `:test` pide el permiso
 * `firebaserules.releases.test`, y la cuenta de servicio del SDK de
 * administrador no lo tiene — contesta 403. Así que con la clave que hay hoy
 * en el secreto de GitHub, un fallo de compilación sale con la frase escueta
 * de Google y sin número de línea.
 *
 * Se queda escrito porque el día que esa clave se cambie por una con más
 * permiso —o se le dé el rol de «Firebase Rules Admin» a la de ahora— empieza
 * a decir la línea exacta sin tocar nada. Cuesta una llamada HTTP, y sólo
 * cuando algo ya ha fallado.
 */
async function dondeFalla(nombreFichero, fuente) {
  try {
    const r = await cliente.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${PROYECTO}:test`,
      method: "POST",
      data: { source: { files: [{ name: nombreFichero, content: fuente }] } },
    });
    return (r.data.issues || []).map((i) => {
      const p = i.sourcePosition || {};
      const donde = p.line ? ` línea ${p.line}${p.column ? `, columna ${p.column}` : ""}` : "";
      return `  ${nombreFichero}${donde}: ${i.description}`;
    });
  } catch {
    return [];
  }
}

async function publica(etiqueta, archivo, nombreRelease, nombreFichero) {
  const fuente = readFileSync(join(AQUI, archivo), "utf8");
  process.stdout.write(`${etiqueta}: subiendo… `);

  let rs;
  try {
    rs = await cliente.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${PROYECTO}/rulesets`,
      method: "POST",
      data: { source: { files: [{ name: nombreFichero, content: fuente }] } },
    });
  } catch (e) {
    /* Se corta el error de la biblioteca antes de imprimirlo: lleva dentro el
       archivo de reglas ENTERO, y vomitar quinientas líneas en el registro de
       GitHub esconde justo lo que hay que leer. */
    console.log("NO COMPILA");
    const motivo = e?.cause?.message || e?.message || "sin detalle";
    console.error("");
    console.error(`${etiqueta.trim()}: ${motivo}`);
    const sitios = await dondeFalla(nombreFichero, fuente);
    if (sitios.length) {
      console.error("");
      sitios.forEach((x) => console.error(x));
    }
    console.error("");
    console.error("No se ha publicado nada. Las reglas que hay en Firebase siguen siendo las de antes.");
    process.exit(1);
  }
  process.stdout.write(`compila (${rs.data.name.split("/").pop()}) … `);

  /* Se intenta actualizar la release y, si todavía no existe, se crea. En un
     proyecto que ya ha publicado alguna vez siempre existe; la rama de crear
     es para la primera vez de todas. */
  const release = `projects/${PROYECTO}/releases/${nombreRelease}`;
  try {
    await cliente.request({
      url: `https://firebaserules.googleapis.com/v1/${release}`,
      method: "PATCH",
      data: { release: { name: release, rulesetName: rs.data.name } },
    });
  } catch {
    await cliente.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${PROYECTO}/releases`,
      method: "POST",
      data: { name: release, rulesetName: rs.data.name },
    });
  }
  console.log("PUBLICADA");
}

await publica("Firestore", "firestore.rules", "cloud.firestore", "firestore.rules");
await publica("Almacén  ", "storage.rules", `firebase.storage/${BUCKET}`, "storage.rules");
console.log("\nLas dos están publicadas.");
