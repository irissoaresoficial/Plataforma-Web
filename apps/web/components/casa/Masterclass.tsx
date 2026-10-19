'use client';

/**
 * LA LANDING DE REGISTRO DE LA MASTERCLASS.
 * ============================================================================
 *
 * Gerson, en dos mensajes: «el vídeo debe ser dentro de la LANDING DE
 * REGISTRO DEL CURSO (es una masterclass), la idea es sacar datos» y luego
 * «SI ES GRATUITA, es una landing de registro de datos con el vídeo arriba».
 *
 * O sea que esta página tiene UN trabajo: que alguien que llega de un
 * anuncio de Meta deje su correo. Todo lo que no empuje a eso sobra, y por
 * eso no hay catálogo, ni secciones, ni nada que lleve fuera.
 *
 * EL ORDEN, QUE ES LO QUE DECIDE SI FUNCIONA:
 *   1. EL VÍDEO Y EL FORMULARIO, JUNTOS Y ARRIBA. El vídeo a la izquierda
 *      convence; el formulario a su derecha recoge. Nadie tiene que bajar
 *      para apuntarse, y quien ya venía convencido del anuncio tampoco tiene
 *      que ver el vídeo. En el móvil se apilan: titular, vídeo, formulario.
 *   2. Para quién es. Tres frases, y las tres verdad.
 *   3. El cierre: que es gratis, y un botón que sube al formulario de arriba.
 *   4. El pie, mínimo.
 *
 * QUIÉN LA DA SE DICE ARRIBA, NO ABAJO. Primero fue un bloque al final con la
 * foto de Iris, y se quitó el 19 de octubre porque la clase la da Marco y
 * aquello la firmaba con la persona equivocada. Ese mismo día Iris pidió lo
 * correcto: los DOS, con foto y con su título, y antes del vídeo. Así que no
 * ha vuelto el bloque de abajo — lo que hay es una fila de presentación
 * encima del vídeo, que es donde sirve: quién da la clase es la mitad de la
 * confianza en una landing fría y se decide antes de darle al play.
 *
 * QUE SEA GRATIS SE DICE, Y SE DICE PRONTO. Es el dato que más sube el
 * registro en una landing fría, y Gerson lo ha confirmado. Va en el rótulo,
 * en el botón y en la descripción que se ve al compartir el enlace.
 *
 * LO QUE SIGUE SIN DECIR, Y NO ES UN OLVIDO: la fecha. No está decidida —en
 * `content/site.ts` sale como PENDIENTE— y poner una verosímil en una página
 * que recoge correos es citar a alguien un día que nadie ha fijado. Por eso
 * lo que se promete es lo único que hoy se puede cumplir: que se le avisa.
 */

import Image from 'next/image';
import Barra from './Barra';
import Pie from './Pie';
import Registro from './Registro';
import Sello from './Sello';
import { PRESENTAN } from '@/content/site';
import './casa.css';

/*
 * LAS TRES FRASES, CORREGIDAS POR IRIS (nota de voz del 19 de octubre).
 * Las tres correcciones van en la misma dirección y conviene verlo junto,
 * porque es la lección: yo escribía para que sonara bien y ella escribe para
 * que se entienda a la primera.
 *
 *   · «la misma conversación a los seis meses» → «…con diferentes
 *     personajes». Sin eso, «otra persona» y «la misma conversación» se
 *     contradicen a ojos de quien lee: ella lo dijo tal cual, «ahí no se va a
 *     entender».
 *
 *   · «Lo que no se cerró sigue bajando» → «se sigue repitiendo en las
 *     siguientes generaciones». «Bajar» es jerga de la casa: dentro se
 *     entiende y fuera no. Y es la frase que sostiene la página entera.
 *
 *   · «Se hace una cuenta» → «Analizamos tu fecha y tu nombre», y se añade
 *     «a quién pertenece». Dos cambios en una línea: la cuenta la hace
 *     alguien —se dice quién— y lo que se repite no sólo viene de algún
 *     sitio, es DE alguien. Eso último es el centro del método.
 */
const PARA_QUIEN = [
  {
    t: 'Si siempre acabas igual',
    d: 'Otra persona, otra ciudad, otro trabajo — y la misma conversación a los seis meses, con diferentes personajes.',
  },
  {
    t: 'Si en tu casa pasó algo de lo que no se habla',
    d: 'Una separación, una ausencia, alguien que se fue. Lo que no se cerró se sigue repitiendo en las siguientes generaciones.',
  },
  {
    t: 'Si quieres entenderlo, no que te lo adivinen',
    d: 'Analizamos tu fecha y tu nombre, y se ve de dónde viene y a quién pertenece lo que repites.',
  },
];

