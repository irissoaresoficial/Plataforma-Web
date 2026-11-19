'use client';

/**
 * LA COLUMNA QUIETA Y LAS FICHAS QUE PASAN.
 * ============================================================================
 *
 * En la portada es «quién es Iris y por qué creerla». En numerología es «qué
 * sale de tu nombre y de tu fecha». En kábala, «los diez puntos y los
 * veintidós caminos». Es el mismo bloque diciendo tres cosas distintas, y por
 * eso lleva parámetros en vez de estar escrito a mano tres veces.
 *
 * Gerson, el 18 de octubre: «el mismo diseño que tenemos en la home adaptado a
 * la comunicación del apartado». Esto es exactamente eso: el mismo componente,
 * otro contenido. Lo que se arregle aquí se arregla en las tres páginas.
 * Sin parámetros, `<Claves />` sigue siendo el de la portada.
 *
 * CÓMO FUNCIONA EL BLOQUE.
 * La columna de la izquierda se queda quieta mientras la derecha pasa. El
 * titular sigue a la vista mientras se leen las fichas que lo demuestran.
 * Debajo de 1024 px no hay dos columnas, así que no hay nada que quede quieto
 * y todo se apila.
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
import { BIO_IRIS } from '@/content/site';
import Sello from './Sello';

/* AQUÍ SE CALCULABAN LOS AÑOS (`ANOS`, desde `SESION.desde`) para la frase
   de Iris. Desde el 19 de noviembre la ficha lleva su bio, con sus cifras
   escritas por ella («16 años de trayectoria»): si cambian, se cambian en
   `BIO_IRIS`, content/site.ts. */

export type FichaClave = {
  id: string;
  /** El título de la ficha. */
  titulo: string;
  /** Cómo se llama en el índice de la izquierda. Corto, que es un botón. */
  corto: string;
  /** Un párrafo, o varios. */
  texto: string | string[];
  /**
   * LO QUE SE LEE AL DESPLEGAR. Para las fichas cuyo texto es largo de verdad
   * (el de Iris en «Qué te llevas»): arriba la frase principal, y la lista y
   * el cierre detrás de «Seguir leyendo». En un móvil, nueve párrafos
   * seguidos en una ficha empujan el resto de la portada dos pantallas.
   */
  mas?: { intro?: string; lista?: string[]; cierre?: string[] };
  /** Una línea de cierre, destacada con el filete dorado. */
  remate?: string[];
  /** Una foto. Si la lleva, el hueco pasa a vertical (4:5). */
  foto?: string;
  alt?: string;
  /** O un vídeo, con sus fuentes en orden de peso. Manda la foto si hay las dos. */
  fuentes?: string[];
  cartel?: string;
};

