/* El motor del portal. Era un IIFE dentro de la página suelta; aquí es una
 * función que se llama al montar y devuelve su propia limpieza, que es lo que
 * React necesita para no dejar escuchas colgando al cambiar de página. */
/* eslint-disable */
// @ts-nocheck
export function arrancaPortal(opciones: { anos: string }): () => void {
const AUTORIDAD_ANOS = opciones.anos;

'use strict';

/* ------------------------------------------------------------ la limpieza
 * Esto era una página suelta: se cargaba, corría para siempre y se acababa
 * cerrando la pestaña. Dentro de la web no: al salir de la portada hay que
 * apagarlo todo o se quedan dos bucles de animación y seis escuchas corriendo
 * encima de la página siguiente — y además el temporizador que borra el
 * contador salta cuando ya no hay contador y revienta con un null.
 */
let vivo = true;
const basura: Array<() => void> = [];
const enVentana = (que: string, fn: any, opc?: any) => {
  window.addEventListener(que, fn, opc);
  basura.push(() => window.removeEventListener(que, fn, opc));
};
const enDocumento = (que: string, fn: any, opc?: any) => {
  document.addEventListener(que, fn, opc);
  basura.push(() => document.removeEventListener(que, fn, opc));
};
const luego = (fn: () => void, ms: number) => {
  const id = setTimeout(() => { if (vivo) fn(); }, ms);
  basura.push(() => clearTimeout(id));
  return id;
};

/* ======================================================================
   EL RECORRIDO, EN DATOS
   ======================================================================
   Lo que pone en cada ficha es verdad y es de esta casa: la base 22 sale de
   la fecha y la base 9 del nombre completo; el árbol tiene diez puntos y
   veintidós caminos. Un dato inventado en una pantalla que vende se nota, y
   no hacía falta: lo que hay ya es bastante. */
/* El raíl de la izquierda es el índice del recorrido, así que tiene que
   nombrar lo que hay en cada parada. Se quedó diciendo «Numerología / Kábala»
   cuando los titulares ya no dicen eso: un índice que no coincide con la
   página es peor que no tener índice. Van cortos a propósito — ahí no cabe
   una frase. */
const ETAPAS = ['El patrón', 'De dónde viene', 'Iris Soares'];

/* ============================================================================
 * LA HISTORIA: CUATRO COSAS Y EL PIE
 * ============================================================================
 * Encargo de Gerson, literal: «solo es hablar sobre los patrones de la vida
 * (pregunta), después explicas esto (transgeneracional), después presentar a
 * Iris, quién es y por qué es autoridad, y después un CTA que es un botón a
 * los talleres y cursos. Después de eso está el footer y ya está.»
 *
 * Las tres primeras son estas tres paradas; el CTA es la sección de debajo.
 * Cada parada hace UN trabajo y sólo uno:
 *
 *   1. EL PATRÓN        que se reconozca. Si no se ve aquí, lo demás sobra.
 *   2. DE DÓNDE VIENE   la explicación, con nombres: la abuela, la madre, tú.
 *                       Es la idea entera del oficio y es lo que separa esto
 *                       de leer el horóscopo.
 *   3. IRIS SOARES      quién es y, sobre todo, POR QUÉ creerla. Autoridad no
 *                       es decir «llevo años»: es poder decir qué haces
 *                       distinto a todos los demás.
 */
const DATOS = {
  numerologia: {
    nombre: 'No empieza en ti', orden: 0,
    datos: [
      ['En el trabajo:', 'Cambias, y a los seis meses estás igual.'],
      ['En la pareja:', 'La misma discusión, con otra persona.'],
      ['Con el dinero:', 'Entra, y se va siempre por el mismo sitio.'],
      ['Y un día:', 'Te oyes decir una frase de tu madre.'],
    ],
  },
  kabala: {
    /* El titular de aquí se mide contra el de la parada anterior: «No
       empieza en ti» -> «Empieza en tu abuela». Las dos frases son una
       sola leída a lo largo del scroll, y es la idea entera del oficio
       dicha en siete palabras. Además cabe: a 9vw el hueco del titular da
       para dos renglones de unas diez letras, y «Lo que no se habla, se
       hereda» pedía tres — la tercera se salía por abajo de la pantalla. */
    nombre: 'Empieza en tu abuela', orden: 1,
    datos: [
      ['Tu abuela:', 'Tomó una decisión para sobrevivir a lo suyo: callarse, aguantar, irse.'],
      ['Tu madre:', 'Creció con esa decisión puesta en casa, sin que nadie se la explicara.'],
      ['Y tú:', 'No repites lo que les pasó. Repites la salida que encontraron ellas.'],
      ['Cómo se ve:', 'En tu fecha y en tu nombre. Dos datos que no elegiste tú.'],
    ],
  },
  iris: {
    nombre: 'Hola, soy Iris', orden: 2, retrato: true, foco: .3,
    datos: [
      ['Quién soy:', 'Iris Soares. Numerología transgeneracional y Kábala.'],
      ['Desde cuándo:', 'AUTORIDAD_ANOS'],
      ['Qué hago distinto:', 'No te leo la carta y ya. Te enseño la cuenta para que la rehagas sin mí.'],
      ['Y por eso:', 'Detrás hay una escuela, no sólo una consulta.'],
    ],
  },
};

/*
 * LOS CINCO TRAMOS, Y LOS DOS NÚMEROS QUE LLEVA CADA UNO.
 *
 * `ventana` dice cuánto está abierta la ventana al empezar y al acabar el
 * tramo: 0 es pequeña en el centro, 1 es la pantalla entera. `cinta` dice por
 * qué segundo va la película, de 0 a 1.
 *
 * Leídos en vertical se ve la pieza entera: la ventana se abre (0→1), te deja
 * dentro del árbol (1), y se cierra sobre ella (1→0). Y la cinta corre sin
 * parar de 0 a 1 mientras tanto, así que los números se vuelven el árbol sin
 * un solo corte. Eso es lo que no se puede hacer con tres vídeos pegados.
 */
const TRAMOS = [
  /* EL CORTE ESTÁ MEDIDO, NO PUESTO A OJO. Contando píxeles de luz en el
     plano, el árbol no está formado hasta el 0,84 de la cinta: con la Kábala
     empezando antes, el titular decía KÁBALA y en pantalla seguía habiendo
     números sueltos. Así que la etapa del árbol empieza donde hay árbol, y
     todo el armado —los hilos creciendo, los puntos encendiéndose— cae
     dentro del paso. El paso ES la transcendencia, no un corte entre dos
     cosas. */
  { etapa: 'numerologia', desde: 0,   hasta: .24, ventana: [0, 0], cinta: [0, .30] },
  { etapa: 'numerologia', desde: .24, hasta: .42, ventana: [0, 1], cinta: [.30, .84] },
  { etapa: 'kabala',      desde: .42, hasta: .68, ventana: [1, 1], cinta: [.84, 1] },
  { etapa: 'iris',        desde: .68, hasta: .82, ventana: [1, 0], cinta: [1, 1] },
  { etapa: 'iris',        desde: .82, hasta: 1,   ventana: [0, 0], cinta: [1, 1] },
];

/* ---------------------------------------------------------------- piezas */
const $ = (id) => document.getElementById(id);
const recorrido = $('recorrido');
const lienzo = $('lienzo-ventana');
const ctx = lienzo.getContext('2d');
const ventana = $('ventana');
const ventanaVideo = $('ventana-video');
const ventanaImagen = $('ventana-imagen');
const cursor = document.querySelector('.cursor');
const aro = document.querySelector('.cursor-aro');
const punto = document.querySelector('.cursor-punto');

/* --------------------------------------------------- qué plano se baja */
(function planos() {
  const mp4 = ventanaVideo.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
  const ext = mp4 ? 'mp4' : 'webm';
  const forma = window.matchMedia('(max-width: 759px)');
  const antesalaVideo = $('antesala-video');

  const pon = (v, nombre, vertical) => {
    const nueva = `/video/${nombre}${vertical ? '-vertical' : ''}.${ext}`;
    if (v.src.endsWith(nueva)) return;
    /* Al girar el móvil se cambia de plano, y hay que devolverlo al mismo
       punto: si no, al girar el recorrido se va al principio. Los dos duran
       lo mismo, así que basta con el segundo. */
    const donde = v.currentTime;
    v.src = nueva;
    if (donde > 0) v.addEventListener('loadedmetadata', () => { v.currentTime = donde; }, { once: true });
  };
  const reparte = () => {
    pon(ventanaVideo, 'recorrido', forma.matches);
    pon(antesalaVideo, 'antesala', forma.matches);
  };
  reparte();
  forma.addEventListener('change', reparte);
  basura.push(() => forma.removeEventListener('change', reparte));
})();

/* EL PRECIO, DESDE `content/site.ts` Y NO A MANO.
   El guion del portal es texto plano porque viene de una página suelta, así
   que el número se mete aquí al arrancar. Si algún día no hay oferta, la fila
   dice sólo el precio normal y el motivo desaparece solo — que es lo que
   impide que la portada anuncie una rebaja que ya no existe. */
/* LOS AÑOS, CONTADOS SOLOS. Escritos a mano, en enero la web dice una cifra
   que ya no es verdad — y la autoridad se cae justo por donde se sostiene. */
{
  const f = DATOS.iris.datos.find((d) => d[1] === 'AUTORIDAD_ANOS');
  if (f) f[1] = AUTORIDAD_ANOS;
}

let actual = 'numerologia';
let expansion = 0;
let girX = 0, girY = 0, metaX = 0, metaY = 0;
let ultimo = performance.now();

const suave = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const entre = (a, b, t) => a + (b - a) * t;

/* Quitar y volver a poner una clase para que su animación vuelva a correr. El
   `offsetWidth` de en medio no sobra: sin esa lectura el navegador junta los
   dos cambios en uno y la animación no se entera de que ha pasado nada. */
function reaviva(el, clase) {
  if (!el) return;
  el.classList.remove(clase);
  void el.offsetWidth;
  el.classList.add(clase);
}

/* ------------------------------------------------------------- pintar */
function midelienzo() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  lienzo.width = w * d; lienzo.height = h * d;
  lienzo.style.width = w + 'px'; lienzo.style.height = h + 'px';
  ctx.setTransform(d, 0, 0, d, 0, 0);
}

