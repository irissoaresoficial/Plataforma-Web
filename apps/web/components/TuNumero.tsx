'use client';

/**
 * TU NÚMERO
 *
 * El visitante escribe su fecha de nacimiento y ve cómo se pliega hasta su
 * cifra, delante de él, sin registrarse ni dejar el correo.
 *
 * POR QUÉ ESTO Y NO OTRO FORMULARIO. La web pide el dato en cinco sitios y en
 * los cinco pide antes de dar. Aquí se da primero: la cuenta es de verdad, es
 * la misma que hace Iris, y quien la ve entiende en diez segundos de qué va
 * esto mucho mejor que leyendo tres párrafos. El que quiera saber qué
 * significa su número ya sabe dónde seguir, y llega queriendo.
 *
 * LO QUE ESTA PIEZA NO HACE. No dice qué significa el número. Eso es el
 * trabajo de Iris y sale de sus manuales; inventarme aquí una frase de
 * horóscopo sería exactamente lo que hace que una web así deje de creerse.
 * La cuenta es aritmética y es mía; el significado es suyo y está detrás.
 *
 * Y no guarda nada. La fecha no sale del navegador: no se manda a ningún
 * sitio, no se apunta en ninguna parte. Por eso se puede pedir sin casilla de
 * consentimiento y sin letra pequeña, y por eso lo dice en voz alta debajo.
 */

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Reduccion from './Reduccion';
import { CURVA } from './movimiento';
import { pasosCaminoDeVida } from '@/lib/numerologia';

type Fecha = { dia: string; mes: string; anio: string };

/** Qué le falta o qué está mal, en cristiano. Vacío = se puede calcular. */
function queFalta({ dia, mes, anio }: Fecha): string | null {
  if (!dia || !mes || !anio) return null; // todavía escribiendo: no se regaña
  const d = Number(dia);
  const m = Number(mes);
  const a = Number(anio);
  if (d < 1 || d > 31) return 'El día va del 1 al 31.';
  if (m < 1 || m > 12) return 'El mes va del 1 al 12.';
  if (a < 1900 || a > new Date().getFullYear()) return 'El año, con sus cuatro cifras.';
  // 31 de febrero y compañía: el propio calendario lo dice mejor que una tabla.
  const f = new Date(a, m - 1, d);
  if (f.getDate() !== d || f.getMonth() !== m - 1) return 'Ese día no existe en ese mes.';
  return null;
}

