/**
 * ============================================================================
 * QUÉ ES LA KÁBALA — LA PÁGINA
 * ============================================================================
 *
 * REHECHA ENTERA DE LA ENTRADA PARA ABAJO, igual que numerología y por lo
 * mismo. Gerson, el 18 de octubre: «esos espacios de numerología y kábala
 * deben quitarse, erradícalo; debes de poner, insisto, el mismo diseño que
 * tenemos en la home adaptado a la comunicación del apartado».
 *
 * LO QUE HABÍA. Un bloque granate con un campo de números animado de fondo, un
 * titular que se escribía letra a letra, el árbol a la izquierda y cuatro
 * fichas a su derecha, un bloque blanco con el precio en una línea, y DOS pies
 * —uno propio y el de la casa— uno detrás del otro. Cuatro maquetas distintas
 * y ninguna la de la portada.
 *
 * LO QUE HAY AHORA, en el orden de la portada:
 *
 *   1. LA ENTRADA ....... el árbol dibujándose a pantalla completa.
 *   2. EL CREMA ......... qué quiere decir «kábala», que es lo primero que
 *                         hay que quitar de en medio.
 *   3. EL ÁRBOL ......... la franja granate, con el dibujo entero debajo del
 *                         titular y a todo lo ancho.
 *   4. LAS FICHAS ....... las cuatro piezas —10, 22, 3 y el Tikun— pasando
 *                         por la derecha con la columna quieta al lado.
 *   5. EL PRECIO ........ la franja de arena con la ficha de papel: tres
 *                         sesiones, lo que cuesta y por qué son tres.
 *   6. EL PIE ........... uno solo, el de toda la web.
 *
 * SON LOS MISMOS COMPONENTES DE LA PORTADA, no una copia de su aspecto. Lo que
 * se arregle en el bloque crema o en las fichas se arregla aquí también.
 *
 * LO QUE SE HA QUEDADO: el árbol dibujándose. El pie de este bloque promete
 * que en consulta esto no se explica, SE DIBUJA DELANTE DE TI — y el dibujo es
 * lo único de la página que cumple esa frase en vez de contarla.
 *
 * El título y la ficha de datos estructurados están en `layout.tsx`.
 */

import ArbolVida from '@/components/ArbolVida';
import Cursor from '@/components/Cursor';
import Banda from '@/components/casa/Banda';
import Claves, { type FichaClave } from '@/components/casa/Claves';
import Entrada from '@/components/casa/Entrada';
import Pie from '@/components/casa/Pie';
import Sobre from '@/components/casa/Sobre';
import '@/components/casa/casa.css';
import { CONTACTO, KABALA, eur } from '@/content/site';

/*
 * LAS CUATRO PIEZAS. `corto` es el botón del índice de la izquierda, así que
 * es el número: «10», «22», «3», «Tikun». Leído de arriba abajo mientras se
 * baja, el índice ya cuenta la estructura entera.
 */
const PIEZAS: FichaClave[] = [
  {
    id: 'arbol',
    corto: '10',
    titulo: 'Las diez paradas',
    texto:
      'Diez sitios por los que pasa todo lo que te ocurre, desde que se te ocurre algo hasta que lo haces. Es el plano de la casa: cuando algo se te atasca siempre, se atasca en uno de los diez.',
    /* NINGUNA DE LAS CUATRO LLEVA IMAGEN, y aquí es donde más se nota por qué.
       Esta ficha pedía una foto del árbol, y llegó a tenerla: la misma de la
       puerta de kábala de la portada. Pero el árbol ya sale dos veces en esta
       pantalla —dibujándose en la franja de arriba y en la foto de fondo de
       estas mismas fichas—, así que la tercera no añadía nada: era el mismo
       dibujo pegado encima del mismo dibujo. */
  },
  {
    id: 'senderos',
    corto: '22',
    titulo: 'Los veintidós caminos',
    texto:
      'Lo que une esas diez paradas. En tu carta se encienden los que te tocan a ti, y cada uno cuenta algo tuyo: por dónde te mueves con soltura y por dónde das siempre el mismo rodeo.',
  },
  {
    id: 'tres',
    corto: '3',
    titulo: 'Tus tres caminos',
    texto:
      'De dónde vienes, qué has venido a cambiar y hacia dónde vas. Salen de tu fecha, y son los tres que se leen en la consulta.',
  },
  {
    id: 'tikun',
    corto: 'Tikun',
    titulo: 'Reparar',
    texto:
      'Es la palabra que sostiene todo esto. Lo que te llega de tu familia no hay que aguantarlo: se repara, y se le devuelve a quien era. Eso es lo que se trabaja, y es la diferencia entre entender algo y soltarlo.',
  },
];

