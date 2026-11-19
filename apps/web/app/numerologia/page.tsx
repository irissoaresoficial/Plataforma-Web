/**
 * ============================================================================
 * QUÉ ES LA NUMEROLOGÍA TRANSGENERACIONAL — LA PÁGINA
 * ============================================================================
 *
 * ESTA PÁGINA SE HA REHECHO ENTERA DE LA ENTRADA PARA ABAJO.
 *
 * Gerson, el 18 de octubre: «esos espacios de numerología y kábala deben
 * quitarse, erradícalo; debes de poner, insisto, el mismo diseño que tenemos
 * en la home adaptado a la comunicación del apartado». Y antes, señalando esta
 * misma página: «el giro es lo único que está bien; de ahí para abajo tienes
 * que borrar lo que ya está viejo y reemplazarlo por lo nuevo».
 *
 * LO QUE HABÍA. Un bloque de texto a dos columnas con una foto que se acercaba,
 * una cinta de cinco piezas a todo lo ancho, la calculadora metida en una
 * banda granate suelta, tres párrafos de «qué no es» y un precio en una línea.
 * Cada pieza con su maqueta, sus márgenes y su manera de entrar — cinco
 * lenguajes distintos en una sola página, y ninguno el de la portada.
 *
 * LO QUE HAY AHORA. Las mismas cuatro formas de la casa, en el mismo orden en
 * que se usan en la portada:
 *
 *   1. LA ENTRADA ....... el vídeo a pantalla completa, la barra y una frase.
 *   2. EL CREMA ......... la afirmación de la sección, en el bloque crema que
 *                         monta sobre el vídeo.
 *   3. LAS FICHAS ....... la columna quieta a la izquierda y las cinco cosas
 *                         que salen de la cuenta pasando por la derecha.
 *   4. LAS FRANJAS ...... qué no es, y la consulta con su precio.
 *   5. EL PIE ........... el mismo de toda la web.
 *
 * Y NO ES UNA IMITACIÓN: son los MISMOS componentes de la portada, con otro
 * contenido. `Sobre` y `Claves` llevan parámetros desde hoy justo para esto.
 * Si mañana se arregla el bloque crema, se arregla aquí también.
 *
 * LA CALCULADORA YA NO ESTÁ. Gerson, el 19 de octubre: «quita esa mierda de
 * la calculadora también».
 *
 * `components/TuNumero.tsx` NO se ha borrado: sigue entero en el repositorio,
 * con su cuenta, su vídeo y sus estilos, y vuelve el día que se quiera
 * cambiando una línea (MARCA.md §8.4). Lo que se ha ido es la decisión de
 * pintarla hoy. Y la página no se queda coja: lo que la calculadora enseñaba
 * —de dónde sale el número— lo cuentan las cinco fichas de arriba, que es
 * donde esa explicación tiene su sitio.
 *
 * ESTA PÁGINA YA NO LLEVA 'use client'. Todo lo que necesita manos vive en sus
 * propios componentes, así que la página en sí es de servidor. El título y la
 * ficha de datos estructurados están en `layout.tsx` — el porqué, en
 * `lib/seo.ts`.
 */

import Cursor from '@/components/Cursor';
import Banda from '@/components/casa/Banda';
import Claves, { type FichaClave } from '@/components/casa/Claves';
import Entrada from '@/components/casa/Entrada';
import Pie from '@/components/casa/Pie';
import Sobre from '@/components/casa/Sobre';
import '@/components/casa/casa.css';
import { CONTACTO, FOTOS, PACK_SESIONES, SESION, eur } from '@/content/site';

/*
 * QUÉ SALE DE LA CUENTA. Son las cinco cosas que la plataforma calcula de
 * verdad para cada persona; ni una está de adorno.
 *
 * `corto` es el nombre del botón del índice de la izquierda, el que se enciende
 * según se baja. Por eso son dos palabras y no cinco: es un botón, no un
 * titular.
 */
