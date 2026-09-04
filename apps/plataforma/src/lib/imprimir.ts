/**
 * Abrir el diálogo de impresión — que es como se guarda el PDF — desde
 * cualquier equipo.
 *
 * En el iPad no salía. Los párrafos del estudio son editables, y Safari se
 * traga la llamada a print() si hay un `contentEditable` con el foco puesto y
 * el teclado en pantalla levantado: Iris tocaba un párrafo para retocarlo y a
 * partir de ahí el botón no hacía nada. Así que primero se suelta el foco, se
 * deja pasar un fotograma para que el teclado se recoja y la página se
 * reajuste, y entonces se imprime.
 *
 * Devuelve false si el navegador no sabe imprimir, para poder decírselo a
 * quien lo ha pulsado en vez de dejarlo mirando un botón muerto.
 */
export function imprimir(): boolean {
  if (typeof window === "undefined" || typeof window.print !== "function") return false;

  const foco = document.activeElement;
  if (foco instanceof HTMLElement) foco.blur();
  // El navegador tiene que rehacer la maqueta sin el teclado antes de medir
  // las hojas; con un solo fotograma no siempre llega.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        // Safari lanza si la ventana se está descargando. No hay nada que
        // hacer salvo no romper la página.
      }
    });
  });
  return true;
}

/**
 * En el iPad y el iPhone el diálogo puede no llegar a abrirse — depende de la
 * versión de Safari y de si la página se abrió desde otra app. Ahí siempre
 * queda la ruta manual, así que conviene tenerla escrita en pantalla.
 */
export const AYUDA_IMPRIMIR = "Si no se abre el diálogo, usa Compartir → Imprimir y elige «Guardar en Archivos» para tener el PDF.";

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
