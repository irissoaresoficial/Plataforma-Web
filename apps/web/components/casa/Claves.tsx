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

import Image from 'next/image';
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
    /* Lo pidió Gerson con estas palabras: aquí no va «Quién soy», va ella
       presentándose. Y es mejor: un rótulo abstracto no presenta a nadie. */
    titulo: 'Hola, soy Iris Soares',
    corto: 'Quién es Iris',
    /* ÉSTA ES LA ÚNICA FICHA CON FOTO Y NO CON VÍDEO, y es a propósito. Es la
       foto de verdad de Iris dando una formación, con el micro puesto y la
       sala detrás. Un vídeo abstracto de números dorados no demuestra que
       alguien enseñe; una foto suya delante de una sala, sí. La autoridad se
       enseña, no se escribe. */
    foto: '/images/iris-consulta.jpg',
    alt: 'Iris Soares, sonriendo, en su consulta.',
    fuentes: [],
    cartel: '',
    texto:
      `Creadora de la Escuela de Sabiduría 33. Numerología transgeneracional y Kábala, desde ${SESION.desde}: ${ANOS} años mirando la misma cuenta en gente que no se parece en nada.`,
  },
  {
    id: 'distinto',
    titulo: 'Qué hago distinto',
    corto: 'Qué hago distinto',
    foto: '',
    alt: '',
    fuentes: ['recorrido.webm', 'recorrido.mp4'],
    cartel: '',
    texto:
      'No te entrego un informe y adiós. Te enseño a hacer la cuenta —tu fecha, tu nombre— para que la repitas tú el día que te haga falta. Si depende de que yo esté delante, no te he enseñado nada.',
  },
  {
    id: 'llevas',
    titulo: 'Qué te llevas',
    corto: 'Qué te llevas',
    foto: '',
    alt: '',
    /* El orden de las fuentes es el del archivo MÁS LIGERO primero, y no es el
       mismo en las dos: el navegador se queda con la primera que sabe leer, no
       con la más pequeña. En `recorrido` gana el webm; en `arbol-scroll` el
       webm pesa 300 KB MÁS que el mp4, así que ahí va el mp4 delante. Medido
       con `ls`, no supuesto. */
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
          {/* Decía «aquí no te leo la carta», y nombraba justo lo que no
              queremos que se piense. Dice lo mismo sin la carta: el trabajo
              no es darte el resultado, es que lo sepas ver tú. */}
          <h2 className="casa-claves-h">
            No te digo cuál es tu patrón.
            <br />
            Te enseño a verlo.
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
                {f.corto}
              </button>
            ))}
          </nav>

          <div className="casa-claves-pide">
            <p>El patrón se ve en tu fecha y en tu nombre. En los talleres se aprende a leerlo.</p>
            <Link href="/cursos" className="casa-pide-boton casa-brillo">
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
              <div className={`casa-ficha-video${f.foto ? ' casa-ficha-retrato' : ''}`}>
                {/* Vídeos de la casa, no los de la plantilla: los suyos viven
                    en el CloudFront de otra cuenta y ni son nuestros ni se
                    alcanzan desde aquí. La primera ficha lleva foto. */}
                {f.foto ? (
                  <Image
                    src={f.foto}
                    alt={f.alt}
                    width={900}
                    height={1599}
                    sizes="(max-width: 1023px) 100vw, 520px"
                    priority={false}
                  />
                ) : (
                  <video autoPlay muted loop playsInline preload="metadata" poster={f.cartel || undefined}>
                    {f.fuentes.map((n) => (
                      <source
                        key={n}
                        src={`/video/${n}`}
                        type={n.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
                      />
                    ))}
                  </video>
                )}
              </div>
              <p className="casa-ficha-p">{f.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
