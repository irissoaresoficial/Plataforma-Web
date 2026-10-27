'use client';

/**
 * ============================================================================
 * LA CUENTA ATRÁS DE LA MASTERCLASS
 * ============================================================================
 *
 * Gerson, el 27 de octubre, enseñando una landing de otro evento: «he visto
 * algunas landing así y mira esta frase impacta mucho, quiero algo así».
 *
 * De esa referencia esto es lo primero que se copia, y no por adorno: una
 * fecha escrita es un dato, y una cuenta atrás es una decisión que se toma
 * ahora. Lo que mata una inscripción a un mes vista no es el «no», es el
 * «luego»; y «luego» desaparece cuando hay un reloj corriendo.
 *
 * LO QUE NO SE COPIA DE LA REFERENCIA, y conviene que esté escrito:
 *
 *   · «GRATUITA». Regla de marca de Gerson, del 22 de octubre: ni «gratis»
 *     ni «gratuita» en ningún sitio. Se dice «masterclass en directo».
 *   · La cursiva. «No quiero tipografía cursiva en NADA» — 19 de octubre.
 *     Lo que allí resalta la cursiva, aquí lo resalta el color.
 *   · El degradado azul-naranja-morado. Esto es la casa de Iris: vino, arena
 *     y oro (MARCA.md §3).
 *
 * NO SE INVENTA URGENCIA. No dice «quedan 3 plazas» ni «la oferta termina»:
 * dice cuánto falta para una clase que empieza a una hora concreta, que es
 * verdad y se puede comprobar. Una cuenta atrás honrada empuja igual y no hay
 * que sostenerla con una mentira (MARCA.md §7).
 *
 * LA HORA VA CON SU HUSO. `MASTERCLASS.iso` lleva +01:00 dentro, así que esto
 * cuenta igual de bien desde Madrid que desde Oporto — y dos de las primeras
 * cuatro personas apuntadas son portuguesas.
 */

import { useEffect, useState } from 'react';
import { MASTERCLASS } from '@/content/site';

const FIN = new Date(MASTERCLASS.iso).getTime();

function reparte(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export default function CuentaAtras() {
  /*
   * `null` hasta que monta, Y ESO NO ES PEREZA.
   *
   * El servidor dibuja la página a una hora y el navegador la recibe a otra:
   * si los dos pintaran el reloj, React vería dos números distintos en el
   * mismo sitio y tiraría toda la página por un segundo de diferencia. Así
   * que el servidor deja el hueco con la fecha —que no cambia— y los números
   * aparecen en cuanto el navegador puede contarlos de verdad.
   */
  const [falta, setFalta] = useState<ReturnType<typeof reparte> | null>(null);

  useEffect(() => {
    const tic = () => setFalta(reparte(FIN - Date.now()));
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);

  /* Pasada la hora, ni cuenta atrás ni nada: una barra a cero es peor que no
     tener barra. */
  if (falta && falta.d + falta.h + falta.m + falta.s <= 0) return null;

  const casilla = (n: number, letra: string) => (
    <span className="casa-cuenta-caja">
      <b>{String(n).padStart(2, '0')}</b>
      <i>{letra}</i>
    </span>
  );

  return (
    <div className="casa-cuenta" role="timer" aria-live="off">
      <span className="casa-cuenta-fecha">
        Jueves 26 de noviembre · 21:00 h (Madrid)
      </span>
      {falta ? (
        <span className="casa-cuenta-reloj">
          {casilla(falta.d, 'd')}
          {casilla(falta.h, 'h')}
          {casilla(falta.m, 'm')}
          {casilla(falta.s, 's')}
        </span>
      ) : (
        /* El hueco del reloj mientras carga, para que la página no dé un
           salto cuando aparezcan los números. */
        <span className="casa-cuenta-reloj" aria-hidden="true">
          <span className="casa-cuenta-caja casa-cuenta-vacia" />
        </span>
      )}
    </div>
  );
}
