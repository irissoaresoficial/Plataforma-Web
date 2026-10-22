import PaginaTexto from '@/components/PaginaTexto';
/*
 * Igual que en el aviso legal: cada apartado entra al llegar a él. En una
 * página que es texto seguido de arriba abajo, eso es lo único que marca dónde
 * acaba un apartado y empieza el siguiente mientras se baja.
 *
 * El molde (`PaginaTexto`) no se toca: el movimiento va aquí. Los estilos de
 * `.texto-legal` son de descendencia, así que un envoltorio en medio no le
 * quita el estilo a nada.
 */
import Aparece from '@/components/Aparece';
import { CONTACTO, TITULAR, falta } from '@/content/site';

export const metadata = {
  title: 'Tus datos · Iris Soares',
  description: 'Qué datos se piden en esta web, para qué se usan, cuánto se guardan y cómo borrarlos.',
  /*
   * EL CANONICAL, QUE FALTABA, Y NO ES UN DETALLE.
   *
   * El layout raíz declara `alternates: { canonical: '/' }` y eso se hereda
   * hacia abajo. O sea que esta página venía sirviendo
   *
   *     <link rel="canonical" href="https://escueladesabiduria33.com">
   *
   * que es una nota firmada diciéndole a Google «no me indexes a mí, la buena
   * es la portada». Las seis páginas con `layout.tsx` propio ya lo arreglaron
   * en su día; estas dos se quedaron fuera porque no tienen layout — exportan
   * `metadata` desde la propia página, que también vale, pero nadie volvió a
   * mirarlas. Está contado entero en `lib/seo.ts`.
   */
  alternates: { canonical: '/privacidad' },
};

