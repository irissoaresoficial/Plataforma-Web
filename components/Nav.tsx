'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Marca from './Marca';
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
  const { lang, setLang } = useLang();
  const ruta = usePathname();

  // Al cambiar de página el menú se cierra solo.
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
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
  const enlaces = [...extra, ...fijos];

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
        <nav className="menu-caja" onClick={(e) => e.stopPropagation()}>
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
