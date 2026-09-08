'use client';

import Link from 'next/link';
import Cursor from '@/components/Cursor';
import Cortina from '@/components/Cortina';
import CampoNumeros from '@/components/CampoNumeros';
import Reveal from '@/components/Reveal';
import useSiteScroll from '@/components/useSiteScroll';
import Nav from '@/components/Nav';
import Marca from '@/components/Marca';
import LeadForm from '@/components/LeadForm';
import Pendiente, { Texto } from '@/components/Pendiente';
import { MEMBRESIA, PENDIENTE, eur } from '@/content/site';
import Lanzamiento from '@/components/Lanzamiento';

/*
 * ============================================================================
 * RESERVAR YA NO ES GRATIS
 * ============================================================================
 *
 * Esta página nació como lista de espera: dejabas el correo, no se te cobraba
 * nada y ya se te avisaría. Gerson lo cambió, y con el mismo motivo que en las
 * sesiones: una reserva que no cuesta nada no la respeta nadie, y el día que
 * abre te encuentras diez plazas apalabradas y tres personas.
 *
 * Ahora reservar es PAGAR EL PRIMER MES por adelantado. Con eso se guarda la
 * plaza y se guarda el precio de lanzamiento; la comunidad sigue abriendo en la
 * fecha de `MEMBRESIA.abreISO`, y ese primer mes pagado es el primer mes dentro.
 *
 * TODO ESTO ESTÁ APAGADO MIENTRAS NO HAYA ENLACE DE STRIPE. No es prudencia
 * excesiva: sin enlace, la página estaría diciendo «paga hoy» y ofreciendo un
 * formulario que no cobra. Con `NEXT_PUBLIC_PAGO_MEMBRESIA` puesto en Vercel se
 * enciende entera —textos, cuentas y botón— y sin ella se queda como estaba,
 * que es una lista de espera honesta.
 *
 * Y una cosa que hay que mirar de frente: quien pague hoy no recibe nada hasta
 * que abra. Cuanto más lejos quede esa fecha, más devoluciones. Por eso el
 * texto dice sin rodeos qué se paga, qué se recibe y cuándo, en vez de esconder
 * la espera en letra pequeña.
 */
const PAGO = process.env.NEXT_PUBLIC_PAGO_MEMBRESIA || '';

