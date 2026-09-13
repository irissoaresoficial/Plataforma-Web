'use client';

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import ChatWidget from '@/components/ChatWidget';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import CuentaAtras from '@/components/CuentaAtras';
import { TALLER } from '@/content/site';

/*
 * ============================================================================
 * EL TALLER GRATUITO — UNA SOLA PANTALLA Y UN SOLO GESTO
 * ============================================================================
 *
 * Decidido en la reunión del 13 de septiembre de 2026: hora y media, gratis,
 * para octubre. Es la pieza que puede traer gente antes que ninguna otra,
 * porque lo gratis no se piensa — se entra.
 *
 * ---------------------------------------------------------------------------
 * LA PÁGINA EXISTE ANTES QUE LA FECHA
 * ---------------------------------------------------------------------------
 * Todavía no hay día cerrado. Lo normal sería esperar a tenerlo, y sería un
 * error: cada día sin página es un día sin recoger correos de gente que ya
 * está interesada, y esos correos son justamente lo que hace que el taller se
 * llene el día que haya fecha.
 *
 * Así que la página tiene dos estados y cambia sola con sólo rellenar
 * `TALLER.fechaISO` y `TALLER.hora` en content/site.ts:
 *
 *   SIN FECHA  ·  lista de espera. «Estoy cerrando el día y te aviso yo.»
 *                 Es verdad, y no promete un día que no existe.
 *   CON FECHA  ·  sale el día, la hora y la cuenta atrás, y el botón pasa de
 *                 «Avísame del día» a «Guardar mi plaza».
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EL TITULAR ES EL DOLOR Y NO EL TEMA
 * ---------------------------------------------------------------------------
 * «Taller gratuito de numerología» describe el producto y no le interesa a
 * nadie que no sepa ya qué es la numerología — o sea, a casi todo el mundo. Lo
 * que sí le pasa a esa persona es lo que dice el titular: cambia de trabajo,
 * cambia de pareja, y a los seis meses está en la misma conversación.
 *
 * Es el mismo material del bloque «A ver si te suena» de la portada, que es el
 * mejor texto que tiene esta casa, y está escrito igual: frases cortas, cosas
 * que pasan de verdad, y ni una palabra de jerga. La numerología aparece
 * después, como la herramienta — nunca como el gancho.
 *
 * Y la promesa se queda donde se puede cumplir: «te enseño a verlo». No se
 * cura nada, no se predice nada y no se promete que la vida cambie en hora y
 * media.
 */

export default function Taller() {
  useSiteScroll();

  /* Hay fecha cuando están las DOS: el día y la hora. Con una sola, la página
     diría «el 14 de octubre» sin decir a qué hora, y entonces hay que escribir
     un segundo correo para lo que faltaba. */
  const hayFecha = Boolean(TALLER.fechaISO && TALLER.hora);

  const dia = hayFecha
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(
        new Date(`${TALLER.fechaISO}T12:00:00`),
      )
    : '';

  return (
    <div className="pagina-oscura" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav cta={hayFecha ? 'Guardar mi plaza' : 'Avísame del día'} ctaHref="#apuntarme" />

      <div className="vino tal-hero">
        <CampoNumeros intensidad={1.7} densidad={130_000} />

        <div className="tal-dentro">
          <Reveal>
            <Marca tam={44} texto={false} claro />
          </Reveal>

          <Reveal delay={40}>
            <span className="tal-chapa">
              <i aria-hidden />
              Taller online · gratis · {TALLER.duracion}
            </span>
          </Reveal>

          {/* EL DOLOR PRIMERO. Tres cosas que le pasan de verdad a quien entra,
              escritas como se cuentan, y sólo después la herramienta. */}
          <Reveal as="h1" delay={100} className="tal-titular">
            Cambias de trabajo, cambias de pareja,
            <br />
            <em>y a los seis meses estás en la misma conversación.</em>
          </Reveal>

          <Reveal delay={170}>
            <p className="tal-entrada">
              No es mala suerte y no eres tú. Es un patrón, y los patrones se pueden leer. En hora y media te enseño a
              verlo escrito en tu propia fecha de nacimiento — la tuya, no un ejemplo.
            </p>
          </Reveal>

          {/* QUÉ PASA DENTRO. Tres líneas, y las tres se pueden cumplir. Nada de
              «transformarás tu vida»: se enseña a hacer una cuenta y a leerla. */}
          <Reveal delay={220}>
            <ul className="tal-lista">
              <li>Sacamos tu número delante de ti, con tu fecha. Sales sabiendo hacer la cuenta tú.</li>
              <li>Verás por qué eso que se repite en tu familia no empezó contigo.</li>
              <li>Y qué se hace con ello, que es la parte que nadie cuenta.</li>
            </ul>
          </Reveal>

          {/* LA FECHA, SI LA HAY. Y si no la hay, no se dice nada: un hueco
              honesto se lee mejor que un «próximamente» de relleno. */}
          {hayFecha && (
            <Reveal delay={260}>
              <div className="tal-cuando">
                <span className="tal-dia">{dia}</span>
                <span className="tal-hora">{TALLER.hora}</span>
                {TALLER.donde && <span className="tal-donde">{TALLER.donde}</span>}
                <CuentaAtras fechaISO={TALLER.fechaISO} compacto />
              </div>
            </Reveal>
          )}

          <Reveal delay={280}>
            <div id="apuntarme" className="tal-caja">
              <p className="tal-caja-titulo">
                {hayFecha ? 'Guarda tu plaza' : 'Te aviso yo del día'}
              </p>
              <LeadForm
                origen="taller"
                detalle={hayFecha ? `Taller gratuito · ${dia} ${TALLER.hora}` : 'Taller gratuito · lista de espera'}
                cta={hayFecha ? 'Guardar mi plaza' : 'Avísame del día'}
                variant="dark"
                successTitle={hayFecha ? 'Plaza guardada.' : 'Hecho. Te aviso yo.'}
                successText={
                  hayFecha
                    ? 'Te llega el enlace al correo unos días antes, y otra vez un rato antes de empezar. No hace falta que prepares nada: sólo tu fecha de nacimiento.'
                    : 'En cuanto cierre el día te escribo con la hora y el enlace. No mando nada más.'
                }
                privacidad="Sólo lo guardo para avisarte de esto. Te sales cuando quieras."
                pedirNombre
                pedirWhatsapp
              />
            </div>
          </Reveal>

          {/* La salida para quien no quiere esperar al taller. Es un enlace de
              texto y no un botón: no puede competir con lo único que se pide en
              esta página, que es el correo. */}
          <Reveal delay={320}>
            <p className="tal-pie-nota">
              ¿No quieres esperar? <Link href="/">Habla con Iris y reserva una consulta</Link>.
            </p>
          </Reveal>
        </div>

        <div className="com-pie">
          <Link href="/" aria-label="Ir al inicio">
            <Marca tam={30} claro />
          </Link>
          <span>
            <Link href="/legal">Aviso legal</Link>
            <Link href="/privacidad">Tus datos</Link>
          </span>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
