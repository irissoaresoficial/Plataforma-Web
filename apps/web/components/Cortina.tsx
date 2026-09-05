'use client';

/**
 * LA CORTINA
 *
 * Al entrar, la pantalla está tapada por dos franjas granate con el sello en
 * medio. Las franjas se separan —una sube, la otra baja— y detrás aparece la
 * portada.
 *
 * POR QUÉ. Es el recurso de las webs editoriales caras: no empiezas viendo una
 * página, empiezas viendo cómo se abre. En una web normal el primer segundo se
 * gasta en que las cosas terminen de colocarse; aquí ese mismo segundo cuenta
 * algo, y lo que cuenta es de quién es la casa.
 *
 * LAS TRES REGLAS QUE LA HACEN SOPORTABLE
 *
 * 1. UNA VEZ. Se guarda en `sessionStorage`, así que se ve al entrar y no se
 *    vuelve a ver al pasar de página ni al volver atrás. Una cortina que sale
 *    cada vez deja de ser un detalle y pasa a ser un peaje.
 * 2. CORTA. Un segundo y medio de principio a fin. Cualquier cosa por encima de
 *    dos segundos y la gente se va: hay medidas de sobra sobre esto y ninguna
 *    dice lo contrario.
 * 3. NO ATRAPA NADA. Cuando termina se quita del árbol, no se esconde. Una capa
 *    invisible a pantalla completa que se queda puesta se come todos los clics
 *    de la página, y es de los fallos más difíciles de encontrar porque no se
 *    ve.
 *
 * Y con `prefers-reduced-motion` no aparece siquiera: para quien el movimiento
 * marea, una pantalla que se abre en dos es exactamente lo que marea.
 *
 * El contenido de la web está debajo desde el primer momento, ya pintado. La
 * cortina no retrasa nada ni esconde nada de un buscador: es una capa por
 * encima, no una pantalla de carga.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Marca from './Marca';

const CLAVE = 'iris:cortina-vista';
const CURVA_CORTINA = [0.76, 0, 0.24, 1] as const;

export default function Cortina() {
  const quieto = useReducedMotion();
  /* Empieza cerrada y se decide en el navegador. Al revés —empezar abierta y
     cerrarla— se vería un parpadeo de la portada antes de taparla, que es peor
     que no tener cortina. */
  const [abierta, setAbierta] = useState(false);
  const [montada, setMontada] = useState(true);

  useEffect(() => {
    if (quieto) {
      setMontada(false);
      return;
    }
    let vista = false;
    try {
      vista = sessionStorage.getItem(CLAVE) === '1';
    } catch {
      // Navegación privada con el almacenamiento capado: se enseña y ya está.
    }
    if (vista) {
      setMontada(false);
      return;
    }
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {}

    // Lo justo para que se lea el sello antes de que se abra.
    const abrir = setTimeout(() => setAbierta(true), 520);
    return () => clearTimeout(abrir);
  }, [quieto]);

  /*
   * EL DESMONTAJE VA POR RELOJ, Y NO ES PEREZA.
   *
   * Estaba colgado de `onAnimationComplete` del contenedor, y ese contenedor no
   * anima nada —las que se mueven son las dos franjas de dentro—, así que el
   * aviso no llegaba nunca. Resultado: la cortina se quedaba puesta para
   * siempre. No se veía, porque no recibe clics y las franjas ya estaban fuera
   * de pantalla, pero el `overflow: hidden` que pone sobre el body seguía ahí y
   * LA PÁGINA NO SE PODÍA BAJAR. Un fallo invisible que rompe la web entera.
   *
   * 520 de espera + 860 de apertura + 40 de desfase de la segunda franja, y un
   * respiro. Es la misma cuenta que hay escrita en la animación, y si una
   * cambia hay que cambiar la otra: por eso están las dos aquí al lado.
   */
  useEffect(() => {
    if (!abierta) return;
    const fin = setTimeout(() => setMontada(false), 1000);
    return () => clearTimeout(fin);
  }, [abierta]);

  /* Mientras está puesta, la página de debajo no se mueve: si alguien tiene la
     rueda en la mano, la portada aparecería ya a medio bajar. */
  useEffect(() => {
    if (!montada) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = antes;
    };
  }, [montada]);

  if (!montada) return null;

  const franja = (arriba: boolean) => ({
    initial: { y: '0%' },
    animate: { y: abierta ? (arriba ? '-100%' : '100%') : '0%' },
    transition: { duration: 0.86, ease: CURVA_CORTINA, delay: arriba ? 0 : 0.04 },
  });

  return (
    /* No se anuncia ni se puede tocar: es decoración de un segundo. El contenido
       de verdad está debajo, ya pintado y ya leído por un buscador. */
    <div className="cortina" aria-hidden>
      <motion.div className="cortina-franja cortina-arriba" {...franja(true)} />
      <motion.div className="cortina-franja cortina-abajo" {...franja(false)} />

      <motion.div
        className="cortina-sello"
        initial={{ opacity: 0, y: 12 }}
        animate={abierta ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={{ duration: abierta ? 0.3 : 0.6, ease: CURVA_CORTINA }}
      >
        <Marca tam={64} apilado claro />
      </motion.div>
    </div>
  );
}
