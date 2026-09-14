'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
/* Antes `Reveal`, un fundido de duración fija. `Aparece` ata el movimiento a
   la rueda. Explicado en components/Aparece.tsx. */
import Aparece from '@/components/Aparece';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import ChatWidget from '@/components/ChatWidget';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import Pendiente, { Hueco } from '@/components/Pendiente';
import CursoDetalle from '@/components/CursoDetalle';
import CuentaAtras from '@/components/CuentaAtras';
import VideoPresenta from '@/components/VideoPresenta';
import Foto from '@/components/Foto';
import { CURSOS, MEMBRESIA, PENDIENTE, eur, falta, type Curso } from '@/content/site';

/** Texto real, o etiqueta roja si todavía está sin rellenar. */
function T({ v, style }: { v: string; style?: React.CSSProperties }) {
  if (falta(v)) return <Pendiente />;
  return <span style={style}>{v}</span>;
}

/**
 * La tarjeta de un curso en la página.
 *
 * Solo lo justo para decidir si te interesa: cuándo es, cómo se llama, qué te
 * llevas en una frase, cuánto falta y un botón. Todo el detalle —el vídeo, el
 * programa, para quién es, la reserva— vive en la ficha que abre ese botón.
 * Antes la página enseñaba también todo eso y encima el botón que lo abría: el
 * mismo contenido dos veces, y en el móvil quedaba un revoltijo sin jerarquía.
 */
