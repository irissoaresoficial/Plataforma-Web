/**
 * VOLVER ARRIBA, SE DESPLACE QUIEN SE DESPLACE.
 *
 * Con el cristal la página ya no baja: lo que se desplaza es la ventana de la
 * derecha (`data-ventana`, ver Shell.tsx) y la barra y el riel se quedan
 * quietos. `window.scrollTo` ahí no mueve nada. Esto sube la ventana si la hay
 * y, si no, la página, como antes.
 */
export function subeArriba(quieto: boolean | null) {
  const behavior: ScrollBehavior = quieto ? "auto" : "smooth";
  const ventana = document.querySelector<HTMLElement>("[data-ventana]");
  if (ventana) ventana.scrollTo({ top: 0, behavior });
  else window.scrollTo({ top: 0, behavior });
}
