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
import { MEMBRESIA } from '@/content/site';

/*
 * ============================================================================
 * LA COMUNIDAD — UN PRÓXIMAMENTE, Y NADA MÁS
 * ============================================================================
 *
 * Esta página ha pasado por tres versiones y conviene saber por qué acabó
 * siendo la más corta de las tres.
 *
 * Primero era una landing larga: cuenta atrás, qué incluye, cómo es un mes por
 * dentro, para quién es. Todo eso describía con mucho detalle una comunidad que
 * no existe, y tres de las líneas de «qué incluye» estaban literalmente en
 * blanco, marcadas en rojo.
 *
 * Después fue una pantalla honesta CON PRECIO: 33 € de fundadora, 67 € tachado,
 * diez plazas. Y ahí seguía habiendo un problema, aunque más fino: se estaba
 * cobrando la entrada a una sala que todavía no se ha construido. Quien pagaba
 * en septiembre no recibía nada hasta noviembre, y en esas semanas la gente
 * cambia de opinión — con lo cual el cobro no traía dinero, traía devoluciones.
 *
 * AHORA ES UN PRÓXIMAMENTE. Decisión de Gerson, 13 de septiembre de 2026. No se
 * cobra, no se promete un precio, no se tacha nada. Se dice que la comunidad
 * viene, se dice con qué idea, y se pide lo único que hace falta para avisar el
 * día que abra: el correo y el WhatsApp.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTO CONVIERTE MÁS, Y NO MENOS
 * ---------------------------------------------------------------------------
 * Un precio te obliga a decidir si vale la pena. Un «te aviso» no obliga a
 * nada, y por eso lo deja mucha más gente. La lista es el activo: cuando la
 * comunidad exista de verdad y haya algo que enseñar, se le escribe a esa gente
 * — y entonces sí, con el precio delante y con algo detrás del precio.
 *
 * Ni siquiera se pide el nombre. Cada campo de un formulario cuesta gente, y el
 * nombre no hace falta para avisar: se pregunta el día que se hable.
 *
 * ---------------------------------------------------------------------------
 * SI ALGÚN DÍA VUELVE EL PRECIO
 * ---------------------------------------------------------------------------
 * Se rellenan `MEMBRESIA.precio` y `MEMBRESIA.precioReserva` en content/site.ts
 * y se vuelve a escribir el bloque, que está en el historial. Lo que NO se hace
 * es dejar aquí un precio comentado «por si acaso»: un número muerto en el
 * código acaba encendido por accidente.
 */

export default function Membresia() {
  useSiteScroll();

  return (
    <div className="pagina-oscura" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav cta="Avisadme" ctaHref="#avisar" />

      {/* ═══════════════════════════════════════════════ LA ÚNICA PANTALLA */}
      <div className="vino com-hero">
        {/* Las cifras de la casa flotando. Sobre el granate el dorado aguanta
            mucha más intensidad que sobre papel: a 1,7 se intuyen sin competir
            con nada, y a 0,7 —lo que usa la portada clara— no se verían. */}
        <CampoNumeros intensidad={1.7} densidad={130_000} />

        <div className="com-dentro">
          {/* ------------------------------------------------- PRÓXIMAMENTE
              Lo primero, antes que el titular. Es la condición de todo lo que
              viene después: si alguien sólo lee una línea de esta página, que
              sea ésta. Ponerla abajo en letra pequeña sería decirlo de una
              forma que técnicamente lo dice y en la práctica lo esconde. */}
          <Reveal>
            <span className="com-obras">
              <i aria-hidden />
              Próximamente · la comunidad de Iris
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
              Y lo digo tal cual: <b>esto está a medio hacer.</b> No te voy a enseñar un temario cerrado que no existe,
              ni te voy a cobrar por algo que todavía no puedes usar. Lo que hay es el método, que uso todos los días, y
              la idea de llevarlo a un grupo.
            </p>
          </Reveal>

          {/* ------------------------------------------------------ AVISAR
              Aquí iba el precio en grande. Ya no hay precio, así que tampoco
              hay panel: el sitio de honor de la página lo ocupa lo único que se
              pide, que son dos campos. */}
          <Reveal delay={240}>
            <div id="avisar" className="com-form">
              <p className="com-form-titulo">Dime por dónde avisarte y te escribo el día que abra.</p>
              <LeadForm
                origen="membresia"
                detalle="Aviso de apertura de la comunidad"
                cta="Avisadme cuando abra"
                variant="dark"
                successTitle="Hecho. Te aviso yo."
                successText="Cuando la comunidad abra te escribo, y serás de las primeras en saber qué hay dentro y cuánto cuesta."
                privacidad="Sólo guardo tu correo y tu WhatsApp para avisarte de esto. Nada más, y te sales cuando quieras."
                pedirNombre={false}
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
              <li>Hoy no se paga nada. Cuando haya precio lo sabrás por correo, antes que nadie.</li>
              <li>
                Te escribo yo y te pregunto qué quieres trabajar. Eso es lo que entra
                {MEMBRESIA.plazasLanzamiento ? (
                  <> — el grupo abre con {MEMBRESIA.plazasLanzamiento} personas, así que da tiempo a mirar cada caso.</>
                ) : (
                  '.'
                )}
              </li>
              <li>Si cuando abra no es lo tuyo, no entras y ya está. Estar en la lista no te compromete a nada.</li>
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
