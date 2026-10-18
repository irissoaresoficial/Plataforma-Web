'use client';

/**
 * LOS TRES CAMINOS.
 * ============================================================================
 *
 * La plantilla que pasó Gerson era un «Categories» de tienda —face, beauty
 * tools, body— con el nombre escrito en vertical sobre un vídeo y un botón
 * abajo. Aquí son las tres puertas de la casa, que es lo que pidió:
 * numerología, kábala y la escuela.
 *
 * Y el sitio es exactamente éste: después de que alguien haya entendido el
 * patrón (la portada), de dónde viene (el crema) y quién es Iris (las fichas),
 * lo único que queda es «¿y por dónde entro?». Tres puertas, una por camino,
 * y debajo el pie.
 *
 * EL NOMBRE EN VERTICAL, QUE ES LO QUE HACE LA SECCIÓN.
 * `writing-mode: vertical-lr` pone el texto de arriba abajo; el `rotate(180deg)`
 * lo da la vuelta para que se lea de abajo arriba, que es como se leen los
 * lomos de los libros en español. Sin el giro se lee al revés y parece un
 * error de maqueta.
 *
 * `lang="es"` en el <h2> no es decorativo: con el texto girado, un lector de
 * pantalla necesita saber el idioma para pronunciar «kábala» y no deletrearlo.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CAMINOS = [
  {
    id: 'numerologia',
    nombre: 'numerología',
    /* Vertical y ligero. Los de la plantilla viven en el CloudFront de otra
       cuenta: ni son nuestros ni se alcanzan desde aquí. */
    fuentes: ['recorrido-vertical.webm', 'recorrido-vertical.mp4'],
    cartel: '/images/arbol-vertical-cartel.jpg',
    a: '/numerologia',
    boton: 'ver numerología',
    /* Para quien no ve el vídeo: lo que se oye no puede ser menos que lo que
       se ve. */
    alt: 'Números de tinta que se van convirtiendo en hilos de oro.',
  },
  {
    id: 'kabala',
    nombre: 'kábala',
    /* EL APAISADO, NO EL VERTICAL, y el motivo se ve en una captura.
       `arbol-vertical` se fabricó metiendo el apaisado dentro de un marco
       vertical, así que lleva dos bandas grises pegadas arriba y abajo. En
       una ficha a sangre esas bandas no se recortan —`cover` sólo quita 51 px
       y las bandas miden cuatro veces eso— y la ficha salía con dos franjas.
       El apaisado recortado al centro llena de borde a borde, y el árbol está
       centrado, que es lo que hace que funcione. */
    fuentes: ['arbol-scroll.mp4', 'arbol-scroll.webm'],
    cartel: '/images/arbol-scroll-cartel.jpg',
    a: '/kabala',
    boton: 'ver kábala',
    alt: 'El árbol de la vida dibujándose con diez puntos de luz.',
  },
  {
    id: 'escuela',
    nombre: 'la escuela',
    fuentes: ['antesala-vertical.webm', 'antesala-vertical.mp4'],
    cartel: '/images/arbol-scroll-cartel.jpg',
    a: '/membresia',
    boton: 'ver la escuela',
    alt: 'Una luz que se abre despacio sobre un fondo crema.',
  },
];

export default function Caminos() {
  const zona = useRef<HTMLElement>(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDentro(true);
      return;
    }
    /* Una sola vez: en cuanto entra se deja de mirar. Una sección que se va y
       vuelve cada vez que pasas por delante marea. */
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

  return (
    <section className="casa-caminos" id="caminos" ref={zona} aria-labelledby="caminos-h">
      {/* El titular de la sección existe para los buscadores y para quien
          navega con lector de pantalla: sin él, esto son tres palabras
          giradas y ningún encabezado. Se ve, porque esconder texto que sólo
          leen las máquinas es de lo que penaliza Google. */}
      <h2 className="casa-caminos-h" id="caminos-h">
        Por dónde se entra
      </h2>

      <div className={`casa-caminos-rejilla${dentro ? ' casa-caminos-dentro' : ''}`}>
        {CAMINOS.map((c, i) => (
          <article
            key={c.id}
            className="casa-camino"
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <video
              className="casa-camino-video"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={c.cartel}
              aria-label={c.alt}
            >
              {c.fuentes.map((n) => (
                <source key={n} src={`/video/${n}`} type={n.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
              ))}
            </video>
            <div className="casa-camino-velo" aria-hidden="true" />

            <h3 className="casa-camino-nombre" lang="es">
              {c.nombre}
            </h3>

            <Link href={c.a} className="casa-camino-boton casa-brillo">
              {c.boton}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
