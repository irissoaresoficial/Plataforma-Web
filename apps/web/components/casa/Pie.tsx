'use client';

/**
 * EL PIE, MINIMALISTA.
 * ============================================================================
 *
 * Gerson: «el footer debe ser más minimalista». Era de cuatro columnas —el
 * mapa de la web, cómo escribir, lo legal y un descargo largo— y en una web
 * que ya lleva el menú entero a pantalla completa en la barra, repetirlo
 * abajo no añade nada: añade altura.
 *
 * Queda una sola fila y una línea debajo:
 *
 *   · el sello y el nombre, que es la firma;
 *   · tres enlaces, los únicos que la ley obliga a tener alcanzables —aviso
 *     legal, privacidad y una forma de escribir (LSSI-CE art. 10 y RGPD);
 *   · el año.
 *
 * Y el descargo, en una línea. NO se quita: una escuela que cobra por
 * enseñar numerología tiene que dejar dicho que esto no sustituye a un
 * médico ni a un psicólogo. Eso no es decoración ni relleno — es lo que
 * separa una escuela de un problema. Pero cabe en un renglón.
 *
 * Lo que había y ya no está no se pierde: las páginas siguen todas en pie y
 * se llega a ellas desde la barra, que está en todas y se abre entera.
 */

import Link from 'next/link';
import { CONTACTO } from '@/content/site';
import Sello from './Sello';

export default function Pie() {
  return (
    <footer className="casa-pie" aria-label="Pie de página">
      <div className="casa-pie-dentro">
        <Link href="/" className="casa-pie-firma">
          <Sello tam={30} claro />
          <span>
            Iris Soares
            <small>Escuela de Sabiduría 33</small>
          </span>
        </Link>

        <nav className="casa-pie-enlaces" aria-label="Legal y contacto">
          <Link href="/legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <a href={`mailto:${CONTACTO.email}`}>Escribir</a>
        </nav>

        <span className="casa-pie-ano">© {new Date().getFullYear()}</span>
      </div>

      <p className="casa-pie-nota">
        Lo que se enseña aquí es una herramienta de lectura y de trabajo
        personal. No es un diagnóstico ni un tratamiento, y no sustituye a un
        médico, a un psicólogo ni a un abogado.
      </p>
    </footer>
  );
}
