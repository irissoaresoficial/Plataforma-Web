'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Marca from './Marca';
import useCapa from './useCapa';
import { useLang, type Lang } from '@/lib/i18n';
import { CONTACTO } from '@/content/site';

/**
 * La barra de todo el sitio, una sola para las cuatro páginas.
 *
 * Es fija y siempre lleva fondo esmerilado. Antes era transparente hasta que
 * bajabas, y el titular de la página se leía por debajo de la marca: dos textos
 * pisados y ninguno legible.
 *
 * Todo lo demás —los enlaces, el idioma, el contacto— vive en el menú, tanto en
 * móvil como en escritorio. Así la barra es siempre la misma, no cambia de
 * forma según el ancho, y no hay que decidir qué cabe.
 */

type Enlace = { href: string; label: string; onClick?: () => void };

const IDIOMAS: { id: Lang; nombre: string }[] = [
  { id: 'es', nombre: 'Español' },
  { id: 'pt', nombre: 'Português' },
  { id: 'en', nombre: 'English' },
];

export default function Nav({
  cta,
  onCta,
  ctaHref,
  extra = [],
  conIdiomas = false,
}: {
  cta: string;
  /** Si se pasa, el botón abre el chat en vez de navegar. */
  onCta?: () => void;
  ctaHref?: string;
  /** Enlaces propios de la página, además de los cuatro fijos. */
  extra?: Enlace[];
  /** El idioma solo se ofrece donde hay traducción de verdad. */
  conIdiomas?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  const { lang, setLang } = useLang();
  const ruta = usePathname();

  // Al cambiar de página el menú se cierra solo.
  useEffect(() => setAbierto(false), [ruta]);

  // Y el botón de atrás lo cierra en vez de sacar de la web. Ver useCapa.
  useCapa(abierto, cerrar);

  /*
   * CON EL MENÚ ABIERTO, EL TABULADOR NO SE SALE DE ÉL.
   *
   * Sin esto, tabulando dentro del menú se pasaba por sus doce paradas y a la
   * decimotercera el foco saltaba a los botones de la portada — que están
   * DETRÁS del menú y no se ven, porque la caja es opaca. Quien navega con
   * teclado se quedaba pulsando Intro sobre cosas invisibles.
   *
   * El chat ya lo tenía resuelto así desde el principio; al menú se le había
   * olvidado, y es el mismo problema con la misma solución.
   */
  const cajaRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setAbierto(false);
      if (e.key !== 'Tab') return;
      const caja = cajaRef.current;
      if (!caja) return;
      const focos = caja.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focos.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  const fijos: Enlace[] = [
    { href: '/', label: 'Inicio' },
    { href: '/sinergia', label: 'Prueba gratis' },
    { href: '/cursos', label: 'Cursos y talleres' },
    { href: '/membresia', label: 'La comunidad' },
  ];
  /*
   * LA LISTA GRANDE SON CUATRO. SIEMPRE CUATRO.
   *
   * Antes se le pegaban delante los enlaces sueltos de cada página —«Cómo
   * funciona», «Dudas»— y el menú salía con seis, numerados del 01 al 06. Con
   * seis pasan dos cosas: el número deja de ayudar (nadie cuenta hasta seis en
   * un menú) y, sobre todo, los cuatro sitios a los que se puede IR quedan
   * mezclados con dos saltos dentro de la página en la que ya estás. No es lo
   * mismo «llévame a los cursos» que «bájame a las dudas», y una lista que los
   * pone al mismo nivel obliga a leerlos todos para distinguirlos.
   *
   * Ahora arriba van los cuatro destinos y nada más. Los de la página bajan al
   * pie del menú, con su rótulo, donde se entiende de un vistazo que son otra
   * cosa. Y el tope no depende de que nadie se pase: la lista grande es
   * `fijos`, así que aunque una página mande cinco enlaces sueltos, arriba
   * siguen saliendo cuatro.
   */
  const enlaces = fijos;

  return (
    <>
      <header className="barra">
        <Link href="/" className="barra-marca" onClick={() => setAbierto(false)}>
          <Marca tam={28} />
        </Link>

        <div className="barra-dcha">
          {onCta ? (
            <button type="button" className="barra-cta" onClick={onCta} data-mag>
              {cta}
            </button>
          ) : (
            <Link href={ctaHref || '/'} className="barra-cta" data-mag>
              {cta}
            </Link>
          )}

          <button
            type="button"
            className={`hamburguesa${abierto ? ' abierta' : ''}`}
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-principal"
            aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
            data-mag
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="menu-principal" className={`menu${abierto ? ' abierto' : ''}`} onClick={() => setAbierto(false)}>
        <nav ref={cajaRef} className="menu-caja" onClick={(e) => e.stopPropagation()}>
          <ul className="menu-lista">
            {enlaces.map((l, i) => (
              <li key={l.href + l.label} style={{ transitionDelay: `${abierto ? 90 + i * 55 : 0}ms` }}>
                <span className="menu-num">{String(i + 1).padStart(2, '0')}</span>
                {l.href.startsWith('#') ? (
                  <a
                    href={l.href}
                    onClick={() => {
                      setAbierto(false);
                      l.onClick?.();
                    }}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href} onClick={() => setAbierto(false)}>
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="menu-pie">
            {extra.length > 0 && (
              <div className="menu-pagina">
                <span>En esta página</span>
                <div>
                  {extra.map((l) =>
                    l.href.startsWith('#') ? (
                      <a
                        key={l.href + l.label}
                        href={l.href}
                        onClick={() => {
                          setAbierto(false);
                          l.onClick?.();
                        }}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link key={l.href + l.label} href={l.href} onClick={() => setAbierto(false)}>
                        {l.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            )}
            {conIdiomas && (
              <div className="menu-idiomas">
                <span>Idioma</span>
                <div>
                  {IDIOMAS.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setLang(i.id)}
                      className={lang === i.id ? 'activo' : ''}
                      aria-pressed={lang === i.id}
                    >
                      {i.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="menu-legal">
              <Link href="/legal" onClick={() => setAbierto(false)}>Aviso legal</Link>
              <Link href="/privacidad" onClick={() => setAbierto(false)}>Tus datos</Link>
              <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
