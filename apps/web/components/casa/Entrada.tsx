'use client';

/**
 * LA ENTRADA DE UNA PÁGINA, EN EL LENGUAJE DE LA PORTADA.
 * ============================================================================
 *
 * Gerson: «la página de talleres tiene que ir con base a lo que ya has hecho,
 * prácticamente duplica el home que tienes, pero categorizado a donde va a ir
 * directamente». Y lo mismo para numerología y para kábala.
 *
 * Así que la primera pantalla de esas páginas es la misma que la de la
 * portada —vídeo o foto a sangre, la barra flotando encima, un titular con una
 * palabra en cursiva y una barra de llamada— y lo único que cambia es qué
 * dice y a dónde manda.
 *
 * Esto NO es un copiar y pegar de la portada: la portada sigue teniendo su
 * propio bloque en `Portada.tsx` porque lleva el `h1` de la casa y su
 * composición. Aquí se comparte la forma, no el contenido.
 *
 * LA BARRA VA DENTRO. En estas páginas hay portada a pantalla completa, así
 * que la barra se queda arriba y se va con el scroll, igual que en la portada
 * —y no en su variante `fija`, que es para las páginas de sólo texto.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';
import Barra from './Barra';

export default function Entrada({
  titulo,
  texto,
  cta,
  nota,
  notaCorta,
  video,
  cartel,
  foto,
  alt = '',
}: {
  /** El titular. Lleva un <em> dentro para la palabra en cursiva. */
  titulo: ReactNode;
  texto: string;
  cta: { a: string; texto: string };
  /** La frase de la barra de llamada, y su versión corta para el móvil. */
  nota: string;
  notaCorta: string;
  /** Un vídeo de fondo, sin sonido y en bucle. Alternativa a `foto`. */
  video?: string[];
  cartel?: string;
  /** Una foto de fondo. Alternativa a `video`. */
  foto?: string;
  alt?: string;
}) {
  const zona = useRef<HTMLElement>(null);

  /* MIENTRAS SE VE LA ENTRADA, EL CHAT Y LOS SUSURROS SE CALLAN.
     Las dos cosas flotan por encima de todo: la pastilla del chat abajo a la
     derecha y las burbujas de los susurros por los márgenes. Sobre una
     primera pantalla que es foto, titular y un banner, las dos se leen como
     ruido encima de la única pieza que tiene que estar limpia.
     Se marca el <html> y de ahí tiran las hojas de estilo. Al salir se
     limpia la marca, o la página siguiente se queda sin chat sin que nadie
     entienda por qué. */
  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    const ojo = new IntersectionObserver(
      ([e]) => {
        document.documentElement.dataset.portada = e.isIntersecting ? 'si' : 'no';
      },
      { threshold: 0.35 },
    );
    ojo.observe(el);
    return () => {
      ojo.disconnect();
      delete document.documentElement.dataset.portada;
    };
  }, []);

  return (
    <section className="casa-portada" id="top" ref={zona}>
      {video ? (
        <video
          className="casa-portada-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={cartel}
          aria-hidden="true"
          tabIndex={-1}
        >
          {video.map((n) => (
            <source key={n} src={`/video/${n}`} type={n.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          ))}
        </video>
      ) : (
        foto && (
          <Image className="casa-portada-video" src={foto} alt={alt} fill priority sizes="100vw" />
        )
      )}
      <div className="casa-portada-velo" aria-hidden="true" />

      <header>
        <Barra />
      </header>

      <div className="casa-portada-dentro">
        {/* `h1` y sólo uno por página: es el título de verdad, el que lee un
            buscador y el que anuncia un lector de pantalla al entrar. */}
        <h1 className="casa-h1">{titulo}</h1>
        <p className="casa-portada-p">{texto}</p>

        <div className="casa-llamada">
          <p className="casa-larga">{nota}</p>
          <p className="casa-corta">{notaCorta}</p>
          <Link href={cta.a} className="casa-llamada-boton casa-brillo">
            {cta.texto}
          </Link>
        </div>
      </div>
    </section>
  );
}
