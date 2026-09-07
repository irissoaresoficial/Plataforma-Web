/**
 * El vocabulario visual de la plataforma. Antes cada componente se escribía su
 * propia tarjeta a mano — quince variantes de lo mismo, veinticuatro cuerpos de
 * letra distintos y un color de fondo por cada tipo de bloque — y el conjunto
 * se veía cargado y desordenado aunque cada pieza por separado estuviera bien.
 *
 * Aquí está decidido una sola vez. Las reglas:
 *
 *   · una sola tarjeta: fondo opaco, canto blando, línea de un pelo y la sombra
 *     difusa de la casa. Lo que flota de verdad — cabecera, hojas que se abren —
 *     lleva la sombra grande;
 *   · el color no rellena, marca. Un bloque de bloqueo no es una tarjeta
 *     morada: es una tarjeta normal con una raya morada al canto y su rótulo
 *     del mismo color. Se sigue sabiendo qué es cada cosa y deja de gritar;
 *   · dentro de una tarjeta no va otra tarjeta. Lo que separa es una línea, o
 *     una PASTILLA — que es lo de dentro y por eso se hunde en vez de subir.
 */

/**
 * La tarjeta, y no hay otra.
 *
 * AHORA LLEVA SOMBRA, y antes ponía aquí «sin sombra ni desenfoque». El motivo
 * de entonces era que las tarjetas no compitieran entre sí, y se resolvía
 * dejando que la separase el borde. Pero entonces cada pantalla que quería una
 * tarjeta con algo de peso se escribía su `box-shadow:var(--nm-alto)` a mano, y
 * el resultado era el que se quería evitar: en la misma pantalla convivían
 * tarjetas planas y tarjetas levantadas sin ninguna regla que dijera cuál era
 * cuál. Puesta aquí, todas suben lo mismo y ninguna decide por su cuenta.
 */
export const TARJETA =
  "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);box-shadow:var(--nm-alto);";

/**
 * La misma tarjeta cuando está ELEGIDA: el granate de la casa, que es el color
 * de lo que se pulsa y de lo que está seleccionado.
 *
 * Existe como constante entera —y no como un `border-color` añadido detrás de
 * `TARJETA`— porque React avisa por consola cuando una propiedad abreviada
 * (`border`) y una de sus partes (`border-color`) cambian a la vez entre dos
 * pintadas, y además en algún repintado se queda la que no toca: una tarjeta
 * deseleccionada conservando el canto granate. Escrito de una vez, no hay dos
 * propiedades peleándose por lo mismo.
 */
export const TARJETA_ELEGIDA =
  "background:var(--accion-suave);border:1px solid var(--accion-borde);border-radius:var(--r-tarjeta);box-shadow:var(--nm-alto);";

/**
 * Tarjeta con el canto de color: el acento va en la raya, no en el fondo.
 *
 * LA RAYA YA NO ES UN BORDE, Y NO PODÍA SEGUIR SIÉNDOLO.
 *
 * Era `border-left`, y con el canto recto de antes se veía como lo que quería
 * ser: una pletina de color pegada al lado izquierdo. Con el canto blando, un
 * borde de un solo lado recorre las dos esquinas redondeadas y sale una coma
 * gorda envolviendo la tarjeta — no se lee como una raya, se lee como un
 * defecto de dibujo. Es el fallo clásico de subir el radio sin mirar qué había
 * apoyado en el borde.
 *
 * Ahora es una barra pintada en el fondo, centrada y más corta que la tarjeta,
 * así que sus dos extremos quedan lejos de las curvas y no las tocan. Además ha
 * ganado algo: una raya que empieza y acaba dentro de la tarjeta se lee como
 * una marca puesta ahí a propósito, y una que va de canto a canto se lee como
 * parte de la caja.
 *
 * En porcentaje y no en píxeles para que valga igual en la tarjeta de un aviso
 * de tres renglones y en la de una sección entera del panel.
 */
export const tarjetaCon = (color: string) =>
  TARJETA +
  "background-image:linear-gradient(" +
  color +
  "," +
  color +
  ");background-repeat:no-repeat;background-position:0 50%;background-size:3px 62%;";

/**
 * LA PASTILLA: una fila de una lista, dentro de una tarjeta.
 *
 * Es la pieza que faltaba y por la que se estaba rompiendo la regla de «dentro
 * de una tarjeta no va otra tarjeta». El tablero de clientes metía tarjetas
 * blancas levantadas dentro de columnas blancas levantadas: en claro se veían
 * dos cantos y dos sombras discutiendo, y en oscuro sencillamente no se
 * distinguían — la columna y la ficha son el mismo color.
 *
 * Una pastilla es lo contrario de una tarjeta: no sube, se apoya. Fondo arena
 * —el mismo del hueco de un campo—, canto de lo de dentro y ninguna sombra. Se
 * lee como algo que está DENTRO de la tarjeta, que es lo que es.
 */
export const PASTILLA =
  "background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r);";

/** La pastilla elegida. El granate de siempre: lo que está seleccionado. */
export const PASTILLA_ELEGIDA =
  "background:var(--accion-suave);border:1px solid var(--accion-borde);border-radius:var(--r);";

