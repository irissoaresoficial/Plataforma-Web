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

type Enlace = {
  href: string;
  label: string;
  onClick?: () => void;
  /** Si viene, la entrada se pinta destacada y esto es lo que dice su marca. */
  destacado?: string;
};

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
  const cerrarCapa = useCapa(abierto, cerrar);

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
      if (e.key === 'Escape') return cerrarCapa();
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
  }, [abierto, cerrarCapa]);

  /*
   * TRES. NADA MÁS.
   *
   * Había cinco —Inicio, Qué es la Kábala, Taller gratis, Cursos y talleres, La
   * comunidad— y era otra vez el problema de siempre: tantas puertas que nadie
   * sabe por cuál entrar. Cinco enlaces en un menú no son cinco opciones, son
   * cinco motivos para no elegir ninguna.
   *
   * Quedan los tres sitios a los que de verdad se quiere llevar a alguien. Todo
   * lo demás —qué es la numerología, qué es la Kábala, la sinergia, el taller
   * gratis— sigue existiendo y sigue enlazado, pero desde el pie, que es donde
   * va lo que se busca cuando ya te interesa.
   *
   * Y la membresía va DESTACADA, con su marca al lado: es el lanzamiento, y un
   * lanzamiento que se lee igual que «Inicio» no es un lanzamiento.
   */
  const fijos: Enlace[] = [
    { href: '/', label: 'Inicio' },
    { href: '/cursos', label: 'Talleres' },
    { href: '/membresia', label: 'La membresía', destacado: 'Lanzamiento' },
  ];
  /* Los enlaces sueltos de cada página —«Dudas», «La consulta»— NO se cuelan
     en la lista grande: bajan al pie del menú, donde se entiende que son otra
     cosa. No es lo mismo «llévame a los talleres» que «bájame a las dudas». */
  const enlaces = fijos;

  /*
   * ============================================================================
   * LA BARRA SE APARTA CUANDO BAJAS Y VUELVE CUANDO SUBES
   * ============================================================================
   *
   * Una barra fija se come cincuenta píxeles del alto de la pantalla en todo
   * momento — y en un móvil eso es el 6 % de lo que se ve. Mientras bajas, esos
   * cincuenta píxeles no te sirven de nada: estás leyendo, no navegando. En
   * cuanto subes, sí: subir es el gesto de «quiero volver a algo», y ahí la
   * barra tiene que estar antes de que la busques.
   *
   * Tres reglas para que no dé tirones:
   *
   *   1. ARRIBA DEL TODO, SIEMPRE VISIBLE. Por debajo de la altura de la propia
   *      barra no tiene sentido esconderla.
   *   2. UN MÍNIMO DE MOVIMIENTO ANTES DE HACER CASO. Sin él, el rebote elástico
   *      del iPhone y cualquier temblor del dedo la hacen parpadear.
   *   3. CON EL MENÚ ABIERTO NO SE MUEVE. La barra lleva dentro el botón que lo
   *      cierra; esconderla con el menú abierto deja a la persona sin la salida.
   *
   * Y el trabajo se hace una vez por fotograma, no una vez por evento de scroll:
   * el evento puede dispararse cien veces entre dos pinturas de pantalla.
   */
  const [oculta, setOculta] = useState(false);
  useEffect(() => {
    if (abierto) {
      setOculta(false);
      return;
    }
    /** Cuánto hay que moverse para que cuente. */
    const UMBRAL = 8;
    /** Por debajo de aquí la barra no se esconde nunca. */
    const ZONA_ALTA = 90;

    let anterior = window.scrollY;
    let pedido = false;

    const mide = () => {
      pedido = false;
      const y = window.scrollY;
      const d = y - anterior;
      if (Math.abs(d) < UMBRAL) return;
      anterior = y;
      setOculta(y > ZONA_ALTA && d > 0);
    };
    const alBajar = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(mide);
    };
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => window.removeEventListener('scroll', alBajar);
  }, [abierto]);

  return (
    <>
      <header className={`barra${oculta ? ' barra-fuera' : ''}`}>
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
            onClick={() => (abierto ? cerrarCapa() : setAbierto(true))}
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

      <div id="menu-principal" className={`menu${abierto ? ' abierto' : ''}`} onClick={cerrarCapa}>
        <nav ref={cajaRef} className="menu-caja" onClick={(e) => e.stopPropagation()}>
          <ul className="menu-lista">
            {enlaces.map((l, i) => (
              <li
                key={l.href + l.label}
                className={l.destacado ? 'menu-destacado' : undefined}
                style={{ transitionDelay: `${abierto ? 90 + i * 55 : 0}ms` }}
              >
                <span className="menu-num">{String(i + 1).padStart(2, '0')}</span>
                {l.destacado && <span className="menu-marca">{l.destacado}</span>}
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
                  /* `replace` y no una entrada nueva. Con el menú abierto hay
                     una entrada de más en el historial —la que hace que el
                     botón de atrás cierre el menú en vez de sacarte de la web—
                     y navegar encima de ella la sustituye en vez de apilarse.
                     Sin esto, atrás desde el destino te devolvería a la misma
                     página dos veces seguidas. */
                  <Link href={l.href} replace onClick={() => setAbierto(false)}>
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
                      <Link key={l.href + l.label} href={l.href} replace onClick={() => setAbierto(false)}>
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
