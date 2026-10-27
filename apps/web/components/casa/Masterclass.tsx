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
import CuentaAtras from './CuentaAtras';
import Registro from './Registro';
import Sello from './Sello';
import { PRESENTAN, MASTERCLASS } from '@/content/site';
import './casa.css';
import VideoMedido from './VideoMedido';

/*
 * «ESTO ES PARA TI SI…» SE FUE EL 27 DE OCTUBRE, Y AQUÍ QUEDA POR QUÉ.
 *
 * Eran tres cartelitos, y Gerson los tumbó señalando el tercero: «estamos
 * hablando de patrones repetitivos, entender el porqué de las cosas (en el
 * ámbito del amor); no digas que leemos o que hacemos. No, esto está mal».
 *
 * El tercero decía «Analizamos tu fecha y tu nombre, y se ve de dónde viene y
 * a quién pertenece lo que repites». Eso explica EL MÉTODO, y explicar el
 * método en una página de captación hace justo lo contrario de lo que se
 * busca: a quien no conoce la casa le suena a que le van a adivinar algo, y
 * deja de leer antes de llegar al formulario. Lo que vende esta clase no es
 * cómo se hace, es qué se entiende — por qué se repite lo mismo en el amor.
 *
 * Y la sección entera sobraba además por otra razón: ese mismo día se puso
 * arriba «Esta clase es para ti · Aunque…», que hace exactamente el mismo
 * trabajo —que quien lee se reconozca— y lo hace mejor, porque en vez de
 * describir a la persona nombra las razones por las que cree que esto no es
 * para ella. Dos secciones para lo mismo, seguidas, se leen como relleno.
 *
 * Lo que decían los dos primeros cartelitos no se ha perdido: «siempre acaba
 * igual» está en el primer «Aunque» y en el párrafo del titular, y lo de la
 * casa está en el titular mismo — «no empezó contigo: estaba en casa antes de
 * que llegaras».
 */

/*
 * LAS OBJECIONES, DICHAS ANTES DE QUE LAS PIENSE.
 *
 * Gerson, el 27 de octubre, con una landing de otro evento delante: «mira esta
 * frase impacta mucho, quiero algo así en la cuestión de comunicación».
 *
 * Lo que impacta de esa referencia no es la frase: es la figura. Tres líneas
 * que empiezan igual —«Aunque…»— y que van nombrando, una por una, las razones
 * por las que quien lee cree que esto no es para ella. Dichas por la casa y no
 * por ella, dejan de ser un muro y pasan a ser una señal de que aquí la
 * entienden.
 *
 * SE ELIGEN LAS TRES QUE DE VERDAD FRENAN, y son de esta clase y no de otra:
 * la que ya ha cambiado de pareja y no de final, la que entiende perfectamente
 * lo que le pasa y vuelve a caer igual, y la que ya no sabe a quién echarle la
 * culpa. Las tres salen de lo que Iris cuenta en el vídeo.
 *
 * NI UNA PROMESA QUE NO SE PUEDA CUMPLIR. No dice que se arregle en una hora
 * ni que esto sustituya a una terapia: dice que en esa hora se ve de dónde
 * viene. Lo primero sería mentira y lo segundo es lo que pasa (MARCA.md §7).
 */
const AUNQUE = [
  'Aunque hayas cambiado de persona y la discusión sea exactamente la misma.',
  'Aunque te lo sepas de memoria y aun así vuelvas a caer en lo mismo.',
  'Aunque ya no sepas si el problema es la otra persona o eres tú.',
];

