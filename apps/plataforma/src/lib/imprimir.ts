import { useCallback, useState, useSyncExternalStore } from "react";

/** No hay nada a lo que suscribirse: el aparato no cambia a media sesión. */
const sinCambios = () => () => {};

/**
 * Abrir el diálogo de impresión — que es como se guarda el PDF — desde
 * cualquier equipo.
 *
 * ===========================================================================
 * POR QUÉ NO FUNCIONABA EN LA TABLET, Y POR QUÉ ERA CULPA DEL ARREGLO ANTERIOR
 * ===========================================================================
 * Aquí había esto:
 *
 *     requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
 *
 * Se puso para resolver un problema real —Safari se tragaba la impresión si
 * había un párrafo editable con el foco y el teclado en pantalla levantado— y
 * la idea era soltar el foco, dejar que el teclado se recogiera y entonces
 * imprimir. Suena razonable. Y rompe justo lo que venía a arreglar.
 *
 * Safari sólo deja abrir el diálogo de impresión DENTRO DEL GESTO que lo pidió:
 * mientras se está ejecutando el manejador del clic, y nada más. Es la misma
 * regla que impide que una web abra una ventana o entre en pantalla completa
 * sola. Un `requestAnimationFrame` ya ocurre en otro turno del navegador —el
 * clic terminó— así que cuando llegaba a `print()` el permiso ya no existía.
 *
 * Y lo peor: SIN ERROR. Safari no lanza ni avisa, simplemente no hace nada. Un
 * botón que no hace nada y no dice nada es el fallo más caro de encontrar,
 * porque quien lo pulsa da por hecho que se ha roto todo lo demás.
 *
 * Ahora `print()` se llama en el mismo turno que el clic. El `blur()` sigue
 * estando —es síncrono, no cuesta un turno y sigue quitando el teclado de en
 * medio— pero ya no se espera a nada después de él.
 *
 * NO SE HA PODIDO PROBAR EN UN SAFARI DE VERDAD. Aquí no hay iPad ni Safari:
 * esto está corregido por lo que dice la regla del navegador, que es clara y
 * está documentada, no porque se haya visto funcionar. Si en la tablet sigue
 * sin salir el diálogo, el siguiente sospechoso está escrito abajo, en
 * `AYUDA_IMPRIMIR`.
 */
export function imprimir(): boolean {
  if (typeof window === "undefined" || typeof window.print !== "function") return false;

  /* Soltar el foco es lo único que hace falta hacer antes, y es síncrono: no
     gasta el gesto. Sin esto, con un párrafo del estudio abierto para
     reescribirlo, Safari puede imprimir con el teclado en pantalla metido en
     la maqueta. */
  const foco = document.activeElement;
  if (foco instanceof HTMLElement) foco.blur();

  try {
    /* Aquí, y no dentro de ningún temporizador ni de ningún `requestAnimationFrame`.
       Ver la explicación de arriba: fuera de este turno, Safari lo ignora. */
    window.print();
    return true;
  } catch {
    /* Safari lanza si la ventana se está descargando. Se devuelve `false` para
       que la pantalla pueda decir algo en vez de dejar a alguien mirando un
       botón que no ha hecho nada. */
    return false;
  }
}

/**
 * ¿Estamos en un iPhone o en un iPad?
 *
 * El iPad moderno miente en `userAgent` y dice que es un Mac. La forma de
 * pillarlo es que es el único «Mac» del mundo con pantalla táctil: `Macintosh`
 * más `maxTouchPoints > 1`.
 *
 * Se usa sólo para elegir qué ayuda enseñar, así que fallar aquí no rompe
 * nada: como mucho se enseña el consejo de otro sistema.
 */
export function esApple(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
}

/**
 * ¿La plataforma está abierta como si fuera una aplicación, desde el icono de
 * la pantalla de inicio, y no dentro del navegador?
 *
 * ESTO IMPORTA MÁS DE LO QUE PARECE. Guardar la plataforma en la pantalla de
 * inicio es lo primero que hace cualquiera que la use a diario en una tablet, y
 * ahí Safari se queda SIN barra de navegador — y sin barra no hay menú, y sin
 * menú no hay diálogo de impresión. `window.print()` sigue existiendo y sigue
 * sin dar error: simplemente no ocurre nada. Es el mismo síntoma que el fallo
 * del gesto que arreglamos arriba, y por eso conviene distinguirlos: uno se
 * arregla con código, éste no se arregla nunca y sólo se puede avisar.
 *
 * `display-mode: standalone` es la forma estándar; `navigator.standalone` es la
 * de Apple, que llegó antes y sigue siendo la que responde en iOS.
 */
