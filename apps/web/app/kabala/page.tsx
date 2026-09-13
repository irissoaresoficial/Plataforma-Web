'use client';

import Link from 'next/link';
import { useRef } from 'react';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import Foto from '@/components/Foto';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import ChatWidget, { type ChatWidgetHandle } from '@/components/ChatWidget';
import Susurros from '@/components/Susurros';
import ArbolVida from '@/components/ArbolVida';
import { useLang } from '@/lib/i18n';
import { KABALA, eur } from '@/content/site';

/*
 * ============================================================================
 * QUÉ ES LA KÁBALA — LA PÁGINA
 * ============================================================================
 *
 * Esto era un bloque de la portada, y ocupaba pantalla y media explicando el
 * producto de 333 € a alguien que todavía no había decidido si compra el de
 * 111 €. Información correcta en el momento equivocado — que es literalmente de
 * lo que se quejaba Gerson: «hay tantos servicios que la gente se pierde».
 *
 * Aquí tiene todo el sitio que necesita, y quien llega es quien ha querido
 * llegar: viene del bloque de las consultas o del pie, o sea que ya sabe que
 * existe una consulta de Kábala y quiere saber qué es antes de pagarla.
 *
 * Se mudó ENTERO, sin recortar: el mismo titular, el mismo árbol dibujado, las
 * mismas cuatro piezas y el mismo botón. Lo único que cambia es que ahora hay
 * sitio para decir lo que faltaba y era importante: que son TRES sesiones.
 */

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

function PillCTA({ onClick, variant, label }: { onClick: () => void; variant: 'gold' | 'cream'; label: string }) {
  return (
    <button type="button" onClick={onClick} data-mag className={`pill pill-${variant}`}>
      <span>{label}</span>
      <span className="pill-arrow">→</span>
    </button>
  );
}

const PAD = 'clamp(76px,10vw,150px) clamp(16px,4vw,56px)';