export default function Privacidad() {
  return (
    <PaginaTexto
      titulo="Qué hacemos con tus datos"
      entradilla="En claro y sin rodeos: qué se te pide, para qué, quién más lo ve, cuánto tiempo se guarda y cómo pedir que se borre."
      actualizado="22 de octubre de 2026"
    >
      <Aparece>
        <h2>Quién responde de tus datos</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        {TITULAR.nombre}
        {!falta(TITULAR.nif) && <>, NIF {TITULAR.nif}</>}, con domicilio en {TITULAR.direccion}. Puedes escribir a{' '}
        {CONTACTO.email} para cualquier cosa de esta página.
      </p>

      </Aparece>

      <Aparece>
        <h2>Qué se pide y para qué</h2>
      </Aparece>
      <Aparece retraso={1}>

      <h3>Si reservas una sesión</h3>
      <p>
        Se te piden <strong>nombre, fecha de nacimiento, correo y el motivo por el que vienes</strong>.
        El nombre y la fecha hacen falta porque son la materia del estudio: sin ellos no hay nada que
        mirar. El correo es para mandarte la confirmación y el enlace de la videollamada. El motivo
        sirve para preparar tu sesión antes de vernos.
      </p>

      <h3>Si haces el estudio gratuito</h3>
      <p>
        Se piden <strong>los nombres y las fechas de nacimiento</strong> de las dos personas que
        quieres comparar, y tu correo si quieres recibir el resultado. El cálculo se hace en tu
        propio navegador: los números no salen de tu ordenador salvo que dejes el correo para que te
        llegue el informe.
      </p>
      <p>
        <strong>La fecha de nacimiento de otra persona es un dato suyo, no tuyo.</strong> Úsalo solo
        si esa persona está de acuerdo, o si es alguien de tu familia y lo haces para entender tu
        propia historia. Si alguien quiere que borremos sus datos, basta con escribirnos.
      </p>

      <h3>Si te apuntas a la lista de espera o a un curso</h3>
      <p>
        Se piden <strong>nombre, correo y, si quieres, WhatsApp</strong>, para avisarte cuando abra y
        mandarte los detalles. Nada más.
      </p>

      </Aparece>

      <Aparece>
        <h2>Con qué permiso</h2>
      </Aparece>
      <Aparece retraso={1}>
      <ul>
        <li>
          <strong>Para prestarte el servicio</strong> que has pedido (tu sesión, tu curso): porque
          hay un contrato entre nosotros.
        </li>
        <li>
          <strong>Para los correos de seguimiento</strong> después del estudio gratuito: porque tú
          diste tu consentimiento al dejarnos el correo. Puedes retirarlo cuando quieras.
        </li>
        <li>
          <strong>Para llevar la contabilidad y las facturas</strong>: porque la ley obliga.
        </li>
      </ul>

      </Aparece>

      <Aparece>
        <h2>Quién más los ve</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>Solo los proveedores necesarios para que esto funcione, y cada uno solo lo suyo:</p>
      <ul>
        <li>
          <strong>Google</strong> (Calendar, Hojas de cálculo y Gmail): guarda las reservas, crea el
          evento y envía los correos de la prueba de sinergia.
        </li>
        {/* RESEND ENTRA AQUÍ EL MISMO DÍA QUE EMPIEZA A MANDAR, no después.
            Es un encargado del tratamiento nuevo y guarda los datos en Estados
            Unidos: nombrarlo, decir qué hace y decir dónde está es obligación
            del artículo 13 del RGPD, y de las que se comprueban mirando esta
            página. La base legal de la transferencia es la que tiene firmada
            Resend —cláusulas contractuales tipo de la UE y el marco de
            privacidad UE-EE. UU.—, y por eso se dice en voz alta en vez de
            dejarlo en «proveedores de correo». */}
        <li>
          <strong>Resend</strong>: envía los correos de confirmación de quien se apunta por la web.
          Guarda el correo electrónico y el registro del envío en Estados Unidos, amparado en las
          cláusulas contractuales tipo de la Unión Europea y en el marco de privacidad UE-EE. UU.
        </li>
        {/* META ENTRA AQUÍ EL MISMO DÍA QUE EL SERVIDOR EMPIEZA A AVISARLE.
            Antes del 22 de octubre lo único que llegaba a Meta lo mandaba el
            píxel desde el navegador de la persona, y por eso bastaba con el
            apartado de cookies. Desde hoy el servidor también le avisa de los
            registros (`lib/capi.ts`), y eso es una comunicación de datos que
            hacemos nosotros: el artículo 13 del RGPD obliga a nombrar al
            destinatario, decir qué recibe y decir dónde está. Si algún día se
            quita ese aviso, hay que quitar este punto. */}
        <li>
          <strong>Meta</strong> (Facebook e Instagram): si aceptaste el cartel de medición, recibe
          que alguien se ha apuntado, con tu correo cifrado para poder reconocerte. Es lo que
          permite saber qué anuncio trae gente de verdad. Los datos se tratan en Irlanda y en
          Estados Unidos, amparado en las cláusulas contractuales tipo de la Unión Europea y en el
          marco de privacidad UE-EE. UU. Si dijiste «no, gracias», Meta no recibe nada.
        </li>
        <li>
          <strong>Vercel</strong>: aloja esta web.
        </li>
        <li>
          <strong>Stripe</strong>: procesa los pagos de los cursos. Los datos de tu tarjeta van
          directos a Stripe; esta web no los ve ni los guarda.
        </li>
      </ul>
      <p>
        No se venden tus datos a nadie, ni se ceden para que otros te anuncien sus cosas. Lo único
        que sale hacia una plataforma de publicidad es lo que cuenta el punto de Meta, y sólo si
        aceptaste el cartel.
      </p>

      </Aparece>

      <Aparece>
        <h2>Cuánto tiempo se guardan</h2>
      </Aparece>
      <Aparece retraso={1}>
      <ul>
        <li>
          <strong>Reservas y sesiones:</strong> mientras seas cliente y después el tiempo que la ley
          obliga a conservar la contabilidad (seis años para lo facturado).
        </li>
        <li>
          <strong>Correos de la lista y del estudio gratuito:</strong> hasta que te des de baja. Cada
          correo lleva su enlace de baja, y funciona al momento.
        </li>
      </ul>

      </Aparece>

      <Aparece>
        <h2>Qué puedes pedir, y siempre gratis</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        Acceder a lo que tenemos tuyo, corregirlo, borrarlo, limitar su uso, oponerte a que lo usemos
        o pedir que te lo demos en un archivo para llevártelo a otro sitio. Escribe a{' '}
        {CONTACTO.email} y se resuelve en un mes como máximo. Si crees que no lo hemos hecho bien,
        puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>

      </Aparece>

      <Aparece>
        <h2>Cookies</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        El idioma que eliges se guarda en tu propio navegador y no se envía a ningún sitio. Eso no se
        puede desactivar, porque sin ello la web no sabría en qué idioma hablarte, y tampoco sirve
        para identificarte.
      </p>
      <p>
        <strong>Cookies de medición.</strong> Si hacemos publicidad, usamos las cookies de Meta y de
        Google para saber qué anuncios traen gente y cuáles no. No se cargan hasta que tú dices que
        sí en el cartel que sale abajo, y si dices que no, no se carga nada — ni el programa que las
        pone. Puedes cambiar de idea borrando los datos de este sitio en tu navegador: el cartel
        vuelve a preguntarte.
      </p>
      <p>
        Lo que se envía es que alguien ha abierto el chat, ha reservado, ha dejado su correo, ha
        calculado su número o hasta dónde ha visto un vídeo. <strong>Nunca se envía tu nombre, ni
        tu teléfono, ni tu fecha de nacimiento.</strong> Y si no hay ninguna campaña en marcha, no
        verás el cartel porque no hay nada que cargar.
      </p>
      <p>
        <strong>Tu correo sí, en un caso, y te lo contamos entero.</strong> Si aceptaste el cartel y
        además dejas tu correo en un formulario, nuestro servidor le avisa a Meta de que alguien se
        ha apuntado. Para que Meta pueda reconocerte le manda tu correo <strong>cifrado</strong>:
        convertido en una cadena de letras y números que no se puede leer ni deshacer, aunque sí le
        sirve para saber que eres tú si ya tenía ese mismo correo. Van también tu dirección de
        internet y tu navegador, que Meta ya recibe del píxel que aceptaste. No va tu nombre.
      </p>
      <p>
        Sirve para una cosa sola: saber qué anuncio trae gente que de verdad se apunta, y dejar de
        pagar por los que no. Se hace desde el servidor y no desde tu navegador porque desde el
        navegador se pierde la mitad de los avisos, y una campaña que no sabe qué funciona se gasta
        el dinero a ciegas. <strong>Si dijiste «no, gracias» al cartel, no se envía nada de esto: ni
        tu correo cifrado, ni nada.</strong>
      </p>

      </Aparece>

      <Aparece>
        <h2>Si llegas desde un anuncio</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        Cuando un anuncio te trae hasta aquí, la dirección lleva una etiqueta al final que dice de
        qué anuncio vienes — no quién eres. Si después nos dejas tu correo, esa etiqueta se guarda
        junto a él para que sepamos qué anuncio funciona y cuál no, y podamos dejar de pagar por los
        que no. <strong>Esa etiqueta no se guarda en tu navegador:</strong> vive sólo mientras tienes
        la pestaña abierta, así que no deja ninguna cookie y no hace falta que aceptes nada.
      </p>
      <p>
        <strong>El país y la ciudad.</strong> Al dejar tu correo guardamos también desde qué país y
        qué ciudad lo hiciste, para saber dónde anunciarnos y a qué hora. Lo calcula nuestro
        servidor, no se lo preguntamos a nadie y no se comparte con nadie.
      </p>
      <p>
        <strong>Tu dirección de internet (IP) no se guarda entera, nunca.</strong> Se recorta antes
        de guardarla —se borra el último trozo— porque completa identificaría a una persona y para
        esto no hace falta. Sólo sirve para evitar que alguien envíe el formulario cien veces
        seguidas.
      </p>
      </Aparece>
    </PaginaTexto>
  );
}
