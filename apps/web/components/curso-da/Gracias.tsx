/**
 * LA PÁGINA DE DESPUÉS DEL PAGO (26 de noviembre de 2026).
 *
 * Es a la que manda Stripe al terminar. No dice «ya tienes acceso» porque el
 * acceso no se da solo: lo dan Iris y Marco. Dice lo que pasa de verdad.
 */
import Barra from '@/components/casa/Barra';
import Pie from '@/components/casa/Pie';
import { CONTACTO, CURSO_DA } from '@/content/site';
import '@/components/casa/casa.css';
import './curso-da.css';

export default function Gracias() {
  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <section className="da-alto da-alto-gracias">
        <header>
          <Barra />
        </header>
        <div className="da-dentro">
          <img className="da-flor" src="/images/flor-de-lis.png" alt="" />
          <p className="da-rotulo">Pago recibido</p>
          <h1 className="da-h1">
            Gracias. <b>Ya estás dentro.</b>
          </h1>
          <p className="da-sub">
            Te damos la bienvenida al {CURSO_DA.titulo}. {CURSO_DA.empieza}.
          </p>
        </div>
      </section>
      <main className="da-main">
        <section aria-labelledby="ahora-h">
          <h2 className="da-h2" id="ahora-h">
            Qué pasa ahora
          </h2>
          <ol className="da-pasos">
            <li>
              <b>Te llega el recibo de Stripe</b> a tu correo. Guárdalo: es tu justificante.
            </li>
            <li>
              <b>Iris y Marco te escriben</b> antes del 5 de diciembre con el acceso, las fechas y cómo conectarte.
            </li>
            <li>
              <b>Mientras tanto, sigue en el grupo</b> de WhatsApp de la masterclass.
            </li>
          </ol>
          {CONTACTO.grupo && (
            <a className="da-op-boton" href={CONTACTO.grupo}>
              Ir al grupo de WhatsApp <span aria-hidden="true">→</span>
            </a>
          )}
          <p className="da-texto da-ayuda">
            ¿No te ha llegado el recibo o tienes una duda? Escribe a <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
          </p>
        </section>
      </main>
      <Pie />
    </div>
  );
}
