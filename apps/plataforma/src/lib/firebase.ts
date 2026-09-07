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

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Con la clave y el proyecto basta para arrancar. Los demás campos hacen falta
 * para cosas que esta plataforma no usa —almacenamiento de archivos, avisos
 * push— y exigirlos dejaría todo apagado por un dato que no sirve para nada
 * aquí.
 */
export function hayFirebase(): boolean {
  return Boolean(config.apiKey && config.projectId);
}

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
