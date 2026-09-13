'use client';

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

/*
 * ============================================================================
 * APARECE — LO QUE SE MUEVE AL BAJAR, EN TODA LA WEB MENOS LA PORTADA
 * ============================================================================
 *
 * Gerson lo pidió con estas palabras: «toda la web debe de tener animation
 * scrolling». Lo que había era `Reveal`: un fundido de setecientas milésimas
 * que se dispara cuando el bloque asoma y ya no depende de nada más. Eso no es
 * movimiento de scroll — es una animación que CASUALMENTE empieza al bajar. Si
 * paras la rueda, la animación sigue sola hasta el final; si bajas de golpe,
 * te la pierdes entera y llegas a un bloque que se está terminando de pintar.
 *
 * Aquí el movimiento va ATADO a la rueda. Cuánto se ha entrado el bloque en la
 * ventana es un número de 0 a 1, ese número se escribe en `--p` y el CSS lo usa
 * para la opacidad y el desplazamiento. Bajas y entra; paras y se para en seco,
 * a media entrada, donde lo hayas dejado. Es la diferencia entre una animación y
 * un mecanismo.
 *
 * Lo único que no hace es deshacerse: al subir, lo que ya ha entrado se queda.
 * El porqué está escrito abajo, en `escribe`, y es de las cosas que sólo se ven
 * mirándolo en el navegador.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ UN BUCLE Y NO `scroll-timeline` NI EL EVENTO DE SCROLL
 * ---------------------------------------------------------------------------
 * Se probaron los dos antes de acabar aquí.
 *
 *   · `animation-timeline: view()` es exactamente esto hecho por el navegador y
 *     sin JavaScript, y es lo que habrá que usar el día que se pueda. Hoy no
 *     está en Safari, y media audiencia de Iris entra desde un iPhone. Un
 *     efecto que la mitad de la gente no ve no es un efecto, es una apuesta.
 *   · El evento `scroll` va por detrás del dibujado en el móvil: el navegador
 *     te da el evento cuando ya ha pintado el frame, así que el bloque llega
 *     siempre medio frame tarde y se nota como un arrastre. Con
 *     `requestAnimationFrame` se mide justo antes de pintar y va pegado.
 *
 * ---------------------------------------------------------------------------
 * LAS CUATRO REGLAS DE LAS QUE NO SE SALE
 * ---------------------------------------------------------------------------
 * 1. NI UN `useState` DENTRO DEL BUCLE. Se escribe en el DOM con
 *    `setProperty`. Con estado serían sesenta re-renders por segundo POR CADA
 *    bloque de la página; con quince bloques a la vista eso es lo que hunde un
 *    teléfono a tirones. Y no hace falta: React no tiene que enterarse de que
 *    una opacidad ha cambiado.
 * 2. AL BUCLE SÓLO SE APUNTA LO QUE ESTÁ CERCA. Lo apunta y lo desapunta un
 *    `IntersectionObserver`. Sin eso, una página de treinta bloques mediría
 *    treinta cosas por frame, veinticinco de ellas a tres pantallas de
 *    distancia. Y el bucle es UNO para toda la página, no uno por bloque: mide
 *    todo primero y escribe todo después, que es la regla de la casa.
 * 3. SÓLO `opacity` Y `transform`. Las dos que la tarjeta gráfica hace sola.
 *    Cualquier otra cosa obliga a recalcular la maquetación en cada frame.
 * 4. NADA SE QUEDA INVISIBLE. Ver más abajo, que es lo importante de todo esto.
 *
 * ---------------------------------------------------------------------------
 * NADA SE QUEDA INVISIBLE — EL FALLO TÍPICO DE ESTE PATRÓN
 * ---------------------------------------------------------------------------
 * El accidente clásico de un revelado al scroll es dejar contenido a opacidad
 * cero para siempre: sin JavaScript, con un observador que no dispara, o —el
 * más traicionero— con el último bloque de la página, que nunca llega a subir
 * lo suficiente porque la página se ha acabado y ya no se puede bajar más. Eso
 * no es un efecto que falla: es contenido que no existe para quien entra.
 *
 * Cinco cierres, y hacen falta los cinco:
 *
 *   a) EL CSS PARTE DE VISIBLE. `.aparece` a secas no toca ni la opacidad ni la
 *      posición. El movimiento vive en `.aparece-on`, y esa clase la pone este
 *      componente al montarse. Sin JavaScript, o si esto revienta antes de
 *      montarse, la página se lee entera y quieta.
 *   b) `--p` NACE EN 1. Declarada con `@property` y valor inicial 1, así que si
 *      la clase estuviera puesta pero nadie escribiera el número, el bloque
 *      sale entero en vez de desaparecer.
 *   c) EL FONDO DE LA PÁGINA MANDA. El recorrido se recorta por lo que queda
 *      por bajar: cuando ya no se puede bajar más, `--p` vale 1 sí o sí. Eso es
 *      lo que salva al pie y a lo último de cada página.
 *   d) LO QUE SE VE AL CARGAR NO ENTRA. Lo que ya está en la primera pantalla se
 *      da por entrado y se queda puesto, así que la pantalla de entrada no se
 *      puede quedar a medias esperando un scroll que quizá no llegue.
 *   e) SALIR POR ARRIBA ES ENTRAR DEL TODO. Un salto de ancla o un dedo que tira
 *      fuerte pueden saltarse un bloque sin que el bucle lo mida ni una vez; el
 *      observador lo deja puesto al verlo pasar de largo.
 *
 * ---------------------------------------------------------------------------
 * Y QUIEN HA PEDIDO MENOS MOVIMIENTO NO VE NINGUNO
 * ---------------------------------------------------------------------------
 * Con `prefers-reduced-motion` no se pone la clase, no se abre el observador y
 * no hay bucle: todo puesto desde el primer fotograma y ni un frame de trabajo.
 * No es cortesía — a bastante gente una página que se mueve entera la marea de
 * verdad.
 */

