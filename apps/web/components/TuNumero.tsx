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

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Reduccion from './Reduccion';
import { CURVA } from './movimiento';

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
          if (e.key === 'Enter' && puede) { setAcabado(false); setHecho({ d: +f.dia, m: +f.mes, a: +f.anio }); }
        }}
      />
    </label>
  );

  return (
    <div className="tn">
      <div className="tn-lado">
        <span className="rotulo">Pruébalo aquí mismo</span>
        <h2 className="tn-titulo">Tu fecha ya es un número. Míralo.</h2>
        <p className="tn-texto">
          Es la primera cuenta que hago con cualquiera que se sienta delante. Se pliega la fecha hasta que
          queda una sola cifra, y de ahí sale todo lo demás.
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
            onClick={() => { if (!puede) return; setAcabado(false); setHecho({ d: +f.dia, m: +f.mes, a: +f.anio }); }}
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

      <div className="tn-lado tn-resultado">
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
                    <Link href="/sinergia" className="pill pill-cream iman tn-siguiente" data-mag data-cur-label="Ver">
                      <span>Y qué dice de ti</span>
                      <span className="pill-arrow">→</span>
                    </Link>
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
              {/* El ejemplo enseña la forma que va a tener la respuesta, para
                  que el hueco no parezca un sitio roto mientras no hay nada. */}
              <span className="tn-ejemplo" aria-hidden>
                14 · 3 · 1981
              </span>
              <span className="tn-flecha" aria-hidden>
                ↓
              </span>
              <span className="tn-ejemplo tn-ejemplo-fin" aria-hidden>
                9
              </span>
              <p className="tn-espera-pie">Un ejemplo de cómo se pliega. Pon la tuya y sale la de verdad.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