export default function Kabala() {
  const escribir = `mailto:${CONTACTO.email}?subject=Consulta%20de%20K%C3%A1bala`;

  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />

      {/* ── 1. LA ENTRADA ──────────────────────────────────── */}
      <Entrada
        video={['arbol-scroll.mp4', 'arbol-scroll.webm']}
        cartel="/images/arbol-scroll-cartel.jpg"
        titulo={
          <>
            Un mapa de ti
            <br />
            de tres mil años
          </>
        }
        texto="Diez puntos y veintidós caminos. La Kábala coloca en ese árbol lo que la numerología saca de tu fecha."
        nota="No hace falta saber nada antes de empezar."
        notaCorta="Sin saber nada antes."
        cta={{ a: '#arbol', texto: 'Ver el árbol' }}
      />

      <main>
        {/* ── 2. LA AFIRMACIÓN ─────────────────────────────── */}
        <Sobre
          id="esto"
          entrada="«Kábala» quiere decir recibir. No es una religión y no hay nada que creer: es un plano de cómo funcionas por dentro."
          texto="Por dónde te entra la vida, dónde se te queda atascada y por dónde sale. Son diez sitios y veintidós caminos entre ellos, y llevan tres mil años dibujados igual. Lo que cambia de una persona a otra es cuáles se encienden — y eso sale de tu nombre y de tu fecha."
          botones={[
            { a: '#consulta', texto: 'Ver la consulta', icono: 'abajo' },
            { a: '/cursos', texto: 'Ver los talleres', icono: 'mas' },
          ]}
        />

        {/* ── 3. EL ÁRBOL, DIBUJÁNDOSE ─────────────────────
            A la derecha y no a todo lo ancho: el dibujo está hecho sobre un
            lienzo de 400×660, o sea más alto que ancho, y estirado a los 1180
            de la franja medía dos metros de alto y se salía de la pantalla
            por abajo. En su columna sale a su tamaño, con el texto que lo
            explica al lado — que es además donde estaba antes y funcionaba.
            Se tiende solo cuando entra en pantalla, una sola vez, y respeta
            la quietud si el sistema la pide: está explicado entero en
            components/ArbolVida.tsx. */}
        <Banda
          id="arbol"
          tono="vino"
          rotulo="El Árbol de la Vida"
          titulo="Diez puntos, veintidós caminos"
          texto={
            <p>
              Esto es lo que se dibuja en la consulta, con tu nombre y tu fecha
              puestos encima. Míralo tenderse: primero los caminos y después
              las paradas, de arriba abajo, que es el recorrido de una idea
              hasta que se convierte en algo que haces.
            </p>
          }
          nota="Pasa el dedo o el ratón por cualquiera de los diez y abajo pone cómo se llama."
        >
          <div className="casa-pieza casa-pieza-primera casa-pieza-arbol">
            <ArbolVida />
          </div>
        </Banda>

        {/* ── 4. LAS CUATRO PIEZAS ─────────────────────────
            EL FONDO QUIETO ES LA FOTO DEL TRABAJO, no un adorno, y es el mismo
            criterio que en la portada y en numerología: allí es la cuenta
            escrita a mano sobre la madera, aquí son las manos de Iris
            dibujando el árbol con tiza. Antes era el árbol de luz de la puerta
            de kábala, que es un dibujo — o sea el mismo dibujo que ya se tiende
            en la franja de arriba, puesto otra vez de fondo.
            Una foto de alguien haciéndolo demuestra algo que un dibujo repetido
            no demuestra. */}
        <Claves
          id="piezas"
          titulo={
            <>
              No es un símbolo.
              <br />
              Es un plano que se lee.
            </>
          }
          fichas={PIEZAS}
          pide={{
            texto: 'Lo que se enciende en tu árbol sale de tu nombre y de tu fecha. En los talleres se aprende a leerlo.',
            boton: { a: '/cursos', texto: 'Ver los talleres' },
          }}
          fondo="/images/arbol-pizarra.jpg"
        />

        {/* ── 5. LA CONSULTA: SON TRES ─────────────────────
            Lo que Iris pidió que se dijera, y lo que explica que esto cueste
            el triple que la otra consulta. Va después del árbol y no antes:
            primero se entiende qué es, y entonces el precio tiene con qué
            compararse. */}
        <Banda
          id="consulta"
          tono="arena"
          rotulo="La consulta de Kábala"
          titulo="No es una sesión. Son tres."
          texto={
            <>
              <p>
                Un mapa así no se lee de una sentada. Se dibuja con tu nombre y
                tu fecha, se recorre entero y se trabaja por partes: de dónde
                vienes, qué cargas que no elegiste y qué se puede soltar.
              </p>
              <p>
                Sales con él en la mano. No con apuntes de algo que te
                contaron.
              </p>
            </>
          }
          nota="Y si lo que quieres es entender primero de dónde sale la cuenta, empieza por numerología: está en el menú de arriba."
        >
          <div className="casa-precio">
            <p className="casa-precio-cifra">{eur(KABALA.precio)}</p>
            <p className="casa-precio-que">
              Las tres sesiones, online, con tu árbol preparado antes de la
              primera.
            </p>
            <a className="casa-precio-boton casa-brillo" href={escribir}>
              Reservar la consulta de Kábala
            </a>
            <p className="casa-precio-letra">
              Se reserva por correo y te contesto yo. Si prefieres preguntar
              antes, escríbeme y ya está.
            </p>
          </div>
        </Banda>
      </main>

      <Pie />
    </div>
  );
}
