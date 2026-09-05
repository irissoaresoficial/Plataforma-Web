'use client';

/**
 * EL LANZAMIENTO DE LA COMUNIDAD
 *
 * La pieza fuerte de la portada: cuánto queda para que abra la membresía.
 *
 * QUÉ SUSTITUYE. Aquí había una foto de sala que no existe —salía el hueco rojo
 * de FOTO PENDIENTE, que es lo primero que veía cualquiera en el bloque que más
 * tiene que vender— y al lado un precio suelto. Un lanzamiento no se anuncia
 * con un hueco: se anuncia con una fecha.
 *
 * POR QUÉ LA CUENTA ATRÁS ESTÁ AQUÍ Y NO EN LA PORTADA. La urgencia sólo vale
 * cuando ya se ha entendido de qué va la cosa. Puesta arriba del todo es una
 * plantilla de infoproducto; puesta aquí, después de que la persona haya leído
 * lo que se repite en su vida y haya visto su propio número, es información:
 * «esto abre tal día, y quien está en la lista entra antes y por menos».
 *
 * LAS CIFRAS SON DE VERDAD. Salen de `MEMBRESIA.abreISO`, que es un dato de
 * `content/site.ts`. Si esa fecha se quita, la cuenta desaparece y el bloque se
 * enseña entero pero sin prisa. No hay ningún contador que se reinicie solo
 * cuando llega a cero para fingir que siempre queda poco: eso lo hace media
 * internet y se nota a la primera visita repetida.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CURVA } from './movimiento';

/** Una fecha que puede venir con hora o sin ella. */
const aMilis = (s: string) => new Date(s.includes('T') ? s : `${s}T00:00:00`).getTime();

type Resto = { dias: number; horas: number; mins: number; segs: number };

function restoDe(fin: number, ahora: number): Resto | null {
  const d = fin - ahora;
  if (d <= 0) return null;
  return {
    dias: Math.floor(d / 86_400_000),
    horas: Math.floor((d % 86_400_000) / 3_600_000),
    mins: Math.floor((d % 3_600_000) / 60_000),
    segs: Math.floor((d % 60_000) / 1000),
  };
}

export default function Lanzamiento({
  abreISO,
  desdeISO,
  /* Lo que se lee encima de las cifras. Decía «la lista se cierra en» y el pie,
     dos renglones más abajo, decía «abre el 7 de noviembre»: la misma fecha
     contada como dos sucesos contrarios en el mismo recuadro. Lo que pasa ese
     día es que la comunidad abre. */
  etiqueta = 'La comunidad abre en',
}: {
  abreISO?: string;
  desdeISO?: string;
  etiqueta?: string;
}) {
  /*
   * Empieza en null a propósito. El servidor no sabe qué hora es en el reloj de
   * quien mira, así que si pintara una cifra ahí y otra distinta aquí, React
   * tiraría el HTML del servidor entero. Con null se pinta el hueco y se rellena
   * en cuanto el navegador toma el mando.
   */
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    if (!abreISO) return;
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [abreISO]);

  if (!abreISO) return null;
  const fin = aMilis(abreISO);
  if (Number.isNaN(fin)) return null;

  const resto = ahora === null ? null : restoDe(fin, ahora);
  // Ya ha abierto: la cuenta no se reinicia ni se esconde a medias, se va.
  if (ahora !== null && resto === null) return null;

  const inicio = desdeISO ? aMilis(desdeISO) : fin - 60 * 86_400_000;
  const total = Math.max(1, fin - inicio);
  const queda = ahora === null ? 1 : Math.max(0, Math.min(1, (fin - ahora) / total));

  const dosCifras = (n: number) => String(n).padStart(2, '0');
  const casillas: [string, string][] = resto
    ? [
        [String(resto.dias), resto.dias === 1 ? 'día' : 'días'],
        [dosCifras(resto.horas), 'horas'],
        [dosCifras(resto.mins), 'min'],
        [dosCifras(resto.segs), 'seg'],
      ]
    : [
        ['––', 'días'],
        ['––', 'horas'],
        ['––', 'min'],
        ['––', 'seg'],
      ];

  /** La fecha escrita, para quien no quiere hacer la resta mental. */
  const enLetra = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(new Date(fin));

  return (
    <motion.div
      className="lanz"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.75, ease: CURVA }}
    >
      <span className="rotulo lanz-rotulo">{etiqueta}</span>

      <div className="lanz-cifras">
        {casillas.map(([v, l]) => (
          <div key={l} className="lanz-casilla">
            <strong>{v}</strong>
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* La barra es la misma cuenta dicha de otra forma: cuánto queda de la
          ventana entera, no cuánto queda de hoy. Se lee sin leer números. */}
      <div className="lanz-barra" aria-hidden>
        <span style={{ transform: `scaleX(${queda})` }} />
      </div>

      <p className="lanz-pie">
        Abre el <b>{enLetra}</b>. Hasta entonces la lista está abierta, y quien esté dentro entra el primero.
      </p>
    </motion.div>
  );
}
