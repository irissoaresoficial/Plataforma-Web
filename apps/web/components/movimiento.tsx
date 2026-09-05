'use client';

/**
 * EL MOTOR DE MOVIMIENTO
 *
 * Todas las piezas que hacen que la web se sienta viva viven aquí, en un solo
 * sitio y con las mismas reglas. Antes cada bloque se animaba a su manera y el
 * resultado era el mismo problema que tuvimos con la tipografía: veinte cosas
 * parecidas, ninguna igual, y el ojo lo lee como descuido.
 *
 * LAS TRES REGLAS QUE NO SE SALTA NINGUNA
 *
 * 1. Sólo se anima `transform` y `opacity`. Son las dos cosas que la tarjeta
 *    gráfica hace sola. Animar un alto, un margen o un color obliga al
 *    navegador a recalcular la página en cada frame, y eso es exactamente lo
 *    que hundió esta web a 1 fps en su día.
 * 2. Nadie recorre el documento buscando elementos. Cada pieza mira su propio
 *    trozo con el observador de framer-motion, que está hecho para esto.
 * 3. Quien haya pedido menos movimiento en su sistema no ve ninguno. No es un
 *    detalle de cortesía: para algunas personas una página que se mueve mucho
 *    marea de verdad.
 *
 * LA CURVA. Todo entra con la misma: rápido al principio y frenando al final,
 * como algo que tiene peso. Una animación lineal se lee como una máquina.
 */

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useRef, type CSSProperties, type ReactNode } from 'react';

/** La curva de la casa. Sale de golpe y llega frenando. */
export const CURVA = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  PALABRAS                                                           */
/* ------------------------------------------------------------------ */

/**
 * Un titular que se escribe solo al llegar a él: las palabras aparecen una
 * detrás de otra, subiendo y quitándose el desenfoque.
 *
 * Se parte por palabras y no por letras a propósito. Por letras queda un
 * efecto de máquina de escribir que se ha visto mil veces y que además rompe
 * la lectura; por palabras se lee como alguien que va diciendo la frase.
 *
 * Cada palabra va en su `span` con el espacio pegado detrás, así el reparto de
 * renglones sigue siendo el del navegador y `text-wrap: balance` sigue
 * funcionando.
 */