const FICHAS: FichaClave[] = [
  {
    id: 'quien',
    /* Lo pidió Gerson con estas palabras: aquí no va «Quién soy», va ella
       presentándose. Y es mejor: un rótulo abstracto no presenta a nadie. */
    titulo: 'Hola, soy Iris Soares',
    corto: 'Quién es Iris',
    /* ÉSTA ES LA ÚNICA FICHA CON FOTO Y NO CON VÍDEO, y es a propósito. Es la
       foto de verdad de Iris, con la sala detrás. Un vídeo abstracto de
       números dorados no demuestra que alguien enseñe; una foto suya delante
       de una sala, sí. La autoridad se enseña, no se escribe. */
    foto: '/images/iris-consulta.jpg',
    alt: 'Iris Soares, sonriendo, en su consulta.',
    /* LA BIO DE IRIS, la que aprobó ella (19 de noviembre de 2026). En la
       ficha van los dos primeros párrafos y, de cierre, su filosofía y su
       metodología. El tercer párrafo va entero en la landing de la formación. */
    texto: BIO_IRIS.parrafos.slice(0, 2),
    remate: [BIO_IRIS.filosofia, BIO_IRIS.metodo],
  },
  {
    id: 'distinto',
    titulo: 'Qué hago distinto',
    corto: 'Qué hago distinto',
    fuentes: ['recorrido.webm', 'recorrido.mp4'],
    texto:
      'No te entrego un informe y adiós. Te enseño a hacer la cuenta —tu fecha, tu nombre— para que la repitas tú el día que te haga falta. Si depende de que yo esté delante, no te he enseñado nada.',
  },
  {
    id: 'llevas',
    titulo: 'Qué te llevas',
    corto: 'Qué te llevas',
    /* El orden de las fuentes es el del archivo MÁS LIGERO primero, y no es el
       mismo en las dos: el navegador se queda con la primera que sabe leer, no
       con la más pequeña. En `recorrido` gana el webm; en `arbol-scroll` el
       webm pesa 300 KB MÁS que el mp4, así que ahí va el mp4 delante. Medido
       con `ls`, no supuesto. */
    fuentes: ['arbol-scroll.mp4', 'arbol-scroll.webm'],
    cartel: '/images/arbol-scroll-cartel.jpg',
    /* TEXTO DE IRIS (19 de noviembre de 2026). Sustituye a «Tu patrón por
       escrito y con nombres…». Es largo, así que la frase principal va a la
       vista y la lista y el cierre, al desplegar. */
    texto:
      'Te llevas un análisis numerológico profundo y un estudio exhaustivo de tu árbol genealógico para comprender tu historia, identificar patrones, reconocer lealtades familiares y descubrir aquello que puede estar condicionando tu presente.',
    mas: {
      intro: 'Pero, sobre todo, te llevas:',
      lista: [
        'Conocimiento: una comprensión más profunda de ti y de tu historia.',
        'Conciencia: identificar patrones y repeticiones que antes pasaban desapercibidos.',
        'Paz y armonía con tu clan: aprender a mirar tu historia familiar desde un lugar diferente.',
        'Libertad personal: diferenciar tu propio camino de las historias heredadas.',
        'Claridad: reconocer tus recursos, capacidades y nuevas posibilidades.',
        'Autonomía: disponer de herramientas para tomar decisiones más conscientes y construir tu propio futuro.',
      ],
      cierre: [
        'Porque conocer tu historia no significa quedarte viviendo en ella. Significa tener más recursos para decidir cómo quieres continuarla.',
      ],
    },
  },
];

