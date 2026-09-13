'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
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
import { useLang } from '@/lib/i18n';
import { CONTACTO, FOTOS, KABALA, MEMBRESIA, SESION, aniosDeConsulta, eur } from '@/content/site';
import Pendiente from '@/components/Pendiente';

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
  const abrirKabala = () => openChat('kabala');
  const [faq, setFaq] = useState(-1);

  /* El curso que sale en la ficha de la portada: el primero que tenga fecha de
     verdad. Sin ninguno, la ficha no se dibuja: es preferible un hueco a una
     fecha inventada. */

  /* La oferta de aniversario sólo se enseña si están LOS DOS datos: el precio
     rebajado y cuántas plazas quedan. Con uno solo saldría un número tachado
     sin motivo —o un motivo sin número— y las dos mitades son las que hacen
     que se entienda. Apagando cualquiera de los dos en content/site.ts, la
     ficha vuelve sola a enseñar el precio normal y nada más. */
  const ofertaViva = SESION.precioOferta != null && SESION.plazasOferta != null;
  const anios = aniosDeConsulta();

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
  const chips = [t.w1, t.w2, t.w3, t.w4, t.w5, t.w6];
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
        extra={[
          { href: '#consultas', label: 'La consulta' },
          { href: '#kabala', label: 'Qué es la Kábala' },
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
            <>
              <h1 className="portada-h1">
                {t.h1a}
                <br />
                <b>{t.h1b}</b>
              </h1>
              <span className="portada-baja">
                <i />
                {t.h1baja}
              </span>
            </>,
            <>
              <p className="portada-frase">{t.h1p1}</p>
              <p className="portada-apunte">{t.h1p1b}</p>
            </>,
            <>
              <p className="portada-frase">
                {t.h1p2} <b>{t.h1p2b}</b>
              </p>
              <div className="portada-cierre">
                <PillCTA onClick={abrirConsulta} variant="cream" label={t.hcta} curLabel={t.cbook} />
                <p className="hero-micro">
                  {ofertaViva
                    ? `${eur(SESION.precioOferta!)} las ${SESION.plazasOferta} primeras · después, ${eur(SESION.precio!)}`
                    : `${eur(SESION.precio!)}`}
                </p>
              </div>
            </>,
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

      {/* ── QUÉ ES ESTO ──────────────────────────────────────
          El bloque que faltaba, y llevaba faltando desde el principio: en toda
          la web no había una sola frase que dijera QUÉ ES la numerología
          transgeneracional. Se hablaba de lo que hace —«de dónde viene lo que
          se repite»— pero nunca de qué es, con lo cual quien llegaba sin saberlo
          seguía sin saberlo después de bajar la página entera.

          Va aquí, justo detrás del dolor, porque ése es el orden de una
          conversación: primero «a ver si te suena» y después «esto tiene
          nombre». Al revés es un folleto. */}
      <div className="claro bloque-limpio">
        <div className="limpio-dentro">
          <div className="limpio-texto">
            <Reveal className="titular-seccion limpio-h">{t.q_h}</Reveal>
            <Reveal delay={80}>
              <p className="limpio-p">{t.q_p1}</p>
            </Reveal>
            <Reveal delay={140}>
              <p className="limpio-p">{t.q_p2}</p>
            </Reveal>
          </div>
          {/* La foto, sin esquinas redondeadas y sin tarjeta: el radio es lo que
              convierte una imagen en una ficha, y en esta página ya no hay
              fichas. Y en vertical, que es como está tomada — recortada a
              panorámica se quedaba en dos caras y se perdía justo lo que
              cuenta: la fila repitiéndose hacia el fondo. */}
          <Reveal delay={180} className="limpio-foto">
            <Foto
              src={FOTOS.generaciones}
              alt="Una fila de hombres de distintas edades, uno detrás de otro, en la misma postura y con las mismas manos sobre la mesa, repitiéndose hacia el fondo"
              ratio="4/5"
              radius="0"
              sizes="(max-width:900px) 100vw, 40vw"
            />
          </Reveal>
        </div>
      </div>

      {/* ── TU NÚMERO ────────────────────────────────────────
          Aquí la web da antes de pedir: la cuenta es de verdad, es la misma
          que hace Iris, y se ve sin registrarse ni dejar el correo. */}
      {/* Arena y no blanco. El relieve de esta pieza se hace con luz, no con
          color: el fondo, las casillas y la tarjeta tienen que ser exactamente
          del mismo tono para que lo único que las separe sean las sombras. Sobre
          blanco, la tarjeta beige se leía como un rectángulo gris grande y medio
          vacío en mitad de la página. */}
      {/* En granate, no en arena. Es el único bloque de la portada donde la
          persona HACE algo —escribe su fecha y se lleva su número— y sobre el
          papel claro se leía como un párrafo más de los de alrededor. El
          granate lo saca de la página: se ve que ahí pasa otra cosa.

          Y de paso resuelve el vídeo: un reel con la luz que tiene, recortado
          sobre papel crema, se veía pegado; sobre el granate se integra. */}
      <div id="prueba" className="vino banda tn-banda" style={{ scrollMarginTop: 80 }}>
        <div className="banda-dentro">
          <TuNumero />
        </div>
      </div>

      {/* LAS TRES FOTOS SIN TEXTO ESTABAN AQUÍ. Un descanso visual en medio
          de una página de venta, y quien está decidiendo si se gasta 111 € no
          necesita descansar: necesita el siguiente motivo. Las buenas —el árbol
          en la pizarra y la cuenta a mano— vuelven donde prueban algo. */}

      {/* ── QUIÉN SOY ─────────────────────────────────────────
          EL RETRATO MANDA, Y EL NOMBRE ES LA PIEZA GRÁFICA.

          Antes era el bloque más convencional de la web: rótulo, titular,
          párrafo, foto pequeña al lado. Ahora está montado como la portada de
          una persona que se vende ella —que es lo que es—: fondo oscuro, el
          retrato a sangre ocupando media pantalla, y el nombre en versal muy
          espaciada por encima, del tamaño de un cartel.

          El nombre gigante ya estaba, pero de adorno y al 7 % de opacidad, o
          sea invisible. Aquí deja de ser marca de agua y pasa a ser la pieza
          que ordena el bloque: es lo primero que se ve y lo que dice de quién
          es esta web.

          En el móvil se apila —retrato arriba, texto debajo— porque un retrato
          a media pantalla en 390 px no deja sitio para nada más. */}
      <div className="vino quien" style={{ position: 'relative', zIndex: 3 }}>
        <div className="quien-marco">
          {/* La foto va primero en el orden del documento y a la derecha en el
              dibujo: en el móvil, que se apila, tiene que verse ANTES que el
              texto — es lo que hace que se lea como su portada. */}
          <div className="quien-retrato">
            <Revelado>
              <Foto
                src={FOTOS.hablando}
                alt="Iris Soares, en su consulta"
                ratio="4/5"
                radius="0"
                llenar
                sizes="(max-width:900px) 100vw, 46vw"
                /* El retrato es 9:16 y el marco 4:5, así que hay que decidir
                   qué se recorta: a 15 % la cabeza respira y lo que se va es
                   suelo, que no cuenta nada. */
                objectPosition="center 15%"
              />
            </Revelado>
            {/* Un velo por el lado del texto para que el nombre no se pise con
                la imagen cuando las dos columnas se tocan. */}
            <span className="quien-velo" aria-hidden />
          </div>

          <div className="quien-texto">
            <Reveal>
              {/* En dos líneas y no en una. A una sola, «IRIS SOARES» a este
                  cuerpo no cabe en su columna y se salía por la izquierda: la
                  primera palabra quedaba cortada. Partido, además, se parece
                  más a lo que es — un cartel. */}
              <span className="quien-nombre">
                Iris
                <br />
                Soares
              </span>
            </Reveal>
            <Reveal delay={60}>
              <span className="quien-oficio">{t.w_lab} · Numerología transgeneracional</span>
            </Reveal>

            <Reveal delay={120} className="quien-frase">
              {t.w_h}
            </Reveal>
            <Reveal delay={170}>
              <p className="quien-remate">{t.w_h2}</p>
            </Reveal>

            <Reveal delay={220}>
              <div className="quien-bio">
                <p>{t.w_p1}</p>
                <p>{t.w_p2}</p>
              </div>
            </Reveal>

            {/* LA CINTA DE SEIS DISCIPLINAS ESTABA AQUÍ —Derecho, Psicología,
                Psicosomática, Descodificación, Numerología, Transgeneracional—
                pasando en bucle como el teletipo de un canal de noticias.

                Fuera. Ya lo cuenta el párrafo de arriba con frases enteras, y
                seis pastillas girando solas debajo de un retrato es movimiento
                que no significa nada: la clase de adorno que hace que una web
                parezca de hace diez años. */}
          </div>
        </div>
      </div>

      {/* Aquí iba «TRES PASOS. SIN MISTERIO» con tres fichas numeradas: me das
          dos datos, preparo tu historia, nos vemos en directo. Fuera.

          Se pidió quitarlo y tenía razón: eran los pasos de la RESERVA disfrazados
          de método. Nadie entra a esta web preguntándose cómo se pide cita —eso lo
          contesta el botón de reservar, que está siempre a la vista— y ponerlo en
          un bloque a pantalla completa con su barra de progreso le daba el peso de
          lo que sí importa. Lo que de verdad se hace paso a paso ya está contado
          donde toca: la cuenta se ve en la portada, el temario en la ficha del
          curso y las capas del árbol en la landing de la comunidad. */}

      {/* ── LAS DOS CONSULTAS ────────────────────────────────
          El bloque que faltaba, y era el más importante que faltaba.

          Esta web contaba muy bien QUÉ pasa en una familia y QUIÉN es Iris, y
          después no decía en ninguna parte qué se compra ni cuánto cuesta.
          Había que llegar al chat para enterarse. Una web que esconde el precio
          no protege la venta: la retrasa hasta que la persona se cansa.

          Van las dos juntas y no en dos sitios distintos porque la pregunta
          real de quien llega no es «¿cuánto cuesta la consulta?», es «¿cuál de
          las dos es la mía?». Puestas al lado se contesta sola. */}
      <div id="consultas" className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: PAD, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3vw,44px)' }}>
          <Reveal>
            <Rotulo>La consulta</Rotulo>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(20px,3vw,48px)', alignItems: 'end' }}>
            <Reveal delay={60} className="titular-seccion" style={{ maxWidth: '15ch' }}>
              Contigo y con tu historia delante.
            </Reveal>
            <Reveal delay={120}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '42ch' }}>
                Online, con tu carta preparada antes de vernos. Sales sabiendo quién eres y qué decisión tomar hoy.
              </p>
            </Reveal>
          </div>

          <div className="consultas-rejilla">
            {/* ------------------------------------------- LA CONSULTA */}
            <Reveal delay={100} className="consulta-ficha consulta-ficha-alta">
              {ofertaViva && (
                <span className="consulta-chapa">
                  {SESION.plazasOferta} plazas · {anios} años de consulta
                </span>
              )}
              <h3 className="consulta-nombre">Consulta con Iris</h3>
              <p className="consulta-que">
                Numerología transgeneracional. Miramos de dónde viene lo que se repite en tu familia, en qué generación
                empezó y qué parte te toca soltar a ti.
              </p>
              <div className="consulta-precio">
                {ofertaViva ? (
                  <>
                    <b>{eur(SESION.precioOferta)}</b>
                    <s>{eur(SESION.precio)}</s>
                  </>
                ) : (
                  <b>{eur(SESION.precio)}</b>
                )}
              </div>
              {ofertaViva && (
                <p className="consulta-motivo">
                  Precio de aniversario, que cae en día 14. Son {SESION.plazasOferta} plazas, una por cada año de
                  consulta, y se acaba cuando se llenen.
                </p>
              )}
              <PillCTA onClick={abrirConsulta} variant="cream" label="Reservar mi consulta" curLabel={t.cbook} />
            </Reveal>

            {/* --------------------------------------- LA DE KÁBALA */}
            <Reveal delay={170} className="consulta-ficha">
              {/* Chapa también aquí. Sin ella las dos fichas empezaban a
                  distinta altura y el conjunto se leía torcido — y además la
                  vacía parecía la que sobra. Ésta va en tono neutro para que la
                  de las plazas siga siendo la que llama. */}
              <span className="consulta-chapa consulta-chapa-neutra">La más profunda</span>
              <h3 className="consulta-nombre">Consulta de Kábala</h3>
              <p className="consulta-que">
                La misma hora, leyendo tu carta con el Árbol de la Vida: los caminos que te tocan, los arcanos que los
                rigen y las cuentas que traes abiertas. Es la lectura más profunda de las dos.
              </p>
              <div className="consulta-precio">
                <b>{eur(KABALA.precio)}</b>
              </div>
              <p className="consulta-motivo">
                Para quien ya se ha mirado por dentro alguna vez y quiere ir al fondo.{' '}
                <Link href="#kabala" data-mag>
                  Qué es la Kábala →
                </Link>
              </p>
              <div className="consulta-kab-acciones">
                <PillCTA
                  onClick={abrirKabala}
                  variant="dark"
                  /* Sin el precio dentro: ya está en grande dos líneas más
                     arriba, y repetido aquí hacía un botón de cuarenta
                     caracteres que se comía la línea entera. */
                  label="Reservar la de Kábala"
                  curLabel={t.cbook}
                />
                {/* El bloque que explicaba la Kábala ya no está en la portada:
                    era pantalla y media contando el producto de 333 € a alguien
                    que aún no ha comprado el de 111 €. Aquí queda el enlace, y
                    lo pulsa quien lo necesita. */}
                <Link href="/kabala" data-mag className="hero-enlace">
                  ¿Qué es la Kábala? →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* AQUÍ ESTABAN LOS TESTIMONIOS, EL LANZAMIENTO DE LA COMUNIDAD Y LOS
          CURSOS. Los tres se han quitado de la portada, y por el mismo motivo:
          este tramo es el más caro de toda la página —la persona acaba de leer
          el precio— y los tres le daban algo que hacer que no es reservar.

          · Testimonios: eran seis de muestra, cada uno con la palabra
            «Ejemplo» encima, bajo el titular «Esto no lo digo yo.» Es decir,
            la sección de confianza diciendo que todavía no ha hablado nadie.
            Vuelven, y vuelven justo aquí, el día que haya tres comentarios de
            verdad del Instagram de Iris.
          · La comunidad: media pantalla para apuntarse a algo que no existe.
            Y peor: le da a quien estaba a punto de reservar una forma gratis de
            sentir que ya ha hecho algo. Está en el pie y su página sigue en pie.
          · Los cursos: son ocasionales y por definición no son el negocio. Su
            botón era una salida de la portada. También al pie. */}

      {/* EL BLOQUE ENTERO DE LA KÁBALA ESTABA AQUÍ —titular, árbol dibujado,
          cuatro fichas y botón— y se ha mudado a /kabala con todo dentro.

          Era pantalla y media explicando el producto de 333 € a alguien que
          todavía no ha decidido si compra el de 111 €. Información correcta en
          el momento equivocado, que es exactamente de lo que se quejaba Gerson:
          «hay tantos servicios que la gente se pierde».

          No se pierde nada: en el bloque de las consultas hay un enlace, en el
          pie otro, y los susurros siguen explicando el árbol, los veintidós
          senderos y el Tikun por el margen mientras se navega. */}

      {/* ── DUDAS ────────────────────────────────────────────── */}
      <div id="dudas" className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,4vw,72px)', alignItems: 'start' }}>
          {/* El título se queda pegado arriba MIENTRAS haya dos columnas. En el
              móvil hay una sola, así que quedarse pegado significa quedarse
              encima de las preguntas: el rótulo «Dudas» y «Lo que me preguntan
              siempre» se leían pisados por «¿Las sesiones son online?». La clase
              apaga el sticky por debajo de 900 px. */}
          <div className="faq-titulo">
            <Reveal>
              <Rotulo claro>{t.f_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '13ch' }}>
              {t.f_h}
            </Reveal>
          </div>
          <Reveal>
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
          </Reveal>
        </div>
      </div>

      {/* ── CIERRE ───────────────────────────────────────────── */}
      <div id="cita" className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(90px,12vw,170px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 26 }}>
          <Reveal className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '13ch' }}>
            {t.c_h}
          </Reveal>
          <Reveal delay={80}>
            <p style={{ margin: 0, fontSize: 'var(--t-cuerpo)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '34ch' }}>{t.c_p}</p>
          </Reveal>
          <Reveal delay={150}>
            <PillCTA onClick={abrirConsulta} variant="gold" label={t.c_btn} curLabel={t.cbook} />
          </Reveal>
          {/* El precio también aquí, y no sólo en la ficha de arriba. Este es el
              último botón de la página: quien llega hasta aquí ha bajado la web
              entera y lo justo es que no tenga que subir a buscar cuánto cuesta
              para decidirse. */}
          <Reveal delay={210}>
            <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>
              {ofertaViva ? (
                <>
                  {eur(SESION.precioOferta)} en vez de {eur(SESION.precio)} · son {SESION.plazasOferta} plazas
                </>
              ) : SESION.precio != null ? (
                <>{eur(SESION.precio)}</>
              ) : null}
              {' · '}
              {t.c_micro}
            </span>
          </Reveal>
        </div>
      </div>

      {/* ── PIE: el mapa de la web ───────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Marca tam={68} apilado />
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tx-3)', maxWidth: '28ch' }}>{t.ft_p}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--tx-4)' }}>{t.ft_start}</span>
              {/* Un <button>, no un <div>. Era un `div` con `onClick`: no lo
                  alcanzaba el tabulador, no lo activaba Intro y un lector de
                  pantalla lo leía como texto suelto — o sea, la primera línea
                  de «Empieza por aquí» no existía para quien no usa ratón. Y es
                  la que abre la reserva. */}
              <button
                type="button"
                onClick={abrirConsulta}
                data-mag
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  fontSize: 14,
                  color: 'var(--tx-2)',
                  cursor: 'pointer',
                }}
              >
                {t.ft_1}
              </button>
              <Link href="/sinergia" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_2}
              </Link>
              <Link href="/cursos" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_3}
              </Link>
              <Link href="/membresia" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_4}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--tx-4)' }}>{t.ft_legal}</span>
              <Link href="/legal" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l1}
              </Link>
              <Link href="/privacidad" data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l2}
              </Link>
              <a href={`mailto:${CONTACTO.email}`} data-mag style={{ fontSize: 14, color: 'var(--tx-2)' }}>
                {t.ft_l3}
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>{t.ft_disc}</span>
            <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>© 2026 · ES / PT / EN</span>
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
