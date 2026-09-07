"use client";

/**
 * QUIÉN ENTRA AQUÍ. AHORA DE VERDAD.
 *
 * LO QUE HABÍA, Y POR QUÉ HABÍA QUE TIRARLO
 * ------------------------------------------------------------------
 * Una puerta pintada en la pared. La comprobación era una lista de dos correos
 * escrita en el código del navegador, sin contraseña de ningún tipo: bastaba
 * con escribir el correo de Iris —que está publicado en su propia web— y
 * cualquier cosa en el hueco de la clave. Cualquiera con la consola del
 * navegador entraba por el lado. Servía para montar las pantallas y nada más, y
 * el propio archivo lo decía en voz alta.
 *
 * LO QUE HAY AHORA
 * ------------------------------------------------------------------
 * Firebase Auth. La contraseña la comprueba Google en su servidor, no este
 * código; lo que llega aquí es un vale firmado que el navegador no puede
 * falsificar. Y con ese vale, las reglas de Firestore deciden qué se puede
 * tocar — están en `firebase/firestore.rules`, comentadas una a una.
 *
 * DOS COSAS Y NO UNA: TENER CUENTA Y TENER FICHA
 * ------------------------------------------------------------------
 * Entrar exige las dos:
 *
 *   1. una cuenta en Firebase Auth (correo y contraseña), y
 *   2. una ficha en la colección `usuarios` con `activo: true`.
 *
 * Están separadas a propósito. Si bastara con la cuenta, quitarle el acceso a
 * alguien obligaría a borrarle la cuenta entera y con ella el rastro de lo que
 * hizo. Con la ficha aparte se le pone `activo: false` y deja de entrar al
 * instante, sin perder nada.
 *
 * Y ES LA MISMA COMPROBACIÓN QUE HACE EL SERVIDOR. Esto no es seguridad
 * —ninguna comprobación en un navegador lo es— sino cortesía: enseñar un
 * mensaje claro en vez de dejar que la persona entre y se encuentre todas las
 * pantallas vacías porque las reglas le están diciendo que no a cada consulta.
 * Quien manda de verdad son las reglas.
 *
 * SIN FIREBASE CONFIGURADO
 * ------------------------------------------------------------------
 * La plataforma sigue arrancando en modo local, sin nube y sin puerta, para
 * poder trabajar en las pantallas. Lo dice claramente y no se puede publicar
 * así con datos de nadie dentro.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, CORREO_DUENA, hayFirebase, nube } from "./firebase";

/**
 * UN SOLO NIVEL DE ACCESO, A PROPÓSITO.
 *
 * Hubo aquí tres roles —administradora, trabajo y sólo mirar— y se han quitado.
 * Hoy esto lo usa una persona: Iris. Un sistema de permisos para un solo
 * usuario no protege de nada y sí complica todo: hay que decidir un rol en cada
 * alta, cada pantalla tiene que preguntar si puede o no puede, y las reglas del
 * servidor se llenan de condiciones que nadie está comprobando nunca porque
 * sólo existe un caso.
 *
 * El día que entre una segunda persona con permisos distintos, se añade — y se
 * añadirá sabiendo qué hace falta de verdad, en vez de haberlo adivinado hoy.
 *
 * Lo que sí se queda es `activo`: quitarle el acceso a alguien tiene que poder
 * hacerse sin borrarle la cuenta y con ella el rastro de lo que hizo.
 */
export type Usuario = {
  uid: string;
  email: string;
  nombre: string;
  activo: boolean;
};

type Estado = {
  /** null mientras no se sabe; después, el usuario o `false` si no hay nadie. */
  usuario: Usuario | null | false;
  entrando: boolean;
  error: string;
  /** false cuando faltan las claves: la plataforma va en local, sin nube. */
  conNube: boolean;
  entra: (email: string, clave: string) => Promise<void>;
  sale: () => void;
};

const Ctx = createContext<Estado | null>(null);

