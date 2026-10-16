'use client';

import Link from 'next/link';
import { useRef } from 'react';
import Cursor from '@/components/Cursor';
/*
 * `Aparece` en vez de `Reveal`, en toda la web.
 *
 * `Reveal` era un fundido de setecientas milésimas que se dispara cuando el
 * bloque asoma y ya no depende de nada más. Eso no es movimiento de scroll: es
 * una animación que CASUALMENTE empieza al bajar — si paras la rueda, sigue
 * sola hasta el final, y si bajas de golpe te la pierdes entera.
 *
 * En `Aparece` el movimiento va atado a la rueda: cuánto ha entrado el bloque
 * es un número de 0 a 1 que el CSS usa para la opacidad y el desplazamiento.
 * Bajas y entra, paras y se para a media entrada. Ver components/Aparece.tsx.
 */
import Aparece from '@/components/Aparece';
/* AQUÍ SE IMPORTABA `Testimonios` Y NO SE PINTABA EN NINGUNA PARTE.
   El componente estaba terminado, la lista `TESTIMONIOS` de content/site.ts
   estaba vacía, y el import llevaba meses colgando sin dibujar un solo píxel.
   Gerson ha decidido el 14 de septiembre que la portada NO lleva casos de
   clientes ni testimonios — «no es necesario» —, así que la línea se va. El
   «qué he hecho» de la página se cuenta con su recorrido, que es verdad y no
   depende de que nadie escriba nada. */
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import ChatWidget, { type ChatWidgetHandle, type Servicio } from '@/components/ChatWidget';
import Susurros from '@/components/Susurros';
import ArbolVida from '@/components/ArbolVida';
import Portal from '@/components/Portal';
import Llamada from '@/components/Llamada';
import { useLang } from '@/lib/i18n';
import { CONTACTO } from '@/content/site';
import Pendiente from '@/components/Pendiente';
const ANCHO = 'var(--ancho)';

/** Rótulo de sección: línea fina + palabra pequeña.
 *
 *  La rayita lleva clase propia porque en el móvil hay un sitio donde sobra: el
 *  rótulo de la portada es el más largo de la web —«Numerología transgeneracional
 *  · online desde 2010»— y con la rayita y su hueco delante se partía en dos
 *  renglones, robándole diecisiete píxeles de alto a una pantalla donde ya no
 *  cabía el cartel. */
/*
 * LOS RÓTULOS PEQUEÑOS YA NO SE PINTAN.
 *
 * Eran las líneas en versalitas espaciadas encima de cada bloque —«NUMEROLOGÍA
 * TRANSGENERACIONAL · ONLINE DESDE 2010», «LA CONSULTA», «QUÉ ES LA KÁBALA»— y
 * Gerson las ha quitado de toda la web.
 *
 * Tenía razón, y el motivo es de diseño y no de gusto: un rótulo así no informa
 * de nada que el titular de debajo no diga ya, y en cambio pone una línea de
 * ruido tipográfico delante de cada bloque. Ocho veces en una página, eso deja
 * de ser un recurso y pasa a ser un tic — y es de las cosas que hacen que una
 * web se lea antigua.
 *
 * El componente se queda vacío en vez de borrar sus ocho llamadas: así ninguna
 * rejilla se queda con un hueco donde había un hijo, y el día que se quiera
 * recuperar alguno se descomenta aquí.
 */
function Rotulo(_p: { children: React.ReactNode; claro?: boolean; className?: string }) {
  return null;
}

function PillCTA({ onClick, href, variant, label, curLabel }: { onClick?: () => void; href?: string; variant: 'cream' | 'gold' | 'dark'; label: string; curLabel?: string }) {
  const cls = `pill pill-${variant}`;
  const inner = (
    <>
      <span>{label}</span>
      <span className="pill-arrow">→</span>
    </>
  );
  /*
   * Un `div` con onClick no existe para quien no usa ratón: no lo alcanza el
   * tabulador, no lo activa Intro, y un lector de pantalla no lo anuncia como
   * algo que se pueda pulsar. Esto era el botón «Hablar con Iris» de la
   * portada — el más importante de la web.
   *
   * La regla: si LLEVA a un sitio, es un enlace; si HACE algo, es un botón.
   * Los dos vienen con teclado y con foco de fábrica.
   */
  return href ? (
    <Link href={href} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} data-mag data-cur-label={curLabel} className={cls}>
      {inner}
    </button>
  );
}

