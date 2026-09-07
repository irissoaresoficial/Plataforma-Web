/**
 * EL CORREO QUE RECIBE LA PERSONA DESPUÉS DE LA PRUEBA GRATIS.
 *
 * ================================================================
 * QUÉ ESTABA MAL, Y POR QUÉ ERA GRAVE
 * ================================================================
 * El correo pegaba tal cual el resumen interno:
 *
 *     «Mi madre: Iris 3 · Iris 3 · juntos 6 (Espejo) · 5 repeticiones»
 *
 * Eso está bien escrito… para Iris. Es dos nombres, dos números, un tipo de
 * vínculo y una cuenta, en una línea, para leerlo de un vistazo antes de una
 * llamada. Es una ficha de trabajo.
 *
 * A la persona que acaba de dejar su correo por primera vez, esa misma línea le
 * dice exactamente nada. No sabe qué es un 3, no sabe qué es un 6, no sabe qué
 * es un Espejo y no tiene ni idea de qué son «5 repeticiones». Y no es un
 * problema de estilo: es el momento MÁS caro de todo el embudo. Esa persona ha
 * escrito el nombre de su madre en una web, ha pulsado un botón y ha esperado
 * un correo. Está abierta. Y lo que recibe es una línea de base de datos.
 *
 * Un dato que no se entiende no es un dato: es ruido con números dentro. Y el
 * ruido no vende nada, ni siquiera cuando es verdad.
 *
 * ================================================================
 * QUÉ HACE ESTE ARCHIVO
 * ================================================================
 * Convierte el mismo estudio en un correo escrito para quien lo va a abrir.
 * Tres reglas, y ninguna es decorativa:
 *
 * 1. CADA NÚMERO SE EXPLICA LA PRIMERA VEZ QUE APARECE. Nunca «tenéis un 6»,
 *    siempre «sumando las dos fechas sale un 6, y un 6 va de cuidar y sostener
 *    a los demás». Un número sin traducción es una contraseña que sólo tiene
 *    quien lo escribió.
 *
 * 2. SE HABLA DE LO QUE LE PASA, NO DE LO QUE SALE. La persona no vino a saber
 *    su número: vino porque con esa persona concreta le pasa siempre lo mismo y
 *    no sabe por qué. El correo tiene que hablar de ESO. El número es cómo se
 *    explica, no de qué se habla.
 *
 * 3. SE ABRE UN HUECO, NO SE CIERRA EL TEMA. Lo gratis contesta «qué pasa» y
 *    deja ver que existe un «por qué», que está en el árbol y no cabe en un
 *    correo. Eso no es un truco: es literalmente cierto, y es lo que se hace en
 *    una sesión. Un regalo que lo cuenta todo no deja ninguna razón para
 *    seguir; uno que no cuenta nada no demuestra que haya nada que seguir.
 *
 * LO QUE NO SE HACE AQUÍ: inventarse el significado de nada. Todos los textos
 * de sentido salen de `numerologia.ts`, que es de donde salen también los de la
 * pantalla. Si un día Iris corrige lo que significa un 7, se corrige en un
 * sitio y cambia en la web, en el informe y en este correo a la vez.
 */

import type { Estudio } from './numerologia';
import { SENTIDO } from './numerologia';

/** El primer nombre, que es como se le habla a alguien. */
function pila(nombre: string): string {
  return (nombre || '').trim().split(/\s+/)[0] || '';
}

/**
 * Cómo llamar a la otra persona dentro del texto.
 *
 * Si escribió una etiqueta —«mi madre», «mi socio»— se usa esa, porque es la
 * palabra que ella misma eligió y ninguna otra le va a sonar tan suya.
 *
 * EL POSESIVO CAMBIA DE PERSONA, y no es un detalle. Ella escribió «mi madre»
 * porque estaba rellenando un formulario sobre sí misma. En el correo quien
 * habla es Iris, así que «mi madre» se convierte en «TU madre». Sin esto salía
 * «lo que se repite entre madre y tú», que no lo dice nadie — y una frase que
 * no dice nadie delata en el primer renglón que el correo lo escribió una
 * máquina, justo en el correo que tiene que sonar a persona.
 */
function comoLlamarla(r: Estudio): string {
  const etiqueta = (r.etiqueta || '').trim();
  if (etiqueta) {
    /* «mi madre» → «tu madre». Si no lleva posesivo —«madre», «socio»— se le
       pone, que es como se dice: «entre tu socio y tú». */
    const sinMi = etiqueta.replace(/^mis?\s+/i, '');
    return /^(tu|tus|su|sus|el|la|los|las|un|una)\s/i.test(sinMi) ? sinMi : `tu ${sinMi}`;
  }
  return pila(r.b.nombrePila) || 'esa persona';
}

/** Qué significa un número, en la frase corta con la que ya se cuenta en la web. */
function queEs(n: number): string {
  return SENTIDO[n]?.frase || '';
}

export type CorreoSinergia = { asunto: string; parrafos: string[] };

/**
 * El correo entero, en párrafos.
 *
 * Párrafos y no HTML a propósito: lo que viaja hasta Google es texto, y el
 * envoltorio —la tipografía, el ancho, el pie con la baja— lo pone la plantilla
 * que ya existe allí. Así este archivo no puede romper el diseño del correo, y
 * la plantilla no tiene que saber nada de numerología.
 */
