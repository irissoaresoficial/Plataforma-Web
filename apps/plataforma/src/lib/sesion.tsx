"use client";

/**
 * QUIÉN HA ENTRADO
 *
 * Un sitio y sólo uno donde se pregunta si hay alguien dentro y quién es. Las
 * pantallas no saben de dónde sale esa respuesta, así que el día que entre
 * Firebase sólo cambia este archivo.
 *
 * ⚠️ ESTO TODAVÍA NO ES SEGURIDAD, Y HAY QUE DECIRLO CLARO.
 *
 * Lo que hay aquí es una puerta de fachada: guarda en el navegador que alguien
 * ha entrado y enseña la plataforma. Sirve para montar y probar las pantallas
 * —que es lo que toca ahora— y NO protege absolutamente nada: cualquiera que
 * abra las herramientas del navegador y escriba una línea entra igual, porque
 * la comprobación ocurre en su ordenador y no en un servidor.
 *
 * Mientras esto sea así, la plataforma no puede publicarse con datos de
 * clientes dentro. La puerta de verdad llega con Firebase Authentication:
 * entonces quien decide es el servidor, las reglas de la base de datos
 * comprueban el usuario en cada lectura, y esta fachada se cae sola.
 *
 * Para que no se olvide, la propia pantalla lo dice en rojo mientras dure.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const CLAVE = "es33.sesion";

/**
 * Quién puede entrar, hoy.
 *
 * Una lista escrita a mano, y por ahora con un solo nombre. Es lo que se pidió:
 * de momento sólo entra una cuenta. Cuando exista Firebase esta lista
 * desaparece y el permiso pasa a estar en el servidor, que es donde tiene que
 * estar — una lista en el código del navegador la lee cualquiera.
 */
const PERMITIDOS = ["irissoaresoficial@gmail.com", "gaagredo75@gmail.com"];

export type Usuario = { email: string; nombre: string };

type Estado = {
  /** null mientras no se sabe; después, el usuario o `false` si no hay nadie. */
  usuario: Usuario | null | false;
  entrando: boolean;
  error: string;
  entra: (email: string, clave: string) => Promise<void>;
  sale: () => void;
};

const Ctx = createContext<Estado | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null | false>(null);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState("");

  /* Se mira una sola vez al arrancar. Hasta que termine, `usuario` es null y la
     aplicación enseña el hueco de carga: si enseñara la puerta, quien ya había
     entrado vería un parpadeo de inicio de sesión en cada recarga. */
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      setUsuario(guardado ? (JSON.parse(guardado) as Usuario) : false);
    } catch {
      setUsuario(false);
    }
  }, []);

  const entra = useCallback(async (email: string, clave: string) => {
    setError("");
    const correo = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      setError("Ese correo no parece válido.");
      return;
    }
    if (!clave.trim()) {
      setError("Falta la contraseña.");
      return;
    }

    setEntrando(true);
    /* La espera es de mentira, y está aquí a propósito: sin ella el botón no
       llega a enseñar su estado de «entrando» y no se puede comprobar que
       funciona. Cuando haya servidor, la espera será la de verdad. */
    await new Promise((r) => setTimeout(r, 700));
    setEntrando(false);

    if (!PERMITIDOS.includes(correo)) {
      /* El mismo mensaje para un correo que no está en la lista y para una
         contraseña mala. Decir «ese correo no existe» le confirma a cualquiera
         qué cuentas hay: es la forma más fácil de regalar media entrada. */
      setError("No hemos podido entrar con esos datos.");
      return;
    }

    const u: Usuario = { email: correo, nombre: correo.split("@")[0] };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(u));
    } catch {
      // Navegación privada: se entra igual, pero habrá que volver a entrar.
    }
    setUsuario(u);
  }, []);

  const sale = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE);
    } catch {}
    setUsuario(false);
    setError("");
  }, []);

  const valor = useMemo<Estado>(() => ({ usuario, entrando, error, entra, sale }), [usuario, entrando, error, entra, sale]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSesion() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSesion tiene que ir dentro de <SesionProvider>");
  return c;
}
