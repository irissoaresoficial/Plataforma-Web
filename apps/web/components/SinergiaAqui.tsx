'use client';

/**
 * LA SINERGIA, AQUÍ MISMO
 * ============================================================================
 *
 * POR QUÉ EXISTE ESTE COMPONENTE.
 *
 * En la portada, el bloque del regalo era una frase, dos círculos dibujados y
 * un botón que se iba a otra página. Y ahí se rompía todo: la sinergia es el
 * gancho —al leer sobre lo que se repite en una familia, a cualquiera se le
 * viene alguien a la cabeza— y justo en ese segundo la web contestaba con un
 * cambio de página. Quien está enganchado no quiere navegar, quiere ver.
 * Gerson lo dijo con estas palabras: «no quiero que salga de la página».
 *
 * Así que la cuenta se hace aquí. Dos fechas, un botón, y el resultado sale
 * debajo sin recargar y sin que la dirección cambie.
 *
 * ---------------------------------------------------------------------------
 * LA CUENTA NO SE ESCRIBE AQUÍ, SE LLAMA.
 * ---------------------------------------------------------------------------
 * Todo el cálculo sale de `@/lib/numerologia`, que es el mismo módulo del que
 * come la página `/sinergia`. Ni una fórmula copiada: ese archivo avisa en su
 * cabecera de lo que pasó la vez que la misma cuenta vivió en dos sitios —dos
 * pantallas de la misma web daban números distintos para la misma fecha—, y
 * una web que echa dos veces la misma cuenta y le sale distinto no tiene un
 * fallo de programación, tiene un fallo de credibilidad.
 *
 * Lo mismo con los textos: el nombre del vínculo y las tres líneas salen de
 * `VINCULOS`, tal cual. Son lecturas que vende una profesional; una frase
 * inventada por mí no puede aparecer en su web.
 *
 * ---------------------------------------------------------------------------
 * SE PIDEN DOS FECHAS Y NINGÚN NOMBRE, Y POR ESO `estudio()` VA CON LOS
 * NOMBRES VACÍOS.
 * ---------------------------------------------------------------------------
 * La página `/sinergia` pide además los dos nombres completos, porque allí sí
 * se enseñan los números que salen del nombre (expresión, herencia, lecciones)
 * y se manda un informe. Aquí no: esto es el aperitivo dentro de la portada, y
 * cuatro campos más lo convertirían en el formulario del que la gente huye.
 *
 * Lo que se enseña —el número de cada uno, el número del vínculo, su nombre y
 * sus tres líneas— sale SÓLO de las dos fechas: `camino` se calcula de la
 * fecha, y `comun` y `vinculo` se calculan de los dos `camino`. Los nombres no
 * intervienen en nada de eso, así que se llama con los nombres vacíos y sale
 * exactamente lo mismo que sale en `/sinergia` con las mismas dos fechas.
 *
 * OJO al leer esto en el futuro: `estudio()` devuelve también `repeticiones`,
 * y esa parte SÍ mira los nombres. Con los nombres vacíos sale basura (los
 * nueve dígitos «faltan» en los dos nombres, porque no hay nombres). No se
 * pinta, y no se puede pintar desde aquí. Si algún día hace falta, hay que
 * pedir los nombres primero — o mandar a la persona a `/sinergia`, que es
 * justo lo que hace el enlace del final.
 *
 * ---------------------------------------------------------------------------
 * LO QUE NO HACE.
 * ---------------------------------------------------------------------------
 * No guarda nada ni pide el correo. Las fechas no salen del navegador. Por eso
 * el bloque puede prometerlo en voz alta y por eso no hay ninguna casilla de
 * consentimiento: no hay nada que consentir.
 *
 * Tampoco mide. El evento natural sería un `medir('sinergia')`, pero el tipo
 * `Evento` de `@/lib/medir` es una lista cerrada y no tiene ese nombre; meterlo
 * dentro de `'numero'` ensuciaría la única métrica que hoy dice cuánta gente
 * usa la calculadora de la portada. Cuando se añada el evento en `lib/medir.ts`
 * se llama desde `calcular()` y ya está.
 */

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { estudio } from '@/lib/numerologia';
import { useLang } from '@/lib/i18n';

