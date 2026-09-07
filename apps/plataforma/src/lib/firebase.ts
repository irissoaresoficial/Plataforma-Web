"use client";

/**
 * LA CONEXIÓN DE LA PLATAFORMA CON FIREBASE.
 *
 * La web ESCRIBE los leads desde su servidor, con el SDK de administrador. La
 * plataforma los LEE desde el navegador, con este otro. Misma base de datos,
 * dos puertas distintas, y las reglas de `firebase/firestore.rules` mandan
 * sobre esta.
 *
 * SOBRE LAS CLAVES QUE HAY AQUÍ: SON PÚBLICAS, Y ESO ESTÁ BIEN.
 * ------------------------------------------------------------------
 * A todo el mundo le da un vuelco el estómago la primera vez que ve una
 * `apiKey` de Firebase escrita en una variable que empieza por `NEXT_PUBLIC_`,
 * es decir, visible para cualquiera que abra el código de la página. No es un
 * descuido y no hay forma de esconderlas: son el equivalente a la dirección de
 * un edificio. Dicen a qué proyecto llamar, no dan permiso para entrar.
 *
 * Quien da permiso es Firebase Auth —hay que iniciar sesión— y quien decide qué
 * puede tocar cada uno son las reglas de Firestore, que corren en el servidor
 * de Google y no se pueden saltar desde el navegador. Por eso esas reglas son
 * el archivo más importante del proyecto y por eso están comentadas una a una.
 *
 * SIN CONFIGURAR, LA PLATAFORMA SIGUE FUNCIONANDO.
 * ------------------------------------------------------------------
 * `hayFirebase()` devuelve false y todo lo que necesita la nube se apaga solo:
 * el despacho sigue guardando en el navegador y la puerta avisa de que todavía
 * no protege nada. Se puede seguir trabajando; lo que no se puede es publicar
 * con datos de clientes dentro.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * DOS VARIABLES, NO SEIS.
 *
 * El bloque que enseña Firebase al crear una app web trae seis campos, y lo
 * normal es copiarlos los seis. Aquí hacen falta dos, y los otros cuatro se
 * deducen o no se usan:
 *
 *   · `authDomain` es SIEMPRE `<projectId>.firebaseapp.com`. No es una
 *     casualidad ni un valor que Google pueda cambiar por proyecto: es cómo se
 *     construye. Copiarlo a mano sólo añade una casilla más donde equivocarse.
 *   · `storageBucket` igual, y además esta plataforma no sube archivos.
 *   · `messagingSenderId` y `appId` son para avisos push y para analítica.
 *     Ninguna de las dos cosas existe aquí.
 *
 * Cada variable que se pide es una oportunidad de pegar mal algo y pasar media
 * hora buscando por qué no entra nadie. Con dos, o están las dos o no está
 * ninguna, y el fallo se ve enseguida.
 *
 * Las dos que quedan se pueden sobrescribir por si algún día hace falta —un
 * dominio propio para el inicio de sesión, por ejemplo— pero no hay que
 * ponerlas para que esto funcione.
 */
const proyecto = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: proyecto,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (proyecto ? `${proyecto}.firebaseapp.com` : undefined),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (proyecto ? `${proyecto}.firebasestorage.app` : undefined),
};

export function hayFirebase(): boolean {
  return Boolean(config.apiKey && config.projectId);
}

/**
 * QUIÉN ES LA DUEÑA.
 *
 * Es el correo que puede darse acceso a sí mismo la primera vez, y sólo la
 * primera vez. Resuelve el problema del huevo y la gallina: las reglas exigen
 * tener ficha para poder escribir fichas, así que sin esto la primera persona
 * no podría entrar nunca sin ir a crear el documento a mano en la consola de
 * Firebase, copiando un identificador de veintiocho caracteres.
 *
 * Va escrito aquí y no en una variable porque tiene que decir exactamente lo
 * mismo que las reglas de Firestore, y las reglas no pueden leer variables de
 * entorno. Dos sitios con el mismo valor es peor que uno, pero un valor que
 * puede discrepar de su regla es mucho peor: el día que no coincidieran, la
 * plataforma diría que sí y el servidor que no.
 */
export const CORREO_DUENA = "irissoaresoficial@gmail.com";

let app: FirebaseApp | null = null;

function arranca(): FirebaseApp | null {
  if (!hayFirebase()) return null;
  if (app) return app;
  // En desarrollo, Next recarga los módulos en caliente y `initializeApp` se
  // llamaría dos veces con el mismo nombre, que revienta.
  app = getApps().length ? getApp() : initializeApp(config as Record<string, string>);
  return app;
}

export function auth(): Auth | null {
  const a = arranca();
  return a ? getAuth(a) : null;
}

export function nube(): Firestore | null {
  const a = arranca();
  return a ? getFirestore(a) : null;
}
