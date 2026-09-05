'use client';

/**
 * LOS COMENTARIOS DE INSTAGRAM
 *
 * Un carrusel de comentarios reales de la cuenta de Iris.
 *
 * POR QUÉ ESTÁN VACÍOS Y NO INVENTADOS
 *
 * Se pidió rellenarlos con frases de mentira mientras llegan las de verdad, y
 * no lo he hecho. No es remilgo: publicar reseñas falsas de clientes es
 * infracción grave de la ley de consumidores en España desde la directiva
 * Ómnibus, con multa de las que duelen, y aquí además irían con el icono de
 * Instagram, que es decir «esto lo escribió una persona en mi cuenta» cuando
 * no lo escribió nadie.
 *
 * Y hay un motivo que importa más que la multa. Toda esta web se ha construido
 * sobre una regla —lo que no está confirmado sale marcado en rojo, no se
 * rellena con algo que suene bien— y esa regla es la que la hace creíble. Ya
 * pasó con la duración de la sesión: «hora y media» estaba escrito en nueve
 * sitios sin que nadie lo hubiera dicho, y se quitó. Meter testimonios
 * inventados justo debajo sería tirar por tierra lo único que de verdad
 * distingue a esta web de las cuatrocientas que venden lo mismo.
 *
 * Así que la pieza está entera y funcionando: el carrusel, las tarjetas, el
 * arrastre, el icono. Lo único que falta es pegar los comentarios de verdad en
 * `content/site.ts`, que son diez minutos de copiar y pegar desde el móvil.
 * Mientras no estén, la sección enseña qué va a ir aquí y lo dice en rojo,
 * como todo lo demás que falta.
 */

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIOS, type Testimonio } from '@/content/site';
import { CURVA, Entra } from './movimiento';
import Pendiente from './Pendiente';

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
  const [enBorde, setEnBorde] = useState<{ ini: boolean; fin: boolean }>({ ini: true, fin: false });

  const mirarBordes = () => {
    const p = pista.current;
    if (!p) return;
    setEnBorde({ ini: p.scrollLeft < 8, fin: p.scrollLeft + p.clientWidth >= p.scrollWidth - 8 });
  };

  const mover = (dir: 1 | -1) => {
    const p = pista.current;
    if (!p) return;
    // Se avanza una tarjeta, no una pantalla: así nunca se salta ninguna.
    const salto = (p.querySelector('.testi-tarjeta') as HTMLElement | null)?.offsetWidth ?? 320;
    p.scrollBy({ left: dir * (salto + 16), behavior: 'smooth' });
  };

  const hay = TESTIMONIOS.length > 0;

  return (
    <div className="testi">
      <Entra desde="izq">
        <div className="testi-cabecera">
          <div>
            <span className="rotulo">Lo que le escriben</span>
            <h2 className="titular-seccion testi-titulo">Esto no lo digo yo.</h2>
          </div>
          {hay && (
            <div className="testi-flechas">
              <button onClick={() => mover(-1)} disabled={enBorde.ini} aria-label="Anterior" className="testi-flecha">←</button>
              <button onClick={() => mover(1)} disabled={enBorde.fin} aria-label="Siguiente" className="testi-flecha">→</button>
            </div>
          )}
        </div>
      </Entra>

      {hay ? (
        <motion.div
          ref={pista}
          className="testi-pista"
          onScroll={mirarBordes}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: CURVA }}
        >
          {TESTIMONIOS.map((t, i) => (
            <Tarjeta key={i} t={t} />
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