export function Palabras({
  children,
  className,
  style,
  retraso = 0,
  paso = 0.055,
  as = 'span',
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
  /** Segundos antes de empezar. */
  retraso?: number;
  /** Segundos entre una palabra y la siguiente. */
  paso?: number;
  as?: 'span' | 'h1' | 'h2' | 'p';
}) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const dentro = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const Tag = motion[as];

  const palabras = children.split(' ');

  if (quieto) {
    return (
      <Tag ref={ref as never} className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref as never} className={className} style={style} aria-label={children}>
      {palabras.map((p, i) => (
        <span key={i} aria-hidden style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            initial={{ y: '0.9em', opacity: 0 }}
            animate={dentro ? { y: 0, opacity: 1 } : { y: '0.9em', opacity: 0 }}
            transition={{ duration: 0.72, ease: CURVA, delay: retraso + i * paso }}
          >
            {p}
          </motion.span>
          {i < palabras.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  ENTRA                                                              */
/* ------------------------------------------------------------------ */

/** Por dónde entra un bloque. Alternar la dirección evita que la página
 *  entera parezca la misma animación repetida cincuenta veces. */
const DESDE = {
  abajo: { y: 26, x: 0, scale: 1 },
  izq: { y: 0, x: -30, scale: 1 },
  der: { y: 0, x: 30, scale: 1 },
  crece: { y: 14, x: 0, scale: 0.972 },
  quieto: { y: 0, x: 0, scale: 1 },
} as const;

/**
 * Un bloque que entra al llegar a él. Es el caballo de batalla: casi todo lo
 * que no sea un titular usa esto.
 */
export function Entra({
  children,
  desde = 'abajo',
  retraso = 0,
  duracion = 0.78,
  className,
  style,
  as = 'div',
}: {
  children: ReactNode;
  desde?: keyof typeof DESDE;
  retraso?: number;
  duracion?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const dentro = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const Tag = motion[as];
  const p = DESDE[desde];

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
      initial={quieto ? false : { opacity: 0, ...p }}
      animate={dentro || quieto ? { opacity: 1, y: 0, x: 0, scale: 1 } : { opacity: 0, ...p }}
      transition={{ duration: duracion, ease: CURVA, delay: retraso }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  ESCALONADO                                                         */
/* ------------------------------------------------------------------ */

/**
 * Una lista cuyos hijos entran uno detrás de otro.
 *
 * Se hace con `staggerChildren` de framer-motion y no poniendo un retraso a
 * mano en cada hijo: así el escalonado no depende de que quien escriba la
 * lista se acuerde de ir sumando, que es como acaban descuadrados.
 */
export function Escalonado({
  children,
  paso = 0.09,
  retraso = 0,
  className,
  style,
}: {
  children: ReactNode;
  paso?: number;
  retraso?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const dentro = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={quieto ? false : 'fuera'}
      animate={dentro || quieto ? 'dentro' : 'fuera'}
      variants={{ dentro: { transition: { staggerChildren: paso, delayChildren: retraso } } }}
    >
      {children}
    </motion.div>
  );
}

/** Cada hijo de un `Escalonado`. No lleva tiempos: se los pone el padre. */
export function Hijo({
  children,
  desde = 'abajo',
  className,
  style,
}: {
  children: ReactNode;
  desde?: keyof typeof DESDE;
  className?: string;
  style?: CSSProperties;
}) {
  const p = DESDE[desde];
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        fuera: { opacity: 0, ...p },
        dentro: { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.72, ease: CURVA } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PARALAJE                                                           */
/* ------------------------------------------------------------------ */

/**
 * Un elemento que se mueve más despacio que la página al pasar por delante.
 *
 * `useScroll` con `target` mide sólo este elemento, no la página entera, y el
 * muelle le quita el paso a paso del ratón: sin él el movimiento va a saltos
 * de la misma altura que la rueda.
 */
export function Paralaje({
  children,
  cantidad = 60,
  className,
  style,
}: {
  children: ReactNode;
  /** Píxeles que se desplaza de un extremo a otro del recorrido. */
  cantidad?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const suave = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
  const y = useTransform(suave, [0, 1], [cantidad, -cantidad]);

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={quieto ? undefined : { y, willChange: 'transform' }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MARQUESINA                                                         */
/* ------------------------------------------------------------------ */

/**
 * La tira que pasa sin parar de lado a lado.
 *
 * El truco: se pinta el contenido DOS veces seguidas y se desplaza el conjunto
 * exactamente la mitad. Cuando llega al final, la segunda copia está justo
 * donde estaba la primera, así que volver a empezar no se ve. Sin la copia hay
 * un salto en cada vuelta.
 *
 * Va en CSS y no en JavaScript: una animación que no para nunca no debe
 * despertar al hilo principal sesenta veces por segundo para siempre.
 */
export function Marquesina({
  children,
  segundos = 34,
  alReves = false,
  className,
}: {
  children: ReactNode;
  segundos?: number;
  alReves?: boolean;
  className?: string;
}) {
  return (
    <div className={`marquesina ${className ?? ''}`} aria-hidden>
      <div
        className="marquesina-tira"
        style={{ animationDuration: `${segundos}s`, animationDirection: alReves ? 'reverse' : 'normal' }}
      >
        <div className="marquesina-copia">{children}</div>
        <div className="marquesina-copia">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  REVELADO                                                           */
/* ------------------------------------------------------------------ */

/**
 * Una imagen que se destapa de abajo arriba al llegar a ella, mientras lo que
 * hay dentro se encoge un poco: dos velocidades distintas en la misma pieza,
 * que es lo que hace que parezca profundidad y no una cortina.
 */
export function Revelado({
  children,
  className,
  style,
  retraso = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  retraso?: number;
}) {
  const quieto = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const dentro = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });

  if (quieto) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, overflow: 'hidden' }}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={dentro ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 1.05, ease: CURVA, delay: retraso }}
    >
      <motion.div
        style={{ height: '100%', willChange: 'transform' }}
        initial={{ scale: 1.16 }}
        animate={dentro ? { scale: 1 } : { scale: 1.16 }}
        transition={{ duration: 1.3, ease: CURVA, delay: retraso }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROGRESO                                                           */
/* ------------------------------------------------------------------ */

/**
 * Cuánto se ha recorrido de un bloque, de 0 a 1, ya suavizado. Lo usan las
 * secciones que se quedan ancladas mientras por dentro cambia algo.
 */
export function useProgreso(ref: React.RefObject<HTMLElement | null>, offset: ['start end', 'end start'] | ['start start', 'end end'] = ['start end', 'end start']): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, { stiffness: 110, damping: 30, restDelta: 0.001 });
}

/* ------------------------------------------------------------------ */
/*  COLUMNA FIJA                                                       */
/* ------------------------------------------------------------------ */

/**
 * Dos columnas: la de la izquierda se queda quieta mientras la de la derecha
 * pasa por delante.
 *
 * Es el otro recurso grande, y es distinto del bloque anclado. Allí se para
 * TODO y por dentro cambia una frase; aquí sólo se para el titular, y el
 * contenido sigue pasando de verdad. Sirve para lo que es una lista real —los
 * tres pasos del método— donde importa poder comparar unos con otros.
 *
 * Igual que el bloque anclado, por debajo de 900 px no se pega nada: en un
 * teléfono no hay dos columnas que valgan, y lo pegado se pelea con la barra
 * del navegador.
 *
 * Para que esto funcione, ningún antepasado puede llevar `overflow` distinto
 * de `visible` en el eje vertical. `overflow-x: hidden` lo cambia sin decirlo;
 * por eso en toda la web se usa `overflow-x: clip`.
 */
export function ColumnaFija({
  fijo,
  children,
  className,
}: {
  /** Lo que se queda quieto: normalmente el rótulo y el titular. */
  fijo: ReactNode;
  /** Lo que pasa por delante. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`col-fija ${className ?? ''}`}>
      <div className="col-fija-quieta">{fijo}</div>
      <div className="col-fija-pasa">{children}</div>
    </div>
  );
}