function CursoBloque({ curso }: { curso: Curso }) {
  const [detalle, setDetalle] = useState(false);
  const sinFecha = falta(curso.fechas);

  return (
    <>
      {/* La tarjeta del curso no se movía en absoluto: era el único bloque
          grande de la web que aparecía de golpe. Se acerca en vez de subir
          porque es una ficha de producto —una cosa que se pone delante de ti—
          y porque lo de arriba y lo de abajo ya suben. */}
      <Aparece
        as="article"
        modo="escala"
        id={curso.id}
        className={`curso-card${curso.cartel ? ' curso-card-cartel' : ''}`}
        style={{ scrollMarginTop: 96 }}
      >
        {/* EL CARTEL, TAMBIÉN AQUÍ.
            En la portada ya se ve, pero quien llega directo a esta página
            —desde un enlace de Instagram, por ejemplo— no ha pasado por la
            portada y se encontraba la tarjeta con medio metro de blanco al
            lado de la lista. Un curso que se anuncia con un cartel tiene que
            enseñarlo donde se vende.

            Es un botón y no una imagen quieta: abre la misma ficha que «Ver el
            curso». Nadie mira un cartel y espera que no pase nada al tocarlo. */}
        {curso.cartel && (
          <button
            type="button"
            onClick={() => setDetalle(true)}
            className="curso-cartel"
            data-mag
            data-cur-label="Ver"
            aria-label={`Ver ${falta(curso.titulo) ? 'el curso' : curso.titulo}`}
          >
            <Foto src={curso.cartel} alt={`Cartel de ${curso.titulo}`} llenar radius={0} sizes="(max-width:1099px) 90vw, 240px" />
          </button>
        )}
        <div className="curso-texto">
          <div className="curso-cab">
            <span className="curso-eyebrow">Próximo curso</span>
            {sinFecha ? <Pendiente>Fechas por confirmar</Pendiente> : <span className="curso-fecha">{curso.fechas}</span>}
          </div>

          {falta(curso.titulo) ? (
            <div style={{ marginBottom: 22 }}>
              <Hueco lineas={2} alto={34} etiqueta="Falta el título" />
            </div>
          ) : (
            <h2 className="curso-titulo">{curso.titulo}</h2>
          )}
          {falta(curso.claim) ? (
            <Hueco lineas={2} alto={15} etiqueta="Falta la frase" />
          ) : (
            <p className="curso-claim">{curso.claim}</p>
          )}

          {/* LO QUE INCLUYE, AL LADO DEL PRECIO Y NO ESCONDIDO EN LA FICHA.
              Debajo del reclamo había medio metro de tarjeta vacía mientras el
              precio estaba solo en la columna de al lado, sin nada que lo
              sostuviera. Un número sin lista al lado se compara con cero; con
              la lista al lado se compara con lo que cuesta. */}
          {curso.incluye.length > 0 && (
            <ul className="curso-incluye">
              {curso.incluye.map((x) => (
                <li key={x}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4 12 5.5 5.5L20 6" />
                  </svg>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="curso-panel">
          {/* EL PRECIO, FUERA DE LA LISTA DE DATOS.
              Estaba en la tercera fila de un `dl`, del mismo tamaño que el
              horario, y así el número por el que se decide la compra pesaba lo
              mismo que un dato de agenda. Aquí manda: la cifra grande, el
              precio de antes pegado a ella y, debajo, lo que se ahorra — que
              es lo que de verdad se recuerda.

              Las dos cuentas salen de los dos precios, no escritas a mano: el
              día que cambie uno, el porcentaje y el ahorro cambian solos y no
              hay forma de que la página anuncie un descuento que no existe. */}
          {curso.precio === null ? (
            <div className="curso-oferta">
              <Pendiente>Precio por confirmar</Pendiente>
            </div>
          ) : (
            <div className="curso-oferta">
              {curso.precioAntes ? (
                <span className="oferta-badge">−{Math.round(((curso.precioAntes - curso.precio) / curso.precioAntes) * 100)} %</span>
              ) : null}
              <div className="oferta-fila">
                <b>{eur(curso.precio)}</b>
                {curso.precioAntes ? <s>{eur(curso.precioAntes)}</s> : null}
              </div>
              {curso.precioAntes ? (
                <span className="oferta-ahorro">Te ahorras {eur(curso.precioAntes - curso.precio)}</span>
              ) : null}
            </div>
          )}

          <dl className="curso-datos">
            <div>
              <dt>Duración</dt>
              <dd><T v={curso.duracion} /></dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd><T v={curso.horario} /></dd>
            </div>
          </dl>

          <div className="curso-pie">
            <CuentaAtras fechaISO={curso.fechaISO} abiertoDesdeISO={curso.inscripcionDesdeISO} compacto />
            <button onClick={() => setDetalle(true)} data-mag data-cur-label="Ver" className="pill pill-cream">
              <span>Ver el curso</span>
              <span className="pill-arrow">→</span>
            </button>
          </div>
        </div>
      </Aparece>

      <CursoDetalle curso={curso} abierto={detalle} onCerrar={() => setDetalle(false)} />
    </>
  );
}

/* La fecha en letra, sacada del dato. Escrita a mano se queda vieja en cuanto
   la fecha se mueva, y entonces la web anuncia un día y la cuenta atrás otro. */
const enLetra = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(
    new Date(iso.includes('T') ? iso : `${iso}T00:00:00`),
  );

export default function Cursos() {
  useSiteScroll();
  const abre = enLetra(MEMBRESIA.abreISO);
  /* El primero de la lista es el que se anuncia arriba. Si algún día no hay
     ninguno, el bloque de urgencia no se dibuja y la página sigue en pie. */
  const proximo = CURSOS[0];

  return (
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor hitSelector="[data-mag],a,input,label,[data-card]" />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav cta="La membresía" ctaHref="/membresia" extra={CURSOS.map((c) => ({ href: `#${c.id}`, label: falta(c.titulo) ? 'Próximo curso' : c.titulo }))} />

      {/* HERO */}
      <div className="claro" style={{ position: 'relative', color: 'var(--tx)', background: 'var(--bg)', padding: 'clamp(104px,16vh,170px) clamp(14px,3vw,36px) clamp(40px,5vw,70px)', overflow: 'hidden' }}>
        <CampoNumeros intensidad={0.7} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 55% at 12% 0%,rgba(200,163,92,.13),transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        {/*
            TODO LO QUE HACE FALTA PARA DECIDIR, EN LA PRIMERA PANTALLA.
            ------------------------------------------------------------------
            La versión anterior apilaba las cosas una debajo de otra: un titular
            de cuatro líneas ocupando media pantalla, una frase, y debajo un
            vídeo a todo lo ancho que ya se salía por abajo. Medido a 1440×900,
            lo único que se veía al entrar era el titular y un tercio del vídeo
            — ni la fecha, ni el precio, ni un botón.

            Y esa era la pantalla que iba a recibir a la gente que llegue de un
            anuncio, para un curso que empieza en menos de dos semanas.

            Ahora va en dos columnas: a la izquierda lo que hay que saber y lo
            que hay que pulsar, a la derecha la cara de Iris contándolo. Cabe
            todo de una vez. En el móvil se apila —titular, vídeo, datos— porque
            ahí la cara vende más que la ficha. */}
        <div className="cur-hero-dentro">
          <div className="cur-hero-texto">
            {/* Aquí iba el rótulo «CURSOS Y TALLERES EN DIRECTO» en versalitas.
                Fuera, como los otros siete de la web: no decía nada que el
                titular no diga ya, y ponía una línea de ruido delante. */}
            {/* LA CHAPA DE ARRIBA, CON EL PUNTO QUE LATE.
                Es la misma pieza que corona la página de la comunidad, y eso es
                lo que se buscaba: dos páginas distintas que se reconocen como de
                la misma casa. Aquí no dice «próximamente» — dice el día, que es
                el dato por el que se entra a esta página. */}
            {proximo && !falta(proximo.fechas) && (
              <Aparece className="cur-chapa">
                <i aria-hidden />
                {proximo.fechas}
              </Aparece>
            )}

            <Aparece as="h1" modo="letras" className="cur-h1" retraso={1}>
              Dos días que cambian la conversación en tu casa.
            </Aparece>
            <Aparece retraso={2}>
              <p className="cur-entrada">
                En directo y con tu caso encima de la mesa: sales sabiendo hacer las cuentas tú, no con apuntes.
              </p>
            </Aparece>

            {/*
                LOS DATOS, EN UNA FICHA HUNDIDA, Y NO EN UNA LISTA PELADA.

                Antes eran tres parejas `dt`/`dd` sueltas, una debajo de otra:
                CUÁNDO, HORARIO, SON, cada rótulo en versalitas del mismo tamaño
                que el dato. En un teléfono eso no se lee como la ficha de un
                curso — se lee como un formulario a medio rellenar, que es
                literalmente lo que Gerson vio.

                Ahora es una sola pieza hundida en la pared, con el rótulo a la
                izquierda y el dato a la derecha, separados por una raya de un
                píxel. La regla de la casa: lo que se hunde es contenido. Y de
                paso se lee como lo que es —la entrada de un curso— en vez de
                como una lista.

                Cada línea se dibuja sólo si existe: a un curso al que le falte
                el horario le falta esa línea, no le sale un hueco raro. */}
            {proximo && (
              <Aparece retraso={3}>
                <dl className="cur-ficha">
                  {!falta(proximo.fechas) && (
                    <div><dt>Cuándo</dt><dd>{proximo.fechas}</dd></div>
                  )}
                  {!falta(proximo.horario) && (
                    <div><dt>Horario</dt><dd>{proximo.horario}</dd></div>
                  )}
                  {!falta(proximo.duracion) && (
                    <div><dt>Son</dt><dd>{proximo.duracion}</dd></div>
                  )}
                </dl>
              </Aparece>
            )}

            {/* EL PRECIO Y EL BOTÓN, JUNTOS Y EN EL MISMO RENGLÓN. Separados,
                el precio se lee como un dato más; pegado al botón es la última
                cosa que se mira antes de pulsar, que es donde tiene que estar. */}
            {proximo && (
              <Aparece retraso={4}>
                <div className="cur-cerrar">
                  {proximo.precio != null && (
                    <span className="cur-precio">
                      <b>{eur(proximo.precio)}</b>
                      {proximo.precioAntes != null && (
                        <span className="cur-precio-antes">
                          <s>{eur(proximo.precioAntes)}</s>
                          {/* El porcentaje sale de los dos números, no escrito a
                              mano: el día que cambie el precio, el descuento
                              cambia solo y no hay manera de que la página
                              anuncie una rebaja que no existe. */}
                          <b>−{Math.round(((proximo.precioAntes - proximo.precio) / proximo.precioAntes) * 100)} %</b>
                        </span>
                      )}
                    </span>
                  )}
                  <a href={`#${proximo.id}`} data-mag data-cur-label="Ver" className="portada-cta cta-solida cur-boton">
                    <span>Ver el curso y apuntarme</span>
                    <i aria-hidden>↓</i>
                  </a>
                </div>
              </Aparece>
            )}

            {proximo?.fechaISO && (
              <Aparece retraso={5}>
                <div className="cur-reloj">
                  <CuentaAtras fechaISO={proximo.fechaISO} abiertoDesdeISO={proximo.inscripcionDesdeISO} compacto />
                </div>
              </Aparece>
            )}
          </div>

          {/* El vídeo se acerca. Es la cara de Iris: subiendo se lee como una
              fila más de la ficha de al lado, acercándose se lee como que se
              pone delante. */}
          <Aparece modo="escala" retraso={2} className="cur-hero-video">
            <VideoPresenta
              src="/video/iris-presentacion.mp4"
              cartel="/images/iris-presentacion-cartel.jpg"
              etiqueta="Que te lo cuente Iris"
            />
          </Aparece>
        </div>
      </div>

      {/* Las tarjetas van sobre arena: es lo que separa "el cartel de la página"
          de "los cursos", sin necesidad de una línea ni de un titular más. */}
      <div className="arena banda">
        <div className="banda-dentro" style={{ display: 'grid', gap: 'clamp(16px,2.2vw,26px)' }}>
          <Aparece style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--t-bloque)', fontWeight: 'var(--peso-medio)', letterSpacing: '-.025em' }}>
              Lo que hay abierto ahora
            </h2>
            <span style={{ fontSize: 15, color: 'var(--tx-2)' }}>
              {CURSOS.length === 1 ? '1 convocatoria' : `${CURSOS.length} convocatorias`}
            </span>
          </Aparece>
          {CURSOS.map((curso) => (
            <CursoBloque key={curso.id} curso={curso} />
          ))}
        </div>
      </div>

      {/* PUENTE A LA MEMBRESÍA + FOOTER */}
      <div className="claro banda banda-corta">
        <div className="banda-dentro" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(34px,5vw,56px)' }}>
          {/* El único bloque de granate de la página: es el cierre, y por eso
              es el que pesa. Al llevar la clase, dentro de él los colores se
              recalculan solos y nada hereda la tinta oscura de fuera. */}
          <Aparece
            modo="escala"
            className="vino"
            style={{
              display: 'grid',
              gap: 'clamp(20px,2.6vw,44px)',
              alignItems: 'center',
              borderRadius: 'var(--radio)',
              padding: 'clamp(26px,3.4vw,44px)',
            }}
          >
            <div className="puente-caja">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="espaciado" style={{ fontSize: 15, fontWeight: 700, color: 'var(--acento)' }}>La membresía</span>
                <span style={{ fontSize: 'var(--t-bloque)', fontWeight: 'var(--peso-medio)', letterSpacing: '-.025em', lineHeight: 1.1, maxWidth: '26ch', textWrap: 'balance' }}>
                  Un curso son dos días. La comunidad es cada mes.
                </span>
                {/* Aquí iba el precio de la lista. La membresía ya no cobra
                    nada —es un próximamente— así que el argumento deja de ser
                    «entra por la mitad» y pasa a ser el único que queda en pie:
                    que te avisan a ti antes que a nadie. Prometer un precio que
                    ya no existe sería lo peor que puede hacer esta línea. */}
                <span style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '40ch' }}>
                  Abre el {abre}, y abre pequeña. Deja tu correo y te aviso antes que a nadie.
                </span>
              </div>
              <Link href="/membresia" data-mag data-cur-label="Ver" className="pill pill-cream">
                <span>Avisadme cuando abra</span>
                <span className="pill-arrow">→</span>
              </Link>
            </div>
          </Aparece>
          {/* El pie también entra: es lo último de la página, y ahí es donde
              este patrón suele dejar contenido a media opacidad para siempre
              porque ya no queda scroll con el que terminar de subirlo. El
              componente lo resuelve recortando el recorrido por lo que queda. */}
          <Aparece style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                <Marca tam={52} apilado />
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link href="/sinergia" style={{ fontSize: 15, color: 'var(--tx-2)' }}>Prueba gratis</Link>
                <Link href="/membresia" style={{ fontSize: 15, color: 'var(--tx-2)' }}>La membresía</Link>
                <Link href="/#cita" style={{ fontSize: 15, color: 'var(--tx-2)' }}>Sesión con Iris</Link>
              </div>
              <span style={{ display: 'flex', gap: 14, fontSize: 15, marginBottom: 4 }}>
              <Link href="/legal" style={{ color: 'var(--tx-2)' }}>Aviso legal</Link>
              <Link href="/privacidad" style={{ color: 'var(--tx-2)' }}>Tus datos</Link>
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>
                Los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
              </span>
            </div>
            <span style={{ fontSize: 15, color: 'var(--tx-4)' }}>© 2026 · Cursos</span>
          </Aparece>
        </div>
      </div>
      {/* EL CHAT, TAMBIÉN AQUÍ.
          Estaba sólo en la portada, y es la única forma de reservar una sesión
          en toda la web: quien entra directo a esta página desde una búsqueda o
          desde un enlace compartido no tenía dónde reservar sin volver al
          principio. */}
      <ChatWidget />
    </div>
  );
}
