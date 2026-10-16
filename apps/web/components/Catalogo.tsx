'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CURSOS, falta, type Curso } from '@/content/site';
import './escuela33/escuela33.css';

/**
 * ============================================================================
 * EL CATÁLOGO DE CURSOS
 * ============================================================================
 *
 * Gerson, tres veces: «aquí la idea es que sea como un buscador, porque poco a
 * poco van saliendo cursos; el curso de Desórdenes Amorosos es sólo un curso
 * más de tantos que habrá».
 *
 * Así que esto NO es la página de un curso con sitio para otros. Es una lista
 * que se busca y se filtra, y que tiene que leerse bien con uno, con cinco y
 * con veinte. Hoy hay uno. El diseño no puede delatarlo.
 *
 * ---------------------------------------------------------------------------
 * CON UN SOLO CURSO, EL BUSCADOR SE CALLA
 * ---------------------------------------------------------------------------
 * Un campo de búsqueda y seis filtros encima de una sola tarjeta es la forma
 * más rápida de que una web parezca vacía. Por debajo de tres cursos no se
 * pintan: la lista sola se explica. En cuanto haya tres, aparecen solos, sin
 * tocar nada.
 *
 * ---------------------------------------------------------------------------
 * EL ESTADO SALE DE LOS DATOS, NO SE ESCRIBE
 * ---------------------------------------------------------------------------
 * «Abierto» sólo si hay fecha de verdad y todavía no ha pasado. Si la ficha
 * está a medias —y hoy lo está casi entera— pone «Próximamente», que es la
 * verdad. No se inventa un precio ni unas fechas para que la tarjeta se vea
 * más llena: eso es poner a alguien a comprar algo que no existe.
 */

type Estado = 'abierto' | 'pronto' | 'cerrado';

function estadoDe(c: Curso): Estado {
  if (falta(c.fechaISO)) return 'pronto';
  const dia = new Date(c.fechaISO + 'T23:59:59');
  if (Number.isNaN(dia.getTime())) return 'pronto';
  return dia.getTime() < Date.now() ? 'cerrado' : 'abierto';
}

const NOMBRE: Record<Estado, string> = {
  abierto: 'Inscripción abierta',
  pronto: 'Próximamente',
  cerrado: 'Ya celebrado',
};

const euros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

/** Sin acentos y en minúsculas, para que «kabala» encuentre «Kábala». */
const llano = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Props = {
  /** En la portada se enseñan los primeros y se manda a /cursos. */
  compacto?: boolean;
  titulo?: string;
  rotulo?: string;
  /** El ancla. La portada la llama «cursos» porque es a donde apunta el
      botón del final del recorrido. */
  id?: string;
};

