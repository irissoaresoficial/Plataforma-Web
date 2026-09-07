/**
 * LOS AVISOS
 *
 * QUÉ ES UN AVISO AQUÍ, porque la palabra se usa para cualquier cosa.
 *
 * Un aviso es algo que a Iris se le va a escapar y que se resuelve en un sitio
 * concreto de la plataforma. Nada más. De ahí salen las tres condiciones que
 * cumple todo lo de este archivo, y por las que se han caído la mitad de las
 * ideas que parecían buenas:
 *
 *  1. TIENE QUE PODER RESOLVERSE. Si al pulsarlo no hay nada que hacer, no es
 *     un aviso: es una estadística. «Tienes 8 clientes» no está aquí.
 *
 *  2. NO PUEDE SER LO QUE YA ENSEÑA LA PANTALLA. Que faltan los datos fiscales
 *     lo grita la pantalla de Facturas con una tarjeta entera. Repetirlo arriba
 *     no añade nada y sí añade un número al contador.
 *
 *  3. TIENE QUE PODER DEJAR DE SALIR. Un aviso que vuelve cada mañana pase lo
 *     que pase deja de leerse a la semana. Todos se pueden callar, y callarlos
 *     no es taparlos: el sello guarda en qué estado estaban, así que si la
 *     situación cambia de verdad, el aviso vuelve. Ver `AvisoVisto` en
 *     `tipos.ts`.
 *
 * LO QUE SE HA DESCARTADO, y por qué:
 *
 *  · «Faltan tus datos fiscales» — permanente y ya dicho en su pantalla (2).
 *  · «Esta ficha no tiene consentimiento» — permanente: no es algo que pasa
 *    hoy, es como está esa ficha, y ya sale en rojo dentro de ella (2).
 *  · «Hay una sesión pedida por la web sin confirmar» — ESTABA DESCARTADO Y HA
 *    VUELTO. El motivo de descartarlo era la regla 1: no había botón para
 *    confirmarla, así que el aviso llevaba a un sitio donde no se podía hacer
 *    nada. Ese motivo ya no existe: la agenda tiene el botón, y sobre todo
 *    ahora entran reservas DE VERDAD por la web. Una sesión vendida que Iris no
 *    ha visto es exactamente lo que un panel de avisos existe para no dejar
 *    pasar — es lo primero de la lista y es lo que más cuesta si se escapa.
 *  · «Cumpleaños» — la ficha no guarda fecha de nacimiento. La que hay vive en
 *    los estudios y se cruza por el nombre, que es una atadura con cuerda: un
 *    aviso que felicita a quien no toca es peor que ninguno.
 *
 * Este archivo no lee ni escribe nada: recibe las listas y devuelve avisos. Lo
 * que se guarda —qué se ha visto ya— pasa por `RepoAvisos`.
 */

import type { AvisoVisto, Cita, Cliente, Factura } from "./tipos";
import { cierraDia, claveDia, diaRelativo, diasEntre, hace, hora } from "./fechas";
import { DIAS_FRIO, mayuscula, relacionDe } from "./relacion";

/** A dónde lleva pulsar un aviso. Cada uno cae en la pantalla donde se arregla,
 *  y con lo suyo ya abierto: llevarla a «Clientes» sin abrir la ficha sería
 *  dejarla a medio camino. */
export type DestinoAviso =
  | { pantalla: "agenda" }
  | { pantalla: "clientes"; clienteId: string; foco?: "nota" }
  | { pantalla: "facturas"; facturaId: string };

export type Aviso = {
  id: string;
  sello: string;
  /** La frase, dicha como se la diría alguien. Nunca un dato suelto. */
  titulo: string;
  /** Lo que ayuda a decidir sin abrir nada: la hora, el teléfono, cuánto hace. */
  detalle?: string;
  destino: DestinoAviso;
  /**
   * De qué clase es. Sólo decide el color del punto de la fila:
   *   · `hoy`    — el ritmo del día. No es una alarma.
   *   · `pierde` — algo se está perdiendo: una nota que no se escribirá, dinero
   *                sin facturar. Es lo único que va en rojo.
   *   · `frio`   — una sugerencia. Ni urgente ni tardía.
   */
  tono: "hoy" | "pierde" | "frio";
};

/** Un borrador de menos de una semana no es un descuido, es una factura que se
 *  está haciendo. A partir de ahí ya es un olvido. */
const DIAS_BORRADOR = 7;