/* El metraje se pinta a pantalla completa y quieto, no dentro de la ventana.
   Esa es toda la gracia: la imagen se queda donde está y lo que se mueve es
   el agujero por donde se ve.

   DOS JUEGOS DE PLANOS, NO UNO. El metraje es apaisado y un teléfono es
   vertical: recortarlo para que llene la pantalla se comía dos tercios del
   ancho, y lo que hay a los lados no es relleno —es el árbol—. En el móvil
   salían tres puntos de luz sueltos.

   Así que hay una versión 9:16 de verdad de los dos planos. Están hechos del
   mismo fotograma: el plano cabe de ancho, y el papel de arriba y de abajo es
   ese mismo fotograma ampliado, desenfocado y DESVANECIDO contra él (78 px de
   pluma). Como sale del propio fotograma, la luz y la sombra que cruzan el
   plano cruzan también el relleno, y no hay canto que disimular — que es
   exactamente lo que le pasaba al vertical viejo de la portada, donde el
   papel iba estirado desde las filas del borde y dejaba una raya recta.

   Cuál se baja se decide aquí y no con el atributo `media` de `<source>`, que
   unos navegadores respetan y otros no. Cada persona se descarga uno solo. */
const ESTRECHO = () => window.innerWidth < 760;

function cubre(c, media) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return false;
  const w = window.innerWidth, h = window.innerHeight;
  const grande = Math.max(w / mw, h / mh);
  c.drawImage(media, (w - mw * grande) / 2, (h - mh * grande) / 2, mw * grande, mh * grande);
  return true;
}