export default function Catalogo({ compacto = false, titulo, rotulo = 'Cursos y talleres', id = 'catalogo' }: Props) {
  const [texto, setTexto] = useState('');
  const [filtro, setFiltro] = useState<'todos' | Estado>('todos');

  const conEstado = useMemo(() => CURSOS.map((c) => ({ curso: c, estado: estadoDe(c) })), []);

  const lista = useMemo(() => {
    const q = llano(texto.trim());
    return conEstado.filter(({ curso, estado }) => {
      if (filtro !== 'todos' && estado !== filtro) return false;
      if (!q) return true;
      const paja = [curso.titulo, falta(curso.claim) ? '' : curso.claim, curso.modalidad ?? '']
        .filter(Boolean)
        .join(' ');
      return llano(paja).includes(q);
    });
  }, [conEstado, texto, filtro]);

  const aEnseñar = compacto ? lista.slice(0, 3) : lista;
  /* Los mandos aparecen cuando hay bastantes cursos como para necesitarlos. */
  const conMandos = !compacto && CURSOS.length >= 3;

  return (
    <section id={id} className="claro" style={{ position: 'relative', zIndex: 3, background: 'var(--bg)', color: 'var(--tx)', scrollMarginTop: 80 }}>
      <div className="e33-marco">
        <div className="cat-cabeza">
          <div>
            <p className="e33-rotulo">{rotulo}</p>
            <h2 className="e33-h" style={{ marginBottom: 0 }}>
              {titulo ?? 'Lo que se puede estudiar'}
            </h2>
          </div>
          {compacto ? (
            <Link href="/cursos" className="portada-cta" data-mag data-cur-label="Ver">
              <span>Ver todos</span>
              <i aria-hidden>→</i>
            </Link>
          ) : (
            <p className="cat-cuenta">
              {CURSOS.length === 1 ? '1 curso' : `${CURSOS.length} cursos`}
            </p>
          )}
        </div>

        {conMandos && (
          <>
            <div className="cat-buscar">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7.5" />
                <path d="m20.5 20.5-4-4" />
              </svg>
              <input
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar un curso"
                aria-label="Buscar un curso"
              />
              {texto && (
                <button type="button" className="cat-limpiar" onClick={() => setTexto('')}>
                  Borrar
                </button>
              )}
            </div>

            <div className="cat-filtros">
              {([['todos', 'Todos'], ['abierto', 'Abiertos'], ['pronto', 'Próximamente'], ['cerrado', 'Ya celebrados']] as const).map(
                ([valor, rotuloF]) => (
                  <button
                    key={valor}
                    type="button"
                    className="cat-filtro"
                    aria-pressed={filtro === valor}
                    onClick={() => setFiltro(valor)}
                  >
                    {rotuloF}
                  </button>
                ),
              )}
            </div>
          </>
        )}

        <div
          className="cat-rejilla"
          data-pocos="no"
          /* Ya nunca hay una sola cosa en la rejilla: al curso le acompaña
             siempre la tarjeta de «próximamente». */
          style={
            {
              ...(conMandos ? {} : { marginTop: 'clamp(26px,3vw,38px)' }),
              '--cat-n': String(Math.min(aEnseñar.length + 1, 3)),
              '--cat-n2': String(Math.min(aEnseñar.length + 1, 2)),
            } as React.CSSProperties
          }
        >
          {aEnseñar.map(({ curso, estado }) => (
            <Link
              key={curso.id}
              href={`/cursos#${curso.id}`}
              className="cat-carta"
              data-card
              data-cur-label="Ver"
            >
              <div className="cat-cartel">
                {curso.cartel ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={curso.cartel} alt="" loading="lazy" />
                ) : (
                  <div className="cat-cartel-vacio">{curso.titulo}</div>
                )}
                <span className="cat-estado" data-estado={estado}>
                  {NOMBRE[estado]}
                </span>
              </div>

              <div className="cat-cuerpo">
                <h3>{curso.titulo}</h3>
                {!falta(curso.claim) && <p className="cat-claim">{curso.claim}</p>}

                <div className="cat-datos">
                  {!falta(curso.fechas) && <span>{curso.fechas}</span>}
                  {!falta(curso.duracion) && <span>{curso.duracion}</span>}
                  {!falta(curso.modalidad) && <span>{curso.modalidad}</span>}
                  {/* Sin ningún dato todavía, la fila diría sólo el precio y
                      quedaría un hueco raro: mejor decir en voz alta que las
                      fechas se están cerrando. */}
                  {falta(curso.fechas) && falta(curso.duracion) && falta(curso.modalidad) && (
                    <span>Fechas por confirmar</span>
                  )}
                  {curso.precio !== null && (
                    <span className="cat-precio">
                      {curso.precioAntes ? <s>{euros(curso.precioAntes)}</s> : null}
                      {euros(curso.precio)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* LO QUE VIENE, DICHO EN VOZ ALTA Y EN SU SITIO.
              Con un curso en el catálogo, lo que una persona piensa es «esto
              está muerto». Decirle que van saliendo cambia por completo lo que
              lee: no es una escuela sin cursos, es una escuela empezando. */}
          {aEnseñar.length > 0 && (
            <div className="cat-pronto" aria-hidden={false}>
              <p>Próximamente, más cursos.</p>
              <span>Van saliendo poco a poco. Si quieres que te avise, dímelo en la consulta.</span>
            </div>
          )}

          {aEnseñar.length === 0 && (
            <div className="cat-nada">
              <p>No hay ningún curso con eso.</p>
              <span>Prueba con otra palabra, o quita los filtros para verlos todos.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
