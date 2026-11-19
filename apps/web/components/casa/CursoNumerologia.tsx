'use client';

/**
 * LA LANDING DE LA FORMACIÓN: NUMEROLOGÍA TRANSGENERACIONAL.
 * ============================================================================
 *
 * Gerson, 19 de noviembre de 2026: «crea su apartado para que las personas se
 * puedan inscribir… hazme primero la landing de este curso nuevo».
 *
 * MISMO ESQUELETO QUE LA MASTERCLASS (`Masterclass.tsx`), a propósito: quien
 * llega de una entra a la otra y reconoce la casa. Lo que cambia es lo que se
 * cuenta, y todo sale del cartel de Iris (`FORMACION`, content/site.ts):
 *
 *   1. Arriba: la cuenta atrás al primer día, el lema, y la ficha de fechas
 *      junto al formulario. Nadie tiene que bajar para inscribirse.
 *   2. Qué aprendes: los cuatro puntos del cartel.
 *   3. Por qué formarte: los tres del cartel. «Ayuda a millones de personas»
 *      NO va: es una cifra sin respaldo (MARCA.md §7).
 *   4. Quién imparte: Iris, con la bio que aprobó ella.
 *   5. El cierre: un botón que sube al formulario. Un solo sitio de datos.
 *
 * EL PRECIO VA EN ROJO hasta que Iris lo diga. No se pone uno verosímil.
 *
 * LA INSCRIPCIÓN usa el mismo formulario y la misma ruta que la masterclass
 * (`Registro` con `formacion`), pero NO entra en sus recordatorios ni en su
 * embudo: está explicado en `esFormacion`, lib/booking.ts.
 */

import Image from 'next/image';
import Barra from './Barra';
import Pie from './Pie';
import CuentaAtras from './CuentaAtras';
import Registro from './Registro';
import Pendiente from '@/components/Pendiente';
import { BIO_IRIS, CONTACTO, FOTOS, FORMACION, falta } from '@/content/site';
import './casa.css';