export default function Membresia() {
  useSiteScroll();
  const ahorro = MEMBRESIA.precio - MEMBRESIA.precioReserva;

  return (
    <div style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', overflowX: 'clip' }}>
      <Cursor />
      <Cortina />
      <div id="bar" style={{ position: 'fixed', top: 0, left: 0, height: 2, width: '0%', background: 'var(--acento)', zIndex: 130 }} />
      <Nav
        cta={PAGO ? 'Reservar mi plaza' : 'Entrar en la lista'}
        ctaHref="#reservar"
        extra={[{ href: '#reservar', label: PAGO ? 'Reservar mi plaza' : 'Entrar en la lista' }]}
      />

      {/* HERO */}
      <div id="top" className="claro" style={{ position: 'relative', color: 'var(--tx)', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: 'clamp(88px,12vh,130px) clamp(14px,3vw,36px) clamp(30px,5vh,56px)', overflow: 'hidden' }}>
        <CampoNumeros intensidad={0.7} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 75% 60% at 20% 25%,rgba(200,163,92,.13),transparent 62%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1240, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(28px,4vw,68px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.2vw,28px)' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acento)' }} />
                {PAGO ? 'Reserva abierta · plazas de lanzamiento' : 'Aún no ha abierto · lista de espera'}
              </div>
            </Reveal>
            <Reveal as="h1" delay={70} style={{ margin: 0, fontSize: 'min(clamp(38px,5.8vw,78px),15vh)', fontFamily: 'var(--serif)', lineHeight: 0.99, letterSpacing: '-.026em', maxWidth: '15ch', textWrap: 'pretty' }}>
              Entenderlo lleva una sesión. <span style={{ color: 'var(--acento)' }}>Cambiarlo lleva meses.</span>
            </Reveal>
            {/* Las palabras que hacen el trabajo, marcadas. El párrafo era un
                bloque gris de cuarenta palabras: se leía entero o no se leía
                nada, y en una página de venta la gente barre, no lee. */}
            <Reveal delay={150}>
              <p className="mb-entrada">
                Un patrón que lleva <strong>tres generaciones</strong> funcionando no se desmonta en una tarde. Por eso
                abro un <strong>grupo pequeño</strong>: cada mes miramos una parte de tu historia familiar y sueltas
                algo que llevabas cargando <strong>sin saberlo</strong>.
              </p>
            </Reveal>

            {/* La misma cuenta que en la portada, aquí también: quien llega a
                esta página viene a decidir, y «abre el 7 de noviembre» es la
                mitad de la decisión. Sale de MEMBRESIA.abreISO, así que las dos
                páginas no pueden decir fechas distintas. */}
            <Lanzamiento abreISO={MEMBRESIA.abreISO} desdeISO={MEMBRESIA.listaDesdeISO} />

            {/* Un paso al mes */}
            <Reveal delay={210}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 460 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 68 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${26 + i * 6}%`,
                        borderRadius: '5px 5px 2px 2px',
                        background: i < 3 ? 'linear-gradient(to top,var(--oro),var(--oro-luz))' : 'var(--linea)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--tx-3)' }}>
                  <span>mes 1</span>
                  <span>sin fecha de final</span>
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--tx-2)' }}>
                  Un paso cada mes. Esto no se acaba en seis semanas.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Tarjeta de reserva */}
          <Reveal
            delay={140}
            style={{
              background: 'linear-gradient(155deg,rgba(251,246,238,.13),rgba(251,246,238,.05) 62%)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(200,155,74,.34)',
              borderRadius: 'var(--radio)',
              padding: 'clamp(24px,2.6vw,36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 34px 80px rgba(0,0,0,.5)',
              scrollMarginTop: 90,
            }}
          >
            {/*
                EL PRECIO ES EL ARGUMENTO, ASÍ QUE MANDA.

                Estaba del tamaño de un titular de sección, con el tachado al
                lado en dieciocho píxeles y una explicación de tres renglones
                debajo. Esto es una página de venta: lo primero que tiene que
                entrar por los ojos es cuánto cuesta y cuánto te ahorras.

                Los tres números de abajo son aritmética, no marketing: 0 € hoy,
                34 € menos al mes, 408 € menos al año. Salen de restar los dos
                precios que están arriba, así que si mañana cambian, cambian
                también ellos y no hay nada que actualizar a mano.
            */}
            <div id="reservar" />
            <div className="pv">
              {/*
                  LAS DIEZ PRIMERAS, EN GRANDE Y ARRIBA DEL TODO.

                  Faltaba el motivo del precio. La página enseñaba 33 € tachando
                  67 € y un −51 %, sin decir en ningún sitio POR QUÉ. Un
                  descuento sin motivo no acelera a nadie: parece que mañana
                  seguirá ahí, y quien lo ve se lo piensa otro día.

                  El motivo existe y es de verdad: la comunidad abre con diez
                  personas porque cada mes se revisa un caso en voz alta, y con
                  cuarenta eso no se puede hacer. Las diez primeras se quedan
                  con ese precio; la undécima paga los 67 €. Estaba escrito
                  únicamente en el cuarto correo de la secuencia, al que llega
                  poca gente — o sea, escondido justo donde se decide la compra.

                  Sale del dato, no escrito a mano: el día que dejen de ser diez
                  plazas, se cambia el número en site.ts o se pone a null y esta
                  cinta desaparece sola. Una escasez que se queda puesta cuando
                  ya no es cierta es lo que hace que nadie se crea la siguiente.
              */}
              {MEMBRESIA.plazasLanzamiento ? (
                <span className="pv-plazas">
                  Solo las <b>{MEMBRESIA.plazasLanzamiento} primeras</b> personas
                </span>
              ) : (
                <span className="pv-cinta">{PAGO ? 'Precio de lanzamiento' : 'Precio de lista de espera'}</span>
              )}

              <div className="pv-cifra">
                <b>{eur(MEMBRESIA.precioReserva)}</b>
                <span className="pv-al">al mes</span>
              </div>

              <div className="pv-antes">
                <s>{eur(MEMBRESIA.precio)}</s>
                <span className="pv-badge">−{Math.round((ahorro / MEMBRESIA.precio) * 100)}%</span>
              </div>

              {/* La primera cifra dice lo que sale de la cuenta HOY, y por eso
                  cambia: con pago es el primer mes por adelantado, sin pago es
                  cero. Es el número que más se mira de los tres. */}
              <div className="pv-cuentas">
                <div>
                  <b>{PAGO ? eur(MEMBRESIA.precioReserva) : '0 €'}</b>
                  <span>{PAGO ? 'hoy, tu primer mes' : 'hoy'}</span>
                </div>
                <div>
                  <b>{eur(ahorro)}</b>
                  <span>menos al mes</span>
                </div>
                <div>
                  <b>{eur(ahorro * 12)}</b>
                  <span>menos al año</span>
                </div>
              </div>

              <p className="pv-cierre">
                {PAGO ? (
                  <>
                    Hoy pagas <strong>{eur(MEMBRESIA.precioReserva)}</strong>, que es tu primer mes dentro: con eso
                    quedan guardadas tu plaza y tu precio. La comunidad{' '}
                    <strong>abre el día de la cuenta atrás</strong> y ése es el mes que estás pagando. A partir de ahí,
                    {' '}{eur(MEMBRESIA.precioReserva)} al mes en vez de {eur(MEMBRESIA.precio)} — y los sigues pagando
                    el mes doce, y el veinticuatro. <strong>El precio se queda contigo</strong>, no con la fecha.
                  </>
                ) : (
                  <>
                    Hoy <strong>no se te cobra nada</strong>. Cuando abra, entras por {eur(MEMBRESIA.precioReserva)} en
                    vez de {eur(MEMBRESIA.precio)} — y sigues pagando {eur(MEMBRESIA.precioReserva)} el mes doce, y el
                    veinticuatro. <strong>El precio se queda contigo</strong>, no con la fecha.
                  </>
                )}
                {MEMBRESIA.plazasLanzamiento ? (
                  <>
                    {' '}El grupo abre con <strong>{MEMBRESIA.plazasLanzamiento} personas</strong> porque cada mes
                    se mira un caso en voz alta, y eso con cuarenta no se puede hacer. Quien llegue después,
                    entra por {eur(MEMBRESIA.precio)}.
                  </>
                ) : null}
              </p>
            </div>

            <div style={{ height: 1, background: 'var(--linea)' }} />

            {/* Con pago el formulario no cambia de forma: sigue pidiendo lo
                mismo y guardando el correo ANTES de mandar a Stripe. Lo que
                cambia son las palabras y que al terminar aparece el botón de
                pagar. Ver el comentario de `pagoUrl` en LeadForm: quien se va a
                pagar y no termina no puede desaparecer sin dejar rastro. */}
            <LeadForm
              origen="membresia"
              detalle={`Reserva a ${eur(MEMBRESIA.precioReserva)} (precio normal ${eur(MEMBRESIA.precio)})`}
              cta={PAGO ? 'Continuar' : `Guardar mi precio de ${eur(MEMBRESIA.precioReserva)}`}
              successTitle={PAGO ? 'Ya te tengo. Falta el pago.' : 'Plaza reservada.'}
              successText={
                PAGO
                  ? `Tu plaza queda guardada en cuanto pagues el primer mes. Son ${eur(MEMBRESIA.precioReserva)} y es el mes con el que entras el día que abrimos.`
                  : `Te escribo en cuanto abra, con tu precio de ${eur(MEMBRESIA.precioReserva)} guardado. Si me dejaste el WhatsApp, te aviso también por ahí.`
              }
              privacidad={
                PAGO
                  ? 'El pago va por Stripe: esta web no ve ni guarda los datos de tu tarjeta.'
                  : 'No se cobra nada ahora. Te aviso cuando abra y nada más.'
              }
              pagoUrl={PAGO}
              pagoCta={`Pagar ${eur(MEMBRESIA.precioReserva)} y reservar mi plaza`}
              pedirNombre
              pedirWhatsapp
            />
          </Reveal>
        </div>
      </div>

      {/*
          CÓMO ES UN MES DENTRO

          Lo primero que preguntaba esta página al bajar era «qué incluye cada
          mes», y contestaba con tres tarjetas de puntos suspensivos. Una página
          de venta cuyo primer bloque es un hueco no vende: parece un producto a
          medio hacer, que es exactamente lo que se dijo de ella.

          Esto es lo que sí se puede contar, porque no es una promesa de
          servicio sino el método: cómo se trabaja un árbol por capas, que es lo
          que hace que esto dure meses y no una tarde. Es la misma materia del
          curso y del motor de la web. Lo que sigue sin estar cerrado —cuántos
          directos, qué materiales— está más abajo y marcado, donde ya no es lo
          primero que se ve.
      */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>Cómo es un mes dentro</span>
              <h2 className="titular-seccion" style={{ margin: 0, maxWidth: '20ch' }}>
                Un árbol no se lee de una vez. Se lee por capas.
              </h2>
              <p className="mb-entrada">
                Cada mes se abre <strong>una capa</strong>: tú, tus padres, tus abuelos, y lo que se repite entre
                ellos. Se calcula, se mira qué vuelve —<strong>los mismos números, las mismas edades, los mismos
                años</strong>— y se trabaja eso, sólo eso. Al mes siguiente, la capa de debajo.
              </p>
            </div>
          </Reveal>

          <div className="mb-capas">
            {[
              ['01', 'Tu capa', 'Tus números y el año en el que estás. Es el suelo: sin esto lo demás no se sostiene.'],
              ['02', 'La capa de tus padres', 'Sus fechas al lado de la tuya. Aquí es donde suele aparecer la primera repetición, y donde más de uno entiende de golpe una discusión de veinte años.'],
              ['03', 'La capa de tus abuelos', 'Dos generaciones más atrás. Lo que en tu vida parece carácter, aquí muchas veces resulta ser herencia.'],
              ['04', 'Lo que se repite', 'Puesto en una tabla, con nombre y fecha. Deja de ser una sensación y pasa a ser algo que se puede señalar con el dedo.'],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 70}>
                <div data-card className="card-hover-light mb-capa">
                  <span data-cardnum className="mb-capa-num">{n}</span>
                  <div>
                    <b>{t}</b>
                    <span>{d}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>Y además, cada mes</span>
              <Pendiente>Por definir</Pendiente>
              <span style={{ flex: 1, height: 1, background: 'var(--linea)', minWidth: 40 }} />
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
            {MEMBRESIA.incluye.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  data-card
                  className="card-hover-light"
                  style={{
                    background: '#FFFFFF',
                    border: `1px ${item === PENDIENTE ? 'dashed' : 'solid'} var(--linea)`,
                    borderRadius: 'var(--radio)',
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 18,
                    minHeight: 150,
                  }}
                >
                  <span data-cardnum style={{ fontSize: 26, fontWeight: 'var(--peso-fino)', letterSpacing: '-.022em', color: 'var(--tx-3)', transition: 'color .5s ease' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item === PENDIENTE ? <Pendiente /> : <span style={{ fontSize: 17, fontWeight: 'var(--peso-fino)', letterSpacing: '-.02em', lineHeight: 1.3 }}>{item}</span>}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p style={{ margin: 0, fontSize: 'var(--t-cuerpo)', lineHeight: 1.6, color: 'var(--tx-2)', maxWidth: '52ch' }}>
              {PAGO ? (
                <>
                  El contenido exacto se cierra antes de abrir, y quien tenga plaza lo recibe el primero.{' '}
                  {/* Lo que pasa si alguien paga y se echa atrás. Ver el comentario
                      de `devoluciones` en content/site.ts: mientras no esté
                      decidido sale marcado en rojo, y tiene que verse. */}
                  <Texto valor={MEMBRESIA.devoluciones} />
                </>
              ) : (
                'El contenido exacto se cierra antes de abrir. Quien esté en la lista lo recibe el primero, y decide entonces si entra o no.'
              )}
            </p>
          </Reveal>
        </div>
      </div>

      {/* PARA QUIÉN */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: 'clamp(60px,8vw,120px) clamp(14px,3vw,36px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(24px,3.4vw,56px)' }}>
          <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--acento)' }}>Para quién sí</span>
            {[
              'Si llevas años viendo el mismo final y ya te cansaste de explicártelo con fuerza de voluntad.',
              'Si has hecho una sesión y quieres seguir tirando del hilo, no quedarte con la foto.',
              'Si prefieres un paso al mes bien dado que un curso de seis semanas que se acaba.',
            ].map((l) => (
              <div key={l} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.55 }}>
                <span style={{ color: 'var(--acento)' }}>✓</span>
                <span style={{ color: 'var(--tx-2)' }}>{l}</span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={100} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ fontSize: 'var(--rotulo-tam)', fontWeight: 'var(--rotulo-peso)', letterSpacing: 'var(--rotulo-esp)', textTransform: 'uppercase', color: 'var(--tx-3)' }}>Para quién no</span>
            {[
              'Si lo que buscas es que te digan qué va a pasar. Aquí se trabaja con lo que ya está pasando.',
              'Si quieres resolverlo en una tarde. Esto va de meses, no de una sesión.',
              'Si estás en un momento delicado y lo que necesitas es un profesional de la salud mental.',
            ].map((l) => (
              <div key={l} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.55 }}>
                <span style={{ color: 'var(--tx-4)' }}>—</span>
                <span style={{ color: 'var(--tx-2)' }}>{l}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* CIERRE */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', padding: '0 clamp(14px,3vw,36px) clamp(60px,8vw,110px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <Reveal>
            <div style={{ fontSize: 'var(--t-seccion)', fontFamily: 'var(--serif)', lineHeight: 1.04, letterSpacing: '-.022em', maxWidth: '18ch', textWrap: 'pretty' }}>
              {PAGO ? 'Diez plazas con este precio. Después, el normal.' : 'Cuando abra, los de la lista entran primero.'}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <a href="#reservar" data-mag data-cur-label="Reservar" className="pill pill-gold">
              <span>Reservar mi plaza por {eur(MEMBRESIA.precioReserva)}</span>
              <span className="pill-arrow">→</span>
            </a>
          </Reveal>
          <Reveal delay={140}>
            <span style={{ fontSize: 13, color: 'var(--tx-3)' }}>
              {PAGO
                ? `Hoy pagas ${eur(MEMBRESIA.precioReserva)}: tu primer mes dentro.`
                : 'No se cobra nada hoy.'}
            </span>
          </Reveal>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', borderTop: '1px solid var(--linea)', padding: 'clamp(34px,5vw,60px) clamp(14px,3vw,36px) 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                <Marca tam={52} apilado />
            </Link>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <Link href="/sinergia" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Prueba gratis</Link>
              <Link href="/cursos" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Cursos</Link>
              <Link href="/#cita" style={{ fontSize: 13, color: 'var(--tx-2)' }}>Sesión con Iris</Link>
            </div>
            <span style={{ display: 'flex', gap: 14, fontSize: 12, marginBottom: 4 }}>
              <Link href="/legal" style={{ color: 'var(--tx-2)' }}>Aviso legal</Link>
              <Link href="/privacidad" style={{ color: 'var(--tx-2)' }}>Tus datos</Link>
            </span>
            <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--tx-4)', maxWidth: '58ch' }}>
              Las sesiones y los cursos no son un tratamiento médico ni psicológico y no sustituyen a ninguno.
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>© 2026 · La comunidad</span>
        </div>
      </div>
    </div>
  );
}
