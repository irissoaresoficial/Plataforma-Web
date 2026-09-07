"use client";

/**
 * QUIÉN TIENE ACCESO, Y CON QUÉ PERMISO.
 *
 * Las fichas viven en la colección `usuarios` de Firestore, con el `uid` de
 * Firebase Auth como identificador. Aquí sólo se leen y se cambian: **crear la
 * cuenta con su contraseña no se hace desde aquí**, y el motivo importa.
 *
 * POR QUÉ NO SE CREAN CUENTAS DESDE ESTA PANTALLA
 * ------------------------------------------------------------------
 * Para dar de alta a alguien con contraseña desde el navegador sólo hay dos
 * caminos, y los dos son malos:
 *
 *   · `createUserWithEmailAndPassword` desde aquí. Firebase, al crear la
 *     cuenta, TE METE DENTRO CON ELLA — te echa de la tuya. Iris estaría dando
 *     de alta a alguien y de repente se encontraría dentro de la cuenta de esa
 *     persona, sin la suya. Es un fallo clásico y bastante desconcertante.
 *   · una función en el servidor con permisos de administrador. Eso es Cloud
 *     Functions, y Cloud Functions exige el plan de pago de Firebase. Hoy el
 *     proyecto está en el plan gratuito.
 *
 * Así que la cuenta se crea en la consola de Firebase —dos clics, una vez por
 * persona— y aquí se le da la ficha y el rol. La pantalla lo explica.
 *
 * Cuando el proyecto pase a plan de pago, esto se resuelve bien con una función
 * de servidor y esta pantalla se queda igual: sólo cambiará de dónde salen las
 * altas.
 */

import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { nube } from "../firebase";
import type { Rol } from "../sesion";

export type FichaUsuario = {
  uid: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
};

/** Todas las fichas, por nombre. Vacío si no hay nube. */
export async function listaUsuarios(): Promise<FichaUsuario[]> {
  const base = nube();
  if (!base) return [];
  const r = await getDocs(query(collection(base, "usuarios"), orderBy("nombre")));
  return r.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<FichaUsuario, "uid">) }));
}

/**
 * Da acceso a alguien que ya tiene cuenta en Firebase Auth.
 *
 * El `uid` se copia de la consola de Firebase. Es feo pedirlo, pero es la
 * verdad de cómo funciona: el correo NO sirve como identificador porque una
 * persona puede cambiárselo y el `uid` no cambia nunca. Atar los permisos al
 * correo significaría que cambiarse el correo te deja fuera —o peor, que el
 * correo de alguien que se fue lo hereda quien lo reutilice.
 */
export async function daAcceso(f: FichaUsuario): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await setDoc(doc(base, "usuarios", f.uid), {
    email: f.email.trim().toLowerCase(),
    nombre: f.nombre.trim(),
    rol: f.rol,
    activo: f.activo,
  });
}

/** Cambiar el rol o encender y apagar el acceso. */
export async function cambiaUsuario(uid: string, cambios: Partial<Omit<FichaUsuario, "uid">>): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "usuarios", uid), cambios);
}

/**
 * Quitar la ficha. Deja la cuenta de Firebase Auth intacta a propósito: esa
 * persona ya no entra —las reglas exigen ficha— pero si mañana vuelve, se le da
 * ficha otra vez y sigue siendo la misma, con su historial. Borrar cuentas es
 * otra cosa y se hace en la consola de Firebase.
 *
 * Lo normal, de todas formas, es apagar el acceso y no borrar: así queda a la
 * vista que esa persona estuvo.
 */
export async function quitaFicha(uid: string): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await deleteDoc(doc(base, "usuarios", uid));
}
