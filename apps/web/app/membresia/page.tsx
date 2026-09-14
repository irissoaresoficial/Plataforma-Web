'use client';

import Link from 'next/link';
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
 * Y LO QUE QUEDA ESCRITO ES AFIRMATIVO. La primera versión corta decía
 * «Todavía no existe. Hoy no se paga nada», que suena honesto y es un error:
 * lo primero ya lo dice la chapa de «Próximamente», y lo segundo contesta a una
 * objeción que nadie se había planteado — nadie llega a un cartel de
 * próximamente temiendo que le cobren, y al decirlo se le mete la idea del pago
 * donde no estaba.
 *
 * En su sitio va lo que gana quien deje el correo hoy: que la comunidad abre
 * pequeña y las primeras deciden qué se trabaja dentro. Eso sí es un motivo, y
 * además es verdad — el grupo abre con diez personas porque cada mes se revisa
 * un caso en voz alta.
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
      <Nav cta="Apuntarme" ctaHref="#avisar" />

      {/* ═══════════════════════════════════════════════ LA ÚNICA PANTALLA */}
      <div className="vino com-hero">
        {/* Las cifras de la casa flotando. Sobre el granate el dorado aguanta
            mucha más intensidad que sobre papel: a 1,7 se intuyen sin competir
            con nada, y a 0,7 —lo que usa la portada clara— no se verían. */}
        <CampoNumeros intensidad={1.7} densidad={130_000} />

        {/*
            DE UNA COLUMNA CENTRADA A DOS, Y NO ES CAPRICHO.

            Todo iba centrado en una sola columna: sello, chapa, titular, dos
            líneas y la caja. Centrar TODO tiene un efecto que se nota sin saber
            nombrarlo — no hay jerarquía. Si las seis cosas están en el mismo
            eje, ninguna manda, y la página se lee como una plantilla de
            «próximamente» de las que vienen de serie. Eso es lo que quería decir
            Gerson con «la UI es muy sencilla».

            Ahora son dos: a la izquierda quién es y de qué va —alineado a la
            izquierda, que es como se lee un texto— y a la derecha lo único que
            se puede hacer. En el móvil se apila, y ahí sí queda una columna:
            con 390 px de ancho no hay otra cosa que hacer, pero el texto sigue
            alineado a la izquierda y no centrado. */}
        <div className="com-dentro">
          <div className="com-izq">
          {/* La flor de lis, arriba del todo. Esta página no lleva la barra con
              la marca —es una pantalla sola— así que sin el sello no había nada
              que dijera de quién es la comunidad hasta el titular. */}
          <Aparece modo="escala">
            <Marca tam={44} texto={false} claro />
          </Aparece>

          <Aparece retraso={1}>
            <span className="com-obras">
              <i aria-hidden />
              Próximamente
            </span>
          </Aparece>

          {/* Sin el modo de palabra a palabra: el titular lleva un salto de
              línea y una cursiva dentro, o sea que no es un texto suelto que se
              pueda partir en palabras sin perder el `<em>`. */}
          <Aparece as="h1" retraso={2} className="com-titular">
            La comunidad
            <br />
            <em>de Iris Soares</em>
          </Aparece>

          {/* La página entera, en dos líneas. La primera dice de qué va; la
              segunda es el motivo para dejar el correo HOY y no en noviembre.

              AQUÍ PONÍA «Todavía no existe. Hoy no se paga nada.» y estaba mal
              por dos razones. Una: lo de que no existe ya lo dice la chapa de
              «Próximamente» que está tres centímetros más arriba, así que era
              repetirse. Y dos, la importante: «hoy no se paga nada» contesta a
              una objeción que nadie se ha planteado. Nadie llega a un cartel de
              próximamente temiendo que le cobren — y al decirlo, se le mete la
              idea del pago en la cabeza justo donde no estaba.

              Lo que sí hay que decir es qué gana quien entre primero. Eso no es
              defenderse: es dar un motivo. */}
          {/*
              AQUÍ IBA «Un grupo pequeño. Cada mes, una parte de tu historia
              familiar.» y se ha ido: decisión de Gerson, «quita eso del grupo
              pequeño».

              Y tenía razón por un motivo de venta, no de estilo: «un grupo
              pequeño» es lo que uno se dice a sí mismo para justificar que
              todavía no hay nadie. A quien llega, la palabra «pequeño» no le
              promete exclusividad — le sugiere que esto está a medias.

              En su sitio va lo único que hay que entender de esta pantalla, y
              va en grande porque es lo que se viene a hacer aquí. */}
          <Aparece modo="letras" retraso={3} className="com-lista" as="p">
            Lista de espera
          </Aparece>

          <Aparece retraso={4}>
            <p className="com-condicion">Las primeras deciden conmigo qué se trabaja dentro.</p>
          </Aparece>
          </div>

          {/* --------------------------------------------------- LA CAJA
              El formulario va dentro de una caja de cristal, centrada, y es lo
              único que se puede hacer en esta página. Cuando sólo hay una
              acción, ponerla en una caja aparte no es adorno: es lo que hace
              que se vea sin leer nada. */}
          {/* La caja se acerca, no sube: es lo único que se puede hacer aquí y
              entra con un gesto distinto al del texto. */}
          <Aparece modo="escala" retraso={5} className="com-der">
            <div id="avisar" className="com-caja">
              {/* El aro dorado detrás de la caja. Es lo único decorativo de la
                  página y hace un trabajo concreto: sobre un granate liso, una
                  caja de cristal no se ve como que está delante de nada. Con el
                  aro asomando por detrás sí. */}
              <span className="com-aro" aria-hidden />
              <LeadForm
                origen="membresia"
                detalle="Aviso de apertura de la comunidad"
                cta="Únete a la lista de espera"
                variant="dark"
                successTitle="Ya estás en la lista."
                successText="Te escribo yo antes de abrir, y te pregunto qué quieres trabajar dentro."
                privacidad="Sólo lo guardo para avisarte de esto. Te sales cuando quieras."
                pedirNombre={false}
                pedirWhatsapp
              />
            </div>
          </Aparece>
        </div>

        {/* El pie, dentro de la misma pantalla oscura. Una página de un solo
            bloque no puede llevar un pie claro debajo: sería una segunda
            pantalla, que es justo lo que se ha quitado. */}
        <Aparece className="com-pie">
          <Link href="/" aria-label="Ir al inicio">
            <Marca tam={30} claro />
          </Link>
          <span>
            <Link href="/legal">Aviso legal</Link>
            <Link href="/privacidad">Tus datos</Link>
          </span>
        </Aparece>
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
