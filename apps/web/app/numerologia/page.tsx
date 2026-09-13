'use client';

import Link from 'next/link';
import { useRef } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
/* Antes `Reveal`, un fundido de duración fija. `Aparece` ata el movimiento a
   la rueda: si paras de bajar, para. Explicado en components/Aparece.tsx. */
import Aparece from '@/components/Aparece';
import Foto from '@/components/Foto';
import TuNumero from '@/components/TuNumero';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
import Susurros from '@/components/Susurros';
import { FOTOS, SESION, eur } from '@/content/site';

/*
 * ============================================================================
 * QUÉ ES LA NUMEROLOGÍA TRANSGENERACIONAL — LA PÁGINA
 * ============================================================================
 *
 * La portada no lleva precios. Ni uno. Lo que hace es contar un problema,
 * presentar a Iris y dejar una sola acción: hablar con ella. Todo lo que es
 * «qué se compra exactamente y cuánto cuesta» vive en dos páginas, ésta y la de
 * la Kábala, y se llega desde el pie, desde el cierre de la portada o buscando
 * en Google.
 *
 * Y es la manera correcta de repartirlo. Una tabla de tarifas en medio de una
 * historia le hace a la persona la pregunta equivocada —«¿cuál de las dos y por
 * cuánto?»— cuando todavía no ha decidido lo primero, que es si esto le
 * interesa. Aquí ya ha decidido que sí: por eso ha entrado.
 *
 * Aquí sí hay sitio para lo largo. Qué es, de dónde sale la cuenta, qué se ve
 * en una sesión, qué NO es y cuánto cuesta. La calculadora va dentro porque
 * ésta es su casa: es la misma cuenta de la que habla el texto, hecha delante
 * de quien lee.
 */

const PAD = 'clamp(76px,10vw,150px) clamp(16px,4vw,56px)';

/** Qué sale de la cuenta. Nada de esto es de adorno: son las cinco cosas que la
 *  plataforma calcula de verdad para cada persona. */
const QUE_SALE: { n: string; t: string; p: string }[] = [
  {
    n: 'Tu número',
    t: 'Camino de vida',
    p: 'Sale de tu fecha de nacimiento: se reducen por separado el día, el mes y el año, y después se suman. Es el terreno en el que juegas toda la vida.',
  },
  {
    n: 'Tu nombre',
    t: 'Expresión, alma y personalidad',
    p: 'Cada letra tiene un número. Con el nombre entero sale lo que se te da de fábrica; con solo las vocales, lo que quieres de verdad; con solo las consonantes, lo que los demás ven de ti.',
  },
  {
    n: 'Los tramos',
    t: 'Realizaciones y ciclos',
    p: 'La vida no va en línea recta: va por tramos, y cada uno tiene su asunto. Saber en cuál estás cambia lo que merece la pena intentar este año.',
  },
  {
    n: 'Lo difícil',
    t: 'Desafíos y deudas',
    p: 'Los números que salen de las restas —y los kármicos, el 13, el 14, el 16, el 19 y el 26— señalan lo que se te va a repetir hasta que lo mires.',
  },
  {
    n: 'Tu línea',
    t: 'La herencia',
    p: 'Con las fechas de tus padres y tus abuelos se ve qué número viene de dónde. Es la parte transgeneracional: lo que no empezó en ti.',
  },
];

