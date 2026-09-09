'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import Pendiente, { Hueco } from '@/components/Pendiente';
import CursoDetalle from '@/components/CursoDetalle';
import CuentaAtras from '@/components/CuentaAtras';
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
      <article
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
      </article>

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
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(20px,2.4vw,30px)' }}>
          <Reveal>
            <div className="espaciado" style={{ fontSize: 11, fontWeight: 700, color: 'var(--acento)' }}>Cursos y talleres en directo</div>
          </Reveal>
          <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'var(--t-portada)', fontWeight: 'var(--peso-fino)', lineHeight: 1.0, letterSpacing: '-.03em', maxWidth: '15ch', textWrap: 'balance' }}>
            Dos días que cambian la conversación en tu casa.
          </Reveal>
          <Reveal delay={140}>
            <p style={{ margin: 0, fontSize: 'var(--t-entrada)', fontWeight: 300, lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '44ch' }}>
              En directo y con tu caso encima de la mesa: sales sabiendo hacer las cuentas tú, no con apuntes.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <a href={`#${CURSOS[0]?.id ?? 'proximo'}`} data-mag data-cur-label="Ver" className="pill pill-cream" style={{ alignSelf: 'flex-start' }}>
              <span>Ver el próximo</span>
              <span className="pill-arrow">↓</span>
            </a>
          </Reveal>
        </div>
      </div>

      {/* Las tarjetas van sobre arena: es lo que separa "el cartel de la página"
          de "los cursos", sin necesidad de una línea ni de un titular más. */}
      <div className="arena banda">
        <div className="banda-dentro" style={{ display: 'grid', gap: 'clamp(16px,2.2vw,26px)' }}>
          <Reveal style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--t-bloque)', fontWeight: 'var(--peso-medio)', letterSpacing: '-.025em' }}>
              Lo que hay abierto ahora
            </h2>
            <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>
              {CURSOS.length === 1 ? '1 convocatoria' : `${CURSOS.length} convocatorias`}
            </span>
          </Reveal>
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
          <Reveal
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
                <span className="espaciado" style={{ fontSize: 10, fontWeight: 700, color: 'var(--acento)' }}>La membresía</span>
                <span style={{ fontSize: 'var(--t-bloque)', fontWeight: 'var(--peso-medio)', letterSpacing: '-.025em', lineHeight: 1.1, maxWidth: '26ch', textWrap: 'balance' }}>
                  Un curso son dos días. La comunidad es cada mes.
                </span>
                {/* Aquí iba el precio de la lista. La membresía ya no cobra
                    nada —es un próximamente— así que el argumento deja de ser
                    «entra por la mitad» y pasa a ser el único que queda en pie:
                    que te avisan a ti antes que a nadie. Prometer un precio que
                    ya no existe sería lo peor que puede hacer esta línea. */}
                <span style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '40ch' }}>
                  Abre el {abre}. Todavía no se cobra nada: deja tu correo y te aviso yo el día que la abra.
                </span>
              </div>
              <Link href="/membresia" data-mag data-cur-label="Ver" className="pill pill-cream">
                <span>Avisadme cuando abra</span>
                <span className="pill-arrow">→</span>
              </Link>
            </div>
          </Reveal>
          <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                <Marca tam={52} apilado />
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link href="/sinergia" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Prueba gratis</Link>
                <Link href="/membresia" style={{ fontSize: 13, color: 'var(--tx-2)' }}>La membresía</Link>
                <Link href="/#cita" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Sesión con Iris</Link>
              </div>
              <span style={{ display: 'flex', gap: 14, fontSize: 12, marginBottom: 4 }}>
              <Link href="/legal" style={{ color: 'var(--tx-2)' }}>Aviso legal</Link>
              <Link href="/privacidad" style={{ color: 'var(--tx-2)' }}>Tus datos</Link>
            </span>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>
                Los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>© 2026 · Cursos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
