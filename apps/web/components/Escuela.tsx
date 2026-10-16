import Link from 'next/link';
import './escuela33/escuela33.css';

/**
 * ============================================================================
 * QUÉ ES LA ESCUELA DE SABIDURÍA 33
 * ============================================================================
 *
 * Gerson: «estamos hablando de escuela de sabiduría, debe aparecer como una
 * pregunta inicial». Tenía razón y era un agujero: la web se llama Iris
 * Soares, vende consultas y cursos, y en ninguna pantalla decía qué es la
 * escuela. Quien entra por un anuncio de un curso no tenía dónde enterarse.
 *
 * ---------------------------------------------------------------------------
 * EL FILTRO CON EL QUE ESTÁ ESCRITO
 * ---------------------------------------------------------------------------
 * «¿Esto lo comprarían? ¿Esto lo entendería alguien?». Así que aquí no hay ni
 * una palabra de energía, vibración ni despertar. Cada celda contesta una
 * pregunta que una persona se hace de verdad antes de pagar:
 *
 *     qué se aprende · cómo se da · qué te llevas · para quién es
 *
 * Y la frase que manda es la diferencia con todo lo demás del sector: aquí no
 * te leen la carta, aprendes a leerla tú. Eso es lo que se compra.
 *
 * ---------------------------------------------------------------------------
 * LO QUE NO DICE, Y ES A PROPÓSITO
 * ---------------------------------------------------------------------------
 * Qué significa el 33. No lo sé, y es el nombre de la casa: inventarme un
 * significado bonito sería ponerle a Iris una explicación que ella no ha dado.
 * En cuanto me lo diga, va en el primer párrafo — es de las cosas que una
 * persona pregunta sola.
 */
export default function Escuela() {
  return (
    <section
      id="escuela"
      className="claro"
      style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', scrollMarginTop: 80 }}
    >
      <div className="e33-marco">
        <p className="e33-rotulo">La escuela</p>

        <h2 className="e33-h">Escuela de Sabiduría 33</h2>

        <p className="e33-lead">
          No es un sitio donde alguien te lee la carta. Es donde{' '}
          <b>aprendes a leerla tú</b>.
        </p>

        <div className="e33-rejilla">
          <div className="e33-celda">
            <h3>Qué se aprende</h3>
            <p>
              Numerología transgeneracional y Kábala. Las dos cuentas que
              explican de dónde viene lo que se repite en tu familia, y cómo se
              lee en tu fecha y en tu nombre.
            </p>
          </div>

          <div className="e33-celda">
            <h3>Cómo se da</h3>
            <p>
              Cursos en directo con Iris, y grabados para verlos cuando puedas.
              Se trabaja con tu caso encima de la mesa, no con ejemplos de
              manual.
            </p>
          </div>

          <div className="e33-celda">
            <h3>Qué te llevas</h3>
            <p>
              Sales sabiendo hacer las cuentas tú: tu carta, la de tu pareja y
              la de tus hijos. Sin depender de que alguien te las mire.
            </p>
          </div>

          <div className="e33-celda">
            <h3>Para quién es</h3>
            <p>
              Para quien ya se ha dado cuenta de que lo que le pasa se repite —
              en el trabajo, en la pareja, con el dinero— y quiere entender por
              qué antes que volver a intentarlo.
            </p>
          </div>
        </div>

        {/* La MISMA forma de botón que el resto de la web: `portada-cta
            cta-solida` es el disco granate con la flecha dorada, y una sola
            forma de pedir en toda la casa se reconoce a la segunda vez que se
            ve. Inventar aquí un botón nuevo era volver a tener dos webs. */}
        <div className="e33-acciones">
          <Link href="/cursos" className="portada-cta cta-solida" data-mag data-cur-label="Ver">
            <span>Ver los cursos</span>
            <i aria-hidden>→</i>
          </Link>
          <a href="#consultas" className="portada-cta" data-mag data-cur-label="Ir">
            <span>Una sesión con Iris</span>
            <i aria-hidden>→</i>
          </a>
        </div>
      </div>
    </section>
  );
}
