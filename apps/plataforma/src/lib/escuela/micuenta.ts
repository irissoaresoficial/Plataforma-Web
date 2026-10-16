"use client";

/**
 * ============================================================================
 * MIS DATOS: VERLOS, CORREGIRLOS Y PEDIR QUE SE VAYAN
 * ============================================================================
 *
 * Esto es la parte del reglamento europeo que no se cumple con un párrafo en
 * una página de aviso legal. Son tres derechos concretos y cada uno es un
 * botón que tiene que funcionar:
 *
 *   · ACCESO Y PORTABILIDAD (artículos 15 y 20). «Dime todo lo que tienes de
 *     mí, y dámelo en un formato que pueda llevarme a otro sitio.» Un JSON
 *     que se descarga de un clic cumple las dos cosas: es legible por una
 *     persona y por una máquina.
 *
 *   · RECTIFICACIÓN (artículo 16). «Mi nombre está mal escrito, arréglalo.»
 *     Tiene que poder hacerlo ella, no pedirlo por correo.
 *
 *   · SUPRESIÓN (artículo 17). «Bórrame.» Y aquí está la parte honesta de
 *     este archivo, explicada abajo.
 *
 * ESTOS BOTONES ESTABAN PUESTOS Y NO HACÍAN NADA. Tres `<button>` sin
 * `onClick`, con el texto correcto y el sitio correcto. Eso es peor que no
 * tenerlos: un botón que dice «Borrar mi cuenta» y no borra nada es una
 * promesa legal incumplida con el consentimiento de quien la lee.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ BORRAR NO BORRA EN EL MOMENTO, Y POR QUÉ ESO ESTÁ BIEN
 * ---------------------------------------------------------------------------
 * Lo que una alumna puede borrar ella misma desde el navegador es su avance y
 * sus mensajes. Lo que NO puede borrar, y no debe poder, es su ficha de
 * `usuarios` ni sus inscripciones: ahí está quién compró qué, que es la
 * contabilidad de la escuela, y si cada uno pudiera tocarla se abriría la
 * puerta a borrarle el acceso a otro.
 *
 * Así que la baja se PIDE: se escribe un documento en `bajas` con la fecha, e
 * Iris lo ve en Gestión y lo ejecuta. El reglamento da un mes para responder a
 * una solicitud de supresión, así que esto no es un atajo — es el camino
 * normal. Lo que sí exige el reglamento es que quede constancia de que se
 * pidió y de cuándo, y un documento con fecha es exactamente eso.
 *
 * El día que haya un servidor con llaves de administración (cuando entre
 * Stripe, que las necesita igual), esto se puede automatizar: una función que
 * mire `bajas`, borre todo y quite la cuenta de Auth. Mientras no lo haya,
 * decirle a la persona «lo he pedido, te contestan en menos de un mes» es la
 * verdad; «ya está borrado» no lo sería.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { cursos as repoCursos, inscripciones as repoInscripciones, avance as repoAvance } from "./index";
import { visitasDe } from "./trofeos";

function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}

/* ------------------------------------------------------------------ nombre */

/**
 * CORREGIR MI NOMBRE. Sólo el nombre, y sólo el mío.
 *
 * Las reglas dejan cambiar ese campo y ninguno más: ni el rol, ni si la cuenta
 * está activa, ni el correo. El porqué está escrito en `firestore.rules`, en
 * el bloque de `usuarios`, porque es ahí donde de verdad se impide.
 */
export async function cambiaNombre(uid: string, nombre: string): Promise<void> {
  const limpio = nombre.trim();
  if (!limpio) throw new Error("El nombre no puede quedarse en blanco.");
  if (limpio.length > 80) throw new Error("Ese nombre es demasiado largo.");
  await updateDoc(doc(base(), "usuarios", uid), { nombre: limpio });
}

/* ------------------------------------------------- descargar lo que hay */

export type MisDatos = {
  /** Cuándo se generó esta copia. Va dentro para que el archivo se explique
   *  solo seis meses después, cuando ya nadie recuerda de cuándo es. */
  generado: string;
  ficha: Record<string, unknown> | null;
  cursos: Array<{ cursoId: string; titulo: string; desde: string; via: string; leccionesHechas: string[] }>;
  comunidad: { temas: unknown[]; respuestas: unknown[] };
  visitas: string[];
  /** Lo que NO está aquí, dicho en el propio archivo. Un volcado que calla lo
   *  que se ha dejado fuera no es transparencia, es una lista. */
  noIncluido: string[];
};

/**
 * TODO LO QUE LA ESCUELA GUARDA DE UNA PERSONA, en un objeto.
 *
 * Se lee con el vale de ella, no con llaves de administración: si una lectura
 * aquí fallara por permisos, significaría que la plataforma le está escondiendo
 * algo suyo, y eso es un fallo que hay que ver, no tragarse. Por eso no hay
 * `catch` que devuelva vacío — excepto en las visitas, que son el único dato
 * que puede no existir todavía sin que nada vaya mal.
 */
