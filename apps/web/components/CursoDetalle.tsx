'use client';

import { useEffect, useRef, useState } from 'react';
import { falta, eur, type Curso } from '@/content/site';
import Pendiente, { Hueco } from './Pendiente';
import LeadForm from './LeadForm';
import useCapa from './useCapa';

/**
 * La ficha completa de un curso, en una ventana sobre la página.
 *
 * Dentro va todo lo que alguien necesita para decidir: el vídeo donde Iris lo
 * cuenta, el programa, para quién es, qué se lleva, y el botón de reservar.
 * Si todavía no hay enlace de pago, el botón no finge: capta el correo y lo
 * dice claro.
 */
export default function CursoDetalle({ curso, abierto, onCerrar }: { curso: Curso; abierto: boolean; onCerrar: () => void }) {
  const [pestana, setPestana] = useState<'programa' | 'quien' | 'llevas'>('programa');
  const cajaRef = useRef<HTMLDivElement>(null);

  // Y el botón de atrás la cierra en vez de sacar de la web. Ver useCapa.
  useCapa(abierto, onCerrar);

  // Con la ventana abierta, la página de detrás no se mueve y Escape cierra.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPulsar);
    cajaRef.current?.focus();
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', alPulsar);
    };
  }, [abierto, onCerrar]);

  const pestanas = [
    ['programa', 'Qué vemos', curso.bloques.length],
    ['quien', 'Para quién es', curso.paraQuien.length],
    ['llevas', 'Qué te llevas', curso.teLlevas.length],
  ] as const;

  return (
    <div
      className={`modal-fondo${abierto ? ' abierto' : ''}`}
      onClick={onCerrar}
      aria-hidden={!abierto}
    >
      <div
        ref={cajaRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={falta(curso.titulo) ? 'Detalle del curso' : curso.titulo}
        className="modal-caja claro"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-cuerpo">
          {/*
              TODA LA CABECERA SE PARA ANTES DE LA ×, NO SÓLO EL RÓTULO.

              El hueco estaba puesto sólo en esta línea de arriba, así que el
              título y la frase de debajo seguían pasando por debajo del botón
              de cerrar: en el móvil, la primera frase del curso —la que tiene
              que convencer— se leía con la esquina derecha comida.

              Va en la caja de fuera para que valga para todo lo que haya
              dentro, ahora y lo que se añada mañana.
          */}
          <span
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--acento)',
            }}
          >
            {curso.fechas} · {curso.duracion}
          </span>
          {falta(curso.titulo) ? (
            <div style={{ margin: '14px 0 20px' }}>
              <Hueco lineas={2} alto={30} etiqueta="Falta el título" />
            </div>
          ) : (
            <h2 className="display" style={{ margin: '10px 0 6px', fontSize: 'var(--t-bloque)' }}>{curso.titulo}</h2>
          )}
          {falta(curso.claim) ? (
            <div style={{ margin: '0 0 22px' }}>
              <Hueco lineas={2} alto={15} etiqueta="Falta la frase" />
            </div>
          ) : (
            <p style={{ margin: '0 0 22px', fontSize: 17, lineHeight: 1.55, color: 'var(--tx-2)' }}>{curso.claim}</p>
          )}

          {/* El vídeo donde ella lo cuenta con su voz: es lo que más vende.
              Cuando no lo hay, el hueco NO guarda el sitio de un 16:9. Guardarlo
              dejaba medio metro de vacío nada más abrir la ficha y empujaba el
              temario —lo único que de verdad cuenta lo que se compra— por debajo
              del borde. Sin vídeo: una franja de dos renglones y a seguir. */}
          <div className={curso.videoUrl ? 'modal-video' : 'modal-video-sin'}>
            {curso.videoUrl ? (
              <iframe
                src={curso.videoUrl}
                title="Iris presenta el curso"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="modal-video-hueco">
                <Pendiente>Vídeo pendiente</Pendiente>
                <span>Aquí va el vídeo en el que Iris presenta este curso.</span>
              </div>
            )}
          </div>

          {/* EL PRECIO, ANTES DEL TEMARIO Y NO METIDO EN LA REJILLA DE DATOS.
              Era la cuarta celda de un cuadro de cuatro, del tamaño del
              horario. Aquí manda, y con la misma cara que en la tarjeta de
              fuera: quien entra desde ahí encuentra la misma cifra en el mismo
              sitio, y no tiene que volver a buscarla. */}
          {curso.precio === null ? (
            <div className="curso-oferta" style={{ marginBottom: 24 }}>
              <Pendiente>Precio por confirmar</Pendiente>
            </div>
          ) : (
            <div className="curso-oferta" style={{ marginBottom: 24 }}>
              {curso.precioAntes ? (
                <span className="oferta-badge">−{Math.round(((curso.precioAntes - curso.precio) / curso.precioAntes) * 100)} %</span>
              ) : null}
              <div className="oferta-fila">
                <b>{eur(curso.precio)}</b>
                {curso.precioAntes ? <s>{eur(curso.precioAntes)}</s> : null}
              </div>
              {curso.precioAntes ? (
                <span className="oferta-ahorro">Te ahorras {eur(curso.precioAntes - curso.precio)}</span>
              ) : null}
            </div>
          )}

          <div className="modal-datos">
            {[
              ['Cuándo', curso.fechas],
              ['Horario', curso.horario],
              ['Duración', curso.duracion],
            ].map(([k, v]) => (
              <div key={k as string}>
                <span>{k}</span>
                <strong>{v === null || falta(v as string) ? <Pendiente /> : (v as string)}</strong>
              </div>
            ))}
          </div>

          <div className="modal-pestanas" role="tablist">
            {pestanas.map(([id, texto, n]) => (
              <button
                key={id}
                role="tab"
                aria-selected={pestana === id}
                className={pestana === id ? 'activa' : ''}
                onClick={() => setPestana(id)}
              >
                {texto} <em>{n}</em>
              </button>
            ))}
          </div>

          <div className="modal-lista">
            {pestana === 'programa' &&
              curso.bloques.map((b, i) => (
                <div key={i} className="modal-fila">
                  <span className="modal-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{falta(b.t) ? <Pendiente /> : b.t}</strong>
                    <p>{falta(b.d) ? <Pendiente /> : b.d}</p>
                  </div>
                </div>
              ))}
            {pestana === 'quien' &&
              curso.paraQuien.map((x, i) => (
                <div key={i} className="modal-fila">
                  <span className="modal-check">✓</span>
                  <div>
                    <p>{falta(x) ? <Pendiente /> : x}</p>
                  </div>
                </div>
              ))}
            {pestana === 'llevas' &&
              curso.teLlevas.map((x, i) => (
                <div key={i} className="modal-fila">
                  <span className="modal-check">✓</span>
                  <div>
                    <p>{falta(x) ? <Pendiente /> : x}</p>
                  </div>
                </div>
              ))}
          </div>

          {/*
            EL FORMULARIO SIGUE ESTANDO AUNQUE YA SE PUEDA PAGAR.

            Antes desaparecía en cuanto había enlace de Stripe, y ese es un
            agujero caro: de cada diez que abren esta ficha, la mayoría no paga
            hoy. Sin formulario, esos se van sin dejar nada — Stripe no cuenta
            nada de quien no compra— y no se les puede volver a escribir nunca.
            Un curso de 397 € rara vez se paga en la primera visita.

            Lo que NO se hace es meter el formulario delante del pago: quien
            viene decidido pulsa el botón de arriba y se va a pagar. Esto es
            para el otro, y por eso está debajo del temario y con otro tono.
          */}
          <div className="modal-reserva">
            {curso.stripeUrl ? (
              <>
                <strong>¿Todavía te lo estás pensando?</strong>
                <p>
                  Déjame tu correo y te escribo con las dudas que suele tener todo el mundo antes de apuntarse. Sin
                  compromiso: reservar se hace ahí arriba.
                </p>
                <LeadForm
                  origen="curso"
                  detalle={falta(curso.titulo) ? `Curso ${curso.fechas}` : curso.titulo}
                  cta="Escríbeme sobre el curso"
                  variant="light"
                  successTitle="Anotado"
                  successText="Te escribo con lo que suele preguntarse antes de apuntarse a este curso."
                  privacidad="Solo guardo tu correo para escribirte de este curso."
                />
              </>
            ) : (
              <>
                <strong>Las plazas todavía no están abiertas.</strong>
                <p>Déjame tu correo y te aviso en cuanto pueda reservarse. No se cobra nada ahora.</p>
                <LeadForm
                  origen="curso"
                  detalle={falta(curso.titulo) ? `Curso ${curso.fechas}` : curso.titulo}
                  cta="Avísame para reservar"
                  variant="light"
                  successTitle="Anotado"
                  successText="Te aviso en cuanto se abran las plazas de este curso."
                  privacidad="Solo guardo tu correo para avisarte de este curso."
                />
              </>
            )}
          </div>
        </div>

        {/* Con pago abierto, el botón se queda pegado abajo: se decide sin
            volver arriba. Sin pago, el formulario va dentro del cuerpo, porque
            fijado abajo ocupaba media ventana y tapaba el programa. */}
        {curso.stripeUrl && (
          <div className="modal-pie">
            <div>
              <strong>
                {curso.precio === null ? (
                  'Precio por confirmar'
                ) : (
                  <>
                    {eur(curso.precio)}
                    {curso.precioAntes ? <s className="precio-antes">{eur(curso.precioAntes)}</s> : null}
                  </>
                )}
              </strong>
              <span>Pago seguro con Stripe</span>
            </div>
            <a href={curso.stripeUrl} target="_blank" rel="noopener noreferrer" className="pill pill-cream" data-mag>
              <span>Reservar mi plaza</span>
              <span className="pill-arrow">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
