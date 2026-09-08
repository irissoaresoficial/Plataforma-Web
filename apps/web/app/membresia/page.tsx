'use client';

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import { MEMBRESIA, eur } from '@/content/site';

/*
 * ============================================================================
 * LA COMUNIDAD — UNA SOLA PANTALLA, Y DICIENDO LA VERDAD
 * ============================================================================
 *
 * Esta página era larga: cuenta atrás, qué incluye, cómo es un mes por dentro,
 * para quién es, cierre. Y todo eso describía con mucho detalle una comunidad
 * QUE TODAVÍA NO EXISTE. Tres de las líneas de «qué incluye» estaban en blanco,
 * marcadas en rojo, porque nadie ha decidido aún qué hay dentro.
 *
 * Ahora es una sola pantalla oscura y dice exactamente eso: está en
 * construcción, y quien entra hoy entra a construirla. No es un giro de
 * marketing ni una forma suave de decir «todavía no está»: es literalmente lo
 * que se está vendiendo, y venderlo así es lo único que lo hace honesto.
 *
 * POR QUÉ ADEMÁS VENDE MÁS. Una página larga que promete mucho y no puede
 * enseñar nada se lee como humo — y las tres líneas en rojo lo cantaban. Una
 * página corta que dice «esto lo estoy montando, entra y decides tú lo que hay
 * dentro» tiene algo que la larga no tenía: un motivo real para entrar HOY y no
 * en noviembre.
 *
 * Lo que se ha quitado —el qué incluye, el mes por dentro, el para quién— vuelve
 * el día que exista de verdad. Está en el historial; no hay que reescribirlo.
 *
 * SIGUE EN PIE LA REGLA DEL PAGO: con `NEXT_PUBLIC_PAGO_MEMBRESIA` puesto, entrar
 * es pagar; sin ella, se guarda el correo y se avisa. La página no dice «paga»
 * si no hay forma de cobrar.
 */
const PAGO = process.env.NEXT_PUBLIC_PAGO_MEMBRESIA || '';

export default function Membresia() {
  useSiteScroll();

  return (
    <div className="pagina-oscura" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav cta="Quiero entrar" ctaHref="#entrar" />

      {/* ═══════════════════════════════════════════════ LA ÚNICA PANTALLA */}
      <div className="vino com-hero">
        {/* Las cifras de la casa flotando. Sobre el granate el dorado aguanta
            mucha más intensidad que sobre papel: a 1,7 se intuyen sin competir
            con nada, y a 0,7 —lo que usa la portada clara— no se verían. */}
        <CampoNumeros intensidad={1.7} densidad={130_000} />

        <div className="com-dentro">
          {/* --------------------------------------------- EN CONSTRUCCIÓN
              Lo primero, antes que el titular. Es la condición de todo lo que
              viene después: si alguien sólo lee una línea de esta página, que
              sea ésta. Ponerla abajo en letra pequeña sería decirlo de una
              forma que técnicamente lo dice y en la práctica lo esconde. */}
          <Reveal>
            <span className="com-obras">
              <i aria-hidden />
              En construcción · buscando a las primeras
            </span>
          </Reveal>

          <Reveal as="h1" delay={70} className="com-titular">
            La comunidad todavía no existe.
            <br />
            <em>Se hace con las primeras que entren.</em>
          </Reveal>

          <Reveal delay={140}>
            <p className="com-entrada">
              Un patrón que lleva tres generaciones funcionando no se desmonta en una tarde. Por eso quiero abrir un
              grupo pequeño y mirar cada mes una parte de tu historia familiar.
            </p>
          </Reveal>

          <Reveal delay={190}>
            <p className="com-entrada com-entrada-2">
              Y lo digo tal cual: <b>esto está a medio hacer.</b> No te voy a enseñar un temario cerrado que no existe.
              Lo que hay es el método, que uso todos los días, y la idea de llevarlo a un grupo. Quien entre ahora entra
              a decidir conmigo qué se trabaja cada mes.
            </p>
          </Reveal>

          {/* ---------------------------------------------------- EL PRECIO
              En grande, porque es lo que hace que esto sea una prueba de
              verdad y no una encuesta. Una lista de espera gratis la firma
              cualquiera; treinta y tres euros los pone quien lo quiere. */}
          <Reveal delay={240}>
            <div id="entrar" className="com-precio">
              <span className="com-precio-rotulo">Precio de fundadora</span>
              <span className="com-precio-fila">
                <b>{eur(MEMBRESIA.precioReserva)}</b>
                <s>{eur(MEMBRESIA.precio)}</s>
                <i>al mes</i>
              </span>
              <span className="com-precio-pie">
                Lo mantienes mientras sigas dentro, no sólo el primer año.
                {MEMBRESIA.plazasLanzamiento ? <> Sólo para las {MEMBRESIA.plazasLanzamiento} primeras.</> : null}
              </span>
            </div>
          </Reveal>

          {/* ------------------------------------------------------- ENTRAR */}
          <Reveal delay={290}>
            <div className="com-form">
              <LeadForm
                origen="membresia"
                detalle={`Fundadora a ${eur(MEMBRESIA.precioReserva)} (precio normal ${eur(MEMBRESIA.precio)})`}
                cta={PAGO ? 'Continuar' : 'Quiero ser de las primeras'}
                variant="dark"
                successTitle={PAGO ? 'Ya te tengo. Falta el pago.' : 'Anotada.'}
                successText={
                  PAGO
                    ? `Tu sitio queda guardado en cuanto pagues el primer mes: ${eur(MEMBRESIA.precioReserva)}.`
                    : 'Te escribo yo, en persona, para contarte cómo va y preguntarte qué necesitas dentro.'
                }
                privacidad={
                  PAGO
                    ? 'El pago va por Stripe: esta web no ve ni guarda los datos de tu tarjeta.'
                    : 'Sólo guardo tu correo para escribirte de esto. Nada más.'
                }
                pagoUrl={PAGO}
                pagoCta={`Entrar por ${eur(MEMBRESIA.precioReserva)} al mes`}
                pedirNombre
                pedirWhatsapp
              />
            </div>
          </Reveal>

          {/* ----------------------------------------------------- LAS REGLAS
              Tres líneas, y las tres son condiciones de verdad. Van DESPUÉS del
              formulario a propósito: quien ya ha decidido las lee como lo que
              son, y quien está dudando no se topa con ellas antes de haber
              entendido de qué va esto. */}
          <Reveal delay={340}>
            <ul className="com-reglas">
              <li>Te escribo yo y te pregunto qué quieres trabajar. Eso es lo que entra en el primer mes.</li>
              <li>Si en algún momento no es lo tuyo, lo dices y sales. No hay permanencia ni letra pequeña.</li>
              <li>El precio se te queda mientras sigas dentro. Cuando abra del todo, será de {eur(MEMBRESIA.precio)}.</li>
            </ul>
          </Reveal>
        </div>

        {/* El pie, dentro de la misma pantalla oscura. Una página de un solo
            bloque no puede llevar un pie claro debajo: sería una segunda
            pantalla, que es justo lo que se ha quitado. */}
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
    </div>
  );
}
