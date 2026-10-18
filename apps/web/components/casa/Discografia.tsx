'use client';

/**
 * LOS CURSOS, COMO UNA DISCOGRAFÍA.
 * ============================================================================
 *
 * Gerson: «ahí van a ir bloques cuadraditos así en figuras de 3D o algo así,
 * donde están diferentes cursos como una especie de discografía; tiene que ir
 * ahí como "selecciona tu curso" o "busca el curso que más te llame la
 * atención"».
 *
 * O sea: una estantería de discos. Cuadrados, uno al lado del otro, y cada
 * uno con su portada. Es la forma correcta para esto porque es la que ya sabe
 * leer todo el mundo —Spotify, Netflix, una estantería de vinilos— y porque
 * invita a lo que él pidió: a elegir, no a leer una lista.
 *
 * EL 3D, Y POR QUÉ ES SUTIL.
 * Cada ficha se levanta y gira un poco al pasar por encima, con perspectiva
 * de verdad (`perspective` + `rotateX/rotateY`), y el brillo del canto se
 * mueve con ella. No gira cuarenta y cinco grados: ocho. Un cartel que se
 * tuerce mucho deja de leerse como un cartel y pasa a leerse como un truco, y
 * aquí lo que tiene que destacar es el curso, no el efecto.
 *
 * LO QUE NO SE INVENTA (MARCA.md §7).
 * Hoy hay UN curso de verdad. Los huecos que lo acompañan NO llevan nombres
 * inventados ni fechas verosímiles: son huecos, se ven como huecos y lo dicen.
 * Una estantería con tres discos falsos para que no se vea vacía es
 * exactamente lo que no se hace. Cuando Iris suba el segundo, aparece solo:
 * esto lee de `CURSOS`.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CURSOS, falta } from '@/content/site';
import Sello from './Sello';

/* Cuántos huecos se dibujan detrás de los cursos reales. Cuatro en total es
   una fila completa en escritorio: con un curso quedan tres huecos, con tres
   queda uno, y a partir de cuatro no queda ninguno y la rejilla crece sola. */
const FILA = 4;

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

  const huecos = Math.max(0, FILA - CURSOS.length);

  return (
    <section className="casa-disco" id="catalogo" ref={zona} aria-labelledby="disco-h">
      <div className="casa-disco-dentro">
        <span className="casa-disco-rotulo">La estantería</span>
        <h2 className="casa-disco-h" id="disco-h">
          Busca el curso
          <br />
          <em>que más te llame</em>
        </h2>
        <p className="casa-disco-p">
          Cada uno mira una cosa distinta de lo mismo. Empieza por el que te
          reconozcas al leer el nombre.
        </p>

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
                      sizes="(max-width: 760px) 50vw, 280px"
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

          {/* LOS HUECOS. No son cursos: son sitios vacíos, y lo dicen.
              `aria-hidden` porque para quien navega a oídas un hueco no es
              información — la frase de debajo ya cuenta que vienen más. */}
          {Array.from({ length: huecos }).map((_, i) => (
            <li
              key={`hueco-${i}`}
              className="casa-disco-hueco"
              style={{ transitionDelay: `${(CURSOS.length + i) * 90}ms` }}
              aria-hidden="true"
            >
              <span className="casa-disco-ficha">
                <span className="casa-disco-cara casa-disco-cara-vacia">
                  <Sello tam={38} claro />
                </span>
                <span className="casa-disco-pie">
                  <strong>Próximamente</strong>
                  <small>Va saliendo</small>
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="casa-disco-nota">
          Los siguientes van saliendo poco a poco. Si te apuntas a la
          masterclass, te aviso de los que vengan sin que tengas que estar
          mirando.
        </p>
      </div>
    </section>
  );
}
