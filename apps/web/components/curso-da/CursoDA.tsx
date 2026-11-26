'use client';

/**
 * CÓMO PAGAR EL CURSO DESÓRDENES AMOROSOS (26 de noviembre de 2026).
 *
 * Gerson: «una página con todas las condiciones de pago según el papelito:
 * si vas a pagar hoy, clic aquí; si vas a pagar así, clic aquí. Sencilla,
 * bonita». Los datos viven en `CURSO_DA` (content/site.ts).
 *
 * La oferta de 999 € desaparece sola cuando pasa su hora: no se puede seguir
 * vendiendo una «oferta de hoy» que ya no lo es.
 */

import { useEffect, useState } from 'react';
import Barra from '@/components/casa/Barra';
import Pie from '@/components/casa/Pie';
import Pendiente from '@/components/Pendiente';
import { CONTACTO, CURSO_DA } from '@/content/site';
import '@/components/casa/casa.css';
import './curso-da.css';

function quedan(hasta: number, ahora: number) {
  const s = Math.max(0, Math.floor((hasta - ahora) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h} h ${String(m).padStart(2, '0')} min`;
}

export default function CursoDA() {
  const fin = new Date(CURSO_DA.ofertaHasta).getTime();
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const ofertaViva = ahora === null || ahora < fin;
  const opciones = CURSO_DA.opciones.filter((o) => !o.oferta || ofertaViva);

  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <section className="da-alto">
        <header>
          <Barra />
        </header>
        <div className="da-dentro">
          <img className="da-flor" src="/images/flor-de-lis.png" alt="" />
          <p className="da-rotulo">Escuela de Sabiduría 33</p>
          <h1 className="da-h1">
            Curso <b>Desórdenes Amorosos</b>
          </h1>
          <p className="da-sub">
            {CURSO_DA.con}. {CURSO_DA.empieza}.
          </p>
          {ofertaViva && ahora !== null && (
            <p className="da-cuenta">
              La oferta de 999 € termina en <b>{quedan(fin, ahora)}</b>
            </p>
          )}
        </div>
      </section>

      <main className="da-main">
        <section aria-labelledby="pagar-h">
          <h2 className="da-h2" id="pagar-h">
            Elige cómo pagar
          </h2>
          <div className="da-opciones">
            {opciones.map((o) => (
              <article key={o.id} className={`da-op${o.oferta ? ' da-op-oferta' : ''}`}>
                <p className="da-op-rotulo">{o.rotulo}</p>
                <p className="da-op-cifra">{o.cifra}</p>
                <p className="da-op-detalle">{o.detalle}</p>
                {o.nota && <p className="da-op-nota">{o.nota}</p>}
                {o.stripe ? (
                  <a className="da-op-boton" href={o.stripe}>
                    {o.oferta ? 'Pagar 999 € ahora' : 'Pagar así'} <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="da-op-pendiente">
                    Enlace de pago <Pendiente />
                  </span>
                )}
              </article>
            ))}
          </div>
          <p className="da-plazo">
            {CURSO_DA.plazo} · {CURSO_DA.empieza}
          </p>
        </section>

        <section className="da-temario" aria-labelledby="temario-h">
          <h2 className="da-h2" id="temario-h">
            Lo que vas a trabajar
          </h2>
          <p className="da-texto">Diez seminarios. Psicología con Marco y numerología transgeneracional con Iris.</p>
          <ol className="da-lista">
            {CURSO_DA.seminarios.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="da-dudas">
          <h2 className="da-h2">¿Tienes dudas antes de pagar?</h2>
          <p className="da-texto">
            Escríbenos en el grupo de WhatsApp de la masterclass o a{' '}
            <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
          </p>
          {CONTACTO.grupo && (
            <a className="da-op-boton da-boton-claro" href={CONTACTO.grupo}>
              Ir al grupo de WhatsApp <span aria-hidden="true">→</span>
            </a>
          )}
        </section>
      </main>
      <Pie />
    </div>
  );
}