export default function Kabala() {
  useSiteScroll();
  const { t } = useLang();
  const chatRef = useRef<ChatWidgetHandle>(null);
  const abrirKabala = () => chatRef.current?.open('kabala');

  return (
    <div className="pagina-oscura" style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav cta={t.book} onCta={abrirKabala} />

      <div className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: 'clamp(104px,13vh,168px) clamp(16px,4vw,56px) clamp(60px,8vw,110px)', overflow: 'hidden' }}>
        <CampoNumeros intensidad={1.5} densidad={150_000} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3vw,44px)' }}>
          <Reveal>
            <Rotulo claro>Qué es la Kábala</Rotulo>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(20px,3vw,48px)', alignItems: 'end' }}>
            <Reveal delay={60} className="titular-seccion" style={{ maxWidth: '16ch' }}>
              Un mapa de ti que tiene tres mil años.
            </Reveal>
            <Reveal delay={120}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '44ch' }}>
                «Kábala» quiere decir <i>recibir</i>. No es una religión y no hay que creer en nada: es una forma de ver
                cómo eres por dentro, y por dónde te entra y te sale la vida.
              </p>
            </Reveal>
          </div>

          {/* EL ÁRBOL, AL LADO DE LO QUE LO EXPLICA.
              Las cuatro piezas decían «diez estaciones» y «veintidós senderos»
              sin enseñar ninguna, y el pie de este mismo bloque promete que
              esto se dibuja delante de ti. Ahora se dibuja: el árbol entra a la
              izquierda y las cuatro piezas se recolocan a su derecha, así que
              se lee «10 · El Árbol de la Vida» con el árbol justo al lado. En
              móvil se apilan y el árbol va primero.

              Y EL PIE SE HA METIDO AQUÍ DENTRO, en la columna de la derecha.
              Estaba debajo, cruzando el bloque entero, y dejaba doscientos
              píxeles de granate vacío al lado del árbol. Aquí abajo cierra la
              columna, la iguala de alto con el dibujo y —lo que importa— pone
              el botón de reservar justo después de lo que lo explica, en vez
              de a una pantalla de distancia. */}
          <div className="kab-cuerpo">
            <Reveal delay={80}>
              <ArbolVida />
            </Reveal>

            <div className="kab-columna">
            <div className="kab-rejilla">
            {[
              {
                n: '10',
                t: 'El Árbol de la Vida',
                p: 'Diez paradas por las que pasa todo lo que te ocurre: desde que se te ocurre algo hasta que lo haces. Es el plano de la casa.',
              },
              {
                n: '22',
                t: 'Los senderos',
                p: 'Los caminos que unen esas diez paradas. En tu carta se encienden los que te tocan a ti, y cada uno cuenta algo tuyo.',
              },
              {
                n: '3',
                t: 'Tus tres caminos',
                p: 'De dónde vienes, qué has venido a cambiar y hacia dónde vas. Salen de tu fecha, y son los que se leen en la consulta.',
              },
              {
                n: 'תיקון',
                t: 'El Tikun',
                p: 'La palabra que sostiene todo esto: reparar. Lo que te llega de tu familia no hay que aguantarlo — se repara y se le devuelve a quien era.',
              },
            ].map((k, i) => (
              <Reveal key={k.t} delay={100 + i * 60} className="kab-ficha">
                <span className="kab-num">{k.n}</span>
                <h3 className="kab-tit">{k.t}</h3>
                <p className="kab-txt">{k.p}</p>
              </Reveal>
            ))}
            </div>

            <Reveal delay={340}>
              <div className="kab-pie">
                <p>
                  En consulta esto no se explica: se dibuja delante de ti con tu nombre y tu fecha, y sales con el mapa
                  en la mano.
                </p>
                <PillCTA
                  onClick={abrirKabala}
                  variant="gold"
                  label={`Reservar la consulta de Kábala · ${eur(KABALA.precio)}`}
                />
              </div>
            </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* LAS TRES SESIONES. Es lo que Iris pidió que se dijera y lo que explica
          que esto cueste el triple que la otra consulta. Va después del árbol y
          antes del pie: primero se entiende qué es, y entonces el precio tiene
          con qué compararse. */}
      <div className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: PAD }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal><Rotulo>La consulta de Kábala</Rotulo></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 'clamp(22px,3vw,52px)', alignItems: 'start' }}>
            <Reveal delay={60} className="titular-seccion" style={{ maxWidth: '15ch' }}>
              No es una sesión. Son tres.
            </Reveal>
            <Reveal delay={120} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2vw,24px)', maxWidth: '46ch' }}>
              <p style={{ margin: 0, fontSize: 'var(--t-entrada)', lineHeight: 1.6, color: 'var(--tx-2)' }}>
                Un mapa así no se lee de una sentada. Se dibuja con tu nombre y tu fecha, se recorre entero, y sales con
                él en la mano — no con apuntes de algo que te contaron.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,2vw,22px)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: 'var(--peso-fino)', lineHeight: 1, letterSpacing: '-.02em' }}>
                  {eur(KABALA.precio)}
                </span>
                <PillCTA onClick={abrirKabala} variant="cream" label="Reservar la consulta de Kábala" />
              </div>
              <p style={{ margin: 0, fontSize: 'var(--t-mini)', color: 'var(--tx-3)' }}>
                Las tres sesiones, online. Se reserva hablando, en un minuto.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="vino" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: 'clamp(40px,6vw,70px) clamp(16px,4vw,56px)' }}>
        <div className="com-pie" style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Link href="/" aria-label="Ir al inicio"><Marca tam={30} claro /></Link>
          <span>
            <Link href="/">Inicio</Link>
            <Link href="/legal">Aviso legal</Link>
            <Link href="/privacidad">Tus datos</Link>
          </span>
        </div>
      </div>

      <ChatWidget ref={chatRef} />
      <Susurros />
    </div>
  );
}