export default function Home() {
  const { t } = useLang();
  // Sin barra de progreso: se fue con el bloque de los tres pasos.
  useSiteScroll();
  const chatRef = useRef<ChatWidgetHandle>(null);
  /* Qué consulta se reserva viaja hasta el chat. Sin esto, el botón de Kábala
     abría un agente que no nombraba la Kábala ni los 333 € en ningún momento, y
     la persona salía creyendo que había reservado otra cosa. */
  const openChat = (servicio: Servicio) => chatRef.current?.open(servicio);
  /*
   * Y ÉSTE ES EL QUE SE ENGANCHA A UN BOTÓN.
   *
   * `openChat` no puede ir suelto en un `onClick`: el navegador le pasaría el
   * evento del clic como primer argumento, y ese argumento es ahora QUÉ se
   * reserva. Acabaría llegando un MouseEvent donde se espera «consulta» o
   * «kabala». TypeScript lo cazó en el botón del pie y en ningún otro sitio,
   * porque los demás pasan por un componente que declara `() => void` y ahí no
   * se ve — así que el arreglo no es taparlo donde saltó, es no dejar nunca el
   * argumento al aire.
   */
  const abrirConsulta = () => openChat('consulta');

  /* AQUÍ VIVÍAN LAS DOCE DUDAS Y LAS CUATRO FRASES DEL DOLOR.
     Se van con sus bloques. Las claves `f_*` y `p_*` se quedan en i18n.tsx:
     no cuestan nada, el chat las usa para responder, y las dudas tienen que
     volver — pero en su propia página, no al final de una historia. */


  return (
    <div id="app" className="claro" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      {/* La cortina de dos franjas se va: el portal trae su propia antesala,
          que además cuenta de 0 a 100 lo que tardan en cargar los vídeos. Dos
          aperturas seguidas es una de más. */}
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav
        cta={t.book}
        onCta={abrirConsulta}
        conIdiomas
        /* Enlaces de ESTA página, no destinos: el menú los pone bajo «En
           esta página». Eran cuatro —«Quién es Iris», «La consulta», la
           prueba y las dudas— y los cuatro apuntaban a bloques que ya no
           están aquí: la home es el portal, el botón y el pie. Un menú que
           ofrece cuatro sitios y no lleva a ninguno es peor que no tenerlo.
           Queda el único ancla que existe de verdad. */
        extra={[{ href: '#cursos', label: 'Talleres y cursos' }]}
      />

      {/* ── APERTURA ─────────────────────────────────────────── */}
      {/* LA PORTADA: EL PORTAL.

          Cinco tramos de scroll sobre una película que no se corta — los
          números de tinta se vuelven hilos de oro, los hilos se vuelven el
          árbol de luz, y al final aparece ella. Ocupa las primeras cuatro
          pantallas y media; de ahí para abajo sigue la página entera, que no
          se ha tocado: «hola, soy Iris», las consultas, las dudas y el pie.

          Antes aquí estaba `PortadaArbol`, el dibujo del árbol con las tres
          frases escribiéndose al bajar. Sigue en el repositorio y se puede
          volver a poner cambiando esta línea; no se ha borrado nada.

          El detalle está en components/Portal.tsx. */}
      <div id="top">
        <Portal />
      </div>

      {/* LA MARQUESINA DE DOCE NÚMEROS ESTABA AQUÍ, y se ha quitado.
          Ocupaba el sitio más caro de la página —entre el titular y el primer
          bloque de verdad— y no daba ni un motivo para seguir bajando. */}

      {/* ── EL CIERRE: UN BOTÓN A LOS TALLERES Y CURSOS ─────
          Lo último antes del pie, y lo único que se pide en toda la página.

          AQUÍ SE HAN QUITADO CINCO BLOQUES, y no por recortar: la portada
          contaba la misma historia dos veces. El recorrido presentaba a Iris
          y tres pantallas más abajo «hola, soy Iris» volvía a presentarla; el
          recorrido explicaba de dónde viene el patrón y «qué es esto» lo
          explicaba otra vez. Dicho dos veces, se cree la mitad.

          Lo que se ha ido, y dónde está ahora:
            · «A ver si te suena» ... es la primera parada del recorrido.
            · «Hola, soy Iris» ...... es la tercera.
            · «Qué es esto» ......... es la segunda, y entero en /numerologia.
            · La sinergia ........... en /sinergia, que es su casa.
            · «Déjame mirarlo contigo» y las dudas ... la reserva vive en el
              botón de la barra y en el pie, que están siempre a la vista; las
              dudas desarman una historia si se ponen al final de ella.

          No se ha borrado ningún componente: todos siguen en el repositorio y
          las páginas que los usan, en pie. */}
      <Llamada />

      {/* ── PIE: el mapa de la web ───────────────────────────── */}
      <div className="arena" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(44px,6vw,72px) clamp(16px,4vw,56px) 30px' }}>
        <div style={{ maxWidth: ANCHO, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Marca tam={68} apilado />
              <p style={{ margin: 0, fontSize: 'var(--t-nota)', lineHeight: 1.6, color: 'var(--tx-3)', maxWidth: '28ch' }}>{t.ft_p}</p>
            </div>
            {/*
                LOS LINKS DE INTERÉS.
                ----------------------------------------------------------------
                El menú de arriba se ha quedado en tres —Inicio, Talleres y la
                membresía— porque cinco puertas no son cinco opciones, son cinco
                motivos para no elegir ninguna.

                Pero nada se pierde: todo lo que salió del menú vive aquí. Y es
                el sitio correcto, no el cajón de sastre — al pie se llega
                después de haber leído, o sea buscando algo concreto, que es
                justo cuando «qué es la Kábala» deja de ser ruido y pasa a ser
                lo que uno quiere leer. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">{t.ft_start}</span>
              {/* Un <button>, no un <div>. Era un `div` con `onClick`: no lo
                  alcanzaba el tabulador, no lo activaba Intro y un lector de
                  pantalla lo leía como texto suelto — o sea, la primera línea
                  de «Empieza por aquí» no existía para quien no usa ratón. Y es
                  la que abre la reserva. */}
              <button type="button" onClick={abrirConsulta} data-mag className="pie-enlace pie-boton">
                {t.ft_1}
              </button>
              <Link href="/numerologia" data-mag className="pie-enlace">
                Qué es la numerología transgeneracional
              </Link>
              <Link href="/kabala" data-mag className="pie-enlace">
                Qué es la Kábala
              </Link>
              <Link href="/sinergia" data-mag className="pie-enlace">
                {t.ft_2}
              </Link>
              <Link href="/taller" data-mag className="pie-enlace">
                Taller gratis
              </Link>
              <Link href="/cursos" data-mag className="pie-enlace">
                {t.ft_3}
              </Link>
              <Link href="/membresia" data-mag className="pie-enlace">
                {t.ft_4}
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="pie-rotulo">{t.ft_legal}</span>
              <Link href="/legal" data-mag className="pie-enlace">
                {t.ft_l1}
              </Link>
              <Link href="/privacidad" data-mag className="pie-enlace">
                {t.ft_l2}
              </Link>
              <a href={`mailto:${CONTACTO.email}`} data-mag className="pie-enlace">
                {t.ft_l3}
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--linea)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 'var(--t-nota)', lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>{t.ft_disc}</span>
            <span style={{ fontSize: 'var(--t-nota)', color: 'var(--tx-4)' }}>© 2026 · ES / PT / EN</span>
          </div>
        </div>
      </div>

      <ChatWidget ref={chatRef} />
      {/* Las frases que asoman por los márgenes mientras se baja. Van aquí, al
          final y fuera de todo: son de la página entera, no de ningún bloque. */}
      <Susurros />
    </div>
  );
}