export function enAplicacion(): boolean {
  if (typeof window === "undefined") return false;
  const apple = (navigator as Navigator & { standalone?: boolean }).standalone;
  if (apple === true) return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * En el iPad y el iPhone el diálogo puede no llegar a abrirse, y hay un caso en
 * el que NO SE ABRE NUNCA por mucho que el código esté bien: cuando la
 * plataforma se ha guardado en la pantalla de inicio y se abre como si fuera una
 * aplicación. Ahí `window.print()` no existe de verdad — no hay barra de
 * navegador y por tanto no hay diálogo de impresión — y la única salida es el
 * botón de Compartir del sistema.
 *
 * Por eso esta ayuda no es una nota al pie: en un aparato de Apple es el camino
 * bueno, no el de repuesto.
 */
export const AYUDA_IMPRIMIR = "Si no se abre el diálogo, usa Compartir → Imprimir y elige «Guardar en Archivos» para tener el PDF.";

/** La misma ruta, dicha como lo que es cuando quien lee está en un iPad. */
export const AYUDA_IMPRIMIR_APPLE =
  "En el iPad: pulsa Exportar y, si no sale el diálogo, usa Compartir → Imprimir → «Guardar en Archivos». Si abriste la plataforma desde el icono de la pantalla de inicio, ése es el único camino: ahí Safari no tiene diálogo de impresión.";

/**
 * Cuando SABEMOS que no va a salir el diálogo, no se dice «si no sale»: se dice
 * el camino bueno y ya está. Hacer que alguien pruebe algo que no puede
 * funcionar, para luego darle el plan B, es hacerle perder el tiempo dos veces.
 */
export const AYUDA_IMPRIMIR_APP =
  "Has abierto la plataforma desde el icono de la pantalla de inicio, y ahí no existe el diálogo de impresión. Pulsa Exportar y usa el botón de Compartir del sistema → Imprimir → «Guardar en Archivos». Si prefieres el diálogo de siempre, abre la plataforma desde Safari.";

/**
 * La dirección web y la hora que salen arriba y abajo del PDF no las pone el
 * documento: las añade el navegador, y sólo se quitan desde su propio diálogo.
 * No hay forma de apagarlas desde la página — se probó dejar la hoja sin
 * márgenes, que es lo que las suprime, y entonces el texto sale pegado al
 * borde en veinticinco de cada veintiséis páginas—. Se desmarca una vez y el
 * navegador lo recuerda para siempre.
 */
export const AYUDA_SIN_CABECERAS =
  "Para que no salgan la dirección web ni la hora: en el diálogo, abre «Más ajustes» y desmarca «Encabezados y pies de página». Sólo hay que hacerlo una vez.";

/** El navegador ha dicho que no. Esto es un fallo de verdad y se ve en rojo. */
export const AVISO_SIN_DIALOGO =
  "Este navegador no ha abierto el diálogo de impresión. Usa Compartir → Imprimir y elige «Guardar en Archivos».";

/**
 * Después de pulsar, sin que haya fallado nada.
 *
 * Va porque hay un caso que NO se puede detectar: Safari acepta `print()`, no
 * da error, y aun así no enseña nada. Desde la página no hay forma de saberlo
 * —`beforeprint` no es de fiar en WebKit y montar un temporizador para adivinar
 * acabaría gritando «ha fallado» con el diálogo abierto delante—. Así que en
 * vez de adivinar, después de pulsar se deja la salida a la vista, en tono
 * normal. Si el diálogo salió, es una línea que se ignora; si no salió, es
 * exactamente lo que hacía falta leer.
 */
export const AVISO_TRAS_PULSAR =
  "Si no ha aparecido nada, usa Compartir → Imprimir y elige «Guardar en Archivos».";

/**
 * Todo lo que necesita un botón de exportar, en una sola pieza.
 *
 * Hay TRES botones de exportar en la plataforma —el estudio, la comparativa de
 * pareja y la factura— y hasta ahora cada uno hacía una cosa distinta: el del
 * estudio avisaba si fallaba y los otros dos se quedaban callados. Un botón
 * mudo en la tablet es justo el fallo que hemos estado persiguiendo, así que
 * los tres pasan por aquí y se comportan igual.
 *
 * `exporta` NO es asíncrona y no puede llegar a serlo nunca: en cuanto se
 * espera a algo, el gesto del clic se ha gastado y Safari ignora la impresión.
 */
export function useExportar() {
  /* «listo» = aún no se ha pulsado; «pulsado» = el navegador aceptó imprimir;
     «fallo» = el navegador dijo que no. Son tres cosas distintas y cada una se
     cuenta de una manera. */
  const [estado, setEstado] = useState<"listo" | "pulsado" | "fallo">("listo");

  /* `esApple()` y `enAplicacion()` miran el navegador, y en el servidor no hay
     navegador. Además el HTML se guarda en caché: si el consejo se decidiera al
     compilar, todo el mundo vería el del primero que abrió la página.
     `useSyncExternalStore` es exactamente la herramienta para esto — dice «en
     el servidor, esto; en el aparato, lo que diga el aparato» — y evita el
     parpadeo y el aviso de React que da hacerlo con un efecto. Ni el sistema ni
     la forma de abrir la plataforma cambian a media sesión, así que no hay a
     qué suscribirse: la suscripción no hace nada. */
  const apple = useSyncExternalStore(sinCambios, esApple, () => false);
  const enApp = useSyncExternalStore(sinCambios, enAplicacion, () => false);

  const exporta = useCallback(() => setEstado(imprimir() ? "pulsado" : "fallo"), []);

  return {
    exporta,
    /* Rojo: ha fallado de verdad. */
    sinDialogo: estado === "fallo",
    /* Tono normal: se ha pulsado y dejamos la salida a la vista por si acaso. */
    trasPulsar: estado === "pulsado" ? AVISO_TRAS_PULSAR : null,
    apple,
    enApp,
    /* Tres situaciones, tres frases. Abierta como aplicación en Apple, sabemos
       que no habrá diálogo y se dice directamente. En un Apple dentro de Safari,
       la ruta de Compartir es el plan B pero muy probable. En cualquier otro
       sitio, es una nota al pie. */
    ayuda: enApp && apple ? AYUDA_IMPRIMIR_APP : apple ? AYUDA_IMPRIMIR_APPLE : AYUDA_IMPRIMIR,
  };
}
