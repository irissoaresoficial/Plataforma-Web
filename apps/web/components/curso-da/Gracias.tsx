'use client';

/**
 * LA PÁGINA DE DESPUÉS DEL PAGO (26 de noviembre de 2026).
 *
 * Es a la que manda Stripe al terminar. No dice «ya tienes acceso» porque el
 * acceso no se da solo: lo dan Iris y Marco. Dice lo que pasa de verdad.
 */
import Barra from '@/components/casa/Barra';
import Pie from '@/components/casa/Pie';
import { CONTACTO, CURSO_DA, CURSO_DA_PT } from '@/content/site';
import { T, type Idioma } from './textos';
import { Selector, useIdioma } from './idioma';
import '@/components/casa/casa.css';
import './curso-da.css';

export default function Gracias({ idioma: inicial = 'es' }: { idioma?: Idioma }) {
  const idioma = useIdioma(inicial);
  const t = T[idioma.v];
  const d = idioma.v === 'pt' ? CURSO_DA_PT : CURSO_DA;
  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <section className="da-alto da-alto-gracias">
        <header>
          <Barra />
        </header>
        <Selector idioma={idioma} />
        <div className="da-dentro">
          <img className="da-flor" src="/images/flor-de-lis.png" alt="" />
          <p className="da-rotulo">{t.recibido}</p>
          <h1 className="da-h1">
            {t.gracias} <b>{t.dentro}</b>
          </h1>
          <p className="da-sub">
            {t.bienvenida} {d.titulo}. {d.empieza}.
          </p>
        </div>
      </section>
      <main className="da-main">
        <section aria-labelledby="ahora-h">
          <h2 className="da-h2" id="ahora-h">
            {t.ahora}
          </h2>
          <ol className="da-pasos">
            {[t.p1, t.p2, t.p3].map(([b, r]) => (
              <li key={b}>
                <b>{b}</b>
                {r}
              </li>
            ))}
          </ol>
          {CONTACTO.grupo && (
            <a className="da-op-boton" href={CONTACTO.grupo}>
              {t.grupo} <span aria-hidden="true">→</span>
            </a>
          )}
          <p className="da-texto da-ayuda">
            {t.ayuda} <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
          </p>
        </section>
      </main>
      <Pie />
    </div>
  );
}
