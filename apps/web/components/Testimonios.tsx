'use client';

/**
 * LOS COMENTARIOS DE INSTAGRAM
 *
 * Un carrusel de comentarios reales de la cuenta de Iris.
 *
 * QUÉ SE ENSEÑA Y DÓNDE
 *
 * 1. Si hay comentarios de verdad en `TESTIMONIOS`, se enseñan ésos. Siempre y
 *    en cualquier sitio. Es el caso normal y el que manda.
 * 2. Si todavía no los hay, se enseñan los de muestra —que son inventados—,
 *    pero SÓLO en localhost y en las direcciones de prueba de Vercel, y con un
 *    aviso encima que dice lo que son.
 * 3. En cualquier otro dominio, sin comentarios de verdad, no sale ninguno.
 *
 * POR QUÉ ESTÁ HECHO ASÍ
 *
 * Se pidió inventarlos «de momento, los quitamos cuando pongamos el dominio».
 * El plan es bueno y aquí está montado entero. Lo que no puede es depender de
 * que alguien se acuerde el día del lanzamiento: publicar reseñas falsas de
 * clientes es infracción grave de la ley de consumidores en España desde la
 * directiva Ómnibus, y con el icono de Instagram al lado se está afirmando que
 * una persona con nombre y usuario escribió eso.
 *
 * Así que «los quitamos cuando pongamos el dominio» no es una nota mental: es
 * la función de aquí abajo. El día que la web deje de estar en una dirección de
 * prueba, los inventados dejan de existir sin que nadie toque nada. Y en cuanto
 * se pegue el primero de verdad, tampoco vuelven a salir.
 *
 * La decisión se toma en el navegador y no al compilar, a propósito: la misma
 * página servida vale para la dirección de prueba y para el dominio, así que
 * quien decide tiene que ser quien sabe en cuál de las dos está.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIOS, TESTIMONIOS_MUESTRA, type Testimonio } from '@/content/site';
import { CURVA, Entra } from './movimiento';
import Pendiente from './Pendiente';

/** Los únicos sitios donde se permite enseñar los inventados. */
function esSitioDePrueba(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local') || host.endsWith('.vercel.app');
}

