/**
 * ============================================================================
 * LOS PUNTOS DE CADA UNO, CONTADOS EN UN SOLO SITIO
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «dale más contraste a eso de los puntos,
 * que siempre se realce en cada apartado; la idea es generar dopamina con
 * cada dashboard». Así que los puntos salen en la cabecera de todas las
 * pantallas, en el inicio y en la comunidad — y para que digan lo mismo en los
 * tres sitios se cuentan aquí y en ningún otro.
 *
 * DE DÓNDE SALEN, sin nada guardado aparte:
 *   · Los primeros pasos (foto, primer comentario, su curso…), cada uno con
 *     sus puntos, que se tachan solos cuando se hacen.
 *   · Participar en la comunidad: cada tema abierto y cada respuesta.
 *
 * Se guarda un minuto en memoria: la cabecera se monta en cada pantalla y no
 * tiene sentido volver a leer toda la comunidad por cambiar de la agenda a
 * los cursos.
 */
import type { View } from "@/lib/app-context";
import type { Capacidad } from "@/lib/roles";
import { avance as repoAvance, cursos as repoCursos, inscripciones as repoInscripciones } from "./index";
import { listaTemas, nivelDe, PUNTOS_RESPUESTA, PUNTOS_TEMA, todasLasRespuestas } from "./comunidad";

export type Paso = { k: string; que: string; puntos: number; hecho: boolean; ir: View };

export type MisPuntos = {
  pasos: Paso[];
  /** Puntos de los primeros pasos ya hechos, y los que se pueden ganar ahí. */
  dePasos: number;
  dePasosMax: number;
  /** Puntos por participar en la comunidad. */
  deComunidad: number;
  temas: number;
  respuestas: number;
  total: number;
  nivel: ReturnType<typeof nivelDe>;
};

let cache: { clave: string; cuando: number; valor: MisPuntos } | null = null;

/** Olvida lo guardado: después de escribir algo, para que se vea al momento. */
export function refrescaPuntos() {
  cache = null;
  /* Y se avisa a la pastilla de la cabecera, para que cuente y celebre. */
  try {
    window.dispatchEvent(new Event("es33:puntos"));
  } catch {
    /* fuera del navegador no hay nadie a quien avisar */
  }
}

export async function misPuntos(uid: string, foto: boolean, puede: (c: Capacidad) => boolean): Promise<MisPuntos> {
  const clave = `${uid}|${foto}`;
  if (cache && cache.clave === clave && Date.now() - cache.cuando < 60_000) return cache.valor;

  const comunidad = puede("comunidad");
  const creador = puede("crear") && !puede("despacho");
  const alumno = puede("cursos") && !creador;
  const [temasT, respuestasT, propios, ins] = await Promise.all([
    comunidad ? listaTemas().catch(() => []) : Promise.resolve([]),
    comunidad ? todasLasRespuestas().catch(() => []) : Promise.resolve([]),
    creador ? repoCursos.deAutor(uid).catch(() => []) : Promise.resolve([]),
    alumno ? repoInscripciones.deAlumno(uid).catch(() => []) : Promise.resolve([]),
  ]);
  const avs = alumno ? await Promise.all(ins.map((i) => repoAvance.de(uid, i.cursoId).catch(() => null))) : [];
  const temas = temasT.filter((t) => t.uid === uid).length;
  const respuestas = respuestasT.filter((r) => r.uid === uid).length;

  const pasos: Paso[] = [{ k: "foto", que: "Pon tu foto en tu perfil", puntos: 10, hecho: foto, ir: "perfil" }];
  if (comunidad) {
    pasos.push({ k: "tema", que: "Deja tu primer comentario en la comunidad", puntos: 10, hecho: temas > 0, ir: "comunidad" });
    pasos.push({ k: "resp", que: "Responde a alguien en la comunidad", puntos: 5, hecho: respuestas > 0, ir: "comunidad" });
  }
  if (creador) {
    pasos.push({ k: "curso", que: "Crea tu primer curso", puntos: 20, hecho: propios.length > 0, ir: "cursos" });
    pasos.push({
      k: "clase",
      que: "Sube tu primera clase",
      puntos: 20,
      hecho: propios.some((c) => c.modulos.some((m) => m.lecciones.some((l) => l.video))),
      ir: "cursos",
    });
    pasos.push({ k: "publicar", que: "Pide que se publique", puntos: 10, hecho: propios.some((c) => c.revision || c.publicado), ir: "cursos" });
    pasos.push({ k: "agenda", que: "Abre tu agenda", puntos: 5, hecho: false, ir: "miagenda" });
  }
  if (alumno) {
    pasos.push({ k: "leccion", que: "Termina tu primera lección", puntos: 10, hecho: avs.some((a) => (a?.hechas.length ?? 0) > 0), ir: "cursos" });
  }
  /* «Abre tu agenda» se da por hecho en cuanto la ha visitado una vez. */
  try {
    if (localStorage.getItem(`es33.vio-agenda.${uid}`)) pasos.forEach((p) => p.k === "agenda" && (p.hecho = true));
  } catch {
    /* sin almacenamiento */
  }

  const dePasos = pasos.filter((p) => p.hecho).reduce((s, p) => s + p.puntos, 0);
  const dePasosMax = pasos.reduce((s, p) => s + p.puntos, 0);
  const deComunidad = temas * PUNTOS_TEMA + respuestas * PUNTOS_RESPUESTA;
  const total = dePasos + deComunidad;
  const valor: MisPuntos = { pasos, dePasos, dePasosMax, deComunidad, temas, respuestas, total, nivel: nivelDe(total) };
  cache = { clave, cuando: Date.now(), valor };
  return valor;
}

/** Que la agenda cuente como vista. Lo llama la pantalla de la agenda. */
export function marcaAgendaVista(uid: string) {
  try {
    localStorage.setItem(`es33.vio-agenda.${uid}`, "1");
  } catch {
    /* sin almacenamiento */
  }
  refrescaPuntos();
}
