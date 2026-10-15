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
import type { Rol } from "@/lib/roles";
import { nube } from "../firebase";

export type FichaUsuario = {
  uid: string;
  email: string;
  nombre: string;
  activo: boolean;
  /**
   * LAS LLAVES QUE LLEVA. Puede no estar, y eso significa algo concreto.
   *
   * Las fichas escritas antes de que existieran los roles no tienen este campo,
   * y se leen como administradoras — ver `rolesDe` en `lib/roles.ts`, que es el
   * único sitio donde se decide eso. Aquí el campo va opcional porque así es
   * como está en la base de datos, no por comodidad: ponerlo obligatorio
   * obligaría a inventarse un valor al leer, y ese invento taparía la
   * diferencia entre «no tiene roles escritos» y «tiene la lista vacía», que
   * son cosas distintas.
   */
  roles?: Rol[];
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
    activo: f.activo,
    /*
     * UNA FICHA NUEVA NACE SIN NINGUNA LLAVE, Y ESO ES LO SEGURO.
     *
     * Aquí NO se puede caer en la indulgencia de `rolesDe`: una ficha SIN el
     * campo se lee como administradora, y eso está bien para las que se
     * escribieron antes de que los roles existieran —son de Iris y de quien
     * ella ya dejó entrar—. Pero una ficha que se crea HOY, desde la pantalla
     * de Gestión, es de alguien que acaba de llegar. Si naciera sin el campo,
     * la indulgencia la convertiría en administradora y ese alumno vería el
     * despacho entero.
     *
     * Así que se escribe la lista, aunque esté vacía. Vacía significa «sin
     * llaves», que es distinto de «no tiene el campo».
     */
    roles: f.roles ?? [],
  });
}

/** Encender y apagar el acceso de alguien, o corregirle el nombre. */
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