/** El usuario de mentira de cuando no hay nube. Sólo existe en desarrollo. */
const LOCAL: Usuario = { uid: "local", email: "local", nombre: "Iris", activo: true };

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null | false>(null);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState("");
  const conNube = hayFirebase();

  /**
   * Firebase avisa cada vez que cambia quién está dentro: al arrancar, al
   * entrar, al salir y cuando caduca el vale. Hasta el primer aviso `usuario` es
   * null y la aplicación enseña el hueco de carga — si enseñara la puerta, quien
   * ya había entrado vería un parpadeo de inicio de sesión en cada recarga.
   */
  useEffect(() => {
    if (!conNube) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setUsuario(LOCAL);
      return;
    }
    const a = auth();
    if (!a) return;

    /* Que la sesión sobreviva a cerrar el navegador. Es una herramienta de
       trabajo: pedir la contraseña cada mañana sólo consigue que la gente
       apunte la contraseña en un papel al lado del ordenador. */
    void setPersistence(a, browserLocalPersistence);

    return onAuthStateChanged(a, async (u: User | null) => {
      if (!u) {
        setUsuario(false);
        return;
      }
      const base = nube();
      if (!base) {
        setUsuario(false);
        return;
      }
      try {
        const referencia = doc(base, "usuarios", u.uid);
        let ficha = await getDoc(referencia);

        /*
         * LA PRIMERA VEZ, LA DUEÑA SE DA ACCESO SOLA.
         *
         * Sin esto hay un problema de huevo y gallina que no se resuelve desde
         * dentro: las reglas exigen tener ficha para poder escribir fichas, así
         * que la primera persona no podría entrar NUNCA. La salida era ir a la
         * consola de Firebase, copiar un identificador de veintiocho caracteres
         * y crear un documento a mano con cuatro campos escritos uno a uno. Es
         * el paso donde más gente se atasca de toda la instalación, y donde una
         * letra mal puesta deja la plataforma sin nadie dentro sin decir por qué.
         *
         * Sólo puede hacerlo el correo de la dueña, sólo si no tiene ficha ya, y
         * la regla del servidor dice exactamente lo mismo: aquí no se está
         * regalando nada que el servidor no permita. Para aprovecharlo haría
         * falta controlar ese Gmail — y quien controle ese Gmail ya es la dueña.
         */
        if (!ficha.exists() && (u.email || "").toLowerCase() === CORREO_DUENA) {
          await setDoc(referencia, {
            email: u.email,
            nombre: (u.displayName || "Iris").trim(),
            activo: true,
          });
          ficha = await getDoc(referencia);
        }

        const d = ficha.data();
        if (!ficha.exists() || d?.activo !== true) {
          /* Tiene cuenta pero no tiene permiso, o se lo han quitado. Se le echa
             y se le dice — dejarle dentro con todas las pantallas vacías es
             peor: parecería que la herramienta está rota. */
          await signOut(a);
          setUsuario(false);
          setError("Esa cuenta no tiene acceso a la plataforma. Pídeselo a Iris.");
          return;
        }
        setUsuario({
          uid: u.uid,
          email: u.email || d.email || "",
          nombre: d.nombre || u.displayName || (u.email || "").split("@")[0],
          activo: true,
        });
      } catch {
        /* Si no se puede leer la ficha —sin red, reglas mal puestas— no se
           inventa un permiso: no entra. */
        setUsuario(false);
        setError("No hemos podido comprobar tu acceso. Vuelve a intentarlo.");
      }
    });
  }, [conNube]);

  const entra = useCallback(
    async (email: string, clave: string) => {
      setError("");
      const correo = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
        setError("Ese correo no parece válido.");
        return;
      }
      if (!clave) {
        setError("Falta la contraseña.");
        return;
      }
      const a = auth();
      if (!a) {
        setError("La plataforma todavía no está conectada a Firebase.");
        return;
      }

      setEntrando(true);
      try {
        await signInWithEmailAndPassword(a, correo, clave);
        /* No se hace nada más aquí: el aviso de arriba se encarga de cargar la
           ficha y de decidir si pasa. Un solo camino para entrar, y da igual si
           se acaba de escribir la contraseña o si la sesión venía de ayer. */
      } catch (err) {
        /*
         * DOS FAMILIAS DE FALLO, Y NO SE PUEDEN CONTAR IGUAL.
         *
         * 1) LAS CREDENCIALES. Firebase distingue «ese correo no existe» de «la
         *    contraseña está mal», y aquí eso se aplasta a propósito en un solo
         *    mensaje: repetir la diferencia le confirmaría a cualquiera qué
         *    cuentas existen, que es media entrada regalada. Iris sabe su
         *    correo; quien lo esté probando, no tiene por qué averiguarlo.
         *
         * 2) LA INSTALACIÓN. Que el dominio no esté en la lista de Firebase,
         *    que el acceso por correo esté apagado, que no haya red. Aquí el
         *    mensaje genérico no es prudencia: es una mentira. Le dice a Iris
         *    que se ha equivocado de contraseña cuando su contraseña está bien,
         *    y la manda a probar veinte veces algo que nunca va a funcionar
         *    mientras el fallo esté en la consola de Firebase y no en sus
         *    dedos. Esto pasó de verdad y costó una tarde.
         *
         * Estos códigos no revelan nada de nadie —hablan de la configuración
         * del proyecto, no de qué cuentas hay dentro—, así que se dicen enteros
         * y con el sitio exacto donde se arreglan.
         */
        const codigo = (err as { code?: string })?.code || "";
        const CONFIG: Record<string, string> = {
          "auth/unauthorized-domain":
            "Firebase no reconoce esta dirección. En la consola de Firebase → Authentication → Configuración → Dominios autorizados, añade el dominio de esta página. No es tu contraseña.",
          "auth/operation-not-allowed":
            "El acceso con correo y contraseña está apagado en Firebase. Actívalo en Authentication → Sign-in method → Correo electrónico/contraseña. No es tu contraseña.",
          "auth/network-request-failed":
            "No hay manera de hablar con Firebase: revisa la conexión. No es tu contraseña.",
          "auth/invalid-api-key":
            "La clave de Firebase de esta página no es válida. Revisa NEXT_PUBLIC_FIREBASE_API_KEY en Vercel. No es tu contraseña.",
          "auth/api-key-not-valid":
            "La clave de Firebase de esta página no es válida. Revisa NEXT_PUBLIC_FIREBASE_API_KEY en Vercel. No es tu contraseña.",
          "auth/configuration-not-found":
            "Este proyecto de Firebase todavía no tiene Authentication activado. Actívalo en la consola de Firebase → Authentication → Comenzar. No es tu contraseña.",
          "auth/too-many-requests":
            "Firebase ha bloqueado los intentos un rato por seguridad. Espera unos minutos y vuelve a probar.",
        };
        setError(CONFIG[codigo] || "No hemos podido entrar con esos datos.");
      } finally {
        setEntrando(false);
      }
    },
    [],
  );

  const sale = useCallback(() => {
    const a = auth();
    if (a) void signOut(a);
    setUsuario(false);
  }, []);

  const valor = useMemo<Estado>(
    () => ({ usuario, entrando, error, conNube, entra, sale }),
    [usuario, entrando, error, conNube, entra, sale],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion(): Estado {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSesion fuera de SesionProvider");
  return v;
}
