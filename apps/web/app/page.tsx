'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
/*
 * `Aparece` en vez de `Reveal`, en toda la web.
 *
 * `Reveal` era un fundido de setecientas milésimas que se dispara cuando el
 * bloque asoma y ya no depende de nada más. Eso no es movimiento de scroll: es
 * una animación que CASUALMENTE empieza al bajar — si paras la rueda, sigue
 * sola hasta el final, y si bajas de golpe te la pierdes entera.
 *
 * En `Aparece` el movimiento va atado a la rueda: cuánto ha entrado el bloque
 * es un número de 0 a 1 que el CSS usa para la opacidad y el desplazamiento.
 * Bajas y entra, paras y se para a media entrada. Ver components/Aparece.tsx.
 */
import Aparece from '@/components/Aparece';
import { Palabras, Marquesina, Paralaje, Revelado, Entra } from '@/components/movimiento';
import TuNumero from '@/components/TuNumero';
import Anclado from '@/components/Anclado';
import Testimonios from '@/components/Testimonios';
import Lanzamiento from '@/components/Lanzamiento';
import Foto from '@/components/Foto';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import ChatWidget, { type ChatWidgetHandle, type Servicio } from '@/components/ChatWidget';
import Susurros from '@/components/Susurros';
import ArbolVida from '@/components/ArbolVida';
import PortadaArbol from '@/components/PortadaArbol';
import VideoPresenta from '@/components/VideoPresenta';
import QueEs from '@/components/QueEs';
import SinergiaAqui from '@/components/SinergiaAqui';
import { useLang } from '@/lib/i18n';
import { CONTACTO, FOTOS, MEMBRESIA } from '@/content/site';
import Pendiente from '@/components/Pendiente';
/* El CSS de la sinergia vive en su propio archivo: es una pieza entera con su
   maqueta, sus casillas y su resultado, y meterla en globals.css la escondía
   entre seis mil líneas. */
import './sinergia-aqui.css';

const PAD = 'clamp(76px,10vw,150px) clamp(16px,4vw,56px)';
const ANCHO = 1320;

/** Rótulo de sección: línea fina + palabra pequeña.
 *
 *  La rayita lleva clase propia porque en el móvil hay un sitio donde sobra: el
 *  rótulo de la portada es el más largo de la web —«Numerología transgeneracional
 *  · online desde 2010»— y con la rayita y su hueco delante se partía en dos
 *  renglones, robándole diecisiete píxeles de alto a una pantalla donde ya no
 *  cabía el cartel. */
/*
 * LOS RÓTULOS PEQUEÑOS YA NO SE PINTAN.
 *
 * Eran las líneas en versalitas espaciadas encima de cada bloque —«NUMEROLOGÍA
 * TRANSGENERACIONAL · ONLINE DESDE 2010», «LA CONSULTA», «QUÉ ES LA KÁBALA»— y
 * Gerson las ha quitado de toda la web.
 *
 * Tenía razón, y el motivo es de diseño y no de gusto: un rótulo así no informa
 * de nada que el titular de debajo no diga ya, y en cambio pone una línea de
 * ruido tipográfico delante de cada bloque. Ocho veces en una página, eso deja
 * de ser un recurso y pasa a ser un tic — y es de las cosas que hacen que una
 * web se lea antigua.
 *
 * El componente se queda vacío en vez de borrar sus ocho llamadas: así ninguna
 * rejilla se queda con un hueco donde había un hijo, y el día que se quiera
 * recuperar alguno se descomenta aquí.
 */
function Rotulo(_p: { children: React.ReactNode; claro?: boolean; className?: string }) {
  return null;
}

function PillCTA({ onClick, href, variant, label, curLabel }: { onClick?: () => void; href?: string; variant: 'cream' | 'gold' | 'dark'; label: string; curLabel?: string }) {
  const cls = `pill pill-${variant}`;
  const inner = (
    <>
      <span>{label}</span>
      <span className="pill-arrow">→</span>
    </>
  );
  /*
   * Un `div` con onClick no existe para quien no usa ratón: no lo alcanza el
   * tabulador, no lo activa Intro, y un lector de pantalla no lo anuncia como
   * algo que se pueda pulsar. Esto era el botón «Hablar con Iris» de la
   * portada — el más importante de la web.
   *
   * La regla: si LLEVA a un sitio, es un enlace; si HACE algo, es un botón.
   * Los dos vienen con teclado y con foco de fábrica.
   */
  return href ? (
    <Link href={href} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </button>
  );
}

