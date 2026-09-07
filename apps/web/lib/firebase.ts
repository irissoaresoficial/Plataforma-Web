/**
 * FIREBASE: EL ARMARIO CON LLAVE DONDE CAEN LOS CORREOS.
 *
 * POR QUÉ ESTO EXISTE, Y ES LO IMPORTANTE
 * ------------------------------------------------------------------
 * Hasta hoy, cuando alguien dejaba su correo en la web pasaba esto: la web se
 * lo mandaba al Apps Script de Google y, si el Apps Script fallaba —Google
 * caído, la clave mal copiada, el script reimplementado y sin publicar—, el
 * correo se perdía ENTERO. No quedaba copia en ningún sitio. La web lo decía en
 * pantalla, así que nadie mentía a nadie, pero la persona ya no existía.
 *
 * Guardar y avisar son dos cosas distintas, y estaban atadas de forma que la
 * más frágil se llevaba por delante a la más importante. Ahora:
 *
 *   1. el lead se GUARDA en Firestore — esto es lo que no se puede perder;
 *   2. después se AVISA al Apps Script, que manda el correo y toca el
 *      calendario de Iris.
 *
 * Si falla el paso 2, el dato sigue estando. Si falla el paso 1, la web lo dice
 * y no finge que ha ido bien.
 *
 * POR QUÉ EL SDK DE ADMINISTRADOR Y NO EL DEL NAVEGADOR
 * ------------------------------------------------------------------
 * Se podría escribir en Firestore desde el propio navegador con las claves
 * públicas de Firebase. No se hace, por dos motivos:
 *
 *   · haría falta una regla de seguridad que permita escribir a cualquiera que
 *     abra la web. Cualquiera con la consola del navegador podría llenar la
 *     base de basura, o leer lo de los demás si la regla se escribe de más;
 *   · el límite de peticiones de `/api/lead` dejaría de servir para nada,
 *     porque se saltaría la ruta entera.
 *
 * Escribiendo desde el servidor, la base de datos puede quedarse CERRADA A CAL
 * Y CANTO —`allow read, write: if false` para todo el mundo— porque el SDK de
 * administrador no pasa por las reglas. Es la configuración más segura que hay,
 * y además es la más simple: no hay ninguna regla que discutir.
 *
 * QUÉ HACE FALTA PARA QUE ESTO FUNCIONE
 * ------------------------------------------------------------------
 * Tres variables de entorno en Vercel, sacadas del archivo JSON que da Firebase
 * en Configuración del proyecto → Cuentas de servicio → Generar nueva clave:
 *
 *   FIREBASE_PROJECT_ID     el id del proyecto (p. ej. plataforma-d3c55)
 *   FIREBASE_CLIENT_EMAIL   el campo `client_email` del JSON
 *   FIREBASE_PRIVATE_KEY    el campo `private_key` del JSON, entero
 *
 * Sin las tres, esto no se enciende y `hayFirebase()` devuelve false. La web
 * sigue funcionando exactamente igual que hasta hoy: manda al Apps Script y ya.
 * Nada se rompe por no tenerlo puesto — sólo se pierde la red de seguridad.
 *
 * Se puede comprobar en /api/diagnostico, que dice en castellano qué falta.
 */

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * LA CLAVE PRIVADA Y EL PROBLEMA DE LOS SALTOS DE LÍNEA.
 *
 * La clave del JSON es un bloque de varias líneas. Al meterla en una variable
 * de entorno, casi todos los paneles —Vercel incluido— la guardan con los
 * saltos escritos como los dos caracteres `\` y `n` en vez de como saltos de
 * verdad. Si se le pasa así a `cert()`, el error que sale es
 * «error:1E08010C:DECODER routines::unsupported», que no le dice nada a nadie.
 *
 * Se deshace aquí, una vez. Y se aceptan las dos formas: si alguien la pega con
 * saltos de verdad, también vale.
 */
function limpiaClave(bruta: string): string {
  return bruta.replace(/\\n/g, '\n').trim();
}

let cache: Firestore | null = null;

/** ¿Están puestas las tres variables? Lo usa el diagnóstico y las rutas. */
export function hayFirebase(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  );
}

/**
 * La conexión, hecha una sola vez.
 *
 * En Vercel el mismo proceso atiende varias peticiones seguidas, y llamar dos
 * veces a `initializeApp` con el mismo nombre revienta. Por eso se mira primero
 * si ya hay una aplicación montada.
 *
 * Devuelve null en vez de lanzar cuando no está configurado: quien llama decide
 * qué hacer, y en el caso de los leads lo que hay que hacer es seguir adelante
 * con el Apps Script, no devolverle un error a quien está rellenando un
 * formulario por algo que no es culpa suya.
 */
export function db(): Firestore | null {
  if (cache) return cache;
  if (!hayFirebase()) return null;

  try {
    const app: App = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: limpiaClave(process.env.FIREBASE_PRIVATE_KEY as string),
          }),
        });
    cache = getFirestore(app);
    return cache;
  } catch (err) {
    // Una clave mal pegada no puede tumbar la web entera: se apunta y se sigue.
    console.error('[firebase] No se pudo conectar. Revisa las tres variables:', err);
    return null;
  }
}

export { FieldValue };