/** Las etiquetas que se pueden pedir. Lista cerrada a propósito: `as` abierto a
 *  cualquier cadena acaba con un `<Aparece as="button">` dentro de un `<p>`. */
const ETIQUETAS = ['div', 'section', 'article', 'ul', 'li', 'span', 'p', 'h1', 'h2', 'h3'] as const;
type Etiqueta = (typeof ETIQUETAS)[number];

export type ModoAparece = 'sube' | 'lado' | 'escala' | 'letras';

/*
 * EL ESCALÓN, EN PÍXELES DE RUEDA Y NO EN MILISEGUNDOS.
 *
 * `Reveal` retrasaba en milésimas, y aquí eso no significa nada: no hay
 * duración que retrasar, hay un recorrido. Un escalón es lo que el bloque
 * siguiente tarda de más en terminar de entrar, medido en lo que se ha bajado.
 *
 * 46 px es lo que salió de probarlo: por debajo de treinta la cascada no se
 * distingue de que entren todos a la vez, y por encima de sesenta la última
 * ficha de una rejilla de cinco va tan retrasada que se lee como que va lenta.
 */
const ESCALON = 46;

/*
 * Y EL ESCALÓN SE RECORTA A OCHO.
 *
 * No por gusto: `Reveal` recibía milisegundos —`delay={280}`— y este componente
 * recibe escalones. Un 280 que se cuele de una traducción a medias serían trece
 * mil píxeles de retraso, o sea un bloque que no aparece nunca y que además no
 * da error en ningún sitio. Recortando, lo peor que pasa es que el escalonado
 * de un bloque quede plano.
 */
const ESCALON_MAX = 8;

/* En el servidor no hay maquetación que medir y `useLayoutEffect` avisa por
   consola. Se usa el de siempre allí, que además nunca llega a correr. */
const useEfectoDePintado = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* ------------------------------------------------------------------------ */
/*  EL BUCLE, QUE ES UNO SOLO PARA TODA LA PÁGINA                            */
/* ------------------------------------------------------------------------ */

/**
 * Un bloque apuntado al bucle. `ultimo` es lo último que se le escribió, y
 * sirve para dos cosas: no volver a escribir lo mismo, y que el número no baje
 * nunca.
 */
type Pieza = { el: HTMLElement; desfase: number; ultimo: number };

