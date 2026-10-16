'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CURSOS, falta } from '@/content/site';
import './llamada.css';

/**
 * ============================================================================
 * EL CIERRE: UN BOTÓN A LOS TALLERES Y CURSOS
 * ============================================================================
 *
 * Lo último antes del pie. Gerson lo pidió como «un CTA que es un botón a los
 * talleres y cursos», y es exactamente eso — pero con el curso delante.
 *
 * POR QUÉ EL CURSO Y NO SÓLO EL BOTÓN. Un botón suelto que pone «Ver los
 * cursos» pide un acto de fe: hay que pulsarlo para saber si hay algo. El
 * cartel del curso que hay, con su nombre, contesta esa pregunta antes de
 * pulsar — y la tarjeta de al lado dice que vienen más, que es lo que
 * distingue «una escuela empezando» de «una escuela vacía».
 *
 * SE REVELA AL ENTRAR, no al cargar: la página es un recorrido y esto es su
 * último paso, así que tiene que llegar cuando se llega, no estar esperando.
 */
export default function Llamada() {
  const caja = useRef<HTMLElement>(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return setDentro(true);
    const ojo = new IntersectionObserver(
      ([x]) => {
        if (x.isIntersecting) {
          setDentro(true);
          ojo.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    ojo.observe(el);
    return () => ojo.disconnect();
  }, []);

  const curso = CURSOS[0];

  return (
    <section
      ref={caja}
      id="cursos"
      className={`llamada claro${dentro ? ' llamada-dentro' : ''}`}
      style={{ scrollMarginTop: 80 }}
    >
      <div className="llamada-dentro-caja">
        <p className="llamada-rotulo">Escuela de Sabiduría 33</p>

        <h2 className="llamada-h">
          Aquí no te leo la carta.
          <br />
          Te enseño a leerla.
        </h2>

        <p className="llamada-p">
          Los talleres son en directo y con tu caso encima de la mesa. Quedan
          grabados, así que si un día no puedes, no lo pierdes.
        </p>

        <div className="llamada-piezas">
          {curso && (
            <article className="llamada-curso">
              {curso.cartel && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={curso.cartel} alt="" loading="lazy" />
              )}
              <div className="llamada-curso-pie">
                <h3>{curso.titulo}</h3>
                <span>{falta(curso.fechas) ? 'Fechas por confirmar' : curso.fechas}</span>
              </div>
            </article>
          )}

          <article className="llamada-pronto">
            <p>Y van saliendo más.</p>
            <span>
              Poco a poco. El catálogo los tiene todos, con sus fechas en cuanto
              se cierran.
            </span>
          </article>
        </div>

        <Link href="/cursos" className="portada-cta cta-solida llamada-boton" data-mag data-cur-label="Ver">
          <span>Ver los talleres y cursos</span>
          <i aria-hidden>→</i>
        </Link>
      </div>
    </section>
  );
}
