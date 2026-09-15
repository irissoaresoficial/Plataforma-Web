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

import LeadForm from './LeadForm';
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
  /** El titular del bloque que pide el correo, debajo del resultado. */
  correoH: string;
  /** Lo que dice el botón de ese bloque. */
  correoCta: string;
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

/**
 * EL CORREO QUE SE LLEVA ESA PERSONA.
 *
 * Y POR QUÉ NO SE REUTILIZA `correoSinergia()`, QUE YA EXISTE. Esa función es la
 * de `/sinergia` y escribe con los nombres: «Iris, tu camino es un 3», «lo que
 * te pasa con tu madre». Aquí no hay nombres —este bloque pide dos fechas y
 * nada más, que es justo lo que lo hace usable— así que ese texto saldría con
 * huecos («Hola ,») y hablando de repeticiones que, con los nombres vacíos, son
 * basura. Está avisado en la cabecera de este archivo.
 *
 * Así que se escribe lo que SÍ sale de dos fechas, que es exactamente lo que la
 * persona acaba de ver en pantalla: su número, el de la otra, el del vínculo y
 * las tres líneas. Ni una frase inventada: las líneas salen de `VINCULOS` tal
 * cual, porque son lecturas que vende una profesional.
 *
 * SIN ESTO NO LLEGA NADA, y ese es el motivo de que exista. El Apps Script
 * manda el resultado leyendo `parrafos`; si no vienen, cae a un texto de
 * reserva que no es la lectura. Una pantalla que promete un correo y manda otra
 * cosa gasta la única oportunidad que había con esa persona.
 *
 * El último párrafo no es firma ni relleno: es lo único que esta pantalla no
 * puede dar. Con los dos nombres salen cuatro cosas más, y decirlo aquí es lo
 * que convierte un correo que se lee una vez en una segunda visita.
 */
