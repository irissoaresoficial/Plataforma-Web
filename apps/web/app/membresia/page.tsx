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

/*
 * ============================================================================
 * LA COMUNIDAD — UN «PRÓXIMAMENTE», Y NADA MÁS
 * ============================================================================
 *
 * Esta página ha adelgazado tres veces, y conviene saber por qué acabó siendo
 * una sola pantalla con veinte palabras.
 *
 *   1. Era una landing larga: cuenta atrás, qué incluye, cómo es un mes por
 *      dentro, para quién es. Todo eso describía con mucho detalle una
 *      comunidad que no existe, y tres de las líneas de «qué incluye» estaban
 *      literalmente en blanco, marcadas en rojo.
 *   2. Después fue una pantalla honesta CON PRECIO: 33 € de fundadora, 67 €
 *      tachado, diez plazas. Se estaba cobrando la entrada a una sala sin
 *      construir: quien pagaba en septiembre no recibía nada hasta noviembre, y
 *      en esas semanas la gente cambia de opinión. Eso no trae dinero, trae
 *      devoluciones.
 *   3. Y era una pantalla sin precio pero con cuatro párrafos explicando por
 *      qué no hay precio.
 *
 * AHORA ES UN «PRÓXIMAMENTE» DE VERDAD. Decisión de Gerson, 13 de septiembre de
 * 2026, y la razón es la que menos me esperaba: el problema del paso 3 no era
 * lo que decía, era CUÁNTO decía.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ UN «PRÓXIMAMENTE» LLEVA POCO TEXTO — Y NO ES PEREZA
 * ---------------------------------------------------------------------------
 * Un texto largo pide una decisión: hay que leerlo para saber si te interesa.
 * Un «próximamente» no pide ninguna decisión — sólo pide un correo — así que
 * cada párrafo que se añade es trabajo cobrado por algo que no se va a comprar
 * hoy. Cuatro párrafos justificando por qué todavía no hay nada consiguen justo
 * lo contrario de lo que buscan: convencen a la persona de que aquí todavía no
 * hay nada.
 *
 * Lo que sostiene la página es lo mismo que sostiene cualquier cartel de
 * «próximamente» que funciona: el nombre, una frase que diga de qué va, y una
 * caja donde dejar el correo. Todo lo demás se cuenta el día que abra, que es
 * cuando la persona sí está dispuesta a leer.
 *
 * LA HONESTIDAD NO SE PIERDE, SE CONDENSA. «Todavía no existe» y «hoy no se
 * paga nada» siguen estando, en dos líneas de siete palabras, arriba y a la
 * vista. Antes ocupaban cuatro párrafos y decían exactamente lo mismo.
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
          <Reveal>
            <span className="com-obras">
              <i aria-hidden />
              Próximamente
            </span>
          </Reveal>

          <Reveal as="h1" delay={70} className="com-titular">
            La comunidad
            <br />
            <em>de Iris Soares</em>
          </Reveal>

          {/* La página entera, en dos líneas. La primera dice de qué va; la
              segunda es la condición, y va marcada porque es la que hace que
              esto sea honesto y no un cartel de humo. */}
          <Reveal delay={140}>
            <p className="com-linea">
              Un grupo pequeño. Cada mes, una parte de tu historia familiar.
            </p>
          </Reveal>

          <Reveal delay={190}>
            <p className="com-condicion">Todavía no existe. Hoy no se paga nada.</p>
          </Reveal>

          {/* --------------------------------------------------- LA CAJA
              El formulario va dentro de una caja de cristal, centrada, y es lo
              único que se puede hacer en esta página. Cuando sólo hay una
              acción, ponerla en una caja aparte no es adorno: es lo que hace
              que se vea sin leer nada. */}
          <Reveal delay={240}>
            <div id="avisar" className="com-caja">
              <p className="com-caja-titulo">Te aviso el día que abra</p>
              <LeadForm
                origen="membresia"
                detalle="Aviso de apertura de la comunidad"
                cta="Avisadme"
                variant="dark"
                successTitle="Hecho. Te aviso yo."
                successText="Cuando abra te escribo, y serás de las primeras en saber qué hay dentro."
                privacidad="Sólo lo guardo para avisarte de esto. Te sales cuando quieras."
                pedirNombre={false}
                pedirWhatsapp
              />
            </div>
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