/*
 * UN SOLO `requestAnimationFrame` PARA TODOS LOS BLOQUES, Y NO UNO CADA UNO.
 *
 * La primera versión abría un bucle por componente. Funciona, pero hace justo
 * lo que la casa tiene escrito que no se hace (ver `useSiteScroll`): mezcla
 * lecturas y escrituras. Bloque A mide, bloque A escribe, bloque B mide —y esa
 * segunda medida obliga al navegador a recalcular los estilos que acaba de
 * ensuciar la escritura de A—, bloque B escribe, y así con los diez bloques que
 * puede haber cerca a la vez.
 *
 * Con un bucle único se hacen las dos vueltas separadas: primero se mide todo,
 * después se escribe todo. Una recalculada por frame en vez de diez. Y de paso
 * hay UNA petición de frame en toda la página en vez de diez.
 *
 * El conjunto se recorre dos veces y el orden importa: un `Set` de JavaScript
 * conserva el orden de entrada, así que la lectura número tres y la escritura
 * número tres son del mismo bloque.
 */
const vivos = new Set<Pieza>();
let latido = 0;

/** Cuánto ha entrado un bloque, de 0 a 1. Sólo LEE: no toca el DOM. */
function progreso(pz: Pieza, vh: number, restante: number): number {
  const r = pz.el.getBoundingClientRect();

  /*
   * CUÁNTO SE BAJA MIENTRAS EL BLOQUE ENTRA. Esto es «la duración», sólo que
   * medida en rueda y no en segundos, y es lo único que hay que tocar si algún
   * día se quiere el efecto más lento o más rápido.
   *
   * Sale de lo que mide el bloque más un pellizco, entre dos topes. Los tres
   * números salieron de mirarlo en el navegador:
   *
   *   · El +140 y el suelo de 180 px, porque la primera versión usaba el alto
   *     pelado y un titular de 106 px de alto entraba y salía en 106 px de
   *     scroll. Contado: nueve palabras encendiéndose en tres golpes de rueda.
   *     No da tiempo a leerlo, que es justo lo que este efecto viene a hacer.
   *   · El techo de media ventana larga, porque si no un bloque de tres
   *     pantallas de alto no terminaría de aparecer hasta que ya se ha ido.
   */
  const tramo = Math.max(180, Math.min(r.height + 140, vh * 0.45));

  /*
   * La línea de disparo está al 92 % de la ventana: un pelo por encima del
   * borde de abajo, para que el bloque no empiece a moverse cuando todavía está
   * tapado por la barra del navegador del móvil.
   *
   * `falta` es lo que queda por bajar para que este bloque termine de entrar. Y
   * AQUÍ ESTÁ EL CIERRE QUE SALVA AL PIE: si lo que falta es más de lo que queda
   * de página, se recorta a lo que queda. Cuando ya no se puede bajar más, falta
   * 0 y el bloque está entero. Sin esto, lo último de cada página se queda a
   * media opacidad para siempre, que es exactamente el fallo que este patrón
   * comete en media internet.
   */
  let falta = r.top - vh * 0.92 + tramo + pz.desfase;
  if (falta > restante) falta = restante;

  return falta <= 0 ? 1 : falta >= tramo ? 0 : 1 - falta / tramo;
}

/**
 * Escribe el número en el bloque, con las dos reglas de siempre.
 *
 * SÓLO HACIA ADELANTE, Y ESTO SE APRENDIÓ MIRÁNDOLO EN EL NAVEGADOR. La primera
 * versión dejaba el número subir y bajar con la rueda, que es lo bonito sobre el
 * papel: subes y el bloque se recoge. En pantalla es un desastre. Al subir, todo
 * lo que vuelve a caer por debajo de la línea de disparo se apaga —y con el
 * escalonado, un bloque retrasado se apaga cuando todavía le queda un tercio de
 * pantalla por encima—. O sea: subes a releer un párrafo y el párrafo se borra
 * mientras lo miras. Medido: ocho bloques de /numerologia a opacidad cero
 * estando a la vista. Así que lo que ha entrado se queda dentro. Sigue atado a
 * la rueda —bajas y entra, paras y para— pero no se deshace. De paso arregla el
 * móvil, donde la barra del navegador aparece y desaparece al cambiar de sentido
 * y mueve la ventana cien píxeles sin que nadie haya bajado nada.
 *
 * Y DOS DECIMALES: la diferencia entre 0,412 y 0,413 no se ve, y escribir en el
 * estilo obliga al navegador a recalcularlo aunque el valor sea el mismo.
 */
