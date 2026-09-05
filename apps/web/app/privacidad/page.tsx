import PaginaTexto from '@/components/PaginaTexto';
import { CONTACTO, TITULAR } from '@/content/site';
import { Texto } from '@/components/Pendiente';

export const metadata = {
  title: 'Tus datos · Iris Soares',
  description: 'Qué datos se piden en esta web, para qué se usan, cuánto se guardan y cómo borrarlos.',
};

export default function Privacidad() {
  return (
    <PaginaTexto
      titulo="Qué hacemos con tus datos"
      entradilla="En claro y sin rodeos: qué se te pide, para qué, quién más lo ve, cuánto tiempo se guarda y cómo pedir que se borre."
      actualizado="4 de septiembre de 2026"
    >
      <h2>Quién responde de tus datos</h2>
      <p>
        <Texto valor={TITULAR.nombre} />, NIF <Texto valor={TITULAR.nif} />. Puedes escribir
        a {CONTACTO.email} para cualquier cosa de esta página.
      </p>

      <h2>Qué se pide y para qué</h2>

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

      <h2>Con qué permiso</h2>
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

      <h2>Quién más los ve</h2>
      <p>Solo los proveedores necesarios para que esto funcione, y cada uno solo lo suyo:</p>
      <ul>
        <li>
          <strong>Google</strong> (Calendar, Hojas de cálculo y Gmail): guarda las reservas, crea el
          evento y envía los correos.
        </li>
        <li>
          <strong>Vercel</strong>: aloja esta web.
        </li>
        <li>
          <strong>Stripe</strong>: procesa los pagos de los cursos. Los datos de tu tarjeta van
          directos a Stripe; esta web no los ve ni los guarda.
        </li>
      </ul>
      <p>No se venden tus datos a nadie, ni se ceden para publicidad de terceros.</p>

      <h2>Cuánto tiempo se guardan</h2>
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

      <h2>Qué puedes pedir, y siempre gratis</h2>
      <p>
        Acceder a lo que tenemos tuyo, corregirlo, borrarlo, limitar su uso, oponerte a que lo usemos
        o pedir que te lo demos en un archivo para llevártelo a otro sitio. Escribe a{' '}
        {CONTACTO.email} y se resuelve en un mes como máximo. Si crees que no lo hemos hecho bien,
        puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>

      <h2>Cookies</h2>
      <p>
        Esta web <strong>no usa cookies de publicidad ni de seguimiento</strong>, y no hay perfilado
        de nadie. El idioma que eliges se guarda en tu propio navegador y no se envía a ningún sitio.
      </p>
    </PaginaTexto>
  );
}