/** Relleno estándar y el más apretado, para tarjetas secundarias. */
export const PAD = "padding:var(--pad-card);";
export const PAD_SM = "padding:var(--pad-card-sm);";

/* --------------------------------------------------------------- tipografía */

/** Rótulo pequeño de arriba de un bloque: «Número de corazón», «Bloqueo 4». */
export const rotulo = (color = "var(--text-3)") =>
  "font-size:var(--t-mini);font-weight:590;letter-spacing:-.005em;color:" + color + ";";

/** Título de tarjeta, en la serif. */
export const TITULO = "font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.012em;line-height:1.2;color:var(--text);";

/** Encabezado de sección. */
export const CABECERA = "font-family:var(--font-display);font-size:var(--t-head);font-weight:500;letter-spacing:-.014em;line-height:1.15;color:var(--text);";

/** El texto que se lee de verdad: los párrafos de los apuntes. */
export const LECTURA = "font-size:var(--t-read);line-height:1.62;color:var(--text-2);text-wrap:pretty;";

/** Texto de apoyo — pies, aclaraciones, la línea bajo un título. */
export const APOYO = "font-size:var(--t-body);line-height:1.5;color:var(--text-3);";

/** Apostilla: unidades, rangos de edad, «viene del número 14». */
export const NOTA = "font-size:var(--t-mini);color:var(--text-4);";

/* ------------------------------------------------------------------ adornos */

/** Línea de separación dentro de una tarjeta. */
export const RAYA = "border-top:1px solid var(--border);";

/**
 * Cabecera de tarjeta: rótulo a la izquierda, acción a la derecha, y una línea
 * por debajo sólo si lo que sigue lo pide. Se usa igual en las siete secciones
 * para que todas empiecen de la misma manera.
 */
export const FILA_TITULO = "display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;";

/** Botón de texto de la esquina: «Abrir», «Ver todos». */
export const ENLACE =
  "margin-left:auto;background:none;border:none;padding:0;cursor:pointer;font-size:var(--t-mini);font-weight:590;color:var(--gold);";

/** Punto de color que marca a qué pertenece una fila. */
export const punto = (color: string) => "width:7px;height:7px;border-radius:50%;flex:none;background:" + color + ";";


/* ------------------------------------------------------------------ botones */

/**
 * Los botones se escribían uno a uno y salían de todo: unos con borde dorado y
 * fondo translúcido, otros con degradado y sombra de color, otros sin más que
 * el texto. Aquí hay tres, y no hacen falta más.
 *
 *   · `botonPrincipal` — la acción de la pantalla, una por pantalla;
 *   · `botonNormal` — todo lo demás que se pulsa y no es un chip;
 *   · `botonPlano` — el que va dentro de una tarjeta y no debe competir.
 *
 * Todos con la misma altura, el mismo radio y la misma letra, para que se
 * reconozcan como botones sin tener que leerlos.
 */
const BOTON =
  "display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:980px;" +
  "font-family:var(--font-ui);font-size:var(--t-body);font-weight:590;letter-spacing:-.01em;" +
  "white-space:nowrap;cursor:pointer;transition:background .18s,border-color .18s,color .18s;";

/*
 * EL BOTÓN PRINCIPAL VA EN GRANATE, NO EN ORO.
 *
 * Sobre blanco el oro estaba haciendo dos oficios: adornar —el filete, la
 * cifra grande, el rótulo de sección— y mandar. Y cuando el mismo color adorna
 * y manda, deja de mandar: la pantalla se llena de dorado y el ojo ya no sabe
 * cuál de las seis manchas de oro es la que hay que pulsar.
 *
 * El granate es el vino de la casa, el mismo de la web y el de la puerta. En
 * una pantalla blanca sólo hay una mancha de granate por pantalla, y es
 * exactamente lo que la persona tiene que ver.
 *
 * En oscuro `--accion` vuelve a ser el oro claro por sí solo, porque un botón
 * vino sobre pared vino no existe. Aquí no hay que saberlo: se pide la acción
 * y llega la de la cara en la que se esté.
 */
export const botonPrincipal = (activo = true) =>
  BOTON +
  "padding:12px 24px;border:1px solid " +
  (activo ? "var(--accion)" : "transparent") +
  ";background:" +
  (activo ? "var(--accion)" : "color-mix(in srgb, var(--text) 9%, transparent)") +
  ";color:" +
  (activo ? "var(--sobre-accion)" : "var(--text-4)") +
  ";" +
  /* Levantado del papel, como las tarjetas. El aviso de que se ha pulsado lo
     sigue dando el `:active` de globals.css —encoge un pelo—, que funciona
     igual en los tres botones y no depende de que éste lleve relieve. */
  (activo ? "box-shadow:var(--nm-alto);" : "cursor:not-allowed;");

export const BOTON_NORMAL =
  BOTON + "padding:9px 18px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);";

export const BOTON_PLANO =
  BOTON + "padding:8px 15px;border:none;background:color-mix(in srgb, var(--text) 5%, transparent);color:var(--text-2);";
