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
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
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
function Rotulo({ children, claro = false, className = '' }: { children: React.ReactNode; claro?: boolean; className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>
      <span className="rotulo-linea" style={{ width: 22, height: 1, background: 'currentColor', opacity: 0.5 }} />
      <span>{children}</span>
    </div>
  );
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
  const openChat = () => chatRef.current?.open();
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
        onCta={openChat}
        conIdiomas
        extra={[
          { href: '#consultas', label: 'La consulta' },
          { href: '#kabala', label: 'Qué es la Kábala' },
          { href: '#prueba', label: t.n1 },
          { href: '#dudas', label: 'Dudas' },
        ]}
      />

      {/* ── APERTURA ─────────────────────────────────────────── */}
      {/* Manda el retrato, con dos fichas apoyadas en su borde. El bloque ya no
          pide una pantalla entera de alto: pedirla empujaba los botones por
          debajo del borde, así que lo primero que veía quien entraba era un
          titular enorme y ninguna forma de hacer nada con él. */}
      <div id="top" className="claro hero-lleno">
        <CampoNumeros intensidad={0.7} />
        <div id="glow" style={{ position: 'absolute', width: 900, height: 900, left: 0, top: 0, margin: '-450px 0 0 -450px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,163,92,.16),transparent 66%)', pointerEvents: 'none', transition: 'opacity .6s ease' }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: ANCHO, margin: '0 auto', width: '100%' }}>
          <div className="hero-rejilla hero-solo">
            <div className="hero-texto" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.8vw,36px)' }}>
              <Reveal>
                <Rotulo className="rotulo-hero">{t.kick}</Rotulo>
              </Reveal>
              {/* Una sola voz y un solo tamaño. El giro lo marca el color, no un
                  cuerpo cuatro veces mayor ni una cursiva: en dos tamaños tan
                  distintos la frase se partía en dos y ocupaba siete renglones. */}
              {/* Palabra a palabra. Un titular que aparece de golpe se lee como
                  una imagen; apareciendo por palabras se lee como alguien que
                  está diciendo la frase, que es lo que es. */}
              {/* Cada frase en su renglón. Fluían seguidas y el reparto de
                  líneas dejaba la «Y» sola al final de la segunda: la frase se
                  partía en el peor sitio posible y se leía a trompicones. Con
                  una frase por bloque, cada una se equilibra sola (text-wrap:
                  balance) y el corte cae donde lo pondría cualquiera. */}
              <h1 className="titular-portada" style={{ margin: 0 }}>
                <Palabras retraso={0.1} className="titular-frase">
                  {t.h1a}
                </Palabras>
                <Palabras
                  retraso={0.1 + t.h1a.split(' ').length * 0.055}
                  className="titular-frase"
                  style={{ color: 'var(--acento)' }}
                >
                  {t.h1b}
                </Palabras>
              </h1>
              {/* Aquí iba «Te enseño de dónde viene lo que se repite. Y cómo
                  se corta.» Fuera: la portada se queda en UNA frase.

                  Y no se pierde nada. Lo que hacía esa línea —decir qué se
                  vende— lo dice ahora el bloque de las dos consultas, con su
                  precio delante, que es donde de verdad se decide. En la
                  portada sólo quedan la frase y los dos botones. */}
              <Reveal delay={220}>
                <div className="hero-botones">
                  <PillCTA onClick={openChat} variant="cream" label={t.hcta} curLabel={t.cbook} />
                  <Link href="#prueba" data-mag className="btn-outline">
                    {t.hcta2}
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* AQUÍ ESTABA EL CARTEL DEL PRÓXIMO CURSO, y se ha quitado a
                petición de Gerson: la portada se queda con una frase y dos
                botones, sin nada más que mirar.

                No desaparece de la web — sigue entero en /cursos, y la portada
                lleva a esa página desde el menú, desde el bloque de cursos de
                más abajo y desde el pie. Lo que cambia es que ya no compite con
                el titular en la primera pantalla.

                Si algún día se quiere de vuelta, está en el historial: era un
                <Link> a /cursos#id con la imagen a sangre y el nombre y las
                fechas dentro, como el cartel de una película. */}
          </div>
        </div>
      </div>

      {/* ── LA MARQUESINA ────────────────────────────────────
          Los números con los que se trabaja, pasando sin parar. No es
          decoración de relleno: son las doce cifras del oficio, y del 11, 22
          y 33 sale el nombre de la escuela. */}
      <div className="claro banda-filete" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: '16px 0' }}>
        <Marquesina segundos={58}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'].map((n) => (
            <span
              key={n}
              /* De cifras de cuarenta y dos píxeles en negrita a una tira
                 discreta. Doce números gigantes en fila no son un detalle de
                 la casa: son una valla publicitaria, y era lo primero que se
                 veía después del titular. */
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'clamp(22px,3vw,44px)',
                paddingRight: 'clamp(22px,3vw,44px)',
                fontSize: 'clamp(15px,1.5vw,20px)',
                fontWeight: 'var(--peso-fino)',
                letterSpacing: '.02em',
                color: ['11', '22', '33'].includes(n) ? 'var(--acento)' : 'var(--tx-4)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {n}
              <span aria-hidden style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--linea-2)' }} />
            </span>
          ))}
        </Marquesina>
      </div>

      {/* ── TU NÚMERO ────────────────────────────────────────
          Aquí la web da antes de pedir: la cuenta es de verdad, es la misma
          que hace Iris, y se ve sin registrarse ni dejar el correo. */}
      {/* Arena y no blanco. El relieve de esta pieza se hace con luz, no con
          color: el fondo, las casillas y la tarjeta tienen que ser exactamente
          del mismo tono para que lo único que las separe sean las sombras. Sobre
          blanco, la tarjeta beige se leía como un rectángulo gris grande y medio
          vacío en mitad de la página. */}
      <div id="prueba" className="arena banda" style={{ scrollMarginTop: 80 }}>
        <div className="banda-dentro">
          <TuNumero />
        </div>
      </div>

      {/* ── FRANJA DE IMÁGENES: sin una palabra ───────────────
          Cada foto se destapa de abajo arriba mientras por dentro se encoge:
          dos velocidades en la misma pieza, que es lo que se lee como
          profundidad y no como una cortina. Y las tres se mueven a ritmos
          distintos al pasar, así la fila deja de ser una fila. */}
      <div className="claro banda">
        <div className="banda-dentro franja">
          <Paralaje cantidad={54}>
            <Revelado className="franja-foto">
              <Foto
                src={FOTOS.arbolPizarra}
                alt="Unas manos dibujando con tiza, en una pizarra pequeña, el árbol de la vida con sus números"
                ratio="3/4"
                radius="var(--radio)"
                sizes="(max-width:900px) 100vw, 30vw"
              />
            </Revelado>
          </Paralaje>
          <Paralaje cantidad={-22}>
            <Revelado className="franja-foto" retraso={0.12}>
              {/* Cuadrada porque la foto es apaisada: en el 3/4 de las otras dos
                  se le iría la mitad del papel, que es lo único que hay que ver. */}
              <Foto
                src={FOTOS.laCuenta}
                alt="Una fecha escrita a mano en un papel, sumada cifra a cifra hasta un solo número, con el resultado rodeado"
                ratio="1/1"
                radius="var(--radio)"
                sizes="(max-width:900px) 100vw, 30vw"
              />
            </Revelado>
          </Paralaje>
          <Paralaje cantidad={78}>
            <Revelado className="franja-foto" retraso={0.24}>
              <Foto
                src={FOTOS.cristales}
                alt="Cuarzos y velas encendidas sobre el agua, al amanecer"
                ratio="3/4"
                radius="var(--radio)"
                sizes="(max-width:900px) 100vw, 30vw"
              />
            </Revelado>
          </Paralaje>
        </div>
      </div>

      {/* ── EL DOLOR ─────────────────────────────────────────
          Anclado: la sección se queda quieta y cada frase se lee sola. Es el
          mejor texto que tiene la web y como lista pasaba desapercibido. */}
      <Anclado rotulo={t.p_lab} lineas={dolor} cierre={t.p_punch} />

      {/* ── POR QUÉ PASA ─────────────────────────────────────── */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,84px)', alignItems: 'center' }}>
          <Reveal>
            <div data-par="-.04">
              <Foto
                src={FOTOS.generaciones}
                alt="Una fila de hombres de distintas edades, uno detrás de otro, en la misma postura y con las mismas manos sobre la mesa, repitiéndose hacia el fondo"
                ratio="4/5"
                radius="var(--radio)"
                sizes="(max-width:900px) 100vw, 42vw"
              />
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.4vw,28px)' }}>
            <Reveal>
              <Rotulo>{t.b_lab}</Rotulo>
            </Reveal>
            <Reveal delay={70} className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '14ch' }}>
              {t.b_h}
            </Reveal>
            <Reveal delay={140}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '40ch' }}>{t.b_p1}</p>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.65, color: 'var(--tx)', maxWidth: '40ch', borderLeft: '2px solid #C89B4A', paddingLeft: 20 }}>{t.b_p2}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── QUIÉN SOY ────────────────────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(70px,9vw,120px) clamp(16px,4vw,56px) clamp(76px,10vw,150px)', overflow: 'hidden' }}>
        {/* Su nombre a lo ancho de la sección, muy tenue: firma la página sin
            gastar una línea de texto. Aquí sí hay aire para que respire. */}
        <div aria-hidden style={{ maxWidth: ANCHO, margin: '0 auto clamp(-14px,-1.4vw,-30px)', pointerEvents: 'none' }}>
          <span className="display" style={{ display: 'block', fontSize: 'clamp(54px,11vw,168px)', lineHeight: 0.9, letterSpacing: '-.02em', whiteSpace: 'nowrap', color: 'var(--tx)', opacity: 0.07 }}>
            Iris Soares
          </span>
        </div>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,84px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,26px)' }}>
            <Reveal>
              <Rotulo>{t.w_lab}</Rotulo>
            </Reveal>
            {/* La frase de Iris va partida en dos, y no por capricho: entera y
                a cuerpo de titular ocupaba cinco renglones y se comía el bloque
                — un titular de cinco líneas deja de ser un titular. Partida, la
                primera mitad dice qué hace y la segunda, en dorado, dice a
                dónde va. No se pierde ni una palabra. */}
            <Reveal delay={70} className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '17ch' }}>
              {t.w_h}
            </Reveal>
            <Reveal delay={110}>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 'var(--t-entrada)',
                  lineHeight: 1.4,
                  color: 'var(--acento)',
                  maxWidth: '24ch',
                }}
              >
                {t.w_h2}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 'var(--t-cuerpo)', lineHeight: 1.65, color: 'var(--tx-2)', maxWidth: '42ch' }}>
                <p style={{ margin: 0 }}>{t.w_p1}</p>
                <p style={{ margin: 0 }}>{t.w_p2}</p>
              </div>
            </Reveal>
            {/* Las seis disciplinas, en cinta continua. Apiladas ocupaban tres
                renglones y se leían como una lista de la compra; pasando, se
                leen de un vistazo y ocupan una línea. Se desvanecen por los dos
                lados en vez de cortarse contra el borde: una palabra partida a
                la mitad se lee como un fallo, y desvanecida se lee como que la
                cinta sigue. */}
            <Reveal delay={200}>
              <div className="cinta-chips">
                <Marquesina segundos={34}>
                  {chips.map((c) => (
                    <span key={c} className="chip chip-cinta">
                      {c}
                    </span>
                  ))}
                </Marquesina>
              </div>
            </Reveal>
          </div>
          {/*
            LA FOTO DE «QUIÉN SOY», MÁS PEQUEÑA Y CON AIRE ALREDEDOR.

            Estaba a 1/1 y al ancho entero de su columna. En un móvil eso son
            390 px de cara: un primerísimo plano recortado por arriba y por
            abajo que, tan cerca, no da cercanía — da apuro. Y el cuadrado se
            comía la sala del fondo, que es justo lo que dice que está
            trabajando.

            Ahora es un retrato 4/5, más chico que su columna, y se ve la sala
            llena detrás. Se lee como «aquí está ella, dando una formación» y no
            como una foto de carné gigante.

            Y se mueve al pasar: se destapa de abajo arriba mientras va más
            despacio que la página. Es la misma pareja de gestos que la franja
            de fotos de más arriba — se usa lo que ya existe en la casa en vez
            de inventar otra animación distinta para esta foto sola.
          */}
          <Paralaje cantidad={30} className="quien-foto">
            <Revelado>
              <Foto
                src={FOTOS.hablando}
                alt="Iris Soares, en su consulta"
                ratio="4/5"
                radius="var(--radio)"
                sizes="(max-width:900px) 66vw, 340px"
                /* El retrato es 9:16 y el marco 4:5, así que hay que decidir qué
                   se recorta. A 26 % la coronilla quedaba pegada al borde de
                   arriba; a 15 % la cabeza respira y lo que se va es suelo, que
                   no cuenta nada. */
                objectPosition="center 15%"
              />
            </Revelado>
          </Paralaje>
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
              Una hora contigo y con tu historia delante.
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
              <PillCTA onClick={openChat} variant="cream" label="Reservar mi consulta" curLabel={t.cbook} />
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
              <PillCTA onClick={openChat} variant="dark" label="Reservar la de Kábala" curLabel={t.cbook} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── LO QUE LE ESCRIBEN ────────────────────────────────
          La prueba va aquí, justo antes de las tres cosas que se piden
          —comunidad, cursos, sesión—: primero se enseña que hay gente detrás y
          después se pide algo. Al revés no funciona. */}
      <div className="arena banda">
        <div className="banda-dentro">
          <Testimonios />
        </div>
      </div>

      {/* ── EL LANZAMIENTO DE LA COMUNIDAD ───────────────────────
          Es un lanzamiento, así que este bloque lleva una fecha y una cuenta,
          no una foto. Donde iba la foto de sala —que no existe: salía el hueco
          rojo de FOTO PENDIENTE, y era lo primero que se veía en el bloque que
          más tiene que vender— va ahora la cuenta atrás.

          El orden de la columna de la derecha cambia con esa idea: primero el
          precio de la lista, que es la razón concreta para apuntarse hoy y no
          en noviembre, y después el botón. Antes el precio iba enterrado entre
          el párrafo y el botón, en un cuerpo más pequeño que el titular. */}
      <div id="lista-espera" className="vino lanz-bloque" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD, scrollMarginTop: 80, overflow: 'hidden' }}>
        {/* Las cifras flotando, aquí más marcadas que en la portada.
            Son las mismas —11, 22, 33, 3, 7, 9— y del mismo dorado; lo que
            cambia es que sobre el granate ese dorado aguanta el doble de
            intensidad sin gritar, mientras que sobre el papel claro de arriba a
            0,7 ya se lee como tinta. La densidad también baja: un bloque de
            media pantalla con la misma cantidad de cifras que una portada
            entera se llena de ruido. */}
        <CampoNumeros intensidad={1.7} densidad={150_000} />
        <div className="lanz-rejilla" style={{ position: 'relative', zIndex: 2, maxWidth: ANCHO, margin: '0 auto' }}>
          <Lanzamiento abreISO={MEMBRESIA.abreISO} desdeISO={MEMBRESIA.listaDesdeISO} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2vw,24px)' }}>
            <Reveal>
              <Rotulo claro>{t.wl_lab}</Rotulo>
            </Reveal>
            {/* A 15ch el titular se partía en cuatro renglones y dejaba
                «Cambiarlo» solo en uno. */}
            <Reveal delay={70} className="titular-seccion" style={{ maxWidth: '19ch' }}>
              {t.wl_h}
            </Reveal>
            <Reveal delay={130}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '36ch' }}>{t.wl_p}</p>
            </Reveal>

            {/* AQUÍ IBA EL PRECIO, EN GRANDE. Ya no hay precio que enseñar: la
                membresía es un próximamente y no se cobra nada, así que un
                panel con un número tachado sería mentir en el sitio donde más
                se mira. En su lugar va lo único que se pide —el correo— dicho
                como lo que es: un aviso, no una compra.

                Si algún día vuelve a haber precio, el panel está en el
                historial y `MEMBRESIA.precioReserva` lo enciende otra vez. */}
            <Reveal delay={180}>
              <div className="lanz-aviso">
                <span className="rotulo-dato">Las primeras</span>
                <span className="lanz-aviso-txt">
                  Abre pequeña, y las primeras deciden conmigo qué se trabaja cada mes. Déjame tu correo y te escribo yo
                  antes que a nadie.
                </span>
              </div>
            </Reveal>

            <Reveal delay={230}>
              <PillCTA href="/membresia" variant="dark" label={t.wl_cta} curLabel={t.csee} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── QUÉ ES LA KÁBALA ─────────────────────────────────
          La web vendía una consulta de Kábala y no explicaba en ninguna parte
          qué es la Kábala. Quien no lo sepa —que es casi todo el mundo— no
          compra la más cara de las dos: no por el precio, sino porque no sabe
          qué está comprando.

          Y se cuenta como lo que es en esta casa: una herramienta de
          autoconocimiento, no una religión ni una cosa de iniciados. Las cuatro
          piezas de abajo son las cuatro que Iris usa de verdad en una consulta
          —el árbol, los senderos, los caminos y el Tikun—, así que quien lea
          esto reconoce después lo que ve en pantalla. */}
      <div id="kabala" className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD, scrollMarginTop: 80, overflow: 'hidden' }}>
        <CampoNumeros intensidad={1.5} densidad={150_000} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3vw,44px)' }}>
          <Reveal>
            <Rotulo claro>Qué es la Kábala</Rotulo>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(20px,3vw,48px)', alignItems: 'end' }}>
            <Reveal delay={60} className="titular-seccion" style={{ maxWidth: '16ch' }}>
              Un mapa de ti que tiene tres mil años.
            </Reveal>
            <Reveal delay={120}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '44ch' }}>
                «Kábala» significa <i>recibir</i>. No es una religión ni hay que creer en nada: es una forma de leer
                cómo está montada una persona por dentro, y por dónde le entra y le sale la vida.
              </p>
            </Reveal>
          </div>

          <div className="kab-rejilla">
            {[
              {
                n: '10',
                t: 'El Árbol de la Vida',
                p: 'Diez estaciones por las que pasa todo lo que te ocurre, desde que lo piensas hasta que lo haces. Es el plano de la casa.',
              },
              {
                n: '22',
                t: 'Los senderos',
                p: 'Los caminos que unen esas diez estaciones. Cada uno tiene su arcano, y en tu carta se encienden los que te tocan.',
              },
              {
                n: '3',
                t: 'Tus tres caminos',
                p: 'De dónde vienes, qué has venido a transformar y hacia dónde vas. Salen de tu fecha, y son los que se leen en la consulta.',
              },
              {
                n: 'תיקון',
                t: 'El Tikun',
                p: 'La palabra que sostiene todo esto: rectificación. Lo que se hereda no se aguanta — se repara y se devuelve a su sitio.',
              },
            ].map((k, i) => (
              <Reveal key={k.t} delay={100 + i * 60} className="kab-ficha">
                <span className="kab-num">{k.n}</span>
                <h3 className="kab-tit">{k.t}</h3>
                <p className="kab-txt">{k.p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={340}>
            <div className="kab-pie">
              <p>
                En consulta esto no se explica: se dibuja delante de ti con tu nombre y tu fecha, y sales con el mapa en
                la mano.
              </p>
              <PillCTA
                onClick={openChat}
                variant="gold"
                label={`Reservar la consulta de Kábala · ${eur(KABALA.precio)}`}
                curLabel={t.cbook}
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── CURSOS ───────────────────────────────────────────── */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: PAD }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3vw,40px)' }}>
          <Reveal>
            <Rotulo>{t.e_lab}</Rotulo>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(24px,3vw,56px)', alignItems: 'end' }}>
            <Reveal delay={60} className="display" style={{ fontSize: 'var(--t-seccion)', maxWidth: '13ch' }}>
              {t.e_h}
            </Reveal>
            <Reveal delay={140} style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
              <p style={{ margin: 0, fontSize: 'var(--t-cuerpo)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '32ch' }}>{t.e_sub}</p>
              <PillCTA href="/cursos" variant="cream" label={t.e_cta} curLabel={t.csee} />
            </Reveal>
          </div>
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
            <PillCTA onClick={openChat} variant="gold" label={t.c_btn} curLabel={t.cbook} />
          </Reveal>
          {/* El precio también aquí, y no sólo en la ficha de arriba. Este es el
              último botón de la página: quien llega hasta aquí ha bajado la web
              entera y lo justo es que no tenga que subir a buscar cuánto cuesta
              para decidirse. */}
          <Reveal delay={210}>
            <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>
              {ofertaViva ? (
                <>
                  {eur(SESION.precioOferta)} en vez de {eur(SESION.precio)} · quedan {SESION.plazasOferta} plazas
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
                onClick={openChat}
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
    </div>
  );
}