export default function Masterclass() {
  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      {/* ── 1. EL VÍDEO Y EL FORMULARIO ────────────────────── */}
      <section className="casa-mc-alto">
        <Image className="casa-mc-fondo" src="/images/camino-escuela.jpg" alt="" fill priority sizes="100vw" />
        <div className="casa-mc-velo" aria-hidden="true" />

        <header>
          <Barra fija />
        </header>

        <div className="casa-mc-dentro">
          <div className="casa-mc-texto">
            <span className="casa-mc-rotulo">Masterclass gratuita · Escuela de Sabiduría 33</span>
            <h1 className="casa-mc-h1">
              Hay una forma de amar
              <br />
              que no elegiste
            </h1>
            <p className="casa-mc-p">
              Desórdenes Amorosos. Lo que se repite en tu forma de querer no
              empezó contigo: estaba en casa antes de que llegaras.
            </p>
          </div>

          <div className="casa-mc-rejilla">
            {/* EL VÍDEO ARRIBA, que es lo que pidió. No se reproduce solo:
                lleva voz y dura dos minutos, y nadie quiere que una página le
                empiece a hablar sin pedirlo — y en un anuncio de Meta, con el
                móvil en la mano y a veces en público, eso hace que se cierre.
                Con `preload="none"` no se descarga ni un byte hasta que se
                pulsa, que en una landing de campaña es abrir en un segundo en
                vez de en seis. */}
            <div className="casa-mc-izq">
              {/* QUIÉN LA DA, ENCIMA DEL VÍDEO.
                  Iris: «sería bueno que le pusiéramos una foto de ambos antes
                  de ver el vídeo». Y va aquí, en la columna del vídeo, y no
                  cruzando la página por arriba: la columna del vídeo mide
                  menos que el formulario, así que lo que se le añada cabe en
                  el hueco que ya sobraba y NO empuja el botón de apuntarse
                  fuera de la primera pantalla. Medido antes de ponerlo.
                  Quién da la clase es la mitad de la confianza en una landing
                  fría, así que tiene que leerse antes que el vídeo, no al
                  final de la página. */}
              <div className="casa-mc-presentan">
                {PRESENTAN.map((q) => (
                  <div className="casa-mc-presenta" key={q.nombre}>
                    <span className="casa-mc-presenta-foto">
                      {q.foto ? (
                        <Image src={q.foto} alt={q.alt} width={300} height={300} sizes="56px" />
                      ) : (
                        /* Sin foto sale el sello, y se ve que falta una foto
                           en vez de una cara que no es (MARCA.md §7). */
                        <Sello tam={26} claro />
                      )}
                    </span>
                    <span className="casa-mc-presenta-datos">
                      <strong>{q.nombre}</strong>
                      <small>{q.titulo}</small>
                    </span>
                  </div>
                ))}
              </div>

              <div className="casa-mc-video">
                <video controls playsInline preload="none" poster="/images/desordenes-aterrizaje-cartel.jpg">
                  <source src="/video/desordenes-aterrizaje.mp4" type="video/mp4" />
                  Tu navegador no puede reproducir este vídeo.
                </video>
              </div>
            </div>

            <div className="casa-mc-caja" id="apuntarse">
              <Registro />
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ── 2. PARA QUIÉN ES ─────────────────────────────── */}
        <section className="casa-mc-quien" aria-labelledby="quien-h">
          <h2 className="casa-mc-quien-h" id="quien-h">
            Esto es para ti si…
          </h2>
          <ul className="casa-mc-lista">
            {PARA_QUIEN.map((x) => (
              <li key={x.t}>
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. EL CIERRE ─────────────────────────────────
            AQUÍ HAN ESTADO DOS COSAS QUE NO ERAN, Y LAS DOS SE FUERON POR UN
            MOTIVO DISTINTO.

            Primero, el formulario otra vez. Gerson: «cuando hay otra vez el
            formulario, ya no tiene relevancia; tienes que colocar otro tipo
            de información». Y es verdad: el de arriba está a la vista desde
            el primer segundo, al lado del vídeo.

            Después, un bloque de «Quién la da» con la foto de Iris y sus
            años. Gerson, el 19 de octubre: «esto también lo da Marco, ese
            curso; creo que mejor quita Quién lo da». O sea que no era un
            problema de diseño: es que decía algo que no es verdad, y eso no
            se arregla moviéndolo de sitio. Se quita.

            Lo que queda es lo único que esta página necesita a esta altura:
            recordar que es gratis y devolver al formulario de arriba. Sin
            foto, sin firma y sin nombrar a nadie — el día que haya una foto
            y dos líneas de quien la dé de verdad, el bloque vuelve con ellas.

            Y NO es un formulario nuevo: es un botón que sube al que ya está
            puesto. Un solo sitio donde se dejan los datos. */}
        <section className="casa-mc-cierre" aria-labelledby="cierre-h">
          <div className="casa-mc-cierre-dentro">
            {/*
             * ESTE CIERRE SE HA REESCRITO ENTERO. Gerson, el 19 de octubre:
             * «no me gusta este CTA, eso de que puedes borrarte NO».
             *
             * Y el problema de fondo era ése: la última frase antes del botón
             * explicaba CÓMO IRSE. Es lo que pasa cuando se mete la letra
             * pequeña del RGPD en el sitio del argumento — y encima sobra, que
             * «puedo borrarme cuando quiera» ya está dentro de la casilla de
             * consentimiento del formulario, que es donde la ley la pide.
             *
             * Lo que hay ahora dice las tres cosas que mueven a alguien que
             * acaba de leer «esto es para ti si…» y está decidiendo:
             *   · que es gratuita,
             *   · que es en directo,
             *   · y que queda grabada, o sea que el día no es una excusa.
             * Y quita la última objeción de quien llega de un anuncio sin
             * saber qué es esto: que hay que saber algo de antes.
             *
             * El botón dice lo mismo que el del formulario —«Quiero mi
             * plaza»— a propósito: es la misma acción, así que son las mismas
             * palabras.
             */}
            <span className="casa-mc-rotulo">La masterclass</span>
            <h2 className="casa-mc-cierre-h" id="cierre-h">
              Gratuita, en directo, y te queda grabada
            </h2>
            <p className="casa-mc-cierre-p">
              Déjame tu nombre y tu correo y te aviso en cuanto haya fecha. No
              hace falta que sepas nada de numerología para seguirla.
            </p>
            <a href="#apuntarse" className="casa-mc-da-boton casa-brillo">
              Quiero mi plaza
            </a>
          </div>
        </section>
      </main>

      <Pie />
    </div>
  );
}
