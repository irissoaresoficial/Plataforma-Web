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
 * falsificar. Y con ese vale, las reglas de Firestore deciden qué puede tocar
 * cada uno — están en `firebase/firestore.rules`, comentadas una a una.
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
 * instante, sin perder nada. Es también lo que permite que haya roles.
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
import { doc, getDoc } from "firebase/firestore";
import { auth, hayFirebase, nube } from "./firebase";

/** Lo que puede hacer alguien dentro. */
export type Rol = "admin" | "trabajo" | "lectura";

export const ROLES: Array<{ k: Rol; label: string; que: string }> = [
  { k: "admin", label: "Administradora", que: "Todo, y además da y quita accesos." },
  { k: "trabajo", label: "Trabajo", que: "Ve y cambia los estudios, la agenda, los clientes y las facturas." },
  { k: "lectura", label: "Sólo mirar", que: "Lo ve todo pero no puede cambiar nada." },
];

export type Usuario = {
  uid: string;
  email: string;
  nombre: string;
  rol: Rol;
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
  /** Atajo para las pantallas: ¿puede cambiar cosas o sólo mirar? */
  puedeEditar: boolean;
  esAdmin: boolean;
};

const Ctx = createContext<Estado | null>(null);

/** El usuario de mentira de cuando no hay nube. Sólo existe en desarrollo. */
const LOCAL: Usuario = { uid: "local", email: "local", nombre: "Iris", rol: "admin", activo: true };

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
        const ficha = await getDoc(doc(base, "usuarios", u.uid));
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
          rol: (d.rol as Rol) || "lectura",
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
      } catch {
        /*
         * EL MISMO MENSAJE PARA TODOS LOS FALLOS, Y ES A PROPÓSITO.
         *
         * Firebase distingue «ese correo no existe» de «la contraseña está
         * mal». Repetirlo aquí le confirmaría a cualquiera qué cuentas existen,
         * que es media entrada regalada. Iris sabe su correo; quien lo esté
         * probando, no tiene por qué averiguarlo.
         */
        setError("No hemos podido entrar con esos datos.");
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

  const valor = useMemo<Estado>(() => {
    /* `usuario` es tres cosas: null (todavía no se sabe), false (no hay nadie)
       o la persona. Sólo la tercera tiene rol. */
    const u = usuario ? usuario : null;
    return {
      usuario,
      entrando,
      error,
      conNube,
      entra,
      sale,
      puedeEditar: !u ? false : u.rol === "admin" || u.rol === "trabajo",
      esAdmin: !u ? false : u.rol === "admin",
    };
  }, [usuario, entrando, error, conNube, entra, sale]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion(): Estado {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSesion fuera de SesionProvider");
  return v;
}