/**
 * CUÁNTOS AVISOS DE LA MISMA CLASE SE DICEN, COMO MUCHO.
 *
 * Con doscientas fichas y tres años de trabajo, «hace mucho que no ves a…»
 * saldría sesenta veces y taparía las otras tres clases: el panel dejaría de
 * servir exactamente por lo que se quería evitar, un contador que se llena de
 * ruido. Lo mismo con las notas sin escribir después de una semana de vacaciones.
 *
 * Se dicen tres de cada clase, las más urgentes, y el resto no desaparece: está
 * en la lista de clientes, que es donde se mira una lista. Un panel no es una
 * lista.
 *
 * (Esto decía «con su montón —Pendiente, Hace mucho—», y esos montones ya no
 * existen: Clientes dejó de ser un tablero de columnas. Lo que sigue siendo
 * cierto es lo de fondo — la información está ahí, sólo que sin repartir.)
 */
const MAXIMO_POR_CLASE = 3;

type Entrada = {
  citas: Cita[];
  clientes: Cliente[];
  facturas: Factura[];
  vistos: AvisoVisto[];
  ahora?: Date;
};

export function calculaAvisos({ citas, clientes, facturas, vistos, ahora = new Date() }: Entrada): Aviso[] {
  const callado = (id: string, sello: string) => vistos.some((v) => v.id === id && v.sello === sello);
  const lista: Aviso[] = [];
  const nombreDe = (id: string) => clientes.find((c) => c.id === id)?.nombre ?? "alguien sin ficha";

  /* --------------------------------------------- sesiones pedidas por la web */
  /*
   * VA EL PRIMERO DE TODOS, Y NO ES CASUALIDAD.
   *
   * Alguien ha entrado en la web, ha elegido día y hora y ha dejado su correo.
   * Eso es lo más cerca de una venta que pasa en esta plataforma sin que Iris
   * levante un dedo — y hasta hoy no salía por ningún lado: la agenda la
   * pintaba «por confirmar» y ya está, así que si no abría la agenda esa semana
   * no se enteraba. Alguien se plantaría solo en una videollamada.
   *
   * El sello es el propio identificador de la cita: callado éste, no vuelve. Y
   * en cuanto se confirma, el aviso desaparece porque deja de cumplir el filtro
   * — no hay que acordarse de quitarlo.
   */
  const pedidas = citas
    .filter((c) => c.estado === "pedida" && c.inicioISO >= ahora.toISOString())
    .filter((c) => !callado(`pedida:${c.id}`, c.id))
    .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO))
    .slice(0, MAXIMO_POR_CLASE);

  pedidas.forEach((c) => {
    lista.push({
      id: `pedida:${c.id}`,
      sello: c.id,
      titulo: `Han pedido sesión para el ${diaRelativo(new Date(c.inicioISO), ahora)} a las ${hora(c.inicioISO)}`,
      /* La nota de la cita trae el nombre y el correo de quien reservó: quien
         lee esto quiere saber quién es antes de decidir si abre la agenda. */
      detalle: (c.notas || "").split("\n")[0] || "Entró por la web. Confírmala o cámbiala.",
      destino: { pantalla: "agenda" },
      /* Rojo, como lo que se pierde. Porque eso es: una sesión vendida que se
         puede caer por no mirarla. */
      tono: "pierde",
    });
  });

  /* ------------------------------------------------------------------ hoy */
  /* Lo que queda de hoy, en UN aviso y no en uno por sesión: en un día de
     cuatro, cuatro avisos idénticos son ruido y esconden los otros tres tipos.
     Lo que hace falta saber es que hay algo y cuál es lo siguiente. */
  const quedanHoy = citas
    .filter(
      (c) =>
        c.estado !== "anulada" &&
        c.estado !== "hecha" &&
        c.inicioISO >= ahora.toISOString() &&
        c.inicioISO <= cierraDia(ahora).toISOString()
    )
    .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));

  if (quedanHoy.length) {
    const primera = quedanHoy[0];
    // El sello es el día, no la cuenta de sesiones: si fuera la cuenta, callarlo
    // por la mañana con tres y volverlo a mirar con dos ya cumplidas lo haría
    // reaparecer, y Iris ya había dicho que lo había visto.
    const id = `hoy:${claveDia(ahora)}`;
    const sello = claveDia(ahora);
    if (!callado(id, sello)) {
      lista.push({
        id,
        sello,
        titulo:
          quedanHoy.length === 1
            ? `${nombreDe(primera.personaId)}, hoy a las ${hora(primera.inicioISO)}`
            : `Hoy te quedan ${quedanHoy.length} sesiones`,
        detalle:
          quedanHoy.length === 1
            ? undefined
            : `La primera, ${nombreDe(primera.personaId)} a las ${hora(primera.inicioISO)}.`,
        destino: { pantalla: "agenda" },
        tono: "hoy",
      });
    }
  }

  /* ----------------------------------------------- sesiones sin apuntar */
  /* Es el aviso que más valor añade con el tiempo: una ficha sin notas es una
     lista de nombres, y la nota sólo se escribe si alguien la pide el mismo
     día. Va antes que los borradores porque el recuerdo caduca y una factura
     no. */
  const conRelacion = clientes.map((c) => ({ c, r: relacionDe(c, citas, facturas, ahora) }));

  /* Se descarta lo callado ANTES de quedarse con tres, y no después: si los
     tres primeros estuvieran callados, cortar antes dejaría la clase entera sin
     decir nada aunque hubiera diez más esperando. Vale para las tres listas de
     abajo. */
  conRelacion
    // El sello es la propia sesión: callado éste, no vuelve — Iris ha decidido
    // que de esa sesión no va a escribir nada. Si mañana hay otra sesión sin
    // apuntar, será otro aviso con otro identificador.
    .filter(({ r }) => r.sinApuntar && !callado(`sinnota:${r.sinApuntar.id}`, r.sinApuntar.id))
    // La más reciente primero: es de la que Iris todavía se acuerda, y por
    // tanto la única que puede apuntar bien. Las de hace tres semanas ya se
    // estarían escribiendo de memoria.
    .sort((a, b) => (b.r.sinApuntar?.inicioISO ?? "").localeCompare(a.r.sinApuntar?.inicioISO ?? ""))
    .slice(0, MAXIMO_POR_CLASE)
    .forEach(({ c, r }) => {
      const cita = r.sinApuntar;
      if (!cita) return;
      lista.push({
        id: `sinnota:${cita.id}`,
        sello: cita.id,
        titulo: `Viste a ${c.nombre} ${hace(diasEntre(new Date(cita.inicioISO), ahora))} y no apuntaste nada`,
        detalle: "Apúntalo antes de que se te vaya: es lo que leerás antes de la próxima.",
        destino: { pantalla: "clientes", clienteId: c.id, foco: "nota" },
        tono: "pierde",
      });
    });

  /* ------------------------------------------------ borradores parados */
  facturas
    .filter(
      (f) =>
        f.estado === "borrador" &&
        diasEntre(new Date(f.creada), ahora) >= DIAS_BORRADOR &&
        !callado(`borrador:${f.id}`, f.id)
    )
    // La más vieja primero: es la que lleva más tiempo sin cobrarse.
    .sort((a, b) => a.creada.localeCompare(b.creada))
    .slice(0, MAXIMO_POR_CLASE)
    .forEach((f) => {
      const quien = f.cliente.nombre.trim() || (f.clienteId ? nombreDe(f.clienteId) : "");
      lista.push({
        id: `borrador:${f.id}`,
        sello: f.id,
        titulo: quien ? `La factura de ${quien} sigue en borrador` : "Tienes una factura sin terminar",
        detalle: `La empezaste ${hace(diasEntre(new Date(f.creada), ahora))} y todavía no tiene número.`,
        destino: { pantalla: "facturas", facturaId: f.id },
        tono: "pierde",
      });
    });

  /* ------------------------------------------------------ los que se enfrían */
  conRelacion
    // El sello es la última sesión que tuvo. Callado hoy, se calla mientras ésa
    // siga siendo la última; el día que vuelva y pase otro trimestre sin
    // aparecer, la última será otra y el aviso volverá — que es cuando hay que
    // volver a decirlo.
    .filter(
      ({ c, r }) =>
        r.diasSinVerse !== null &&
        r.diasSinVerse >= DIAS_FRIO &&
        !r.proxima &&
        r.ultima &&
        !callado(`frio:${c.id}`, r.ultima.id)
    )
    .sort((a, b) => (b.r.diasSinVerse ?? 0) - (a.r.diasSinVerse ?? 0))
    .slice(0, MAXIMO_POR_CLASE)
    .forEach(({ c, r }) => {
      lista.push({
        id: `frio:${c.id}`,
        sello: r.ultima?.id ?? "",
        titulo: `${mayuscula(hace(r.diasSinVerse ?? 0))} que no ves a ${c.nombre}`,
        // El teléfono aquí y no en la ficha porque el aviso existe para que
        // llamarla cueste un vistazo: si hay que abrir la ficha para verlo, la
        // llamada se queda para mañana.
        detalle: c.telefono
          ? `Su teléfono: ${c.telefono}`
          : c.email
            ? `Su correo: ${c.email}`
            : "No tienes ni su teléfono ni su correo.",
        destino: { pantalla: "clientes", clienteId: c.id },
        tono: "frio",
      });
    });

  return lista;
}

/**
 * Lo que se dice de la próxima sesión dentro de un aviso o de una ficha.
 * Vive aquí y no en la pantalla porque lo dicen los dos sitios y tienen que
 * decirlo igual.
 */
export const cuandoEs = (iso: string, ahora = new Date()) =>
  `${diaRelativo(new Date(iso), ahora)} a las ${hora(iso)}`;
