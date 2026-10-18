'use client';

/**
 * LA PORTADA, LA PARTE QUE SE MUEVE.
 * ============================================================================
 *
 * Esto estaba dentro de `app/page.tsx` y se ha sacado aquí por una razón de
 * buscadores que no se ve por ninguna parte y cuesta cara:
 *
 *   UNA PÁGINA MARCADA CON `'use client'` NO PUEDE EXPORTAR `metadata`.
 *
 * No avisa, no falla el compilado, no sale nada en rojo: simplemente hereda la
 * del layout de arriba. Ya pasó en esta web —siete páginas mandando el título
 * de la portada— y está contado entero en `lib/seo.ts`.
 *
 * Así que la portada se parte en dos: `app/page.tsx` se queda de servidor y
 * lleva el título, la descripción, el canonical y los datos estructurados;
 * todo lo que necesita manos y scroll vive aquí.
 *
 * LOS CINCO BLOQUES, EN ORDEN:
 *   1. LA PORTADA ..... la pregunta, sobre el vídeo a pantalla entera.
 *   2. EL CREMA ....... de dónde viene el patrón: la abuela, la madre, tú.
 *   3. LAS CLAVES ..... quién es Iris y por qué creerla, en tres fichas.
 *   4. LOS CAMINOS .... las tres puertas: numerología, kábala y la escuela.
 *   5. EL PIE ......... el mapa, lo legal y el descargo.
 */

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import Barra from './Barra';
import Sobre from './Sobre';
import Claves from './Claves';
import Caminos from './Caminos';
import Pie from './Pie';
import './casa.css';

export default function Portada() {
  return (
    <div id="app" className="claro casa" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />

      {/* ── 1. LA PORTADA: LA PREGUNTA ─────────────────────────
          Una sola pregunta, el vídeo detrás y lo justo para decidir si se
          sigue bajando. Nada más: es la pantalla que paga, y cada cosa de más
          es un motivo para irse. */}
      <section className="casa-portada" id="top">
        <video
          className="casa-portada-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/arbol-scroll-cartel.jpg"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/video/recorrido.webm" type="video/webm" />
          <source src="/video/recorrido.mp4" type="video/mp4" />
        </video>
        <div className="casa-portada-velo" aria-hidden="true" />

        <header>
          <Barra />
        </header>

        <div className="casa-portada-dentro">
          {/* DOS LÍNEAS Y NI UNA CURSIVA. La plantilla ponía la segunda
              línea inclinada y así estaba; Gerson: «no quiero tipografía
              cursiva en NADA». El titular se parte igual, y el corte hace el
              trabajo que hacía la cursiva: «por qué se repite» / «siempre lo
              mismo» se leen como dos golpes y no como una frase larga. */}
          <h1 className="casa-h1">
            Por qué se repite
            <br />
            siempre lo mismo
          </h1>

          {/* Esta frase hace dos cosas y las dos a propósito: nombra el
              patrón con ejemplos que se reconocen —no con la palabra
              «patrón», que no significa nada hasta que se ve— y acaba
              empujando a los talleres, que es a donde va el botón.
              Y NO dice lo que esto NO es. Nombrar las cartas o la
              adivinación para negarlas se lo mete en la cabeza a quien no
              lo había pensado. */}
          <p className="casa-portada-p">
            La misma discusión con otra persona. El mismo muro en otro trabajo.
            Debajo hay un patrón, y se aprende a leerlo.
          </p>

          <div className="casa-llamada">
            <p className="casa-larga">
              Talleres en directo, con tu caso encima de la mesa.
            </p>
            <p className="casa-corta">Talleres en directo, con tu caso.</p>
            <Link href="/cursos" className="casa-llamada-boton casa-brillo">
              Ver los talleres
            </Link>
          </div>
        </div>
      </section>

      <main>
        {/* ── 2. DE DÓNDE VIENE ────────────────────────────── */}
        <Sobre />

        {/* ── 3. QUIÉN ES IRIS, Y POR QUÉ CREERLA ──────────── */}
        <Claves />

        {/* ── 4. LAS TRES PUERTAS ──────────────────────────── */}
        <Caminos />
      </main>

      {/* ── 5. EL PIE ──────────────────────────────────────── */}
      <Pie />
    </div>
  );
}
