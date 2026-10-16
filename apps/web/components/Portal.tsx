'use client';

import { useEffect } from 'react';
import './portal/portal.css';
import { MARCADO } from './portal/marcado';
import { arrancaPortal } from './portal/guion';

/**
 * ============================================================================
 * EL PORTAL: LA PORTADA
 * ============================================================================
 *
 * Cinco tramos de scroll sobre una película que no se corta: unos números
 * sueltos de tinta se vuelven hilos de oro, los hilos se vuelven el árbol de
 * luz, y al final aparece ella. La ventana por la que se mira se abre hasta
 * llenar la pantalla y se vuelve a cerrar sobre su retrato.
 *
 * ---------------------------------------------------------------------------
 * ESTO NO SUSTITUYE A LA PÁGINA, LA ABRE
 * ---------------------------------------------------------------------------
 * El portal ocupa las primeras cuatro pantallas y media de `/`. Debajo sigue
 * entera la página de siempre: «hola, soy Iris», las consultas, las dudas y el
 * pie. El embudo de reservas no se ha tocado — lo único que cambia es por
 * dónde se entra.
 *
 * Y por eso el último tramo lleva botón: antes, la primera pantalla de la web
 * tenía un «Reservar mi consulta» a la vista, y una portada preciosa que no
 * lleva a ninguna parte es una portada que cuesta dinero.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ VA COMO TEXTO Y NO COMO JSX
 * ---------------------------------------------------------------------------
 * El marcado se pinta con `dangerouslySetInnerHTML` desde `portal/marcado.ts`.
 * No es pereza: el motor (`portal/guion.ts`) trabaja con `getElementById`
 * sobre estos nodos y está medido así —contraste, fotogramas por segundo y
 * encuadre en móvil—, de modo que traducirlo a JSX a mano sería volver a
 * jugárselo por nada. Se pinta también en el servidor, así que el texto está
 * en el HTML para quien entre sin JavaScript.
 *
 * El contenido es nuestro y es fijo: aquí no entra nada de fuera, que es la
 * única razón por la que `dangerouslySetInnerHTML` es aceptable.
 */
export default function Portal() {
  useEffect(() => {
    const parar = arrancaPortal();

    /* LOS SUSURROS, CALLADOS MIENTRAS SE VE EL PORTAL.
       Son las burbujas del chat contando cosas de la Kábala. En medio de una
       portada de tres frases, una caja gris con cuatro renglones es lo único
       que sobra en la pantalla. Es la misma bandera que usaba la portada
       anterior, así que `Susurros` no se entera del cambio. */
    const raiz = document.documentElement;
    const di = (si: boolean) => {
      const v = si ? 'si' : 'no';
      if (raiz.dataset.portada !== v) {
        raiz.dataset.portada = v;
        window.dispatchEvent(new Event('iris:portada'));
      }
    };
    di(true);

    const pista = document.querySelector('.portal .pista');
    const ojo = pista
      ? new IntersectionObserver(([x]) => di(x.isIntersecting), { threshold: 0 })
      : null;
    if (ojo && pista) ojo.observe(pista);

    return () => {
      ojo?.disconnect();
      delete raiz.dataset.portada;
      window.dispatchEvent(new Event('iris:portada'));
      /* Y el candado del scroll, quitado a mano: lo pone la antesala sobre el
         `body`, y si alguien se va de la portada antes de que termine de
         contar, la web siguiente se queda sin poder rodar. */
      document.body.classList.add('antesala-lista');
      parar?.();
    };
  }, []);

  return <div className="portal" dangerouslySetInnerHTML={{ __html: MARCADO }} />;
}