export default function Claves({
  id = 'iris',
  /* Decía «aquí no te leo la carta», y nombraba justo lo que no queremos que
     se piense. Dice lo mismo sin la carta: el trabajo no es darte el
     resultado, es que lo sepas ver tú. */
  titulo = (
    <>
      No te digo cuál es tu patrón.
      <br />
      Te enseño a verlo.
    </>
  ),
  fichas = FICHAS,
  pide = {
    texto: 'El patrón se ve en tu fecha y en tu nombre. En los talleres se aprende a leerlo.',
    boton: { a: '/cursos', texto: 'Ver los talleres' },
  },
  /* El fondo quieto, detrás de todo. En la portada es la cuenta escrita a mano
     sobre la madera: la foto dice lo mismo que el bloque antes de leer una
     palabra. Va con un velo oscuro encima porque el texto es blanco y el
     contraste se mide sobre el píxel pintado, no sobre el token (MARCA.md §3).
     Se pasa por variable de CSS y no por una clase nueva: así cada página
     elige la suya sin que haya que escribir una regla por página. */
  fondo = '/images/la-cuenta.jpg',
}: {
  id?: string;
  titulo?: React.ReactNode;
  fichas?: FichaClave[];
  pide?: { texto: string; boton: { a: string; texto: string } };
  fondo?: string;
}) {
  const [activa, setActiva] = useState(0);
  const [vistas, setVistas] = useState<boolean[]>(() => fichas.map(() => false));
  const cajas = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    /* Con el movimiento reducido las fichas se dan por vistas de entrada: no
       hay nada que revelar, así que tampoco hay nada que observar. */
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto) {
      setVistas(fichas.map(() => true));
      return;
    }

    const nodos = cajas.current.filter(Boolean) as HTMLElement[];
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
  }, [fichas]);

  const ir = (i: number) =>
    cajas.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <section
      className="casa-claves"
      id={id}
      style={{ ['--casa-claves-fondo' as string]: `url('${fondo}')` }}
    >
      <div className="casa-claves-fondo" aria-hidden="true" />
      <div className="casa-claves-velo" aria-hidden="true" />

      <div className="casa-claves-rejilla">
        <div className="casa-claves-izq">
          <h2 className="casa-claves-h">{titulo}</h2>

          <nav className="casa-indice" aria-label="Índice de la sección">
            {fichas.map((f, i) => (
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
            <p>{pide.texto}</p>
            <Link href={pide.boton.a} className="casa-pide-boton casa-brillo">
              {pide.boton.texto}
            </Link>
          </div>
        </div>

        <div className="casa-claves-der">
          {fichas.map((f, i) => (
            <article
              key={f.id}
              ref={(n) => {
                cajas.current[i] = n;
              }}
              className={`casa-ficha${vistas[i] ? ' casa-ficha-dentro' : ''}`}
            >
              <Sello tam={40} claro />
              <h3 className="casa-ficha-h">{f.titulo}</h3>

              {/* UNA FICHA PUEDE NO LLEVAR IMAGEN, y entonces no se pinta el
                  hueco. En numerología son cinco piezas de una cuenta: un
                  rectángulo gris de relleno en cada una sería ruido cinco
                  veces. Donde hay algo de verdad que enseñar, se enseña. */}
              {(f.foto || f.fuentes?.length) && (
                <div className={`casa-ficha-video${f.foto ? ' casa-ficha-retrato' : ''}`}>
                  {/* Vídeos de la casa, no los de la plantilla: los suyos
                      viven en el CloudFront de otra cuenta y ni son nuestros
                      ni se alcanzan desde aquí. */}
                  {f.foto ? (
                    <Image
                      src={f.foto}
                      alt={f.alt ?? ''}
                      width={900}
                      height={1599}
                      sizes="(max-width: 1023px) 100vw, 520px"
                    />
                  ) : (
                    <video autoPlay muted loop playsInline preload="metadata" poster={f.cartel || undefined}>
                      {f.fuentes!.map((n) => (
                        <source
                          key={n}
                          src={`/video/${n}`}
                          type={n.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
                        />
                      ))}
                    </video>
                  )}
                </div>
              )}

              {(Array.isArray(f.texto) ? f.texto : [f.texto]).map((t) => (
                <p className="casa-ficha-p" key={t.slice(0, 32)}>{t}</p>
              ))}

              {f.remate?.map((t) => (
                <p className="casa-ficha-p casa-ficha-remate" key={t.slice(0, 32)}>{t}</p>
              ))}

              {/* `<details>` y no un botón con estado: se abre sin JavaScript,
                  lo anuncia bien un lector de pantalla y el buscador lee el
                  texto entero aunque esté plegado. */}
              {f.mas && (
                <details className="casa-ficha-mas">
                  <summary>Seguir leyendo</summary>
                  {f.mas.intro && <p className="casa-ficha-p casa-ficha-intro">{f.mas.intro}</p>}
                  {f.mas.lista && (
                    <ul className="casa-ficha-lista">
                      {f.mas.lista.map((t) => {
                        const [clave, ...resto] = t.split(': ');
                        return (
                          <li key={clave}>
                            <b>{clave}:</b> {resto.join(': ')}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {f.mas.cierre?.map((t) => (
                    <p className="casa-ficha-p casa-ficha-remate" key={t.slice(0, 32)}>{t}</p>
                  ))}
                </details>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
