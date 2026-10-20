"use client";

/**
 * ============================================================================
 * UNA PERSONA ES UNA PERSONA
 * ============================================================================
 *
 * Había dos pantallas, Leads y Clientes, y Gerson las juntó de un plumazo:
 * «los clientes, los leads, es irrelevante, no sé cuál es la diferencia,
 * entonces que sea solamente una sola persona».
 *
 * Tenía razón, y la diferencia era de la base de datos, no de la vida. Son dos
 * colecciones porque las escribe gente distinta:
 *
 *   · `leads` los escribe EL SERVIDOR DE LA WEB cuando alguien rellena un
 *     formulario. Iris no puede crearlos ni borrarlos, y eso está bien: un
 *     lead es el registro de que algo pasó.
 *   · `clientes` los escribe IRIS, con sus notas, su consentimiento y sus
 *     datos de facturar.
 *
 * Pero para quien trabaja, Marta que pidió la prueba gratis en marzo y Marta
 * que vino a tres sesiones en junio es LA MISMA MARTA. Tenerla en dos
 * pantallas obliga a buscarla dos veces y a acordarse de en cuál estaba lo que
 * se buscaba.
 *
 * ESTO NO MUEVE NI UN DATO. Las dos colecciones siguen igual, con sus reglas y
 * con quien las escribe. Lo que se junta es cómo se LEE: una lista, una ficha,
 * una persona.
 *
 * ---------------------------------------------------------------------------
 * LA LLAVE ES EL CORREO, Y HAY QUE SABER POR QUÉ
 * ---------------------------------------------------------------------------
 * No hay otra. El nombre no vale —«Marta» hay tres, y una lo escribió con
 * acento y otra sin él—, y el identificador tampoco: el de un lead lleva
 * dentro el formulario por el que entró (`reserva__marta@…`), así que la misma
 * persona pidiendo dos cosas son dos documentos distintos.
 *
 * En minúsculas y sin espacios, porque quien escribe `Marta@Gmail.com` en un
 * formulario y `marta@gmail.com` en otro es la misma.
 *
 * Y SIN CORREO TAMBIÉN SE EXISTE. Iris apunta a alguien después de una llamada
 * y puede no tener su correo. Esa ficha no se funde con nada —no hay con qué—
 * y se queda sola, con su identificador por llave. Es lo correcto: fundir por
 * nombre juntaría a dos personas distintas, y eso en un historial de sesiones
 * es mucho peor que tener dos fichas de la misma.
 */

import type { Cliente } from "./tipos";
import type { Lead } from "./leads";

export type Persona = {
  /** El correo en minúsculas, o el identificador de la ficha si no lo hay. */
  llave: string;
  /** Como se le llama en pantalla. */
  nombre: string;
  email: string;
  /** Su ficha, si Iris ya se la ha hecho. */
  cliente: Cliente | null;
  /**
   * Lo que ha entrado por la web a su nombre, de lo más reciente a lo más
   * antiguo. Puede ser más de uno: la misma persona pide la prueba gratis en
   * marzo y un curso en junio, y las dos cosas son verdad.
   */
  leads: Lead[];
};

