'use client';

/**
 * QUIÉN ES IRIS, Y POR QUÉ CREERLA.
 * ============================================================================
 *
 * La tercera de las cinco cosas del encargo: «presentar a Iris, quién es y por
 * qué es autoridad». Y autoridad no es decir «llevo años»: es poder decir qué
 * haces distinto a todos los demás y que se entienda a la primera. Por eso las
 * tres fichas no son «formación, experiencia, método» —tres sustantivos que no
 * dicen nada— sino tres preguntas cortas, como pide MARCA.md §6.
 *
 * CÓMO FUNCIONA EL BLOQUE.
 * La columna de la izquierda se queda quieta mientras la derecha pasa. Es el
 * patrón de la plantilla y aquí vale para algo: el titular «no te leo la carta,
 * te enseño a leerla» sigue a la vista mientras se leen las tres pruebas de esa
 * frase. Debajo de 1024 px no hay dos columnas, así que no hay nada que quede
 * quieto y todo se apila.
 *
 * DOS OBSERVADORES, QUE NO SON EL MISMO.
 *   · Uno al 60 % dice cuál es la ficha que se está mirando, para encender su
 *     botón en el índice de la izquierda.
 *   · Otro al 15 % hace entrar la ficha desde la derecha, y sólo la primera
 *     vez: una ficha que se va y vuelve cada vez que pasas por delante marea.
 *
 * Y los dos se apagan enteros si el sistema pide menos movimiento
 * (`prefers-reduced-motion`): entonces las fichas ya están puestas desde el
 * principio y no se mueve nada. No es un extra, es la norma.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SESION } from '@/content/site';
import Sello from './Sello';

/* Los años salen de la fecha, no escritos a mano: una frase de autoridad que
   se queda vieja deja de sostener nada. */
const ANOS = new Date().getFullYear() - SESION.desde;

const FICHAS = [
  {
    id: 'quien',
    titulo: 'Quién soy',
    /* El orden de las fuentes es el del archivo MÁS LIGERO primero, y por eso
       no es el mismo en las tres: el navegador se queda con la primera que
       sabe leer, no con la más pequeña. En `antesala` y `recorrido` gana el
       webm; en `arbol-scroll` el webm pesa 300 KB MÁS que el mp4, así que ahí
       va el mp4 delante. Medido con `ls`, no supuesto. */
    fuentes: ['antesala.webm', 'antesala.mp4'],
    cartel: '',
    texto:
      `Iris Soares. Numerología transgeneracional y Kábala. Desde ${SESION.desde}, y siempre en consulta: ${ANOS} años mirando la misma cuenta en gente que no se parece en nada.`,
  },
  {
    id: 'distinto',
    titulo: 'Qué hago distinto',
    fuentes: ['recorrido.webm', 'recorrido.mp4'],
    cartel: '',
    texto:
      'No te leo la carta y ya. Te enseño la cuenta —tu fecha, tu nombre— para que la rehagas tú el día que te haga falta. Si la lectura depende de que yo esté delante, no te he enseñado nada.',
  },
  {
    id: 'llevas',
    titulo: 'Qué te llevas',
    fuentes: ['arbol-scroll.mp4', 'arbol-scroll.webm'],
    cartel: '/images/arbol-scroll-cartel.jpg',
    texto:
      'Tu patrón por escrito y con nombres: de quién viene, en qué se repite y por dónde se sale. Y detrás una escuela, que es lo que sigue abierto cuando se acaba la consulta.',
  },
];

export default function Claves() {
  const [activa, setActiva] = useState(0);
  const [vistas, setVistas] = useState<boolean[]>(() => FICHAS.map(() => false));
  const fichas = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    /* Con el movimiento reducido las fichas se dan por vistas de entrada: no
       hay nada que revelar, así que tampoco hay nada que observar. */
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto) {
      setVistas(FICHAS.map(() => true));
      return;
    }

    const nodos = fichas.current.filter(Boolean) as HTMLElement[];
    if (!nodos.length) return;

    const cual = (el: Element) => nodos.indexOf(el as HTMLElement);

    const mirando = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) setActiva(cual(e.target));
        });
      },
      { threshold: 0.6 },
    );
    const entrando = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = cual(e.target);
          setVistas((v) => (v[i] ? v : v.map((x, j) => (j === i ? true : x))));
          entrando.unobserve(e.target);
        });
      },
      { threshold: 0.15 },
    );

    nodos.forEach((n) => {
      mirando.observe(n);
      entrando.observe(n);
    });
    return () => {
      mirando.disconnect();
      entrando.disconnect();
    };
  }, []);

  const ir = (i: number) =>
    fichas.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <section className="casa-claves" id="iris">
      {/* El fondo quieto. Es la cuenta escrita a mano sobre la madera: la foto
          dice lo mismo que el bloque antes de leer una palabra. Va con un velo
          oscuro encima porque el texto es blanco y el contraste se mide sobre
          el píxel pintado, no sobre el token (MARCA.md §3). */}
      <div className="casa-claves-fondo" aria-hidden="true" />
      <div className="casa-claves-velo" aria-hidden="true" />

      <div className="casa-claves-rejilla">
        <div className="casa-claves-izq">
          <h2 className="casa-claves-h">
            Aquí no te leo la carta.
            <br />
            Te enseño a leerla.
          </h2>

          <nav className="casa-indice" aria-label="Las tres fichas">
            {FICHAS.map((f, i) => (
              <button
                key={f.id}
                type="button"
                className={`casa-indice-b${activa === i ? ' casa-indice-on' : ''}`}
                aria-current={activa === i}
                onClick={() => ir(i)}
              >
                {f.titulo}
              </button>
            ))}
          </nav>

          <div className="casa-claves-pide">
            <p>Sin cartas y sin adivinación. Dos datos que no elegiste y una cuenta que puedes rehacer.</p>
            <Link href="/cursos" className="casa-pide-boton">
              Ver los talleres
            </Link>
          </div>
        </div>

        <div className="casa-claves-der">
          {FICHAS.map((f, i) => (
            <article
              key={f.id}
              ref={(n) => {
                fichas.current[i] = n;
              }}
              className={`casa-ficha${vistas[i] ? ' casa-ficha-dentro' : ''}`}
            >
              <Sello tam={40} claro />
              <h3 className="casa-ficha-h">{f.titulo}</h3>
              <div className="casa-ficha-video">
                {/* Vídeos de la casa, no los de la plantilla. Los de la
                    plantilla viven en el CloudFront de otra cuenta: ni son
                    nuestros ni se alcanzan desde aquí. Éstos ya están medidos
                    y son 16:9, que es lo que pide el hueco. */}
                <video autoPlay muted loop playsInline preload="metadata" poster={f.cartel || undefined}>
                  {f.fuentes.map((n) => (
                    <source
                      key={n}
                      src={`/video/${n}`}
                      type={n.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
                    />
                  ))}
                </video>
              </div>
              <p className="casa-ficha-p">{f.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
