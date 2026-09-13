import PaginaTexto from '@/components/PaginaTexto';
/*
 * SÍ, TAMBIÉN EL AVISO LEGAL.
 *
 * «Toda la web» incluye esto, y aquí hasta se agradece: son ocho bloques de
 * texto seguidos sin una sola foto, y que cada apartado entre al llegar a él es
 * lo único que marca dónde acaba uno y empieza el siguiente mientras se baja.
 *
 * El molde (`PaginaTexto`) no se toca: el movimiento se pone aquí, envolviendo
 * cada apartado. La hoja de estilos legal usa selectores de descendencia
 * —`.texto-legal h2`, `.texto-legal p`— así que meter un envoltorio en medio no
 * le quita el estilo a nada.
 *
 * El titular y la entradilla se quedan quietos a propósito: están en la primera
 * pantalla, y lo que ya se ve al cargar no entra — ya ha entrado.
 */
import Aparece from '@/components/Aparece';
import { CONTACTO, TITULAR } from '@/content/site';
import { Texto } from '@/components/Pendiente';

export const metadata = {
  title: 'Aviso legal · Iris Soares',
  description: 'Quién está detrás de esta web, qué se ofrece aquí y bajo qué condiciones.',
};

export default function Legal() {
  return (
    <PaginaTexto
      titulo="Aviso legal"
      entradilla="Quién está detrás de esta web, qué se ofrece en ella y con qué reglas. Sin letra pequeña."
      actualizado="4 de septiembre de 2026"
    >
      <Aparece>
        <h2>Quién es responsable de esta web</h2>
      </Aparece>
      <Aparece retraso={1}>
      <ul>
        <li>
          <strong>Titular:</strong> <Texto valor={TITULAR.nombre} />
        </li>
        <li>
          <strong>NIF:</strong> <Texto valor={TITULAR.nif} />
        </li>
        <li>
          <strong>Dirección:</strong> <Texto valor={TITULAR.direccion} />
        </li>
        <li>
          <strong>Correo:</strong> {CONTACTO.email}
        </li>
        <li>
          <strong>Actividad:</strong> sesiones, cursos y formación en gestión emocional y numerología
          transgeneracional, en línea.
        </li>
      </ul>
      </Aparece>

      <Aparece>
        <h2>Qué se ofrece aquí, y qué no</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        En esta web se reservan sesiones individuales, se apunta uno a cursos y talleres, y se puede
        hacer un estudio breve y gratuito. Todo se presta en línea.
      </p>
      <p>
        <strong>Esto no es un tratamiento médico ni psicológico y no sustituye a ninguno.</strong> Si
        estás en tratamiento, sigue con él. Si atraviesas una urgencia de salud mental, acude a los
        servicios sanitarios: en España, el 112 o el 024.
      </p>
      <p>
        Lo que se trabaja aquí es de acompañamiento y autoconocimiento. No se diagnostica, no se
        receta y no se promete un resultado concreto, porque depende de cada persona y de lo que haga
        con lo que ve.
      </p>
      </Aparece>

      <Aparece>
        <h2>Reservas, pagos y cancelaciones</h2>
      </Aparece>
      <Aparece retraso={1}>
      <ul>
        {/* Mientras no haya enlace de pago, esta condición no se puede aplicar y
            por tanto no se escribe: unas condiciones que la propia web no cumple
            valen menos que no tenerlas. Se enciende sola con la variable
            NEXT_PUBLIC_PAGO_SESION, la misma que usa el agente del chat. */}
        {process.env.NEXT_PUBLIC_PAGO_SESION ? (
          <li>
            <strong>La sesión se paga al reservar.</strong> El enlace de pago te llega junto con la
            invitación, y la reserva queda cerrada cuando el pago está hecho: hasta entonces esa hora
            sigue disponible para otra persona.
          </li>
        ) : (
          <li>Una reserva queda hecha cuando recibes el correo de confirmación con el enlace de la sesión.</li>
        )}
        <li>
          Los cobros se hacen a través de Stripe. Esta web no guarda ni ve los datos de tu tarjeta en
          ningún momento.
        </li>
        <li>
          Puedes <strong>cambiar el día de tu sesión</strong> avisando con al menos{' '}
          <strong>24 horas</strong> de antelación, escribiendo a {CONTACTO.email}. Con menos de 24
          horas de aviso, la hora se da por dada.
        </li>
        <li>
          Si tienes derecho de desistimiento como consumidor, dispones de 14 días naturales desde la
          compra, salvo que el servicio ya se haya prestado por completo con tu consentimiento previo.
        </li>
      </ul>
      </Aparece>

      <Aparece>
        <h2>Contenido de la web</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        Los textos, el método, las imágenes y el símbolo de la Escuela de Sabiduría 33 son de su
        autora. Puedes citarlos indicando de dónde salen; no puedes reproducirlos como propios ni
        usarlos con fines comerciales sin permiso por escrito.
      </p>
      </Aparece>

      <Aparece>
        <h2>Enlaces a otros sitios</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        Cuando esta web enlaza a un servicio de terceros —el calendario, la pasarela de pago o una
        red social—, ese servicio se rige por sus propias condiciones. No respondemos de lo que
        ocurra dentro de ellos.
      </p>
      </Aparece>

      <Aparece>
        <h2>Ley aplicable</h2>
      </Aparece>
      <Aparece retraso={1}>
      <p>
        Esta web se rige por la ley española. Si algo no se puede resolver hablando, serán
        competentes los juzgados que correspondan según la normativa de consumidores.
      </p>
      </Aparece>
    </PaginaTexto>
  );
}
