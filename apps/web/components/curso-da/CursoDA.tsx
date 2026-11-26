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
import { CONTACTO, CURSO_DA, CURSO_DA_PT } from '@/content/site';
import { T, type Idioma } from './textos';
import { Selector, useIdioma } from './idioma';
import '@/components/casa/casa.css';
import './curso-da.css';

function quedan(hasta: number, ahora: number) {
  const s = Math.max(0, Math.floor((hasta - ahora) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h} h ${String(m).padStart(2, '0')} min`;
}

export default function CursoDA({ idioma: inicial = 'es' }: { idioma?: Idioma }) {
  const idioma = useIdioma(inicial);
  const t = T[idioma.v];
  const pt = idioma.v === 'pt';
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
        <Selector idioma={idioma} />
        <div className="da-dentro">
          <img className="da-flor" src="/images/flor-de-lis.png" alt="" />
          <p className="da-rotulo">{t.rotulo}</p>
          <h1 className="da-h1">
            {t.curso} <b>{t.nombre}</b>
          </h1>
          <p className="da-sub">
            {pt ? CURSO_DA_PT.con : CURSO_DA.con}. {pt ? CURSO_DA_PT.empieza : CURSO_DA.empieza}.
          </p>
          {ofertaViva && ahora !== null && (
            <p className="da-cuenta">
              {t.termina} <b>{quedan(fin, ahora)}</b>
            </p>
          )}
        </div>
      </section>

      <main className="da-main">
        <section aria-labelledby="pagar-h">
          <h2 className="da-h2" id="pagar-h">
            {t.elige}
          </h2>
          <div className="da-opciones">
            {opciones.map((o0) => {
              const o = pt ? { ...o0, ...CURSO_DA_PT.opciones[o0.id] } : o0;
              return (
              <article key={o.id} className={`da-op${o.oferta ? ' da-op-oferta' : ''}`}>
                <p className="da-op-rotulo">{o.rotulo}</p>
                <p className="da-op-cifra">{o.cifra}</p>
                <p className="da-op-detalle">{o.detalle}</p>
                {o.nota && <p className="da-op-nota">{o.nota}</p>}
                {o.stripe ? (
                  <a className="da-op-boton" href={o.stripe}>
                    {o.oferta ? t.pagarHoy : t.pagar} <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="da-op-pendiente">
                    {t.enlace} <Pendiente />
                  </span>
                )}
              </article>
              );
            })}
          </div>
          <p className="da-plazo">
            {pt ? CURSO_DA_PT.plazo : CURSO_DA.plazo} · {pt ? CURSO_DA_PT.empieza : CURSO_DA.empieza}
          </p>
        </section>

        <section className="da-temario" aria-labelledby="temario-h">
          <h2 className="da-h2" id="temario-h">
            {t.trabajar}
          </h2>
          <p className="da-texto">{t.diez}</p>
          <ol className="da-lista">
            {(pt ? CURSO_DA_PT.seminarios : CURSO_DA.seminarios).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <section className="da-dudas">
          <h2 className="da-h2">{t.dudas}</h2>
          <p className="da-texto">
            {t.escribe}{' '}
            <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
          </p>
          {CONTACTO.grupo && (
            <a className="da-op-boton da-boton-claro" href={CONTACTO.grupo}>
              {t.grupo} <span aria-hidden="true">→</span>
            </a>
          )}
        </section>
      </main>
      <Pie />
    </div>
  );
}
