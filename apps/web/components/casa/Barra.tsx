'use client';

/**
 * LA BARRA: UNA PASTILLA QUE SE ABRE A TODA LA PANTALLA.
 * ============================================================================
 *
 * Gerson, el 18 de octubre: «importante que salga el logo de escuela de
 * sabiduría y cuando le dé click se expanda el header a toda la pantalla con
 * buena animación».
 *
 * CÓMO SE HACE LA ANIMACIÓN, que es lo que da el efecto.
 * El panel está siempre puesto, a pantalla completa, pero recortado con
 * `clip-path: circle(0)` centrado EXACTAMENTE en el botón de las rayas. Al
 * abrir, ese círculo crece hasta pasarse de la esquina más lejana. El ojo no
 * ve un panel que aparece: ve el botón abriéndose y comiéndose la pantalla.
 *
 * Las dos coordenadas del centro se miden al pulsar y se pasan al CSS en dos
 * variables. No valen fijas: la pastilla está centrada, así que su sitio
 * depende del ancho de la ventana, y en el móvil no cae donde en el
 * escritorio.
 *
 * LO QUE HAY QUE HACER BIEN EN UN MENÚ QUE TAPA LA PÁGINA ENTERA:
 *   · Se cierra con Escape. Un panel a pantalla completa sin salida con el
 *     teclado es una trampa.
 *   · El foco entra dentro al abrir y VUELVE AL BOTÓN al cerrar. Si no, quien
 *     navega con tabulador acaba en un sitio cualquiera de la página.
 *   · El tabulador no se sale del panel mientras está abierto.
 *   · Cerrado lleva `inert`: ni lo lee un lector de pantalla ni se cuela el
 *     tabulador en unos enlaces invisibles.
 *   · Se bloquea el scroll del fondo, o la página de debajo se mueve sola.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LOGO_COLOR } from '@/content/site';

const PUERTAS = [
  { href: '/numerologia', texto: 'Numerología', nota: 'Qué es y para qué sirve' },
  { href: '/kabala', texto: 'Kábala', nota: 'El árbol y sus diez puntos' },
  { href: '/cursos', texto: 'Talleres y cursos', nota: 'Lo que hay abierto ahora' },
  { href: '/membresia', texto: 'La escuela', nota: 'Dentro de Sabiduría 33' },
  { href: 'https://app.escueladesabiduria33.com', texto: 'Entrar', nota: 'Si ya eres alumna', fuera: true },
];

export default function Barra({ fija = false }: { fija?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [escondida, setEscondida] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  /*
   * EN LAS PÁGINAS LARGAS, LA BARRA SE APARTA AL LEER.
   *
   * Una pastilla clavada en el centro de arriba, sobre una página de texto a
   * una columna centrada, tapa un renglón cada vez que se baja. Se vio en la
   * política de privacidad: media frase debajo del logo.
   *
   * Así que al bajar se va y al subir vuelve, que es lo que hace todo el mundo
   * y por este motivo. Arriba del todo siempre está, y con el menú abierto no
   * se mueve —si se fuera, se iría el aspa con la que se cierra—.
   *
   * Sólo en la variante `fija`: en la portada la barra no es fija, se queda
   * donde está y se va con el scroll sin ayuda de nadie.
   */
  useEffect(() => {
    if (!fija) return;
    let ultimo = window.scrollY;
    let pedido = false;
    const mirar = () => {
      pedido = false;
      const y = window.scrollY;
      if (!abierto) setEscondida(y > 120 && y > ultimo);
      ultimo = y;
    };
    const alBajar = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(mirar);
    };
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => window.removeEventListener('scroll', alBajar);
  }, [fija, abierto]);

  /* El centro del círculo que crece: el del propio botón, medido al pulsar. */
  const abrir = useCallback(() => {
    const b = boton.current;
    if (b) {
      const r = b.getBoundingClientRect();
      document.documentElement.style.setProperty('--casa-x', `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty('--casa-y', `${r.top + r.height / 2}px`);
    }
    setAbierto(true);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    boton.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return;

    /* El fondo no se mueve mientras el panel tapa la pantalla. Se guarda el
       valor anterior en vez de poner `''` al salir: así no se pisa un
       `overflow` que hubiera puesto otra cosa. */
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const foco = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );
    foco()[0]?.focus();

    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrar();
        return;
      }
      if (e.key !== 'Tab') return;
      /* El tabulador da la vuelta dentro del panel y no se escapa al fondo. */
      const lista = [boton.current, ...foco()].filter(Boolean) as HTMLElement[];
      if (!lista.length) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', teclas);
    return () => {
      document.removeEventListener('keydown', teclas);
      document.body.style.overflow = antes;
    };
  }, [abierto, cerrar]);

  return (
    /* `fija` es para las páginas que no tienen portada a pantalla completa:
       allí la barra no puede ir pegada a una sección, va clavada a la ventana
       y acompaña al bajar. En la portada no, que ahí se queda arriba y se va
       con el scroll, como en la plantilla. */
    <div
      className={`casa-barra${fija ? ' casa-barra-fija' : ''}${abierto ? ' casa-barra-abierta' : ''}${escondida && !abierto ? ' casa-barra-fuera' : ''}`}
    >
      <div className="casa-pastilla">
        <Link href="/" className="casa-marca" onClick={() => setAbierto(false)}>
          {/* El sello de la escuela, que es lo que pidió Gerson que se viera.
              Va el de color: la pastilla es blanca. */}
          <Image src={LOGO_COLOR} alt="" width={26} height={26} className="casa-marca-sello" />
          <span>
            Iris Soares
            <small>Escuela de Sabiduría 33</small>
          </span>
        </Link>

        <button
          ref={boton}
          type="button"
          className={`casa-rayas${abierto ? ' casa-rayas-abierta' : ''}`}
          aria-expanded={abierto}
          aria-controls="casa-menu"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => (abierto ? cerrar() : abrir())}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        id="casa-menu"
        ref={panel}
        className="casa-menu"
        inert={!abierto}
        aria-label="Menú principal"
        role="dialog"
        aria-modal={abierto}
      >
        <nav className="casa-menu-lista">
          {PUERTAS.map((p, i) => {
            const contenido = (
              <>
                <span className="casa-menu-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="casa-menu-texto">
                  {p.texto}
                  <small>{p.nota}</small>
                </span>
              </>
            );
            /* Cada línea entra un poco después que la anterior. Las cinco de
               golpe se leen como un bloque; escalonadas, se leen como una
               lista. */
            const retardo = { transitionDelay: `${90 + i * 55}ms` } as const;
            return p.fuera ? (
              <a key={p.href} href={p.href} style={retardo} onClick={() => setAbierto(false)}>
                {contenido}
              </a>
            ) : (
              <Link key={p.href} href={p.href} style={retardo} onClick={() => setAbierto(false)}>
                {contenido}
              </Link>
            );
          })}
        </nav>

        <div className="casa-menu-pie" style={{ transitionDelay: '380ms' }}>
          <Link href="/legal" onClick={() => setAbierto(false)}>
            Aviso legal
          </Link>
          <Link href="/privacidad" onClick={() => setAbierto(false)}>
            Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
}