const QUE_SALE: FichaClave[] = [
  {
    id: 'camino',
    corto: 'Tu número',
    titulo: 'Camino de vida',
    texto:
      'Sale de tu fecha de nacimiento: se reducen por separado el día, el mes y el año, y después se suman. Es el terreno en el que juegas toda la vida.',
  },
  {
    id: 'nombre',
    corto: 'Tu nombre',
    titulo: 'Expresión, alma y personalidad',
    texto:
      'Cada letra tiene un número. Con el nombre entero sale lo que se te da de fábrica; con solo las vocales, lo que quieres de verdad; con solo las consonantes, lo que los demás ven de ti.',
  },
  {
    id: 'tramos',
    corto: 'Los tramos',
    titulo: 'Realizaciones y ciclos',
    texto:
      /* Texto de Iris, 19 de noviembre de 2026. */
      'La vida no va en línea recta: va por ciclos, y cada uno tiene su temática. Saber en cuál estás puede cambiar tu forma de vivir y de tomar decisiones este año.',
  },
  {
    id: 'dificil',
    corto: 'Lo difícil',
    titulo: 'Desafíos y deudas',
    texto:
      'Los números que salen de las restas —y los kármicos, el 13, el 14, el 16, el 19 y el 26— señalan lo que se te va a repetir hasta que lo mires.',
  },
  {
    /* LA ÚNICA DE LAS CINCO CON IMAGEN, y es la que la pide: es la parte
       transgeneracional, la que dice que esto no empezó en ti. La foto es la
       fila de hombres repitiéndose hacia el fondo, que cuenta esa frase sin
       tener que explicarla. En las otras cuatro no hay nada que enseñar, y un
       rectángulo de relleno en cada una sería ruido cuatro veces. */
    id: 'herencia',
    corto: 'Tu línea',
    titulo: 'La herencia',
    texto:
      /* Texto de Iris, 19 de noviembre de 2026. */
      'Con las fechas de tus ancestros podemos ver qué patrones, qué temáticas, qué lealtades y qué mensajes ocultos quieren transmitirte. Es en lo transgeneracional donde empezó la vida que tienes hoy.',
    foto: FOTOS.generaciones,
    alt: 'Una fila de hombres de distintas edades, uno detrás de otro, en la misma postura y con las mismas manos sobre la mesa, repitiéndose hacia el fondo.',
  },
];

/** Qué NO es. La primera duda de quien llega de un anuncio, contestada antes
 *  del precio: es lo que permite leer lo de abajo sin sospechar. */
const QUE_NO_ES = [
  {
    t: 'No adivina el futuro',
    d: 'Mira arriba, en tus ancestros. Estudia lo que ya pasó, no lo que está por venir: no te dice con quién te casarás ni cuándo te tocará la lotería.',
  },
  {
    t: 'No hay que creer en nada',
    d: 'Sin religiones ni grupos a los que unirse. Ves el cálculo con números delante de ti y puedes rehacerlo tú.',
  },
  {
    t: 'No sustituye a un psicólogo',
    d: 'Si haces terapia, continúa con ella. Esto acompaña y suma; no interfiere.',
  },
];

