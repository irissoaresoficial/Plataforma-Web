'use client';

/**
 * EL PIE.
 * ============================================================================
 *
 * Vuelve, y en el estilo nuevo. Gerson: «y después de esto el footer».
 *
 * NO ES EL PIE DE ANTES. Aquel eran siete columnas y catorce enlaces al final
 * de la portada. Éste tiene tres cosas, que son las tres que se buscan cuando
 * alguien llega abajo del todo:
 *
 *   · POR DÓNDE SE ENTRA — las páginas de verdad, las mismas tres puertas de
 *     la sección de arriba más los talleres.
 *   · CÓMO SE HABLA CON ELLA — el correo, y la puerta de la plataforma para
 *     quien ya es alumna.
 *   · LO LEGAL — aviso legal y privacidad. Esto no es decoración: la LSSI-CE
 *     (art. 10) obliga a decir quién vende y cómo se le escribe, y el RGPD a
 *     que la política de privacidad se alcance desde cualquier página.
 *
 * Y la línea de abajo lleva el descargo. No está por cumplir: una web que
 * habla de numerología y cobra por ello tiene que dejar claro que esto no
 * sustituye a un médico ni a un psicólogo. Es lo que separa una escuela de un
 * problema.
 */

import Link from 'next/link';
import { CONTACTO } from '@/content/site';
import Sello from './Sello';

const PUERTAS = [
  { a: '/numerologia', t: 'Numerología transgeneracional' },
  { a: '/kabala', t: 'Qué es la Kábala' },
  { a: '/cursos', t: 'Talleres y cursos' },
  { a: '/membresia', t: 'La escuela' },
];

export default function Pie() {
  return (
    <footer className="casa-pie" aria-labelledby="pie-h">
      <h2 className="casa-oculto" id="pie-h">
        Mapa de la web y aviso legal
      </h2>

      <div className="casa-pie-dentro">
        <div className="casa-pie-firma">
          <Sello tam={44} claro />
          <p className="casa-pie-nombre">
            Iris Soares
            <span>Escuela de Sabiduría 33</span>
          </p>
        </div>

        <nav className="casa-pie-col" aria-label="Secciones">
          <span className="casa-pie-rotulo">Por dónde se entra</span>
          {PUERTAS.map((p) => (
            <Link key={p.a} href={p.a}>
              {p.t}
            </Link>
          ))}
        </nav>

        <div className="casa-pie-col">
          <span className="casa-pie-rotulo">Hablar con Iris</span>
          <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
          <a href="https://app.escueladesabiduria33.com">Entrar en la plataforma</a>
        </div>

        <nav className="casa-pie-col" aria-label="Legal">
          <span className="casa-pie-rotulo">Legal</span>
          <Link href="/legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad y cookies</Link>
        </nav>
      </div>

      <div className="casa-pie-raya">
        <p>
          La numerología y la Kábala que se enseñan aquí son herramientas de
          lectura y de trabajo personal. No son un diagnóstico ni un tratamiento,
          y no sustituyen a un médico, a un psicólogo ni a un abogado.
        </p>
        <span>© {new Date().getFullYear()} Iris Soares</span>
      </div>
    </footer>
  );
}