function escribe(pz: Pieza, p: number) {
  const v = Math.round(p * 100) / 100;
  if (v > pz.ultimo) {
    pz.ultimo = v;
    pz.el.style.setProperty('--p', String(v));
  }
}

function tic() {
  const vh = window.innerHeight || 1;
  const doc = document.documentElement;
  const restante = Math.max(0, doc.scrollHeight - vh - (window.scrollY || doc.scrollTop || 0));

  /* --- primera vuelta: sólo se mide --- */
  const medidas: number[] = [];
  for (const pz of vivos) medidas.push(progreso(pz, vh, restante));

  /* --- segunda vuelta: ya no se vuelve a medir nada --- */
  let i = 0;
  for (const pz of vivos) escribe(pz, medidas[i++]);

  latido = vivos.size ? requestAnimationFrame(tic) : 0;
}

function enciende(pz: Pieza) {
  vivos.add(pz);
  if (!latido) latido = requestAnimationFrame(tic);
}

function apaga(pz: Pieza) {
  vivos.delete(pz);
  if (!vivos.size && latido) {
    cancelAnimationFrame(latido);
    latido = 0;
  }
}

/*
 * EL MARGEN DEL OBSERVADOR: UNA PANTALLA ENTERA POR ARRIBA Y POR ABAJO.
 *
 * Empezó en el 25 % —unos 220 px— y se subió por precaución, no por una medida.
 * Conviene dejar dicho lo que se creyó y no era, porque costó una tarde: parecía
 * que el observador tardaba 400 ms en avisar, y era mentira. Lo que pasaba es
 * que esta web lleva `scroll-behavior: smooth`, así que un salto de scroll de
 * prueba no salta: baja despacio, y lo que se estaba cronometrando era el viaje,
 * no el aviso. Medido bien, el observador avisa en cuanto el bloque cruza el
 * margen.
 *
 * Aun así el margen se queda en una pantalla. Un dedo puede recorrer dos mil
 * píxeles en un suspiro, y con 220 px de aviso el bloque ya lleva media pantalla
 * a la vista cuando el bucle arranca: se le ve aparecer de golpe, tarde y sin
 * recorrido. Con una pantalla entera hay margen de sobra para cualquier gesto.
 *
 * Lo que cuesta: tener en el bucle los bloques de unas tres pantallas en vez de
 * una y media. Contado en el navegador, siete a la vez en la página más larga —
 * siete medidas por frame en un bucle que ya está corriendo. Nada.
 */
const MARGEN = '100% 0px 100% 0px';