export default function Home() {
  const { t } = useLang();
  // Sin barra de progreso: se fue con el bloque de los tres pasos.
  useSiteScroll();
  const chatRef = useRef<ChatWidgetHandle>(null);
  /* Qué consulta se reserva viaja hasta el chat. Sin esto, el botón de Kábala
     abría un agente que no nombraba la Kábala ni los 333 € en ningún momento, y
     la persona salía creyendo que había reservado otra cosa. */
  const openChat = (servicio: Servicio) => chatRef.current?.open(servicio);
  /*
   * Y ÉSTE ES EL QUE SE ENGANCHA A UN BOTÓN.
   *
   * `openChat` no puede ir suelto en un `onClick`: el navegador le pasaría el
   * evento del clic como primer argumento, y ese argumento es ahora QUÉ se
   * reserva. Acabaría llegando un MouseEvent donde se espera «consulta» o
   * «kabala». TypeScript lo cazó en el botón del pie y en ningún otro sitio,
   * porque los demás pasan por un componente que declara `() => void` y ahí no
   * se ve — así que el arreglo no es taparlo donde saltó, es no dejar nunca el
   * argumento al aire.
   */
  const abrirConsulta = () => openChat('consulta');
  const [faq, setFaq] = useState(-1);

  /* El curso que sale en la ficha de la portada: el primero que tenga fecha de
     verdad. Sin ninguno, la ficha no se dibuja: es preferible un hueco a una
     fecha inventada. */

  /* Los precios ya no salen en la portada: viven en /numerologia y /kabala,
     que son las páginas que explican qué se compra, y el chat los dice en su
     primera respuesta. Aquí no queda ninguna cifra que calcular. */

  /* Doce, no cuatro. Quien duda antes de reservar no duda de una cosa: duda de
     si esto es adivinación, de si le van a pedir creer algo, de qué pasa si no
     sabe las fechas de sus abuelos y de si puede mover la cita. Cada pregunta
     que no está aquí es alguien que cierra la pestaña sin escribir. */
  const faqs: [string, string][] = [
    [t.f_q1, t.f_a1],
    [t.f_q5, t.f_a5],
    [t.f_q7, t.f_a7],
    [t.f_q10, t.f_a10],
    [t.f_q6, t.f_a6],
    [t.f_q8, t.f_a8],
    [t.f_q2, t.f_a2],
    [t.f_q3, t.f_a3],
    [t.f_q9, t.f_a9],
    [t.f_q11, t.f_a11],
    [t.f_q12, t.f_a12],
    [t.f_q4, t.f_a4],
  ];
  const dolor = [t.p1, t.p2, t.p3, t.p4];

  return (
    <div id="app" className="claro" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav
        cta={t.book}
        onCta={abrirConsulta}
        conIdiomas
        /* Enlaces de ESTA página, no destinos. «Qué es la Kábala» apuntaba a
           un `#kabala` que ya no existe —ese bloque se mudó entero a su propia
           página— así que era un enlace que no llevaba a ningún sitio: se
           pulsaba y no pasaba nada. La Kábala ya está en la lista de arriba del
           menú, con su página. */
        extra={[
          { href: '#hola', label: 'Quién es Iris' },
          { href: '#consultas', label: 'La consulta' },
          { href: '#prueba', label: t.n1 },
          { href: '#dudas', label: 'Dudas' },
        ]}
      />

      {/* ── APERTURA ─────────────────────────────────────────── */}
      {/*
          EL ÁRBOL CRECE CUANDO TÚ BAJAS.
          --------------------------------------------------------------------
          Aquí ha habido, por este orden: un retrato con dos fichas al lado, un
          titular grande en serif con una línea en cursiva dorada —«invitación
          de boda», dijo Gerson, y tenía razón— y un árbol dibujado con SVG que
          se pintaba solo al entrar.

          Ninguno hacía lo que hace éste: RESPONDER. El vídeo del árbol no se
          reproduce; avanza al ritmo de la rueda del ratón. Bajas y crece, subes
          y vuelve atrás. Quien entra tarda dos segundos en darse cuenta de que
          el dibujo le hace caso, y ese descubrimiento es lo que le hace seguir
          bajando — que es exactamente lo que esta portada necesita que haga.

          Y mientras crece, el texto va contando: primero de qué va, después por
          qué le ha llegado a él, y solo al final —cuando el árbol ya está
          entero y lleno de oro— el precio y el botón.

          El detalle está en components/PortadaArbol.tsx. */}
      <div id="top">
        <PortadaArbol
          pasos={[
            /* El titular sale ENTERO desde el primer fotograma: es lo que ve
               quien comparte el enlace y quien tiene el móvil en modo ahorro.
               Los otros dos se escriben palabra a palabra al bajar. */
            {
              nodo: (
                <>
                  <h1 className="portada-h1">
                    {t.h1a}
                    <br />
                    <b>{t.h1b}</b>
                  </h1>
                  {/* «Sigue bajando» era letra pequeña, y la letra pequeña se
                      ha ido de toda la web. Lo dice mejor sin decirlo: una
                      ranura hundida en el papel y una gota dorada cayendo. */}
                  <span className="portada-baja" aria-hidden>
                    <i />
                  </span>
                </>
              ),
            },
            { texto: t.h1p1 },
            {
              texto: t.h1p2,
              fuerte: t.h1p2b,
              /*
               * EL BOTÓN DEJA DE SER UNA PASTILLA.
               *
               * Era una cápsula granate con la flecha dentro y, debajo, el
               * precio en letra pequeña. Dos cosas mal: la pastilla es el gesto
               * de cualquier plantilla, y la letra pequeña ya no existe en esta
               * web.
               *
               * Ahora es la frase y una flecha en un disco que SOBRESALE del
               * papel. Y sobresale a propósito: la gota que avisa está hundida,
               * ésta se levanta. Lo que se hunde es contenido, lo que sobresale
               * es acción — y al pulsarla se hunde, que es lo que hace un botón
               * de verdad.
               *
               * El precio no se pierde: está en la ficha de la consulta con
               * cuerpo de texto normal, y el chat lo dice en la primera
               * respuesta.
               */
              accion: (
                <button
                  type="button"
                  className="portada-cta"
                  onClick={abrirConsulta}
                  data-mag
                  data-cur-label={t.cbook}
                >
                  <span>{t.hcta}</span>
                  <i aria-hidden>→</i>
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* LA MARQUESINA DE DOCE NÚMEROS ESTABA AQUÍ, y se ha quitado.
          Ocupaba el sitio más caro de la página —entre el titular y el primer
          bloque de verdad— y no daba ni un motivo para seguir bajando. */}

      {/* ── EL DOLOR ─────────────────────────────────────────
          Anclado: la sección se queda quieta y cada frase se lee sola. Es el
          mejor texto que tiene la web y como lista pasaba desapercibido. */}
      <Anclado rotulo={t.p_lab} lineas={dolor} cierre={t.p_punch} />

      {/* ── HOLA, SOY IRIS ────────────────────────────────────
          El orden de la página es el de una conversación de verdad: primero el
          problema —la portada y las cuatro frases del bloque de arriba, donde
          la persona se reconoce— y SÓLO ENTONCES entra ella.

          Al revés no funciona: alguien presentándose antes de que le hayas
          dicho por qué te interesa es un folleto. Presentándose justo después
          de «y llevas años jurando que tú no ibas a ser así» es la respuesta a
          la pregunta que la persona acaba de hacerse.

          Y aquí el nombre gigante en versales que había —«IRIS / SOARES» de
          setenta píxeles— tampoco está: ocupaba el sitio de un titular y no
          decía nada. Ese sitio lo ocupa el saludo, que dice quién es Y a qué se
          dedica en la misma línea. */}
      <div id="hola" className="claro hola">
        <div className="hola-marco">
          <div className="hola-texto">
            <Aparece>
              <h2 className="hola-h">
                {t.w_hola}
                <br />
                <b>{t.w_oficio}</b>
              </h2>
            </Aparece>
            <Aparece retraso={1}>
              <p className="hola-p">{t.w_que}</p>
            </Aparece>
            <Aparece retraso={2}>
              {/* El mismo botón que la portada: la frase y una flecha en un
                  disco levantado del papel. Una sola forma de pedir en toda la
                  página, y se reconoce a la segunda vez que se ve. */}
              <button
                type="button"
                className="portada-cta"
                onClick={abrirConsulta}
                data-mag
                data-cur-label={t.cbook}
              >
                <span>{t.hcta}</span>
                <i aria-hidden>→</i>
              </button>
            </Aparece>
          </div>

          {/* El retrato, con su canto y sin degradados encima. Aquí va la foto
              y no el vídeo: en este bloque ella se PRESENTA, y una cara quieta
              mirándote es exactamente eso. El vídeo está donde toca decidir
              —justo encima del botón de reservar— porque ahí lo que hace falta
              es oírla, no verla. */}
          <Revelado className="hola-foto">
            <Foto
              src={FOTOS.hablando}
              alt="Iris Soares, en su consulta"
              ratio="4/5"
              radius="0"
              sizes="(max-width:900px) 100vw, 42vw"
              objectPosition="center 18%"
            />
          </Revelado>
        </div>
      </div>

      {/* ── QUÉ ES ESTO ──────────────────────────────────────
          El único sitio de la página donde se dice QUÉ ES esto. Y ahora es solo
          texto: la foto de las generaciones que iba al lado se ha ido a
          /numerologia, que es su casa.

          Dos motivos, y ninguno es que la foto estuviera mal. Uno: una cara a
          media pantalla al lado de la explicación se lleva la mirada entera y
          la explicación se salta, justo aquí, que es donde no puede saltarse.
          Dos: venía inmediatamente después del bloque de Iris, que también
          lleva foto — dos fotos seguidas a media pantalla y la página se lee
          como un catálogo.

          Lo que la acompaña ahora no compite: polvo dorado flotando muy
          despacio por detrás, y las palabras escribiéndose al ritmo al que se
          baja. El detalle está en components/QueEs.tsx. */}
      <QueEs titular={t.q_h} uno={t.q_p1} dos={t.q_p2} />

      {/* ── EL REGALO: LA SINERGIA, AQUÍ MISMO ───────────────
          Aquí estaba la calculadora del número personal. Se fue a /numerologia,
          que es su casa: en la portada había DOS cosas gratis y ése es justo el
          lío del que se quejaba Gerson — tantos servicios que la gente se
          pierde.

          Y en su sitio estuvo un rato un bloque con dos círculos vacíos y un
          botón que LLEVABA A OTRA PÁGINA. Duró lo que tardó en verlo: «no
          quiero que salga de la página». Tenía razón y por un motivo que no es
          de gusto — mandar a alguien a otra pantalla en mitad de una historia
          es perder la historia.

          Ahora la cuenta se hace aquí. Dos fechas, un botón, y el resultado
          debajo sin recargar ni navegar. Y los dos círculos, que eran adorno,
          se han convertido en el resultado: el número de cada uno en su lado y
          el del vínculo en la lente, que es literalmente donde va. Vacíos no se
          pintan, así que no hay ningún número de mentira en pantalla.

          El cálculo es el mismo módulo del que come /sinergia: mismos números y
          mismos textos, comprobados uno a uno contra esa página. Ni una
          interpretación inventada. */}
      <SinergiaAqui />

      {/* LAS TRES FOTOS SIN TEXTO ESTABAN AQUÍ. Un descanso visual en medio
          de una página de venta, y quien está decidiendo si se gasta 111 € no
          necesita descansar: necesita el siguiente motivo. Las buenas —el árbol
          en la pizarra y la cuenta a mano— vuelven donde prueban algo. */}

      {/* Aquí iba «TRES PASOS. SIN MISTERIO» con tres fichas numeradas: me das
          dos datos, preparo tu historia, nos vemos en directo. Fuera.

          Se pidió quitarlo y tenía razón: eran los pasos de la RESERVA disfrazados
          de método. Nadie entra a esta web preguntándose cómo se pide cita —eso lo
          contesta el botón de reservar, que está siempre a la vista— y ponerlo en
          un bloque a pantalla completa con su barra de progreso le daba el peso de
          lo que sí importa. Lo que de verdad se hace paso a paso ya está contado
          donde toca: la cuenta se ve en la portada, el temario en la ficha del
          curso y las capas del árbol en la landing de la comunidad. */}

      {/* ── LA CONSULTA ──────────────────────────────────────
          UN BOTÓN. NO DOS FICHAS CON PRECIO.

          Aquí había dos columnas, dos precios grandes, un tachado, un motivo de
          oferta y tres botones entre las dos. Es una tabla de tarifas puesta en
          medio de una historia — y le hace a la persona la pregunta equivocada:
          en vez de «¿quiero esto?», le pregunta «¿cuál de las dos y por cuánto?».
          Eso es una decisión de compra, y todavía no toca.

          Lo que toca aquí es una sola cosa: hablar con Iris. El precio lo dice
          el chat en la primera respuesta, y quien quiera verlo antes lo tiene
          escrito en las dos páginas que lo explican —numerología y Kábala—,
          enlazadas desde el pie y desde el propio texto. */}
      <div id="consultas" className="claro bloque-limpio" style={{ scrollMarginTop: 80 }}>
        <div className="cierre-marco">
        <div className="cierre-uno">
          <Aparece className="titular-seccion cierre-uno-h">{t.cu_h}</Aparece>
          <Aparece retraso={1}>
            <p className="cierre-uno-p">{t.cu_p}</p>
          </Aparece>
          <Aparece retraso={2}>
            <button
              type="button"
              className="portada-cta"
              onClick={abrirConsulta}
              data-mag
              data-cur-label={t.cbook}
            >
              <span>{t.hcta}</span>
              <i aria-hidden>→</i>
            </button>
          </Aparece>
          {/* Y las dos puertas para quien quiera leer antes de hablar. Como
              enlaces y no como botones: pesan menos que la acción de arriba, que
              es la que interesa. */}
          <Aparece retraso={3}>
            <p className="cierre-uno-puertas">
              <Link href="/numerologia" data-mag>
                {t.cu_num}
              </Link>
              <Link href="/kabala" data-mag>
                {t.cu_kab}
              </Link>
            </p>
          </Aparece>
        </div>

        {/*
            EL VÍDEO, JUSTO AQUÍ.
            ------------------------------------------------------------------
            Estaba en el bloque de «Hola, soy Iris», y allí sobraba: en ese
            bloque ella se presenta, y para presentarse basta una cara quieta
            mirándote.

            Aquí es otra cosa. Éste es el sitio donde la persona decide si paga
            o no, y lo último que necesita antes de decidir no es leer una frase
            más: es OÍRLA. Un minuto de alguien hablando hace más por una
            reserva que tres párrafos.

            No arranca solo —es voz, y un vídeo que se pone a hablar solo se
            cierra— así que hasta que se pulsa es su retrato con el botón. */}
        <Revelado className="cierre-video">
          <VideoPresenta
            src="/video/iris-presentacion.mp4"
            cartel="/images/iris-presentacion-cartel.jpg"
            etiqueta="Iris se presenta"
          />
        </Revelado>
        </div>
      </div>

      {/* ── DUDAS ────────────────────────────────────────────── */}
      <div id="dudas" className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,4vw,72px)', alignItems: 'start' }}>
          {/* El título se queda pegado arriba MIENTRAS haya dos columnas. En el
              móvil hay una sola, así que quedarse pegado significa quedarse
              encima de las preguntas: el rótulo «Dudas» y «Lo que me preguntan
              siempre» se leían pisados por «¿Las sesiones son online?». La clase
              apaga el sticky por debajo de 900 px. */}
          <div className="faq-titulo">
            <Aparece>
              <Rotulo claro>{t.f_lab}</Rotulo>
            </Aparece>
            <Aparece retraso={1} className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '13ch' }}>
              {t.f_h}
            </Aparece>
          </div>
          <Aparece>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {faqs.map(([q, a], i) => {
                const on = faq === i;
                return (
                  <div key={q} className="line-hover" style={{ borderTop: '1px solid var(--linea)', borderBottom: i === faqs.length - 1 ? '1px solid var(--linea)' : undefined }}>
                    {/* Un botón de verdad: se alcanza con el tabulador y se abre
                        con Intro o con la barra. `aria-expanded` es lo que le
                        dice a un lector de pantalla si está abierta o cerrada, y
                        `aria-controls` con qué respuesta va. */}
                    <button
                      type="button"
                      onClick={() => setFaq(on ? -1 : i)}
                      aria-expanded={on}
                      aria-controls={`duda-${i}`}
                      data-mag
                      className="duda-boton"
                    >
                      <span style={{ fontSize: 'var(--t-bloque)', fontWeight: 'var(--peso-medio)', letterSpacing: 'var(--esp-bloque)', textAlign: 'left' }}>{q}</span>
                      <span aria-hidden style={{ fontSize: 18, color: 'var(--acento)', flexShrink: 0 }}>{on ? '−' : '+'}</span>
                    </button>
                    <div id={`duda-${i}`} role="region" hidden={!on} style={{ overflow: 'hidden', transition: 'max-height .55s cubic-bezier(.16,1,.3,1),opacity .4s ease', maxHeight: on ? 240 : 0, opacity: on ? 1 : 0 }}>
                      <p style={{ margin: '0 0 24px', fontSize: 'var(--t-cuerpo)', lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '48ch' }}>{a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Aparece>
        </div>
      </div>

      {/* ── CIERRE ───────────────────────────────────────────── */}
      <div id="cita" className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(90px,12vw,170px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 26 }}>
          <Aparece className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '13ch' }}>
            {t.c_h}
          </Aparece>
          <Aparece retraso={1}>
            <p style={{ margin: 0, fontSize: 'var(--t-cuerpo)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '34ch' }}>{t.c_p}</p>
          </Aparece>
          {/* El mismo botón que la portada y que el saludo de Iris: una sola
              forma de pedir en toda la página. Y sin la línea del precio
              debajo — el precio está en la ficha de la consulta, con cuerpo de
              texto de verdad, y lo dice el chat en la primera respuesta. */}
          <Aparece retraso={2}>
            <button
              type="button"
              className="portada-cta portada-cta-oscuro"
              onClick={abrirConsulta}
              data-mag
              data-cur-label={t.cbook}
            >
              <span>{t.c_btn}</span>
              <i aria-hidden>→</i>
            </button>
          </Aparece>
        </div>
      </div>

      {/* ── PIE: el mapa de la web ───────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Marca tam={68} apilado />
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--tx-3)', maxWidth: '28ch' }}>{t.ft_p}</p>
            </div>
            {/*
                LOS LINKS DE INTERÉS.
                ----------------------------------------------------------------
                El menú de arriba se ha quedado en tres —Inicio, Talleres y la
                membresía— porque cinco puertas no son cinco opciones, son cinco
                motivos para no elegir ninguna.

                Pero nada se pierde: todo lo que salió del menú vive aquí. Y es
                el sitio correcto, no el cajón de sastre — al pie se llega
                después de haber leído, o sea buscando algo concreto, que es
                justo cuando «qué es la Kábala» deja de ser ruido y pasa a ser
                lo que uno quiere leer. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">{t.ft_start}</span>
              {/* Un <button>, no un <div>. Era un `div` con `onClick`: no lo
                  alcanzaba el tabulador, no lo activaba Intro y un lector de
                  pantalla lo leía como texto suelto — o sea, la primera línea
                  de «Empieza por aquí» no existía para quien no usa ratón. Y es
                  la que abre la reserva. */}
              <button type="button" onClick={abrirConsulta} data-mag className="pie-enlace pie-boton">
                {t.ft_1}
              </button>
              <Link href="/numerologia" data-mag className="pie-enlace">
                Qué es la numerología transgeneracional
              </Link>
              <Link href="/kabala" data-mag className="pie-enlace">
                Qué es la Kábala
              </Link>
              <Link href="/sinergia" data-mag className="pie-enlace">
                {t.ft_2}
              </Link>
              <Link href="/taller" data-mag className="pie-enlace">
                Taller gratis
              </Link>
              <Link href="/cursos" data-mag className="pie-enlace">
                {t.ft_3}
              </Link>
              <Link href="/membresia" data-mag className="pie-enlace">
                {t.ft_4}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">{t.ft_legal}</span>
              <Link href="/legal" data-mag className="pie-enlace">
                {t.ft_l1}
              </Link>
              <Link href="/privacidad" data-mag className="pie-enlace">
                {t.ft_l2}
              </Link>
              <a href={`mailto:${CONTACTO.email}`} data-mag className="pie-enlace">
                {t.ft_l3}
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>{t.ft_disc}</span>
            <span style={{ fontSize: 15, color: 'var(--tx-4)' }}>© 2026 · ES / PT / EN</span>
          </div>
        </div>
      </div>

      <ChatWidget ref={chatRef} />
      {/* Las frases que asoman por los márgenes mientras se baja. Van aquí, al
          final y fuera de todo: son de la página entera, no de ningún bloque. */}
      <Susurros />
    </div>
  );
}