type Fecha = { dia: string; mes: string; anio: string };

const VACIA: Fecha = { dia: '', mes: '', anio: '' };

/** Los textos del bloque. Todos se pueden sustituir desde fuera. */
export type TextosSinergia = {
  titulo: string;
  entrada: string;
  cta: string;
  /** La frase que va delante de las tres casillas de cada fecha. */
  diceTuya: string;
  diceSuya: string;
  /** Quién es cada círculo del dibujo del resultado. */
  tu: string;
  esaPersona: string;
  entera: string;
};

/*
 * QUÉ LE FALTA O QUÉ ESTÁ MAL, EN CRISTIANO.
 *
 * Es la comprobación de `TuNumero`, la misma y con las mismas frases, para que
 * las dos calculadoras de la web regañen igual. Lo único que cambia es que aquí
 * hay dos fechas y hay que decir de cuál se habla: si sólo pusiera «el día va
 * del 1 al 31» con seis casillas delante, la persona no sabría cuál mirar.
 *
 * Devuelve null mientras la fecha está a medias: a nadie se le regaña por estar
 * todavía escribiendo.
 */
function queFalta({ dia, mes, anio }: Fecha, de: string): string | null {
  if (!dia || !mes || !anio) return null;
  const d = Number(dia);
  const m = Number(mes);
  const a = Number(anio);
  if (d < 1 || d > 31) return `${de} el día va del 1 al 31.`;
  if (m < 1 || m > 12) return `${de} el mes va del 1 al 12.`;
  if (a < 1900 || a > new Date().getFullYear()) return `${de} el año va con sus cuatro cifras.`;
  // 31 de febrero y compañía: el propio calendario lo dice mejor que una tabla.
  const f = new Date(a, m - 1, d);
  if (f.getDate() !== d || f.getMonth() !== m - 1) return `${de} ese día no existe en ese mes.`;
  return null;
}

const completa = (f: Fecha) => Boolean(f.dia && f.mes && f.anio);

/** Al formato que entiende `numerologia`: aaaa-mm-dd. */
const iso = (f: Fecha) =>
  `${f.anio}-${String(Number(f.mes)).padStart(2, '0')}-${String(Number(f.dia)).padStart(2, '0')}`;