export default function Aparece({
  children,
  modo = 'sube',
  retraso = 0,
  as = 'div',
  className,
  style,
  id,
  ariaLabel,
}: {
  children?: ReactNode;
  /** `sube` (28 px desde abajo), `lado` (36 px desde la izquierda), `escala`
   *  (de 0,94 a 1) o `letras` (palabra a palabra; el hijo ha de ser texto). */
  modo?: ModoAparece;
  /** Escalones de retraso dentro de un mismo bloque: 0, 1, 2… Ver `ESCALON`. */
  retraso?: number;
  as?: Etiqueta;
  className?: string;
  style?: CSSProperties;
  id?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const palabras = modo === 'letras' && typeof children === 'string' ? children.split(/\s+/).filter(Boolean) : null;

  /*
   * Va en el efecto de pintado y no en el normal para que no se vea el salto.
   * El efecto normal corre DESPUÉS de que el navegador haya pintado, así que
   * habría un fotograma con el bloque puesto y el siguiente con el bloque
   * recogido: un parpadeo justo en lo que asoma por el borde de abajo.
   */
  useEfectoDePintado(() => {
    const el = ref.current;
    if (!el) return;

    /* Menos movimiento: ni clase, ni observador, ni bucle. Se sale antes de
       tocar nada, así que el bloque se queda exactamente como lo pintó el
       servidor. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    /*
     * LO QUE YA ESTÁ EN PANTALLA AL CARGAR NO ENTRA: YA HA ENTRADO.
     *
     * Esto se descubrió montándolo, y es el fallo que se lleva por delante una
     * primera pantalla entera. Un revelado atado al scroll dice, por
     * definición, que lo que está por debajo de la línea de disparo todavía no
     * ha aparecido — y en la pantalla de entrada eso es el botón, el
     * formulario y media promesa, que se quedan recogidos hasta que la persona
     * baje. O sea: se le esconde la llamada a la acción a quien acaba de
     * llegar, que es lo contrario de lo que se pedía.
     *
     * Se probó bajando el escalonado y no vale: el problema no es cuánto
     * retraso hay, es que en el primer fotograma no se ha bajado nada y no hay
     * recorrido del que tirar.
     *
     * Así que lo que ya se ve al cargar se da por entrado y se queda quieto y
     * puesto. Y no se pierde nada: la primera pantalla ya tiene su entrada, que
     * es la cortina abriéndose por encima. El movimiento al bajar es para lo
     * que está por debajo del pliegue, que es lo que se descubre bajando.
     */
    if (el.getBoundingClientRect().top < (window.innerHeight || 0)) {
      el.style.setProperty('--p', '1');
      el.classList.add('aparece-on');
      return;
    }

    const pieza: Pieza = {
      el,
      desfase: Math.min(Math.max(retraso, 0), ESCALON_MAX) * ESCALON,
      ultimo: -1,
    };

    /* La primera medida se hace a mano y ANTES de encender el efecto. Al revés
       habría un fotograma con la clase puesta y `--p` todavía sin escribir, o
       sea un parpadeo justo en lo que asoma por el borde de abajo. */
    const vh = window.innerHeight || 1;
    const doc = document.documentElement;
    escribe(pieza, progreso(pieza, vh, Math.max(0, doc.scrollHeight - vh - (window.scrollY || doc.scrollTop || 0))));
    el.classList.add('aparece-on');

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('aparece-cerca');
          enciende(pieza);
          return;
        }
        apaga(pieza);
        el.classList.remove('aparece-cerca');
        /*
         * Se ha ido por arriba: entero, pase lo que pase.
         *
         * Esto no es redundante con el bucle. Un salto de ancla —los enlaces a
         * `#curso-1` de esta misma web— o un dedo que tira fuerte del móvil se
         * saltan el bloque sin que el bucle llegue a medirlo ni una vez, y el
         * bloque se quedaría recogido para siempre por encima de la pantalla.
         * Es el mismo fallo de siempre y aquí es donde se cierra.
         *
         * Por abajo no se toca nada: si no ha entrado todavía es que está
         * recogido, que es donde tiene que estar; y si ya había entrado, no se
         * deshace.
         */
        if (e.boundingClientRect.top < 0) escribe(pieza, 1);
      },
      { rootMargin: MARGEN },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      apaga(pieza);
      el.classList.remove('aparece-on', 'aparece-cerca');
      el.style.removeProperty('--p');
    };
  }, [retraso, modo]);

  const Tag = as as ElementType;
  const clases = ['aparece', `apa-${modo}`, className].filter(Boolean).join(' ');

  if (palabras) {
    return (
      <Tag
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        className={clases}
        style={{ ...style, ['--n' as string]: String(palabras.length) }}
      >
        {palabras.map((palabra, i) => (
          /*
           * EL ESPACIO VA FUERA DEL SPAN. No es un detalle de estilo: la
           * palabra es `inline-block` para poder moverse, y un `inline-block`
           * se come el espacio en blanco que tenga al final. Con el espacio
           * dentro, la frase sale escrita del tirón —«Noestucarácter.Noesmala
           * suerte.»— y es un fallo que ya se cometió una vez aquí.
           *
           * Y la clase NO es `.pal`, que es la de la portada, aunque el gesto
           * sea el mismo. Aquélla parte de opacidad 0,12 en la hoja global: si
           * este componente la heredara, cualquier fallo suyo dejaría la frase
           * casi invisible en vez de puesta, que es justo lo contrario de la
           * regla de arriba. Dos efectos parecidos, dos clases.
           */
          <Fragment key={i}>
            <span className="apa-pal" style={{ ['--i' as string]: String(i) }}>
              {palabra}
            </span>{' '}
          </Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} aria-label={ariaLabel} className={clases} style={style}>
      {children}
    </Tag>
  );
}