function correoDeLaPortada(r: {
  a: { camino: { valor: number } };
  b: { camino: { valor: number } };
  comun: number;
  nombreVinculo: string;
  lineas: string[];
}): { asunto: string; parrafos: string[] } {
  return {
    asunto: `Lo vuestro es un ${r.comun}: ${r.nombreVinculo}`,
    parrafos: [
      'Aquí tienes por escrito lo que te ha salido, para que puedas volver a leerlo con calma.',
      `Tu camino es un ${r.a.camino.valor}. El de esa persona, un ${r.b.camino.valor}. Lo que se activa entre los dos es un ${r.comun}: ${r.nombreVinculo}.`,
      ...r.lineas,
      'Esto sale sólo de las dos fechas. Con los dos nombres completos salen cuatro cosas más: lo que cada uno vino a hacer, lo que se hereda, lo que se viene repitiendo y en qué se os nota a los dos. Eso te lo calculo en escueladesabiduria33.com/sinergia.',
    ],
  };
}

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
    /* «Te mando la lectura ENTERA de los dos» era mentira y no por poco: la
       entera lleva los dos nombres y sale en `/sinergia`, con cuatro cosas más
       que desde aquí no se pueden calcular. Prometer de más en el sitio exacto
       donde alguien te deja su correo es la forma más cara de quedar mal: ese
       correo llega, no trae lo prometido, y esa persona ya no abre el segundo.
       Lo que va ahora dice lo que hay y da un motivo para quererlo. */
    correoH: 'Te lo mando por escrito, que esto no se entiende de una sola lectura.',
    correoCta: 'Mándamela al correo',
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
        {/*
            LOS DOS CÍRCULOS ESTÁN DESDE EL PRIMER MOMENTO.
            ------------------------------------------------------------------
            Antes aparecían con el resultado y hasta entonces el bloque era un
            titular y seis casillas: un formulario. Puestos arriba y vacíos, el
            bloque YA ES algo antes de que nadie escriba nada — se ve qué va a
            pasar, y esa es la mitad del motivo para rellenarlo.

            Y al calcular no aparece un dibujo nuevo: se LLENA el que ya estaba.
            Vacíos no llevan ningún número, que en una web que vende lecturas de
            verdad no es un detalle.

            Va como `role="img"` con la frase entera: leído en voz alta, «siete
            tres nueve tú esa persona» no significa nada.
        */}
        <div
          className={`sinaqui-venn${res ? ' sinaqui-venn-lleno' : ''}`}
          role={res ? 'img' : undefined}
          aria-hidden={res ? undefined : true}
          aria-label={
            res ? `${T.tu}, ${res.a.camino.valor}. ${T.esaPersona}, ${res.b.camino.valor}. Entre los dos, ${res.comun}.` : undefined
          }
        >
          <div className="sinaqui-dibujo">
            <svg viewBox="0 0 260 140" focusable="false" aria-hidden>
              <circle cx="98" cy="70" r="58" />
              <circle cx="162" cy="70" r="58" />
            </svg>
            {res && (
              <>
                <b className="sinaqui-num sinaqui-num-a">{res.a.camino.valor}</b>
                <b className="sinaqui-num sinaqui-num-x">{res.comun}</b>
                <b className="sinaqui-num sinaqui-num-b">{res.b.camino.valor}</b>
              </>
            )}
          </div>
          {res && (
            <>
              <span className="sinaqui-quien sinaqui-quien-a">{T.tu}</span>
              <span className="sinaqui-quien sinaqui-quien-b">{T.esaPersona}</span>
            </>
          )}
        </div>

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
                  LA LECTURA ENTERA SE MANDA POR CORREO, AQUÍ MISMO.

                  Aquí había un enlace a `/sinergia` que llevaba la primera fecha
                  en la dirección. Y aun así, al llegar, había que volver a
                  escribir la otra fecha, el nombre y el correo. Gerson: «si le
                  doy clic me manda a rellenar otra vez los datos».

                  El coste es doble. Para quien lee, es empezar de cero justo
                  después de haber terminado algo. Y para el negocio es peor:
                  esa persona acaba de dar DOS FECHAS DE NACIMIENTO —el dato más
                  difícil de conseguir que hay— y se iba sin dejar un correo. El
                  trabajo estaba hecho y no se recogía.

                  Una casilla y un botón. Y con el aviso viajan las dos fechas y
                  el número del vínculo, así que lo que le llega a Iris no es un
                  correo suelto: es un correo con la pareja de fechas ya
                  calculada. Eso es una conversación que empieza sabiendo algo.
              */}
              <div className="sinaqui-correo">
                <p className="sinaqui-correo-h">{T.correoH}</p>
                {/* AQUÍ PONÍA `origen="sinergia-portada"` Y ESO NO EXISTE.
                    El servidor sólo acepta tres orígenes y rechaza el resto con
                    un 400, así que este formulario no guardó nunca nada: quien
                    dejaba su correo veía en rojo «no he podido guardarlo»
                    después de haber escrito DOS fechas de nacimiento. Justo lo
                    que este bloque existía para evitar.
                    Y meter «sinergia-portada» en la lista de orígenes habría
                    sido peor: el Apps Script pregunta por `=== 'sinergia'` para
                    arrancar la secuencia y para mandar el resultado, así que el
                    correo habría entrado sin fallar y sin recibir nada nunca.
                    De dónde vino se cuenta en `detalle`, que es texto libre.
                    Está explicado entero junto a `LEAD_SOURCES`. */}
                <LeadForm
                  origen="sinergia"
                  detalle={`Portada · ${iso(hecho!.a)} + ${iso(hecho!.b)} · vínculo ${res.comun} (${res.nombreVinculo})`}
                  {...correoDeLaPortada(res)}
                  cta={T.correoCta}
                  pedirNombre={false}
                  variant="dark"
                  successTitle="Hecho. Te llega en un momento."
                  successText="Los dos números, el del vínculo y lo que se activa entre los dos."
                  privacidad="Sólo lo uso para mandarte esto."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