export default function TuNumero() {
  const [f, setF] = useState<Fecha>({ dia: '', mes: '', anio: '' });
  const [hecho, setHecho] = useState<{ d: number; m: number; a: number } | null>(null);
  const [acabado, setAcabado] = useState(false);

  const error = queFalta(f);
  const completa = Boolean(f.dia && f.mes && f.anio);
  const puede = completa && !error;

  /*
   * AL PULSAR, LA VISTA VA AL RESULTADO.
   *
   * En el móvil las dos columnas se apilan, así que el resultado cae DEBAJO del
   * botón y fuera de la pantalla. Pulsabas «ver mi número» y no pasaba nada
   * visible; peor todavía, la animación de la cuenta sólo arranca cuando el
   * bloque entra en pantalla, así que tampoco había empezado. Desde fuera es un
   * botón roto, y justo en el sitio donde la web da lo único que da gratis.
   *
   * En el escritorio el resultado ya está al lado, a la vista, así que llevar la
   * vista allí no mueve nada: `scrollIntoView` con `nearest` no hace nada si ya
   * se ve entero. Una sola línea vale para los dos casos.
   */
  const resultado = useRef<HTMLDivElement>(null);

  const calcular = () => {
    if (!puede) return;
    setAcabado(false);
    setHecho({ d: +f.dia, m: +f.mes, a: +f.anio });
    requestAnimationFrame(() =>
      resultado.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
  };

  const campo = (k: keyof Fecha, etiqueta: string, largo: number, ph: string) => (
    <label className="tn-campo">
      <span className="rotulo-dato">{etiqueta}</span>
      <input
        className="tn-input"
        inputMode="numeric"
        autoComplete="off"
        maxLength={largo}
        placeholder={ph}
        value={f[k]}
        onChange={(e) => {
          // Sólo cifras: pegar una fecha con barras no debe romper la cuenta.
          const v = e.target.value.replace(/\D/g, '').slice(0, largo);
          setF((s) => ({ ...s, [k]: v }));
          setHecho(null);
          setAcabado(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') calcular();
        }}
      />
    </label>
  );

  return (
    <div className="tn">
      <div className="tn-lado">
        <span className="rotulo">Empieza por aquí · gratis</span>
        {/*
            EL TITULAR PROMETE LO QUE HACE EL FORMULARIO QUE TIENE DEBAJO.

            Decía «¿tienes buena sinergia con esa persona con la que siempre
            acabas igual?» y justo debajo pedía TU día, TU mes y TU año. Quien
            llega pulsando «ver mi número» se encuentra una pregunta sobre otra
            persona y tres casillas que no le pegan: en ese medio segundo de
            desajuste se pierde a la gente.

            La pregunta de la sinergia no se tira, se mueve: aparece al terminar
            la cuenta, cuando ya te has llevado tu número y la pregunta llega
            con algo detrás. Ahí sí abre el embudo; aquí sólo confundía.
        */}
        <h2 className="tn-titulo">
          ¿Y a ti <em>qué número te tocó</em>?
        </h2>
        <p className="tn-texto">
          Pon tu fecha de nacimiento y lo ves ahora mismo. Es la <strong>misma cuenta</strong> que hago yo con
          cualquiera que se sienta delante, hecha delante de ti.
        </p>

        <div className="tn-fila">
          {campo('dia', 'Día', 2, '14')}
          {campo('mes', 'Mes', 2, '3')}
          {campo('anio', 'Año', 4, '1981')}
        </div>

        <div className="tn-acciones">
          <button
            className="pill pill-cream iman"
            data-mag
            data-cur-label="Ver"
            disabled={!puede}
            onClick={calcular}
          >
            <span>Ver mi número</span>
            <span className="pill-arrow">→</span>
          </button>
          {error && <span className="tn-error">{error}</span>}
        </div>

        <p className="tn-nota">
          La fecha no sale de tu navegador. No se guarda, no se manda a ningún sitio y no hace falta que
          dejes nada.
        </p>
      </div>

      <div className="tn-lado tn-resultado" ref={resultado}>
        <AnimatePresence mode="wait">
          {hecho ? (
            <motion.div
              key={`${hecho.d}-${hecho.m}-${hecho.a}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: CURVA }}
              style={{ width: '100%' }}
            >
              <Reduccion dia={hecho.d} mes={hecho.m} anio={hecho.a} alAcabar={() => setAcabado(true)} />
              {/* Aparece cuando la cuenta ha terminado, no antes: salir a mitad
                  empuja el bloque hacia abajo justo mientras se está mirando. */}
              <AnimatePresence>
                {acabado && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: CURVA, delay: 0.35 }}
                  >
                    {/* AQUÍ EMPIEZA EL EMBUDO, y por eso el botón dice lo que
                        se lleva en vez de «y qué dice de ti», que no promete
                        nada. El número de esta caja es el aperitivo: se ve sin
                        dejar un dato. El estudio de los dos —el suyo, el de esa
                        persona, lo que se activa entre ambos y el informe— está
                        en la otra página, y es lo que se cambia por el correo. */}
                    <div className="tn-siguiente">
                      <p className="tn-regalo">
                        Ese número solo es la mitad. Pon el de <strong>esa persona</strong> al lado y sale lo que se
                        activa entre los dos, lo que se repite y <strong>un informe para descargar</strong>.
                      </p>
                      <Link href="/sinergia" className="pill pill-cream iman" data-mag data-cur-label="Ver">
                        <span>Ver mi sinergia con esa persona</span>
                        <span className="pill-arrow">→</span>
                      </Link>
                      <span className="tn-regalo-nota">Gratis, sale al momento.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="espera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="tn-espera"
            >
              {/*
                  EL EJEMPLO ENSEÑA LA CUENTA, NO SÓLO EL FINAL.

                  Antes ponía «14 · 3 · 1981 ↓ 9» y ya. Visto así parece que el
                  número sale de la nada, o peor: de una app. Y la primera
                  pregunta de cualquiera —«¿de dónde sacas eso?»— se quedaba sin
                  responder justo en el sitio donde se decide si esto es serio.

                  Los pasos los da el motor de la casa, no están escritos a mano
                  aquí: si algún día cambia la cuenta, cambia también el ejemplo.
              */}
              <div className="tn-pasos" aria-hidden>
                {pasosCaminoDeVida(14, 3, 1981).map((p, i, todos) => (
                  <span key={i} className={i === todos.length - 1 ? 'tn-paso tn-paso-fin' : 'tn-paso'}>
                    {p}
                  </span>
                ))}
              </div>
              <p className="tn-espera-pie">
                Así se pliega una fecha: se reducen <strong>el día, el mes y el año por separado</strong> y luego se
                suman. Pon la tuya y sale la de verdad.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