export default function Masterclass() {
  return (
    <div id="app" className="claro casa casa-mc-cuenta-hueco" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      {/* ── 1. EL VÍDEO Y EL FORMULARIO ────────────────────── */}
      {/* ARRIBA DEL TODO Y FUERA DE LA SECCIÓN: dentro caía en el relleno
          superior de la portada y quedaba a 68 px del borde, debajo de la barra
          del menú. Lo primero que tiene que ver quien llega es cuánto falta. */}
      <CuentaAtras />

      <section className="casa-mc-alto">
        <Image className="casa-mc-fondo" src="/images/camino-escuela.jpg" alt="" fill priority sizes="100vw" />
        <div className="casa-mc-velo" aria-hidden="true" />


        <header>

          <Barra fija />

        </header>

        <div className="casa-mc-dentro">
          <div className="casa-mc-texto">
            <span className="casa-mc-rotulo">Masterclass en directo · Escuela de Sabiduría 33</span>
            {/*
              EL TITULAR ERA «Hay una forma de amar que no elegiste», y es más
              bonito que éste. Se ha cambiado igual, y conviene saber por qué.

              Esa frase es una IDEA: hay que pararse un segundo a entenderla.
              Funciona para quien ya sigue a Iris. No funciona para quien llega
              de un anuncio, porque esa persona no ha venido a leer: ha dado un
              toque con el pulgar y decide en dos segundos si esto va con ella
              o cierra.

              Lo que hace que se quede no es una idea bonita, es reconocerse.
              «¿Por qué siempre acaba igual?» es una pregunta que alguien se ha
              hecho en voz baja, probablemente más de una vez. Quien no se la
              ha hecho nunca, se va — y eso también está bien, porque cada una
              de esas personas nos cuesta dinero.

              La idea de antes no se ha perdido: ha bajado a la frase de abajo,
              que es donde funciona, una vez que la persona ya ha decidido
              quedarse a leer.
            */}
            {/*
              EL TITULAR, 27 DE OCTUBRE. El anterior era «¿Por qué siempre
              acaba igual?», y era bueno: una pregunta que esta mujer se ha
              hecho en voz baja más de una vez. Se cambia porque 245 personas
              llegaron desde los anuncios con ese titular delante y no se
              apuntó ninguna.

              Lo que le faltaba: una pregunta engancha, pero no promete nada.
              Quien llega de un anuncio y se reconoce en la pregunta todavía
              no sabe QUÉ se lleva si deja su correo, así que no lo deja.

              Ahora el titular dice las tres cosas que hacen que alguien
              reserve: qué se va a llevar (ver el patrón y de dónde viene),
              en cuánto tiempo (una hora) y que hay alguien dándolo en
              directo. La pregunta de antes no se ha perdido: ha bajado a la
              frase de debajo, que es su sitio.

              EL RESALTE VA EN COLOR Y NO EN CURSIVA. La referencia que pasó
              Gerson resalta en cursiva; aquí no, porque no quiere cursiva en
              nada (19 de octubre). El oro de la casa separa igual de bien.
            */}
            <h1 className="casa-mc-h1">
              Descubre en una hora por qué repites la misma historia
              <b> y dónde empezó</b>
            </h1>
            <p className="casa-mc-p">
              Cambias de persona y vuelve la misma discusión, el mismo final.
              Lo que se repite en tu forma de querer no empezó contigo: estaba
              en casa antes de que llegaras. En esta clase se ve cuál es el
              patrón, de quién lo heredaste y qué hacer con él.
            </p>

            {/* LA LLAMADA, ARRIBA Y GRANDE.
                Hasta hoy la primera pantalla del móvil enseñaba el formulario
                entero: nombre, correo, casilla y botón. A alguien que no
                conoce a Iris eso le pide el correo antes de haberle contado
                nada, y 245 personas contestaron que no.

                Así que la primera pantalla vuelve a hacer lo que hace una
                landing de evento: prometer algo concreto y ofrecer UN botón.
                El formulario sigue donde estaba —un toque más abajo— y ahora
                lo ve quien ya ha decidido que le interesa. Menos gente va a
                llegar hasta él, y eso es exactamente lo que se busca: la que
                llegue va con la decisión tomada. */}
            <a href="#apuntarse" className="casa-mc-cta casa-brillo">
              Reservar mi plaza
            </a>
            {/* EL COSTE DE NO HACER NADA, en una línea y sin crueldad.
                La referencia pone «o cierra esta pestaña y sigue viendo cómo
                otros se llevan lo que es tuyo». La figura es buena y el tono
                no: eso humilla a quien lee. Aquí dice lo que de verdad pasa
                si cierra, que en esta clase es mucho más concreto — y más
                duro — que cualquier frase de motivación. */}
            <p className="casa-mc-coste">
              O cierras esta página y vuelves a empezar la misma historia con
              la siguiente persona.
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

              {/* MIDE HASTA DÓNDE LLEGA LA GENTE. Por fuera es el mismo vídeo
                  de antes; por dentro avisa al play, al 25, al 50, al 75 y al
                  final. Es lo que contesta «¿se lo ven entero?» — y lo que
                  permite montar en Meta un público de quien casi lo acaba.
                  Ver `VideoMedido.tsx`. */}
              <div className="casa-mc-video">
                <VideoMedido
                  src="/video/desordenes-aterrizaje.mp4"
                  poster="/images/desordenes-aterrizaje-cartel.jpg"
                  nombre="masterclass-desordenes"
                />
              </div>
            </div>

            <div className="casa-mc-caja" id="apuntarse">
              <Registro />
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ── LAS OBJECIONES, ANTES DE QUE LAS PIENSE ──────── */}
        <section className="casa-mc-aunque" aria-labelledby="aunque-h">
          <h2 className="casa-mc-aunque-h" id="aunque-h">
            Esta clase es para ti
          </h2>
          <ul className="casa-mc-aunque-lista">
            {AUNQUE.map((frase) => (
              <li key={frase}>
                {/* La palabra que repite va en oro y en negrita, no en
                    cursiva: es lo que hace que las tres se lean como una
                    sola idea en vez de como tres frases sueltas. */}
                <b>Aunque</b>
                {frase.replace('Aunque', '')}
              </li>
            ))}
          </ul>
          <a href="#apuntarse" className="casa-mc-cta casa-brillo">
            Reservar mi plaza
          </a>
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
             * Lo que hay ahora dice lo único que mueve a alguien que acaba
             * de leer «esto es para ti si…» y está decidiendo: que es en
             * directo. Decía también que era gratuita; Gerson lo quitó el 22
             * de octubre, de la web y de los anuncios a la vez. Cuesta algún
             * clic —el precio cero siempre los sube— y a cambio no atrae al
             * que viene sólo porque no paga, que es justo el que luego no
             * aparece. Para una clase que tiene que estar llena el día 26,
             * sale a cuenta. Ni una palabra más —ver el comentario de abajo,
             * que es el que manda.
             *
             * El botón dice lo mismo que el del formulario —«Quiero mi
             * plaza»— a propósito: es la misma acción, así que son las mismas
             * palabras.
             */}
            {/* FUERA «QUEDA GRABADA» Y «NO HACE FALTA SABER NADA».
                Gerson las tumbó las dos el 19 de octubre. Y es mejor cierre
                sin ellas: una prometía algo del producto que no está decidido
                —y una promesa que luego no se cumple cuesta más que el
                registro que gana—, y la otra contestaba una objeción en el
                sitio donde ya no toca contestar objeciones, sino recoger.
                Lo que hay ahora apunta a lo único que importa a esa altura:
                que quien ha leído los tres cartelitos de arriba se haya
                reconocido en alguno. */}
            <span className="casa-mc-rotulo">La masterclass</span>
            <h2 className="casa-mc-cierre-h" id="cierre-h">
              Si te has reconocido en algo de esto
            </h2>
            <p className="casa-mc-cierre-p">
              Es {MASTERCLASS.cuando}, en directo. Déjame tu nombre y tu correo y te
              mando el enlace.
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