export default function Numerologia() {
  const ofertaViva = SESION.precioOferta != null && SESION.plazasOferta != null;

  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />

      {/* ── 1. LA ENTRADA ──────────────────────────────────────
          El vídeo de fondo es el del recorrido: números de tinta que se
          vuelven hilos de oro. Dice de qué va la página sin una palabra. */}
      <Entrada
        video={['recorrido.webm', 'recorrido.mp4']}
        cartel="/images/arbol-scroll-cartel.jpg"
        titulo={
          <>
            Tu fecha y tu nombre
            <br />
            ya lo dicen
          </>
        }
        texto="Puestos en números, se ve qué se repite, en qué generación empezó y por dónde te llegó a ti."
        nota="Se trabaja con tu fecha y con tu nombre, caso por caso."
        notaCorta="Con tu fecha y con tu nombre."
        cta={{ a: '/cursos', texto: 'Ver los talleres' }}
      />

      <main>
        {/* ── 2. LA AFIRMACIÓN ─────────────────────────────── */}
        <Sobre
          id="esto"
          /* Los dos textos son de Iris (WhatsApp, 19 de noviembre de 2026). */
          entrada="Tu fecha de nacimiento no es un número al azar. Es un profundo mensaje de amor y de deseos no cumplidos de tu clan, que te transmiten todos tus ancestros para que se haga lo que ellos no pudieron: para que repitas o repares situaciones que causaron dolor y situaciones que no se lograron."
          texto="Un hijo que no se reconoció. Secretos de niños no reconocidos, infidelidades, alguien que estuvo preso o una muerte de la que no se volvió a hablar. Cosas que pasaron de verdad y que nadie resolvió. Nadie tuvo la culpa, pero lo que arriba no se cierra, abajo se repite de generación en generación, y se convierte en la forma de vivir de quienes vienen detrás. Lo que antes parecía normal en tu casa, hoy tú lo repites sin haberlo elegido nunca: ya te duele, quieres cambiarlo y sientes que no puedes."
          botones={[
            { a: '#consulta', texto: 'Ver la consulta', icono: 'abajo' },
            { a: '/cursos', texto: 'Ver los talleres', icono: 'mas' },
          ]}
        />

        {/* ── 3. QUÉ SALE DE LA CUENTA ─────────────────────
            Éste es el bloque que sostiene la página: cinco piezas que dicen
            qué sale del nombre y de la fecha, y de dónde sale cada una. No
            es relleno — es lo que convierte «numerología» en algo con partes
            que se pueden nombrar, y lo que hace que el precio de abajo se lea
            contra algo concreto.
            El fondo quieto es la cuenta escrita a mano sobre la madera — el
            de la portada, que aquí además es literalmente el tema. */}
        <Claves
          id="que-sale"
          titulo={
            <>
              Qué sale de tu nombre
              <br />
              y de tu fecha.
            </>
          }
          fichas={QUE_SALE}
          pide={{
            texto: 'La cuenta es aritmética: no hay que creer en nada para seguirla. En los talleres se aprende a hacerla.',
            boton: { a: '/cursos', texto: 'Ver los talleres' },
          }}
        />

        {/* ── 4. Y QUÉ NO ES ───────────────────────────────── */}
        <Banda
          id="no-es"
          tono="claro"
          rotulo="Para que no haya dudas"
          titulo="Y qué no es"
          texto={
            /* La entrada es de Iris (19 de noviembre de 2026): que lo diga
               claro, antes de la lista. */
            <p>
              La numerología no es adivinación, ni un juego de azar, ni una
              etiqueta que te encasilla. Tampoco es magia vacía ni una fórmula
              cerrada para predecir el futuro: es un espejo para mirar lo que
              ya habita en ti y empezar a transformarlo.
            </p>
          }
        >
          <ul className="casa-lista">
            {QUE_NO_ES.map((x) => (
              <li key={x.t}>
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </li>
            ))}
          </ul>
        </Banda>

        {/* ── 5. LA CONSULTA Y SU PRECIO ───────────────────
            El precio vive aquí y no en la portada: allí lo que se decide es
            si esto interesa, no cuánto cuesta. */}
        <Banda
          id="consulta"
          tono="arena"
          rotulo="La consulta"
          titulo="Tu historia, puesta en números y explicada para ti"
          texto={
            <>
              {/* Texto de Iris (19 de noviembre de 2026). Su primera frase
                  («Tu historia, puesta en números y explicada para ti») es el
                  titular de arriba; aquí sigue. Desde hoy, online o
                  presencial. */}
              <p>
                De manera online o presencial, con tu estudio ya preparado
                antes de vernos. Miramos de dónde viene lo que se repite, en qué
                generación empezó y qué quieres soltar tú para llevar una vida
                diferente a la de tus ancestros, soltando patrones y lealtades
                siempre con amor y reconocimiento a tus orígenes.
              </p>
              <p>
                Sales con tu patrón por escrito y con nombres. No con una lista
                de consejos.
              </p>
            </>
          }
          nota="¿Y la consulta de Kábala, qué es? Está en su propia página, en el menú de arriba."
        >
          <div className="casa-precio">
            <p className="casa-precio-cifra">
              {ofertaViva ? (
                <>
                  {eur(SESION.precioOferta)}
                  <span className="casa-precio-antes">{eur(SESION.precio)}</span>
                </>
              ) : (
                eur(SESION.precio)
              )}
            </p>
            <p className="casa-precio-que">
              Una sesión online o presencial donde estudiamos todo tu estudio
              numerológico transgeneracional.
              {ofertaViva
                ? ` Es el precio de aniversario, que cae en día 14: son ${SESION.plazasOferta} plazas, una por cada año de consulta, y se acaba cuando se llenen.`
                : ''}
            </p>
            {/* Enlace al correo y no botón de chat: el chat se borró de toda
                la web, y éste era de los que lo abrían. */}
            <a
              className="casa-precio-boton casa-brillo"
              href={`mailto:${CONTACTO.email}?subject=Reservar%20mi%20consulta%20de%20numerolog%C3%ADa`}
            >
              Reservar mi consulta
            </a>
            <p className="casa-precio-letra">
              Se reserva por correo y te contesto yo. Si prefieres preguntar
              antes, escríbeme y ya está.
            </p>

            {/* EL PACK, COMO OPCIÓN SEGUNDA (datos de Iris, 19 nov 2026).
                Botón secundario: en esta pantalla la petición principal es
                la consulta (MARCA.md §5). Los 888 € NO van tachados: no son
                un precio anterior, son 8 × 111 €. Se cobra como hoy: se
                reserva por correo y lo cierra Iris. */}
            <div className="casa-pack">
              <p className="casa-pack-rotulo">O el pack de {PACK_SESIONES.sesiones} sesiones</p>
              <p className="casa-pack-que">
                {PACK_SESIONES.sesiones} sesiones personalizadas · una cada {PACK_SESIONES.cadaSemanas} semanas
              </p>
              <p className="casa-pack-cifra">
                {eur(PACK_SESIONES.precio)} <span>en un pago</span>
              </p>
              <p className="casa-pack-que">
                o {PACK_SESIONES.cuotas} cuotas de {eur(PACK_SESIONES.precioCuota)} ({eur(PACK_SESIONES.precioCuota * PACK_SESIONES.cuotas)}): una al empezar y otra en la sesión {PACK_SESIONES.cuotaEnSesion}.
              </p>
              <p className="casa-pack-compara">
                Sueltas, a {eur(PACK_SESIONES.precioSesion)} cada una, serían {eur(PACK_SESIONES.precioSesion * PACK_SESIONES.sesiones)}.
              </p>
              <a
                className="casa-pack-boton"
                href={`mailto:${CONTACTO.email}?subject=${encodeURIComponent(`Reservar el pack de ${PACK_SESIONES.sesiones} sesiones`)}`}
              >
                Reservar el pack
              </a>
            </div>
          </div>
        </Banda>
      </main>

      <Pie />
    </div>
  );
}