export function correoSinergia(r: Estudio): CorreoSinergia {
  const yo = pila(r.a.nombrePila);
  const otra = comoLlamarla(r);
  const mismoNumero = r.a.camino.valor === r.b.camino.valor;

  const p: string[] = [];

  /* ------------------------------------------------------------------
     1. LA APERTURA: lo que ya le pasa, antes de un solo número.
     Empezar por el dato es empezar por lo que a ella todavía no le importa.
     ------------------------------------------------------------------ */
  p.push(
    `Hola ${yo}, has mirado lo que hay entre ${otra} y tú. Te cuento lo que ha salido, en cristiano.`,
  );

  /* ------------------------------------------------------------------
     2. LOS DOS NÚMEROS, EXPLICADOS. Nunca sueltos.
     ------------------------------------------------------------------ */
  if (mismoNumero) {
    p.push(
      `Cuando sumo tu fecha de nacimiento entera, sale un ${r.a.camino.valor}. ` +
        `Cuando sumo la de ${otra}, sale el mismo. Ese número es la asignatura que la vida te pone delante: ` +
        `${queEs(r.a.camino.valor)}. Y os ha tocado la misma.`,
    );
    p.push(
      `Eso tiene un nombre y no es casualidad: es un espejo. Lo que te saca de quicio de ${otra} ` +
        `es algo que también es tuyo, y por eso lo reconoces tan rápido. Cuesta de leer, lo sé. ` +
        `Pero es la mejor noticia del correo: si es tuyo también, está en tu mano.`,
    );
  } else {
    p.push(
      `Cuando sumo tu fecha de nacimiento entera, sale un ${r.a.camino.valor}: ${queEs(r.a.camino.valor)}. ` +
        `Haciendo lo mismo con la fecha de ${otra}, sale un ${r.b.camino.valor}: ${queEs(r.b.camino.valor)}. ` +
        `Son dos formas distintas de estar en el mundo, y ninguna es la buena.`,
    );
    /*
     * SI EL NÚMERO COMÚN ES EL DE UNO DE LOS DOS, HAY QUE DECIRLO.
     *
     * Sin esta rama salía «tu madre es un 4… y juntos dais un 4», con el mismo
     * número dos veces seguidas y sin explicar por qué. Quien lo lee piensa que
     * el programa se ha equivocado, y con razón: repetir un dato sin decir que
     * la repetición ES el dato parece un fallo. Y resulta que ahí está lo más
     * interesante de todo el correo.
     */
    const suyo = r.comun === r.b.camino.valor;
    const mio = r.comun === r.a.camino.valor;
    if (suyo || mio) {
      const dueño = suyo ? otra : 'ti';
      p.push(
        `Y aquí está lo interesante: los dos números juntos dan un ${r.comun}, que es justo el número de ${dueño}. ` +
          `Eso quiere decir que lo que se activa entre vosotros es el terreno de ${dueño}: ` +
          `${queEs(r.comun)}. ${suyo ? `Se juega en su campo, y por eso sales de esas conversaciones con la sensación de no llegar nunca.` : `Se juega en el tuyo, aunque parezca que no.`}`,
      );
    } else {
      p.push(
        `Los dos números juntos dan un ${r.comun}, que es lo que se activa cuando estáis delante el uno del otro: ` +
          `${queEs(r.comun)}. Eso es lo que de verdad se os pone encima de la mesa cada vez, ` +
          `aunque la discusión sea por otra cosa.`,
      );
    }
  }

  /* ------------------------------------------------------------------
     3. LO QUE SE REPITE. Vienen ya escritas para leerse, no para
        consultarse: se pasan tal cual.
     ------------------------------------------------------------------ */
  if (r.repeticiones.length) {
    p.push(
      r.repeticiones.length === 1
        ? `Y hay una cosa más que se repite entre vosotros:`
        : `Y hay ${r.repeticiones.length} cosas que se repiten entre vosotros. Las que más pesan:`,
    );
    /* Dos, y no las cinco. No es por ahorrar: cinco bloques seguidos de la misma
       forma dejan de leerse a partir del tercero, y lo que aquí hace falta es que
       se lea entero. El resto está en el informe. */
    r.repeticiones.slice(0, 2).forEach((rep) => {
      p.push(`${rep.titulo}. ${rep.detalle}`);
    });
  }

  /* ------------------------------------------------------------------
     4. EL HUECO. Honesto: esto es la foto, no la película.
     ------------------------------------------------------------------ */
  p.push(
    `Esto te dice QUÉ pasa entre ${otra} y tú. Lo que no te dice es de dónde viene, ` +
      `y eso es lo que en realidad querías saber. Un patrón no empieza en una relación: llega puesto. ` +
      `Alguien antes que vosotros lo vivió primero, no pudo resolverlo, y bajó.`,
  );
  p.push(
    `Para ver eso hay que mirar tu árbol entero: tus padres, tus abuelos, las fechas, los nombres, ` +
      `quién repitió qué. No cabe en un correo y no lo hace un programa: lo miro yo contigo, ` +
      `en una sesión, y salimos con el punto exacto donde se corta.`,
  );

  /* ------------------------------------------------------------------
     5. EL CIERRE. Sin urgencia falsa: no hay ninguna.
     ------------------------------------------------------------------ */
  p.push(
    `Si quieres que lo miremos, contéstame a este correo con un «sí» y te digo huecos. ` +
      `Y si prefieres quedarte con esto y ya está, también está bien: para eso era.`,
  );
  p.push(`Un abrazo,<br>Iris`);

  /*
   * EL ASUNTO. «Tu resultado» no lo abre nadie: podría ser de cualquiera y no
   * promete nada. Éste lleva el nombre de la persona por la que ha entrado —que
   * es lo único que le importa ahora mismo— y dice que hay algo que se repite,
   * que es exactamente la pregunta con la que ha llegado.
   */
  return {
    asunto: `${yo}, lo que se repite entre ${otra} y tú`.slice(0, 120),
    parrafos: p,
  };
}
