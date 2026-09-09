'use client';

import { useEffect, useRef } from 'react';

/**
 * ============================================================================
 * EL BOTÓN DE ATRÁS CIERRA LO QUE ESTÁ ABIERTO ENCIMA
 * ============================================================================
 *
 * En un teléfono, «atrás» es EL gesto. Es con lo que se cierra cualquier cosa
 * que se abra por encima de una página, y la gente lo hace sin pensarlo.
 *
 * Esta web tenía tres capas flotantes —el chat de reservas, la ficha de un
 * curso y el menú ☰— y ninguna metía nada en el historial. O sea que el gesto
 * de cerrar no cerraba: sacaba de la página. Comprobado: con el chat abierto,
 * atrás llevaba de la portada a la política de privacidad.
 *
 * Y el caso del chat era el peor de todos, porque el chat es la única forma de
 * reservar una sesión en toda la web. Alguien que va por el cuarto paso —ya ha
 * dado su nombre, su fecha, el motivo y el día— hace el gesto con el que cierra
 * todo lo demás en su teléfono y pierde los cuatro pasos sin un aviso. Al
 * volver, el chat arranca de cero.
 *
 * ---------------------------------------------------------------------------
 * CÓMO FUNCIONA
 * ---------------------------------------------------------------------------
 * Al abrir la capa se mete una entrada en el historial. Esa entrada no cambia
 * la dirección ni recarga nada: sólo está ahí para que el botón de atrás tenga
 * algo que consumir. Cuando lo consume, se cierra la capa y la página se queda
 * donde estaba.
 *
 * Y AL REVÉS TAMBIÉN, que es la parte que se suele olvidar: si la capa se
 * cierra por otro camino —la ×, Escape, tocar fuera— hay que retirar esa
 * entrada a mano. Si no, el historial se llena de entradas fantasma y para
 * salir de la página hay que pulsar atrás dos, tres, cuatro veces.
 *
 * La comprobación `history.state?.capaAbierta` distingue los dos casos: si la
 * capa se cerró POR el botón de atrás, esa entrada ya no está y no hay nada que
 * retirar; si se cerró por la ×, sigue ahí y se retira.
 */
export default function useCapa(abierta: boolean, cerrar: () => void) {
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
    return () => {
      /* Primero se quita la escucha y después se retira la entrada: al revés,
         el `back()` dispararía el `popstate` que acabamos de dejar puesto y
         cerraría la capa dos veces. */
      window.removeEventListener('popstate', atras);
      if (window.history.state?.capaAbierta) window.history.back();
    };
  }, [abierta]);
}