export default function Numerologia() {
  useSiteScroll();
  const chatRef = useRef<ChatWidgetHandle>(null);
  const abrirConsulta = () => chatRef.current?.open('consulta');
  const ofertaViva = SESION.precioOferta != null && SESION.plazasOferta != null;

  return (
    <div id="app" className="claro" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <Nav cta="Reservar" onCta={abrirConsulta} />

      {/* ── QUÉ ES ───────────────────────────────────────────── */}
      <div className="claro bloque-limpio" style={{ paddingTop: 'clamp(128px,15vw,200px)' }}>
        <div className="limpio-dentro">
          <div className="limpio-texto">
            {/* El titular de la página, escrito palabra a palabra según se
                baja. Es lo primero que se lee y es largo: entero de golpe se
                salta, escribiéndose se lee. */}
            <Aparece as="h1" modo="letras" className="titular-seccion limpio-h">
              Numerología transgeneracional: qué es y para qué sirve.
            </Aparece>
            <Aparece retraso={1}>
              <p className="limpio-p">
                Tu nombre y tu fecha de nacimiento guardan lo que ha ido pasando en tu familia. Puestos en números, el
                patrón se ve: qué se repite, en qué generación empezó y por dónde te llegó a ti.
              </p>
            </Aparece>
            <Aparece retraso={2}>
              <p className="limpio-p">
                Un hijo que no se reconoció, alguien que estuvo preso, una muerte de la que no se volvió a hablar. Cosas
                que pasaron de verdad y que nadie cerró. Nadie tuvo la culpa, pero una historia que no se cierra sigue
                bajando hasta que alguien la mira de frente.
              </p>
            </Aparece>
          </div>
          {/* La foto se acerca en vez de subir: es la fila de hombres
              repitiéndose, y acercándose se lee como que enfoca en ella. */}
          <Aparece modo="escala" retraso={1} className="limpio-foto">
            <Foto
              src={FOTOS.generaciones}
              alt="Una fila de hombres de distintas edades, uno detrás de otro, en la misma postura y con las mismas manos sobre la mesa, repitiéndose hacia el fondo"
              ratio="4/5"
              radius="0"
              sizes="(max-width:900px) 100vw, 40vw"
            />
          </Aparece>
        </div>
      </div>

      {/* ── LA CUENTA, HECHA DELANTE ─────────────────────────
          La calculadora vive aquí y no en la portada. Es la misma cuenta de la
          que habla el texto de arriba: enseñarla en el momento en que se acaba
          de explicar es lo que la convierte en prueba en vez de en juguete. */}
      <div id="prueba" className="vino banda tn-banda" style={{ scrollMarginTop: 80 }}>
        {/* La calculadora se acerca. Es una pieza con la que se INTERACTÚA:
            que suba como un párrafo la iguala con el texto de al lado, y
            acercándose se lee como que se pone delante. */}
        <Aparece modo="escala" className="banda-dentro">
          <TuNumero />
        </Aparece>
      </div>

      {/* ── QUÉ SALE ─────────────────────────────────────────
          Cinco piezas, en columnas. Es lo que la plataforma calcula de verdad
          para cada persona; ni una de las cinco está de adorno. */}
      <div className="claro bloque-limpio">
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(32px,4vw,58px)' }}>
          <Aparece modo="letras" className="titular-seccion" style={{ maxWidth: '15ch' }}>
            Qué sale de tu nombre y de tu fecha.
          </Aparece>
          <div className="num-rejilla">
            {QUE_SALE.map((q, i) => (
              /* Un escalón por ficha: las cinco entran en cascada y la
                 rejilla se lee de arriba abajo, no de golpe. */
              <Aparece key={q.t} retraso={i} className="num-ficha">
                <span className="num-etiqueta">{q.n}</span>
                <h2 className="num-tit">{q.t}</h2>
                <p className="num-txt">{q.p}</p>
              </Aparece>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUÉ NO ES ────────────────────────────────────────
          La duda número uno de quien llega de un anuncio. Contestarla en alto y
          antes del precio es lo que permite leer el resto sin sospecha. */}
      <div className="arena bloque-limpio">
        <div className="cierre-uno">
          <Aparece modo="letras" className="titular-seccion cierre-uno-h">Y qué no es.</Aparece>
          <Aparece retraso={1}>
            <p className="cierre-uno-p">
              No adivina el futuro. Mira hacia atrás, no hacia delante: nadie te va a decir con quién te vas a casar ni
              cuándo te va a tocar la lotería.
            </p>
          </Aparece>
          <Aparece retraso={2}>
            <p className="cierre-uno-p">
              No hay que creer en nada. No hay religión, ni grupo, ni nada a lo que apuntarse. La cuenta se hace delante
              de ti, con números, y la puedes rehacer tú.
            </p>
          </Aparece>
          <Aparece retraso={3}>
            <p className="cierre-uno-p">
              Y no sustituye a un psicólogo. Si estás en terapia, sigue con ella: esto acompaña y no interfiere.
            </p>
          </Aparece>
        </div>
      </div>

      {/* ── LA CONSULTA Y SU PRECIO ──────────────────────────
          El precio vive aquí, con cuerpo de texto normal y su motivo al lado.
          En la portada no está: allí lo que se decide es si esto interesa, no
          cuánto cuesta. */}
      <div id="consulta" className="claro bloque-limpio" style={{ scrollMarginTop: 80 }}>
        <div className="cierre-uno">
          <Aparece modo="letras" className="titular-seccion cierre-uno-h">La consulta.</Aparece>
          <Aparece retraso={1}>
            <p className="cierre-uno-p">
              Online, con tu carta ya preparada antes de vernos. Miramos de dónde viene lo que se repite en tu familia,
              en qué generación empezó y qué parte te toca soltar a ti. Sales con tu historia puesta en números y
              explicada delante de ti — no con una lista de consejos.
            </p>
          </Aparece>
          <Aparece retraso={2}>
            <p className="num-precio">
              {ofertaViva ? (
                <>
                  <b>{eur(SESION.precioOferta)}</b> en vez de {eur(SESION.precio)}, las {SESION.plazasOferta} primeras
                </>
              ) : (
                <b>{eur(SESION.precio)}</b>
              )}
            </p>
          </Aparece>
          {ofertaViva && (
            <Aparece retraso={3}>
              <p className="cierre-uno-p">
                Es el precio de aniversario, que cae en día 14. Son {SESION.plazasOferta} plazas, una por cada año de
                consulta, y se acaba cuando se llenen.
              </p>
            </Aparece>
          )}
          <Aparece retraso={4}>
            <button type="button" className="portada-cta" onClick={abrirConsulta} data-mag data-cur-label="Reservar">
              <span>Reservar mi consulta</span>
              <i aria-hidden>→</i>
            </button>
          </Aparece>
          <Aparece retraso={5}>
            <p className="cierre-uno-puertas">
              <Link href="/kabala" data-mag>
                Y la consulta de Kábala, ¿qué es? →
              </Link>
            </p>
          </Aparece>
        </div>
      </div>

      {/* ── PIE ──────────────────────────────────────────────── */}
      <div className="arena" style={{ background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px' }}>
        {/* Lo último de la página también se mueve. El recorrido se recorta
            por lo que queda de scroll, así que llega puesto del todo aunque no
            haya más página por debajo para terminar de subirlo. */}
        <Aparece style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', justifyContent: 'space-between' }}>
          <Marca tam={68} apilado />
          <Link href="/" data-mag style={{ fontSize: 'var(--t-cuerpo)', color: 'var(--tx-2)' }}>
            ← Volver al inicio
          </Link>
        </Aparece>
      </div>

      <ChatWidget ref={chatRef} />
      <Susurros />
    </div>
  );
}
