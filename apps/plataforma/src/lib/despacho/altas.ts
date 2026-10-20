/**
 * DAR DE ALTA A ALGUIEN DESDE LA PLATAFORMA.
 *
 * Gerson, el 20 de octubre de 2026: «que des la opción ya para crear y delegar
 * usuarios desde el apartado de Iris». Hasta hoy, para que alguien entrara
 * tenía que crearse la cuenta él solo y después Iris le daba las llaves.
 *
 * AHORA IRIS LO HACE TODO DE UNA VEZ: nombre, correo y llaves. La contraseña
 * NO la pone ella: se crea una al azar que no ve nadie, y a la persona le
 * llega un correo de Firebase para elegir la suya. Así no hay contraseñas
 * viajando por WhatsApp, que es como acaban filtrándose.
 *
 * La cuenta se crea en una segunda instancia de Firebase (`appAltas`) para
 * que Iris no se quede dentro con la sesión de la persona nueva.
 */
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut, type User } from "firebase/auth";
import { appAltas, auth } from "@/lib/firebase";
import type { Rol } from "@/lib/roles";
import { daAcceso, quitaFicha } from "./usuarios";

const WEB = process.env.NEXT_PUBLIC_WEB_URL || "https://escueladesabiduria33.com";

/** Pide a la web que mande la bienvenida bonita. Devuelve si salió. */
async function bienvenidaDeLaCasa(yo: User | null, d: { email: string; nombre: string; roles: Rol[] }): Promise<boolean> {
  if (!yo) return false;
  try {
    const r = await fetch(`${WEB}/api/alta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await yo.getIdToken()}` },
      body: JSON.stringify(d),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Una contraseña que no va a escribir nadie: sólo existe hasta que la cambie. */
function alAzar(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("") + "Aa1!";
}

export async function daDeAlta(d: { nombre: string; email: string; roles: Rol[] }): Promise<string> {
  const email = d.email.trim().toLowerCase();
  const nombre = d.nombre.trim();
  if (!nombre) throw new Error("Falta el nombre.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Ese correo no está bien escrito.");
  if (d.roles.length === 0) throw new Error("Elige al menos una llave: si no, entra y no ve nada.");

  const app = appAltas();
  const principal = auth();
  if (!app || !principal) throw new Error("La plataforma no está conectada a Firebase.");

  const otra = getAuth(app);
  let uid: string;
  try {
    const r = await createUserWithEmailAndPassword(otra, email, alAzar());
    uid = r.user.uid;
  } catch (e) {
    const c = (e as { code?: string }).code || "";
    if (c.includes("email-already-in-use")) {
      throw new Error(
        "Ese correo ya tiene cuenta. Si no aparece en la lista de abajo, que entre una vez en la plataforma y aparecerá para darle las llaves."
      );
    }
    if (c.includes("operation-not-allowed")) {
      throw new Error("En Firebase no está encendido el acceso con correo y contraseña (Authentication → Método de acceso).");
    }
    throw new Error("No se ha podido crear la cuenta. Mira la conexión y vuelve a probar.");
  } finally {
    await signOut(otra).catch(() => {});
  }

  await daAcceso({ uid, email, nombre, activo: true, roles: d.roles });
  /*
   * EL CORREO PARA QUE PONGA SU CONTRASEÑA.
   *
   * Primero el de la casa, con diseño y en castellano, que lo manda la web
   * (`apps/web/app/api/alta`) porque es ella la que tiene las llaves. Si no
   * contesta —sin configurar, sin red—, el de Firebase de serie: es feo, pero
   * nadie se queda sin entrar. Y si fallan los dos, la cuenta ya está hecha:
   * se dice, y desde la puerta puede pedir «He olvidado mi contraseña».
   */
  if (await bienvenidaDeLaCasa(principal.currentUser, { email, nombre, roles: d.roles })) return uid;
  try {
    await sendPasswordResetEmail(principal, email);
  } catch {
    throw new Error(
      `La cuenta de ${nombre} está creada, pero no se ha podido mandar el correo para su contraseña. Que entre en la plataforma y pulse «He olvidado mi contraseña».`
    );
  }
  return uid;
}

/**
 * BORRAR A ALGUIEN DEL TODO: su cuenta, su ficha, sus cursos y su avance.
 *
 * Lo hace la web con la llave de administrador (`DELETE /api/alta`). Si no
 * contesta, se quita al menos la ficha: sin ficha no entra, aunque la cuenta
 * se quede en Firebase. Se dice cuál de las dos cosas ha pasado.
 */
export async function borraDelTodo(uid: string): Promise<"todo" | "ficha"> {
  const yo = auth()?.currentUser ?? null;
  if (yo) {
    try {
      const r = await fetch(`${WEB}/api/alta`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await yo.getIdToken()}` },
        body: JSON.stringify({ uid }),
      });
      if (r.ok) return "todo";
    } catch {
      /* se cae a quitar la ficha */
    }
  }
  await quitaFicha(uid);
  return "ficha";
}
