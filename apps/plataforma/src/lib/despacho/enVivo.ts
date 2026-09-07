/**
 * QUE LA PLATAFORMA AVISE SOLA, EN EL MOMENTO.
 *
 * ===========================================================================
 * EL PROBLEMA, DICHO COMO LO DIJO QUIEN LO USA
 * ===========================================================================
 * «El nombre sí se me puso allí, pero no fue instantáneo y no hubo
 * notificación ni sonido.»
 *
 * Y es exacto. Todo lo que hay en el despacho lee una vez, al abrir la
 * pantalla, y se queda con esa foto hasta que alguien recarga. Eso vale para
 * una lista de facturas del año pasado. No vale para lo único que aquí pasa
 * SOLO: alguien entrando por la web.
 *
 * Sin esto, una herramienta que recibe leads obliga a la persona a recargar
 * cada rato «por si acaso», que es exactamente el trabajo que la herramienta
 * venía a quitar. Y una reserva que llega un jueves por la tarde se descubre
 * el lunes.
 *
 * ===========================================================================
 * CÓMO FUNCIONA, Y POR QUÉ ASÍ
 * ===========================================================================
 * Firestore sabe avisar: `onSnapshot` deja una oreja puesta en una colección y
 * llama de vuelta cada vez que cambia algo, sin preguntar cada X segundos. Eso
 * es lo que hace que sea instantáneo de verdad y no «cada treinta segundos».
 *
 * LA PRIMERA RESPUESTA NO ES UNA NOVEDAD, y aquí está la trampa que se lleva a
 * todo el mundo por delante: Firestore, al enganchar la oreja, entrega TODO lo
 * que ya había como si acabara de llegar. Sin control, abrir la plataforma con
 * cuarenta leads dentro dispararía cuarenta avisos y cuarenta pitidos. Por eso
 * la primera entrega se traga entera y sólo se avisa de lo que llegue DESPUÉS.
 *
 * Y sólo se mira `added`. Que Iris mueva a alguien de columna es un `modified`
 * y no es una novedad: es ella trabajando. Avisarla de sus propios clics es la
 * forma más rápida de que apague los avisos.
 */

import { collection, onSnapshot, orderBy, query, limit, type Unsubscribe } from "firebase/firestore";
import { nube } from "@/lib/firebase";

/** Lo que ha llegado, ya en palabras: esto es lo que se enseña. */
export type Novedad = {
  id: string;
  titulo: string;
  detalle: string;
  /** A dónde lleva pulsarlo. */
  pantalla: "leads" | "agenda";
};

/** Cómo se llama cada origen cuando se avisa de él. Las mismas palabras que en
 *  la pantalla de Leads: dos nombres para lo mismo obligan a traducir. */
const ORIGENES: Record<string, string> = {
  sinergia: "ha hecho la prueba gratis",
  membresia: "se ha apuntado a la lista de espera",
  curso: "pregunta por un curso",
  reserva: "ha pedido una sesión",
};

/**
 * Deja la oreja puesta en los leads y en las citas. Devuelve la función de
 * soltarla — hay que llamarla al desmontar o la oreja se queda puesta y cada
 * cambio de pantalla añade otra.
 *
 * `limit` en las dos consultas no es por rendimiento: es un tope de seguridad.
 * Sin él, una migración o una importación masiva de datos entregaría miles de
 * documentos de golpe en la primera respuesta.
 */