/* EL OTRO ENCUADRE: A LA VENTANA, NO A LA PANTALLA.
   Para un retrato el de arriba es un desastre: la ventana ocupa un tercio del
   ancho, así que de una foto vertical enseñaba un ojo. Comprobado mirándolo.
   `foco` dice qué altura de la foto —de 0 arriba a 1 abajo— tiene que quedar
   en el medio del hueco, y se limita a lo que cabe para no destapar un borde:
   antes se pierde encuadre que se enseña un hueco. */
function cubreVentana(c, media, cx, cy, cw, ch, foco) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return false;
  const e = Math.max(cw / mw, ch / mh);
  const dw = mw * e, dh = mh * e;
  let y = cy - dh / 2;
  if (foco != null && dh > ch) y = Math.min(cy - ch / 2, Math.max(cy + ch / 2 - dh, cy - dh * foco));
  c.drawImage(media, cx - dw / 2, y, dw, dh);
  return true;
}

/* Los puntos de un rectángulo redondeado, centrados en el origen: cada
   esquina se recorre en diez pasos, así que salen unos 44 puntos. Hacen falta
   sueltos para poder proyectarlos uno a uno. */
function puntosCaja(w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const p = [];
  const esquinas = [
    [w / 2 - r, -h / 2 + r, -Math.PI / 2, 0],
    [w / 2 - r, h / 2 - r, 0, Math.PI / 2],
    [-w / 2 + r, h / 2 - r, Math.PI / 2, Math.PI],
    [-w / 2 + r, -h / 2 + r, Math.PI, Math.PI * 1.5],
  ];
  for (const [cx, cy, a0, a1] of esquinas) {
    for (let i = 0; i <= 10; i++) {
      const a = a0 + (a1 - a0) * (i / 10);
      p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return p;
}

/* Perspectiva de mentira con distancia focal 850. No es 3D y no hace falta
   que lo sea: lo que se busca es que el borde de arriba se aleje un poco
   cuando el ratón sube, y eso esto lo hace con cuatro líneas. */
function proyecta(x, y, rx, ry, cx, cy) {
  const ax = rx * Math.PI / 180, ay = ry * Math.PI / 180;
  const xx = x * Math.cos(ay), yy = y * Math.cos(ax);
  const z = x * Math.sin(ay) - y * Math.sin(ax);
  const p = 850 / (850 + z);
  return [cx + xx * p, cy + yy * p];
}

function pinta(ahora) {
  if (!vivo) return;
  const dt = Math.min(40, ahora - ultimo);
  ultimo = ahora;
  const k = Math.min(1, dt * .009);
  girX += (metaX - girX) * k;
  girY += (metaY - girY) * k;

  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  const caja = ventana.getBoundingClientRect();
  if (caja.width < 1) return requestAnimationFrame(pinta);

  const e = expansion;
  const cx = entre(caja.left + caja.width / 2, w / 2, e);
  const cy = entre(caja.top + caja.height / 2, h / 2, e);
  const cw = entre(caja.width, w, e);
  const ch = entre(caja.height, h, e);
  /* El radio y la inclinación se relajan a la vez que se abre: a pantalla
     completa no puede quedar ni una esquina redonda ni un grado de giro. */
  const r = 110 * (1 - e);
  const rx = girX * (1 - e), ry = girY * (1 - e);
  const d = DATOS[actual];

  const pts = puntosCaja(cw, ch, r).map(([x, y]) => proyecta(x, y, rx, ry, cx, cy));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.clip();
  /* Un fondo detrás del metraje: mientras el vídeo no tiene fotogramas, el
     hueco se ve como papel y no como un agujero negro. */
  ctx.fillStyle = '#e3dbcb';
  ctx.fillRect(0, 0, w, h);
  if (d.retrato) cubreVentana(ctx, ventanaImagen, cx, cy, cw, ch, d.foco);
  else cubre(ctx, ventanaVideo);
  ctx.restore();

  /* Un filo finísimo de tinta alrededor. Sin él, sobre marfil la ventana no
     tiene borde y se deshace en el fondo. */
  if (e < .985) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.globalAlpha = (1 - e) * .5;
    ctx.strokeStyle = 'rgba(34,29,31,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  requestAnimationFrame(pinta);
}

/* ------------------------------------------------------------- dibujar */
let primera = true;
function dibuja() {
  const d = DATOS[actual];
  recorrido.dataset.etapa = actual;
  $('titulo').textContent = d.nombre.toUpperCase();

  const dl = $('datos');
  dl.innerHTML = '';
  for (const [clave, valor] of d.datos) {
    const fila = document.createElement('div');
    fila.className = 'dato';
    const dt = document.createElement('dt'); dt.textContent = clave;
    const dd = document.createElement('dd'); dd.textContent = valor;
    fila.append(dt, dd);
    dl.append(fila);
  }

  const lista = $('etapas');
  lista.innerHTML = '';
  ETAPAS.forEach((nombre, i) => {
    const s = document.createElement('span');
    s.className = 'etapa' + (i === d.orden ? ' puesta' : '');
    s.textContent = nombre;
    lista.append(s);
  });
  if (!primera) reaviva(lista, 'cambiando');
  primera = false;
}

function abreContenido() { reaviva(recorrido, 'revelando-contenido'); }

/* ======================================================================
   LA RUEDA MANDA
   ======================================================================
   No se pulsa nada: se baja. La pista mide cuatro pantallas y media y esa
   altura es el carrete. Cuánto se ha bajado —un número de 0 a 1— es lo único
   que decide qué se ve, así que parar a mitad deja la ventana parada a mitad
   y subir lo deshace. Eso es lo que separa esto de una animación que arranca
   sola al asomar: aquí la mano de quien mira pasa la película. */
let tramoPuesto = -1;

/** Pone el vídeo en el segundo que toca, sin reproducirlo. Es lo que hace que
 *  el metraje avance con la rueda en vez de ir por su cuenta. */
function rebobina(video, parte) {
  if (!video || !video.duration || !isFinite(video.duration)) return;
  const t = Math.max(0, Math.min(.995, parte)) * video.duration;
  if (Math.abs(video.currentTime - t) > .02) {
    try { video.currentTime = t; } catch (e) { /* todavía no se puede buscar */ }
  }
}

function alBajar() {
  const alto = $('pista').offsetHeight - window.innerHeight;
  const p = alto > 0 ? Math.max(0, Math.min(1, window.scrollY / alto)) : 0;

  let i = TRAMOS.length - 1;
  while (i > 0 && p < TRAMOS[i].desde) i--;
  const t = TRAMOS[i];
  const local = Math.max(0, Math.min(1, (p - t.desde) / (t.hasta - t.desde)));

  if (i !== tramoPuesto) {
    tramoPuesto = i;
    if (actual !== t.etapa) { actual = t.etapa; dibuja(); abreContenido(); }
    $('baja').style.opacity = i === 0 ? '' : '0';
  }

  const s = suave(local);
  expansion = entre(t.ventana[0], t.ventana[1], s);
  rebobina(ventanaVideo, entre(t.cinta[0], t.cinta[1], local));
}

/* --------------------------------------------------------- la antesala */
function antesala() {
  const v = $('antesala-video');
  const valor = $('cuenta-valor');
  let acabada = false;

  const termina = () => {
    if (acabada) return;
    acabada = true;
    valor.textContent = '100';
    $('cuenta').classList.add('se-va');
    $('sello').classList.add('encajado');
    $('antesala').classList.add('al-fondo');
    document.body.classList.add('antesala-lista');
    document.body.classList.add('abierto');
    tramoPuesto = -1;
    alBajar();
    luego(abreContenido, 850);
    /* Con `?.`: si alguien se va de la portada antes de los 750 ms, el
       contador ya no está y esto reventaba con un null. */
    luego(() => $('cuenta')?.remove(), 750);
    luego(() => $('sello')?.classList.add('asentado'), 2000);
  };

  const cuenta = () => {
    if (acabada) return;
    if (v.duration) valor.textContent = String(Math.round(v.currentTime / v.duration * 100));
    if (vivo) requestAnimationFrame(cuenta);
  };

  const empieza = () => {
    /* El metraje dura lo que dure; la antesala dura tres segundos. Se acelera
       para que cuadren, con un suelo por si el vídeo fuera cortísimo. */
    if (v.duration) v.playbackRate = Math.max(.25, v.duration / 3);
    v.play().then(() => requestAnimationFrame(cuenta)).catch(termina);
  };

  v.addEventListener('ended', termina, { once: true });
  if (v.readyState >= 1) empieza();
  else v.addEventListener('loadedmetadata', empieza, { once: true });
  /* Red lenta, archivo que no llega, autoplay bloqueado: pasados cinco
     segundos se entra igual. Una antesala que no termina es una web rota. */
  luego(termina, 5000);
}

/* ----------------------------------------------------------- el cursor */
let px = window.innerWidth / 2, py = window.innerHeight / 2;
let ax = px, ay = py;
function giraCursor() {
  if (!vivo) return;
  ax += (px - ax) * .2;
  ay += (py - ay) * .2;
  aro.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0) translate(-50%,-50%)';
  punto.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%)';
  requestAnimationFrame(giraCursor);
}

/* ------------------------------------------------------------ escuchas */
enVentana('resize', () => { midelienzo(); alBajar(); });
enVentana('scroll', alBajar, { passive: true });
enVentana('pointermove', (ev) => {
  px = ev.clientX; py = ev.clientY;
  cursor.classList.add('se-ve');
  metaY = (ev.clientX / window.innerWidth - .5) * 34;
  metaX = (ev.clientY / window.innerHeight - .5) * -30;
});
enVentana('pointerleave', () => { metaX = 0; metaY = 0; });
enDocumento('mouseleave', () => cursor.classList.remove('se-ve'));

/* ------------------------------------------------------------ arranque */
midelienzo();
dibuja();
alBajar();
requestAnimationFrame(pinta);
requestAnimationFrame(giraCursor);
antesala();

return () => {
  vivo = false;
  for (const tirar of basura) { try { tirar(); } catch {} }
};

}