export default function CursoNumerologia() {
  return (
    <div id="app" className="claro casa casa-mc-cuenta-hueco" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <CuentaAtras iso={FORMACION.iso} fecha="Domingo 22 de noviembre · 10:00 h (Madrid)" />

      {/* LA FOTO DEL CURSO ES IRIS (19 de noviembre de 2026). Gerson: «tiene
          que tener una foto diferente el curso, tanto el banner como la
          portada… la foto de inicio, tómala como referencia». Es la Iris del
          cartel —blusa verde, la mano en la barbilla, el árbol dorado— hecha
          de nuevo en apaisado y sin letras, porque el cartel trae el texto
          pintado encima y a ese tamaño se veía pixelada. Ella va a la
          derecha y la izquierda queda oscura para el titular: por eso el velo
          de aquí va de lado y no tapa la foto entera como el de la
          masterclass. */}
      <section className="casa-mc-alto casa-fm-alto">
        <Image
          className="casa-mc-fondo"
          src="/images/curso-numerologia-iris.jpg"
          alt="Iris Soares sonriendo, con la mano en la barbilla, delante de un árbol dorado con una familia de la mano en sus raíces."
          fill
          priority
          sizes="100vw"
        />
        <div className="casa-mc-velo" aria-hidden="true" />

        <header>
          <Barra />
        </header>

        <div className="casa-mc-dentro">
          <div className="casa-mc-texto">
            <span className="casa-mc-rotulo">Formación online en directo · Escuela de Sabiduría 33</span>
            {/* EL LEMA DEL CARTEL ES EL TITULAR, y el nombre de la formación
                va debajo. El nombre largo explica qué es; el lema dice qué se
                lleva quien lo hace, que es lo que decide en dos segundos. */}
            <h1 className="casa-mc-h1">
              Conoce tus raíces, libera patrones
              <b> y crea tu propio destino</b>
            </h1>
            <p className="casa-mc-p">
              <strong className="casa-fm-nombre">{FORMACION.titulo}.</strong>{' '}
              {FORMACION.subtitulo}
            </p>
            <a href="#apuntarse" className="casa-mc-cta casa-brillo">
              Reservar mi plaza
            </a>
            <p className="casa-mc-coste">Online y en directo. Plazas limitadas.</p>
          </div>

          <div className="casa-mc-rejilla">
            <div className="casa-mc-izq">
              <div className="casa-mc-presentan">
                <div className="casa-mc-presenta">
                  <span className="casa-mc-presenta-foto">
                    <Image src="/images/iris-retrato.jpg" alt="Iris Soares, sonriendo, en su consulta." width={300} height={300} sizes="56px" />
                  </span>
                  <span className="casa-mc-presenta-datos">
                    <strong>Iris Soares</strong>
                    <small>Creadora de la Numerología Transgeneracional</small>
                  </span>
                </div>
              </div>

              {/* LAS FECHAS, EN FICHA Y NO EN UNA FRASE. Son dos días con
                  horarios distintos, y en una frase se leen mal: así se ve
                  de un vistazo cuándo hay que estar y cuánto. */}
              <dl className="casa-fm-ficha">
                {FORMACION.dias.map((d) => (
                  <div key={d.dia}>
                    <dt>{d.dia}</dt>
                    <dd>{d.horas}</dd>
                  </div>
                ))}
                <div>
                  <dt>Dónde</dt>
                  <dd>{FORMACION.modalidad}, {FORMACION.zona}</dd>
                </div>
                <div>
                  <dt>Precio</dt>
                  <dd>{falta(FORMACION.precio) ? <Pendiente /> : FORMACION.precio}</dd>
                </div>
              </dl>
            </div>

            <div className="casa-mc-caja" id="apuntarse">
              <Registro formacion />
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ── QUÉ APRENDES ─────────────────────────────── */}
        <section className="casa-mc-quien" aria-labelledby="aprendes-h">
          <h2 className="casa-mc-quien-h" id="aprendes-h">Qué aprendes</h2>
          <ul className="casa-mc-lista casa-fm-cuatro">
            {FORMACION.aprendes.map((t) => (
              <li key={t}>
                <h3>{t}</h3>
              </li>
            ))}
          </ul>
        </section>

        {/* ── POR QUÉ FORMARTE ─────────────────────────── */}
        <section className="casa-mc-quien casa-fm-claro" aria-labelledby="porque-h">
          <h2 className="casa-mc-quien-h" id="porque-h">Por qué formarte</h2>
          <ul className="casa-mc-lista">
            {FORMACION.porQue.map((t) => (
              <li key={t}>
                <h3>{t}</h3>
              </li>
            ))}
          </ul>
        </section>

        {/* ── QUIÉN IMPARTE ────────────────────────────── */}
        <section className="casa-mc-quien-da" aria-labelledby="quien-h">
          <div className="casa-mc-da-dentro">
            <div className="casa-mc-da-foto">
              <Image src={FOTOS.hablando} alt="Iris Soares, sonriendo, en su consulta." width={900} height={1599} sizes="(max-width: 860px) 90vw, 340px" />
            </div>
            <div className="casa-mc-da-texto">
              <span className="casa-mc-rotulo">Quién imparte</span>
              <h2 className="casa-mc-da-h" id="quien-h">Iris Soares</h2>
              {BIO_IRIS.parrafos.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p className="casa-fm-filosofia">{BIO_IRIS.filosofia}</p>
            </div>
          </div>
        </section>

        {/* ── EL CIERRE ────────────────────────────────── */}
        <section className="casa-mc-cierre casa-fm-cierre" aria-labelledby="cierre-h">
          <div className="casa-mc-cierre-dentro">
            <span className="casa-mc-rotulo">La formación</span>
            <h2 className="casa-mc-cierre-h" id="cierre-h">
              Empieza el domingo 22 de noviembre
            </h2>
            <p className="casa-mc-cierre-p">
              Dos días online y en directo. Si tienes dudas, escríbeme a{' '}
              <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> o llama
              al <a href={FORMACION.telefonoHref}>{FORMACION.telefono}</a>.
            </p>
            <a href="#apuntarse" className="casa-mc-da-boton casa-brillo">
              Quiero inscribirme
            </a>
          </div>
        </section>
      </main>

      <Pie />
    </div>
  );
}