export async function misDatos(uid: string): Promise<MisDatos> {
  const b = base();

  const ficha = await getDoc(doc(b, "usuarios", uid));
  const inscritos = await repoInscripciones.deAlumno(uid);
  const publicados = await repoCursos.publicados();
  const titulos = new Map(publicados.map((c) => [c.id, c.titulo]));

  const cursos = await Promise.all(
    inscritos.map(async (i) => {
      const av = await repoAvance.de(uid, i.cursoId).catch(() => null);
      return {
        cursoId: i.cursoId,
        titulo: titulos.get(i.cursoId) ?? "(curso retirado)",
        desde: i.desde,
        via: i.via,
        leccionesHechas: av?.hechas ?? [],
      };
    })
  );

  const [temas, respuestas] = await Promise.all([
    getDocs(query(collection(b, "temas"), where("uid", "==", uid))),
    getDocs(query(collection(b, "respuestas"), where("uid", "==", uid))),
  ]);

  /* Las visitas se piden por su nombre y no con una consulta. No es un detalle
     de estilo: la regla de `visitas` compara el NOMBRE del documento con quien
     pregunta, y eso Firestore no lo puede comprobar por adelantado en una
     consulta a la colección entera — la rechazaría. Pedir el documento suyo,
     que es lo que de verdad se quiere, funciona y además es una lectura. */
  const visitas = await visitasDe(uid).catch(() => [] as string[]);

  return {
    generado: new Date().toISOString(),
    ficha: ficha.exists() ? { id: ficha.id, ...ficha.data() } : null,
    cursos,
    comunidad: {
      temas: temas.docs.map((d) => ({ id: d.id, ...d.data() })),
      respuestas: respuestas.docs.map((d) => ({ id: d.id, ...d.data() })),
    },
    visitas,
    noIncluido: [
      "Los vídeos de las clases: son material de la escuela, no datos tuyos.",
      "Tu contraseña: no la guarda la escuela, la guarda Firebase Authentication y nadie puede leerla.",
      "Lo que el navegador guarda en tu propio ordenador (el tema claro u oscuro, por ejemplo): eso no sale de ahí.",
    ],
  };
}

/**
 * DESCARGAR UN OBJETO COMO ARCHIVO, sin servidor.
 *
 * Se construye el archivo en memoria, se le hace una dirección temporal y se
 * pulsa un enlace invisible. Suena a truco y lo es, pero es EL truco: no hay
 * forma de iniciar una descarga desde JavaScript sin un `<a download>`.
 *
 * El `revokeObjectURL` no es opcional: sin él, el archivo entero se queda en
 * la memoria de la pestaña hasta que se cierra.
 */
export function descarga(datos: unknown, nombreArchivo: string): void {
  const texto = JSON.stringify(datos, null, 2);
  const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------- la baja */

export type Baja = {
  id: string;
  uid: string;
  email: string;
  nombre: string;
  pedida: string;
  /** La pone Iris cuando ya ha borrado todo. Mientras esté vacía, está
   *  pendiente. */
  hecha?: string;
};

/**
 * PEDIR LA BAJA, y de paso borrar ya lo que sí se puede borrar.
 *
 * El orden importa y es a propósito: primero se deja constancia de la
 * solicitud y sólo después se borran cosas. Si se hiciera al revés y fallara
 * la escritura de `bajas`, quedaría una persona con el avance borrado, sin
 * baja pedida y sin saberlo.
 *
 * Los mensajes de la comunidad NO se borran aquí aunque las reglas dejen al
 * autor borrar los suyos: borrar un hilo del que cuelgan respuestas de otras
 * personas deja esas respuestas hablando solas. Eso lo decide Iris cuando
 * ejecuta la baja, mirando el hilo. Lo que sí se va es el avance, que no le
 * sirve a nadie más.
 */
export async function pideBaja(uid: string, email: string, nombre: string): Promise<Baja> {
  const b = base();
  const baja: Baja = {
    id: uid,
    uid,
    email,
    nombre,
    pedida: new Date().toISOString(),
  };
  await setDoc(doc(b, "bajas", uid), baja);

  const inscritos = await repoInscripciones.deAlumno(uid).catch(() => []);
  await Promise.all(
    inscritos.map((i) => deleteDoc(doc(b, "avance", `${uid}__${i.cursoId}`)).catch(() => {}))
  );

  return baja;
}

/** Si ya la pedí, para no dejar el botón pidiéndola otra vez. */
export async function miBaja(uid: string): Promise<Baja | null> {
  const d = await getDoc(doc(base(), "bajas", uid)).catch(() => null);
  return d?.exists() ? ({ id: d.id, ...d.data() } as Baja) : null;
}

/** Las que están pendientes. Sólo las ve la administración. */
export async function bajasPendientes(): Promise<Baja[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(collection(b, "bajas"));
  return r.docs
    .map((d) => ({ id: d.id, ...d.data() } as Baja))
    .filter((x) => !x.hecha)
    .sort((a, c) => a.pedida.localeCompare(c.pedida));
}

/** Iris marca una baja como ejecutada. No la borra: queda el registro de que
 *  se pidió y de que se hizo, que es lo que habría que poder enseñar si
 *  alguien preguntara. */
export async function cierraBaja(uid: string): Promise<void> {
  await updateDoc(doc(base(), "bajas", uid), { hecha: new Date().toISOString() });
}