export default function SinergiaAqui({
  id = 'sinergia',
  className = '',
  textos,
}: {
  /** Ancla del bloque, para enlazar desde el menú o desde otro botón. */
  id?: string;
  /** Clases extra sobre la sección. La sección ya trae `vino` y `sinaqui`. */
  className?: string;
  /** Sustituye cualquiera de los textos. Lo que no venga, se coge del idioma. */
  textos?: Partial<TextosSinergia>;
}) {
  const { t } = useLang();
  const [a, setA] = useState<Fecha>(VACIA);
  const [b, setB] = useState<Fecha>(VACIA);
  const [hecho, setHecho] = useState<{ a: Fecha; b: Fecha } | null>(null);
  const salida = useRef<HTMLDivElement>(null);

  /*
   * Los tres textos de cabecera son los que ya tenía el bloque en la portada y
   * están traducidos a los tres idiomas: se cogen del idioma y no se tocan. Los
   * que estrena esta pieza van en castellano y se pueden sustituir desde fuera
   * el día que se traduzcan.
   *
   * Lo que NO se traduce es la lectura: los nombres de vínculo y sus líneas
   * viven en `numerologia` y están sólo en castellano, igual que en `/sinergia`.
   */
  const T: TextosSinergia = {
    titulo: t.sg_h,
    entrada: t.sg_p,
    cta: t.sg_cta,
    diceTuya: 'Tú naciste el',
    diceSuya: 'Y esa persona, el',
    tu: 'Tú',
    esaPersona: 'Esa persona',
    entera: 'Ver la lectura entera de los dos',
    ...textos,
  };

  const errorA = queFalta(a, 'En tu fecha,');
  const errorB = queFalta(b, 'En la suya,');
  const error = errorA || errorB;
  const puede = completa(a) && completa(b) && !error;

  /*
   * El resultado se guarda como las dos fechas que se pulsaron, no como el
   * estudio ya montado. Así, si alguien cambia una cifra después de calcular,
   * lo de abajo desaparece en vez de quedarse contradiciendo a las casillas —
   * que es la forma más rápida de que un resultado deje de creerse.
   */
  const res = useMemo(() => (hecho ? estudio('', iso(hecho.a), '', iso(hecho.b)) : null), [hecho]);

  const calcular = () => {
    if (!puede) return;
    setHecho({ a, b });
    /*
     * Y la vista va al resultado. En el móvil el resultado cae por debajo del
     * botón y fuera de la pantalla: pulsas y, desde fuera, no pasa nada. Con
     * `nearest` la línea vale también para el escritorio, donde el resultado ya
     * se ve y entonces no mueve nada.
     */
    requestAnimationFrame(() => salida.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  /*
   * UNA CASILLA.
   *
   * La etiqueta es un `<label>` de verdad y envuelve a su casilla, pero su texto
   * no se pinta: en esta web no hay rótulos pequeños encima de los campos. Lo
   * que ve quien mira es la frase de al lado —«tú naciste el»— y el ancho de
   * cada hueco, que ya dice cuál es el día y cuál el año. Lo que oye quien va
   * con lector de pantalla es «Tu día de nacimiento», que es más de lo que
   * diría un rótulo de tres letras.
   *
   * Los marcadores son dd/mm/aaaa y no una fecha de ejemplo. Con SEIS casillas
   * a la vista, seis números grises se leen como un formulario ya relleno y la
   * gente los borra antes de escribir; con una sola fecha —como en `TuNumero`—
   * el ejemplo funcionaba, con dos no.
   */
  const casilla = (
    quien: 'a' | 'b',
    k: keyof Fecha,
    etiqueta: string,
    largo: number,
    marca: string,
  ) => {
    const val = quien === 'a' ? a : b;
    const set = quien === 'a' ? setA : setB;
    return (
      <label className="sinaqui-campo">
        <span className="sinaqui-oculto">{etiqueta}</span>
        <input
          className={`sinaqui-input${largo === 4 ? ' sinaqui-input-anio' : ''}`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={largo}
          placeholder={marca}
          value={val[k]}
          onChange={(e) => {
            // Sólo cifras: pegar una fecha con barras no debe romper la cuenta.
            const v = e.target.value.replace(/\D/g, '').slice(0, largo);
            set((s) => ({ ...s, [k]: v }));
            setHecho(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') calcular();
          }}
        />
      </label>
    );
  };

  const fila = (quien: 'a' | 'b', dice: string, de: string) => (
    <>
      <span className="sinaqui-dice">{dice}</span>
      <span className="sinaqui-casillas">
        {casilla(quien, 'dia', `${de} día de nacimiento`, 2, 'dd')}
        {casilla(quien, 'mes', `${de} mes de nacimiento`, 2, 'mm')}
        {casilla(quien, 'anio', `${de} año de nacimiento`, 4, 'aaaa')}
      </span>
    </>
  );

  return (
    <section id={id} className={`vino sinaqui ${className}`.trim()}>
      <div className="sinaqui-dentro">
        <h2 className="sinaqui-h">{T.titulo}</h2>
        <p className="sinaqui-p">{T.entrada}</p>

        <div className="sinaqui-fechas">
          {fila('a', T.diceTuya, 'Tu')}
          {fila('b', T.diceSuya, 'Su')}
        </div>

        <div className="sinaqui-acciones">
          <button
            type="button"
            className="portada-cta portada-cta-oscuro"
            data-mag
            data-cur-label={T.cta}
            disabled={!puede}
            onClick={calcular}
          >
            <span>{T.cta}</span>
            <i aria-hidden>→</i>
          </button>
          {/* El hueco del error existe siempre, aunque esté vacío: si el aviso
              apareciera de la nada, empujaría el botón hacia abajo justo cuando
              alguien va a pulsarlo. */}
          <span role="alert" className="sinaqui-error">
            {error}
          </span>
        </div>

        {/*
            EL RESULTADO SE ANUNCIA SOLO.
            La región existe desde el principio y vacía: un `aria-live` que se
            monta a la vez que su contenido no llega a anunciar nada, porque el
            lector no lo estaba mirando todavía.
        */}
        <div className="sinaqui-salida" aria-live="polite" ref={salida}>
          {res && (
            <div className="sinaqui-res" key={`${iso(hecho!.a)}|${iso(hecho!.b)}`}>
              {/*
                  LOS DOS CÍRCULOS QUE SE CRUZAN, PERO CON LOS NÚMEROS DENTRO.

                  El dibujo ya estaba en este bloque y no se tira: es lo que la
                  palabra «sinergia» significa, dibujado. Lo que cambia es que
                  antes estaba vacío —un adorno— y ahora es el resultado: el
                  número de cada uno en su lado y el del vínculo en el trozo
                  común, que es literalmente donde va.

                  Vacío no se pinta nunca. Un número de mentira dentro de estos
                  círculos, en una web que vende lecturas de verdad, es la peor
                  idea posible.

                  Va como `role="img"` con la frase entera: leído en voz alta,
                  «siete tres nueve tú esa persona» no significa nada.
              */}
              <div
                className="sinaqui-venn"
                role="img"
                aria-label={`${T.tu}, ${res.a.camino.valor}. ${T.esaPersona}, ${res.b.camino.valor}. Entre los dos, ${res.comun}.`}
              >
                <div className="sinaqui-dibujo">
                  <svg viewBox="0 0 260 140" focusable="false" aria-hidden>
                    <circle cx="98" cy="70" r="58" />
                    <circle cx="162" cy="70" r="58" />
                  </svg>
                  <b className="sinaqui-num sinaqui-num-a">{res.a.camino.valor}</b>
                  <b className="sinaqui-num sinaqui-num-x">{res.comun}</b>
                  <b className="sinaqui-num sinaqui-num-b">{res.b.camino.valor}</b>
                </div>
                <span className="sinaqui-quien sinaqui-quien-a">{T.tu}</span>
                <span className="sinaqui-quien sinaqui-quien-b">{T.esaPersona}</span>
              </div>

              {/* «Lo que se activa entre los dos» es la frase con la que Iris
                  presenta este número en `/sinergia`. Se dice igual aquí: dos
                  nombres distintos para el mismo número es lo que hace que una
                  persona crea que son dos cosas. */}
              <h3 className="sinaqui-vinculo">
                Lo que se activa entre los dos es un {res.comun}: {res.nombreVinculo}.
              </h3>

              <ul className="sinaqui-lineas">
                {res.lineas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>

              {/*
                  LA FECHA VIAJA CON EL ENLACE.
                  Quien quiere la lectura entera acaba de escribir su fecha aquí.
                  Pedírsela otra vez en la página siguiente es la señal más clara
                  de que a nadie le importaba lo que acaba de hacer. `/sinergia`
                  lee d/m/a de la dirección y llega con la primera casilla puesta.
                  Va en la dirección y no en el almacenamiento del navegador
                  porque aquí no se guarda nada, y eso hay que cumplirlo.
              */}
              <Link
                className="sinaqui-entera"
                data-mag
                href={`/sinergia?d=${Number(hecho!.a.dia)}&m=${Number(hecho!.a.mes)}&a=${Number(hecho!.a.anio)}`}
              >
                {T.entera} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
