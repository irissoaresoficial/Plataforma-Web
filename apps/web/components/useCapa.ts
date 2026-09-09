'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * EL BOTÓN DE ATRÁS CIERRA LO QUE ESTÁ ABIERTO ENCIMA
 * ============================================================================
 *
 * En un teléfono, «atrás» es EL gesto. Es con lo que se cierra cualquier cosa
 * que se abra por encima de una página, y la gente lo hace sin pensarlo.
 *
 * Esta web tiene tres capas flotantes —el chat de reservas, la ficha de un
 * curso y el menú ☰— y ninguna metía nada en el historial. O sea que el gesto
 * de cerrar no cerraba: sacaba de la página. Comprobado: con el chat abierto,
 * atrás llevaba de la portada a la política de privacidad.
 *
 * Y el caso del chat era el peor de los tres, porque el chat es la única forma
 * de reservar una sesión en toda la web. Alguien que va por el cuarto paso —ya
 * ha dado nombre, fecha, motivo y día— hace el gesto con el que cierra todo lo
 * demás en su teléfono y pierde los cuatro pasos sin un aviso.
 *
 * ---------------------------------------------------------------------------
 * CÓMO SE USA — HAY QUE USAR EL CIERRE QUE DEVUELVE
 * ---------------------------------------------------------------------------
 *
 *     const cerrarCapa = useCapa(abierto, () => setAbierto(false));
 *     …
 *     <button onClick={cerrarCapa}>×</button>
 *
 * Abrir mete una entrada en el historial. Esa entrada no cambia la dirección ni
 * recarga nada: sólo está ahí para que el botón de atrás tenga algo que
 * consumir. Y CERRAR ES SIEMPRE RETROCEDER — la × no apaga la capa a mano, sino
 * que da un paso atrás, y es el `popstate` el que la apaga. Así sólo hay un
 * camino de salida y el historial nunca se desequilibra.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ NO SE RETIRA LA ENTRADA AL LIMPIAR EL EFECTO
 * ---------------------------------------------------------------------------
 * La versión anterior sí lo hacía: si la capa se cerraba y la entrada seguía
 * puesta, llamaba a `history.back()` desde la limpieza del efecto. Y eso
 * ROMPIÓ LOS CUATRO ENLACES DEL MENÚ — se pulsaba «La comunidad» y la página se
 * quedaba donde estaba.
 *
 * La traza lo dejó claro. Al pulsar un enlace del menú, en este orden:
 *
 *     history.back()          ← la limpieza, disparada por cerrarse el menú
 *     replaceState → "/"      ← el router, que llega DESPUÉS
 *     popstate → "/"
 *
 * El retroceso salía antes que la navegación, y el router acababa escribiendo
 * encima de la entrada equivocada. Un `setTimeout` no lo arreglaba: la
 * navegación del router no está garantizada dentro del mismo tic.
 *
 * Con el cierre por retroceso, la limpieza no tiene nada que retirar y la
 * carrera desaparece. Cuando la capa se cierra porque se ha navegado, la
 * entrada se la lleva el propio router — por eso los enlaces del menú van con
 * `replace`: escriben encima de ella en vez de apilarse.
 */
export default function useCapa(abierta: boolean, cerrar: () => void): () => void {
  /* El cierre entra por referencia. Si el efecto dependiera de la función, cada
     repintado del componente que la crea volvería a meter una entrada en el
     historial — y una capa que lleva un rato abierta repinta muchas veces. */
  const alCerrar = useRef(cerrar);
  useEffect(() => {
    alCerrar.current = cerrar;
  });

  useEffect(() => {
    if (!abierta) return;
    window.history.pushState({ capaAbierta: true }, '');
    const atras = () => alCerrar.current();
    window.addEventListener('popstate', atras);
    return () => window.removeEventListener('popstate', atras);
  }, [abierta]);

  /**
   * El cierre que hay que enganchar a la ×, a Escape y al velo.
   *
   * Retrocede, y del cierre de verdad se encarga el `popstate`. El `else` es el
   * seguro: si por lo que sea la entrada no está —alguien llamó a esto sin la
   * capa abierta— se cierra a mano y no se toca el historial de nadie.
   */
  return useCallback(() => {
    if (window.history.state?.capaAbierta) window.history.back();
    else alCerrar.current();
  }, []);
}
