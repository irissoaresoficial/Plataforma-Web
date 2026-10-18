'use client';

/**
 * LOS CURSOS, COMO UNA DISCOGRAFÍA.
 * ============================================================================
 *
 * Gerson: «ahí van a ir bloques cuadraditos así en figuras de 3D o algo así,
 * donde están diferentes cursos como una especie de discografía».
 *
 * O sea: una estantería de discos. Es la forma correcta para esto porque es la
 * que ya sabe leer todo el mundo —Spotify, Netflix, una estantería de vinilos—
 * y porque invita a lo que él pidió: a elegir, no a leer una lista.
 *
 * SE HAN IDO LOS HUECOS, Y ÉSTE ES EL MOTIVO.
 * Aquí había tres fichas vacías con el canto de rayas y la palabra
 * «Próximamente» debajo, para que la fila de cuatro no se viera coja. Gerson,
 * el 18 de octubre: «elimina esos espacios, que solo se vea uno de momento».
 *
 * Tenía razón, y no es cuestión de gusto. Tres huecos al lado de un curso de
 * verdad dicen en voz alta que aquí casi no hay nada — justo lo contrario de
 * lo que tiene que decir la página que vende los talleres. Un disco solo en
 * una estantería es un disco; un disco con tres fundas vacías al lado es una
 * tienda que está cerrando.
 *
 * ENTONCES, ¿QUÉ LLENA LA FRANJA?
 * El texto. La sección pasa a dos columnas —lo que se cuenta a la izquierda,
 * la estantería a la derecha—, que es el mismo reparto que usa el bloque de
 * Iris en la portada. Con un curso, la franja está llena igual y la ficha se
 * queda del tamaño de un cartel, centrada en su mitad, en vez de estirarse
 * media pantalla. Con cuatro, la rejilla crece sola y no hay que tocar nada.
 *
 * Y EL TEXTO SE AJUSTA SOLO AL NÚMERO DE CURSOS. «Busca el curso que más te
 * llame» con un solo curso delante es una frase que se ríe de quien la lee.
 * Mientras haya uno, dice que hay uno; en cuanto Iris suba el segundo, vuelve
 * a invitar a elegir. Lo decide `CURSOS.length`, no una mano.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CURSOS, falta } from '@/content/site';
import Sello from './Sello';

export default function Discografia() {
  const zona = useRef<HTMLElement>(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDentro(true);
      return;
    }
    const ojo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDentro(true);
          ojo.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    ojo.observe(el);
    return () => ojo.disconnect();
  }, []);

  const uno = CURSOS.length === 1;

  return (
    <section className="casa-disco" id="catalogo" ref={zona} aria-labelledby="disco-h">
      <div className="casa-disco-dentro">
        <div className="casa-disco-texto">
          <span className="casa-disco-rotulo">La estantería</span>
          <h2 className="casa-disco-h" id="disco-h">
            {uno ? (
              <>
                Ahora mismo
                <br />
                hay uno abierto
              </>
            ) : (
              <>
                Busca el curso
                <br />
                que más te llame
              </>
            )}
          </h2>
          <p className="casa-disco-p">
            {uno
              ? 'Se abren de uno en uno y se trabajan en directo, con los casos de quien está dentro. Éste es el que está en pie hoy, y se entra por la masterclass, que es gratis.'
              : 'Cada uno mira una cosa distinta de lo mismo. Empieza por el que te reconozcas al leer el nombre.'}
          </p>
          <p className="casa-disco-nota">
            Los siguientes van saliendo poco a poco. Si te apuntas a la
            masterclass, te aviso de los que vengan sin que tengas que estar
            mirando.
          </p>
        </div>

        <ul className={`casa-disco-rejilla${dentro ? ' casa-disco-dentro-ok' : ''}`}>
          {CURSOS.map((c, i) => (
            <li key={c.id} style={{ transitionDelay: `${i * 90}ms` }}>
              {/* Todos los cursos de hoy llevan a la masterclass, que es por
                  donde se entra a Desórdenes Amorosos. Cuando haya cursos con
                  página propia, esto pasa a `/cursos/${c.id}`. */}
              <Link href="/masterclass" className="casa-disco-ficha">
                <span className="casa-disco-cara">
                  {/* El campo se llama `cartel` y es opcional: un curso sin
                      cartel no rompe la estantería, enseña el sello. Mejor un
                      hueco honesto que una imagen de relleno. */}
                  {c.cartel ? (
                    <Image
                      src={c.cartel}
                      alt=""
                      width={1920}
                      height={1080}
                      sizes="(max-width: 860px) 90vw, 380px"
                    />
                  ) : (
                    <Sello tam={38} claro />
                  )}
                  <span className="casa-disco-brillo" aria-hidden="true" />
                </span>
                <span className="casa-disco-pie">
                  <strong>{c.titulo}</strong>
                  <small>{falta(c.fechas) ? 'Masterclass gratuita' : c.fechas}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
