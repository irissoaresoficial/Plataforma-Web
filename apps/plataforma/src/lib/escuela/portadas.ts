/**
 * LA PORTADA DE CADA CURSO, EN UN SOLO SITIO.
 *
 * Primero la que haya puesto quien lo monta. Si no hay, la de la casa: los
 * cursos que ya tienen marca propia —Desórdenes Amorosos tiene logo y cartel
 * en la web— salen con lo suyo; el resto, con una foto de la casa. Nunca un
 * cuadro gris con una letra.
 *
 * Se reconoce el curso por su nombre y no por su identificador a propósito:
 * el identificador lo inventa el código al crearlo, y quien lo crea sólo sabe
 * cómo se llama.
 */
import type { Curso } from "./tipos";

const FOTOS = ["/escuela/basico.jpg", "/escuela/temario.jpg", "/escuela/material.jpg"];

/** Los cursos con marca propia: su portada y, si lo tiene, su logo. */
const DE_LA_CASA: Array<{ nombre: RegExp; portada: string; logo?: string }> = [
  /* «Tres generaciones», la imagen del anuncio que más inscritas trae, con un
     velo vino abajo. El logo sobre granate liso se quedaba en un cuadro plano. */
  { nombre: /des[oó]rdenes\s+amorosos/i, portada: "/escuela/desordenes-tres-generaciones.jpg", logo: "/escuela/desordenes-logo.jpg" },
  /* La Iris del cartel, la misma del banner de la web. */
  { nombre: /numerolog[ií]a/i, portada: "/escuela/numerologia-iris.jpg" },
];

const esImagen = (u: string) => Boolean(u) && !/\.(mp4|webm|mov)(\?|$)/i.test(u);

/*
 * LOS CURSOS DE LA CASA LLEVAN SU PORTADA SIEMPRE (19 de noviembre de 2026).
 * Gerson: «las imágenes de los cursos, ahí debe ir la imagen de la portada».
 * La de Desórdenes guardada en la base no cargaba y caía a la lámpara de
 * relleno; la de Numerología no tenía y salía una «C». Para estos dos manda
 * la de aquí; un curso nuevo sigue usando la que le suban.
 */
export function portadaDe(c: Pick<Curso, "titulo" | "portada">, i = 0): string {
  const casa = DE_LA_CASA.find((x) => x.nombre.test(c.titulo));
  if (casa) return casa.portada;
  if (esImagen(c.portada)) return c.portada;
  return FOTOS[i % FOTOS.length];
}

/** El logo del curso, si tiene marca propia. */
export function logoDe(c: Pick<Curso, "titulo">): string | null {
  return DE_LA_CASA.find((x) => x.nombre.test(c.titulo))?.logo ?? null;
}
