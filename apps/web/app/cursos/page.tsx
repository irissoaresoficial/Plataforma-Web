'use client';

/**
 * TALLERES Y CURSOS.
 * ============================================================================
 *
 * Esta página tenía 443 líneas: un catálogo con buscador y filtros, la ficha
 * larga del curso destacado, una cuenta atrás, un formulario de lista de
 * espera y un pie propio. Gerson, señalando una captura: «la landing de
 * cursos quiero que quites desde aquí hasta lo último del footer».
 *
 * Y tiene sentido más allá del gusto: HOY HAY UN CURSO. Un catálogo con
 * buscador, filtros y la cuenta «1 curso» es una estantería vacía con un
 * cartel de estantería. Lo honesto con un solo taller abierto es decir que
 * hay uno, mandar a apuntarse y avisar de que vienen más.
 *
 * NO SE HA BORRADO NADA. `Catalogo`, `CursoDetalle`, `CartelCurso`,
 * `CuentaAtras` y `MarcaCurso` siguen enteros en el repositorio y vuelven el
 * día que haya cinco cursos: es cambiar una línea. Lo que se ha ido es la
 * decisión de pintarlos hoy (MARCA.md §8.4).
 *
 * El vídeo tampoco está ya aquí: se mudó a `/masterclass`, que es la landing
 * de registro —donde pidió que estuviera y donde tiene un trabajo que hacer.
 */

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import Entrada from '@/components/casa/Entrada';
import Discografia from '@/components/casa/Discografia';
import Pie from '@/components/casa/Pie';
import '@/components/casa/casa.css';

export default function Cursos() {
  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />

      {/* LA MISMA ENTRADA QUE LA PORTADA, categorizada a lo de aquí.
          El fondo NO es el cartel del vídeo, aunque lo pareciera lo suyo: ese
          fotograma lleva rotulados encima el titular del curso, el logo y la
          barra de progreso, así que salían dos titulares pisándose. Va la
          imagen del escritorio de noche: limpia, oscura y habla de lo mismo
          —aquí se estudia. */}
      <Entrada
        foto="/images/camino-escuela.jpg"
        alt="Un escritorio de noche bajo una lámpara de latón, con cuadernos abiertos y libros antiguos."
        titulo={
          <>
            Talleres en directo,
            <br />
            <em>con tu caso delante</em>
          </>
        }
        texto="Se trabaja con tu fecha y con tu nombre, en vivo. Queda grabado, así que si un día no puedes, no lo pierdes."
        nota="El que está abierto ahora mismo: Desórdenes Amorosos."
        notaCorta="Abierto: Desórdenes Amorosos."
        cta={{ a: '/masterclass', texto: 'Apuntarme gratis' }}
      />

      <main>
        {/* LA ESTANTERÍA. Aquí había un bloque que decía «un taller
            abierto, y van saliendo más» en un párrafo. Gerson lo quiso en
            fichas: «bloques cuadraditos en figuras de 3D, como una especie de
            discografía, con "busca el curso que más te llame la atención"».
            Y es mejor: un párrafo se lee; una estantería se elige. */}
        <Discografia />

      </main>

      <Pie />
    </div>
  );
}
