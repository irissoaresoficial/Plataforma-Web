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

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const CAMINOS = [
  {
    id: 'numerologia',
    nombre: 'numerología',
    img: '/images/camino-numerologia.jpg',
    a: '/numerologia',
    boton: 'ver numerología',
    /* Para quien no ve la imagen: lo que se oye no puede ser menos que lo que
       se ve. */
    alt: 'Una ficha de papel con una fecha descompuesta en cifras y sumada a mano en tinta dorada, sobre una mesa de madera oscura.',
  },
  {
    id: 'kabala',
    nombre: 'kábala',
    img: '/images/camino-kabala.jpg',
    a: '/kabala',
    boton: 'ver kábala',
    alt: 'Diez puntos de luz dorada unidos por hilos finos, dibujando el árbol de la vida sobre un fondo negro.',
  },
  {
    /* VA A LOS TALLERES, no a la membresía. Lo pidió Gerson así: «en el
       apartado de la escuela tiene que ir a donde están los talleres,
       directamente ahí». Y con el destino cambia el nombre: una puerta que
       dice «la escuela» y abre el catálogo de cursos miente en la etiqueta.
       La escuela sigue teniendo su sitio en el menú de la barra. */
    id: 'talleres',
    nombre: 'los talleres',
    img: '/images/camino-escuela.jpg',
    a: '/cursos',
    boton: 'ver los talleres',
    alt: 'Un escritorio de noche bajo una lámpara de latón, con cuadernos abiertos y libros antiguos.',
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
      {/* ESTE TITULAR YA NO SE VE, y es lo que pidió Gerson. Ponía «Por dónde
          se entra» en una franja entre las fichas y las tarjetas, y esa franja
          no era más que una banda vacía con una frase en medio: las tres
          tarjetas ya dicen por dónde se entra, con su nombre y su botón.

          Pero NO se borra: sigue en el marcado, escondido a la vista y
          perfectamente legible para un buscador y para un lector de pantalla.
          Sin él, esta sección son tres palabras giradas y ningún encabezado —
          y una sección sin encabezado no existe para quien navega a oídas.
          `.casa-oculto` es la forma correcta de esconderlo: no es
          `display:none` ni `visibility:hidden`, que lo borrarían también para
          ellos. */}
      <h2 className="casa-oculto" id="caminos-h">
        Por dónde se entra
      </h2>

      <div className={`casa-caminos-rejilla${dentro ? ' casa-caminos-dentro' : ''}`}>
        {CAMINOS.map((c, i) => (
          <article
            key={c.id}
            className="casa-camino"
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {/* IMAGEN Y NO VÍDEO, y es lo que arregla esta sección.
                Aquí había tres vídeos de la casa y los tres eran claros —crema
                y dorado—, así que el nombre en blanco encima pedía un velo tan
                espeso que ya no se veía el vídeo: se pagaba el peso sin
                recibir la imagen. Éstas están hechas a medida del problema:
                negras, con la luz a la derecha y el tercio izquierdo vacío,
                que es justo donde cae el nombre.
                Y pesan 120 KB en vez de 1,6 MB entre las tres. */}
            <Image
              className="casa-camino-img"
              src={c.img}
              alt={c.alt}
              width={1200}
              height={1600}
              sizes="(max-width: 767px) 100vw, 33vw"
            />
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