export function escuchaNovedades(alLlegar: (n: Novedad) => void): Unsubscribe {
  const base = nube();
  if (!base) return () => {};

  const sueltas: Unsubscribe[] = [];

  /* -------------------------------------------------------------- leads */
  let primeraLeads = true;
  sueltas.push(
    onSnapshot(
      query(collection(base, "leads"), orderBy("visto", "desc"), limit(30)),
      (foto) => {
        if (primeraLeads) {
          primeraLeads = false;
          return;
        }
        foto.docChanges().forEach((c) => {
          if (c.type !== "added") return;
          const d = c.doc.data() as Record<string, unknown>;
          const nombre = String(d.nombre || "").trim() || String(d.email || "Alguien");
          alLlegar({
            id: `lead:${c.doc.id}`,
            titulo: nombre,
            detalle: ORIGENES[String(d.origen || "")] || "ha dejado su correo",
            pantalla: "leads",
          });
        });
      },
      () => {
        /* Sin permisos o sin red la oreja se cae. No se enseña error: lo que se
           pierde es el aviso, no el dato — la próxima vez que se abra Leads
           estará ahí igual. Un error rojo por una oreja caída asusta sin
           motivo. */
      },
    ),
  );

  /* -------------------------------------------------------------- citas */
  let primeraCitas = true;
  sueltas.push(
    onSnapshot(
      query(collection(base, "citas"), orderBy("creada", "desc"), limit(30)),
      (foto) => {
        if (primeraCitas) {
          primeraCitas = false;
          return;
        }
        foto.docChanges().forEach((c) => {
          if (c.type !== "added") return;
          const d = c.doc.data() as Record<string, unknown>;
          /* Sólo las que entran solas. Una cita que apunta Iris nace
             «confirmada», y avisarla de lo que acaba de escribir ella misma es
             ruido con su propio nombre. */
          if (d.estado !== "pedida") return;
          const linea = String(d.notas || "").split("\n")[0];
          alLlegar({
            id: `cita:${c.doc.id}`,
            titulo: linea.split("·")[0].trim() || "Nueva sesión pedida",
            detalle: "ha reservado una hora por la web",
            pantalla: "agenda",
          });
        });
      },
      () => {},
    ),
  );

  return () => sueltas.forEach((s) => s());
}

/**
 * EL SONIDO.
 *
 * No hay archivo de audio: se sintetiza. Un `.mp3` habría que descargarlo,
 * pesa, puede fallar y hay que decidir de quién es — y todo eso para dos notas.
 * El navegador sabe hacer un tono, así que se hace un tono.
 *
 * DOS NOTAS QUE SUBEN, no un pitido. Un pitido plano de un solo tono se lee
 * como un error; dos notas subiendo se leen como «ha llegado algo», que es
 * justo lo que ha pasado. Es el mismo gesto que usa cualquier mensajería, y por
 * eso se entiende sin haberlo oído nunca antes.
 *
 * MUY CORTO Y MUY BAJO. Esto suena en el despacho de alguien mientras trabaja,
 * puede que con otra persona delante en videollamada. Un sonido de trabajo que
 * se hace notar es un sonido que se acaba silenciando, y entonces ya no avisa
 * de nada.
 *
 * Y ENTRE `try`. Los navegadores no dejan sonar hasta que la persona ha
 * interactuado con la página, y en algunos contextos `AudioContext` ni existe.
 * Que no suene es una pena; que reviente la pantalla por no poder sonar, no.
 */
export function suena() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ahora = ctx.currentTime;

    [
      { hz: 880, en: 0 },      // La
      { hz: 1174.66, en: 0.09 }, // Re, una cuarta más arriba
    ].forEach(({ hz, en }) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      /* Onda senoidal: es la que no tiene armónicos y por tanto la que no suena
         a aparato. Una cuadrada aquí sonaría a alarma de microondas. */
      osc.type = "sine";
      osc.frequency.value = hz;
      /* La curva del volumen importa más que la nota: un tono que empieza y
         acaba de golpe hace «clic» en los altavoces. Sube en 12 ms y se apaga
         suave. */
      vol.gain.setValueAtTime(0, ahora + en);
      vol.gain.linearRampToValueAtTime(0.07, ahora + en + 0.012);
      vol.gain.exponentialRampToValueAtTime(0.0001, ahora + en + 0.22);
      osc.connect(vol).connect(ctx.destination);
      osc.start(ahora + en);
      osc.stop(ahora + en + 0.24);
    });

    /* Se cierra el contexto al acabar: cada uno que se abre y no se cierra se
       queda ocupando un canal de audio del navegador, y hay un límite. */
    setTimeout(() => void ctx.close().catch(() => {}), 700);
  } catch {
    /* sin audio disponible */
  }
}
