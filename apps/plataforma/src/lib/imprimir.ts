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

/**
 * En un iPad no se dice «si no sale el diálogo»: no va a salir. Una frase, y el
 * resto lo cuenta la guía de pasos que abre el propio botón.
 *
 * Esto era antes un párrafo de tres renglones a once píxeles, con el camino
 * bueno metido en medio. En el vídeo del iPad se ven esos renglones y no se lee
 * ninguno.
 */
export const AYUDA_IMPRIMIR_APPLE = "En el iPad el PDF se guarda desde Compartir. Pulsa Exportar y te digo cómo.";

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
     «fallo» = el navegador dijo que no; «guia» = estamos en un aparato de Apple
     y lo que hay que enseñar son los pasos, no un aviso. */
  const [estado, setEstado] = useState<"listo" | "pulsado" | "fallo" | "guia">("listo");

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

  /*
   * EN UN APARATO DE APPLE SE SIGUE LLAMANDO A `imprimir()`, aunque sepamos que
   * lo más probable es que no haga nada.
   *
   * Dos motivos. Uno: no cuesta nada, y en el Mac de sobremesa —que también da
   * `esApple()` cuando tiene pantalla táctil— el diálogo sí sale. Dos: si algún
   * día iPadOS lo implementa, esto empieza a funcionar solo.
   *
   * Lo que cambia es lo que se enseña después. En Apple, los pasos de Compartir;
   * en el resto, el aviso corto de siempre.
   */
  const exporta = useCallback(() => {
    const ok = imprimir();
    setEstado(apple ? "guia" : ok ? "pulsado" : "fallo");
  }, [apple]);

  const cierraGuia = useCallback(() => setEstado("listo"), []);

  return {
    exporta,
    /* Rojo: ha fallado de verdad. */
    sinDialogo: estado === "fallo",
    /* Tono normal: se ha pulsado y dejamos la salida a la vista por si acaso. */
    trasPulsar: estado === "pulsado" ? AVISO_TRAS_PULSAR : null,
    /* Los tres pasos de Compartir, en grande. Sólo en Apple. */
    guiaApple: estado === "guia",
    cierraGuia,
    apple,
    enApp,
    ayuda: apple ? AYUDA_IMPRIMIR_APPLE : AYUDA_IMPRIMIR,
    /*
     * El truco de quitar los encabezados vive DENTRO del diálogo de impresión, y
     * en el iPad no hay diálogo. Enseñárselo allí es una instrucción que no se
     * puede seguir, ocupando dos renglones encima de la que sí.
     */
    ayudaCabeceras: apple ? null : AYUDA_SIN_CABECERAS,
  };
}