/** El icono de Instagram, dibujado: no hace falta descargar nada. */
function IconoInstagram({ tam = 16 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5.6" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Tarjeta({ t }: { t: Testimonio }) {
  return (
    <article className="testi-tarjeta">
      <header className="testi-cab">
        <span className="testi-avatar" aria-hidden>
          {/* La inicial del nombre. Una foto de perfil de otra persona no se
              copia a una web sin permiso, y una inicial se lee igual de bien. */}
          {t.nombre.trim().charAt(0).toUpperCase()}
        </span>
        <span className="testi-quien">
          <b>{t.nombre}</b>
          {t.usuario && <span className="testi-usuario">{t.usuario}</span>}
        </span>
        <span className="testi-marca" aria-label="Comentario en Instagram">
          <IconoInstagram />
        </span>
      </header>
      <p className="testi-texto">{t.texto}</p>
      {t.cuando && <span className="testi-cuando">{t.cuando}</span>}
    </article>
  );
}

export default function Testimonios() {
  const pista = useRef<HTMLDivElement>(null);

  /* Empieza en false y sólo se enciende en el navegador si estamos en una
     dirección de prueba. Así, si el JavaScript no llegara a correr, lo que se
     queda pintado es el caso seguro: sin inventados. */
  const [enPruebas, setEnPruebas] = useState(false);
  useEffect(() => setEnPruebas(esSitioDePrueba(window.location.hostname)), []);

  const hayReales = TESTIMONIOS.length > 0;
  const deMuestra = !hayReales && enPruebas;
  const lista = hayReales ? TESTIMONIOS : deMuestra ? TESTIMONIOS_MUESTRA : [];

  /*
   * EL CARRUSEL NO SE ACABA.
   *
   * Antes tenía principio y final: se llegaba al último comentario, la flecha se
   * apagaba y ahí se terminaba. Con seis tarjetas eso pasa a los dos toques, y
   * un carrusel que se apaga se lee como que no hay más gente contenta.
   *
   * La lista se pinta DOS VECES seguidas. Cuando el desplazamiento pasa de la
   * mitad —o sea, cuando entras en la segunda copia— se resta la mitad y vuelves
   * al mismo sitio de la primera; y al revés por el otro lado. El salto es
   * exacto, así que no se ve: lo que se ve es una cinta sin final.
   *
   * El salto va sin `behavior: smooth` a propósito: animarlo lo haría visible.
   */
  const bucle = [...lista, ...lista];

  const recolocar = () => {
    const p = pista.current;
    if (!p) return;
    const mitad = p.scrollWidth / 2;
    if (mitad < 10) return;
    if (p.scrollLeft >= mitad) p.scrollLeft -= mitad;
    else if (p.scrollLeft <= 0) p.scrollLeft += mitad;
  };

  const mover = (dir: 1 | -1) => {
    const p = pista.current;
    if (!p) return;
    // Se avanza una tarjeta, no una pantalla: así nunca se salta ninguna.
    const salto = (p.querySelector('.testi-tarjeta') as HTMLElement | null)?.offsetWidth ?? 320;
    p.scrollBy({ left: dir * (salto + 16), behavior: 'smooth' });
  };

  const hay = lista.length > 0;

  return (
    <div className="testi">
      <Entra desde="izq">
        <div className="testi-cabecera">
          <div>
            <span className="rotulo">Lo que le escriben</span>
            <h2 className="titular-seccion testi-titulo">Esto no lo digo yo.</h2>
          </div>
          {/* Ya no se apagan nunca: la cinta no tiene final. */}
          {hay && (
            <div className="testi-flechas">
              <button onClick={() => mover(-1)} aria-label="Anterior" className="testi-flecha">←</button>
              <button onClick={() => mover(1)} aria-label="Siguiente" className="testi-flecha">→</button>
            </div>
          )}
        </div>
      </Entra>

      {/* Sólo se ve en las direcciones de prueba, que es el único sitio donde
          llega a haber inventados. Va discreto: no es una alarma, es una nota
          para quien está mirando el montaje. */}
      {deMuestra && (
        <p className="testi-aviso">
          Estos seis comentarios son <strong>de muestra</strong>, para ver cómo queda. No los ha escrito nadie.
          Desaparecen solos en cuanto la web esté en su dominio, y también en cuanto pegues el primero de verdad
          en <code>content/site.ts</code>.
        </p>
      )}

      {hay ? (
        <motion.div
          ref={pista}
          className="testi-pista"
          onScroll={recolocar}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: CURVA }}
        >
          {bucle.map((t, i) => (
            /* La segunda copia se esconde de los lectores de pantalla: la cinta
               es un truco visual, y oír seis comentarios repetidos no lo es. */
            <div key={i} aria-hidden={i >= lista.length ? true : undefined} style={{ display: 'contents' }}>
              <Tarjeta t={t} />
            </div>
          ))}
        </motion.div>
      ) : (
        /* El hueco dice exactamente qué va aquí y cómo se rellena. Un hueco que
           no explica nada acaba olvidado; éste se lee como una tarea. */
        <div className="testi-hueco">
          <Pendiente>Faltan los comentarios</Pendiente>
          <p>
            Aquí van comentarios <strong>de verdad</strong> del Instagram de Iris, en carrusel y con su icono.
            No los invento: una reseña falsa es infracción grave de la ley de consumidores, y además tiraría
            por tierra lo único que hace creíble a esta web — que lo que no está confirmado sale marcado.
          </p>
          <p className="testi-hueco-como">
            Para rellenarlos: abre <code>content/site.ts</code>, busca <code>TESTIMONIOS</code> y pega ahí los
            comentarios tal cual, con el nombre y el usuario de quien los escribió. Con tres ya funciona.
          </p>
        </div>
      )}
    </div>
  );
}