/** El correo, normalizado para poder compararlo. */
export function llaveDeCorreo(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * JUNTA LAS DOS LISTAS EN UNA DE PERSONAS.
 *
 * El orden que sale es por nombre, como la lista de clientes de siempre: esta
 * pantalla existe para encontrar a alguien cuyo nombre ya se sabe, y una lista
 * que se reordena sola obliga a volver a buscar con los ojos cada vez que se
 * guarda algo.
 *
 * El NOMBRE sale de la ficha si la hay, y si no del lead más reciente que
 * traiga uno. Un lead puede venir sin nombre —hay formularios que sólo piden
 * el correo— y en ese caso se enseña el correo, que es lo único que se sabe.
 * Inventarse un «Sin nombre» donde hay un correo legible es esconder el único
 * dato que sirve para reconocerla.
 */
export function juntaPersonas(clientes: Cliente[], leads: Lead[]): Persona[] {
  const porLlave = new Map<string, Persona>();

  for (const c of clientes) {
    const llave = llaveDeCorreo(c.email) || c.id;
    porLlave.set(llave, {
      llave,
      nombre: c.nombre,
      email: c.email,
      cliente: c,
      leads: [],
    });
  }

  for (const l of leads) {
    const llave = llaveDeCorreo(l.email);
    /* Un lead sin correo no puede ser nadie: es lo único que lo identifica.
       No debería existir —la web pide el correo— pero si apareciera uno, se
       deja fuera en vez de crear una persona fantasma sin forma de volver a
       encontrarla. */
    if (!llave) continue;
    const ya = porLlave.get(llave);
    if (ya) {
      ya.leads.push(l);
      if (!ya.nombre.trim() && l.nombre.trim()) ya.nombre = l.nombre;
    } else {
      porLlave.set(llave, {
        llave,
        nombre: l.nombre.trim() || l.email,
        email: l.email,
        cliente: null,
        leads: [l],
      });
    }
  }

  for (const p of porLlave.values()) {
    /* Lo más reciente primero. `visto` es cuándo volvió la última vez, que es
       lo que importa de un lead que ha entrado varias veces. */
    p.leads.sort((a, b) => (b.visto?.getTime() ?? 0) - (a.visto?.getTime() ?? 0));
    if (!p.nombre.trim()) p.nombre = p.email || "Sin nombre";
  }

  return [...porLlave.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
  );
}

/**
 * EN QUÉ PUNTO ESTÁ, dicho en una palabra.
 *
 * No es un campo guardado y no debería serlo: se deduce de lo que hay. Un
 * estado que hay que acordarse de mover a mano es un estado que a las tres
 * semanas miente, y entonces la lista deja de servir para decidir nada.
 *
 *   · `clienta`  — ya ha venido, o Iris le ha hecho ficha y le ha puesto algo.
 *   · `escrita`  — ha entrado por la web y ya se ha hablado con ella.
 *   · `nueva`    — ha dejado su correo y todavía no se le ha escrito.
 *   · `fuera`    — no sigue adelante. Se queda apuntada, no se borra.
 *
 * El estado del LEAD manda sobre el resto cuando dice «descartado»: es lo
 * único que Iris marca a mano diciendo «esto no va a ninguna parte», y
 * adivinar por encima de eso sería ignorarla.
 */
export type Punto = "clienta" | "escrita" | "nueva" | "fuera";

export function puntoDe(p: Persona, sesiones: number): Punto {
  const estados = p.leads.map((l) => l.estado);
  if (estados.length && estados.every((e) => e === "descartado")) return "fuera";
  if (sesiones > 0 || estados.includes("cliente")) return "clienta";
  if (estados.includes("contactado")) return "escrita";
  if (p.leads.length) return "nueva";
  /* Sin un solo lead detrás, es alguien que apuntó Iris a mano. Que se haya
     molestado en hacerle ficha ya dice que no es un correo suelto. */
  return "escrita";
}

/**
 * POR QUÉ FORMULARIO ENTRÓ, dicho como se lee.
 *
 * Vive aquí y no en la pantalla porque lo dicen los dos sitios —la fila de la
 * lista y la ficha abierta— y dos tablas con los mismos nombres acaban
 * discrepando el día que se cambia una.
 */
export const FORMULARIOS: Record<string, string> = {
  sinergia: "Pidió el estudio Sinergia",
  membresia: "Se apuntó a la lista de espera",
  curso: "Preguntó por un curso",
  reserva: "Pidió cita",
};

export const NOMBRE_PUNTO: Record<Punto, string> = {
  clienta: "Clienta",
  escrita: "Hablado",
  nueva: "Nueva",
  fuera: "Descartada",
};

/** El tono de cada punto. El color marca; no rellena. */
export const TONO_PUNTO: Record<Punto, string> = {
  clienta: "lima",
  escrita: "cielo",
  nueva: "melocoton",
  fuera: "",
};
