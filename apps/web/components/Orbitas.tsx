'use client';

/**
 * LAS ÓRBITAS
 *
 * ===========================================================================
 * QUÉ PROBLEMA RESUELVE
 * ===========================================================================
 * El bloque del dolor se queda pegado en pantalla mientras se baja, y sólo
 * tiene una frase dentro. Eso deja, debajo de la frase, media pantalla de
 * papel liso: en la captura de Gerson se ve «Cargas con algo que ni siquiera
 * te pasó a ti.» arriba a la izquierda y setecientos píxeles de nada.
 *
 * Y el vacío ahí no es respiración, es un hueco: el bloque está QUIETO —a eso
 * juega— así que si además no hay nada que mirar, parece que la página se ha
 * colgado. Lo que hace falta no es más texto: es algo que confirme que aquello
 * sigue vivo.
 *
 * ===========================================================================
 * POR QUÉ ANILLOS Y NO PARTÍCULAS
 * ===========================================================================
 * La web ya tiene un campo de cifras flotando (`CampoNumeros`) y un canvas de
 * puntos dorados en el bloque de «qué es». Repetir eso aquí sería la tercera
 * vez que se ve lo mismo.
 *
 * Un anillo dice otra cosa, y dice justo lo que cuenta esta página: un ciclo.
 * Algo que da la vuelta y vuelve al mismo sitio — que es literalmente la frase
 * que está encima («cada vez que crees que lo has dejado atrás, vuelve»). Que
 * sean varios y de tamaños distintos es la parte transgeneracional: círculos
 * dentro de círculos, uno por generación, sin escribirlo en ningún sitio.
 *
 * ===========================================================================
 * CÓMO ESTÁ HECHO
 * ===========================================================================
 * SVG y CSS. Ni canvas ni JavaScript: son seis formas moviéndose muy despacio,
 * y para eso montar un bucle de animación que corra sesenta veces por segundo
 * es gastar batería en un teléfono para dibujar lo que el navegador ya sabe
 * dibujar solo.
 *
 * Las vueltas son largas a propósito —entre 40 y 90 segundos— porque el efecto
 * que se busca es «esto respira», no «esto se mueve». Por encima de unos pocos
 * píxeles por segundo deja de ser ambiente y pasa a ser un adorno que pide
 * atención, y la atención aquí es de la frase.
 *
 * Con `prefers-reduced-motion` se quedan quietos. Siguen estando —el dibujo es
 * el mismo— pero no giran.
 */

export default function Orbitas({ className = '' }: { className?: string }) {
  return (
    <div className={`orbitas ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" focusable="false">
        {/* Los tres anillos grandes: el ciclo, visto de lejos. Cada uno gira a
            su ritmo y sobre su propio centro, así que nunca se alinean dos
            veces igual y no se lee como un reloj. */}
        <g className="orb-lento">
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="150" className="orb-marca" />
        </g>
        <g className="orb-medio">
          <circle cx="200" cy="200" r="104" />
        </g>
        <g className="orb-rapido">
          <circle cx="200" cy="200" r="62" />
          <circle cx="200" cy="200" r="62" className="orb-marca" />
        </g>

        {/* El punto del centro no gira: es el sitio al que se vuelve. */}
        <circle cx="200" cy="200" r="2.4" className="orb-centro" />

        {/* Y dos motas sueltas, muy tenues, que suben. Rompen la simetría
            perfecta, que es lo que separa un dibujo vivo de un logotipo. */}
        <circle cx="96" cy="330" r="1.8" className="orb-mota orb-mota-a" />
        <circle cx="318" cy="288" r="1.4" className="orb-mota orb-mota-b" />
      </svg>
    </div>
  );
}
